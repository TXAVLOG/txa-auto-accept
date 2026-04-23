/**
 * TXA Auto Accept — Advanced Hybrid Inject Script v17.0 (ENHANCED ENGINE)
 *
 * Improvements in v17.0:
 * - Advanced Element Recognition Algorithm with retry mechanism and validation
 * - Event-driven architecture with stable message passing
 * - State synchronization between background and content scripts
 * - Memory optimization to prevent browser termination
 * - Edge case handling for complex UI scenarios
 */
(function() {
    'use strict';
    if (typeof window === 'undefined') return;

    const VERSION = '17.0';
    const log = (msg) => console.log(`%c[TXA-CDP-v${VERSION}]%c ${msg}`, 'color:#a855f7;font-weight:bold', 'color:inherit');

    const STATE_KEY = '__txaState_v17';
    const EVENT_QUEUE_KEY = '__txaEventQueue';
    const MEMORY_THRESHOLD = 50;
    const RETRY_MAX_ATTEMPTS = 3;
    const RETRY_DELAY_MS = 150;
    const VALIDATION_DELAY_MS = 100;
    const CLICK_DEBOUNCE_MS = 300;

    const ACCEPT_TEXTS = ['accept', 'run', 'retry', 'apply', 'execute', 'confirm', 'allow', 'yes', 'approve', 'bắt đầu', 'alt+', 'enter', 'start', 'continue', 'proceed'];
    const DENY_TEXTS = ['skip', 'reject', 'cancel', 'close', 'refine', 'từ chối', 'đóng', 'stop', 'abort', 'exit'];
    const DANGEROUS_TEXTS = ['delete', 'drop', 'remove', 'uninstall', 'purge', 'kill', 'destroy', 'reset', 'format', 'truncate'];

    if (!window[STATE_KEY]) {
        window[STATE_KEY] = {
            isRunning: false,
            config: {},
            sessionID: 0,
            userInteracting: false,
            interactTimer: null,
            tabIndex: 0,
            tabNames: [],
            lastAction: 'Waiting for targets...',
            scanCount: 0,
            clicks: 0,
            events: [],
            recentlyClicked: new Map(),
            validationCache: new Map(),
            memoryStats: { peakEvents: 0, gcCount: 0 }
        };
    }

    const state = window[STATE_KEY];

    const getDocs = (root = document) => {
        let docs = [root];
        try {
            const iframes = root.querySelectorAll('iframe, frame');
            for (const f of iframes) {
                try {
                    const d = f.contentDocument || f.contentWindow?.document;
                    if (d) docs.push(...getDocs(d));
                } catch (e) {}
            }
        } catch (e) {}
        return docs;
    };

    const queryAll = (selector) => {
        const results = [];
        getDocs().forEach(doc => {
            try { results.push(...Array.from(doc.querySelectorAll(selector))); } catch (e) {}
        });
        return results;
    };

    const getElementFingerprint = (el) => {
        if (!el) return null;
        try {
            const rect = el.getBoundingClientRect();
            const text = (el.textContent || '').trim().substring(0, 50);
            const tag = el.tagName.toLowerCase();
            const classes = Array.from(el.classList || []).slice(0, 5).join('.');
            return `${tag}:${classes}:${rect.width}x${rect.height}:${text.substring(0, 20)}`;
        } catch (e) {
            return null;
        }
    };

    const isRecentlyClicked = (el) => {
        const fingerprint = getElementFingerprint(el);
        if (!fingerprint) return false;
        const lastClick = state.recentlyClicked.get(fingerprint);
        if (!lastClick) return false;
        return (Date.now() - lastClick) < CLICK_DEBOUNCE_MS;
    };

    const markAsClicked = (el) => {
        const fingerprint = getElementFingerprint(el);
        if (fingerprint) {
            state.recentlyClicked.set(fingerprint, Date.now());
            if (state.recentlyClicked.size > MEMORY_THRESHOLD * 2) {
                const oldest = Array.from(state.recentlyClicked.entries())
                    .sort((a, b) => a[1] - b[1])
                    .slice(0, Math.floor(state.recentlyClicked.size / 2));
                oldest.forEach(([k]) => state.recentlyClicked.delete(k));
            }
        }
    };

    const validateElement = (el) => {
        if (!el || !el.isConnected) return { valid: false, reason: 'disconnected' };
        if (el.disabled || el.getAttribute('aria-disabled') === 'true') return { valid: false, reason: 'disabled' };
        if (el.getAttribute('aria-hidden') === 'true') return { valid: false, reason: 'aria-hidden' };

        const rect = el.getBoundingClientRect();
        if (rect.width <= 0 || rect.height <= 0) return { valid: false, reason: 'zero-size' };
        if (rect.width > 0 && rect.height > 0) {
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;
            if (centerX < 0 || centerY < 0 || centerX > window.innerWidth || centerY > window.innerHeight) {
                return { valid: false, reason: 'out-of-viewport' };
            }
            const elAtPoint = document.elementFromPoint(centerX, centerY);
            if (elAtPoint && !el.contains(elAtPoint) && el !== elAtPoint) {
                return { valid: false, reason: 'obscured' };
            }
        }

        const computed = el.ownerDocument.defaultView.getComputedStyle(el);
        if (computed.visibility === 'hidden' || computed.display === 'none') {
            return { valid: false, reason: 'hidden' };
        }

        return { valid: true, reason: 'ok' };
    };

    const analyzeElementContext = (el) => {
        const context = {
            isInModal: !!el.closest('[role="dialog"], .modal, .dialog, [aria-modal="true"]'),
            isInSidebar: !!el.closest('.part.sidebar, .part.activitybar, .sidebar, .activitybar'),
            isInEditor: !!el.closest('.editor-container, .monaco-editor, .editor'),
            isInTerminal: !!el.closest('.terminal, .repl, .output'),
            isInAIChat: !!el.closest('.chat-session, .ai-chat-panel, .antigravity-agent-side-panel, [class*="border-gray-500/25"]'),
            isInToolbar: !!el.closest('.toolbar, .titlebar, .menubar'),
            depth: 0
        };

        let parent = el.parentElement;
        while (parent && context.depth < 10) {
            context.depth++;
            parent = parent.parentElement;
        }

        return context;
    };

    const scoreElement = (el, text, isAccept, context) => {
        let score = 100;

        const priorityPatterns = [
            { pattern: /^(accept|run|start|continue|proceed)$/i, bonus: 50 },
            { pattern: /^(retry|execute|confirm)$/i, bonus: 40 },
            { pattern: /^alt\+|ctrl\+|shift\+/i, bonus: 30 },
            { pattern: /(allow|approve|yes|ok)$/i, bonus: 25 },
            { pattern: /^(reject|cancel|skip|close)$/i, bonus: -100 },
            { pattern: /(delete|drop|remove|destroy)/i, bonus: -200 }
        ];

        for (const { pattern, bonus } of priorityPatterns) {
            if (pattern.test(text.trim())) score += bonus;
        }

        if (el.classList.contains('bg-primary') || el.className.includes('bg-primary')) score += 30;
        if (el.classList.contains('monaco-button') && el.classList.contains('monaco-text-button')) score += 25;
        if (context.isInAIChat && isAccept) score += 20;
        if (context.isInModal && isAccept) score += 15;

        if (context.isInSidebar && !context.isInAIChat) score -= 80;
        if (context.isInToolbar) score -= 60;
        if (context.isInTerminal) score -= 50;
        if (context.isInEditor && !context.isInAIChat) score -= 40;

        if (context.depth > 8) score -= 20;
        if (context.depth < 2 && !context.isInModal) score += 10;

        const rect = el.getBoundingClientRect();
        const area = rect.width * rect.height;
        if (area > 5000) score += 15;
        if (area < 200) score -= 10;

        return Math.max(0, score);
    };

    const performClickWithRetry = async (el, maxRetries = RETRY_MAX_ATTEMPTS) => {
        const fingerprint = getElementFingerprint(el);
        if (!fingerprint) return { success: false, reason: 'no-fingerprint' };

        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                const validation = validateElement(el);
                if (!validation.valid) {
                    if (attempt === maxRetries) return { success: false, reason: validation.reason };
                    await new Promise(r => setTimeout(r, RETRY_DELAY_MS));
                    continue;
                }

                const opts = { bubbles: true, cancelable: true, view: window };

                if (typeof el.scrollIntoView === 'function') {
                    el.scrollIntoView({ behavior: 'instant', block: 'center' });
                }

                el.dispatchEvent(new MouseEvent('mousedown', { ...opts, clientX: 0, clientY: 0 }));
                await new Promise(r => setTimeout(r, 20));
                el.dispatchEvent(new MouseEvent('mouseup', { ...opts, clientX: 0, clientY: 0 }));

                if (typeof el.focus === 'function') el.focus();

                const clickEvent = new MouseEvent('click', opts);
                Object.defineProperty(clickEvent, 'explicitOriginalElement', { value: el, writable: false });
                el.dispatchEvent(clickEvent);

                if (typeof el.click === 'function') el.click();

                await new Promise(r => setTimeout(r, VALIDATION_DELAY_MS));

                const postValidation = validateElement(el);
                if (el.isConnected && !postValidation.valid && postValidation.reason !== 'obscured') {
                    markAsClicked(el);
                    return { success: true, verified: true, attempt };
                }

                markAsClicked(el);
                return { success: true, verified: false, attempt };

            } catch (err) {
                if (attempt === maxRetries) {
                    return { success: false, reason: err.message };
                }
                await new Promise(r => setTimeout(r, RETRY_DELAY_MS * attempt));
            }
        }

        return { success: false, reason: 'max-retries-exceeded' };
    };

    const performClick = async () => {
        const s = state;
        if (!s.isRunning || s.userInteracting) return;

        s.scanCount++;

        const config = s.config;

        let targets = [];

        const primarySelectors = [
            'button.bg-primary',
            'button[class*="bg-primary"]',
            '.anysphere-confirm-button',
            'a.monaco-button.monaco-text-button',
            'button[class*="confirm"]',
            'button[class*="primary"]',
            '.chat-session button[class*="action"]'
        ];

        for (const sel of primarySelectors) {
            const found = queryAll(sel);
            if (found.length > 0) {
                targets = found;
                break;
            }
        }

        if (targets.length === 0) {
            targets = queryAll('button, [role="button"], .cursor-button, a[class*="button"]');
        }

        if (config.customSelector) {
            try {
                const customFound = queryAll(config.customSelector);
                targets.push(...customFound);
            } catch (e) {}
        }

        const scoredTargets = [];

        for (const b of targets) {
            if (isRecentlyClicked(b)) continue;

            if (b.closest('.monaco-workbench .part.sidebar, .monaco-workbench .part.activitybar, .monaco-workbench .part.editor .title')) {
                continue;
            }

            const text = (b.textContent || '').trim().toLowerCase();
            const aria = (b.getAttribute('aria-label') || '').trim().toLowerCase();
            const title = (b.getAttribute('title') || '').trim().toLowerCase();
            const fullTxt = `${text} ${aria} ${title}`;

            if (fullTxt.length < 2 || fullTxt.length > 100) continue;

            const isAccept = ACCEPT_TEXTS.some(p => fullTxt.includes(p));
            const isDeny = DENY_TEXTS.some(p => fullTxt.includes(p));
            const isDangerous = DANGEROUS_TEXTS.some(p => fullTxt.includes(p));

            if (isAccept && !isDeny && !isDangerous) {
                const rect = b.getBoundingClientRect();
                if (rect.width > 0 && rect.height > 0) {
                    const context = analyzeElementContext(b);
                    const score = scoreElement(b, fullTxt, true, context);
                    const priorityBoost = b.classList.contains('bg-primary') ? 1000 : 0;
                    scoredTargets.push({ element: b, score: score + priorityBoost, text: text || aria || 'Button', fullTxt });
                }
            }
        }

        scoredTargets.sort((a, b) => b.score - a.score);

        const selected = scoredTargets[0];
        if (!selected) return;

        const result = await performClickWithRetry(selected.element);

        if (result.success) {
            s.clicks++;
            s.events.push({
                btn: selected.text.substring(0, 30),
                cmd: selected.fullTxt.substring(0, 100),
                verified: result.verified,
                attempt: result.attempt,
                timestamp: Date.now()
            });

            s.lastAction = `Accepted: "${selected.text.substring(0, 20)}"[${result.verified ? '✓' : '~'}]`;
            log(s.lastAction);

            window.postMessage({ type: 'txa-action', action: 'acc', data: s.events[s.events.length - 1] }, '*');

            if (s.events.length > MEMORY_THRESHOLD) {
                const removed = s.events.splice(0, Math.floor(MEMORY_THRESHOLD / 2));
                s.memoryStats.gcCount++;
                s.memoryStats.peakEvents = Math.max(s.memoryStats.peakEvents, s.events.length);
            }
        }
    };

    window.__txaStart_v17 = function(config) {
        const s = state;
        if (s.isRunning && s.sessionID) {
            if (JSON.stringify(s.config) === JSON.stringify(config)) return;
            window.__txaStop_v17();
        }

        log(`Engine v${VERSION} Ignition (Enhanced Mode)...`);
        s.isRunning = true;
        s.sessionID = Date.now();
        s.config = config || {};
        const sid = s.sessionID;

        const onInteract = () => {
            s.userInteracting = true;
            if (s.interactTimer) clearTimeout(s.interactTimer);
            s.interactTimer = setTimeout(() => { s.userInteracting = false; }, 2000);
        };
        document.addEventListener('mousedown', onInteract, true);
        document.addEventListener('keydown', onInteract, true);
        window.__txaOnInteract = onInteract;

        const poll = Math.max(config.pollInterval || 1000, 500);
        const clickInterval = setInterval(performClick, poll);
        window.__txaClickInterval = clickInterval;

        if (config.backgroundMode) {
            window.__txaTabCyclingLoop(sid);
        }

        log(`Engine v${VERSION} Started (Poll: ${poll}ms)`);
    };

    window.__txaStop_v17 = function() {
        log(`Engine v${VERSION} Shutdown.`);
        const s = state;
        s.isRunning = false;
        s.sessionID = 0;

        if (window.__txaClickInterval) clearInterval(window.__txaClickInterval);
        if (window.__txaOnInteract) {
            document.removeEventListener('mousedown', window.__txaOnInteract, true);
            document.removeEventListener('keydown', window.__txaOnInteract, true);
        }
        if (s.interactTimer) clearTimeout(s.interactTimer);

        log(`Memory stats: GC=${s.memoryStats.gcCount}, Peak=${s.memoryStats.peakEvents}`);
    };

    window.__txaGetStats_v17 = function() {
        const s = state;
        return JSON.stringify({
            isRunning: s.isRunning,
            clicks: s.clicks,
            events: [...s.events],
            lastAction: s.lastAction,
            memoryStats: { ...s.memoryStats },
            scanCount: s.scanCount
        });
    };

    window.__txaGetState_v17 = function() {
        return {
            isRunning: state.isRunning,
            config: state.config,
            sessionID: state.sessionID,
            userInteracting: state.userInteracting,
            clicks: state.clicks,
            memoryStats: { ...state.memoryStats }
        };
    };

    window.__txaSetPickMode_v17 = function(enabled) {
        log(`Pick mode: ${enabled ? 'ON' : 'OFF'}`);
    };

    window.__txaGetPickedSelector_v17 = function() {
        return null;
    };

    window.__txaSyncState_v17 = function(partialState) {
        if (partialState) {
            Object.assign(state.config, partialState.config || {});
            if (partialState.backgroundMode !== undefined) {
                state.config.backgroundMode = partialState.backgroundMode;
            }
        }
        return window.__txaGetState_v17();
    };

    window.__txaTabCyclingLoop = async function(sid) {
        const s = state;
        const TAB_SELECTORS = [
            '#workbench\\.parts\\.auxiliarybar ul[role="tablist"] li[role="tab"]',
            'button.grow',
            '.chat-session-item',
            'div[role="tablist"] div[role="tab"]'
        ];

        while (s.isRunning && s.sessionID === sid && s.config.backgroundMode) {
            if (s.userInteracting) {
                await new Promise(r => setTimeout(r, 1000));
                continue;
            }

            let tabs = [];
            for (const sel of TAB_SELECTORS) {
                const found = queryAll(sel);
                if (found.length > 0) {
                    tabs = found;
                    break;
                }
            }

            s.tabNames = Array.from(tabs).map(t => {
                const raw = t.textContent.trim().split('\n')[0] || t.getAttribute('aria-label') || 'Unknown Tab';
                return raw.substring(0, 25);
            });

            if (tabs.length > 0) {
                const target = tabs[s.tabIndex % tabs.length];
                s.lastAction = `Switching to: ${s.tabNames[s.tabIndex % tabs.length]}`;
                try {
                    target.click();
                    target.dispatchEvent(new MouseEvent('click', { bubbles: true, view: window }));
                    s.tabIndex++;
                } catch (e) {
                    log(`Tab click error: ${e.message}`);
                }
            }

            await new Promise(r => setTimeout(r, 3000));
        }
    };

    window.addEventListener('beforeunload', () => {
        if (state.isRunning) {
            window.__txaStop_v17();
        }
    });

    log(`Engine v${VERSION} Ready (Enhanced Mode).`);
})();

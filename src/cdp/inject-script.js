/**
 * TXA Auto Accept — Advanced Hybrid Inject Script v16.0 (CLEAN ENGINE)
 * 
 * Major Fixes:
 * - Completely removed UI Overlay to ensure zero interference with AI Chat.
 * - Optimized Background Engine performance.
 * - Maintained Broad Element Selection (v15.0 brain).
 */
(function() {
    'use strict';
    if (typeof window === 'undefined') return;

    const log = (msg) => console.log(`%c[TXA-CDP]%c ${msg}`, 'color:#a855f7;font-weight:bold', 'color:inherit');
    
    if (!window.__txaState) {
        window.__txaState = {
            isRunning: false,
            config: {},
            sessionID: 0,
            userInteracting: false,
            interactTimer: null,
            tabIndex: 0,
            tabNames: [],
            lastAction: 'Waiting for targets...',
            scanCount: 0
        };
    }

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

    const ACCEPT_TEXTS = ['accept', 'run', 'retry', 'apply', 'execute', 'confirm', 'allow', 'yes', 'approve', 'bắt đầu'];
    const DENY_TEXTS = ['skip', 'reject', 'cancel', 'close', 'refine', 'từ chối', 'đóng'];

    function performClick() {
        const s = window.__txaState;
        if (!s.isRunning || s.userInteracting) return;

        s.scanCount++;
        const config = s.config;
        
        // Broad target search (v15.0 Brain)
        const targets = queryAll('button, [role="button"], .anysphere-confirm-button, a.monaco-button');
        if (config.customSelector) {
            targets.push(...queryAll(config.customSelector));
        }

        for (const b of targets) {
            const text = (b.textContent || '').trim().toLowerCase();
            const aria = (b.getAttribute('aria-label') || '').trim().toLowerCase();
            const title = (b.getAttribute('title') || '').trim().toLowerCase();
            const fullTxt = `${text} ${aria} ${title}`;

            if (fullTxt.length < 2 || fullTxt.length > 100) continue;

            const isAccept = ACCEPT_TEXTS.some(p => fullTxt.includes(p));
            const isDeny = DENY_TEXTS.some(p => fullTxt.includes(p));

            if (isAccept && !isDeny) {
                const rect = b.getBoundingClientRect();
                if (rect.width > 0 && rect.height > 0) {
                    s.lastAction = `Accepted: "${text || aria.substring(0, 15)}"`;
                    log(`Auto-Click: ${s.lastAction}`);
                    b.click();
                    b.dispatchEvent(new MouseEvent('click', { bubbles: true, view: window }));
                    window.postMessage({ type: 'txa-action', action: 'acc' }, '*');
                    return; 
                }
            }
        }
    }

    async function tabCyclingLoop(sid) {
        const s = window.__txaState;
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
                target.click();
                target.dispatchEvent(new MouseEvent('click', { bubbles: true, view: window }));
                s.tabIndex++;
            }

            await new Promise(r => setTimeout(r, 3000));
        }
    }

    window.__txaStart = function(config) {
        const s = window.__txaState;
        if (s.isRunning && s.sessionID) {
            if (JSON.stringify(s.config) === JSON.stringify(config)) return;
            window.__txaStop();
        }

        log('Engine v16.0 Ignition (Clean Mode)...');
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
        window.__txaOnInteract = onInteract;

        const poll = Math.max(config.pollInterval || 1000, 500);
        const clickInterval = setInterval(performClick, poll);
        window.__txaClickInterval = clickInterval;

        if (config.backgroundMode) {
            tabCyclingLoop(sid);
        }
    };

    window.__txaStop = function() {
        log('Engine Shutdown.');
        const s = window.__txaState;
        s.isRunning = false;
        s.sessionID = 0;

        if (window.__txaClickInterval) clearInterval(window.__txaClickInterval);
        if (window.__txaOnInteract) document.removeEventListener('mousedown', window.__txaOnInteract, true);
        if (s.interactTimer) clearTimeout(s.interactTimer);
    };

    window.__txaGetStats = function() {
        const s = window.__txaState;
        return JSON.stringify({
            isRunning: s.isRunning,
            scanCount: s.scanCount,
            lastAction: s.lastAction
        });
    };

    log('Engine v16.0 Ready (Clean Mode).');
})();

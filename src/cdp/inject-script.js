/**
 * TXA Auto Accept — Advanced Hybrid Inject Script v14.5
 * 
 * Features:
 * - Dual-Loop Architecture (Independent Clicking vs. Tab Cycling)
 * - User Interaction Guard (Auto-Pause on manual click)
 * - Intelligent Tab Selection (Cursor & Antigravity)
 * - Fluid Glass Status Overlay with Tab Tracking
 */
(function() {
    'use strict';
    if (typeof window === 'undefined') return;

    const log = (msg) => console.log(`%c[TXA-CDP]%c ${msg}`, 'color:#a855f7;font-weight:bold', 'color:inherit');
    const OVERLAY_ID = '__txaOverlay';
    
    // --- State Management ---
    if (!window.__txaState) {
        window.__txaState = {
            isRunning: false,
            config: {},
            sessionID: 0,
            userInteracting: false,
            interactTimer: null,
            tabIndex: 0,
            tabNames: [],
            completionStatus: {}
        };
    }

    // --- DOM Utilities ---
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

    // --- Selectors ---
    const TAB_SELECTORS = {
        cursor: [
            '#workbench\\.parts\\.auxiliarybar ul[role="tablist"] li[role="tab"]',
            '.monaco-pane-view .monaco-list-row[role="listitem"]',
            'div[role="tablist"] div[role="tab"]'
        ],
        antigravity: ['button.grow', '.chat-session-item']
    };

    const ACCEPT_SELECTORS = [
        '.anysphere-confirm-button',
        '.monaco-button.monaco-text-button',
        'button.bg-primary',
        'button.rounded-l',
        '[class*="button-primary"]'
    ];

    const ACCEPT_TEXTS = ['accept', 'run', 'retry', 'apply', 'execute', 'confirm', 'allow'];
    const DENY_TEXTS = ['skip', 'reject', 'cancel', 'close', 'refine'];

    // --- UI Helpers ---
    function ensureOverlay() {
        let overlay = document.getElementById(OVERLAY_ID);
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.id = OVERLAY_ID;
            overlay.style.cssText = `
                position: fixed; z-index: 2147483647; pointer-events: none;
                display: flex; flex-direction: column; align-items: center; justify-content: center;
                transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
                background: rgba(10, 10, 20, 0.85); backdrop-filter: blur(20px);
                border: 1px solid rgba(168, 85, 247, 0.3); box-shadow: 0 0 50px rgba(0,0,0,0.5);
                opacity: 0; color: #fff; font-family: system-ui, sans-serif; overflow: hidden;
            `;
            
            const content = document.createElement('div');
            content.id = OVERLAY_ID + '_content';
            content.style.padding = '20px';
            content.style.textAlign = 'center';
            overlay.appendChild(content);
            
            document.body.appendChild(overlay);

            // Sync with AI Panel
            const sync = () => {
                const panel = queryAll('#antigravity\\.agentPanel, #workbench\\.parts\\.auxiliarybar, .auxiliary-bar-container').find(p => p.offsetWidth > 50);
                if (panel) {
                    const r = panel.getBoundingClientRect();
                    overlay.style.top = r.top + 'px';
                    overlay.style.left = r.left + 'px';
                    overlay.style.width = r.width + 'px';
                    overlay.style.height = r.height + 'px';
                    overlay.style.opacity = '1';
                } else {
                    overlay.style.opacity = '0';
                }
            };

            const obs = new ResizeObserver(sync);
            const parent = document.querySelector('.monaco-workbench') || document.body;
            obs.observe(parent);
            window.__txaOverlayObs = obs;
            sync();
        }
    }

    function updateOverlayUI() {
        const content = document.getElementById(OVERLAY_ID + '_content');
        if (!content) return;
        const s = window.__txaState;
        const bg = s.config.backgroundMode;
        
        content.innerHTML = `
            <div style="font-weight: 800; font-size: 14px; margin-bottom: 12px; color: ${bg ? '#a855f7' : '#22d3ee'}">
                ${bg ? '🟣 BACKGROUND MODE ACTIVE' : '🔵 ENGINE ACTIVE'}
            </div>
            ${bg ? `<div style="font-size: 11px; opacity: 0.7; margin-bottom: 15px">Cycling ${s.tabNames.length} tabs...</div>` : ''}
            <div id="${OVERLAY_ID}_tabs" style="width: 100%; display: flex; flex-direction: column; gap: 8px"></div>
        `;

        if (bg) {
            const list = document.getElementById(OVERLAY_ID + '_tabs');
            s.tabNames.forEach((name, i) => {
                const active = i === (s.tabIndex % s.tabNames.length);
                const item = document.createElement('div');
                item.style.cssText = `
                    font-size:11px; padding:6px 10px; border-radius:6px;
                    background: ${active ? 'rgba(168, 85, 247, 0.2)' : 'rgba(255,255,255,0.03)'};
                    border: 1px solid ${active ? '#a855f7' : 'rgba(255,255,255,0.1)'};
                    text-align: left; transition: all 0.3s;
                `;
                item.innerText = (active ? '👉 ' : '') + name;
                list.appendChild(item);
            });
        }
    }

    // --- Core Loops ---
    function performClick() {
        const s = window.__txaState;
        if (!s.isRunning || s.userInteracting) return;

        const config = s.config;
        const selectors = [...ACCEPT_SELECTORS];
        if (config.customSelector) selectors.unshift(config.customSelector);

        for (const sel of selectors) {
            const bts = queryAll(sel);
            for (const b of bts) {
                const txt = (b.textContent || '').trim().toLowerCase();
                if (txt.length === 0 || txt.length > 50) continue;
                
                // Validate text patterns
                const isAccept = ACCEPT_TEXTS.some(p => txt.includes(p));
                const isDeny = DENY_TEXTS.some(p => txt.includes(p));
                
                if (isAccept && !isDeny) {
                    const rect = b.getBoundingClientRect();
                    if (rect.width > 0 && rect.height > 0) {
                        log(`Clicking: "${txt}"`);
                        b.dispatchEvent(new MouseEvent('click', { bubbles: true, view: window }));
                        window.postMessage({ type: 'txa-action', action: 'acc' }, '*');
                        return; // Click one at a time for safety
                    }
                }
            }
        }
    }

    async function tabCyclingLoop(sid) {
        log('Starting Tab Cycling Loop...');
        const s = window.__txaState;
        
        while (s.isRunning && s.sessionID === sid && s.config.backgroundMode) {
            const ide = (s.config.ide || 'cursor').toLowerCase();
            const selectors = TAB_SELECTORS[ide] || TAB_SELECTORS.cursor;
            
            let tabs = [];
            for (const sel of selectors) {
                tabs = queryAll(sel);
                if (tabs.length > 0) break;
            }

            s.tabNames = Array.from(tabs).map(t => t.textContent.trim().split('\n')[0].substring(0, 30));
            updateOverlayUI();

            if (tabs.length > 0) {
                const target = tabs[s.tabIndex % tabs.length];
                log(`Transitioning to tab: "${s.tabNames[s.tabIndex % tabs.length]}"`);
                target.dispatchEvent(new MouseEvent('click', { bubbles: true, view: window }));
                s.tabIndex++;
            }

            // Wait 3 seconds to let content load and clicking loop do its work
            await new Promise(r => setTimeout(r, 3000));
        }
    }

    // --- Entry Points ---
    window.__txaStart = function(config) {
        log('Initializing Advanced Hybrid Engine...');
        const s = window.__txaState;
        if (s.isRunning) window.__txaStop();

        s.isRunning = true;
        s.sessionID++;
        s.config = config || {};
        const sid = s.sessionID;

        ensureOverlay();
        updateOverlayUI();

        // Guard: Pause on mouse down
        const onInteract = () => {
            s.userInteracting = true;
            if (s.interactTimer) clearTimeout(s.interactTimer);
            s.interactTimer = setTimeout(() => { s.userInteracting = false; }, 1500);
        };
        document.addEventListener('mousedown', onInteract, true);
        window.__txaOnInteract = onInteract;

        // Loop 1: High-Speed Clicking
        const poll = config.pollInterval || 1000;
        const clickInterval = setInterval(performClick, poll);
        window.__txaClickInterval = clickInterval;

        // Loop 2: Background Cycling (if enabled)
        if (config.backgroundMode) {
            tabCyclingLoop(sid);
        }

        log('Active.');
    };

    window.__txaStop = function() {
        log('Stopping Engine...');
        const s = window.__txaState;
        s.isRunning = false;

        if (window.__txaClickInterval) clearInterval(window.__txaClickInterval);
        if (window.__txaOnInteract) document.removeEventListener('mousedown', window.__txaOnInteract, true);
        
        const overlay = document.getElementById(OVERLAY_ID);
        if (overlay) {
            if (window.__txaOverlayObs) window.__txaOverlayObs.disconnect();
            overlay.style.opacity = '0';
            setTimeout(() => { if (!s.isRunning) overlay.remove(); }, 400);
        }
        log('Engine Offline.');
    };

    log('Advanced Hybrid Inject Script Ready.');
})();

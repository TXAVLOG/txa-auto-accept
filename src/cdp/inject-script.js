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

    const GHOST_CLICK_DELAY = 600;
    const DESTRUCTIVE_TEXTS = ['delete', 'remove', 'force', 'reset', 'drop', 'terminate', 'purge', 'destroy', 'dangerous'];

    // --- Selectors ---
    const TAB_SELECTORS = {
        cursor: [
            '#workbench\\.parts\\.auxiliarybar ul[role="tablist"] li[role="tab"]',
            '.monaco-pane-view .monaco-list-row[role="listitem"]',
            'div[role="tablist"] div[role="tab"]'
        ],
        antigravity: [
            'button.grow',
            '.chat-session-item',
            '[aria-label*="conversation"]',
            '[class*="agent-session"]'
        ]
    };

    const ACCEPT_SELECTORS = [
        '.anysphere-confirm-button',
        '.monaco-button.monaco-text-button',
        'button.bg-primary',
        'button.rounded-l',
        '[class*="button-primary"]',
        '[class*="accept-btn"]',
        'button:not([disabled]):contains("Accept")',
        'button:not([disabled]):contains("Apply")'
    ];

    const ACCEPT_TEXTS = ['accept', 'run', 'retry', 'apply', 'execute', 'confirm', 'allow', 'approve', 'install', 'yes'];
    const DENY_TEXTS = ['skip', 'reject', 'cancel', 'close', 'refine', 'never'];

    // --- UI Helpers ---
    function ensureOverlay() {
        let overlay = document.getElementById(OVERLAY_ID);
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.id = OVERLAY_ID;
            overlay.style.cssText = `
                position: fixed; z-index: 2147483647; pointer-events: none;
                display: flex; flex-direction: column; align-items: center; justify-content: center;
                transition: all 0.5s cubic-bezier(0.2, 0.8, 0.2, 1);
                background: linear-gradient(135deg, rgba(15, 15, 30, 0.85), rgba(30, 20, 50, 0.75));
                backdrop-filter: blur(25px); border: 1px solid rgba(168, 85, 247, 0.4);
                box-shadow: 0 0 60px rgba(168, 85, 247, 0.15);
                opacity: 0; color: #fff; font-family: 'Inter', system-ui, sans-serif; overflow: hidden;
                border-radius: 0;
            `;
            
            const content = document.createElement('div');
            content.id = OVERLAY_ID + '_content';
            content.style.padding = '25px';
            content.style.textAlign = 'center';
            overlay.appendChild(content);
            
            document.body.appendChild(overlay);

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

    function createGhostEffect(btn) {
        const rect = btn.getBoundingClientRect();
        const ghost = document.createElement('div');
        ghost.style.cssText = `
            position: fixed; top: ${rect.top}px; left: ${rect.left}px;
            width: ${rect.width}px; height: ${rect.height}px;
            border: 2px solid #22d3ee; border-radius: 4px;
            pointer-events: none; z-index: 2147483646;
            animation: txa-ghost-pulse 0.6s ease-out forwards;
        `;
        
        if (!document.getElementById('txa-ghost-style')) {
            const s = document.createElement('style');
            s.id = 'txa-ghost-style';
            s.innerHTML = `
                @keyframes txa-ghost-pulse {
                    0% { transform: scale(1); opacity: 1; box-shadow: 0 0 0 0 rgba(34, 211, 238, 0.7); }
                    100% { transform: scale(1.1); opacity: 0; box-shadow: 0 0 20px 10px rgba(34, 211, 238, 0); }
                }
            `;
            document.head.appendChild(s);
        }
        
        document.body.appendChild(ghost);
        setTimeout(() => ghost.remove(), 700);
    }

    function updateOverlayUI() {
        const content = document.getElementById(OVERLAY_ID + '_content');
        if (!content) return;
        const s = window.__txaState;
        const bg = s.config.backgroundMode;
        
        content.innerHTML = `
            <div style="font-weight: 800; font-size: 11px; letter-spacing: 2px; margin-bottom: 2px; color: rgba(255,255,255,0.4)">RELEASE PREVIEW</div>
            <div style="font-weight: 900; font-size: 15px; margin-bottom: 12px; color: ${bg ? '#a855f7' : '#22d3ee'}; text-shadow: 0 0 15px ${bg ? 'rgba(168, 85, 247, 0.5)' : 'rgba(34, 211, 238, 0.5)'}">
                ${bg ? '🟣 HYBRID ENGINE' : '🔵 SMART SCANNER'}
            </div>
            ${bg ? `<div style="font-size: 11px; opacity: 0.7; margin-bottom: 15px">Monitoring ${s.tabNames.length} active sessions</div>` : ''}
            <div id="${OVERLAY_ID}_tabs" style="width: 100%; display: flex; flex-direction: column; gap: 8px"></div>
        `;

        if (bg) {
            const list = document.getElementById(OVERLAY_ID + '_tabs');
            s.tabNames.forEach((name, i) => {
                const active = i === (s.tabIndex % s.tabNames.length);
                const item = document.createElement('div');
                item.style.cssText = `
                    font-size:10px; padding:8px 12px; border-radius:8px;
                    background: ${active ? 'rgba(168, 85, 247, 0.25)' : 'rgba(255,255,255,0.03)'};
                    border: 1px solid ${active ? '#a855f7' : 'rgba(255,255,255,0.08)'};
                    text-align: left; transition: all 0.3s; color: ${active ? '#fff' : 'rgba(255,255,255,0.6)'};
                `;
                item.innerText = (active ? '⚡ ' : '○ ') + name;
                list.appendChild(item);
            });
        }
    }

    // --- Core Loops ---
    async function performClick() {
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
                
                // 1. Safety Guard Check
                const isDestructive = DESTRUCTIVE_TEXTS.some(p => txt.includes(p));
                if (isDestructive) {
                    if (!b.__txa_warned) {
                        log(`Safety Guard Blocked Destructive Action: "${txt}"`);
                        b.__txa_warned = true;
                        window.postMessage({ type: 'txa-action', action: 'den', details: `Safety Guard: ${txt}` }, '*');
                    }
                    continue;
                }

                // 2. Accept Validation
                const isAccept = ACCEPT_TEXTS.some(p => txt.includes(p));
                const isDeny = DENY_TEXTS.some(p => txt.includes(p));
                
                if (isAccept && !isDeny) {
                    const rect = b.getBoundingClientRect();
                    if (rect.width > 0 && rect.height > 0) {
                        if (b.__txa_clicking) return;
                        b.__txa_clicking = true;

                        // 3. Ghost Click Preview
                        log(`Ghost Preview: "${txt}"`);
                        createGhostEffect(b);
                        
                        // Wait for preview
                        await new Promise(r => setTimeout(r, GHOST_CLICK_DELAY));

                        if (s.isRunning && !s.userInteracting) {
                            log(`Final Click: "${txt}"`);
                            b.dispatchEvent(new MouseEvent('click', { bubbles: true, view: window }));
                            window.postMessage({ type: 'txa-action', action: 'acc', btn: txt }, '*');
                        }
                        return; 
                    }
                }
            }
        }
    }

    async function tabCyclingLoop(sid) {
        log('Starting Hybrid Pulse Loop...');
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
                log(`Transition: "${s.tabNames[s.tabIndex % tabs.length]}"`);
                target.dispatchEvent(new MouseEvent('click', { bubbles: true, view: window }));
                s.tabIndex++;
            }

            await new Promise(r => setTimeout(r, 4000));
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

/**
 * TXA Auto Accept — Advanced Hybrid Inject Script v15.0 (FINAL FIX)
 * 
 * Major Fixes:
 * - Broadened element selectors (button, [role="button"])
 * - Improved text matching (aria-label & title support)
 * - Optimized Dual-Loop timing to prevent overlaps
 * - Fixed User Interaction Guard sticking
 */
(function() {
    'use strict';
    if (typeof window === 'undefined') return;

    const log = (msg) => console.log(`%c[TXA-CDP]%c ${msg}`, 'color:#a855f7;font-weight:bold', 'color:inherit');
    const OVERLAY_ID = '__txaOverlay';
    
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

    function ensureOverlay() {
        let overlay = document.getElementById(OVERLAY_ID);
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.id = OVERLAY_ID;
            overlay.style.cssText = `
                position: fixed; z-index: 2147483647; pointer-events: none;
                display: flex; flex-direction: column; align-items: flex-start; justify-content: flex-end;
                transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1);
                background: linear-gradient(180deg, rgba(168, 85, 247, 0.1), rgba(10, 10, 20, 0.85)); 
                backdrop-filter: blur(10px); color: #fff;
                border: 1px solid rgba(168, 85, 247, 0.2); border-radius: 12px;
                opacity: 0; font-family: 'Segoe UI', system-ui, sans-serif; overflow: hidden;
            `;
            const content = document.createElement('div');
            content.id = OVERLAY_ID + '_content';
            content.style.padding = '12px 18px';
            content.style.width = '100%';
            content.style.boxSizing = 'border-box';
            overlay.appendChild(content);
            document.body.appendChild(overlay);

            const sync = () => {
                const s = window.__txaState;
                if (!s.isRunning) return;
                const panel = queryAll('#antigravity\\.agentPanel, #workbench\\.parts\\.auxiliarybar, .auxiliary-bar-container').find(p => p.offsetWidth > 100);
                if (panel) {
                    const r = panel.getBoundingClientRect();
                    // Positioning: Bottom footer pill inside the panel area
                    overlay.style.top = (r.bottom - 120) + 'px'; 
                    overlay.style.left = (r.left + 10) + 'px';
                    overlay.style.width = (r.width - 20) + 'px';
                    overlay.style.height = '110px';
                    overlay.style.opacity = s.userInteracting ? '0.1' : '1';
                } else {
                    overlay.style.opacity = '0';
                }
            };
            const obs = new ResizeObserver(sync);
            obs.observe(document.body);
            window.__txaOverlayObs = obs;
            sync();
        }
    }

    function updateOverlayUI() {
        const content = document.getElementById(OVERLAY_ID + '_content');
        if (!content) return;
        const s = window.__txaState;
        const mode = s.config.backgroundMode ? '🟣 BACKGROUND CYCLE' : '🔵 ACTIVE SHIELD';
        
        content.innerHTML = `
            <div style="font-weight: 900; font-size: 15px; letter-spacing: 1px; color: ${s.config.backgroundMode ? '#a855f7' : '#22d3ee'}; margin-bottom: 5px">
                ${mode}
            </div>
            <div style="font-size: 10px; opacity: 0.6; margin-bottom: 15px; font-family: monospace">
                Scan #${s.scanCount} | ${s.userInteracting ? 'PAUSED (USER)' : 'MONITORING...'}
            </div>
            <div style="font-size: 12px; font-weight: 500; color: #fff; background: rgba(255,255,255,0.05); padding: 8px; border-radius: 6px; margin-bottom: 15px">
                ${s.lastAction}
            </div>
            <div id="${OVERLAY_ID}_tabs" style="width: 100%; display: flex; flex-direction: column; gap: 6px"></div>
        `;

        if (s.config.backgroundMode && s.tabNames.length > 0) {
            const list = document.getElementById(OVERLAY_ID + '_tabs');
            s.tabNames.forEach((name, i) => {
                const active = i === (s.tabIndex % s.tabNames.length);
                const item = document.createElement('div');
                item.style.cssText = `
                    font-size:11px; padding:6px 12px; border-radius:4px;
                    background: ${active ? 'rgba(168, 85, 247, 0.3)' : 'rgba(255,255,255,0.03)'};
                    border-left: 3px solid ${active ? '#a855f7' : 'transparent'};
                    text-align: left; transition: all 0.2s; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
                `;
                item.innerText = (active ? '▶ ' : '') + name;
                list.appendChild(item);
            });
        }
    }

    function performClick() {
        const s = window.__txaState;
        if (!s.isRunning) return;
        if (s.userInteracting) {
            s.lastAction = 'User interacting... pausing.';
            updateOverlayUI();
            return;
        }

        s.scanCount++;
        const config = s.config;
        
        // Broaden target search
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
                    updateOverlayUI();
                    return; // Prevent multiple clicks in one burst
                }
            }
        }

        if (s.scanCount % 5 === 0) {
            s.lastAction = 'Scanning for targets...';
            updateOverlayUI();
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
                updateOverlayUI();
            }

            await new Promise(r => setTimeout(r, 3000));
        }
    }

    window.__txaStart = function(config) {
        const s = window.__txaState;
        if (s.isRunning && s.sessionID) {
            // Already running with same config? Just update config and return
            if (JSON.stringify(s.config) === JSON.stringify(config)) return;
            window.__txaStop();
        }

        log('Engine v15.0 Ignition...');
        s.isRunning = true;
        s.sessionID = Date.now();
        s.config = config || {};
        const sid = s.sessionID;

        ensureOverlay();
        updateOverlayUI();

        const onInteract = () => {
            s.userInteracting = true;
            if (s.interactTimer) clearTimeout(s.interactTimer);
            s.interactTimer = setTimeout(() => { 
                s.userInteracting = false; 
                updateOverlayUI();
            }, 2000);
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
        
        const overlay = document.getElementById(OVERLAY_ID);
        if (overlay) {
            if (window.__txaOverlayObs) window.__txaOverlayObs.disconnect();
            overlay.style.opacity = '0';
            setTimeout(() => { if (!s.isRunning) overlay.remove(); }, 400);
        }
    };

    window.__txaGetStats = function() {
        const s = window.__txaState;
        return JSON.stringify({
            isRunning: s.isRunning,
            scanCount: s.scanCount,
            lastAction: s.lastAction
        });
    };

    log('Engine v15.0 Ready.');
})();

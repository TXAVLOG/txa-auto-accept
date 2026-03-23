module.exports = function getHTML(config, state, t, LOGO_SVG) {
    const lang = config.get('language', 'vi');
    return `
    <div id="aurora-bg">
        <div class="aurora-orb"></div><div class="aurora-orb"></div>
        <div class="aurora-orb"></div><div class="aurora-orb"></div>
    </div>
    <canvas id="particles-canvas"></canvas>
    <div id="txa-tooltip"></div>
    <div class="container">
        <header>
            <div class="brand">
                <div class="logo-wrapper">${LOGO_SVG}</div>
                <div class="brand-text">
                    <div style="display:flex;align-items:center;gap:8px">
                        <h1>${t.title}</h1>
                    </div>
                    <span>v7.3.4 · Liquid Glass Engine | <span style="color:var(--success);font-weight:700" id="terminal-badge">${t.terminalProtection}</span></span>
                </div>
            </div>
            <div class="nav-tabs">
                <button class="tab active" data-tab="monitor" data-tip="${t.monitor}">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="vertical-align:-2px;margin-right:4px"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
                    ${t.monitor}
                </button>
                <button class="tab" data-tab="config" data-tip="${t.config}">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="vertical-align:-2px;margin-right:4px"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
                    ${t.config}
                </button>
                <button class="tab" data-tab="shield" data-tip="${t.shield}">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="vertical-align:-2px;margin-right:4px"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                    ${t.shield}
                </button>
                <button class="tab" data-tab="about" data-tip="${t.about}">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="vertical-align:-2px;margin-right:4px"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg>
                    ${t.about}
                </button>
            </div>
        </header>

        <div class="panel active" id="panel-monitor">
            <div class="stats">
                <div class="stat-card acc" data-tip="${t.accepted}">
                    <div class="stat-val stat-acc" id="val-acc" style="font-size:2rem">${state.clicks}</div>
                    <div class="stat-lbl" style="font-size:.6rem">Accepted</div>
                </div>
                <div class="stat-card den" data-tip="${t.blocked}">
                    <div class="stat-val stat-den" id="val-den" style="font-size:2rem">${state.denied}</div>
                    <div class="stat-lbl" style="font-size:.6rem">Shield (✗)</div>
                </div>
                <div class="stat-card roi" data-tip="Time Saved (Min) / Thời gian tiết kiệm" style="border-color:var(--accent-glow)">
                    <div class="stat-val" id="val-time-saved" style="font-size:2rem;color:var(--accent);text-shadow:0 0 20px var(--accent-glow)">0</div>
                    <div class="stat-lbl" style="font-size:.6rem">ROI (Min)</div>
                </div>
            </div>

            <div class="stats" style="grid-template-columns: 1fr; margin-top: -0.8rem; margin-bottom: 2rem">
                <div class="stat-card" style="padding: 0.8rem 1.2rem; flex-direction: row; gap: 1rem; justify-content: space-between; background: rgba(167, 139, 250, 0.03)">
                    <div style="display: flex; gap: 1.5rem">
                        <div style="display: flex; flex-direction: column; align-items: flex-start">
                            <div class="stat-lbl" style="font-size: 0.6rem; color: var(--text-muted)">Weekly Clicks</div>
                            <div id="val-weekly-clicks" style="font-size: 1rem; font-weight: 800; font-family: 'JetBrains Mono', monospace; color: var(--text-main)">${state.weeklyClicks || 0}</div>
                        </div>
                    </div>
                    <div style="display: flex; align-items: center; gap: 10px">
                        <div class="stat-lbl" style="font-size: 0.65rem">Background Mode</div>
                        <label class="switch"><input type="checkbox" id="btn-toggle-background" ${state.backgroundMode ? 'checked' : ''}><span class="slider"></span></label>
                    </div>
                </div>
            </div>

            <div class="threat-meter">
                <div class="threat-label">
                    <span>${t.threatLevel}</span>
                    <span class="threat-level-text" id="threat-text">LOW</span>
                </div>
                <div class="threat-bar-track">
                    <div class="threat-bar-fill" id="threat-fill" style="width:5%"></div>
                </div>
            </div>

            <div class="uptime-display" id="uptime-display" data-tip="Engine persistence time / Thời gian engine duy trì hoạt động">
                <span class="uptime-label">${t.uptime}:</span>
                <span id="uptime-val">⏱ 00:00:00</span>
            </div>

            <div class="engine-status">
                <span class="status-dot"></span>
                <span id="status-text">${t.engineStatus} v7.2.3</span>
            </div>

            <div class="action-row">
                <button class="btn-action" id="btn-reset-counter" data-tip="${t.resetCounter}">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M23 4v6h-6M1 20v-6h6M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"/></svg>
                    ${t.resetCounter}
                </button>
                <a href="#" class="btn-action star" id="star-github">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                    ${t.starOnGithub}
                </a>
            </div>

            <div class="log-header">
                <h3>${t.logTitle}</h3>
                <button class="btn-action" id="btn-clear-log" data-tip="${t.clear}">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>
                    ${t.clear}
                </button>
            </div>
            <div class="log-list" id="log-list"></div>
        </div>

        <div class="panel" id="panel-config">
            <div class="config-list">
                <div class="config-row">
                    <div class="row-info"><h3>${t.langDesc}</h3><p>${lang === 'vi' ? 'Ngôn ngữ hiển thị giao diện' : 'Interface display language'}</p></div>
                    <select id="cfg-lang">
                        <option value="vi" ${lang === 'vi' ? 'selected' : ''}>Tiếng Việt</option>
                        <option value="en" ${lang === 'en' ? 'selected' : ''}>English</option>
                    </select>
                </div>
                <div class="config-row">
                    <div class="row-info"><h3>${t.autoClick}</h3><p>${t.autoClickDesc}</p></div>
                    <label class="switch"><input type="checkbox" id="cfg-autoclick" ${config.get('autoClick', true) ? 'checked' : ''}><span class="slider"></span></label>
                </div>
                <div class="config-row">
                    <div class="row-info"><h3>Custom Selector</h3><p>${lang === 'vi' ? 'CSS selector của nút cần tự động bấm' : 'CSS selector for auto-click target'}</p></div>
                    <div style="display:flex;gap:8px">
                        <input type="text" id="cfg-selector" value="${config.get('customSelector', '')}" style="width:140px;font-size:.8rem" placeholder=".btn-accept">
                        <button id="btn-pick-element" class="btn-action" data-tip="Pick Element">
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/></svg>
                        </button>
                    </div>
                </div>
                <div class="sandbox-guide" style="padding:1rem;background:rgba(251,191,36,0.05);border-radius:var(--radius-sm);border:1px dashed rgba(251,191,36,0.2);margin-top:-0.5rem">
                    <p style="font-size:0.72rem;color:var(--warning);line-height:1.4">${t.sandboxWarning}</p>
                    <p style="font-size:0.7rem;color:var(--text-muted);margin-top:0.5rem;font-style:italic">${t.devToolsTip}</p>
                </div>
                <div class="config-row">
                    <div class="row-info"><h3>${t.scanInterval}</h3><p>${t.scanDesc}</p></div>
                    <input type="number" id="cfg-interval" value="${config.get('scanInterval', 3000)}" style="width:100px;text-align:center">
                </div>
                <div class="config-row">
                    <div class="row-info"><h3>${t.idleSeconds}</h3><p>${t.idleDesc}</p></div>
                    <input type="number" id="cfg-idle" value="${config.get('idleSeconds', 5)}" style="width:100px;text-align:center">
                </div>
                <div class="config-row">
                    <div class="row-info"><h3>${lang === 'vi' ? 'Âm thanh thông báo' : 'Sound Notifications'}</h3><p>${lang === 'vi' ? 'Phát âm thanh khi chặn lệnh nguy hiểm' : 'Play sound when blocking threats'}</p></div>
                    <div style="display:flex;gap:8px;align-items:center">
                        <button id="btn-test-sound" class="btn-action" data-tip="Test Sound">🔊</button>
                        <label class="switch"><input type="checkbox" id="cfg-sound" ${config.get('soundEnabled', true) ? 'checked' : ''}><span class="slider"></span></label>
                    </div>
                </div>
            </div>
            <button class="btn-main" id="btn-save-cfg">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
                ${t.save}
            </button>
        </div>

        <div class="panel" id="panel-shield">
            <div class="shield-inputs">
                <div class="input-wrapper">
                    <div class="suggest-hint" id="hint-label"></div>
                    <input type="text" id="new-label" placeholder="${t.placeholderLabel}">
                    <span class="suggest-tab-hint">TAB</span>
                </div>
                <div class="input-wrapper">
                    <div class="suggest-hint" id="hint-pattern"></div>
                    <input type="text" id="new-pattern" placeholder="${t.placeholderPattern}">
                </div>
                <button id="btn-add-deny" class="btn-plus" data-tip="${t.addRule}">+</button>
            </div>
            <div class="shield-search" style="position:relative">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="position:absolute;left:.8rem;top:50%;transform:translateY(-50%);color:var(--text-muted);z-index:1"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
                <input type="text" id="shield-search" placeholder="${t.searchShield}" style="padding-left:2.5rem">
            </div>
            <div class="deny-grid" id="deny-list"></div>
        </div>

        <div class="panel" id="panel-about">
            <div class="about-panel">
                <div class="about-logo">${LOGO_SVG}</div>
                <div class="about-title">${t.title}</div>
                <div class="about-version">v7.2.3 · Liquid Glass Engine 2026</div>
                <p class="about-desc">${t.aboutDesc}</p>
                <div class="about-links">
                    <a href="#" class="about-link" id="link-github">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
                        GitHub
                    </a>
                    <a href="#" class="about-link" id="link-marketplace">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/></svg>
                        Marketplace
                    </a>
                </div>
                <p class="about-footer">${t.madeWith}</p>
            </div>
        </div>

        <div class="footer-bar">
            <span>© 2026 TXA Team</span>
            <span>Liquid Glass Engine · <a href="#">MIT License</a></span>
        </div>
    </div>`;
};

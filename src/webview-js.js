module.exports = function getJS(state, BUILTIN_DENY, suggestions, audioData) {
    return `
        const vscode = acquireVsCodeApi();
        let state = ${JSON.stringify(state)};
        const builtIn = ${JSON.stringify(BUILTIN_DENY)};
        const SUGGESTS = ${JSON.stringify(suggestions)};
        const AUDIO_DATA = ${JSON.stringify(audioData)};
        let uptimeSeconds = state.uptime || 0;
        let isEngineActive = true; 

        // === PARTICLE SYSTEM ===
        (function initParticles() {
            const canvas = document.getElementById('particles-canvas');
            const ctx = canvas.getContext('2d');
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            const particles = [];
            for (let i = 0; i < 50; i++) {
                particles.push({
                    x: Math.random() * canvas.width,
                    y: Math.random() * canvas.height,
                    r: Math.random() * 1.5 + 0.3,
                    dx: (Math.random() - 0.5) * 0.3,
                    dy: (Math.random() - 0.5) * 0.3,
                    alpha: Math.random() * 0.4 + 0.05
                });
            }
            function animate() {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                particles.forEach(p => {
                    p.x += p.dx; p.y += p.dy;
                    if (p.x < 0) p.x = canvas.width;
                    if (p.x > canvas.width) p.x = 0;
                    if (p.y < 0) p.y = canvas.height;
                    if (p.y > canvas.height) p.y = 0;
                    ctx.beginPath();
                    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
                    ctx.fillStyle = 'rgba(148, 163, 184, ' + p.alpha + ')';
                    ctx.fill();
                });
                // Connection lines
                for (let i = 0; i < particles.length; i++) {
                    for (let j = i + 1; j < particles.length; j++) {
                        const dx = particles[i].x - particles[j].x;
                        const dy = particles[i].y - particles[j].y;
                        const dist = Math.sqrt(dx * dx + dy * dy);
                        if (dist < 120) {
                            ctx.beginPath();
                            ctx.moveTo(particles[i].x, particles[i].y);
                            ctx.lineTo(particles[j].x, particles[j].y);
                            ctx.strokeStyle = 'rgba(148, 163, 184, ' + (0.03 * (1 - dist / 120)) + ')';
                            ctx.lineWidth = 0.5;
                            ctx.stroke();
                        }
                    }
                }
                requestAnimationFrame(animate);
            }
            animate();
            window.addEventListener('resize', () => {
                canvas.width = window.innerWidth;
                canvas.height = window.innerHeight;
            });
        })();

        // === TAB SWITCHING ===
        document.querySelectorAll('.tab').forEach(btn => {
            btn.onclick = () => {
                document.querySelectorAll('.tab, .panel').forEach(el => el.classList.remove('active'));
                btn.classList.add('active');
                document.getElementById('panel-' + btn.dataset.tab).classList.add('active');
            };
        });

        // === TOOLTIP ===
        const tooltip = document.getElementById('txa-tooltip');
        document.addEventListener('mousemove', e => {
            const tgt = e.target.closest('[data-tip]');
            if (tgt) {
                tooltip.innerText = tgt.dataset.tip;
                tooltip.style.opacity = '1';
                tooltip.style.transform = 'scale(1)';
                tooltip.style.left = (e.clientX + 15) + 'px';
                tooltip.style.top = (e.clientY + 15) + 'px';
            } else {
                tooltip.style.opacity = '0';
                tooltip.style.transform = 'scale(.95)';
            }
        });

        // === UPTIME DISPLAY ===
        function updateUptimeDisplay() {
            const h = String(Math.floor(uptimeSeconds / 3600)).padStart(2, '0');
            const m = String(Math.floor((uptimeSeconds % 3600) / 60)).padStart(2, '0');
            const s = String(uptimeSeconds % 60).padStart(2, '0');
            const el = document.getElementById('uptime-val');
            if (el) el.textContent = '⏱ ' + h + ':' + m + ':' + s;
        }

        // Timer no longer increments here, it's synced from extension.js
        updateUptimeDisplay();

        // === SOUND SYSTEM ===
        const SOUNDS = {
            blocked: new Audio(AUDIO_DATA || 'https://www.soundjay.com/buttons/sounds/button-10.mp3'),
            accepted: new Audio(AUDIO_DATA || 'https://www.soundjay.com/buttons/sounds/button-20.mp3')
        };
        SOUNDS.blocked.volume = 0.4;
        SOUNDS.accepted.volume = 0.2;

        function playSound(type) {
            const enabled = document.getElementById('cfg-sound').checked;
            if (enabled && SOUNDS[type]) {
                const s = SOUNDS[type].cloneNode();
                s.volume = SOUNDS[type].volume;
                s.play().catch(() => {});
            }
        }

        // === THREAT METER ===
        function updateThreat() {
            const total = state.clicks + state.denied;
            const pct = total === 0 ? 2 : Math.min(Math.round((state.denied / total) * 100), 100);
            const fill = document.getElementById('threat-fill');
            const text = document.getElementById('threat-text');
            fill.style.width = Math.max(pct, 2) + '%';
            if (pct < 20) { text.textContent = 'LOW'; text.style.color = '#22d3ee'; text.style.background = 'rgba(34,211,238,0.1)'; fill.style.background = 'linear-gradient(90deg,#22d3ee,#6366f1)'; }
            else if (pct < 50) { text.textContent = 'MEDIUM'; text.style.color = '#fbbf24'; text.style.background = 'rgba(251,191,36,0.1)'; fill.style.background = 'linear-gradient(90deg,#fbbf24,#f97316)'; }
            else { text.textContent = 'HIGH'; text.style.color = '#f43f5e'; text.style.background = 'rgba(244,63,94,0.1)'; fill.style.background = 'linear-gradient(90deg,#f97316,#f43f5e)'; }
        }

        // === REAL-TIME UPDATES ===
        window.addEventListener('message', event => {
            const msg = event.data;
            if (msg.command === 'updateStats') {
                const accEl = document.getElementById('val-acc');
                const timeEl = document.getElementById('val-time-saved');
                const weeklyEl = document.getElementById('val-weekly-clicks');

                if (state.clicks !== msg.clicks) {
                    accEl.innerText = msg.clicks;
                    accEl.classList.remove('changed'); void accEl.offsetWidth; accEl.classList.add('changed');
                    
                    // Tính ROI: 5s mỗi click
                    const minutes = Math.round((msg.clicks * 5) / 60);
                    if (timeEl) timeEl.innerText = minutes;
                    
                    playSound('accepted');
                }

                if (state.denied !== msg.denied) {
                    const denEl = document.getElementById('val-den');
                    if (denEl) {
                        denEl.innerText = msg.denied;
                        denEl.classList.remove('changed'); void denEl.offsetWidth; denEl.classList.add('changed');
                    }
                    playSound('blocked');
                }
                
                if (weeklyEl && msg.weeklyClicks !== undefined) {
                    weeklyEl.innerText = msg.weeklyClicks;
                }

                isEngineActive = msg.autoClick;
                state.clicks = msg.clicks;
                state.denied = msg.denied;
                state.weeklyClicks = msg.weeklyClicks;
                state.log = msg.log;
                state.backgroundMode = msg.backgroundMode;
                uptimeSeconds = msg.uptime;
                
                // Sync background toggle UI
                const bgToggle = document.getElementById('btn-toggle-background');
                if (bgToggle) bgToggle.checked = !!state.backgroundMode;

                renderLogs();
                updateThreat();
                updateUptimeDisplay();
                
                // Update engine status dot & text
                const dot = document.querySelector('.status-dot');
                if (dot) dot.style.background = isEngineActive ? 'var(--success)' : 'var(--danger)';
                const stext = document.getElementById('status-text');
                if (stext) stext.textContent = (isEngineActive ? 'Engine Active' : 'Engine Paused') + ' v7.3.4';
            } else if (msg.command === 'updateUptime') {
                uptimeSeconds = msg.uptime;
                updateUptimeDisplay();
            }
        });

        // Background Mode Toggle
        const bgBtn = document.getElementById('btn-toggle-background');
        if (bgBtn) {
            bgBtn.onchange = () => {
                vscode.postMessage({ command: 'toggleBackground' });
            };
        }

        // === RENDER LOGS ===
        function renderLogs() {
            const list = document.getElementById('log-list');
            list.innerHTML = '';
            if (state.log.length === 0) {
                list.innerHTML = '<div style="padding:2rem;text-align:center;color:var(--text-muted);font-size:.85rem;border:1px dashed rgba(255,255,255,0.08);border-radius:8px;margin:5px">No logs recorded yet.</div>';
                return;
            }
            state.log.slice(0, 30).forEach((item, i) => {
                const div = document.createElement('div');
                div.className = 'log-item ' + (item.status === 'denied' ? 'denied' : 'accepted');
                
                div.innerHTML = \`
                    <div class="log-main">
                        <span class="log-time">\${item.t}</span>
                        <span class="log-cmd">\${item.cmd}</span>
                        <span class="log-status">\${item.status === 'denied' ? 'Blocked' : 'Allowed'}</span>
                    </div>
                    <div class="log-details">
                        <p><strong>Reason:</strong> \${item.status === 'denied' ? 'Command matched a restricted pattern in the Protection Shield.' : (item.details || 'Target detected and auto-clicked as expected.')}</p>
                        <p><strong>Impact:</strong> \${item.status === 'denied' ? 'Prevented potential system instability or data loss.' : 'Workflow automation continued successfully.'}</p>
                    </div>
                \`;

                // Chỉ cho phép toggle khi bấm vào phần tiêu đề (main)
                div.querySelector('.log-main').onclick = (e) => {
                    e.stopPropagation();
                    div.classList.toggle('expanded');
                };
                
                list.appendChild(div);
            });
        }

        // === RENDER DENY LIST ===
        let searchFilter = '';
        function highlight(text) {
            if (!searchFilter) return text;
            const re = new RegExp('(' + searchFilter.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&') + ')', 'gi');
            return text.replace(re, '<mark class="search-highlight">$1</mark>');
        }

        function renderDenyList() {
            const grid = document.getElementById('deny-list');
            grid.innerHTML = '';
            const filter = searchFilter.toLowerCase();
            state.denyList.forEach((rule, i) => {
                if (filter && !rule.label.toLowerCase().includes(filter)) return;
                const item = document.createElement('div');
                item.className = 'deny-item custom';
                item.innerHTML = '<div class="deny-info"><span class="deny-badge badge-custom">Custom</span><span class="deny-label">' + highlight(rule.label) + '</span></div><button class="btn-remove" onclick="removeRule(' + i + ',this)" data-tip="Remove"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M18 6L6 18M6 6l12 12"/></svg></button>';
                grid.appendChild(item);
            });
            builtIn.forEach(rule => {
                if (filter && !rule.label.toLowerCase().includes(filter)) return;
                const item = document.createElement('div');
                item.className = 'deny-item system';
                item.innerHTML = '<div class="deny-info"><span class="deny-badge badge-system">System</span><span class="deny-label">' + highlight(rule.label) + '</span></div>';
                grid.appendChild(item);
            });
        }

        // Shield search
        document.getElementById('shield-search').oninput = (e) => {
            searchFilter = e.target.value;
            renderDenyList();
        };

        window.removeRule = (idx, btn) => {
            const item = btn.closest('.deny-item');
            item.classList.add('removing');
            setTimeout(() => {
                state.denyList.splice(idx, 1);
                vscode.postMessage({ command: 'saveDenyList', list: state.denyList });
                renderDenyList();
            }, 300);
        };

        document.getElementById('btn-add-deny').onclick = () => {
            const label = document.getElementById('new-label').value.trim();
            const pattern = document.getElementById('new-pattern').value.trim();
            if (label && pattern) {
                state.denyList.unshift({ label, pattern });
                vscode.postMessage({ command: 'saveDenyList', list: state.denyList });
                renderDenyList();
                document.getElementById('new-label').value = '';
                document.getElementById('new-pattern').value = '';
                document.getElementById('hint-label').innerText = '';
                document.getElementById('hint-pattern').innerText = '';
            }
        };

        // === ELEMENT PICKER ===
        let isPickingMode = false;
        // Tạo overlay với pointer-events: none để ko chặn click
        const pickerOverlay = document.createElement('div');
        pickerOverlay.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:9999;border:4px dashed var(--primary);background:rgba(99,102,241,0.03);display:none';
        document.body.appendChild(pickerOverlay);

        const pickerBadge = document.createElement('div');
        pickerBadge.style.cssText = 'position:fixed;top:20px;left:50%;transform:translateX(-50%);background:linear-gradient(135deg,#6366f1,#8b5cf6);color:#fff;padding:10px 24px;border-radius:20px;font-weight:700;font-size:13px;z-index:10000;box-shadow:0 10px 30px rgba(99,102,241,0.4);display:none;pointer-events:auto';
        pickerBadge.innerHTML = '🎯 Pick mode (ESC to exit)';
        document.body.appendChild(pickerBadge);

        const pickerHoverBox = document.createElement('div');
        pickerHoverBox.style.cssText = 'position:fixed;pointer-events:none;border:2px solid var(--accent);background:rgba(167,139,250,0.15);z-index:9998;transition:all .1s;display:none;border-radius:4px';
        document.body.appendChild(pickerHoverBox);
        const pickerTooltip = document.getElementById('txa-tooltip'); // Reuse main tooltip

        document.getElementById('btn-pick-element').onclick = (e) => {
            e.preventDefault();
            // Yêu cầu extension bật Global Pick qua CDP
            vscode.postMessage({ command: 'startGlobalPick' });
        };

        // Lắng nghe kết quả pick từ extension gửi về
        window.addEventListener('message', event => {
            const msg = event.data;
            if (msg.command === 'pickedSelector') {
                const inp = document.getElementById('cfg-selector');
                if (inp) {
                    inp.value = msg.selector;
                    inp.style.borderColor = 'var(--success)';
                    setTimeout(() => inp.style.borderColor = '', 1000);
                    // Tự động chuyển qua tab config nếu đang ở tab khác
                    document.querySelector('[data-tab="config"]').click();
                }
            }
        });

        function getCssSelector(el) {
            if (el.id) return '#' + el.id;
            if (el.className && typeof el.className === 'string') {
                const parts = el.className.split(' ').filter(c => c.trim() && !c.includes('active') && !c.includes('hover') && !c.includes('changed'));
                if (parts.length > 0) return '.' + parts.join('.');
            }
            return el.tagName.toLowerCase();
        }

        // Thoát Pick Mode
        function exitPickerMode() {
            isPickingMode = false;
            pickerOverlay.style.display = 'none';
            pickerBadge.style.display = 'none';
            pickerHoverBox.style.display = 'none';
            document.body.style.cursor = 'default';
        }

        document.addEventListener('mousemove', e => {
            if (!isPickingMode) return;
            const target = e.target;
            if (target === document.body || target === document.documentElement || target === pickerBadge || target.closest('.nav-tabs')) {
                pickerHoverBox.style.display = 'none'; return;
            }
            const rect = target.getBoundingClientRect();
            pickerHoverBox.style.display = 'block';
            pickerHoverBox.style.top = rect.top + 'px'; 
            pickerHoverBox.style.left = rect.left + 'px';
            pickerHoverBox.style.width = rect.width + 'px'; 
            pickerHoverBox.style.height = rect.height + 'px';
        });

        document.addEventListener('click', e => {
            if (!isPickingMode) return;
            
            // Ko bắt click nếu bấm vào chính cái badge hoặc các tab điều hướng
            if (e.target === pickerBadge || e.target.closest('.nav-tabs')) {
                if (e.target.closest('.nav-tabs')) exitPickerMode();
                return;
            }

            e.preventDefault(); 
            e.stopPropagation();
            
            const target = e.target;
            const selector = getCssSelector(target);
            const inp = document.getElementById('cfg-selector');
            if (inp) {
                inp.value = selector;
                inp.style.borderColor = 'var(--success)';
                setTimeout(() => inp.style.borderColor = '', 1000);
            }
            
            exitPickerMode();
            document.querySelector('[data-tab="config"]').click();
        }, true);

        document.addEventListener('keydown', e => { 
            if (isPickingMode && e.key === 'Escape') exitPickerMode(); 
        });

        // === AUTO SUGGEST ===
        const labelInp = document.getElementById('new-label');
        const patternInp = document.getElementById('new-pattern');
        const hintLbl = document.getElementById('hint-label');
        const hintPat = document.getElementById('hint-pattern');
        labelInp.oninput = () => {
            const val = labelInp.value.toLowerCase();
            const match = val ? SUGGESTS.find(s => s.label.toLowerCase().startsWith(val)) : null;
            if (match && val !== match.label.toLowerCase()) { hintLbl.innerText = match.label; hintPat.innerText = match.pattern; }
            else { hintLbl.innerText = ''; hintPat.innerText = ''; }
        };
        labelInp.onkeydown = (e) => {
            if (e.key === 'Tab' && hintLbl.innerText) {
                e.preventDefault();
                labelInp.value = hintLbl.innerText; patternInp.value = hintPat.innerText;
                hintLbl.innerText = ''; hintPat.innerText = '';
            }
        };

        // === SAVE CONFIG ===
        document.getElementById('btn-save-cfg').onclick = () => {
            const btn = document.getElementById('btn-save-cfg');
            const orig = btn.innerHTML;
            btn.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="animation:spin 1s linear infinite"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg> Saving...';
            btn.style.opacity = '0.85';
            vscode.postMessage({
                command: 'saveConfig',
                language: document.getElementById('cfg-lang').value,
                autoClick: document.getElementById('cfg-autoclick').checked,
                scanInterval: parseInt(document.getElementById('cfg-interval').value) || 3000,
                idleSeconds: parseInt(document.getElementById('cfg-idle').value) || 5,
                soundEnabled: document.getElementById('cfg-sound').checked,
                customSelector: document.getElementById('cfg-selector').value.trim()
            });
            setTimeout(() => { btn.innerHTML = orig; btn.style.opacity = '1'; }, 700);
        };

        // === LINKS ===
        document.getElementById('star-github').onclick = (e) => { e.preventDefault(); vscode.postMessage({ command: 'openLink', url: 'https://github.com/TXAVLOG/txa-auto-accept' }); };
        document.getElementById('link-github').onclick = (e) => { e.preventDefault(); vscode.postMessage({ command: 'openLink', url: 'https://github.com/TXAVLOG/txa-auto-accept' }); };
        document.getElementById('link-marketplace').onclick = (e) => { e.preventDefault(); vscode.postMessage({ command: 'openLink', url: 'https://marketplace.visualstudio.com/items?itemName=txa-team.txa-auto-accept' }); };
        document.getElementById('btn-clear-log').onclick = () => { vscode.postMessage({ command: 'clearLog' }); };
        document.getElementById('btn-reset-counter').onclick = () => {
            state.clicks = 0; state.denied = 0;
            document.getElementById('val-acc').innerText = '0';
            document.getElementById('val-den').innerText = '0';
            vscode.postMessage({ command: 'resetCounter' });
            updateThreat();
        };

        document.getElementById('btn-test-sound').onclick = () => playSound('accepted');

        // Init
        renderLogs();
        renderDenyList();
        updateThreat();
    `;
};

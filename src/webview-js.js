module.exports = function getJS(state, BUILTIN_DENY, suggestions) {
    return `
        const vscode = acquireVsCodeApi();
        let state = ${JSON.stringify(state)};
        const builtIn = ${JSON.stringify(BUILTIN_DENY)};
        const SUGGESTS = ${JSON.stringify(suggestions)};
        const startTime = Date.now();

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

        // === UPTIME TICKER ===
        setInterval(() => {
            const diff = Math.floor((Date.now() - startTime) / 1000);
            const h = String(Math.floor(diff / 3600)).padStart(2, '0');
            const m = String(Math.floor((diff % 3600) / 60)).padStart(2, '0');
            const s = String(diff % 60).padStart(2, '0');
            document.getElementById('uptime-display').textContent = '⏱ ' + h + ':' + m + ':' + s;
        }, 1000);

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
                const denEl = document.getElementById('val-den');
                if (state.clicks !== msg.clicks) {
                    accEl.innerText = msg.clicks;
                    accEl.classList.remove('changed'); void accEl.offsetWidth; accEl.classList.add('changed');
                }
                if (state.denied !== msg.denied) {
                    denEl.innerText = msg.denied;
                    denEl.classList.remove('changed'); void denEl.offsetWidth; denEl.classList.add('changed');
                }
                state.clicks = msg.clicks;
                state.denied = msg.denied;
                state.log = msg.log;
                renderLogs();
                updateThreat();
            }
        });

        // === RENDER LOGS ===
        function renderLogs() {
            const list = document.getElementById('log-list');
            list.innerHTML = '';
            if (state.log.length === 0) {
                list.innerHTML = '<div style="padding:2rem;text-align:center;color:var(--text-muted);font-size:.85rem;border:1px dashed rgba(255,255,255,0.08);border-radius:8px;margin:5px">No logs recorded yet.</div>';
                return;
            }
            state.log.slice(0, 30).forEach(item => {
                const div = document.createElement('div');
                div.className = 'log-item ' + (item.status === 'denied' ? 'denied' : 'accepted');
                div.innerHTML = '<span class="log-time">' + item.t + '</span><span class="log-cmd">' + item.cmd + '</span><span class="log-status">' + (item.status === 'denied' ? 'Blocked' : 'Allowed') + '</span>';
                list.insertBefore(div, list.firstChild);
            });
        }

        // === RENDER DENY LIST ===
        let searchFilter = '';
        function renderDenyList() {
            const grid = document.getElementById('deny-list');
            grid.innerHTML = '';
            const filter = searchFilter.toLowerCase();
            state.denyList.forEach((rule, i) => {
                if (filter && !rule.label.toLowerCase().includes(filter)) return;
                const item = document.createElement('div');
                item.className = 'deny-item custom';
                item.innerHTML = '<div class="deny-info"><span class="deny-badge badge-custom">Custom</span><span class="deny-label">' + rule.label + '</span></div><button class="btn-remove" onclick="removeRule(' + i + ',this)" data-tip="Remove"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M18 6L6 18M6 6l12 12"/></svg></button>';
                grid.appendChild(item);
            });
            builtIn.forEach(rule => {
                if (filter && !rule.label.toLowerCase().includes(filter)) return;
                const item = document.createElement('div');
                item.className = 'deny-item system';
                item.innerHTML = '<div class="deny-info"><span class="deny-badge badge-system">System</span><span class="deny-label">' + rule.label + '</span></div>';
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
        const pickerOverlay = document.createElement('div');
        pickerOverlay.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:9999;border:2px dashed var(--primary);background:rgba(99,102,241,0.03);display:none';
        document.body.appendChild(pickerOverlay);
        const pickerBadge = document.createElement('div');
        pickerBadge.style.cssText = 'position:fixed;top:20px;left:50%;transform:translateX(-50%);background:linear-gradient(135deg,#6366f1,#8b5cf6);color:#fff;padding:10px 24px;border-radius:20px;font-weight:700;font-size:13px;z-index:10000;box-shadow:0 10px 30px rgba(99,102,241,0.4);display:none';
        pickerBadge.innerHTML = '🎯 Pick mode (ESC to exit)';
        document.body.appendChild(pickerBadge);
        const pickerHoverBox = document.createElement('div');
        pickerHoverBox.style.cssText = 'position:fixed;pointer-events:none;border:2px solid var(--accent);background:rgba(167,139,250,0.15);z-index:9998;transition:all .1s;display:none;border-radius:4px';
        document.body.appendChild(pickerHoverBox);
        const pickerTooltip = document.createElement('div');
        pickerTooltip.style.cssText = 'position:fixed;pointer-events:none;background:rgba(10,15,30,0.95);color:var(--text-main);font-family:monospace;font-size:11px;padding:4px 8px;border-radius:6px;z-index:10001;border:1px solid var(--glass-border);display:none';
        document.body.appendChild(pickerTooltip);

        document.getElementById('btn-pick-element').onclick = () => {
            isPickingMode = true;
            pickerOverlay.style.display = 'block';
            pickerBadge.style.display = 'block';
            document.body.style.cursor = 'crosshair';
        };

        function getCssSelector(el) {
            if (el.id) return '#' + el.id;
            if (el.className && typeof el.className === 'string') {
                const parts = el.className.split(' ').filter(c => c.trim() && !c.includes('active') && !c.includes('hover'));
                if (parts.length > 0) return '.' + parts.join('.');
            }
            return el.tagName.toLowerCase();
        }

        document.addEventListener('mousemove', e => {
            if (!isPickingMode) return;
            const target = e.target;
            if (target === document.body || target === document.documentElement || target === pickerBadge) {
                pickerHoverBox.style.display = 'none'; pickerTooltip.style.display = 'none'; return;
            }
            const rect = target.getBoundingClientRect();
            pickerHoverBox.style.display = 'block';
            pickerHoverBox.style.top = rect.top + 'px'; pickerHoverBox.style.left = rect.left + 'px';
            pickerHoverBox.style.width = rect.width + 'px'; pickerHoverBox.style.height = rect.height + 'px';
            pickerTooltip.style.display = 'block';
            pickerTooltip.innerText = getCssSelector(target);
            pickerTooltip.style.top = (e.clientY + 20) + 'px'; pickerTooltip.style.left = (e.clientX + 20) + 'px';
        });

        document.addEventListener('click', e => {
            if (!isPickingMode) return;
            e.preventDefault(); e.stopPropagation();
            const target = e.target;
            if (target === document.body || target === document.documentElement || target === pickerBadge) return;
            document.getElementById('cfg-selector').value = getCssSelector(target);
            exitPickerMode();
            const inp = document.getElementById('cfg-selector');
            inp.style.borderColor = 'var(--success)';
            setTimeout(() => inp.style.borderColor = '', 1000);
            document.querySelector('[data-tab="config"]').click();
        }, true);

        document.addEventListener('keydown', e => { if (isPickingMode && e.key === 'Escape') exitPickerMode(); });
        function exitPickerMode() {
            isPickingMode = false;
            pickerOverlay.style.display = 'none'; pickerBadge.style.display = 'none';
            pickerHoverBox.style.display = 'none'; pickerTooltip.style.display = 'none';
            document.body.style.cursor = 'default';
        }

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

        // Init
        renderLogs();
        renderDenyList();
        updateThreat();
    `;
};

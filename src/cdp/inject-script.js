(function () {
    "use strict";
    if (typeof window === 'undefined') return;

    // ── UTILS ──────────────────────────────────────────────────────────────────
    const log = (msg) => console.log(`[TXA] ${msg}`);

    const getDocuments = (root = document) => {
        let docs = [root];
        try {
            const frames = root.querySelectorAll('iframe, frame');
            for (const f of frames) {
                try {
                    const d = f.contentDocument || f.contentWindow?.document;
                    if (d) docs.push(...getDocuments(d));
                } catch (e) { }
            }
        } catch (e) { }
        return docs;
    };

    const queryAll = (selector) => {
        const results = [];
        getDocuments().forEach(doc => {
            try { results.push(...Array.from(doc.querySelectorAll(selector))); } catch (e) { }
        });
        return results;
    };

    // ── BANNED COMMAND CHECK ───────────────────────────────────────────────────
    function findNearbyCommandText(el) {
        let text = '';
        let container = el.parentElement;
        for (let depth = 0; depth < 10 && container; depth++) {
            let sib = container.previousElementSibling;
            for (let sc = 0; sib && sc < 5; sc++, sib = sib.previousElementSibling) {
                ['pre', 'code', 'pre code'].forEach(s => {
                    sib.querySelectorAll(s).forEach(el => {
                        const t = el.textContent?.trim();
                        if (t && t.length < 5000) text += ' ' + t;
                    });
                });
                if (text.length > 10) break;
            }
            if (text.length > 10) break;
            container = container.parentElement;
        }
        return text.trim().toLowerCase();
    }

    function isCommandBanned(commandText, bannedList) {
        if (!bannedList?.length || !commandText) return false;
        const lower = commandText.toLowerCase();
        for (const pattern of bannedList) {
            const p = pattern.trim();
            if (!p) continue;
            try {
                if (p.startsWith('/') && p.lastIndexOf('/') > 0) {
                    const last = p.lastIndexOf('/');
                    const re = new RegExp(p.slice(1, last), p.slice(last + 1) || 'i');
                    if (re.test(commandText)) return true;
                } else {
                    if (lower.includes(p.toLowerCase())) return true;
                }
            } catch (e) {
                if (lower.includes(p.toLowerCase())) return true;
            }
        }
        return false;
    }

    // ── ACCEPT BUTTON DETECTION ────────────────────────────────────────────────
    const ACCEPT_PATTERNS = ['run', 'retry', 'apply', 'execute', 'confirm', 'allow once', 'always allow', 'allow', 'accept'];
    const REJECT_PATTERNS = ['skip', 'reject', 'cancel', 'close', 'refine', 'always run', 'deny', 'accept all', 'reject all'];

    function isAcceptButton(el) {
        if (!el?.textContent) return false;
        const text = el.textContent.trim().toLowerCase();

        // 1. Kiểm tra text cơ bản
        if (text.length === 0 || text.length > 50) return false;
        if (REJECT_PATTERNS.some(r => text.includes(r))) return false;
        if (!ACCEPT_PATTERNS.some(p => text.includes(p))) return false;

        // 2. Bỏ qua các thành phần UI gây nhiễu
        if (el.getAttribute('aria-haspopup') === 'listbox') return false;
        if (el.id?.includes('headlessui-listbox')) return false;
        if (el.closest('[aria-haspopup="listbox"], [id*="headlessui-listbox"]')) return false;

        // 3. Kiểm tra hiển thị
        const style = window.getComputedStyle(el);
        const rect = el.getBoundingClientRect();
        if (style.display === 'none' || rect.width === 0 || style.pointerEvents === 'none' || el.disabled) return false;

        // 4. KIỂM TRA NGỮ CẢNH (Rất quan trọng)
        // Nếu là nút "Run", "Execute" hoặc "Accept/Apply" mà dùng default scan
        // thì BẮT BUỘC phải có command text ở gần đó thì mới bấm.
        const cmdText = findNearbyCommandText(el);
        const hasCommandNearby = cmdText.length > 0;

        // Ưu tiên các nút "Run" thực sự trong hộp thoại lệnh
        if ((text === 'run' || text === 'execute' || text === 'accept' || text === 'apply' || text === 'allow' || text === 'accept all') && !hasCommandNearby) {
            // Nếu không có command gần đó, có thể đây chỉ là nút toolbar bình thường -> bỏ qua
            return false;
        }

        // Kiểm tra danh sách cấm (Deny List)
        if (hasCommandNearby) {
            const bannedList = window.__txaBannedList || [];
            if (isCommandBanned(cmdText, bannedList)) {
                log(`[BANNED] Skipping: "${text}" — command blocked`);
                return false;
            }
        }

        return true;
    }

    // ── CLICK LOOP ─────────────────────────────────────────────────────────────
    function isElementVisible(el) {
        if (!el?.isConnected) return false;
        const s = window.getComputedStyle(el);
        const r = el.getBoundingClientRect();
        return s.display !== 'none' && r.width > 0 && s.visibility !== 'hidden';
    }

    function waitForDisappear(el, timeout = 500) {
        return new Promise(resolve => {
            const start = Date.now();
            const check = () => {
                if (!isElementVisible(el)) return resolve(true);
                if (Date.now() - start >= timeout) return resolve(false);
                requestAnimationFrame(check);
            };
            setTimeout(check, 50);
        });
    }

    async function scrollToBottom() {
        const btns = queryAll('button[aria-label="Scroll to bottom"]');
        let clicked = 0;
        for (const btn of btns) {
            const s = window.getComputedStyle(btn);
            const r = btn.getBoundingClientRect();
            if (s.display !== 'none' && r.width > 0 && s.pointerEvents !== 'none') {
                btn.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
                clicked++;
            }
        }
        if (clicked > 0) await new Promise(r => setTimeout(r, 300));
    }

    async function performClick(selectors) {
        const found = new Set();
        // Thêm custom selector của người dùng vào danh sách quét
        const allSelectors = [...selectors];
        if (window.__txaCustomSelector) allSelectors.push(window.__txaCustomSelector);

        allSelectors.forEach(s => {
            if (!s) return;
            queryAll(s).forEach(el => found.add(el));
        });

        let clickCount = 0;
        for (const el of found) {
            if (isAcceptButton(el)) {
                const btnText = el.textContent.trim();
                const cmdContext = findNearbyCommandText(el);

                log(`Clicking: "${btnText}"`);
                el.dispatchEvent(new MouseEvent('click', { view: window, bubbles: true, cancelable: true }));
                clickCount++;

                const ok = await waitForDisappear(el);
                if (ok) {
                    window.__txaStats = window.__txaStats || { clicks: 0, events: [] };
                    window.__txaStats.clicks++;
                    // Lưu lại chi tiết sự kiện
                    window.__txaStats.events.push({
                        btn: btnText,
                        cmd: cmdContext ? (cmdContext.length > 50 ? cmdContext.substring(0, 50) + "..." : cmdContext) : "UI Interaction",
                        t: new Date().toLocaleTimeString('vi-VN', { hour12: false })
                    });
                    log(`Verified: "${btnText}" (total: ${window.__txaStats.clicks})`);
                }
            }
        }
        return clickCount;
    }

    // ── PICKER SYSTEM (GLOBAL) ───────────────────────────────────────────────
    let isPickMode = false;
    let hoverBox, pickerBadge;

    function initPickerUI() {
        if (hoverBox) return;
        hoverBox = document.createElement('div');
        hoverBox.style.cssText = 'position:fixed;pointer-events:none;border:2px solid #6366f1;background:rgba(99,102,241,0.1);z-index:2147483647;display:none;border-radius:3px;transition:all 0.05s';

        pickerBadge = document.createElement('div');
        pickerBadge.style.cssText = 'position:fixed;top:10px;left:50%;transform:translateX(-50%);background:linear-gradient(135deg,#6366f1,#a78bfa);color:white;padding:6px 16px;border-radius:20px;font-family:sans-serif;font-size:12px;font-weight:bold;z-index:2147483647;box-shadow:0 4px 15px rgba(0,0,0,0.3);display:none';
        pickerBadge.innerText = '🎯 TXA Pick Mode (ESC to cancel)';

        document.body.appendChild(hoverBox);
        document.body.appendChild(pickerBadge);
    }

    function getSelector(el) {
        if (el.id) return '#' + el.id;
        if (el.className && typeof el.className === 'string') {
            const cls = el.className.split(/\s+/).filter(c => c && !c.includes('hover') && !c.includes('active')).join('.');
            if (cls) return el.tagName.toLowerCase() + '.' + cls;
        }
        return el.tagName.toLowerCase();
    }

    const onMove = (e) => {
        if (!isPickMode) return;
        const target = e.target;
        if (!target || target === document.body || target === document.documentElement) return;
        const rect = target.getBoundingClientRect();
        hoverBox.style.display = 'block';
        hoverBox.style.top = rect.top + 'px';
        hoverBox.style.left = rect.left + 'px';
        hoverBox.style.width = rect.width + 'px';
        hoverBox.style.height = rect.height + 'px';
    };

    const onClick = (e) => {
        if (!isPickMode) return;
        e.preventDefault();
        e.stopPropagation();
        window.__txaPickedSelector = getSelector(e.target);
        log(`Picked: ${window.__txaPickedSelector}`);
        window.__txaSetPickMode(false);
    };

    const onKey = (e) => {
        if (isPickMode && e.key === 'Escape') window.__txaSetPickMode(false);
    };

    window.__txaSetPickMode = function (val) {
        isPickMode = val;
        initPickerUI();
        if (val) {
            pickerBadge.style.display = 'block';
            document.body.style.cursor = 'crosshair';
            window.addEventListener('mousemove', onMove, true);
            window.addEventListener('click', onClick, true);
            window.addEventListener('keydown', onKey, true);
        } else {
            hoverBox.style.display = 'none';
            pickerBadge.style.display = 'none';
            document.body.style.cursor = 'default';
            window.removeEventListener('mousemove', onMove, true);
            window.removeEventListener('click', onClick, true);
            window.removeEventListener('keydown', onKey, true);
        }
    };

    window.__txaGetPickedSelector = function () {
        const s = window.__txaPickedSelector;
        window.__txaPickedSelector = null;
        return s;
    };

    // ── LIFECYCLE ──────────────────────────────────────────────────────────────
    window.__txaStart = async function (config) {
        if (window.__txaRunning) {
            log('Already running, updating config...');
            if (config.bannedList) window.__txaBannedList = config.bannedList;
            if (config.customSelector) window.__txaCustomSelector = config.customSelector;
            return;
        }

        window.__txaRunning = true;
        window.__txaStats = window.__txaStats || { clicks: 0, events: [] };
        window.__txaBannedList = config.bannedList || [];
        window.__txaCustomSelector = config.customSelector || '';
        const interval = config.pollInterval || 1000;

        log(`Started (pollInterval=${interval}ms, selector=${window.__txaCustomSelector})`);

        while (window.__txaRunning) {
            try {
                await scrollToBottom();
                await performClick(['button', '[class*="button" i]', '[class*="anysphere" i]']);
            } catch (e) {
                log(`Loop error: ${e.message}`);
            }
            await new Promise(r => setTimeout(r, interval));
        }
        log('Stopped.');
    };

    window.__txaStop = function () {
        window.__txaRunning = false;
        log('Stop signal sent.');
    };

    window.__txaGetStats = function () {
        const stats = JSON.stringify(window.__txaStats || { clicks: 0, events: [] });
        // Xóa log sau khi lấy để tránh bộ nhớ đầy và trùng lặp
        if (window.__txaStats) window.__txaStats.events = [];
        return stats;
    };

    log('Inject script loaded.');
})();

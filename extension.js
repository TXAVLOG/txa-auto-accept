'use strict';

const vscode = require('vscode');
const fs = require('fs');
const path = require('path');
const { getWebviewContent } = require('./src/webview');
const i18n = require('./src/i18n');
const { CDPHandler } = require('./src/cdp/cdp-handler');
const { Relauncher } = require('./src/cdp/relauncher');

let activePanel = null;
let cdpHandler = null;
let cdpScanTimer = null;
let relauncher = null;

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
    const config = vscode.workspace.getConfiguration('txa-auto-accept');
    const lang = config.get('language', 'en');
    const t = i18n[lang] || i18n.en;

    const VERSION = 'v7.0.0';
    vscode.window.showInformationMessage(t.startupMsg.replace('{0}', VERSION));

    // ── AUDIO ────────────────────────────────────────────────────────────────
    function getAudioData() {
        try {
            const audioPath = path.join(context.extensionPath, 'src', 'assets', 'notify.mp3');
            if (fs.existsSync(audioPath)) {
                return `data:audio/mp3;base64,${fs.readFileSync(audioPath).toString('base64')}`;
            }
        } catch (e) { }
        return null;
    }

    // ── STATUS BAR ───────────────────────────────────────────────────────────
    let statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 101);
    statusBarItem.command = 'txa-auto-accept.openDashboard';
    context.subscriptions.push(statusBarItem);

    // ── STATE ─────────────────────────────────────────────────────────────────
    let state = {
        clicks: context.globalState.get('clicks', 0),
        denied: context.globalState.get('denied', 0),
        log: context.globalState.get('log', []),
        denyList: context.globalState.get('denyList', []),
        uptime: context.globalState.get('uptime', 0),
        // ROI Stats
        weeklyClicks: context.globalState.get('weeklyClicks', 0),
        weekStart: context.globalState.get('weekStart', Date.now()),
        timeSavedMinutes: 0,
        backgroundMode: context.globalState.get('backgroundMode', false),
        _cdpLastClicks: 0
    };

    function updateROI() {
        const SECONDS_PER_CLICK = 5;
        state.timeSavedMinutes = Math.round((state.clicks * SECONDS_PER_CLICK) / 60);
        
        // Reset hàng tuần
        const now = Date.now();
        const oneWeek = 7 * 24 * 60 * 60 * 1000;
        if (now - state.weekStart > oneWeek) {
            state.weeklyClicks = 0;
            state.weekStart = now;
            context.globalState.update('weekStart', now);
        }
    }

    function updateStatusBar() {
        const cfg = vscode.workspace.getConfiguration('txa-auto-accept');
        const autoClick = cfg.get('autoClick', true);
        const currentLang = cfg.get('language', 'en');
        const currentT = i18n[currentLang] || i18n.en;
        const cdpCount = cdpHandler ? cdpHandler.getConnectionCount() : 0;
        
        updateROI();

        statusBarItem.text = `$(shield) TXA: ${state.clicks}✓ ${state.denied}✗ ${state.backgroundMode ? '$(globe)' : ''}${cdpCount > 0 ? ` $(plug)${cdpCount}` : ''}`;
        
        // Màu sắc linh hoạt: Xanh khi chạy, Đỏ khi tắt, Tím khi Background Mode
        if (!autoClick) {
            statusBarItem.color = '#f43f5e'; // Red
        } else if (state.backgroundMode) {
            statusBarItem.color = '#a78bfa'; // Purple
        } else {
            statusBarItem.color = '#22d3ee'; // Cyan
        }

        statusBarItem.tooltip = `${currentT.statusBarTooltip.replace('{0}', VERSION)}\n${state.timeSavedMinutes} minutes saved\n${cdpCount > 0 ? currentT.cdpConnected.replace('{0}', cdpCount) : currentT.cdpNotConnected}`;
        statusBarItem.show();

        if (activePanel) {
            activePanel.webview.postMessage({
                command: 'updateStats',
                clicks: state.clicks,
                denied: state.denied,
                log: state.log,
                autoClick: autoClick,
                uptime: state.uptime,
                cdpConnections: cdpCount,
                weeklyClicks: state.weeklyClicks,
                timeSavedMinutes: state.timeSavedMinutes,
                backgroundMode: state.backgroundMode
            });
        }
    }

    // ── UPTIME TICKER ─────────────────────────────────────────────────────────
    setInterval(() => {
        const cfg = vscode.workspace.getConfiguration('txa-auto-accept');
        if (cfg.get('autoClick', true)) {
            state.uptime++;
            context.globalState.update('uptime', state.uptime);
            if (activePanel) {
                activePanel.webview.postMessage({ command: 'updateUptime', uptime: state.uptime });
            }
        }
    }, 1000);

    updateStatusBar();

    // ── HANDLE ACTION ─────────────────────────────────────────────────────────
    function handleAction(type, cmd, details) {
        const time = new Date().toLocaleTimeString('vi-VN', { hour12: false });
        if (type === 'acc') {
            state.clicks++;
            state.weeklyClicks++;
            context.globalState.update('weeklyClicks', state.weeklyClicks);
            state.log.unshift({ t: time, cmd: cmd || 'Auto-Accepted', status: 'accepted', details: details });
        } else {
            state.denied++;
            state.log.unshift({ t: time, cmd: cmd || 'Blocked', status: 'denied', details: details });
        }
        if (state.log.length > 50) state.log.pop();
        context.globalState.update('clicks', state.clicks);
        context.globalState.update('denied', state.denied);
        context.globalState.update('log', state.log);
        updateStatusBar();
    }

    vscode.commands.registerCommand('txa-auto-accept.simulateAction', handleAction);

    // ── DENY LIST HELPERS ─────────────────────────────────────────────────────
    function parseRegex(pattern) {
        try {
            if (pattern.startsWith('/') && pattern.lastIndexOf('/') > 0) {
                const body = pattern.substring(1, pattern.lastIndexOf('/'));
                const flags = pattern.substring(pattern.lastIndexOf('/') + 1);
                return new RegExp(body, flags);
            }
            return new RegExp(pattern, 'i');
        } catch (e) { return new RegExp('.^'); }
    }

    function checkDenyList(actionText) {
        const { BUILTIN_DENY } = require('./src/constants');
        const customRules = state.denyList || [];
        for (const rule of [...customRules, ...BUILTIN_DENY]) {
            if (parseRegex(rule.pattern).test(actionText)) return true;
        }
        return false;
    }

    // ── BUILD CDP CONFIG ──────────────────────────────────────────────────────
    function buildCDPConfig() {
        const cfg = vscode.workspace.getConfiguration('txa-auto-accept');
        return {
            pollInterval: cfg.get('scanInterval', 1000),
            bannedList: (state.denyList || []).map(r => r.pattern),
            customSelector: cfg.get('customSelector', ''),
            backgroundMode: state.backgroundMode
        };
    }

    // ── CDP ENGINE ────────────────────────────────────────────────────────────
    function startCDPEngine() {
        const cfg = vscode.workspace.getConfiguration('txa-auto-accept');
        if (!cfg.get('autoClick', true)) { stopCDPEngine(); return; }

        if (!cdpHandler) {
            cdpHandler = new CDPHandler((msg) => console.log(msg));
        }
        if (!relauncher) {
            const currentT = i18n[vscode.workspace.getConfiguration('txa-auto-accept').get('language', 'en')] || i18n.en;
            relauncher = new Relauncher((msg) => console.log(msg), currentT);
        }

        // Kiểm tra CDP available, nếu không thì tự setup shortcut
        cdpHandler.isCDPAvailable().then(async (available) => {
            if (available) {
                await cdpHandler.start(buildCDPConfig());
                updateStatusBar();
            } else {
                console.log('[TXA] CDP not available, running auto-setup...');
                try {
                    await relauncher.ensureCDPAndRelaunch();
                } catch (e) {
                    console.warn('[TXA] Relauncher failed:', e.message);
                }
            }
        }).catch(() => { });

        if (!cdpScanTimer) {
            cdpScanTimer = setInterval(async () => {
                const innerCfg = vscode.workspace.getConfiguration('txa-auto-accept');
                if (!innerCfg.get('autoClick', true)) return;
                try {
                    const available = await cdpHandler.isCDPAvailable();
                    if (available) {
                        await cdpHandler.start(buildCDPConfig());

                        // Sync CDP events vào state TXA
                        const stats = await cdpHandler.getStats();
                        if (stats.events && stats.events.length > 0) {
                            stats.events.forEach(ev => {
                                handleAction('acc', `Clicked [${ev.btn}]`, `Target: ${ev.cmd}`);
                            });
                        }
                    }
                    updateStatusBar();
                } catch (e) { }
            }, 5000);
        }
    }

    function stopCDPEngine() {
        if (cdpScanTimer) { clearInterval(cdpScanTimer); cdpScanTimer = null; }
        if (cdpHandler) { cdpHandler.stop().catch(() => { }); }
        updateStatusBar();
    }

    // ── TERMINAL MONITOR ─────────────────────────────────────────────────────
    function startTerminalMonitor() {
        try {
            if (typeof vscode.window.onDidWriteTerminalData === 'function') {
                context.subscriptions.push(vscode.window.onDidWriteTerminalData(e => {
                    const cfg = vscode.workspace.getConfiguration('txa-auto-accept');
                    if (!cfg.get('autoClick', true)) return;
                    const data = e.data;
                    if (/\[[Yy]\/[Nn]\]|\([Yy]\/[Nn]\)|\? \(Y\/n\)/.test(data)) {
                        setTimeout(() => {
                            e.terminal.sendText('y');
                            handleAction('acc', `Auto-Accepted Terminal Prompt in ${e.terminal.name}`);
                        }, 500);
                    }
                    if (checkDenyList(data)) {
                        handleAction('den', `Shield Blocked Threat in: ${e.terminal.name}`);
                        const currentT = i18n[vscode.workspace.getConfiguration('txa-auto-accept').get('language', 'en')] || i18n.en;
                        vscode.window.showWarningMessage(`🛡️ TXA Shield: Detected threat in ${e.terminal.name}!`);
                    }
                }));
            }
        } catch (err) {
            console.warn('[TXA] Terminal monitor error:', err.message);
        }
    }

    // ── START ─────────────────────────────────────────────────────────────────
    startTerminalMonitor();
    startCDPEngine();

    // ── DASHBOARD ─────────────────────────────────────────────────────────────
    let disposable = vscode.commands.registerCommand('txa-auto-accept.openDashboard', function () {
        if (activePanel) { activePanel.reveal(vscode.ViewColumn.One); return; }

        activePanel = vscode.window.createWebviewPanel(
            'txaDashboard',
            'TXA AUTO ACCEPT — Liquid Glass',
            vscode.ViewColumn.One,
            { enableScripts: true, retainContextWhenHidden: true }
        );

        const cfg = vscode.workspace.getConfiguration('txa-auto-accept');
        const suggestions = require('./src/suggestions');
        activePanel.webview.html = getWebviewContent(cfg, state, suggestions, getAudioData());

        activePanel.onDidDispose(() => { activePanel = null; }, null, context.subscriptions);

        activePanel.webview.onDidReceiveMessage(message => {
            const cfg = vscode.workspace.getConfiguration('txa-auto-accept');
            switch (message.command) {
                case 'saveConfig':
                    cfg.update('autoClick', message.autoClick, vscode.ConfigurationTarget.Global)
                        .then(() => cfg.update('scanInterval', message.scanInterval, vscode.ConfigurationTarget.Global))
                        .then(() => cfg.update('language', message.language, vscode.ConfigurationTarget.Global))
                        .then(() => cfg.update('idleSeconds', message.idleSeconds, vscode.ConfigurationTarget.Global))
                        .then(() => cfg.update('customSelector', message.customSelector, vscode.ConfigurationTarget.Global))
                        .then(() => {
                            const currentT = i18n[message.language || 'en'] || i18n.en;
                            vscode.window.showInformationMessage(currentT.configUpdated);
                        });
                    return;
                case 'startGlobalPick':
                    if (cdpHandler) {
                        const currentT = i18n[cfg.get('language', 'en')] || i18n.en;
                        // Focus sang IDE editor để user có thể hover/click trong IDE window
                        // (countdown 3s trong inject-script cho phép user chuyển focus)
                        vscode.commands.executeCommand('workbench.action.focusActiveEditorGroup')
                            .then(() => { }, () => { }); // ignore nếu không có editor active
                        cdpHandler.setPickMode(true);
                        vscode.window.showInformationMessage(currentT.globalPickActive);
                    } else {
                        const currentT = i18n[cfg.get('language', 'en')] || i18n.en;
                        vscode.window.showErrorMessage(currentT.cdpNotAvailable);
                    }
                    return;
                case 'saveDenyList':
                    state.denyList = message.list;
                    context.globalState.update('denyList', state.denyList);
                    if (cdpHandler) cdpHandler.updateConfig(buildCDPConfig()).catch(() => { });
                    const currentT = i18n[cfg.get('language', 'en')] || i18n.en;
                    vscode.window.showInformationMessage(currentT.shieldSecured);
                    return;
                case 'resetCounter':
                    vscode.commands.executeCommand('txa-auto-accept.resetCounter');
                    return;
                case 'clearLog':
                    state.log = [];
                    context.globalState.update('log', []);
                    updateStatusBar();
                    return;
                case 'openLink':
                    vscode.env.openExternal(vscode.Uri.parse(message.url));
                    return;
            }
        });
    });

    // Cập nhật timer quét CDP để hỗ trợ lấy selector đã pick
    const origTimer = cdpScanTimer;
    if (cdpScanTimer) clearInterval(cdpScanTimer);
    cdpScanTimer = setInterval(async () => {
        const innerCfg = vscode.workspace.getConfiguration('txa-auto-accept');
        if (!innerCfg.get('autoClick', true)) return;
        try {
            if (cdpHandler) {
                // Kiểm tra xem có selector nào vừa được pick không
                const picked = await cdpHandler.getPickedSelector();
                if (picked && activePanel) {
                    activePanel.webview.postMessage({ command: 'pickedSelector', selector: picked });
                    const currentT = i18n[innerCfg.get('language', 'en')] || i18n.en;
                    vscode.window.showInformationMessage(currentT.selectorCaptured.replace('{0}', picked));
                }

                // Quét thông thường
                const available = await cdpHandler.isCDPAvailable();
                if (available) {
                    await cdpHandler.start(buildCDPConfig());
                    const stats = await cdpHandler.getStats();
                    if (stats.events && stats.events.length > 0) {
                        stats.events.forEach(ev => {
                            handleAction('acc', `Clicked [${ev.btn}]`, `Target: ${ev.cmd}`);
                        });
                    }
                }
            }
            updateStatusBar();
        } catch (e) { }
    }, 2000);

    context.subscriptions.push(disposable);

    context.subscriptions.push(vscode.commands.registerCommand('txa-auto-accept.toggleBackground', () => {
        state.backgroundMode = !state.backgroundMode;
        context.globalState.update('backgroundMode', state.backgroundMode);
        updateStatusBar();
        if (cdpHandler) cdpHandler.updateConfig(buildCDPConfig()).catch(() => { });
        const currentT = i18n[vscode.workspace.getConfiguration('txa-auto-accept').get('language', 'en')] || i18n.en;
        vscode.window.showInformationMessage(state.backgroundMode ? 'Background Mode: ON' : 'Background Mode: OFF');
    }));

    // ── TOGGLE ENGINE ──────────────────────────────────────────────────────────
    context.subscriptions.push(vscode.commands.registerCommand('txa-auto-accept.toggleEngine', () => {
        const cfg = vscode.workspace.getConfiguration('txa-auto-accept');
        const current = cfg.get('autoClick', true);
        cfg.update('autoClick', !current, vscode.ConfigurationTarget.Global).then(() => {
            const currentT = i18n[cfg.get('language', 'en')] || i18n.en;
            if (!current) {
                vscode.window.showInformationMessage(currentT.engineActivated);
                state._cdpLastClicks = state.clicks; // Lưu mốc bắt đầu phiên
            } else {
                // Hiển thị thông báo tổng kết đẹp như ảnh mẫu
                const sessionClicks = state.clicks - (state._cdpLastClicks || 0);
                const msg = `Auto Accept: ${sessionClicks} actions handled this session`;
                vscode.window.showInformationMessage(msg, { detail: 'Source: TXA Auto Accept Agent', modal: false }, 'View Stats').then(selection => {
                    if (selection === 'View Stats') {
                        vscode.window.showInformationMessage(`Bạn đã tiết kiệm được khoảng ${sessionClicks * 5} giây trong phiên vừa qua!`);
                    }
                });
            }
            updateStatusBar();
            if (!current) startCDPEngine(); else stopCDPEngine();
        });
    }));

    // ── RESET COUNTER ──────────────────────────────────────────────────────────
    context.subscriptions.push(vscode.commands.registerCommand('txa-auto-accept.resetCounter', () => {
        state.clicks = 0; state.denied = 0; state.uptime = 0;
        state.log = []; state._cdpLastClicks = 0;
        context.globalState.update('clicks', 0);
        context.globalState.update('denied', 0);
        context.globalState.update('uptime', 0);
        context.globalState.update('log', []);
        updateStatusBar();
        const currentT = i18n[vscode.workspace.getConfiguration('txa-auto-accept').get('language', 'en')] || i18n.en;
        vscode.window.showInformationMessage(currentT.resetSuccess);
    }));

    // ── CONFIG WATCHER ─────────────────────────────────────────────────────────
    context.subscriptions.push(vscode.workspace.onDidChangeConfiguration(e => {
        if (e.affectsConfiguration('txa-auto-accept')) {
            updateStatusBar();
            const cfg = vscode.workspace.getConfiguration('txa-auto-accept');
            if (cfg.get('autoClick', true)) startCDPEngine(); else stopCDPEngine();
            if (activePanel) {
                const suggestions = require('./src/suggestions');
                activePanel.webview.html = getWebviewContent(cfg, state, suggestions, getAudioData());
            }
        }
    }));
}

function deactivate() {
    if (cdpScanTimer) clearInterval(cdpScanTimer);
    if (cdpHandler) cdpHandler.stop().catch(() => { });
}

module.exports = { activate, deactivate };

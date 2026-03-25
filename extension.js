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
let outputChannel = null;

function log(msg) {
    if (outputChannel) {
        outputChannel.appendLine(`[${new Date().toLocaleTimeString()}] ${msg}`);
    }
    console.log(`[TXA] ${msg}`);
}

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
    const config = vscode.workspace.getConfiguration('txa-auto-accept');
    const lang = config.get('language', 'en');
    const t = i18n[lang] || i18n.en;

    const VERSION = 'v7.4.5';
    outputChannel = vscode.window.createOutputChannel("TXA Auto Accept");
    context.subscriptions.push(outputChannel);

    log(t.startupMsg.replace('{0}', VERSION));
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
        weeklyClicks: context.globalState.get('weeklyClicks', 0),
        weekStart: context.globalState.get('weekStart', Date.now()),
        timeSavedMinutes: 0,
        backgroundMode: context.globalState.get('backgroundMode', false),
        _cdpLastClicks: 0
    };

    function updateROI() {
        const SECONDS_PER_CLICK = 5;
        state.timeSavedMinutes = Math.round((state.clicks * SECONDS_PER_CLICK) / 60);
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
        const cdpStatus = cdpCount > 0 ? ` $(plug)${cdpCount}` : (autoClick ? ' $(plug) OFF' : '');
        statusBarItem.text = `$(shield) TXA: ${state.clicks}✓ ${state.denied}✗ ${state.backgroundMode ? '$(globe)' : ''}${cdpStatus}`;
        
        if (!autoClick) {
            statusBarItem.color = '#f43f5e';
        } else if (cdpCount === 0) {
            statusBarItem.color = '#fbbf24'; // Warning if autoClick is on but CDP off
        } else if (state.backgroundMode) {
            statusBarItem.color = '#a78bfa';
        } else {
            statusBarItem.color = '#22d3ee';
        }

        statusBarItem.tooltip = `${currentT.statusBarTooltip.replace('{0}', VERSION)}\n${state.timeSavedMinutes} minutes saved\n${cdpCount > 0 ? currentT.cdpConnected.replace('{0}', cdpCount) : (autoClick ? currentT.cdpNotAvailable : currentT.cdpNotConnected)}`;
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

    // ── CDP ENGINE CONTROL ────────────────────────────────────────────────────
    function buildCDPConfig() {
        const cfg = vscode.workspace.getConfiguration('txa-auto-accept');
        const ide = (vscode.env.appName || '').toLowerCase().includes('antigravity') ? 'antigravity' : 'cursor';
        return {
            pollInterval: cfg.get('scanInterval', 1000),
            bannedList: (state.denyList || []).map(r => r.pattern),
            customSelector: cfg.get('customSelector', ''),
            backgroundMode: state.backgroundMode,
            ide: ide
        };
    }

    async function startCDPEngine() {
        if (!cdpHandler) cdpHandler = new CDPHandler();
        if (!relauncher) relauncher = new Relauncher(log, t, context);

        relauncher.checkCDP().then(async (available) => {
            if (!available) {
                try { await relauncher.ensureCDPAndRelaunch(); } catch (e) { console.warn('[TXA] Relauncher failed:', e.message); }
            }
        }).catch(() => { });

        if (cdpScanTimer) clearInterval(cdpScanTimer);
        cdpScanTimer = setInterval(async () => {
            const cfg = vscode.workspace.getConfiguration('txa-auto-accept');
            if (!cfg.get('autoClick', true)) {
                stopCDPEngine();
                return;
            }
            try {
                if (cdpHandler) {
                    const picked = await cdpHandler.getPickedSelector();
                    if (picked && activePanel) {
                        activePanel.webview.postMessage({ command: 'pickedSelector', selector: picked });
                        const currentT = i18n[cfg.get('language', 'en')] || i18n.en;
                        vscode.window.showInformationMessage(currentT.selectorCaptured.replace('{0}', picked));
                    }
                    if (await cdpHandler.isCDPAvailable()) {
                        await cdpHandler.start(buildCDPConfig());
                        const stats = await cdpHandler.getStats();
                        if (stats.events) {
                            stats.events.forEach(ev => handleAction('acc', `Clicked [${ev.btn}]`, `Target: ${ev.cmd}`));
                        }
                    }
                }
                updateStatusBar();
            } catch (e) { }
        }, 2000);
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
                }));
            }
        } catch (err) { }
    }

    // INITIAL START
    startTerminalMonitor();
    if (vscode.workspace.getConfiguration('txa-auto-accept').get('autoClick', true)) {
        startCDPEngine();
    }
    updateStatusBar();

    // ── DASHBOARD ─────────────────────────────────────────────────────────────
    context.subscriptions.push(vscode.commands.registerCommand('txa-auto-accept.openDashboard', function () {
        if (activePanel) { activePanel.reveal(vscode.ViewColumn.One); return; }

        activePanel = vscode.window.createWebviewPanel(
            'txaDashboard', 'TXA AUTO ACCEPT — Liquid Glass', vscode.ViewColumn.One,
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
                    Promise.all([
                        cfg.update('autoClick', message.autoClick, vscode.ConfigurationTarget.Global),
                        cfg.update('scanInterval', message.scanInterval, vscode.ConfigurationTarget.Global),
                        cfg.update('language', message.language, vscode.ConfigurationTarget.Global),
                        cfg.update('idleSeconds', message.idleSeconds, vscode.ConfigurationTarget.Global),
                        cfg.update('customSelector', message.customSelector, vscode.ConfigurationTarget.Global)
                    ]).then(() => {
                        const currentT = i18n[message.language] || i18n.en;
                        vscode.window.showInformationMessage(currentT.configSaved);
                        updateStatusBar();
                    }).catch(err => {
                        vscode.window.showErrorMessage(`Error saving: ${err.message}`);
                    });
                    return;
                case 'exportRules':
                    vscode.window.showSaveDialog({
                        filters: { 'JSON': ['json'] },
                        defaultUri: vscode.Uri.file('txa-rules-backup.json')
                    }).then(uri => {
                        if (uri) {
                            fs.writeFileSync(uri.fsPath, JSON.stringify(state.denyList, null, 2));
                            const currentT = i18n[cfg.get('language', 'en')] || i18n.en;
                            vscode.window.showInformationMessage(currentT.configSaved); // Or export success msg
                        }
                    });
                    return;
                case 'importRules':
                    vscode.window.showOpenDialog({
                        canSelectHeaders: false, canSelectMany: false,
                        filters: { 'JSON': ['json'] }
                    }).then(uris => {
                        if (uris && uris[0]) {
                            try {
                                const data = JSON.parse(fs.readFileSync(uris[0].fsPath, 'utf8'));
                                if (Array.isArray(data)) {
                                    state.denyList = data;
                                    context.globalState.update('denyList', state.denyList);
                                    if (cdpHandler) cdpHandler.updateConfig(buildCDPConfig()).catch(() => { });
                                    updateStatusBar();
                                    const currentT = i18n[cfg.get('language', 'en')] || i18n.en;
                                    vscode.window.showInformationMessage(currentT.shieldUpdated);
                                }
                            } catch (e) {
                                vscode.window.showErrorMessage(`Invalid file format: ${e.message}`);
                            }
                        }
                    });
                    return;
                case 'startGlobalPick':
                    if (cdpHandler) {
                        vscode.commands.executeCommand('workbench.action.focusActiveEditorGroup');
                        cdpHandler.setPickMode(true);
                    }
                    return;
                case 'saveDenyList':
                    state.denyList = message.list;
                    context.globalState.update('denyList', state.denyList);
                    if (cdpHandler) cdpHandler.updateConfig(buildCDPConfig()).catch(() => { });
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
    }));

    // ── COMMANDS ──────────────────────────────────────────────────────────────
    context.subscriptions.push(vscode.commands.registerCommand('txa-auto-accept.toggleBackground', () => {
        state.backgroundMode = !state.backgroundMode;
        context.globalState.update('backgroundMode', state.backgroundMode);
        updateStatusBar();
        if (cdpHandler) cdpHandler.updateConfig(buildCDPConfig()).catch(() => { });
    }));

    context.subscriptions.push(vscode.commands.registerCommand('txa-auto-accept.toggleEngine', () => {
        const cfg = vscode.workspace.getConfiguration('txa-auto-accept');
        const current = cfg.get('autoClick', true);
        cfg.update('autoClick', !current, vscode.ConfigurationTarget.Global).then(() => {
            if (!current) {
                state._cdpLastClicks = state.clicks;
                startCDPEngine();
            } else {
                stopCDPEngine();
                const sessionClicks = state.clicks - (state._cdpLastClicks || 0);
                vscode.window.showInformationMessage(`Auto Accept Paused: ${sessionClicks} actions handled.`);
            }
            updateStatusBar();
        });
    }));

    context.subscriptions.push(vscode.commands.registerCommand('txa-auto-accept.resetCounter', () => {
        state.clicks = 0; state.denied = 0; state.uptime = 0; state.log = [];
        context.globalState.update('clicks', 0); context.globalState.update('denied', 0);
        context.globalState.update('uptime', 0); context.globalState.update('log', []);
        updateStatusBar();
    }));

    context.subscriptions.push(vscode.commands.registerCommand('txa-auto-accept.setupCDP', () => {
        if (!relauncher) relauncher = new Relauncher(log, t, context);
        relauncher.ensureCDPAndRelaunch();
    }));

    // ── CONFIG WATCHER ─────────────────────────────────────────────────────────
    context.subscriptions.push(vscode.workspace.onDidChangeConfiguration(e => {
        if (e.affectsConfiguration('txa-auto-accept')) {
            const cfg = vscode.workspace.getConfiguration('txa-auto-accept');
            if (cfg.get('autoClick', true)) startCDPEngine(); else stopCDPEngine();
            updateStatusBar();
        }
    }));
}

function deactivate() {
    if (cdpScanTimer) clearInterval(cdpScanTimer);
    if (cdpHandler) cdpHandler.stop().catch(() => { });
}

module.exports = { activate, deactivate };

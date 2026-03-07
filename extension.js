const vscode = require('vscode');
const { getWebviewContent } = require('./src/webview');
const i18n = require('./src/i18n');

let activePanel = null;

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
    const config = vscode.workspace.getConfiguration('txa-auto-accept');
    const lang = config.get('language', 'vi');
    const t = i18n[lang] || i18n.en;

    // Startup notification
    vscode.window.showInformationMessage(t.startupMsg);

    let statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 101);
    statusBarItem.command = 'txa-auto-accept.openDashboard';
    context.subscriptions.push(statusBarItem);

    // Initial state from memento
    let state = {
        clicks: context.globalState.get('clicks', 0),
        denied: context.globalState.get('denied', 0),
        log: context.globalState.get('log', []),
        denyList: context.globalState.get('denyList', [])
    };

    function updateStatusBar() {
        const config = vscode.workspace.getConfiguration('txa-auto-accept');
        const autoClick = config.get('autoClick', true);
        const currentLang = config.get('language', 'vi');
        const currentT = i18n[currentLang] || i18n.en;

        statusBarItem.text = `$(shield) TXA: ${state.clicks}✓ / ${state.denied}✗`;
        statusBarItem.color = autoClick ? '#3dd68c' : '#ff5f6d';
        statusBarItem.tooltip = currentT.statusBarTooltip.replace('{0}', 'v3.2.4');
        statusBarItem.show();

        // SYNC WITH OPEN WEBVIEW
        if (activePanel) {
            activePanel.webview.postMessage({
                command: 'updateStats',
                clicks: state.clicks,
                denied: state.denied,
                log: state.log
            });
        }
    }

    updateStatusBar();

    // Command function definition
    function handleAction(type, cmd) {
        const time = new Date().toLocaleTimeString('vi-VN', { hour12: false });
        if (type === 'acc') {
            state.clicks++;
            state.log.unshift({ t: time, cmd: cmd || 'Simulated Accept', status: 'accepted' });
        } else {
            state.denied++;
            state.log.unshift({ t: time, cmd: cmd || 'Simulated Deny', status: 'denied' });
        }
        if (state.log.length > 50) state.log.pop();

        context.globalState.update('clicks', state.clicks);
        context.globalState.update('denied', state.denied);
        context.globalState.update('log', state.log);
        updateStatusBar();
    }

    // Register manual command (can be called by external scripts or hotkeys)
    vscode.commands.registerCommand('txa-auto-accept.simulateAction', handleAction);

    // ==========================================
    // TXA AUTO ACCEPT BACKGROUND ENGINE
    // ==========================================
    let engineTimer = null;

    function parseRegex(pattern) {
        try {
            if (pattern.startsWith('/') && pattern.lastIndexOf('/') > 0) {
                const body = pattern.substring(1, pattern.lastIndexOf('/'));
                const flags = pattern.substring(pattern.lastIndexOf('/') + 1);
                return new RegExp(body, flags);
            }
            return new RegExp(pattern, 'i');
        } catch (e) {
            return new RegExp('.^'); // Match nothing on error
        }
    }

    function checkDenyList(actionText) {
        const { BUILTIN_DENY } = require('./src/constants');
        const customRules = state.denyList || [];

        for (const rule of [...customRules, ...BUILTIN_DENY]) {
            if (parseRegex(rule.pattern).test(actionText)) {
                return true; // Malicious/Denied
            }
        }
        return false; // Safe
    }

    function startEngine() {
        if (engineTimer) clearInterval(engineTimer);

        const config = vscode.workspace.getConfiguration('txa-auto-accept');
        const autoClick = config.get('autoClick', true);

        if (!autoClick) return; // Engine paused

        // The engine is now waiting for real signals or external triggers.
        // Simulation removed as per user request to be more practical.
    }

    // Start engine on activation
    startEngine();

    // Command to open dashboard
    let disposable = vscode.commands.registerCommand('txa-auto-accept.openDashboard', function () {
        if (activePanel) {
            activePanel.reveal(vscode.ViewColumn.One);
            return;
        }

        activePanel = vscode.window.createWebviewPanel(
            'txaDashboard',
            'TXA AUTO ACCEPT - Premium',
            vscode.ViewColumn.One,
            { enableScripts: true, retainContextWhenHidden: true }
        );

        const config = vscode.workspace.getConfiguration('txa-auto-accept');
        const suggestions = require('./src/suggestions');
        const { getWebviewContent } = require('./src/webview');
        activePanel.webview.html = getWebviewContent(config, state, suggestions);

        activePanel.onDidDispose(() => {
            activePanel = null;
        }, null, context.subscriptions);

        activePanel.webview.onDidReceiveMessage(message => {
            const cfg = vscode.workspace.getConfiguration('txa-auto-accept');
            switch (message.command) {
                case 'saveConfig':
                    cfg.update('autoClick', message.autoClick, vscode.ConfigurationTarget.Global).then(() => {
                        cfg.update('scanInterval', message.scanInterval, vscode.ConfigurationTarget.Global).then(() => {
                            cfg.update('language', message.language, vscode.ConfigurationTarget.Global).then(() => {
                                cfg.update('idleSeconds', message.idleSeconds, vscode.ConfigurationTarget.Global).then(() => {
                                    cfg.update('customSelector', message.customSelector, vscode.ConfigurationTarget.Global).then(() => {
                                        vscode.window.showInformationMessage('TXA Engine Configuration Updated!');
                                        // Engine will restart automatically via onDidChangeConfiguration
                                    });
                                });
                            });
                        });
                    });
                    return;
                case 'saveDenyList':
                    state.denyList = message.list;
                    context.globalState.update('denyList', state.denyList);
                    vscode.window.showInformationMessage('Shield Deny-List Secured!');
                    return;
                case 'resetCounter':
                    vscode.commands.executeCommand('txa-auto-accept.resetCounter');
                    return;
                case 'openLink':
                    vscode.env.openExternal(vscode.Uri.parse(message.url));
                    return;
            }
        });
    });

    context.subscriptions.push(disposable);

    // Register Toggle Engine command
    context.subscriptions.push(vscode.commands.registerCommand('txa-auto-accept.toggleEngine', () => {
        const config = vscode.workspace.getConfiguration('txa-auto-accept');
        const current = config.get('autoClick', true);
        config.update('autoClick', !current, vscode.ConfigurationTarget.Global).then(() => {
            const statusMsg = !current ? 'TXA Engine Activated! 🚀' : 'TXA Engine Paused! ⏸️';
            vscode.window.showInformationMessage(statusMsg);
            updateStatusBar();
        });
    }));

    // Register Reset Counter command
    context.subscriptions.push(vscode.commands.registerCommand('txa-auto-accept.resetCounter', () => {
        state.clicks = 0;
        state.denied = 0;
        state.log = [];
        context.globalState.update('clicks', 0);
        context.globalState.update('denied', 0);
        context.globalState.update('log', []);
        updateStatusBar();
        vscode.window.showInformationMessage('Counter and Logs have been reset.');
    }));

    // Watch config changes and Live Restart Engine
    context.subscriptions.push(vscode.workspace.onDidChangeConfiguration(e => {
        if (e.affectsConfiguration('txa-auto-accept')) {
            updateStatusBar();
            startEngine(); // Restart interval with new config dynamically

            if (activePanel) {
                const cfg = vscode.workspace.getConfiguration('txa-auto-accept');
                const suggestions = require('./src/suggestions');
                const { getWebviewContent } = require('./src/webview');
                activePanel.webview.html = getWebviewContent(cfg, state, suggestions);
            }
        }
    }));
}

function deactivate() {
    // Clean up
    const config = vscode.workspace.getConfiguration('txa-auto-accept');
    const autoClick = config.get('autoClick', true);
    if (!autoClick) return; // Do nothing if already paused
}

module.exports = { activate, deactivate };

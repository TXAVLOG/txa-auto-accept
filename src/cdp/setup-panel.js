const vscode = require('vscode');

/**
 * SetupPanel - Hiển thị hướng dẫn cài đặt CDP dưới dạng Webview
 */
class SetupPanel {
    static currentPanel = undefined;

    static createOrShow(extensionUri, script, platform, ideName, t) {
        const column = vscode.ViewColumn.One;

        if (SetupPanel.currentPanel) {
            SetupPanel.currentPanel._panel.reveal(column);
            SetupPanel.currentPanel._update(script, platform, ideName, t);
            return;
        }

        const panel = vscode.window.createWebviewPanel(
            'txaSetupCDP',
            'TXA: Setup CDP Engine',
            column,
            {
                enableScripts: true,
                retainContextWhenHidden: true,
                localResourceRoots: [vscode.Uri.joinPath(extensionUri, 'src', 'assets'), extensionUri]
            }
        );

        SetupPanel.currentPanel = new SetupPanel(panel, extensionUri, script, platform, ideName, t);
    }

    constructor(panel, extensionUri, script, platform, ideName, t) {
        this._panel = panel;
        this._extensionUri = extensionUri;
        this._script = script;
        this._platform = platform;
        this._ideName = ideName;
        this._t = t;
        this._disposables = [];

        this._update(script, platform, ideName, t);

        this._panel.onDidDispose(() => this.dispose(), null, this._disposables);

        this._panel.webview.onDidReceiveMessage(
            message => {
                switch (message.command) {
                    case 'copyScript':
                        vscode.env.clipboard.writeText(this._script);
                        vscode.window.showInformationMessage('✅ ' + (this._t.scriptCopied || 'Script đã được copy vào bộ nhớ tạm!'));
                        return;
                    case 'openHelp':
                        vscode.env.openExternal(vscode.Uri.parse('https://github.com/TXAVLOG/txa-auto-accept/blob/main/README.md'));
                        return;
                }
            },
            null,
            this._disposables
        );
    }

    _update(script, platform, ideName, t) {
        this._script = script;
        this._platform = platform;
        this._ideName = ideName;
        this._t = t;
        this._panel.webview.html = this._getHtmlContent(script, platform, ideName, t);
    }

    _getHtmlContent(script, platform, ideName, t) {
        const terminalName = platform === 'win32' ? 'PowerShell (Run as Administrator)' : 'Terminal';
        
        return `<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>TXA CDP Setup</title>
    <style>
        :root {
            --bg: #020617;
            --card-bg: #1e293b;
            --primary: #38bdf8;
            --accent: #a855f7;
            --text: #f8fafc;
            --text-muted: #94a3b8;
            --border: rgba(255, 255, 255, 0.1);
        }
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background-color: var(--bg);
            color: var(--text);
            margin: 0;
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            overflow: hidden;
        }
        .container {
            width: 100%;
            max-width: 500px;
            padding: 2rem;
            background: rgba(30, 41, 59, 0.7);
            backdrop-filter: blur(20px);
            border: 1px solid var(--border);
            border-radius: 24px;
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
        }
        .header { text-align: center; margin-bottom: 2rem; }
        .header h1 { font-size: 1.5rem; margin-bottom: 0.5rem; background: linear-gradient(to right, var(--primary), var(--accent)); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
        .header p { font-size: 0.9rem; color: var(--text-muted); }
        
        .step { display: flex; gap: 1rem; margin-bottom: 1.5rem; }
        .step-num { width: 32px; height: 32px; background: var(--primary); color: var(--bg); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; flex-shrink: 0; }
        .step-body { flex: 1; }
        .step-title { font-weight: 600; font-size: 1rem; margin-bottom: 0.25rem; }
        .step-desc { font-size: 0.85rem; color: var(--text-muted); line-height: 1.4; }

        .btn { width: 100%; padding: 12px; background: var(--primary); color: var(--bg); border: none; border-radius: 12px; font-weight: bold; cursor: pointer; transition: 0.3s; margin-top: 1rem; display: flex; align-items: center; justify-content: center; gap: 8px; }
        .btn:hover { background: #7dd3fc; transform: translateY(-2px); }
        
        .warning { background: rgba(245, 158, 11, 0.1); border: 1px solid rgba(245, 158, 11, 0.3); padding: 1rem; border-radius: 12px; font-size: 0.8rem; color: #fbbf24; margin-top: 1rem; }
        .footer { text-align: center; margin-top: 2rem; }
        .footer a { color: var(--primary); text-decoration: none; font-size: 0.8rem; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Cài đặt CDP Engine</h1>
            <p>Để tự động Click, ${ideName} cần được chạy ở chế độ Debug.</p>
        </div>

        <div class="step">
            <div class="step-num">1</div>
            <div class="step-body">
                <div class="step-title">Sao chép Setup Script</div>
                <div class="step-desc">Bấm nút bên dưới để copy mã nguồn script sửa lỗi Shortcut.</div>
                <button class="btn" onclick="copyScript()">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                    Copy Setup Script
                </button>
            </div>
        </div>

        <div class="step">
            <div class="step-num">2</div>
            <div class="step-body">
                <div class="step-title">Chạy trong ${terminalName}</div>
                <div class="step-desc">Mở ${terminalName}, dán (Ctrl+V) script vừa copy và nhấn Enter.</div>
            </div>
        </div>

        <div class="step">
            <div class="step-num">3</div>
            <div class="step-body">
                <div class="step-title">Khởi động lại ${ideName}</div>
                <div class="step-desc">Đóng toàn bộ cửa sổ ${ideName} và mở lại từ Shortcut vừa được cập nhật.</div>
            </div>
        </div>

        ${platform === 'win32' ? `
        <div class="warning">
            <strong>Ghi chú cho Windows:</strong><br>
            Bạn nên chạy PowerShell bằng quyền Administrator để đảm bảo script có thể cập nhật các shortcut trên Taskbar hoặc Start Menu.
        </div>
        ` : ''}

        <div class="footer">
            <a href="#" onclick="openHelp(); return false;">Cần trợ giúp? Xem hướng dẫn →</a>
        </div>
    </div>

    <script>
        const vscode = acquireVsCodeApi();
        function copyScript() { vscode.postMessage({ command: 'copyScript' }); }
        function openHelp() { vscode.postMessage({ command: 'openHelp' }); }
    </script>
</body>
</html>`;
    }

    dispose() {
        SetupPanel.currentPanel = undefined;
        this._panel.dispose();
        while (this._disposables.length) {
            const disposable = this._disposables.pop();
            if (disposable) disposable.dispose();
        }
    }
}

module.exports = { SetupPanel };

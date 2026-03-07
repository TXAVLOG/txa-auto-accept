const { LOGO_SVG, BUILTIN_DENY } = require('./constants');
const i18n = require('./i18n');
const getCSS = require('./webview-css');
const getHTML = require('./webview-html');
const getJS = require('./webview-js');

function getWebviewContent(config, state, suggestions) {
    const lang = config.get('language', 'vi');
    const t = i18n[lang] || i18n.en;

    return `<!DOCTYPE html>
<html lang="${lang}">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;700&display=swap" rel="stylesheet">
    <style>${getCSS()}</style>
</head>
<body>
    ${getHTML(config, state, t, LOGO_SVG)}
    <script>${getJS(state, BUILTIN_DENY, suggestions)}</script>
</body>
</html>`;
}

module.exports = { getWebviewContent };

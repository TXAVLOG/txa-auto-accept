const { LOGO_SVG, BUILTIN_DENY } = require('./constants');
const i18n = require('./i18n');

function getWebviewContent(config, state, suggestions) {
    const lang = config.get('language', 'vi');
    const t = i18n[lang] || i18n.en;

    return `<!DOCTYPE html>
<html lang="${lang}">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <!-- Load custom fonts for premium look -->
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;700&display=swap" rel="stylesheet">
    <style>
        :root {
            /* Premium Dark Theme Core - Inspired by Liquid Glass & Modern OS */
            --bg-base: #030712;
            --glass-bg: rgba(17, 24, 39, 0.75);
            --glass-border: rgba(255, 255, 255, 0.08);
            --glass-highlight: rgba(255, 255, 255, 0.05);
            
            --primary: #3b82f6;
            --primary-glow: rgba(59, 130, 246, 0.4);
            --success: #10b981;
            --success-bg: rgba(16, 185, 129, 0.1);
            --success-glow: rgba(16, 185, 129, 0.4);
            --danger: #ef4444;
            --danger-bg: rgba(239, 68, 68, 0.1);
            --danger-glow: rgba(239, 68, 68, 0.4);
            --accent: #8b5cf6;
            
            --text-main: #f8fafc;
            --text-muted: #94a3b8;
            --text-dark: #cbd5e1;
            
            --radius-xl: 32px;
            --radius-lg: 20px;
            --radius-md: 12px;
            --radius-sm: 8px;
        }

        * { box-sizing: border-box; }

        body {
            font-family: 'Inter', system-ui, -apple-system, sans-serif;
            background-color: var(--bg-base);
            /* Rich ambient gradient background */
            background-image: 
                radial-gradient(circle at 10% 20%, rgba(59, 130, 246, 0.08), transparent 40%),
                radial-gradient(circle at 90% 80%, rgba(139, 92, 246, 0.08), transparent 40%),
                radial-gradient(circle at 60% 30%, rgba(16, 185, 129, 0.05), transparent 30%);
            background-attachment: fixed;
            color: var(--text-main);
            margin: 0;
            padding: 2rem 1rem;
            display: flex;
            justify-content: center;
            align-items: flex-start;
            min-height: 100vh;
            overflow-x: hidden;
            overflow-y: auto;
        }

        /* Scrollbar Styling */
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }
        ::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.2); }

        .container {
            width: 100%;
            max-width: 680px;
            background: var(--glass-bg);
            backdrop-filter: blur(24px) saturate(180%);
            -webkit-backdrop-filter: blur(24px) saturate(180%);
            border: 1px solid var(--glass-border);
            border-radius: var(--radius-xl);
            box-shadow: 
                0 30px 60px -15px rgba(0, 0, 0, 0.6), 
                inset 0 1px 0 rgba(255,255,255,0.1);
            overflow: hidden;
            animation: appIn 0.6s cubic-bezier(0.2, 0.8, 0.2, 1);
            position: relative;
        }

        /* Subtle glow line at the top */
        .container::before {
            content: '';
            position: absolute;
            top: 0; left: 10%; width: 80%; height: 1px;
            background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
            z-index: 10;
        }

        @keyframes appIn { 
            0% { opacity: 0; transform: translateY(40px) scale(0.97); } 
            100% { opacity: 1; transform: translateY(0) scale(1); } 
        }

        header {
            padding: 1.8rem 2.2rem;
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 1px solid var(--glass-border);
            background: linear-gradient(180deg, rgba(255,255,255,0.02) 0%, transparent 100%);
        }

        .brand {
            display: flex;
            align-items: center;
            gap: 1.2rem;
        }

        .logo-wrapper {
            width: 48px; height: 48px;
            border-radius: 14px;
            background: linear-gradient(135deg, rgba(59, 130, 246, 0.15), rgba(139, 92, 246, 0.15));
            display: flex; align-items: center; justify-content: center;
            box-shadow: 0 0 25px rgba(59, 130, 246, 0.2);
            border: 1px solid rgba(255,255,255,0.1);
            position: relative;
            overflow: hidden;
        }
        
        .logo-wrapper::after {
            content: ''; position: absolute; top: -50%; left: -50%; width: 200%; height: 200%;
            background: linear-gradient(45deg, transparent, rgba(255,255,255,0.1), transparent);
            transform: rotate(45deg);
            animation: shine 6s infinite;
        }

        @keyframes shine {
            0% { transform: rotate(45deg) translateX(-100%); }
            100% { transform: rotate(45deg) translateX(100%); }
        }

        .brand-text h1 {
            margin: 0;
            font-size: 1.3rem;
            font-weight: 800;
            letter-spacing: -0.02em;
            background: linear-gradient(to right, #60a5fa, #c084fc);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }

        .brand-text span {
            font-size: 0.75rem;
            font-family: 'JetBrains Mono', monospace;
            color: var(--text-muted);
            font-weight: 500;
            background: rgba(255,255,255,0.05);
            padding: 2px 6px;
            border-radius: 4px;
            margin-top: 4px;
            display: inline-block;
        }

        .tabs {
            display: flex;
            background: rgba(0, 0, 0, 0.2);
            padding: 0.35rem;
            border-radius: 14px;
            border: 1px solid var(--glass-border);
            box-shadow: inset 0 2px 5px rgba(0,0,0,0.2);
        }

        .tab {
            padding: 0.6rem 1.2rem;
            border: none;
            background: transparent;
            color: var(--text-muted);
            font-weight: 600;
            font-size: 0.85rem;
            letter-spacing: 0.02em;
            cursor: pointer;
            border-radius: 10px;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            position: relative;
        }

        .tab:hover { color: var(--text-main); }
        .tab.active {
            background: rgba(255, 255, 255, 0.1);
            color: var(--text-main);
            box-shadow: 0 4px 12px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.1);
        }

        .panel {
            display: none;
            padding: 2.2rem;
            animation: fadePanel 0.4s ease-out;
            min-height: 480px;
        }

        .panel.active { display: block; }

        @keyframes fadePanel {
            from { opacity: 0; transform: translateY(15px) scale(0.99); }
            to { opacity: 1; transform: translateY(0) scale(1); }
        }

        /* ----- Stats Row ----- */
        .stats {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 1.5rem;
            margin-bottom: 2.5rem;
        }

        .stat-card {
            background: rgba(255, 255, 255, 0.02);
            border: 1px solid var(--glass-border);
            padding: 1.8rem;
            border-radius: var(--radius-lg);
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
            position: relative;
            overflow: hidden;
        }

        .stat-card::after {
            content: ''; position: absolute;
            top: 0; left: 0; right: 0; bottom: 0;
            background: repeating-linear-gradient(
                -45deg,
                transparent,
                transparent 5px,
                rgba(255,255,255,0.01) 5px,
                rgba(255,255,255,0.01) 10px
            );
            z-index: 0; pointer-events: none;
        }

        .stat-card > * { position: relative; z-index: 1; }

        .stat-card.acc { box-shadow: 0 15px 35px rgba(16, 185, 129, 0.05); }
        .stat-card.den { box-shadow: 0 15px 35px rgba(239, 68, 68, 0.05); }

        .stat-card:hover { transform: translateY(-6px); }
        .stat-card.acc:hover { background: rgba(16, 185, 129, 0.05); border-color: rgba(16, 185, 129, 0.2); }
        .stat-card.den:hover { background: rgba(239, 68, 68, 0.05); border-color: rgba(239, 68, 68, 0.2); }

        .stat-val {
            font-size: 3.2rem;
            font-weight: 800;
            font-family: 'JetBrains Mono', monospace;
            line-height: 1;
            margin-bottom: 0.5rem;
            letter-spacing: -2px;
        }

        .stat-acc { color: var(--success); text-shadow: 0 0 25px rgba(16, 185, 129, 0.5); }
        .stat-den { color: var(--danger); text-shadow: 0 0 25px rgba(239, 68, 68, 0.5); }

        .stat-lbl {
            font-size: 0.85rem;
            color: var(--text-dark);
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.1em;
        }

        @keyframes popupVal {
            0% { transform: scale(1); filter: brightness(1); }
            50% { transform: scale(1.15); filter: brightness(1.5); color: #fff; }
            100% { transform: scale(1); filter: brightness(1); }
        }
        .stat-val.changed { animation: popupVal 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275); }

        /* ----- Logs ----- */
        .log-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 1rem;
        }

        .log-header h3 {
            margin: 0;
            font-size: 1.05rem;
            font-weight: 700;
            color: var(--text-main);
            display: flex; align-items: center; gap: 8px;
        }
        
        .log-header h3::before {
            content: ''; display: block; width: 8px; height: 8px;
            background: var(--primary); border-radius: 50%;
            box-shadow: 0 0 10px var(--primary-glow);
        }

        .btn-clear {
            background: rgba(255, 255, 255, 0.05);
            border: 1px solid var(--glass-border);
            color: var(--text-muted);
            cursor: pointer;
            font-size: 0.75rem;
            font-weight: 600;
            padding: 0.5rem 0.8rem;
            border-radius: var(--radius-sm);
            transition: all 0.2s;
            display: flex;
            align-items: center;
            gap: 0.5rem;
            backdrop-filter: blur(5px);
        }

        .btn-clear:hover {
            background: rgba(255, 255, 255, 0.1);
            color: var(--text-main);
        }

        .btn-reset {
            background: rgba(255, 255, 255, 0.05);
            border: 1px solid var(--glass-border);
            color: var(--text-muted);
            cursor: pointer;
            font-size: 0.75rem;
            font-weight: 600;
            padding: 0.5rem 0.8rem;
            border-radius: var(--radius-sm);
            transition: all 0.2s;
            display: flex;
            align-items: center;
            gap: 0.5rem;
            backdrop-filter: blur(5px);
            margin: 0 auto 1.5rem auto;
            width: fit-content;
        }

        .btn-reset:hover {
            background: rgba(255, 255, 255, 0.1);
            color: var(--text-main);
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        }

        .engine-status {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 10px;
            font-size: 0.75rem;
            font-weight: 600;
            color: var(--text-muted);
            margin: -0.5rem auto 1.5rem auto;
            padding: 0.4rem 1rem;
            background: rgba(0,0,0,0.2);
            border-radius: 20px;
            border: 1px solid var(--glass-border);
            width: fit-content;
        }

        .status-dot {
            width: 8px;
            height: 8px;
            background: var(--success);
            border-radius: 50%;
            box-shadow: 0 0 10px var(--success-glow);
            animation: pulse 2s infinite;
        }

        @keyframes pulse {
            0% { transform: scale(1); opacity: 1; }
            50% { transform: scale(1.4); opacity: 0.6; }
            100% { transform: scale(1); opacity: 1; }
        }

        .star-link {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            margin-top: 1.5rem;
            color: #fbbf24;
            font-size: 0.8rem;
            font-weight: 600;
            text-decoration: none;
            padding: 0.6rem 1.2rem;
            background: rgba(251, 191, 36, 0.1);
            border: 1px solid rgba(251, 191, 36, 0.2);
            border-radius: 12px;
            transition: all 0.3s;
        }

        .star-link:hover {
            background: rgba(251, 191, 36, 0.2);
            transform: translateY(-2px);
            box-shadow: 0 4px 15px rgba(251, 191, 36, 0.2);
        }

        .log-list {
            background: rgba(0, 0, 0, 0.3);
            border-radius: var(--radius-md);
            height: 250px;
            overflow-y: auto;
            border: 1px solid var(--glass-border);
            padding: 0.5rem;
            box-shadow: inset 0 2px 10px rgba(0,0,0,0.3);
        }

        .log-item {
            padding: 0.8rem 1.2rem;
            border-radius: var(--radius-sm);
            margin-bottom: 0.5rem;
            display: flex;
            align-items: center;
            gap: 1.2rem;
            font-size: 0.85rem;
            background: rgba(255, 255, 255, 0.015);
            animation: slideInLeft 0.3s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
            border: 1px solid transparent;
            transition: background 0.2s;
        }
        .log-item:hover { background: rgba(255, 255, 255, 0.03); }

        @keyframes slideInLeft {
            from { opacity: 0; transform: translateX(-20px); }
            to { opacity: 1; transform: translateX(0); }
        }

        .log-item.denied {
            background: linear-gradient(90deg, rgba(239,68,68,0.05) 0%, transparent 100%);
            border-left: 3px solid var(--danger);
        }
        .log-item.accepted {
            background: linear-gradient(90deg, rgba(16,185,129,0.05) 0%, transparent 100%);
            border-left: 3px solid var(--success);
        }

        .log-time {
            font-family: 'JetBrains Mono', monospace;
            font-size: 0.75rem;
            color: var(--text-muted);
            min-width: 65px;
            opacity: 0.7;
        }

        .log-cmd {
            flex: 1;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            font-family: 'JetBrains Mono', monospace;
            font-weight: 500;
        }

        .log-status {
            font-size: 0.7rem; font-weight: 800; text-transform: uppercase;
            padding: 2px 8px; border-radius: 4px; letter-spacing: 0.05em;
        }
        .log-item.denied .log-status { background: rgba(239, 68, 68, 0.1); color: var(--danger); }
        .log-item.accepted .log-status { background: rgba(16, 185, 129, 0.1); color: var(--success); }

        /* ----- Config Panel ----- */
        .config-list { display: flex; flex-direction: column; gap: 1rem; }

        .config-row {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 1.4rem;
            background: rgba(255, 255, 255, 0.02);
            border: 1px solid var(--glass-border);
            border-radius: var(--radius-md);
            transition: transform 0.2s, background 0.2s, border-color 0.2s;
        }
        .config-row:hover { 
            transform: translateX(4px); 
            background: rgba(255, 255, 255, 0.03);
            border-color: rgba(255, 255, 255, 0.15);
        }

        .row-info h3 { margin: 0 0 0.4rem 0; font-size: 1rem; font-weight: 600; }
        .row-info p { margin: 0; font-size: 0.8rem; color: var(--text-muted); line-height: 1.5; }

        select, input[type="number"], input[type="text"] {
            background: rgba(0, 0, 0, 0.3);
            border: 1px solid var(--glass-border);
            color: var(--text-main);
            padding: 0.7rem 1.2rem;
            border-radius: var(--radius-sm);
            font-family: 'Inter', sans-serif;
            font-size: 0.9rem;
            font-weight: 500;
            outline: none;
            transition: all 0.2s;
            box-shadow: inset 0 2px 4px rgba(0,0,0,0.2);
        }
        select:focus, input[type="number"]:focus, input[type="text"]:focus {
            border-color: var(--primary);
            box-shadow: 0 0 0 2px var(--primary-glow), inset 0 2px 4px rgba(0,0,0,0.2);
        }
        
        select option { background: var(--bg-base); }

        /* Modern Toggle Switch */
        .switch {
            position: relative; display: inline-block; width: 48px; height: 26px;
        }
        .switch input { opacity: 0; width: 0; height: 0; }
        .slider {
            position: absolute; cursor: pointer;
            top: 0; left: 0; right: 0; bottom: 0;
            background-color: rgba(255,255,255,0.1);
            border-radius: 26px;
            transition: .4s;
            border: 1px solid var(--glass-border);
        }
        .slider:before {
            position: absolute; content: "";
            height: 18px; width: 18px;
            left: 3px; bottom: 3px;
            background-color: var(--text-dark);
            border-radius: 50%;
            transition: .4s cubic-bezier(0.34, 1.56, 0.64, 1);
            box-shadow: 0 2px 5px rgba(0,0,0,0.2);
        }
        input:checked + .slider { background-color: var(--primary); border-color: var(--primary); }
        input:checked + .slider:before {
            background-color: #fff;
            transform: translateX(22px);
            box-shadow: 0 2px 10px rgba(0,0,0,0.3);
        }

        .btn-main {
            width: 100%;
            padding: 1.2rem;
            border-radius: var(--radius-md);
            border: none;
            background: linear-gradient(135deg, var(--primary), var(--accent));
            color: #fff;
            font-weight: 700;
            font-size: 1.05rem;
            cursor: pointer;
            margin-top: 1.5rem;
            box-shadow: 0 4px 15px rgba(59, 130, 246, 0.3);
            transition: all 0.3s;
            position: relative;
            overflow: hidden;
            display: flex; justify-content: center; align-items: center; gap: 10px;
        }
        .btn-main::after {
            content: ''; position: absolute; top: 0; left: -100%; width: 50%; height: 100%;
            background: linear-gradient(90deg, transparent, rgba(255,255,255,0.25), transparent);
            transition: left 0.5s;
        }
        .btn-main:hover { transform: translateY(-3px); box-shadow: 0 8px 25px rgba(59, 130, 246, 0.4); }
        .btn-main:hover::after { left: 100%; }
        .btn-main:active { transform: translateY(1px); }

        /* ----- Shield Panel ----- */
        .shield-inputs {
            display: flex; gap: 1rem; margin-bottom: 1.5rem;
            background: rgba(0, 0, 0, 0.2);
            padding: 1.2rem;
            border-radius: var(--radius-md);
            border: 1px solid var(--glass-border);
        }

        .input-wrapper { position: relative; flex: 1; }
        .suggest-hint {
            position: absolute; left: 1.2rem; top: 50%; transform: translateY(-50%);
            font-size: 0.9rem; font-family: 'JetBrains Mono', monospace;
            pointer-events: none; color: rgba(255,255,255,0.15);
            z-index: 1; white-space: nowrap; overflow: hidden;
        }
        .input-wrapper input { width: 100%; position: relative; z-index: 2; background: transparent; }
        
        .btn-plus {
            background: rgba(59, 130, 246, 0.15);
            border: 1px solid rgba(59, 130, 246, 0.3);
            color: var(--primary);
            width: 46px; border-radius: var(--radius-sm);
            cursor: pointer; font-size: 1.5rem; font-weight: 400;
            transition: all 0.2s;
            display: flex; align-items: center; justify-content: center;
        }
        .btn-plus:hover { background: var(--primary); color: #fff; transform: translateY(-2px); box-shadow: 0 4px 12px var(--primary-glow); }
        .btn-plus:active { transform: translateY(1px); }

        .deny-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
            gap: 1rem;
            height: 350px;
            overflow-y: auto;
            padding-right: 0.5rem;
        }

        .deny-item {
            display: flex; align-items: center; justify-content: space-between;
            background: rgba(255, 255, 255, 0.02);
            border: 1px solid var(--glass-border);
            padding: 1rem;
            border-radius: var(--radius-sm);
            animation: fadeIn 0.3s ease-out;
            transition: all 0.2s;
            position: relative;
            overflow: hidden;
        }
        .deny-item::before {
            content: ''; position: absolute; left: 0; top: 0; bottom: 0; width: 3px;
        }
        .deny-item.system::before { background: var(--text-muted); }
        .deny-item.custom::before { background: var(--accent); }

        .deny-item:hover { background: rgba(255, 255, 255, 0.04); border-color: rgba(255,255,255,0.15); transform: translateY(-2px); }
        .deny-item.removing { animation: fadeOut 0.3s ease-in forwards; }

        @keyframes fadeOut { to { opacity: 0; transform: scale(0.9); } }

        .deny-info { display: flex; align-items: center; gap: 1rem; overflow: hidden; }
        .deny-badge {
            font-size: 0.65rem; font-weight: 800; padding: 0.2rem 0.5rem; border-radius: 4px;
            text-transform: uppercase; letter-spacing: 0.05em;
        }
        .badge-system { background: rgba(161, 161, 170, 0.15); color: var(--text-muted); }
        .badge-custom { background: rgba(139, 92, 246, 0.15); color: #c084fc; }

        .deny-label {
            font-weight: 600; font-size: 0.9rem;
            white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
            font-family: 'JetBrains Mono', monospace;
            color: var(--text-main);
        }

        .btn-remove {
            background: transparent; border: none;
            color: var(--text-muted); cursor: pointer;
            width: 30px; height: 30px; border-radius: 50%;
            display: flex; align-items: center; justify-content: center;
            transition: all 0.2s;
        }
        .btn-remove:hover { background: rgba(239, 68, 68, 0.1); color: var(--danger); }

        /* Smooth Tooltip Glass Effect */
        #txa-tooltip {
            position: fixed; pointer-events: none; z-index: 2000;
            background: rgba(15, 23, 42, 0.85);
            backdrop-filter: blur(16px) saturate(180%);
            -webkit-backdrop-filter: blur(16px);
            border: 1px solid var(--glass-border);
            padding: 0.6rem 1rem; color: #fff;
            border-radius: 8px; font-size: 0.8rem; font-weight: 500;
            opacity: 0; transform: scale(0.95);
            transition: opacity 0.15s ease-out, transform 0.15s ease-out;
            box-shadow: 0 10px 30px rgba(0,0,0,0.6);
            white-space: nowrap;
        }
    </style>
</head>
<body>
    <div id="txa-tooltip"></div>
    <div class="container">
        <header>
            <div class="brand">
                <div class="logo-wrapper">${LOGO_SVG}</div>
                <div class="brand-text">
                    <h1>${t.title}</h1>
                    <span>v${config.get('version', '3.2.2')} AI Engine</span>
                </div>
            </div>
            <div class="tabs">
                <button class="tab active" data-tab="monitor" data-tip="Giám sát thời gian thực">${t.monitor}</button>
                <button class="tab" data-tab="config" data-tip="Cài đặt hệ thống">${t.config}</button>
                <button class="tab" data-tab="shield" data-tip="Quản lý Lá chắn">${t.shield}</button>
            </div>
        </header>

        <div class="panel active" id="panel-monitor">
            <div class="stats">
                <div class="stat-card acc" data-tip="Số lệnh an toàn đã được thực thi">
                    <div class="stat-val stat-acc" id="val-acc">${state.clicks}</div>
                    <div class="stat-lbl">${t.accepted}</div>
                </div>
                <div class="stat-card den" data-tip="Số lệnh nguy hiểm đã bị khóa">
                    <div class="stat-val stat-den" id="val-den">${state.denied}</div>
                    <div class="stat-lbl">${t.blocked}</div>
                </div>
            </div>

            <button class="btn-reset" id="btn-reset-counter" data-tip="${t.resetCounter}">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M23 4v6h-6M1 20v-6h6M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"/></svg>
                ${t.resetCounter}
            </button>

            <div class="engine-status">
                <span class="status-dot"></span>
                ${t.engineStatus}
            </div>

            <a href="https://github.com/TXAVLOG/txa-auto-accept" class="star-link" id="star-github">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                ${t.starOnGithub}
            </a>
            
            <div class="log-header">
                <h3>${t.logTitle}</h3>
                <button class="btn-clear" id="btn-clear-log" data-tip="Xóa lịch sử">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>
                    ${t.clear}
                </button>
            </div>
            <div class="log-list" id="log-list"></div>
        </div>

        <div class="panel" id="panel-config">
            <div class="config-list">
                <div class="config-row">
                    <div class="row-info">
                        <h3>${t.langDesc}</h3>
                        <p>Ngôn ngữ hiển thị cho giao diện</p>
                    </div>
                    <select id="cfg-lang">
                        <option value="vi" ${lang === 'vi' ? 'selected' : ''}>Tiếng Việt</option>
                        <option value="en" ${lang === 'en' ? 'selected' : ''}>English</option>
                    </select>
                </div>
                <div class="config-row">
                    <div class="row-info">
                        <h3>${t.autoClick}</h3>
                        <p>${t.autoClickDesc}</p>
                    </div>
                    <label class="switch">
                        <input type="checkbox" id="cfg-autoclick" ${config.get('autoClick', true) ? 'checked' : ''}>
                        <span class="slider"></span>
                    </label>
                </div>
                <div class="config-row">
                    <div class="row-info">
                        <h3>Custom Selector</h3>
                        <p>CSS Selector của nút cần tự động bấm</p>
                    </div>
                    <div style="display: flex; gap: 8px;">
                        <input type="text" id="cfg-selector" value="${config.get('customSelector', '')}" style="width: 140px; font-size: 0.8rem;" placeholder=".btn-accept">
                        <button id="btn-pick-element" class="btn-clear" data-tip="Chọn phần tử trên trang">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/></svg>
                        </button>
                    </div>
                </div>
                <div class="config-row">
                    <div class="row-info">
                        <h3>${t.scanInterval}</h3>
                        <p>${t.scanDesc}</p>
                    </div>
                    <input type="number" id="cfg-interval" value="${config.get('scanInterval', 3000)}" style="width: 100px; text-align: center;">
                </div>
                <div class="config-row">
                    <div class="row-info">
                        <h3>${t.idleSeconds}</h3>
                        <p>${t.idleDesc}</p>
                    </div>
                    <input type="number" id="cfg-idle" value="${config.get('idleSeconds', 5)}" style="width: 100px; text-align: center;">
                </div>
            </div>
            <button class="btn-main" id="btn-save-cfg">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg>
                ${t.save}
            </button>
        </div>

        <div class="panel" id="panel-shield">
            <div class="shield-inputs">
                <div class="input-wrapper">
                    <div class="suggest-hint" id="hint-label"></div>
                    <input type="text" id="new-label" placeholder="${t.placeholderLabel}">
                </div>
                <div class="input-wrapper">
                    <div class="suggest-hint" id="hint-pattern"></div>
                    <input type="text" id="new-pattern" placeholder="${t.placeholderPattern}">
                </div>
                <button id="btn-add-deny" class="btn-plus" data-tip="Thêm Rule">+</button>
            </div>
            <div class="deny-grid" id="deny-list"></div>
        </div>
    </div>

    <script>
        const vscode = acquireVsCodeApi();
        let state = ${JSON.stringify(state)};
        const builtIn = ${JSON.stringify(BUILTIN_DENY)};
        const SUGGESTS = ${JSON.stringify(suggestions)};

        // Tab Switching Logic
        document.querySelectorAll('.tab').forEach(btn => {
            btn.onclick = () => {
                document.querySelectorAll('.tab, .panel').forEach(el => el.classList.remove('active'));
                btn.classList.add('active');
                document.getElementById('panel-' + btn.dataset.tab).classList.add('active');
            };
        });

        // Smooth Tooltip Follow Mouse
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
                tooltip.style.transform = 'scale(0.95)';
            }
        });

        // Listen for extension real-time updates
        window.addEventListener('message', event => {
            const msg = event.data;
            if (msg.command === 'updateStats') {
                const accEl = document.getElementById('val-acc');
                const denEl = document.getElementById('val-den');
                
                if (state.clicks !== msg.clicks) {
                    accEl.innerText = msg.clicks;
                    accEl.classList.remove('changed');
                    void accEl.offsetWidth; // trigger reflow
                    accEl.classList.add('changed');
                }
                if (state.denied !== msg.denied) {
                    denEl.innerText = msg.denied;
                    denEl.classList.remove('changed');
                    void denEl.offsetWidth; // trigger reflow
                    denEl.classList.add('changed');
                }
                state.clicks = msg.clicks;
                state.denied = msg.denied;
                state.log = msg.log;
                renderLogs();
            }
        });

        function renderLogs() {
            const list = document.getElementById('log-list');
            list.innerHTML = '';
            if (state.log.length === 0) {
                list.innerHTML = '<div style="padding: 2rem; text-align: center; color: var(--text-muted); font-size: 0.9rem; border: 1px dashed rgba(255,255,255,0.1); border-radius: 8px; margin-top: 5px;">No logs recorded yet.</div>';
                return;
            }
            state.log.slice(0, 30).forEach(item => {
                const div = document.createElement('div');
                div.className = 'log-item ' + (item.status === 'denied' ? 'denied' : 'accepted');
                div.innerHTML = \`
                    <span class="log-time">\${item.t}</span>
                    <span class="log-cmd">\${item.cmd}</span>
                    <span class="log-status">\${item.status === 'denied' ? 'Blocked' : 'Allowed'}</span>
                \`;
                list.insertBefore(div, list.firstChild);
            });
        }

        function renderDenyList() {
            const grid = document.getElementById('deny-list');
            grid.innerHTML = '';
            state.denyList.forEach((rule, i) => {
                const item = document.createElement('div');
                item.className = 'deny-item custom';
                item.innerHTML = \`
                    <div class="deny-info">
                        <span class="deny-badge badge-custom">Custom</span>
                        <span class="deny-label">\${rule.label}</span>
                    </div>
                    <button class="btn-remove" onclick="removeRule(\${i}, this)" data-tip="Xóa">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M18 6L6 18M6 6l12 12"/></svg>
                    </button>
                \`;
                grid.appendChild(item);
            });
            builtIn.forEach(rule => {
                const item = document.createElement('div');
                item.className = 'deny-item system';
                item.innerHTML = \`
                    <div class="deny-info">
                        <span class="deny-badge badge-system">System</span>
                        <span class="deny-label">\${rule.label}</span>
                    </div>
                \`;
                grid.appendChild(item);
            });
        }

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

        // UI ELEMENT PICKER MODE
        let isPickingMode = false;
        const pickerOverlay = document.createElement('div');
        pickerOverlay.style.cssText = 'position:fixed; top:0; left:0; width:100%; height:100%; pointer-events:none; z-index:9999; border: 2px dashed var(--primary); background: rgba(59, 130, 246, 0.05); display: none;';
        document.body.appendChild(pickerOverlay);

        const pickerBadge = document.createElement('div');
        pickerBadge.style.cssText = 'position:fixed; top:20px; left:50%; transform:translateX(-50%); background: var(--primary); color: #fff; padding: 10px 20px; border-radius: 20px; font-weight: 700; font-size: 14px; z-index: 10000; box-shadow: 0 10px 30px rgba(59, 130, 246, 0.4); display: none;';
        pickerBadge.innerHTML = '🎯 Chế độ chọn (Nhấn ESC để thoát)';
        document.body.appendChild(pickerBadge);

        const pickerHoverBox = document.createElement('div');
        pickerHoverBox.style.cssText = 'position:fixed; pointer-events:none; border:2px solid var(--accent); background:rgba(139, 92, 246, 0.2); z-index:9998; transition:all 0.1s; display:none; border-radius: 4px;';
        document.body.appendChild(pickerHoverBox);

        const pickerTooltip = document.createElement('div');
        pickerTooltip.style.cssText = 'position:fixed; pointer-events:none; background:rgba(15, 23, 42, 0.9); color:var(--text-main); font-family:monospace; font-size:11px; padding:4px 8px; border-radius:6px; z-index:10001; border:1px solid var(--glass-border); display:none;';
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
                pickerHoverBox.style.display = 'none';
                pickerTooltip.style.display = 'none';
                return;
            }
            const rect = target.getBoundingClientRect();
            pickerHoverBox.style.display = 'block';
            pickerHoverBox.style.top = rect.top + 'px';
            pickerHoverBox.style.left = rect.left + 'px';
            pickerHoverBox.style.width = rect.width + 'px';
            pickerHoverBox.style.height = rect.height + 'px';

            pickerTooltip.style.display = 'block';
            pickerTooltip.innerText = getCssSelector(target);
            pickerTooltip.style.top = (e.clientY + 20) + 'px';
            pickerTooltip.style.left = (e.clientX + 20) + 'px';
        });

        document.addEventListener('click', e => {
            if (!isPickingMode) return;
            e.preventDefault();
            e.stopPropagation();
            const target = e.target;
            if (target === document.body || target === document.documentElement || target === pickerBadge) return;
            
            const selector = getCssSelector(target);
            document.getElementById('cfg-selector').value = selector;
            
            exitPickerMode();
            
            // Highlight the input temporarily
            const inp = document.getElementById('cfg-selector');
            inp.style.borderColor = 'var(--success)';
            setTimeout(() => inp.style.borderColor = '', 1000);
            
            // Switch to Config Tab if not already
            document.querySelector('[data-tab="config"]').click();
        }, true);

        document.addEventListener('keydown', e => {
            if (isPickingMode && e.key === 'Escape') {
                exitPickerMode();
            }
        });

        function exitPickerMode() {
            isPickingMode = false;
            pickerOverlay.style.display = 'none';
            pickerBadge.style.display = 'none';
            pickerHoverBox.style.display = 'none';
            pickerTooltip.style.display = 'none';
            document.body.style.cursor = 'default';
        }

        // Auto-Suggest Features
        const labelInp = document.getElementById('new-label');
        const patternInp = document.getElementById('new-pattern');
        const hintLbl = document.getElementById('hint-label');
        const hintPat = document.getElementById('hint-pattern');

        labelInp.oninput = () => {
            const val = labelInp.value.toLowerCase();
            const match = val ? SUGGESTS.find(s => s.label.toLowerCase().startsWith(val)) : null;
            if (match && val !== match.label.toLowerCase()) {
                hintLbl.innerText = match.label;
                hintPat.innerText = match.pattern;
            } else {
                hintLbl.innerText = '';
                hintPat.innerText = '';
            }
        };
        
        labelInp.onkeydown = (e) => {
            if (e.key === 'Tab' && hintLbl.innerText) {
                e.preventDefault();
                labelInp.value = hintLbl.innerText;
                patternInp.value = hintPat.innerText;
                hintLbl.innerText = '';
                hintPat.innerText = '';
            }
        };

        // Actions
        document.getElementById('btn-save-cfg').onclick = () => {
            const btn = document.getElementById('btn-save-cfg');
            const originalHTML = btn.innerHTML;
            btn.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="animation: spin 1s linear infinite"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg> Đang lưu...';
            btn.style.opacity = '0.9';
            
            vscode.postMessage({
                command: 'saveConfig',
                language: document.getElementById('cfg-lang').value,
                autoClick: document.getElementById('cfg-autoclick').checked,
                scanInterval: parseInt(document.getElementById('cfg-interval').value) || 3000,
                idleSeconds: parseInt(document.getElementById('cfg-idle').value) || 5,
                customSelector: document.getElementById('cfg-selector').value.trim()
            });
            
            setTimeout(() => {
                btn.innerHTML = originalHTML;
                btn.style.opacity = '1';
            }, 600);
        };

        document.getElementById('star-github').onclick = (e) => {
            e.preventDefault();
            vscode.postMessage({ command: 'openLink', url: 'https://github.com/TXAVLOG/txa-auto-accept' });
        };

        document.getElementById('btn-clear-log').onclick = () => {
            vscode.postMessage({ command: 'clearLog' });
        };

        const btnResetCounter = document.getElementById('btn-reset-counter');
        btnResetCounter.onclick = () => {
            state.clicks = 0;
            state.denied = 0;
            document.getElementById('val-acc').innerText = '0';
            document.getElementById('val-den').innerText = '0';
            vscode.postMessage({ command: 'resetCounter' });
        };

        // CSS for spin animation
        const style = document.createElement('style');
        style.innerHTML = '@keyframes spin { 100% { transform: rotate(360deg); } }';
        document.head.appendChild(style);

        // Initial render
        renderLogs();
        renderDenyList();
    </script>
</body>
</html>`;
}

module.exports = { getWebviewContent };

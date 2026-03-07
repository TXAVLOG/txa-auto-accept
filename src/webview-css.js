module.exports = function getCSS() {
    return `
:root {
    --bg-base: #06080f;
    --glass-bg: rgba(12, 18, 35, 0.72);
    --glass-border: rgba(255,255,255,0.07);
    --glass-highlight: rgba(255,255,255,0.04);
    --primary: #6366f1;
    --primary-glow: rgba(99,102,241,0.45);
    --secondary: #06b6d4;
    --secondary-glow: rgba(6,182,212,0.35);
    --success: #22d3ee;
    --success-bg: rgba(34,211,238,0.08);
    --success-glow: rgba(34,211,238,0.4);
    --danger: #f43f5e;
    --danger-bg: rgba(244,63,94,0.08);
    --danger-glow: rgba(244,63,94,0.4);
    --accent: #a78bfa;
    --accent-glow: rgba(167,139,250,0.4);
    --warning: #fbbf24;
    --text-main: #f1f5f9;
    --text-muted: #64748b;
    --text-dim: #94a3b8;
    --radius-xl: 28px;
    --radius-lg: 18px;
    --radius-md: 12px;
    --radius-sm: 8px;
}
*{box-sizing:border-box;margin:0;padding:0}
body{
    font-family:'Inter',system-ui,-apple-system,sans-serif;
    background:var(--bg-base);
    color:var(--text-main);
    padding:1.5rem 1rem;
    display:flex;justify-content:center;align-items:flex-start;
    min-height:100vh;overflow-x:hidden;overflow-y:auto;
    position:relative;
}
#aurora-bg{position:fixed;top:0;left:0;width:100%;height:100%;z-index:0;pointer-events:none;overflow:hidden}
.aurora-orb{position:absolute;border-radius:50%;filter:blur(120px);opacity:0.35;animation:orbFloat 12s ease-in-out infinite alternate}
.aurora-orb:nth-child(1){width:500px;height:500px;background:radial-gradient(circle,rgba(99,102,241,0.6),transparent 70%);top:-10%;left:-5%;animation-duration:14s}
.aurora-orb:nth-child(2){width:400px;height:400px;background:radial-gradient(circle,rgba(6,182,212,0.5),transparent 70%);top:40%;right:-10%;animation-duration:18s;animation-delay:-4s}
.aurora-orb:nth-child(3){width:350px;height:350px;background:radial-gradient(circle,rgba(167,139,250,0.4),transparent 70%);bottom:-5%;left:30%;animation-duration:16s;animation-delay:-8s}
.aurora-orb:nth-child(4){width:250px;height:250px;background:radial-gradient(circle,rgba(244,63,94,0.25),transparent 70%);top:20%;left:50%;animation-duration:20s;animation-delay:-2s}
@keyframes orbFloat{0%{transform:translate(0,0) scale(1)}50%{transform:translate(40px,-30px) scale(1.15)}100%{transform:translate(-20px,20px) scale(0.9)}}
#particles-canvas{position:fixed;top:0;left:0;width:100%;height:100%;z-index:1;pointer-events:none}
::-webkit-scrollbar{width:5px}
::-webkit-scrollbar-track{background:transparent}
::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.08);border-radius:10px}
::-webkit-scrollbar-thumb:hover{background:rgba(255,255,255,0.15)}
.container{
    width:100%;max-width:720px;
    background:var(--glass-bg);
    backdrop-filter:blur(40px) saturate(200%);
    -webkit-backdrop-filter:blur(40px) saturate(200%);
    border:1px solid var(--glass-border);
    border-radius:var(--radius-xl);
    box-shadow:0 40px 80px -20px rgba(0,0,0,0.7),0 0 0 1px rgba(255,255,255,0.05) inset,0 0 80px rgba(99,102,241,0.05);
    overflow:hidden;position:relative;z-index:10;
    animation:appIn .7s cubic-bezier(.16,1,.3,1);
}
.container::before{content:'';position:absolute;top:0;left:5%;width:90%;height:1px;background:linear-gradient(90deg,transparent,rgba(255,255,255,0.25),transparent);z-index:10}
.container::after{content:'';position:absolute;top:0;left:0;right:0;height:200px;background:linear-gradient(180deg,rgba(99,102,241,0.04),transparent);pointer-events:none;z-index:0}
@keyframes appIn{0%{opacity:0;transform:translateY(50px) scale(.96)}100%{opacity:1;transform:translateY(0) scale(1)}}
header{padding:1.5rem 2rem;display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid var(--glass-border);position:relative;z-index:2}
.brand{display:flex;align-items:center;gap:1rem}
.logo-wrapper{
    width:52px;height:52px;border-radius:16px;
    background:linear-gradient(135deg,rgba(99,102,241,0.2),rgba(167,139,250,0.15));
    display:flex;align-items:center;justify-content:center;
    box-shadow:0 0 30px rgba(99,102,241,0.2),inset 0 0 20px rgba(255,255,255,0.05);
    border:1px solid rgba(255,255,255,0.1);
    position:relative;overflow:hidden;
    animation:logoPulse 4s ease-in-out infinite;
}
.logo-wrapper::after{content:'';position:absolute;top:-50%;left:-50%;width:200%;height:200%;background:linear-gradient(45deg,transparent 40%,rgba(255,255,255,0.12) 50%,transparent 60%);animation:shine 5s infinite}
@keyframes shine{0%{transform:rotate(45deg) translateX(-120%)}100%{transform:rotate(45deg) translateX(120%)}}
@keyframes logoPulse{0%,100%{box-shadow:0 0 30px rgba(99,102,241,0.2),inset 0 0 20px rgba(255,255,255,0.05)}50%{box-shadow:0 0 45px rgba(99,102,241,0.35),inset 0 0 20px rgba(255,255,255,0.08)}}
.brand-text h1{font-size:1.25rem;font-weight:800;letter-spacing:-.03em;background:linear-gradient(135deg,#818cf8,#c084fc,#22d3ee);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-size:200% 200%;animation:gradText 6s ease infinite}
@keyframes gradText{0%,100%{background-position:0% 50%}50%{background-position:100% 50%}}
.brand-text span{font-size:.7rem;font-family:'JetBrains Mono',monospace;color:var(--text-muted);font-weight:500;background:rgba(255,255,255,0.04);padding:3px 8px;border-radius:6px;margin-top:4px;display:inline-block;border:1px solid rgba(255,255,255,0.06)}
.nav-tabs{display:flex;background:rgba(0,0,0,0.25);padding:4px;border-radius:14px;border:1px solid var(--glass-border);gap:2px}
.tab{padding:.55rem 1rem;border:none;background:transparent;color:var(--text-muted);font-weight:600;font-size:.78rem;letter-spacing:.03em;cursor:pointer;border-radius:10px;transition:all .3s cubic-bezier(.4,0,.2,1);position:relative;white-space:nowrap}
.tab:hover{color:var(--text-main);background:rgba(255,255,255,0.04)}
.tab.active{background:rgba(99,102,241,0.15);color:#c7d2fe;box-shadow:0 4px 15px rgba(99,102,241,0.15),inset 0 1px 0 rgba(255,255,255,0.08);border:1px solid rgba(99,102,241,0.2)}
.panel{display:none;padding:2rem;animation:fadePanel .45s cubic-bezier(.16,1,.3,1);min-height:460px;position:relative;z-index:2}
.panel.active{display:block}
@keyframes fadePanel{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
.stats{display:grid;grid-template-columns:1fr 1fr;gap:1.2rem;margin-bottom:2rem}
.stat-card{background:rgba(255,255,255,0.02);border:1px solid var(--glass-border);padding:1.8rem 1.2rem;border-radius:var(--radius-lg);display:flex;flex-direction:column;align-items:center;justify-content:center;transition:all .4s cubic-bezier(.175,.885,.32,1.275);position:relative;overflow:hidden;cursor:default}
.stat-card::before{content:'';position:absolute;top:0;left:0;right:0;bottom:0;border-radius:inherit;opacity:0;transition:opacity .4s}
.stat-card.acc::before{background:radial-gradient(circle at 50% 0%,rgba(34,211,238,0.12),transparent 70%)}
.stat-card.den::before{background:radial-gradient(circle at 50% 0%,rgba(244,63,94,0.12),transparent 70%)}
.stat-card:hover{transform:translateY(-6px) scale(1.02);border-color:rgba(255,255,255,0.12)}
.stat-card:hover::before{opacity:1}
.stat-card.acc:hover{box-shadow:0 20px 40px rgba(34,211,238,0.08)}
.stat-card.den:hover{box-shadow:0 20px 40px rgba(244,63,94,0.08)}
.stat-val{font-size:3rem;font-weight:800;font-family:'JetBrains Mono',monospace;line-height:1;margin-bottom:.5rem;letter-spacing:-2px;position:relative;z-index:1}
.stat-acc{color:var(--success);text-shadow:0 0 30px rgba(34,211,238,0.5)}
.stat-den{color:var(--danger);text-shadow:0 0 30px rgba(244,63,94,0.5)}
.stat-lbl{font-size:.78rem;color:var(--text-dim);font-weight:600;text-transform:uppercase;letter-spacing:.12em;position:relative;z-index:1}
@keyframes popupVal{0%{transform:scale(1)}50%{transform:scale(1.2);filter:brightness(1.6)}100%{transform:scale(1)}}
.stat-val.changed{animation:popupVal .5s cubic-bezier(.175,.885,.32,1.275)}
.threat-meter{margin-bottom:2rem;padding:1.2rem 1.5rem;background:rgba(0,0,0,0.2);border-radius:var(--radius-md);border:1px solid var(--glass-border)}
.threat-bar-track{height:6px;background:rgba(255,255,255,0.06);border-radius:3px;overflow:hidden;margin-top:.8rem}
.threat-bar-fill{height:100%;border-radius:3px;transition:width .8s cubic-bezier(.16,1,.3,1),background .5s;background:linear-gradient(90deg,var(--success),var(--primary))}
.threat-label{display:flex;justify-content:space-between;align-items:center;font-size:.8rem;font-weight:600;color:var(--text-dim)}
.threat-level-text{font-family:'JetBrains Mono',monospace;font-size:.75rem;padding:2px 8px;border-radius:4px;background:rgba(34,211,238,0.1);color:var(--success)}
.engine-status{display:flex;align-items:center;justify-content:center;gap:10px;font-size:.75rem;font-weight:600;color:var(--text-muted);margin-bottom:1.5rem;padding:.5rem 1.2rem;background:rgba(0,0,0,0.2);border-radius:20px;border:1px solid var(--glass-border);width:fit-content;margin-left:auto;margin-right:auto}
.status-dot{width:8px;height:8px;background:var(--success);border-radius:50%;box-shadow:0 0 12px var(--success-glow);animation:pulse 2s infinite}
@keyframes pulse{0%,100%{transform:scale(1);opacity:1}50%{transform:scale(1.5);opacity:.5}}
.action-row{display:flex;gap:.8rem;margin-bottom:1.5rem;justify-content:center;flex-wrap:wrap}
.btn-action{background:rgba(255,255,255,0.04);border:1px solid var(--glass-border);color:var(--text-muted);cursor:pointer;font-size:.75rem;font-weight:600;padding:.5rem 1rem;border-radius:var(--radius-sm);transition:all .25s;display:flex;align-items:center;gap:.5rem;backdrop-filter:blur(5px)}
.btn-action:hover{background:rgba(255,255,255,0.08);color:var(--text-main);transform:translateY(-2px);box-shadow:0 6px 20px rgba(0,0,0,0.3)}
.btn-action.star{color:#fbbf24;border-color:rgba(251,191,36,0.2);background:rgba(251,191,36,0.06)}
.btn-action.star:hover{background:rgba(251,191,36,0.15);box-shadow:0 6px 20px rgba(251,191,36,0.15)}
.log-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:1rem}
.log-header h3{font-size:1rem;font-weight:700;display:flex;align-items:center;gap:8px}
.log-header h3::before{content:'';display:block;width:8px;height:8px;background:var(--primary);border-radius:50%;box-shadow:0 0 10px var(--primary-glow)}
.log-list{background:rgba(0,0,0,0.25);border-radius:var(--radius-md);height:220px;overflow-y:auto;border:1px solid var(--glass-border);padding:.4rem;box-shadow:inset 0 4px 15px rgba(0,0,0,0.3)}
.log-item{padding:.7rem 1rem;border-radius:var(--radius-sm);margin-bottom:4px;display:flex;align-items:center;gap:1rem;font-size:.82rem;background:rgba(255,255,255,0.01);animation:slideIn .3s cubic-bezier(.16,1,.3,1);border:1px solid transparent;transition:all .2s}
.log-item:hover{background:rgba(255,255,255,0.03)}
@keyframes slideIn{from{opacity:0;transform:translateX(-15px)}to{opacity:1;transform:translateX(0)}}
.log-item.denied{background:linear-gradient(90deg,rgba(244,63,94,0.04),transparent);border-left:3px solid var(--danger)}
.log-item.accepted{background:linear-gradient(90deg,rgba(34,211,238,0.04),transparent);border-left:3px solid var(--success)}
.log-time{font-family:'JetBrains Mono',monospace;font-size:.72rem;color:var(--text-muted);min-width:60px;opacity:.7}
.log-cmd{flex:1;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;font-family:'JetBrains Mono',monospace;font-weight:500;font-size:.8rem}
.log-status{font-size:.65rem;font-weight:800;text-transform:uppercase;padding:2px 8px;border-radius:4px;letter-spacing:.05em}
.log-item.denied .log-status{background:rgba(244,63,94,0.1);color:var(--danger)}
.log-item.accepted .log-status{background:rgba(34,211,238,0.1);color:var(--success)}
.config-list{display:flex;flex-direction:column;gap:.8rem}
.config-row{display:flex;align-items:center;justify-content:space-between;padding:1.2rem 1.4rem;background:rgba(255,255,255,0.02);border:1px solid var(--glass-border);border-radius:var(--radius-md);transition:all .25s}
.config-row:hover{transform:translateX(4px);background:rgba(255,255,255,0.03);border-color:rgba(255,255,255,0.12)}
.row-info h3{margin:0 0 .3rem 0;font-size:.95rem;font-weight:600}
.row-info p{margin:0;font-size:.78rem;color:var(--text-muted);line-height:1.5}
select,input[type="number"],input[type="text"]{background:rgba(0,0,0,0.3);border:1px solid var(--glass-border);color:var(--text-main);padding:.65rem 1rem;border-radius:var(--radius-sm);font-family:'Inter',sans-serif;font-size:.85rem;font-weight:500;outline:none;transition:all .25s;box-shadow:inset 0 2px 6px rgba(0,0,0,0.25)}
select:focus,input[type="number"]:focus,input[type="text"]:focus{border-color:var(--primary);box-shadow:0 0 0 3px var(--primary-glow),inset 0 2px 6px rgba(0,0,0,0.25)}
select option{background:var(--bg-base)}
.switch{position:relative;display:inline-block;width:50px;height:28px}
.switch input{opacity:0;width:0;height:0}
.slider{position:absolute;cursor:pointer;top:0;left:0;right:0;bottom:0;background-color:rgba(255,255,255,0.08);border-radius:28px;transition:.4s;border:1px solid var(--glass-border)}
.slider:before{position:absolute;content:"";height:20px;width:20px;left:3px;bottom:3px;background-color:var(--text-dim);border-radius:50%;transition:.4s cubic-bezier(.34,1.56,.64,1);box-shadow:0 2px 8px rgba(0,0,0,0.3)}
input:checked+.slider{background:linear-gradient(135deg,var(--primary),var(--accent));border-color:var(--primary)}
input:checked+.slider:before{background-color:#fff;transform:translateX(22px);box-shadow:0 2px 12px rgba(99,102,241,0.4)}
.btn-main{width:100%;padding:1.1rem;border-radius:var(--radius-md);border:none;background:linear-gradient(135deg,var(--primary),#8b5cf6,var(--secondary));background-size:200% 200%;animation:btnGrad 4s ease infinite;color:#fff;font-weight:700;font-size:1rem;cursor:pointer;margin-top:1.5rem;box-shadow:0 6px 20px rgba(99,102,241,0.3);transition:all .3s;position:relative;overflow:hidden;display:flex;justify-content:center;align-items:center;gap:10px}
@keyframes btnGrad{0%,100%{background-position:0% 50%}50%{background-position:100% 50%}}
.btn-main::after{content:'';position:absolute;top:0;left:-100%;width:60%;height:100%;background:linear-gradient(90deg,transparent,rgba(255,255,255,0.2),transparent);transition:left .6s}
.btn-main:hover{transform:translateY(-3px);box-shadow:0 10px 30px rgba(99,102,241,0.4)}
.btn-main:hover::after{left:120%}
.btn-main:active{transform:translateY(1px)}
.shield-inputs{display:flex;gap:.8rem;margin-bottom:1.2rem;background:rgba(0,0,0,0.2);padding:1rem;border-radius:var(--radius-md);border:1px solid var(--glass-border)}
.input-wrapper{position:relative;flex:1}
.suggest-hint{position:absolute;left:1rem;top:50%;transform:translateY(-50%);font-size:.85rem;font-family:'JetBrains Mono',monospace;pointer-events:none;color:rgba(255,255,255,0.12);z-index:1;white-space:nowrap;overflow:hidden}
.input-wrapper input{width:100%;position:relative;z-index:2;background:transparent}
.btn-plus{background:rgba(99,102,241,0.12);border:1px solid rgba(99,102,241,0.25);color:var(--primary);width:44px;border-radius:var(--radius-sm);cursor:pointer;font-size:1.4rem;font-weight:400;transition:all .25s;display:flex;align-items:center;justify-content:center}
.btn-plus:hover{background:var(--primary);color:#fff;transform:translateY(-2px);box-shadow:0 6px 15px var(--primary-glow)}
.shield-search{margin-bottom:1rem}
.shield-search input{width:100%;padding:.7rem 1rem .7rem 2.5rem;background:rgba(0,0,0,0.2);border:1px solid var(--glass-border);border-radius:var(--radius-sm);color:var(--text-main);font-size:.85rem}
.shield-search svg{position:absolute;left:.8rem;top:50%;transform:translateY(-50%);color:var(--text-muted)}
.deny-grid{display:flex;flex-direction:column;gap:.5rem;max-height:300px;overflow-y:auto;padding-right:.3rem}
.deny-item{display:flex;align-items:center;justify-content:space-between;background:rgba(255,255,255,0.02);border:1px solid var(--glass-border);padding:.9rem 1rem;border-radius:var(--radius-sm);animation:fadeIn .3s ease-out;transition:all .25s;position:relative;overflow:hidden}
.deny-item::before{content:'';position:absolute;left:0;top:0;bottom:0;width:3px}
.deny-item.system::before{background:var(--text-muted)}
.deny-item.custom::before{background:linear-gradient(180deg,var(--accent),var(--primary))}
.deny-item:hover{background:rgba(255,255,255,0.04);border-color:rgba(255,255,255,0.12);transform:translateX(4px)}
.deny-item.removing{animation:fadeOut .3s ease-in forwards}
@keyframes fadeIn{from{opacity:0;transform:translateY(5px)}to{opacity:1;transform:translateY(0)}}
@keyframes fadeOut{to{opacity:0;transform:scale(.95) translateX(-10px)}}
.deny-info{display:flex;align-items:center;gap:.8rem;overflow:hidden}
.deny-badge{font-size:.6rem;font-weight:800;padding:2px 6px;border-radius:4px;text-transform:uppercase;letter-spacing:.05em}
.badge-system{background:rgba(100,116,139,0.15);color:var(--text-muted)}
.badge-custom{background:rgba(167,139,250,0.15);color:#c4b5fd}
.deny-label{font-weight:600;font-size:.82rem;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;font-family:'JetBrains Mono',monospace}
.btn-remove{background:transparent;border:none;color:var(--text-muted);cursor:pointer;width:28px;height:28px;border-radius:50%;display:flex;align-items:center;justify-content:center;transition:all .2s}
.btn-remove:hover{background:rgba(244,63,94,0.1);color:var(--danger)}
#txa-tooltip{position:fixed;pointer-events:none;z-index:2000;background:rgba(10,15,30,0.9);backdrop-filter:blur(20px);border:1px solid var(--glass-border);padding:.5rem .9rem;color:#fff;border-radius:8px;font-size:.78rem;font-weight:500;opacity:0;transform:scale(.95);transition:opacity .12s,transform .12s;box-shadow:0 12px 35px rgba(0,0,0,0.7);white-space:nowrap}
.about-panel{text-align:center;padding:2rem 1rem}
.about-logo{width:80px;height:80px;margin:0 auto 1.5rem;border-radius:22px;background:linear-gradient(135deg,rgba(99,102,241,0.2),rgba(167,139,250,0.15));display:flex;align-items:center;justify-content:center;box-shadow:0 0 40px rgba(99,102,241,0.2);border:1px solid rgba(255,255,255,0.1);animation:logoPulse 4s ease-in-out infinite}
.about-title{font-size:1.4rem;font-weight:800;margin-bottom:.5rem;background:linear-gradient(135deg,#818cf8,#c084fc,#22d3ee);-webkit-background-clip:text;-webkit-text-fill-color:transparent}
.about-version{font-size:.8rem;color:var(--text-muted);font-family:'JetBrains Mono',monospace;margin-bottom:1.5rem;background:rgba(255,255,255,0.04);display:inline-block;padding:4px 12px;border-radius:6px;border:1px solid var(--glass-border)}
.about-desc{font-size:.9rem;color:var(--text-dim);line-height:1.7;max-width:400px;margin:0 auto 2rem}
.about-links{display:flex;gap:.8rem;justify-content:center;flex-wrap:wrap;margin-bottom:2rem}
.about-link{padding:.6rem 1.2rem;border-radius:10px;font-size:.8rem;font-weight:600;cursor:pointer;border:1px solid var(--glass-border);background:rgba(255,255,255,0.03);color:var(--text-dim);transition:all .25s;display:flex;align-items:center;gap:6px;text-decoration:none}
.about-link:hover{background:rgba(255,255,255,0.08);color:var(--text-main);transform:translateY(-2px)}
.about-footer{font-size:.75rem;color:var(--text-muted);margin-top:1rem}
.uptime-display{font-family:'JetBrains Mono',monospace;font-size:.82rem;color:var(--text-dim);text-align:center;margin-bottom:1rem;padding:.5rem;background:rgba(0,0,0,0.15);border-radius:8px;border:1px solid var(--glass-border)}
.footer-bar{padding:1rem 2rem;border-top:1px solid var(--glass-border);display:flex;justify-content:space-between;align-items:center;font-size:.7rem;color:var(--text-muted);background:rgba(0,0,0,0.15);position:relative;z-index:2}
.footer-bar a{color:var(--accent);text-decoration:none}
.shield-inputs .input-wrapper input{background:rgba(0,0,0,0.25);border:1px solid var(--glass-border);border-radius:var(--radius-sm);padding:.7rem 1rem;font-family:'JetBrains Mono',monospace;font-size:.82rem;color:var(--text-main);transition:all .3s ease;box-shadow:inset 0 2px 6px rgba(0,0,0,0.2)}
.shield-inputs .input-wrapper input:focus{border-color:var(--accent);box-shadow:0 0 0 3px var(--accent-glow),inset 0 2px 6px rgba(0,0,0,0.2);background:rgba(0,0,0,0.35)}
.shield-inputs .input-wrapper input::placeholder{color:rgba(255,255,255,0.18);font-style:italic}
.suggest-hint{background:linear-gradient(90deg,rgba(167,139,250,0.15),transparent);border-radius:4px;padding:0 4px;transition:opacity .2s}
.shield-inputs{background:linear-gradient(135deg,rgba(0,0,0,0.2),rgba(99,102,241,0.03));border:1px solid rgba(99,102,241,0.1);box-shadow:inset 0 1px 0 rgba(255,255,255,0.03)}
.shield-inputs:focus-within{border-color:rgba(99,102,241,0.2);box-shadow:inset 0 1px 0 rgba(255,255,255,0.03),0 0 20px rgba(99,102,241,0.05)}
.suggest-tab-hint{position:absolute;right:.6rem;top:50%;transform:translateY(-50%);font-size:.6rem;font-weight:700;color:rgba(167,139,250,0.5);background:rgba(167,139,250,0.08);padding:2px 6px;border-radius:4px;border:1px solid rgba(167,139,250,0.12);pointer-events:none;opacity:0;transition:opacity .2s;z-index:3}
.input-wrapper:focus-within .suggest-tab-hint{opacity:1}
.deny-counter{font-size:.7rem;color:var(--text-muted);font-family:'JetBrains Mono',monospace;text-align:right;margin-bottom:.5rem;padding:0 .3rem}
@keyframes spin{100%{transform:rotate(360deg)}}
`;
};

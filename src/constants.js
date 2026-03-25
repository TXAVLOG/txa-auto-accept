module.exports = {
    BUILTIN_DENY: [
        { label: 'rm -rf', pattern: '/\\brm\\s+-[a-z]*r[a-z]*f\\b/i' },
        { label: 'rm -fr', pattern: '/\\brm\\s+-[a-z]*f[a-z]*r\\b/i' },
        { label: 'shred', pattern: '/\\bshred\\b/i' },
        { label: 'find -delete', pattern: '/\\bfind\\b.*-delete\\b/i' },
        { label: '> /dev/sd*', pattern: '/>\\s*\\/dev\\/sd[a-z]/i' },
        { label: '> /dev/nvme', pattern: '/>\\s*\\/dev\\/nvme/i' },
        { label: 'dd if=', pattern: '/\\bdd\\s+if=/i' },
        { label: 'mkfs', pattern: '/\\bmkfs\\b/i' },
        { label: 'curl | sh', pattern: '/\\bcurl\\b.*\\|\\s*(ba|da|z)?sh/i' },
        { label: 'wget | sh', pattern: '/\\bwget\\b.*\\|\\s*(ba|da|z)?sh/i' },
        { label: 'sudo su', pattern: '/\\bsudo\\s+su\\b/i' },
        { label: 'chmod 777', pattern: '/\\bchmod\\s+(777|a\\+[rwx]{1,3})\\b/i' },
        { label: 'chown root', pattern: '/\\bchown\\s+root\\b/i' },
        { label: 'passwd', pattern: '/\\bpasswd\\b/i' },
        { label: 'apt remove', pattern: '/\\bapt(-get)?\\s+(remove|purge|autoremove)\\b/i' },
        { label: 'yum remove', pattern: '/\\byum\\s+(remove|erase)\\b/i' },
        { label: 'dnf remove', pattern: '/\\bdnf\\s+(remove|erase)\\b/i' },
        { label: 'pacman -R', pattern: '/\\bpacman\\s+-R/i' },
        { label: 'killall', pattern: '/\\bkillall\\b/i' },
        { label: 'pkill -9', pattern: '/\\bpkill\\s+-9\\b/i' },
        { label: 'iptables -F', pattern: '/\\biptables\\s+-F\\b/i' },
        { label: 'ufw disable', pattern: '/\\bufw\\s+disable\\b/i' },
        { label: 'crontab -r', pattern: '/\\bcrontab\\s+-r\\b/i' },
        { label: 'systemctl stop', pattern: '/\\bsystemctl\\s+(disable|mask|stop)\\s+/i' },
        { label: 'shutdown/reboot', pattern: '/\\b(shutdown|reboot|halt|poweroff|init\\s+[06])\\b/i' },
        { label: 'del /f/s/q', pattern: '/\\bdel\\s+\\/[fsq]/i' },
        { label: 'rd /s /q', pattern: '/\\brd\\s+\\/s\\s+\\/q\\b/i' },
        { label: 'rmdir /s', pattern: '/\\brmdir\\s+\\/s\\b/i' },
        { label: 'Remove-Item -R', pattern: '/Remove-Item\\s+.*-Recurse/i' },
        { label: 'Remove-Item -F', pattern: '/Remove-Item\\s+.*-Force/i' },
        { label: 'format C:', pattern: '/\\bformat\\s+[a-z]:/i' },
        { label: 'diskpart', pattern: '/\\bdiskpart\\b/i' },
        { label: 'reg delete', pattern: '/\\breg\\s+(delete|add)\\b/i' },
        { label: 'shutdown /r', pattern: '/\\bshutdown\\s+\\/[rsf]/i' },
        { label: 'Stop-Computer', pattern: '/Stop-Computer\\b/i' },
        { label: 'netsh fw off', pattern: '/netsh\\s+advfirewall\\s+set\\s+.*off\\b/i' },
        { label: 'taskkill /f', pattern: '/\\btaskkill\\s+\\/f\\b/i' },
        { label: 'net user /add', pattern: '/\\bnet\\s+user\\s+.*(\\/add|\\/delete)\\b/i' },
        { label: 'Invoke-Expr', pattern: '/Invoke-Expression\\b/i' },
        { label: 'IEX(', pattern: '/\\biex\\b\\s*\\(/i' },
        { label: 'DownloadString', pattern: '/DownloadString\\b.*Invoke/i' },
        { label: 'DROP TABLE', pattern: '/DROP\\s+(TABLE|DATABASE|SCHEMA)\\b/i' },
        { label: 'TRUNCATE TABLE', pattern: '/TRUNCATE\\s+TABLE\\b/i' },
        { label: 'git push -f', pattern: '/\\bgit\\s+push\\s+.*--force\\b/i' },
        { label: 'git reset hard', pattern: '/\\bgit\\s+reset\\s+--hard\\b/i' },
        { label: 'git clean -f', pattern: '/\\bgit\\s+clean\\s+-[a-z]*f/i' },
        { label: 'git checkout', pattern: '/\\bgit\\s+checkout\\b/i' },
        { label: 'git branch', pattern: '/\\bgit\\s+branch\\b/i' },
        { label: 'git merge', pattern: '/\\bgit\\s+merge\\b/i' },
        { label: 'git rebase', pattern: '/\\bgit\\s+rebase\\b/i' },
    ],
    LOGO_SVG: `<svg width="44" height="44" viewBox="0 0 128 128" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
            <linearGradient id="shieldGrad" x1="16" y1="8" x2="112" y2="120" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stop-color="#60a5fa"/>
                <stop offset="50%" stop-color="#a78bfa"/>
                <stop offset="100%" stop-color="#f472b6"/>
            </linearGradient>
            <linearGradient id="boltGrad" x1="48" y1="36" x2="80" y2="92" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stop-color="#fbbf24"/>
                <stop offset="100%" stop-color="#f97316"/>
            </linearGradient>
            <filter id="glow">
                <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                <feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge>
            </filter>
        </defs>
        <path d="M64 8L16 28V60C16 88.4 36.4 114.8 64 120C91.6 114.8 112 88.4 112 60V28L64 8Z" fill="url(#shieldGrad)" fill-opacity="0.15" stroke="url(#shieldGrad)" stroke-width="3.5" filter="url(#glow)"/>
        <path d="M64 36L46 68H58L54 92L82 56H66L72 36H64Z" fill="url(#boltGrad)" stroke="url(#boltGrad)" stroke-width="1.5" stroke-linejoin="round" filter="url(#glow)"/>
    </svg>`
};

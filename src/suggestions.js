module.exports = [
    // === Linux / macOS Destructive (Not in Builtin) ===
    { label: 'Force Delete', pattern: '/rm -f .*/i' },
    { label: 'Fork Bomb', pattern: '/:().*{.*:\\|:&.*};:/i' },
    { label: 'Overwrite passwd', pattern: '/.* > \\/etc\\/passwd/i' },
    { label: 'Shadow File Access', pattern: '/cat \\/etc\\/shadow/i' },
    { label: 'SSH Key Inject', pattern: '/echo .* >> .*authorized_keys/i' },
    { label: 'History Clear', pattern: '/history -c/i' },
    { label: 'Reverse Shell', pattern: '/bash -i >& \\/dev\\/tcp\\/.*/i' },
    { label: 'Netcat Backdoor', pattern: '/nc -e \\/bin\\/(ba)?sh .*/i' },
    { label: 'Python Rev Shell', pattern: '/python.*socket.*connect/i' },
    { label: 'Sudoers Edit', pattern: '/echo .* >> \\/etc\\/sudoers/i' },
    { label: 'Mount /dev/sda', pattern: '/mount \\/dev\\/sd.*/i' },
    { label: 'Swap Off', pattern: '/swapoff -a/i' },

    // === Windows Destructive (Not in Builtin) ===
    { label: 'Disable Windows Defender', pattern: '/Set-MpPreference.*-DisableRealtimeMonitoring/i' },
    { label: 'Stop Windows Update', pattern: '/net stop wuauserv/i' },
    { label: 'bcdedit Modify', pattern: '/bcdedit \\/(set|delete) .*/i' },
    { label: 'Cipher Wipe', pattern: '/cipher \\/w:.*/i' },
    { label: 'WMIC Process Kill', pattern: '/wmic process .* delete/i' },
    { label: 'Schtasks Delete', pattern: '/schtasks \\/delete .*/i' },

    // === Git Destructive (Not in Builtin) ===
    { label: 'Git Branch Delete', pattern: '/git branch -D .*/i' },
    { label: 'Git Remote Reset', pattern: '/git push origin --delete .*/i' },

    // === Database Destructive (Not in Builtin) ===
    { label: 'SQL Delete All', pattern: '/DELETE FROM .* WHERE 1/i' },
    { label: 'MongoDB Drop', pattern: '/db\\..*\\.drop\\(/i' },
    { label: 'Redis FlushAll', pattern: '/FLUSHALL/i' },

    // === Docker / Container ===
    { label: 'Docker System Prune', pattern: '/docker system prune -a/i' },
    { label: 'Docker Remove All', pattern: '/docker rm -f \\$\\(docker ps -aq\\)/i' },
    { label: 'Docker Image Prune', pattern: '/docker image prune -a/i' },
    { label: 'Kubectl Delete All', pattern: '/kubectl delete .* --all/i' },

    // === NPM / Node ===
    { label: 'NPM Cache Clean Force', pattern: '/npm cache clean --force/i' },
    { label: 'NPX Dangerous Script', pattern: '/npx .*(rimraf|del-cli) \\//i' },
    { label: 'Node Eval Dangerous', pattern: '/node -e.*require\\(.*child_process/i' },
];

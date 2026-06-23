/* =============================================
   LUNA ARENA — CORE SYSTEM
   Theme persistence + Smart Local Chatbot
============================================= */

/* =============================================
   THEME MANAGER
============================================= */
const ThemeManager = {
    KEY: 'lunaArenaTheme',

    init() {
        const saved = localStorage.getItem(this.KEY) || 'dark';
        this.apply(saved, false);
    },

    apply(theme, animate = true) {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem(this.KEY, theme);
        const btn = document.getElementById('themeToggle');
        if (btn) btn.textContent = theme === 'dark' ? '☀️' : '🌙';
    },

    toggle() {
        const current = localStorage.getItem(this.KEY) || 'dark';
        this.apply(current === 'dark' ? 'light' : 'dark');
    }
};

/* =============================================
   LUNA BOT — Smart Local Knowledge Engine
   No backend. No API key. Instant responses.
============================================= */
const LunaBot = {
    isOpen: false,

    KB: [
        {
            keys: ['what is luna', 'about luna', 'tell me about', 'luna arena', 'what is this', 'about this', 'explain'],
            answer: '🏟️ Luna Arena is a women\'s competitive esports organization for Season 2026. Our motto: "The Future of Competitive Play is Female." We host top-tier tournaments across Valorant, Apex Legends, CS2, and Fortnite.'
        },
        {
            keys: ['how to join', 'how do i join', 'join', 'sign up', 'register', 'become a player', 'enlist', 'apply', 'registration'],
            answer: '⚡ To join Luna Arena: head to the <b>Join page</b> (contact.html) and fill out the Recruitment form with your Gamer Tag, email, and a message. For a full account, go to <b>Sign Up</b> (signup.html). We welcome Player Registrations, Sponsorships, and Press inquiries!'
        },
        {
            keys: ['top player', 'best player', 'number one', '#1', 'rank 1', 'highest rank', 'who is the best', 'top rank', 'top operative'],
            answer: '👑 The #1 operative is <b>LUNA_VOID</b> — Valorant Sniper, Top Rank. 344 wins, 4.8 K/D, 920 hours played. Achievements: #1 Global, Ace Streak, Untouchable. "Her crosshair placement is surgical."'
        },
        {
            keys: ['how many players', 'total players', 'number of players', 'player count', 'how many operatives'],
            answer: '🎮 Luna Arena has <b>9 elite operatives</b> this season — 3 Top Rank, 4 Mid Rank, and 2 Low Rank — across Valorant, Apex Legends, CS2, and Fortnite.'
        },
        {
            keys: ['list players', 'all players', 'show players', 'who are the players', 'players list', 'goddesses', 'operatives'],
            answer: '⚡ The 9 Goddesses of Luna Arena:<br>👑 <b>LUNA_VOID</b> (Valorant · Sniper)<br>👑 <b>STARR_X</b> (Valorant · Duelist)<br>👑 <b>NOVA_RIFT</b> (Apex · IGL)<br>⚡ <b>MYST_KAI</b> (Apex · Support)<br>⚡ <b>VALE_RUN</b> (CS2 · Rifler)<br>⚡ <b>ZARA_NET</b> (CS2 · AWPer)<br>⚡ <b>LYRA_ACE</b> (Valorant · Controller)<br>🛡 <b>PIXL_DASH</b> (Fortnite · Builder)<br>🛡 <b>ECHO_7</b> (Fortnite · Rusher)'
        },
        {
            keys: ['luna_void', 'luna void', 'void'],
            answer: '👑 <b>LUNA_VOID</b> — Valorant Sniper, Top Rank<br>Wins: 344 | K/D: 4.8 | Hours: 920<br>Achievements: #1 Global, Ace Streak, Untouchable<br>"The undisputed queen. Her crosshair placement is surgical."'
        },
        {
            keys: ['starr_x', 'starr x', 'starr'],
            answer: '👑 <b>STARR_X</b> — Valorant Duelist, Top Rank<br>Wins: 298 | K/D: 4.1 | Hours: 810<br>Achievements: MVP x12, First Blood Queen, Top Fragger<br>"Entry frag specialist with an ego to match her stats."'
        },
        {
            keys: ['nova_rift', 'nova rift', 'nova'],
            answer: '👑 <b>NOVA_RIFT</b> — Apex Legends IGL, Top Rank<br>Wins: 270 | K/D: 3.7 | Hours: 780<br>Achievements: Tactical Genius, Season Champion, Zero Deaths<br>"The smartest player in any lobby."'
        },
        {
            keys: ['myst_kai', 'myst kai', 'myst'],
            answer: '⚡ <b>MYST_KAI</b> — Apex Legends Support, Mid Rank<br>Wins: 188 | K/D: 2.6 | Hours: 540<br>Achievements: Top Support, Clutch Factor<br>"Quiet in comms, loud in impact."'
        },
        {
            keys: ['vale_run', 'vale run', 'vale'],
            answer: '⚡ <b>VALE_RUN</b> — CS2 Rifler, Mid Rank<br>Wins: 201 | K/D: 2.9 | Hours: 610<br>Achievements: Deagle God, Mid Control, Rising Star<br>"Consistent. Methodical. Never tilts."'
        },
        {
            keys: ['zara_net', 'zara net', 'zara'],
            answer: '⚡ <b>ZARA_NET</b> — CS2 AWPer, Mid Rank<br>Wins: 175 | K/D: 2.4 | Hours: 490<br>Achievements: Cold Blood, Long Range Queen<br>"She doesn\'t miss — she never had to learn what missing feels like."'
        },
        {
            keys: ['lyra_ace', 'lyra ace', 'lyra'],
            answer: '⚡ <b>LYRA_ACE</b> — Valorant Controller, Mid Rank<br>Wins: 165 | K/D: 2.2 | Hours: 460<br>Achievements: Smoke Master, Map Control<br>"You think you have vision? You don\'t. Lyra took it."'
        },
        {
            keys: ['pixl_dash', 'pixl dash', 'pixl'],
            answer: '🛡 <b>PIXL_DASH</b> — Fortnite Builder, Low Rank<br>Wins: 82 | K/D: 1.5 | Hours: 310<br>Achievements: Builder Prodigy<br>"Still climbing — but the ceiling is nowhere in sight."'
        },
        {
            keys: ['echo_7', 'echo 7', 'echo'],
            answer: '🛡 <b>ECHO_7</b> — Fortnite Rusher, Low Rank<br>Wins: 65 | K/D: 1.1 | Hours: 240<br>Achievements: 100-0 Combo<br>"Chaotic playstyle, fearless execution."'
        },
        {
            keys: ['schedule', 'bracket', 'match', 'when', 'next game', 'tournament', 'fixtures', 'upcoming', 'dates'],
            answer: '📅 Season 2026 — Phase One:<br>• <b>Feb 20, 19:00</b> — Valkyrie Squad vs Stargazers<br>• <b>Feb 21, 21:00</b> — Nova Elite vs Mystic G2<br>• <b>GRAND FINALS</b> — Championship at 22:00<br>Check the Brackets page for the full timeline!'
        },
        {
            keys: ['grand final', 'championship', 'finals'],
            answer: '🏆 The <b>Grand Finals</b> is the Season 2026 Championship match at <b>22:00 PM</b> — the biggest showdown of Phase One!'
        },
        {
            keys: ['leaderboard', 'rankings', 'hall of fame', 'ranking', 'scores', 'top score'],
            answer: '🏆 The <b>Hall of Fame</b> (leaderboard.html) shows live Season 2026 rankings. Scores update in real time and are stored locally in your browser.'
        },
        {
            keys: ['games', 'which game', 'what games', 'valorant', 'apex', 'cs2', 'fortnite', 'counter strike'],
            answer: '🎮 Luna Arena competes in 4 games:<br>• <b>Valorant</b> — LUNA_VOID, STARR_X, LYRA_ACE<br>• <b>Apex Legends</b> — NOVA_RIFT, MYST_KAI<br>• <b>CS2</b> — VALE_RUN, ZARA_NET<br>• <b>Fortnite</b> — PIXL_DASH, ECHO_7'
        },
        {
            keys: ['sponsor', 'sponsorship', 'partner', 'partnership', 'advertise'],
            answer: '💼 Interested in sponsoring Luna Arena? Go to the <b>Join page</b>, select "Sponsorship Inquiry" from the dropdown, and fire your message to the council!'
        },
        {
            keys: ['pages', 'navigation', 'where', 'sections', 'menu', 'links', 'website'],
            answer: '🗺️ Luna Arena pages:<br>• <b>Main</b> — Home + Arena Map<br>• <b>Brackets</b> — Tournament schedule<br>• <b>Legends</b> — Player cards & stats<br>• <b>Leaderboard</b> — Hall of Fame<br>• <b>Join</b> — Recruitment & contact<br>• <b>Sign Up / Login</b> — Account access'
        },
        {
            keys: ['location', 'where is', 'map', 'address', 'city', 'london'],
            answer: '📍 Luna\'s Main Arena is in <b>London</b>. See the interactive map on the homepage — scroll down to "Arena Locator"!'
        },
        {
            keys: ['dark mode', 'light mode', 'theme', 'toggle', 'switch mode', 'change theme', 'night mode'],
            answer: '🌙 Use the <b>☀️ / 🌙 button</b> in the top nav to switch themes. Your preference saves automatically across all pages!'
        },
        {
            keys: ['hello', 'hi', 'hey', 'sup', 'greetings', 'yo', 'hola'],
            answer: '⚡ Connection established, operative! I\'m LUNA_ASSIST — your guide to Luna Arena. Ask me about players, the schedule, how to join, or anything about the site!'
        },
        {
            keys: ['help', 'what can you do', 'what do you know', 'commands', 'topics'],
            answer: '🤖 I can answer questions about:<br>• <b>Players</b> — stats, ranks, bios<br>• <b>Schedule</b> — match dates & times<br>• <b>Joining</b> — registration & sponsorship<br>• <b>Games</b> — Valorant, Apex, CS2, Fortnite<br>• <b>Navigation</b> — finding pages<br>• <b>Leaderboard</b> — rankings & scores<br>Just ask anything!'
        },
        {
            keys: ['season', '2026', 'current season'],
            answer: '📆 We\'re in <b>Season 2026 — Phase One</b>. Matches kick off in February with the Grand Finals as the grand finale. Phase Two announcements coming soon!'
        },
        {
            keys: ['password', 'account', 'login', 'forgot'],
            answer: '🔐 Passwords require 8+ characters with uppercase, lowercase, a number, and a special character (@#$%^&*!). For a new account, go to <b>Sign Up</b>. Already registered? Head to <b>Login</b>.'
        },
        {
            keys: ['press', 'media', 'journalist', 'interview'],
            answer: '📰 For press or media inquiries, go to the <b>Join page</b>, select "Press/Media" from the dropdown, and send your request. The Luna Arena council will respond!'
        }
    ],

    findAnswer(input) {
        const q = input.toLowerCase().trim();
        for (const entry of this.KB) {
            if (entry.keys.some(k => q.includes(k))) return entry.answer;
        }
        return null;
    },

    fallback(q) {
        const opts = [
            `Signal unclear on "<b>${q}</b>". Try asking: "how to join", "top player", "match schedule", "list all players", or "what is Luna Arena"!`,
            `I don't have data on that yet, operative. Ask me about <b>players, brackets, rankings, or joining</b> — I've got all of that locked in! ⚡`,
            `That's outside my database. Try: "who is the best player", "when is the grand finals", or "what games does Luna Arena play"?`
        ];
        return opts[Math.floor(Math.random() * opts.length)];
    },

    toggle() {
        const win = document.getElementById('botWin');
        this.isOpen = !this.isOpen;
        win.style.display = this.isOpen ? 'flex' : 'none';
        if (this.isOpen) document.getElementById('botInp').focus();
    },

    send() {
        const inp  = document.getElementById('botInp');
        const text = inp.value.trim();
        if (!text) return;
        inp.value = '';
        this.appendMsg(text, 'user', false);
        setTimeout(() => {
            const reply = this.findAnswer(text) || this.fallback(text);
            this.appendMsg(reply, 'bot', true);
        }, 280);
    },

    appendMsg(content, type, isHTML) {
        const msgs = document.getElementById('botMsgs');
        const div  = document.createElement('div');
        div.className = `msg ${type}`;
        if (isHTML) div.innerHTML = content;
        else        div.textContent = content;
        msgs.appendChild(div);
        msgs.scrollTop = msgs.scrollHeight;
    }
};

document.addEventListener('DOMContentLoaded', () => ThemeManager.init());

/* =============================================
   LUNA ARENA — PLAYER CARD SYSTEM
   Handles: data, filtering, rendering, animations
   Data source: localStorage (no backend)
============================================= */

/* =============================================
   PLAYER DATA
   Seeded into localStorage on first visit.
============================================= */
const DEFAULT_PLAYERS = [
    {
        id: 1,
        name: "LUNA_VOID",
        game: "Valorant",
        rank: "Top",
        avatar: "https://api.dicebear.com/7.x/lorelei/svg?seed=Luna",
        role: "SNIPER",
        tagline: "Queen of the Void",
        wins: 344, kd: "4.8", hours: "920",
        achievements: ["#1 Global", "Ace Streak", "Untouchable"],
        stats: { AIM: 97, SPEED: 88, IQ: 92, CLUTCH: 95 },
        bio: "The undisputed queen. Her crosshair placement is surgical — opponents never even see the bullet."
    },
    {
        id: 2,
        name: "STARR_X",
        game: "Valorant",
        rank: "Top",
        avatar: "https://api.dicebear.com/7.x/lorelei/svg?seed=Starr",
        role: "DUELIST",
        tagline: "Born to Entry Frag",
        wins: 298, kd: "4.1", hours: "810",
        achievements: ["MVP x12", "First Blood Queen", "Top Fragger"],
        stats: { AIM: 93, SPEED: 96, IQ: 84, CLUTCH: 89 },
        bio: "If the door's closed, she kicks it down. Entry frag specialist with an ego to match her stats."
    },
    {
        id: 3,
        name: "NOVA_RIFT",
        game: "Apex",
        rank: "Top",
        avatar: "https://api.dicebear.com/7.x/lorelei/svg?seed=Nova",
        role: "IGL",
        tagline: "The Strategist",
        wins: 270, kd: "3.7", hours: "780",
        achievements: ["Tactical Genius", "Season Champion", "Zero Deaths"],
        stats: { AIM: 86, SPEED: 80, IQ: 99, CLUTCH: 92 },
        bio: "IGL. Her tactical calls win games before the first bullet is fired. The smartest player in any lobby."
    },
    {
        id: 4,
        name: "MYST_KAI",
        game: "Apex",
        rank: "Mid",
        avatar: "https://api.dicebear.com/7.x/lorelei/svg?seed=Mystkai",
        role: "SUPPORT",
        tagline: "The Silent Carry",
        wins: 188, kd: "2.6", hours: "540",
        achievements: ["Top Support", "Clutch Factor"],
        stats: { AIM: 74, SPEED: 70, IQ: 88, CLUTCH: 86 },
        bio: "Quiet in comms, loud in impact. Her heals and utility win rounds her team didn't deserve."
    },
    {
        id: 5,
        name: "VALE_RUN",
        game: "CS2",
        rank: "Mid",
        avatar: "https://api.dicebear.com/7.x/lorelei/svg?seed=Valerun",
        role: "RIFLER",
        tagline: "Precision in Motion",
        wins: 201, kd: "2.9", hours: "610",
        achievements: ["Deagle God", "Mid Control", "Rising Star"],
        stats: { AIM: 82, SPEED: 78, IQ: 80, CLUTCH: 77 },
        bio: "Consistent. Methodical. The kind of player you want to be on your team — never tilts, always delivers."
    },
    {
        id: 6,
        name: "ZARA_NET",
        game: "CS2",
        rank: "Mid",
        avatar: "https://api.dicebear.com/7.x/lorelei/svg?seed=Zaranet",
        role: "AWPer",
        tagline: "One Shot. One Kill.",
        wins: 175, kd: "2.4", hours: "490",
        achievements: ["Cold Blood", "Long Range Queen"],
        stats: { AIM: 88, SPEED: 64, IQ: 82, CLUTCH: 80 },
        bio: "The AWP is her language. She doesn't miss — she never had to learn what missing feels like."
    },
    {
        id: 7,
        name: "PIXL_DASH",
        game: "Fortnite",
        rank: "Low",
        avatar: "https://api.dicebear.com/7.x/lorelei/svg?seed=Pixl",
        role: "BUILDER",
        tagline: "Brick by Brick",
        wins: 82, kd: "1.5", hours: "310",
        achievements: ["Builder Prodigy"],
        stats: { AIM: 60, SPEED: 72, IQ: 68, CLUTCH: 55 },
        bio: "She builds faster than most players think. Still climbing — but the ceiling is nowhere in sight."
    },
    {
        id: 8,
        name: "ECHO_7",
        game: "Fortnite",
        rank: "Low",
        avatar: "https://api.dicebear.com/7.x/lorelei/svg?seed=Echo7",
        role: "RUSHER",
        tagline: "Pure Aggression",
        wins: 65, kd: "1.1", hours: "240",
        achievements: ["100-0 Combo"],
        stats: { AIM: 58, SPEED: 80, IQ: 62, CLUTCH: 50 },
        bio: "Chaotic playstyle, fearless execution. She might die first — but she always makes them pay for it."
    },
    {
        id: 9,
        name: "LYRA_ACE",
        game: "Valorant",
        rank: "Mid",
        avatar: "https://api.dicebear.com/7.x/lorelei/svg?seed=Lyra",
        role: "CONTROLLER",
        tagline: "Smoke and Mirrors",
        wins: 165, kd: "2.2", hours: "460",
        achievements: ["Smoke Master", "Map Control"],
        stats: { AIM: 76, SPEED: 74, IQ: 90, CLUTCH: 78 },
        bio: "Smokes up every site, locks every angle. You think you have vision? You don't. Lyra took it."
    }
];

/* =============================================
   LOAD FROM DATABASE API
============================================= */
async function loadPlayers() {
    try {
        const res = await fetch('/api/players');
        const data = await res.json();
        // Map DB fields to the format buildCard expects
        return data.map(p => ({
            id: p.id,
            name: p.name,
            game: p.game,
            rank: p.rank,
            avatar: `https://api.dicebear.com/7.x/lorelei/svg?seed=${p.name}`,
            role: p.role.toUpperCase(),
            tagline: p.bio || '',
            wins: p.wins,
            kd: String(p.kd),
            hours: String(p.hours),
            score: p.score,
            achievements: p.achievements ? p.achievements.split(',').map(a => a.trim()) : [],
        }));
    } catch {
        return DEFAULT_PLAYERS;
    }
}
let allPlayers = [];

/* =============================================
   FILTER STATE
============================================= */
let filterState = { search: "", game: "all", rank: "all" };

/* =============================================
   FILTER + SORT
   Top rank always surfaces first.
============================================= */
function getFiltered() {
    const order = { Top: 0, Mid: 1, Low: 2 };
    return allPlayers
        .filter(p => {
            const s = p.name.toLowerCase().includes(filterState.search.toLowerCase())
                   || p.role.toLowerCase().includes(filterState.search.toLowerCase());
            const g = filterState.game === "all" || p.game === filterState.game;
            const r = filterState.rank === "all" || p.rank === filterState.rank;
            return s && g && r;
        })
        .sort((a, b) => (order[a.rank] ?? 9) - (order[b.rank] ?? 9));
}

/* =============================================
   BUILD CARD HTML
============================================= */
function buildCard(p, delay) {
    const rc      = `rank-${p.rank.toLowerCase()}`;
    const initials = p.name.slice(0, 2);
    const icon    = p.rank === "Top" ? "👑" : p.rank === "Mid" ? "⚡" : "🛡";

    // Stat bars
    const bars = Object.entries(p.stats).map(([k, v]) => `
        <div class="stat-row">
            <span class="stat-name">${k}</span>
            <div class="stat-track"><div class="stat-fill" style="width:${v}%"></div></div>
            <span class="stat-num">${v}</span>
        </div>`).join("");

    // Achievement tags
    const achs = p.achievements.map(a => `<span class="ach-tag">${a}</span>`).join("");

    return `
    <div class="card-wrap ${p.rank === "Top" ? "top-card" : ""}"
         style="animation-delay:${delay}ms" data-id="${p.id}">
      <div class="card-inner">

        <!-- FRONT: name / rank / quick stats -->
        <div class="card-face card-front ${rc}">
          <div class="rank-stripe"></div>
          <div class="avatar-zone">
            <div class="avatar-ring">
              <div class="avatar-inner">
                <img src="${p.avatar}" alt="${p.name}" loading="lazy">
              </div>
            </div>
            <div class="card-id">
              <div class="card-name">${p.name}</div>
              <div class="card-game">${p.game} · ${p.role}</div>
            </div>
            ${p.rank === "Top" ? '<span class="diamond-badge">💎</span>' : ""}
          </div>
          <span class="rank-label">${icon} ${p.rank} Rank</span>
          <div class="card-divider"></div>
          <div class="quick-stats">
            <div class="qs-item"><div class="qs-val">${p.wins}</div><div class="qs-lbl">Wins</div></div>
            <div class="qs-item"><div class="qs-val">${p.kd}</div><div class="qs-lbl">K/D</div></div>
            <div class="qs-item"><div class="qs-val">${p.hours}</div><div class="qs-lbl">Hours</div></div>
          </div>
          <div class="flip-hint">Hover to inspect ↻</div>
        </div>

        <!-- BACK: achievements / stat bars / bio -->
        <div class="card-face card-back ${rc}">
          <div class="back-top">
            <span class="back-name">${p.name}</span>
            <span class="back-hint">Hover out to close</span>
          </div>
          <div class="ach-list">${achs}</div>
          ${bars}
          <div class="back-bio">${p.bio}</div>
        </div>

      </div>
    </div>`;
}

/* =============================================
   RENDER CARDS
============================================= */
function renderCards() {
    const grid     = document.getElementById("playersGrid");
    const noRes    = document.getElementById("no-results");
    const countEl  = document.getElementById("resultsCount");
    const players  = getFiltered();

    // Update count label
    countEl.innerHTML = players.length > 0
        ? `Showing <span>${players.length}</span> operative${players.length !== 1 ? "s" : ""}`
        : "";

    // Clear
    grid.innerHTML = "";

    // No results state
    if (players.length === 0) {
        noRes.classList.add("show");
        const icon = noRes.querySelector(".no-res-icon");
        icon.style.animation = "none";
        requestAnimationFrame(() => { icon.style.animation = ""; });
        return;
    }
    noRes.classList.remove("show");

    // Build & inject cards with staggered delay
    grid.innerHTML = players.map((p, i) => buildCard(p, i * 55)).join("");
}

/* =============================================
   FILTER EVENTS — wired up after DOM ready
============================================= */
function initPlayerControls() {
    // Real-time search
    const searchEl = document.getElementById("searchInput");
    if (searchEl) {
        searchEl.addEventListener("input", function () {
            filterState.search = this.value;
            renderCards();
        });
    }

    // Pill filters
    document.querySelectorAll(".pill[data-filter]").forEach(btn => {
        btn.addEventListener("click", function () {
            const type = this.dataset.filter;
            const val  = this.dataset.value;
            filterState[type] = val;

            // Reset all pills in group
            document.querySelectorAll(`.pill[data-filter="${type}"]`).forEach(b => {
                b.classList.remove("active", "rank-top-on", "rank-mid-on");
            });

            // Apply correct active class
            if (type === "rank" && val === "Top")    this.classList.add("rank-top-on");
            else if (type === "rank" && val === "Mid") this.classList.add("rank-mid-on");
            else                                       this.classList.add("active");

            renderCards();
        });
    });
}

/* =============================================
   BOOT: shimmer → real cards
============================================= */
document.addEventListener("DOMContentLoaded", async () => {
    initPlayerControls();
    allPlayers = await loadPlayers();
    setTimeout(() => { renderCards(); }, 900);
});

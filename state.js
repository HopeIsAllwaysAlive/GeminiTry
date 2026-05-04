window.currentTab = 'jobs'; // De standaard tab bij het opstarten
let buyAmount = 1;

const ERA_DEFINITIONS = {
    1: { name: "Prehistorie" }, 2: { name: "Bronstijd" }, 3: { name: "IJzertijd" }, 4: { name: "Klassieke Oudheid" },
    5: { name: "Middeleeuwen" }, 6: { name: "Renaissance" }, 7: { name: "Verlichting" }, 8: { name: "Industrie" },
    9: { name: "Atoom" }, 10: { name: "Digitaal" }, 11: { name: "Toekomst" }
};

const TRAIT_DEFINITIONS = {
    master_builder: { name: "Meesterbouwer", desc: "Verlaagt alle bouwkosten met 10%." },
    metabolism: { name: "Efficiente Stofwisseling", desc: "Idle voedselconsumptie -20%." },
    knowledge_seeker: { name: "Kenniszoeker", desc: "Research opbrengst +20%." }
};

// --- DE DATA (HET BREIN VAN DE GAME) ---
let game = {
    era: 1,
    traits: [],
    stats: { battlesWon: 0, treatiesSigned: 0, aggressiveActions: 0 },

    resources: {
        food: { name: t("res_food"), amount: 50, max: 250, perSec: 0, manualGain: 1, discovered: true },
        wood: { name: t("res_wood"), amount: 50, max: 250, perSec: 0, manualGain: 1, discovered: true },
        beam: { name: t("res_beam"), amount: 0, max: 50, perSec: 0, discovered: false },
        stone: { name: t("res_stone"), amount: 0, max: 150, perSec: 0, manualGain: 1, discovered: true },
        brick: { name: t("res_brick"), amount: 0, max: 50, perSec: 0, discovered: false },
        population: { name: t("res_population"), amount: 2, max: 2, perSec: 0, discovered: true },
        gold: { name: t("res_gold"), amount: 0, max: 1000, perSec: 0, discovered: false },
        researchPoints: { name: t("res_research"), amount: 0, max: 0, perSec: 0, discovered: false },
        intel: { name: t("res_intel"), amount: 0, max: 100, perSec: 0, discovered: false }
    },
    calendar: {
        day: 0,
        year: 0,
        season: 0 // 0: Spring, 1: Summer, 2: Autumn, 3: Winter
    },
    seasonNames: [t("season_spring"), t("season_summer"), t("season_autumn"), t("season_winter")],
    jobs: {
        // Core jobs that might be considered era-independent or starter
        gatherer: { name: "Verzamelaar", count: 0, max: 2, effect: { food: 1.5, wood: 0.3, stone: 0.1 }, unlocked: true, desc: "Een all-round verzamelaar van basis grondstoffen." }
    },
    buildings: {
        // Base buildings
        hut: { name: "Hut", count: 1, cost: { wood: 50 }, provides: { max_population: 2 }, desc: "Woonruimte voor je bevolking.", unlocked: true }
    },

    research: {
        // Placeholder for core research
    },

    expeditions: {
        active: false,
        timer: 0,
        currentType: null,
        unlocked: true,
        types: {} // To be populated
    },
    diplomacy: {
        unlocked: false,
        discoveredTribes: {}
    },
    tribeTemplates: {
        // Templates can stay as they are general definitions
        forest_dwellers: {
            name: "De Bosjesmannen",
            desc: "Een vreedzame stam die diep in de wouden leeft.",
            relation: 50,
            tradeUnlocked: true,
            defenseValue: 200,
            tradeYield: { wood: 2, food: 1 },
            tradeCost: { gold: 2 }
        }
    },

    military: {
        attackPower: 0,
        defensePower: 0,
        units: {}
    },
    prestige: {
        points: 0,
        totalEarned: 0,
        unlockedStreams: {},
        upgrades: {
            starter_pack: { name: "Snelle Start", level: 0, max: 5, cost: 10, desc: "Begin elke reset met +500 alle resources per level." },
            meditation: { name: "Meditatie", level: 0, max: 9, cost: 30, desc: "Offline progressie is 10% efficiënter per level." },
            sunDail: { name: "Zonnewijzer", level: 0, max: 11, cost: 40, desc: "Je krijgt een extra uur offline tijd per level." }
        }
    },
    settings: {
        showManualActions: true,
        language: 'nl'
    },
    lastTick: Date.now(),
    lastSave: Date.now()
};

function getInitialState() {
    return {
        era: 1,
        traits: [],
        currentStreams: {},
        stats: { battlesWon: 0, treatiesSigned: 0, aggressiveActions: 0 },
        calendar: { day: 0, year: 0, season: 0 },
        seasonNames: [t("season_spring"), t("season_summer"), t("season_autumn"), t("season_winter")],
        resources: {
            food: { amount: 50, discovered: true },
            wood: { amount: 50, discovered: true },
            stone: { amount: 0, discovered: true },
            beam: { amount: 0, discovered: false },
            brick: { amount: 0, discovered: false },
            gold: { amount: 0, discovered: false },
            population: { amount: 2, discovered: true },
            researchPoints: { amount: 0, discovered: false },
            intel: { amount: 0, discovered: false }
        },
        buildings: {}, 
        jobs: {},
        research: {},
        military: { attackPower: 0, defensePower: 0, units: {} },
        expeditions: { active: false, timer: 0, currentType: null, unlocked: true },
        diplomacy: { unlocked: false, discoveredTribes: {} },
        prestige: { points: 0, totalEarned: 0, upgrades: {} },
        achievements: {
            first_steps: false, flint_monument: false, iron_discovery: false,
            great_conqueror: false, the_discoverer: false, trade_lord: false
        },
        settings: { showManualActions: true, language: 'nl' },
        lastTick: Date.now(),
        lastSave: Date.now()
    };
}

// --- OPSLAAN & LADEN ---
function saveGame(showLog = false) {
    game.lastSave = Date.now();
    localStorage.setItem('myGameSave', JSON.stringify(game));
    console.log("Game Saved");
    if (showLog && typeof addToLog === 'function') {
        addToLog(t("msg_game_saved"), "info");
    }
}

function loadGame() {
    const saved = localStorage.getItem('myGameSave');
    if (!saved) {
        recalcLimits();
        recalcRates();
        checkUnlocks();
        return;
    }
    try {
        const loadedData = JSON.parse(saved);
        deepMerge(game, loadedData);
        console.log("Game Loaded & Deep Merged");
        if (game.settings && game.settings.language && typeof setLanguage === 'function') {
            setLanguage(game.settings.language);
        }
        recalcLimits();
        recalcRates();
        checkUnlocks();
        markUiDirty('all');
    } catch (e) {
        console.error("Fout bij laden van savegame:", e);
    }
}

function hardReset() {
    const firstCheck = confirm(t("msg_reset_confirm"));
    if (firstCheck) {
        const checkWord = prompt(t("msg_reset_prompt"));
        if (checkWord === "RESET") {
            localStorage.removeItem('myGameSave');
            alert(t("msg_reset_success"));
            window.location.reload();
        } else {
            alert(t("msg_reset_cancel"));
        }
    }
}

function handleOfflineProgress() {
    const now = Date.now();
    const diffInSeconds = Math.floor((now - game.lastTick) / 1000);
    if (diffInSeconds > 10) {
        recalcRates();
        let offlineEfficiency = 0.1;
        if (game.prestige.upgrades.meditation) {
            offlineEfficiency += (game.prestige.upgrades.meditation.level * 0.1);
        }
        offlineEfficiency = Math.min(1, offlineEfficiency);
        let maxOfflineSeconds = 3600 + ((game.prestige.upgrades.sunDail?.level || 0) * 3600);
        const actualSeconds = Math.min(diffInSeconds, maxOfflineSeconds);
        const capped = diffInSeconds > maxOfflineSeconds;
        let summary = {};
        for (let key in game.resources) {
            const res = game.resources[key];
            if (res.perSec) {
                const gained = res.perSec * actualSeconds * offlineEfficiency;
                const oldAmount = res.amount;
                res.amount = Math.min(res.max || 1000, Math.max(0, res.amount + gained));
                summary[key] = Math.floor(res.amount - oldAmount);
            }
        }
        showOfflineModal(actualSeconds, summary, capped, diffInSeconds);
    }
    game.lastTick = Date.now();
}

function showOfflineModal(seconds, summary, capped, totalSeconds) {
    let resourceList = "";
    for (let res in summary) {
        if (summary[res] !== 0) {
            resourceList += `<div>${getResourceIcon(res)} ${res}: +${summary[res]}</div>`;
        }
    }
    const modal = document.getElementById('modal-container');
    modal.innerHTML = `
        <div class="detail-overlay">
            <div class="detail-content panel">
                <h2>Welkom terug!</h2>
                <p>Geproduceerd voor: <strong>${formatTime(seconds)}</strong></p>
                ${capped ? `<p style="color: var(--red); font-size: 0.8em;">
                    Let op: Je was ${formatTime(totalSeconds)} weg, maar je limiet is ${formatTime(seconds)}. 
                </p>` : ''}
                <div class="breakdown-section" style="text-align: left;">
                    ${resourceList || "Geen opbrengst."}
                </div>
                <button class="tap-btn" style="width:100%" onclick="closeDetail()">Lekker!</button>
            </div>
        </div>
    `;
    modal.style.display = 'block';
}

function formatTime(seconds) {
    if (seconds < 3600) return Math.floor(seconds / 60) + "m";
    let h = Math.floor(seconds / 3600);
    let m = Math.floor((seconds % 3600) / 60);
    return `${h}u ${m}m`;
}

function getResourceIcon(resKey) {
    const icons = {
        food: "🍎", wood: "🪵", stone: "🪨", beam: "📏", brick: "🧱",
        gold: "💰", population: "🐱", researchPoints: "🧪", intel: "🗺️", scouts: "🕵️"
    };
    return icons[resKey] || "📦";
}

function findResearchesForResource(resKey) {
    const list = [];
    if (!game.research) return list;
    for (let key in game.research) {
        const r = game.research[key];
        if (r.affects && r.affects.includes(resKey)) {
            list.push(r);
        }
    }
    return list;
}

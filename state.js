//const { act } = require("react");
window.currentTab = 'jobs'; // De standaard tab bij het opstarten
let buyAmount = 1;
// --- DE DATA (HET BREIN VAN DE GAME) ---
let game = {


    resources: {
        food: { name: "Voedsel", amount: 10, max: 100, perSec: 0, manualGain: 1, discovered: true },
        wood: { name: "Hout", amount: 0, max: 100, perSec: 0, manualGain: 1, discovered: true },
        beam: { name: "Balken", amount: 0, max: 50, perSec: 0, discovered: false },
        stone: { name: "Steen", amount: 0, max: 50, perSec: 0, manualGain: 1, discovered: false },
        brick: { name: "Bakstenen", amount: 0, max: 50, perSec: 0, discovered: false },
        population: { name: "Bevolking", amount: 1, max: 5, perSec: 0, discovered: true },
        gold: { name: "Goud", amount: 0, max: 1000, perSec: 0, discovered: false },
        researchPoints: { name: "Research Punten", amount: 0, max: 500, perSec: 0, discovered: false },
        intel: { name: "Intel", amount: 0, max: 100, perSec: 0, discovered: false }
    },
    jobs: {
        farmer: { name: "Boer", count: 0, max: 0, effect: { food: 2 }, unlocked: false },
        woodcutter: { name: "Houthakker", count: 0, max: 0, effect: { wood: 1, food: -0.5 }, unlocked: false },
        woodworker: { name: "Houtbewerker", count: 0, max: 0, effect: { wood: -1, food: -1, beam: 0.2 }, unlocked: false },
        miner: { name: "Mijnwerker", count: 0, max: 0, effect: { stone: 0.8, food: -1 }, unlocked: false },
        stoneworker: { name: "Steenhouwer", count: 0, max: 0, effect: { stone: -1, food: -1, brick: 0.2 }, unlocked: false },
        teacher: { name: "Leraar", count: 0, max: 0, effect: { researchPoints: 0.5, food: -1 }, unlocked: false },
        scout_job: { name: "Verkenner", count: 0, max: 0, effect: { intel: 1, food: -2 }, unlocked: false },
        soldier: { name: "Soldaat", count: 0, max: 0, effect: { gold: -0.1, food: -2 }, unlocked: false },
        banker: { name: "Bankier", count: 0, max: 0, effect: { gold: 1 }, unlocked: false }
    },
    buildings: {
        hut: { name: "Hut", count: 0, cost: { wood: 10 }, provides: { max_population: 2 }, desc: "Woonruimte voor je bevolking.", unlocked: true },
        house: { name: "Huis", count: 0, cost: { beam: 30, brick: 40 }, provides: { max_population: 5 }, desc: "Een stevig huis voor je inwoners.", unlocked: false },
        farm_plot: { name: "Akker", count: 0, cost: { wood: 15, stone: 5 }, provides: { job_farmer: 2, max_food: 20 }, desc: "Grond om voedsel te verbouwen.", unlocked: true },
        irrigation_system: { name: "Irrigatie Systeem", count: 0, cost: { wood: 50, stone: 100, gold: 50 }, provides: { max_food: 500 }, desc: "Verbetert de watertoevoer naar de akkers.", unlocked: false },
        lumber_camp: { name: "Houthakkerskamp", count: 0, cost: { wood: 25 }, provides: { job_woodcutter: 2, max_wood: 20 }, desc: "Werkplek voor houthakkers.", unlocked: true },
        wood_workshop: { name: "Houtbewerkerij", count: 0, cost: { wood: 5000, stone: 2000 }, provides: { job_woodworker: 1, max_beam: 50 }, desc: "Verbetert houtproductie en opslag.", unlocked: false },
        quarry: { name: "Steenhouwerij", count: 0, cost: { wood: 50, food: 20 }, provides: { job_miner: 2, max_stone: 10 }, desc: "Plek om steen te winnen.", unlocked: false },
        stone_workshop: { name: "Steenbewerkerij", count: 0, cost: { wood: 2000, stone: 3000 }, provides: { job_stoneworker: 1, max_brick: 100 }, desc: "Verbetert steenproductie en opslag.", unlocked: false },
        warehouse: { name: "Magazijn", count: 0, cost: { wood: 75, stone: 25 }, provides: { max_wood: 200, max_food: 200, max_stone: 100 }, desc: "Vergroot opslagcapaciteit voor grondstoffen.", unlocked: false },
        school: { name: "School", count: 0, cost: { wood: 100, stone: 50 }, provides: { job_teacher: 1, max_researchPoints: 100 }, desc: "Een plek waar leraren research punten genereren.", unlocked: false },
        scout_post: { name: "Verkennerspost", count: 0, cost: { wood: 80, food: 40 }, provides: { job_scout_job: 3, max_intel: 50 }, desc: "Traint inwoners om de wereld te verkennen en vergroot opslag voor Intel (+50).", unlocked: false },
        barracks: { name: "Kazerne", count: 0, cost: { wood: 200, stone: 300, gold: 100 }, provides: { job_soldier: 20 }, desc: "Huisvesting voor je leger. Elke kazerne biedt plek aan 20 soldaten.", unlocked: false },
        bank: { name: "Bank", count: 0, cost: { wood: 200, stone: 200, gold: 500 }, provides: { max_gold: 2000, job_banker: 1 }, desc: "Vergroot de opslagcapaciteit voor goud en genereert rente.", unlocked: false }
    },

    research: {
        toolmaking: {
            name: "Gereedschap maken",
            desc: "Ontgrendelt de Steenhouwerij en Mijnwerkers.",
            cost: { wood: 30, food: 20 },
            unlocked: false,
            requirement: () => game.resources.wood.amount >= 20
        },
        /*       agriculture: { 
                   name: "Landbouw", 
                   desc: "Maakt Akkers mogelijk voor betere voedselproductie.", 
                   cost: { wood: 40, food: 40 }, 
                   unlocked: false, 
                   requirement: () => game.resources.food.amount >= 30 
               },*/
        education: {
            name: "Educatie",
            desc: "Ontgrendelt de School en Leraren.",
            cost: { wood: 100, food: 100, stone: 20 },
            unlocked: false,
            requirement: () => game.buildings.hut.count >= 2 // Verschijnt bij 2 hutten
        },
        warehouse: {
            name: "Pakhuis",
            desc: "Meer spullen.",
            cost: { researchPoints: 50 },
            unlocked: false,
            requirement: () => game.research.education.unlocked
        },
        irrigation_tech: {
            name: "Irrigatie Techniek",
            desc: "Maakt het bouwen van irrigatiesystemen mogelijk.",
            cost: { researchPoints: 50, gold: 20 },
            unlocked: false,
            requirement: () => game.research.plow_invention.unlocked
        },
        plow_invention: {
            name: "De Ploeg",
            desc: "Door een betere ploeg werken boeren 50% effectiever.",
            cost: { wood: 100, stone: 100, gold: 50 },
            unlocked: false,
            requirement: () => game.buildings.farm_plot.count >= 10 // Pas beschikbaar na Landbouw
        },
        expeditions: {
            name: "Expedities",
            desc: "Maakt het mogelijk om expedities te sturen om nieuwe gebieden te verkennen.",
            cost: { researchPoints: 100, gold: 100 },
            unlocked: false,
            requirement: () => game.resources.population.amount >= 25 // Verschijnt bij 25 bevolking
        },
        medium_expeditions: {
            name: "Handelsroute zoeken",
            desc: "Verbeterde expedities die handelsroutes kunnen vinden.",
            cost: { researchPoints: 150, gold: 200 },
            unlocked: false,
            requirement: () => game.research.expeditions.unlocked
        },
        hard_expeditions: {
            name: "Diplomatieke Missies",
            desc: "Geavanceerde expedities die diplomatieke contacten kunnen leggen.",
            cost: { researchPoints: 300, gold: 500 },
            unlocked: false,
            requirement: () => game.research.medium_expeditions.unlocked
        },
        expert_expeditions: {
            name: "Verre Expedities",
            desc: "Expert expedities die unieke ontdekkingen kunnen doen.",
            cost: { researchPoints: 500, gold: 1000 },
            unlocked: false,
            requirement: () => game.research.hard_expeditions.unlocked
        },
        banking: {
            name: "Bankenstelsel",
            desc: "Maakt het mogelijk om een bank te bouwen voor extra goudopslag en rente.",
            cost: { researchPoints: 400, gold: 800 },
            unlocked: false,
            requirement: () => game.resources.gold.amount >= 1000 //1000
        },
        knight_training: {
            name: "Ridder Training",
            desc: "Ontgrendelt de Ridder eenheid voor je leger.",
            cost: { researchPoints: 200, gold: 300 },
            unlocked: false,
            requirement: () => game.buildings.hut.count >= 5
        },
        commander_tactics: {
            name: "Commandant Tactieken",
            desc: "Ontgrendelt de Commandant eenheid die de kracht van je leger verhoogt.",
            cost: { researchPoints: 400, gold: 600 },
            unlocked: false,
            requirement: () => game.research.knight_training.unlocked
        },
        wood_tech: {
            name: "Hout Techniek",
            desc: "Door betere houtbewerking, wordt het houtproductie verhoogd.",
            cost: { researchPoints: 50, gold: 50 },
            unlocked: false,
            requirement: () => game.resources.wood.amount >= 5000
        },
        axe_tech: {
            name: "Hak Techniek",
            desc: "Door slim te hakken, wordt het houtproductie verhoogd.",
            cost: { researchPoints: 100, gold: 100 },
            unlocked: false,
            requirement: () => game.jobs.woodcutter.count >= 25
        },
        wood_workshop: {
            name: "Houtbewerkerij",
            desc: "Verbetert houtproductie en opslag.",
            cost: { researchPoints: 600, gold: 500 },
            unlocked: false,
            requirement: () => game.buildings.lumber_camp.count >= 20
        },
        stone_workshop: {
            name: "Steenbewerkerij",
            desc: "Verbetert steenproductie en opslag.",
            cost: { researchPoints: 600, gold: 500 },
            unlocked: false,
            requirement: () => game.buildings.quarry.count >= 15
        },
        houses: {
            name: "Huis",
            desc: "Een mooi stenen huis",
            cost: { researchPoints: 300 },
            unlocked: false,
            requirement: () => game.buildings.hut.count >= 47
        }
    },

    expeditions: {
        active: false,
        timer: 0,
        currentType: null,
        unlocked: true, // Zichtbaar zodra de tab dat is
        types: {
            easy: {
                name: "Korte Verkenning",
                duration: 10,
                cost: { food: 100, intel: 50 },
                successRate: 0.9,
                requirements: () => true
            },
            medium: {
                name: "Handelsroute Zoeken",
                duration: 20,
                cost: { food: 300, gold: 100, intel: 150 },
                successRate: 0.75,
                requirements: () => game.research.medium_expeditions.unlocked
            },
            hard: {
                name: "Diplomatieke Missie",
                duration: 30,
                cost: { food: 800, gold: 300, intel: 400 },
                successRate: 0.6,
                requirements: () => game.research.hard_expeditions.unlocked
            },
            expert: {
                name: "Verre Expeditie",
                duration: 40,
                cost: { food: 2000, gold: 1500, intel: 800 },
                successRate: 0.4,
                requirements: () => game.research.expert_expeditions.unlocked && game.buildings.school.count >= 3
            }
        }
    },
    diplomacy: {
        unlocked: false,
        discoveredTribes: {} // Hier slaan we de ontdekte volken op
    },
    // Een 'bibliotheek' met mogelijke volken die je kunt ontdekken
    tribeTemplates: {
        forest_dwellers: {
            name: "De Bosjesmannen",
            desc: "Een vreedzame stam die diep in de wouden leeft.",
            relation: 50, // 0 = Oorlog, 50 = Neutraal, 100 = Bondgenoot
            tradeUnlocked: true,
            defenseValue: 200,
            resources: { wood: 0.8, food: 1.2 } // Waar ze goed in zijn
        },
        mountain_clan: {
            name: "De Bergstam",
            desc: "Trotse krijgers die veel weten van mijnbouw.",
            relation: 30, // Beginnen iets wantrouwiger
            tradeUnlocked: false,
            defenseValue: 200,
            resources: { stone: 1.5, gold: 0.5 }
        },
        river_folk: {
            name: "De Rivierbewoners",
            desc: "Een handelend volk dat langs de grote rivieren woont.",
            relation: 70,
            tradeUnlocked: true,
            defenseValue: 150,
            resources: { food: 1.5, gold: 1.0 }
        }
    },

    military: {
        attackPower: 0,
        defensePower: 0,
        units: {
            swordsman: { name: "Zwaardvechter", total: 0, assignedOff: 0, assignedDef: 0, off: 10, def: 2, type: 'off', cost: { gold: 50, food: 2000 }, desc: "Focus op aanval.", maintenance: { food: 1 }, unlocked: true },
            archer: { name: "Boogschutter", total: 0, assignedOff: 0, assignedDef: 0, off: 2, def: 12, type: 'def', cost: { gold: 40, food: 3000 }, desc: "Focus op verdediging.", maintenance: { food: 1 }, unlocked: true },
            knight: { name: "Ridder", total: 0, assignedOff: 0, assignedDef: 0, off: 25, def: 15, type: 'both', cost: { gold: 150, food: 8000 }, desc: "Sterk in beide.", maintenance: { food: 2, gold: 1 }, unlocked: false },
            commander: { name: "Commandant", total: 0, assignedOff: 0, assignedDef: 0, offMultiplier: 1.2, defMultiplier: 1.3, type: 'support', cost: { gold: 500, food: 10000 }, desc: "Verhoogt totale kracht met 20%.", maintenance: { food: 2, gold: 1 }, unlocked: false }
        }
    },
    prestige: {
        points: 0,
        totalEarned: 0,
        upgrades: {
            starter_pack: { name: "Snelle Start", level: 0, max: 5, cost: 10, desc: "Begin elke reset met +500 alle resources per level." },
            military_academy: { name: "Militaire Academie", level: 0, max: 1, cost: 50, desc: "Unlockt de 'Ridder' unit vanaf het begin." },
            efficient_scouting: { name: "Ervaren Gidsen", level: 0, max: 10, cost: 20, desc: "Verkenningen gaan 5% sneller per level (bovenop de 1% per onbesteed punt)." },
            meditation: { name: "Meditatie", level: 0, max: 9, cost: 30, desc: "Offline progressie is 10% efficiënter per level." },
            sunDail: { name: "Zonnewijzer", level: 0, max: 11, cost: 40, desc: "Je krijgt een extra uur offline tijd per level." }
        }
    },
    settings: {
        showManualActions: true
    },
    lastSave: Date.now()
};

function getInitialState() {
    return {
        resources: {
            wood: { amount: 0, max: 100, perSec: 0, manualGain: 1, unlocked: true },
            beam: { amount: 0, max: 50, perSec: 0, unlocked: false },
            stone: { amount: 0, max: 100, perSec: 0, manualGain: 1 },
            brick: { amount: 0, max: 50, perSec: 0, unlocked: false },
            gold: { amount: 0, max: 1000, perSec: 0 },
            food: { amount: 10, max: 150, perSec: 0, manualGain: 1, unlocked: true },
            population: { amount: 1, max: 5, unlocked: true },
            researchPoints: { amount: 0, max: 500, perSec: 0 },
            intel: { amount: 0, max: 100, perSec: 0, name: "Intel", icon: "👁️", discovered: false, unlocked: false }
        },
        buildings: {
            hut: { name: "Hut", count: 0, cost: { wood: 10 }, provides: { max_population: 2 }, desc: "Woonruimte voor je bevolking.", unlocked: true },
            house: { name: "Huis", count: 0, cost: { beam: 30, brick: 40 }, provides: { max_population: 5 }, desc: "Een stevig huis voor je inwoners.", unlocked: false },
            farm_plot: { name: "Akker", count: 0, cost: { wood: 15, stone: 5 }, provides: { job_farmer: 2, max_food: 20 }, desc: "Grond om voedsel te verbouwen.", unlocked: true },
            lumber_camp: { name: "Houthakkerskamp", count: 0, cost: { wood: 25 }, provides: { job_woodcutter: 2, max_wood: 20 }, desc: "Werkplek voor houthakkers.", unlocked: true },
            wood_workshop: { name: "Houtbewerkerij", count: 0, cost: { wood: 5000, stone: 2000 }, provides: { job_woodworker: 1, max_beam: 50 }, desc: "Verbetert houtproductie en opslag.", unlocked: false },
            stone_workshop: { name: "Steenbewerkerij", count: 0, cost: { wood: 5000, stone: 2000 }, provides: { job_stone_worker: 1, max_brick: 50 }, desc: "Verbetert steenproductie en opslag.", unlocked: false },
            warehouse: { name: "Magazijn", count: 0, cost: { wood: 75, stone: 25 }, provides: { max_wood: 200, max_food: 200, max_stone: 100 }, desc: "Vergroot opslagcapaciteit voor grondstoffen.", unlocked: false },
            quarry: { name: "Steenhouwerij", count: 0, cost: { wood: 50, food: 20 }, provides: { job_miner: 2, max_stone: 10 }, desc: "Plek om steen te winnen.", unlocked: false },
            school: { name: "School", count: 0, cost: { wood: 100, stone: 50 }, provides: { job_teacher: 1, max_researchPoints: 100 }, desc: "Een plek waar leraren research punten genereren.", unlocked: false },
            irrigation_system: { name: "Irrigatie Systeem", count: 0, cost: { wood: 50, stone: 100, gold: 50 }, provides: { max_food: 500 }, desc: "Verbetert de watertoevoer naar de akkers.", unlocked: false },
            scout_post: { name: "Verkennerspost", count: 0, cost: { wood: 80, food: 40 }, provides: { job_scout_job: 3, max_intel: 50 }, desc: "Traint inwoners om de wereld te verkennen en vergroot opslag voor Intel (+50).", unlocked: false },
            //barracks: { name: "Kazerne", count: 0, cost: { wood: 200, stone: 300, gold: 100 }, provides: { job_soldier: 5 }, desc: "Huisvesting voor je leger. Elke kazerne biedt plek aan 5 soldaten.", unlocked: false }
            bank: { name: "Bank", count: 0, cost: { wood: 200, stone: 200, gold: 500 }, provides: { max_gold: 2000, job_banker: 1 }, desc: "Vergroot de opslagcapaciteit voor goud en genereert rente.", unlocked: false }
        },
        jobs: {
            farmer: { count: 0 },
            woodcutter: { count: 0 },
            woodworker: { count: 0 },
            miner: { count: 0 },
            stoneworker: { count: 0 },
            teacher: { count: 0 },
            scout_job: { count: 0 },
            //soldier: { count: 0 }
            banker: { count: 0 }
        },
        research: {
            toolmaking: { unlocked: false },
            // agriculture: { unlocked: false },
            education: { unlocked: false },
            warehouse: { unlocked: false },
            irrigation_tech: { unlocked: false },
            plow_invention: { unlocked: false },
            wood_tech: { unlocked: false },
            axe_tech: { unlocked: false },
            expeditions: { unlocked: false },
            medium_expeditions: { unlocked: false },
            hard_expeditions: { unlocked: false },
            expert_expeditions: { unlocked: false },
            banking: { unlocked: false },
            knight_training: { unlocked: false },
            commander_tactics: { unlocked: false },
            wood_workshop: { unlocked: false },
            stone_workshop: { unlocked: false },
            houses: { unlocked: false }
        },

        military: {
            attackPower: 0,
            defensePower: 0,
            units: {
                swordsman: { total: 0, assignedOff: 0, assignedDef: 0, off: 10, def: 2, cost: { gold: 50, food: 2000 }, unlocked: true },
                archer: { total: 0, assignedOff: 0, assignedDef: 0, off: 2, def: 12, cost: { gold: 40, food: 3000 }, unlocked: true },
                knight: { total: 0, assignedOff: 0, assignedDef: 0, off: 25, def: 15, cost: { gold: 150, food: 8000 }, unlocked: false },
                commander: { total: 0, assignedOff: 0, assignedDef: 0, offMultiplier: 1.2, defMultiplier: 1.3, cost: { gold: 500, food: 10000 }, unlocked: false }
            }
        },
        expeditions: {
            active: false,
            timer: 0,
            currentType: null,
            unlocked: false
        },
        diplomacy: { discoveredTribes: {} },
        settings: { showManualActions: true },
        // PRESTIGE WORDT HIER NIET GERESET, die bewaren we apart
        lastTick: Date.now()
    };
}

// --- OPSLAAN & LADEN ---
function saveGame() {
    game.lastTick = Date.now();
    //localStorage.setItem('civBuilderSave', JSON.stringify(game));
    localStorage.setItem('myGameSave', JSON.stringify(game));
    console.log("Game Saved");
}
function loadGame() {
    const saved = localStorage.getItem('myGameSave');
    if (!saved) return;

    const loadedData = JSON.parse(saved);

    // Gebruik Object.assign of een loop om de basis 'game' te vullen met loadedData
    // Belangrijk voor Prestige:
    if (loadedData.prestige) {
        game.prestige.points = loadedData.prestige.points || 0;
        game.prestige.totalEarned = loadedData.prestige.totalEarned || 0;

        // Laad de levels van de upgrades in de bestaande structuur
        for (let key in loadedData.prestige.upgrades) {
            if (game.prestige.upgrades[key]) {
                game.prestige.upgrades[key].level = loadedData.prestige.upgrades[key].level || 0;
            }
        }
    }


    // Loop door resources in de opgeslagen data
    for (let resKey in loadedData.resources) {
        // Check of deze resource ook in onze nieuwe code bestaat
        if (game.resources[resKey]) {
            game.resources[resKey].amount = loadedData.resources[resKey].amount;
            game.resources[resKey].discovered = loadedData.resources[resKey].discovered;
            // We laden NIET de 'max' of 'perSec', die worden opnieuw berekend
        }
    }

    // Doe hetzelfde voor gebouwen (aantallen laden)
    for (let bKey in loadedData.buildings) {
        if (game.buildings[bKey]) {
            game.buildings[bKey].count = loadedData.buildings[bKey].count;
            game.buildings[bKey].unlocked = loadedData.buildings[bKey].unlocked;
        }
    }

    // Voor research
    for (let rKey in loadedData.research) {
        if (game.research[rKey]) {
            game.research[rKey].unlocked = loadedData.research[rKey].unlocked;
            game.research[rKey].researched = loadedData.research[rKey].researched; // Voeg deze toe!
        }
    }

    // En voor de volken in diplomatie
    // --- Diplomatie laden ---
    if (loadedData.diplomacy) {
        game.diplomacy.unlocked = loadedData.diplomacy.unlocked || false;

        // Laad de ontdekte volken
        if (loadedData.diplomacy.discoveredTribes) {
            for (let tKey in loadedData.diplomacy.discoveredTribes) {
                // We zetten de data over naar ons actuele game object
                game.diplomacy.discoveredTribes[tKey] = loadedData.diplomacy.discoveredTribes[tKey];
            }
        }
    }
    // Voor de jobs
    for (let jKey in loadedData.jobs) {
        if (game.jobs[jKey]) {
            game.jobs[jKey].count = loadedData.jobs[jKey].count;
            game.jobs[jKey].unlocked = loadedData.jobs[jKey].unlocked;
        }
    }
    // --- Militaire data laden ---
    if (loadedData.military) {
        game.military.attackPower = loadedData.military.attackPower || 0;
        game.military.defensePower = loadedData.military.defensePower || 0;

        if (loadedData.military.units) {
            for (let key in loadedData.military.units) {
                if (game.military.units[key]) {
                    const loadedUnit = loadedData.military.units[key];
                    // Zorg dat alle nieuwe variabelen correct worden ingeladen
                    game.military.units[key].total = loadedUnit.total || 0;
                    game.military.units[key].assignedOff = loadedUnit.assignedOff || 0;
                    game.military.units[key].assignedDef = loadedUnit.assignedDef || 0;
                }
            }
        }
    }

    recalcLimits();
    recalcRates();
    checkUnlocks();
    if (loadedData.lastTick) {
        game.lastTick = loadedData.lastTick;
    } else {
        game.lastTick = Date.now(); // Fallback als het ontbreekt
    }
    console.log("Game Loaded");
}
function handleOfflineProgress() {
    const now = Date.now();
    const diffInSeconds = Math.floor((now - game.lastTick) / 1000);
    // Alleen verwerken als er meer dan 10 seconden voorbij zijn
    if (diffInSeconds > 10) {
        // Bereken eerst de rates (voor het geval ze nog niet geüpdatet zijn)
        recalcRates();

        // Als de upgrade niet bestaat of level 0 is, is de multiplier 0.5
        let offlineEfficiency = 0.1;
        if (game.prestige.upgrades.meditation) {
            // Elke level voegt 10% toe, tot max 100%
            offlineEfficiency += (game.prestige.upgrades.meditation.level * 0.1);
        }
        offlineEfficiency = Math.min(1, offlineEfficiency); // Nooit meer dan 100%

        // 2. Tijdslimiet: Start op 1 uur (3600s), +1 uur per level
        let maxOfflineSeconds = 3600 + (game.prestige.upgrades.sunDail.level * 3600);
        const actualSeconds = Math.min(diffInSeconds, maxOfflineSeconds);
        const capped = diffInSeconds > maxOfflineSeconds;



        let summary = {};

        // Pas de rates toe op elke resource
        for (let key in game.resources) {
            const res = game.resources[key];
            if (res.perSec) {
                const gained = res.perSec * actualSeconds * offlineEfficiency;
                const oldAmount = res.amount;

                // Voeg toe maar let op de max
                res.amount = Math.min(res.max || 1000, Math.max(0, res.amount + gained));

                // Hou bij hoeveel er echt bij is gekomen voor de popup
                summary[key] = Math.floor(res.amount - oldAmount);
            }
        }

        showOfflineModal(actualSeconds, summary, capped, diffInSeconds);
    }

    // Reset de lastTick naar nu
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
                    Upgrade 'Meditatie' voor meer tijd!
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

// Helper om tijd mooi te maken
function formatTime(seconds) {
    if (seconds < 3600) return Math.floor(seconds / 60) + "m";
    let h = Math.floor(seconds / 3600);
    let m = Math.floor((seconds % 3600) / 60);
    return `${h}u ${m}m`;
}


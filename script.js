//const { act } = require("react");
    let currentTab = 'jobs'; // De standaard tab bij het opstarten
        let buyAmount = 1;
// --- DE DATA (HET BREIN VAN DE GAME) ---
let game = {


    resources: {
        wood: { name: "Hout", amount: 0, max: 100, perSec: 0, manualGain: 1, discovered: true },
        food: { name: "Voedsel", amount: 10, max: 100, perSec: 0, manualGain: 1, discovered: true },
        stone: { name: "Steen", amount: 0, max: 50, perSec: 0, manualGain: 1, discovered: false },
        beam: { name: "Balken", amount: 0, max: 50, perSec: 0, discovered: false },
        brick: { name: "Bakstenen", amount: 0, max: 50, perSec: 0, discovered: false },
        population: { name: "Bevolking", amount: 1, max: 5, perSec: 0, discovered: true },
        gold: { name: "Goud", amount: 0, max: 1000, perSec: 0, discovered: false },
        researchPoints: { name: "Research Punten", amount: 0, max: 500, perSec: 0, discovered: false },
        scouts: { name: "Verkenners", amount: 0, max: 0, perSec: 0, discovered: false }
    },
    jobs: {
        woodcutter: { name: "Houthakker", count: 0, max: 0, effect: { wood: 1, food: -0.5 }, unlocked: false },
        farmer: { name: "Boer", count: 0, max: 0, effect: { food: 2 }, unlocked: false },
        miner: { name: "Mijnwerker", count: 0, max: 0, effect: { stone: 0.8, food: -1 }, unlocked: false },
        teacher: { name: "Leraar", count: 0, max: 0, effect: { researchPoints: 0.5, food: -1 },unlocked: false},
        scout_job: { name: "Verkenner", count: 0, max: 0, effect: { food: -2 }, unlocked: false },
        soldier: { name: "Soldaat", count: 0, max: 0, effect: { gold: -0.1, food: -2 }, unlocked: false },
        banker: { name: "Bankier", count: 0, max: 0, effect: { gold: 1 }, unlocked: false }
    },
    buildings: {
        hut: { name: "Hut", count: 0, cost: { wood: 10 }, provides: { max_population: 2 }, desc: "Woonruimte voor je bevolking.", unlocked: true },
        farm_plot: { name: "Akker", count: 0, cost: { wood: 15, stone: 5 }, provides: { job_farmer: 2, max_food: 20 }, desc: "Grond om voedsel te verbouwen.", unlocked: true },
        irrigation_system: {  name: "Irrigatie Systeem", count: 0, cost: { wood: 50, stone: 100, gold: 50 }, provides: { max_food: 500 }, desc: "Verbetert de watertoevoer naar de akkers.", unlocked: false },
        lumber_camp: { name: "Houthakkerskamp", count: 0, cost: { wood: 25 }, provides: { job_woodcutter: 2 ,max_wood: 20 }, desc: "Werkplek voor houthakkers.", unlocked: true },
        wood_workshop: { name: "Houtbewerkerij", count: 0, cost: { wood: 50, stone: 20 }, provides: { job_woodcutter: 4 , max_wood: 50 }, desc: "Verbetert houtproductie en opslag.", unlocked: false },
        quarry: { name: "Steenhouwerij", count: 0, cost: { wood: 50, food: 20 }, provides: { job_miner: 2 , max_stone: 10 }, desc: "Plek om steen te winnen.", unlocked: false },
        warehouse: { name: "Magazijn", count: 0, cost: { wood: 75, stone: 25 }, provides: { max_wood: 200, max_food: 200, max_stone :100 }, desc:"Vergroot opslagcapaciteit voor grondstoffen.", unlocked:false},
        school: {  name: "School", count: 0, cost: { wood: 100, stone: 50 }, provides: { job_teacher: 1 , max_researchPoints: 100 }, desc: "Een plek waar leraren research punten genereren.",  unlocked: false },
        scout_post: { name: "Verkennerspost", count: 0, cost: { wood: 80, food: 40 }, provides: { job_scout_job: 3 }, desc: "Traint inwoners om de wereld te verkennen.", unlocked: false },
        barracks: { name: "Kazerne", count: 0, cost: { wood: 200, stone: 300, gold: 100 }, provides: { job_soldier: 20 }, desc: "Huisvesting voor je leger. Elke kazerne biedt plek aan 20 soldaten.", unlocked: false },
        bank: { name: "Bank", count: 0, cost: { wood: 200, stone: 200, gold: 500 }, provides: { max_gold: 2000, job_banker: 1 }, desc: "Vergroot de opslagcapaciteit voor goud en genereert rente.", unlocked: false }
    },

    industries: {
        woodworking: { name: "Houtbewerking", count: 0, max: 10, cost: { wood: 100, stone: 50 }, effect: { wood: -1, beam: 0.2 }, unlocked: false },
        masonry: { name: "Metselarij", count: 0, max: 10, cost: { wood: 50, stone: 100 }, effect: { stone: -1, brick: 0.2 }, unlocked: false }
        // Andere industrieën kunnen hier worden toegevoegd
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
            requirement: () => game.jobs.woodcutter.count >= 10
        },
        axe_tech: {
            name: "Hak Techniek",
            desc: "Door slim te hakken, wordt het houtproductie verhoogd.",
            cost: { researchPoints: 100, gold: 100 },
            unlocked: false,
            requirement: () => game.jobs.woodcutter.count >= 25
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
                duration: 10,//30
                cost: { food: 50, scouts: 1 },
                successRate: 0.9, // 90%
                requirements: () => true 
            },
            medium: {
                name: "Handelsroute Zoeken",
                duration: 10,//120
                cost: { food: 200, gold: 50, scouts: 2 },
                successRate: 0.75,
                requirements: () => game.research.medium_expeditions.unlocked && game.resources.scouts.amount >= 2
            },
            hard: {
                name: "Diplomatieke Missie",
                duration: 10,//300
                cost: { food: 500, gold: 200, scouts: 5 },
                successRate: 0.6,
                requirements: () => game.research.hard_expeditions.unlocked && game.resources.scouts.amount >= 5
            },
            expert: {
                name: "Verre Expeditie",
                duration: 10,//900
                cost: { food: 1500, gold: 1000, scouts: 10 },
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
        units: {swordsman: { name: "Zwaardvechter", total: 0, assignedOff: 0, assignedDef: 0, off: 10, def: 2, type: 'off', cost: { gold: 50, food: 20 }, desc: "Focus op aanval.", maintenance: { food: 1 }, unlocked: true },
            archer: { name: "Boogschutter", total: 0, assignedOff: 0, assignedDef: 0, off: 2, def: 12, type: 'def', cost: { gold: 40, food: 30 }, desc: "Focus op verdediging.", maintenance: { food: 1 }, unlocked: true },
            knight: { name: "Ridder", total: 0, assignedOff: 0, assignedDef: 0, off: 25, def: 15, type: 'both', cost: { gold: 150, food: 80 }, desc: "Sterk in beide.", maintenance: { food: 2, gold: 1 }, unlocked: false },
            commander: { name: "Commandant", total: 0, assignedOff: 0, assignedDef: 0, offMultiplier: 1.2, defMultiplier: 1.3, type: 'support', cost: { gold: 500 }, desc: "Verhoogt totale kracht met 20%." , maintenance: { food: 2, gold: 1 }, unlocked: false }
        }
    },
    prestige: {
        points: 0,
        totalEarned: 0,
        upgrades: {
            starter_pack: { name: "Snelle Start", level: 0, max: 5, cost: 10, desc: "Begin elke reset met +500 alle resources per level." },
            military_academy: { name: "Militaire Academie", level: 0, max: 1, cost: 50, desc: "Unlockt de 'Ridder' unit vanaf het begin." },
            efficient_scouting: { name: "Ervaren Gidsen", level: 0, max: 10, cost: 20, desc: "Verkenningen gaan 5% sneller per level (bovenop de 1% per onbesteed punt)." }
        }
    },

    lastSave: Date.now()
};

    function getInitialState() {
        return {
            resources: {
                wood: { amount: 0, max: 100, perSec: 0 , manualGain: 1 , unlocked: true}, 
                stone: { amount: 0, max: 100, perSec: 0 , manualGain: 1},
                gold: { amount: 0, max: 1000, perSec: 0 },
                food: { amount: 10, max: 150, perSec: 0 , manualGain: 1 , unlocked: true},
                population: { amount: 1, max: 5 , unlocked: true},
                researchPoints: { amount: 0, max: 500, perSec: 0 },
                scouts: { amount: 0, max: 0, perSec: 0, unlocked: false }
            },
        buildings: {
            hut: { name: "Hut", count: 0, cost: { wood: 10 }, provides: { max_population: 2 }, desc: "Woonruimte voor je bevolking.", unlocked: true },
            farm_plot: { name: "Akker", count: 0, cost: { wood: 15, stone: 5 }, provides: { job_farmer: 2, max_food: 20 }, desc: "Grond om voedsel te verbouwen.", unlocked: true },
            lumber_camp: { name: "Houthakkerskamp", count: 0, cost: { wood: 25 }, provides: { job_woodcutter: 2 ,max_wood: 20 }, desc: "Werkplek voor houthakkers.", unlocked: true },
            warehouse: { name: "Magazijn", count: 0, cost: { wood: 75, stone: 25 }, provides: { max_wood: 200, max_food: 200, max_stone: 100 }, desc: "Vergroot opslagcapaciteit voor grondstoffen.", unlocked: false }, 
            quarry: { name: "Steenhouwerij", count: 0, cost: { wood: 50, food: 20 }, provides: { job_miner: 2 , max_stone: 10 }, desc: "Plek om steen te winnen.", unlocked: false },
            school: {  name: "School", count: 0, cost: { wood: 100, stone: 50 }, provides: { job_teacher: 1 , max_researchPoints: 100 }, desc: "Een plek waar leraren research punten genereren.",  unlocked: false },
            irrigation_system: {  name: "Irrigatie Systeem", count: 0, cost: { wood: 50, stone: 100, gold: 50 }, provides: { max_food: 500 }, desc: "Verbetert de watertoevoer naar de akkers.", unlocked: false },
            scout_post: { name: "Verkennerspost", count: 0, cost: { wood: 80, food: 40 }, provides: { job_scout_job: 3 }, desc: "Traint inwoners om de wereld te verkennen.", unlocked: false },
            //barracks: { name: "Kazerne", count: 0, cost: { wood: 200, stone: 300, gold: 100 }, provides: { job_soldier: 5 }, desc: "Huisvesting voor je leger. Elke kazerne biedt plek aan 5 soldaten.", unlocked: false }
            bank: { name: "Bank", count: 0, cost: { wood: 200, stone: 200, gold: 500 }, provides: { max_gold: 2000, job_banker: 1 }, desc: "Vergroot de opslagcapaciteit voor goud en genereert rente.", unlocked: false }
        },
            jobs: {
                woodcutter: { count: 0 },
                farmer: { count: 0 },
                miner: { count: 0 },
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
                commander_tactics: { unlocked: false }
            },

            military: {
                attackPower: 0,
                defensePower: 0,
                units: {
                    swordsman: { total: 0, assignedOff: 0, assignedDef: 0, off: 10, def: 2, cost: { gold: 50, food: 2000 },unlocked: true },
                    archer: { total: 0, assignedOff: 0, assignedDef: 0, off: 2, def: 12, cost: { gold: 40, food: 3000 }, unlocked: true },
                    knight: { total: 0, assignedOff: 0, assignedDef: 0, off: 25, def: 15, cost: { gold: 150, food: 8000 }, unlocked: false },
                    commander: { total: 0, assignedOff: 0, assignedDef: 0, offMultiplier: 1.2, defMultiplier: 1.3, cost: { gold: 500, food: 10000 },  unlocked: false }
                }
            },
            expeditions: {
                active: false,
                timer: 0,
                currentType: null,
                unlocked: false
            },
            diplomacy: { discoveredTribes: {} },
            // PRESTIGE WORDT HIER NIET GERESET, die bewaren we apart
        };
    }
// --- CORE LOGICA ---
function addResource(type, amount) {
    const res = game.resources[type];
    if (!res) return;
    res.amount += amount;
    if (res.amount > res.max) res.amount = res.max;
    if (res.amount < 0) res.amount = 0;
    if (res.scouts) console.log(`Resource ${type} updated: ${res.amount}/${res.max}`);
    if (res.amount > 0) res.discovered = true;
}

function getIdlePopulation() {
    let employed = 0;
    for (let key in game.jobs) employed += game.jobs[key].count;
    return Math.floor(game.resources.population.amount) - employed;
}

function getSoldierMaintenance() {
    let totalFood = 0;
    let totalGold = 0;
    for (let key in game.military.units) {
        const u = game.military.units[key];
        if ((u.total || 0) > 0 && u.maintenance && u.maintenance.food) {
            totalFood += (u.total * u.maintenance.food);
        }
        if ((u.total || 0) > 0 && u.maintenance && u.maintenance.gold) {
            totalGold += (u.total * u.maintenance.gold);
        }
    }
    return { food: totalFood, gold: totalGold };
}

function recalcLimits() {
    const starterLevel = game.prestige.upgrades.starter_pack?.level || 0;
    const bonus = starterLevel * 500;
    // Reset naar basis
    game.resources.wood.max = 100 + bonus;
    game.resources.food.max = 100 + bonus;
    game.resources.stone.max = 50 + bonus;
    game.resources.population.max = 100;//5
    game.resources.gold.max = 1000;
    game.resources.researchPoints.max = 500;
    for(let j in game.jobs) game.jobs[j].max = 0;

    // Gebouwen toepassen
    for (let key in game.buildings) {
        const b = game.buildings[key];
        for (let type in b.provides) {
            const val = b.provides[type] * b.count;
            if (type.startsWith("max_")) {
                const resName = type.replace("max_", "");
                game.resources[resName].max += val;
            }
            if (type.startsWith("job_")) {
                const jobName = type.replace("job_", "");
                game.jobs[jobName].max += val;
            }
        }
    }
}

function recalcwood() {
    game.resources.wood.perSec = 0;
    const job = game.jobs.woodcutter;
    let multiplier = 1;
    const prestigeBoost = 1 + (game.prestige.points * 0.01);
    if (game.research.axe_tech.unlocked) multiplier += 1;
    if (game.research.wood_tech.unlocked) multiplier += 0.5;
    game.resources.wood.perSec += (job.effect.wood * job.count * multiplier * prestigeBoost);
    for (let key in game.diplomacy.discoveredTribes) {
        const tribe = game.diplomacy.discoveredTribes[key];
        if (tribe.tradeRouteActive) {
            // Kosten: Elke handelsroute kost bijv. 0.5 goud per seconde
            //game.resources.gold.perSec -= 0.5;

            // Opbrengst: Voeg de resources van de stam toe aan jouw inkomsten
                const gain = tribe.resources[resType];
                if (resType === 'wood') {
                    game.resources[resType].perSec += gain;
                }
            
        }
    }
}

function recalcFood() {
    const idlePop = getIdlePopulation();
    const food = game.resources.food;
    food.perSec = 0;
    const job = game.jobs.farmer;
    let multiplier = 1;
    const prestigeBoost = 1 + (game.prestige.points * 0.01);
    // Specifieke upgrades voor boeren
    if (game.research.plow_invention.unlocked) multiplier *= 1.5;
    if (game.buildings.irrigation_system.count > 0) multiplier *= game.buildings.irrigation_system.count;
    food.perSec += (job.effect.food * job.count * multiplier * prestigeBoost);
    food.perSec += ( -0.5 * idlePop ); // Kleine voedselconsumptie per idle pop
        for(let key in game.jobs) {
            const jobs = game.jobs[key];
            for(let resType in jobs.effect) {
                if (resType === 'food' && key !== 'farmer') {
                    food.perSec += (jobs.effect[resType] * jobs.count);
                 //   console.log(`Job ${key} heeft een effect op voedsel: ${jobs.effect[resType]} per job, totaal ${jobs.effect[resType] * jobs.count}`);
                }
            }
        };
        food.perSec -= getSoldierMaintenance().food; // Voedselconsumptie van soldaten
}

function recalcStone() {
    game.resources.stone.perSec = 0;
    const job = game.jobs.miner;
    let multiplier = 1;
    const prestigeBoost = 1 + (game.prestige.points * 0.01);
    game.resources.stone.perSec += (job.effect.stone * job.count * multiplier * prestigeBoost);
}

function recalcResearch() {
    game.resources.researchPoints.perSec = 0;
    const job = game.jobs.teacher;
    let multiplier = 1;
    const prestigeBoost = 1 + (game.prestige.points * 0.01);
    game.resources.researchPoints.perSec += (job.effect.researchPoints * job.count * prestigeBoost);
}

function recalcGold() {
    game.resources.gold.perSec = 0;
    const job = game.jobs.banker;
    let multiplier = 1;
    const prestigeBoost = 1 + (game.prestige.points * 0.01);
    game.resources.gold.perSec += (job.effect.gold * job.count * multiplier * prestigeBoost);
    // Passieve belasting
    const taxIncome = (game.resources.population.amount * (1/60));
    game.resources.gold.perSec += taxIncome * prestigeBoost; // Belastingopbrengst, beïnvloed door prestige
        // --- Handelsroutes opbrengsten ---
    for (let key in game.diplomacy.discoveredTribes) {
        const tribe = game.diplomacy.discoveredTribes[key];
        if (tribe.tradeRouteActive) {
            // Kosten: Elke handelsroute kost bijv. 0.5 goud per seconde
            game.resources.gold.perSec -= 0.5;
        }
    }
    // Tribuut van overwonnen tribes
    for (let key in game.diplomacy.discoveredTribes) {
        const tribe = game.diplomacy.discoveredTribes[key];
        if (tribe.isConquered) {
            game.resources.gold.perSec += tribe.tributeAmount || 5;
        }
}
    if (game.resources.gold.perSec > 0) {
        game.resources.gold.discovered = true;
    }

    game.resources.gold.perSec -= getSoldierMaintenance().gold; // Goudconsumptie van soldaten
}

function recalcScouts() {
    const job = game.jobs.scout_job;
    game.resources.scouts.amount = job.count;  // Set to job count, not add
}

function recalcRates() {
    recalcLimits();
    recalcwood();
    recalcFood();
    recalcStone();
    recalcResearch();
    recalcGold();
    recalcMilitary();
    recalcScouts();
    const prestigeMultiplier = 1 + (game.prestige.points * 0.01);
    game.resources.population.perSec = 0.25 * prestigeMultiplier; // Bevolking groeit langzaam, beïnvloed door prestige
}

function renderResourceDetail(key) {
    const res = game.resources[key];
    const job = findJobForResource(key);
    const cJobs = findJobsForConsumption(key); // Meerdere jobs nu
    
    // Basis waarden bepalen
    let baseVal = job ? job.effect[key] : 0;
    let count = job ? job.count : 0;
    let totalBase = baseVal * count;

    // Food heeft ook een consumptie component, dus we trekken dat eraf
    let totalConsumption = 0;
    cJobs.forEach(cJob => {
        let cVal = cJob.effect[key];
        let cCount = cJob.count;
        totalConsumption += cVal * cCount;
    });

    const idlePop = getIdlePopulation();
    const idlePopConsumption = (key === 'food') ? (-0.5 * idlePop) : 0;
    const soldierFoodConsumption = (key === 'food') ? (-getSoldierMaintenance().food) : 0;
    
    // Bonussen berekenen
    let researchMult = getResearchMultiplier(key);
    let researchaddition = researchMult * totalBase; 
    
    let prestigeMult = 1 + (game.prestige.points * 0.01);
    let prestigeAddition = prestigeMult * researchaddition; 
    
    // Totaal berekening
    let finalProduction = totalBase * researchMult * prestigeMult;
    let finalValue = finalProduction + totalConsumption + idlePopConsumption + soldierFoodConsumption;

        const relevantResearches = getRelevantResearches(key);
    
    // HTML voor research lijst
    let researchListHTML = '';
    if (relevantResearches.length > 0) {
        researchListHTML = `
            <div class="breakdown-section" style="border-left: 3px solid var(--research);">
                <h3 style="margin-bottom: 10px; color: #cba6f7;">Actieve Researches</h3>
        `;
        
        relevantResearches.forEach(research => {
            const multiplier = research.effect;
            const bonus = research.effect;//((multiplier - 1) * 100).toFixed(0); // Bijv. 1.1 -> +10%
            const statusIcon = research.unlocked ? '✓' : '✗';
            const statusColor = research.unlocked ? '#a6e3a1' : '#6c7086';
            
            researchListHTML += `
                <div class="line" style="opacity: ${research.unlocked ? '1' : '0.5'}">
                    <span>
                        <span style="color: ${statusColor}">${statusIcon}</span>
                        ${research.name}
                    </span>
                    <span style="color: #a6e3a1">${bonus}x → +${(bonus*totalBase).toFixed(1)}</span>
                </div>
            `;
        });
        
        // Totaal research multiplier
        researchListHTML += `
            <div class="line" style="margin-top: 8px; padding-top: 8px; border-top: 1px solid #45475a;">
                <span><strong>Totaal na Research</strong></span>
                <span style="color: #a6e3a1"><strong>+${(researchMult*totalBase).toFixed(1)}</strong></span>
            </div>
        `;
        // //${researchMult.toFixed(2)}x → +
        researchListHTML += `</div>`;
    } else {researchListHTML +=`
            <div class="line" style="margin-top: 8px; padding-top: 8px; border-top: 1px solid #45475a;">
                <span><strong>Totaal Multiplier</strong></span>
                <span style="color: #a6e3a1"><strong>${researchMult.toFixed(2)}x</strong></span>
            </div>
        `;
    }

    // HTML voor consumptie sectie
    let consumptionHTML = '';
    if (cJobs.length > 0) {
        consumptionHTML = `
            <div class="breakdown-section" style="border-left: 3px solid var(--danger);">
                <h3 style="margin-bottom: 10px; color: #f38ba8;">Basis Consumptie</h3>
        `;
        
        cJobs.forEach(cJob => {
            let cVal = cJob.effect[key];
            let cCount = cJob.count;
            let cTotal = cVal * cCount;
            
            consumptionHTML += `
                <div class="line">
                    <span>${cCount}x ${cJob.name}</span>
                    <span class="rate-neg">${cTotal.toFixed(1)}</span>
                </div>
                <small class="sub-line">Basis: ${cVal} per eenheid</small>
            `;
        });
        
        consumptionHTML += `
                <div class="line" style="margin-top: 8px; padding-top: 8px; border-top: 1px solid #45475a;">
                    <span><strong>Subtotaal Consumptie</strong></span>
                    <span class="rate-neg"><strong>${totalConsumption.toFixed(1)}</strong></span>
                </div>
            </div>
        `;
    }

    // Extra consumptie voor food (idle pop + soldiers)
    let extraConsumptionHTML = '';
    if (key === 'food' && (idlePopConsumption !== 0 || soldierFoodConsumption !== 0)) {
        extraConsumptionHTML = `
            <div class="breakdown-section" style="border-left: 3px solid var(--warning);">
                <h3 style="margin-bottom: 10px; color: #fab387;">Extra Consumptie</h3>
        `;
        
        if (idlePopConsumption !== 0) {
            extraConsumptionHTML += `
                <div class="line">
                    <span>${idlePop}x Idle Bevolking</span>
                    <span class="rate-neg">${idlePopConsumption.toFixed(1)}</span>
                </div>
                <small class="sub-line">Basis: -0.5 per persoon</small>
            `;
        }
        
        if (soldierFoodConsumption !== 0) {
            extraConsumptionHTML += `
                <div class="line">
                    <span>Soldaten Onderhoud</span>
                    <span class="rate-neg">${soldierFoodConsumption.toFixed(1)}</span>
                </div>
            `;
        }
        
        extraConsumptionHTML += `</div>`;
    }

    return `
        <div class="detail-overlay" onclick="if(event.target == this) closeDetail()">
            <div class="detail-content panel">
                <button class="close-btn" onclick="closeDetail()">✕</button>
                <h2>${getResourceIcon(key)} ${game.resources[key].name.toUpperCase()} Breakdown</h2>
                
                <div class="breakdown-section" style="border-left: 3px solid var(--accent);">
                    <h3 style="margin-bottom: 10px; color: #89b4fa;">Productie</h3>
                    <div class="line">
                        <span>${count}x ${job ? job.name : 'Basis Productie'}</span>
                        <span class="rate-pos">+${totalBase.toFixed(1)}</span>
                    </div>
                    <small class="sub-line">Basis: ${baseVal} per eenheid</small>
                </div>

                ${researchListHTML}

                <div class="breakdown-section" style="border-left: 3px solid var(--accent);">
                    <h3 style="margin-bottom: 10px; color: #89b4fa;">Prestige Bonus</h3>
                    <div class="line">
                        <span>Prestige Punten: ${game.prestige.points}</span>
                        <span>${prestigeMult.toFixed(2)}x → +${(prestigeAddition - researchaddition).toFixed(1)}</span>
                    </div>
                    <small class="sub-line">+1% per prestige punt</small>
                    <div class="line" style="margin-top: 8px; padding-top: 8px; border-top: 1px solid #45475a;">
                        <span><strong>Totaal na Prestigebonus</strong></span>
                        <span class="rate-pos"><strong>+${finalProduction.toFixed(1)}</strong></span>
                    </div>
                </div>

                ${consumptionHTML}
                ${extraConsumptionHTML}

                <hr style="border:0; border-top: 1px solid #45475a; margin: 10px 0;">
                
                <div class="line total">
                    <span>NETTO TOTAAL / SEC</span>
                    <span class="${finalValue >= 0 ? 'rate-pos' : 'rate-neg'}">${finalValue >= 0 ? '+' : ''}${finalValue.toFixed(1)}</span>
                </div>

                <div style="margin-top: 15px; font-size: 0.85em; text-align: center; color: #a6adc8;">
                    Opslag: ${Math.floor(res.amount)} / ${res.max}
                </div>
            </div>
        </div>
    `;
}

function getResearchMultiplier(resourceKey) {
    let mult = 1.0;
    // Voorbeeld logica: pas aan op basis van jouw research namen
    if (resourceKey === 'food' && game.research.plow_invention?.researched) mult += 0.5;
    if (resourceKey === 'wood' && game.research.axe_tech?.researched) mult += 1;
    if (resourceKey === 'wood' && game.research.wood_tech?.researched) mult += 0.5;
    return mult;
}

    // NIEUWE FUNCTIE: Vind alle researches die deze resource beïnvloeden
function getRelevantResearches(resourceKey) {
    let relevantResearches = [];

    for (let researchKey in game.research) {
        const research = game.research[researchKey];
        let researchEffect = null;

        // Bepaal het effect op basis van resourceKey en welke research het is
        if (resourceKey === 'wood' && researchKey === 'axe_tech' && research.researched) {
            researchEffect = 1.00;
        } else if (resourceKey === 'food' && researchKey === 'plow_invention' && research.researched) {
            researchEffect = 1.50;
        } else if (resourceKey === 'wood' && researchKey === 'wood_tech' && research.researched) {
            researchEffect = 0.50;
        }

        // Alleen toevoegen als er een relevant effect is
        if (researchEffect !== null) {
            relevantResearches.push({
                name: research.name,
                effect: researchEffect,
                unlocked: research.unlocked,
                key: researchKey
            });
        }
    }

    return relevantResearches;
}

function findJobForResource(resourceKey) {
    // We lopen door alle banen heen
    for (let key in game.jobs) {
        let job = game.jobs[key];
        // Als deze baan een effect heeft op de resource (bijv. 'wood')
        // en het effect is positief (productie), dan is dit de juiste job.
        if (job.effect && job.effect[resourceKey] > 0) {
            return job;
        }
    }
    return null; // Geen job gevonden (bijv. voor goud als dat alleen uit belastingen komt)
}

function findJobsForConsumption(resourceKey) {
  let consumingJobs = [];
  
  // We lopen door alle banen heen
  for (let key in game.jobs) {
    let cjob = game.jobs[key];
    
    // Als deze baan een effect heeft op de resource (bijv. 'wood')
    // en het effect is negatief (consumptie), voeg hem toe aan de array
    if (cjob.effect && cjob.effect[resourceKey] < 0) {
      consumingJobs.push(cjob);
    }
  }
  
  return consumingJobs; // Array met alle consumerende jobs (kan leeg zijn)
}



function getResourceIcon(key) {
    const icons = { wood: '🌲', stone: '🧱', gold: '💰', food: '🍞', population: '👥' };
    return icons[key] || '📦';
}

function openResourceDetail(key) {
    const modalContainer = document.getElementById('modal-container');
    modalContainer.innerHTML = renderResourceDetail(key);
    modalContainer.style.display = 'block';
}

function closeDetail() {
    document.getElementById('modal-container').style.display = 'none';
}

function handleFamine() {
    if (game.resources.food.amount <= 0) {
        game.resources.food.amount = 0;
        
        // Hoeveel mensen gaan er weg?
        let deathRate = 0.1; 
        game.resources.population.amount -= deathRate;

        // --- DE FIX: Banen opschonen ---
        // Bereken hoeveel mensen er nu totaal werken
        let totalWorkers = 0;
        for (let jKey in game.jobs) {
            totalWorkers += game.jobs[jKey].count;
        }

        // Als er meer werkers zijn dan mensen, moet er iemand ontslagen worden
        if (totalWorkers > game.resources.population.amount) {
            // We zoeken een job waar mensen werken en halen er eentje weg
            // Je kunt hier prioriteiten stellen, maar we pakken de eerste de beste
            for (let jKey in game.jobs) {
                if (game.jobs[jKey].count > 0) {
                    game.jobs[jKey].count--; 
                    break; // Stop na 1 ontslag per cycle
                }
            }
        }
    }
}
function checkUnlocks() {
    // Check Research Unlocks
    if (game.buildings.lumber_camp.count > 0) {
        game.jobs.woodcutter.unlocked = true;
    }
    if (game.buildings.farm_plot.count > 0) {
        game.jobs.farmer.unlocked = true;
    }
    if (game.research.toolmaking.unlocked) {
        game.buildings.quarry.unlocked = true;
        game.jobs.miner.unlocked = true;
    }
  /*  if (game.research.agriculture.unlocked) {
        game.buildings.farm_plot.unlocked = true;
    }*/
    if (game.research.expeditions.unlocked) {
        game.buildings.scout_post.unlocked = true;
        game.jobs.scout_job.unlocked = true;
        game.resources.scouts.discovered = true;
     //   game.expeditions.easy.unlocked = true;
    }
    // NIEUWE UNLOCKS
    if (game.research.education.unlocked) {
        game.buildings.school.unlocked = true;
        game.jobs.teacher.unlocked = true;
        game.resources.researchPoints.discovered = true;
    }
    if (game.research.irrigation_tech.unlocked) {
        game.buildings.irrigation_system.unlocked = true;
    }    
    if (game.research.warehouse.unlocked) {
        game.buildings.warehouse.unlocked = true;
    }
    if (game.research.banking.unlocked) {
        game.buildings.bank.unlocked = true;
        game.jobs.banker.unlocked = true;
    }
    if (game.research.knight_training.unlocked) {
        game.military.units.knight.unlocked = true;
    }
    if (game.research.commander_tactics.unlocked) {
        game.military.units.commander.unlocked = true;
    }
}
function discoverTribe() {
    const keys = Object.keys(game.tribeTemplates);
    // Kies een willekeurige stam die we nog niet ontdekt hebben
    const available = keys.filter(k => !game.diplomacy.discoveredTribes[k]);

    if (available.length > 0) {
        const randomKey = available[Math.floor(Math.random() * available.length)];
        // Kopieer de template naar onze ontdekte lijst
        game.diplomacy.discoveredTribes[randomKey] = { ...game.tribeTemplates[randomKey] };
        game.diplomacy.unlocked = true;
        alert(`Nieuws van de grens: Je hebt ${game.tribeTemplates[randomKey].name} ontdekt!`);
    } else {
        alert("Je verkenners hebben de hele regio in kaart gebracht, maar geen nieuwe stammen gevonden.");
    }
}
function calculatePrestigePoints() {
    let points = 0;
    
    // 1. Goud: 1 punt per 10.000 goud
    points += Math.floor(game.resources.gold.amount / 10000);
    
    // 2. Gebouwen: 1 punt per 10 gebouwen totaal
    let totalBuildings = 0;
    for(let key in game.buildings) totalBuildings += game.buildings[key].count;
    points += Math.floor(totalBuildings / 10);
    
    // 3. Vijanden: 5 punten per veroverde tribe
    for(let key in game.diplomacy.discoveredTribes) {
        if(game.diplomacy.discoveredTribes[key].isConquered) points += 5;
    }
    
    // 4. Research: 2 punten per voltooide research
    for(let key in game.research) {
        if(game.research[key].researched) points += 2;
    }

    return points;
}
function getPrestigeBreakdown() {
    const goldPoints = Math.floor(game.resources.gold.amount / 10000);
    
    let totalBuildings = 0;
    for(let key in game.buildings) totalBuildings += game.buildings[key].count;
    const buildingPoints = Math.floor(totalBuildings / 10);
    
    let conqueredCount = 0;
    for(let key in game.diplomacy.discoveredTribes) {
        if(game.diplomacy.discoveredTribes[key].isConquered) conqueredCount++;
    }
    const tribePoints = conqueredCount * 5;
    
    let researchCount = 0;
    for(let key in game.research) {
        if(game.research[key].researched) researchCount++;
    }
    const researchPoints = researchCount * 2;

    return {
        total: goldPoints + buildingPoints + tribePoints + researchPoints,
        details: `
            <ul style="list-style: none; padding: 0; text-align: left; font-size: 0.9em;">
                <li>💰 Goud: +${goldPoints}</li>
                <li>🏠 Gebouwen: +${buildingPoints}</li>
                <li>⚔️ Veroveringen: +${tribePoints}</li>
                <li>🧪 Research: +${researchPoints}</li>
            </ul>
        `
    };
}

// --- ACTIONS ---

function buyBuilding(key) {
    const b = game.buildings[key];
    const cost = getCost(b);
    if (canAfford(cost)) {
        payCost(cost);
        b.count++;
        recalcLimits();
        recalcRates();  // Toegevoegd om productie bij te werken
        updateUI();
    }
}

function buyResearch(key) {
    const r = game.research[key];
    if (canAfford(r.cost) && !r.unlocked) {
        payCost(r.cost);
        r.unlocked = true;
        r.researched = true; // Markeer als voltooid
        checkUnlocks();
        recalcRates();
        updateUI();
    }
}
function assignJob(jobKey, direction) {
    const job = game.jobs[jobKey];
    let amountToChange = buyAmount;

    if (direction === 1) { // Toevoegen
        const idle = getIdlePopulation();
        const spaceLeft = job.max - job.count;
        
        // Als 'max' is geselecteerd (we gebruiken -1 of 'max' als waarde)
        if (buyAmount === 'max') amountToChange = Math.min(idle, spaceLeft);
        else amountToChange = Math.min(buyAmount, idle, spaceLeft);

        if (amountToChange > 0) job.count += amountToChange;
    } else { // Verwijderen
        if (buyAmount === 'max') amountToChange = job.count;
        else amountToChange = Math.min(buyAmount, job.count);
        
        job.count -= amountToChange;
    }
    recalcRates();
    updateUI();
}

function startExpedition(typeKey) {
    const type = game.expeditions.types[typeKey];
    
    // 1. Maak een kopie van de kosten ZONDER de scouts om te kunnen betalen
    let resourceCosts = { ...type.cost };
  //  console.log(`Originele kosten: ${JSON.stringify(type.cost)}`);
    //delete resourceCosts.scouts; 
    // Bereken de reductie: 1% per onbesteed punt + bonus van upgrades
    const pointBonus = game.prestige.points * 0.01; 
    const upgradeBonus = (game.prestige.upgrades.efficient_scouting?.level || 0) * 0.05;
    const totalReduction = pointBonus + upgradeBonus;
    const finalTime = type.duration * (1 - Math.min(0.9, totalReduction)); // Maximaal 90% sneller


    // 2. Check of we de grondstoffen hebben EN of we genoeg verkenners hebben
    const canPayResources = canAfford(resourceCosts);
    const hasEnoughScouts = game.resources.scouts.amount >= (type.cost.scouts || 0);

    if (canPayResources && hasEnoughScouts && !game.expeditions.active) {
        // 3. Betaal alleen de grondstoffen
        payCost(resourceCosts);
        // 4. Trek de verkenners af
        //game.resources.scouts.amount -= (type.cost.scouts || 0);
        game.resources.population.amount -= (type.cost.scouts || 0); // Verkenners zijn tijdelijk niet beschikbaar
        game.jobs.scout_job.count -= (type.cost.scouts || 0); // Verlaag het aantal verkenners in dienst
        // 5. Start de expeditie
        
        game.expeditions.active = true;
        game.expeditions.currentType = typeKey;
        game.expeditions.timer = finalTime;
        
        updateUI();
    }
}

function completeExpedition() {
    const typeKey = game.expeditions.currentType;
    const type = game.expeditions.types[typeKey];
    game.expeditions.active = false;

    // Bepaal succes op basis van successRate (later te beïnvloeden door upgrades)
    let bonusChance = game.research.better_maps?.unlocked ? 0.15 : 0; // Voorbeeld voor later
    if (Math.random() < (type.successRate + bonusChance)) {
        giveReward(typeKey);
    } else {
        alert("De expeditie is mislukt. De verkenners zijn met lege handen teruggekeerd.");
    }
    updateUI();
}

function giveReward(type) {
    let msg = "Succes! ";
    
    if (type === 'easy') {
        let wood = Math.floor(Math.random() * 50) + 20;
        addResource('wood', wood);
        msg += `Je vond een bos en verzamelde ${wood} hout.`;
    } 
    else if (type === 'medium') {
        let gold = Math.floor(Math.random() * 100) + 50;
        let newPeople = Math.random() < 0.3 ? 1 : 0; // 30% kans op 1 persoon
        addResource('gold', gold);
        if(newPeople) game.resources.population.amount += newPeople;
        msg += `Je vond een handelsroute! +${gold} goud ${newPeople ? 'en een nieuwe inwoner sloot zich aan.' : ''}`;
    }
    else if (type === 'hard') {
        // Hier kun je een functie aanroepen om een nieuw volk te maken
        discoverTribe(); 
        // msg al in die functie afgehandeld
        // msg += "Je hebt contact gelegd met een nieuw volk!";
    }
    else if (type === 'expert') {
        // Kans op een unieke unlock
        if (!game.research.banking.unlocked && Math.random() < 0.5) {
             game.research.banking.unlocked = true; 
             msg += "Je verkenners leerden over een 'Bankenstelsel' van een verre beschaving!";
        } else {
             addResource('gold', 2000);
             msg += "Je vond een verlaten schatkamer! +2000 goud.";
        }
    }
    alert(msg);
}

function toggleTradeRoute(tribeKey) {
    const tribe = game.diplomacy.discoveredTribes[tribeKey];
    
    // Als de route al open is, zetten we hem dicht (gratis)
    if (tribe.tradeRouteActive) {
        tribe.tradeRouteActive = false;
    } else {
        // Alleen openen als de relatie goed genoeg is
        if (tribe.relation >= 60) {
            tribe.tradeRouteActive = true;
        } else {
            alert("De relatie is niet goed genoeg om een handelsroute te starten.");
        }
    }
    recalcRates();
    updateUI();
}

function attackTribe(tribeKey) {
    const tribe = game.diplomacy.discoveredTribes[tribeKey];
    // Stel: een tribe heeft ook een defensePower (bijv. 500)
    const tribeDefense = tribe.defenseValue || 500; 

    if (game.military.attackPower > tribeDefense) {
        alert(`Overwinning! Je hebt ${tribe.name} verslagen. Ze betalen je nu 5 goud per seconde tribuut.`);
        tribe.isConquered = true;
        tribe.relation = 0; // Ze haten je, maar ze betalen
    } else {
        alert("Je aanval is mislukt! De tribe slaat onmiddellijk terug.");
        triggerCounterAttack(tribeKey);
    }
    updateUI();
}

function triggerCounterAttack(_tribeKey) {
    const tribeAttack = 400; // Kracht van de vijand
    if (tribeAttack > game.military.defensePower) {
        const loss = 200;
        game.resources.gold.amount = Math.max(0, game.resources.gold.amount - loss);
        alert(`Je verdediging werd doorbroken! De tribe heeft ${loss} goud geplunderd.`);
    } else {
        alert("Je leger heeft de tegenaanval succesvol afgeslagen!");
    }
}
function attackTribe(tribeKey) {
    const tribe = game.diplomacy.discoveredTribes[tribeKey];
    // Tribes hebben een random defense tussen 100 en 1000 voor nu
    const tribeDefense = tribe.defenseValue || 300; 

    if (game.military.attackPower > tribeDefense) {
        const loot = {
            wood: Math.floor(Math.random() * 1000) + 500,
            stone: Math.floor(Math.random() * 1000) + 500,
            gold: Math.floor(Math.random() * 500) + 200
        };

        // Grondstoffen toevoegen
        game.resources.wood.amount += loot.wood;
        game.resources.stone.amount += loot.stone;
        game.resources.gold.amount += loot.gold;

        alert(`⚔️ OVERWINNING! \n\nJe hebt ${tribe.name} verslagen!\n\nBuit:\n- ${loot.wood} Hout\n- ${loot.stone} Steen\n- ${loot.gold} Goud\n\nZe betalen vanaf nu ook elk uur tribuut.`);        tribe.isConquered = true;
        tribe.tributeAmount = 10; // 10 goud per seconde
        tribe.isConquered = true;
        tribe.rebellionLevel = 0; // Begint op 0%
    } else {
        alert(`❌ NEDERLAAG!\n\nJe aanvalsleger (Kracht: ${Math.floor(game.military.attackPower)}) was niet sterk genoeg om door de verdediging van ${tribe.name} (Kracht: ${tribeDefense}) heen te breken.\n\nJe trekt je troepen terug.`);
        
        // Straf: Verlies 20% van je offensieve eenheden
        for (let key in game.military.units) {
            const u = game.military.units[key];
            if (u.assignedOff > 0) {
                const lost = Math.ceil(u.assignedOff * 0.2);
                u.assignedOff -= lost;
                u.total -= lost;
            }
        }
    }
    recalcRates();
    updateUI();
}

function triggerEnemyAttack(tribeKey) {
    const tribe = game.diplomacy.discoveredTribes[tribeKey];
    // De aanvalskracht van de tribe (bijv. tussen 100 en 500)
    const enemyPower = Math.floor(Math.random() * 400) + 100;

    alert(`⚠️ ALARM! ${tribe.name} valt je stad aan met een kracht van ${enemyPower}!`);

    if (game.military.defensePower >= enemyPower) {
        alert(`Je defensieve leger heeft de aanval succesvol afgeslagen!`);
        // Optioneel: verlies een paar verdedigingsunits
    } else {
        const goldLost = Math.floor(game.resources.gold.amount * 0.2);
        game.resources.gold.amount -= goldLost;
        alert(`Je verdediging werd doorbroken! ${tribe.name} heeft ${goldLost} goud geplunderd.`);
    }
    updateUI();
}

// Functie om een unit te trainen
function trainUnit(unitKey) {
    const unit = game.military.units[unitKey];
    //check is er iemand om te trainen
    const totalWorking = Object.values(game.jobs).reduce((a, b) => a + b.count, 0);
    const totalMilitary = Object.values(game.military.units).reduce((a, b) => a + b.total, 0);
    const idlePop = game.resources.population.amount - totalWorking;// - totalMilitary;

    if (idlePop < 1) {
        alert("Er is niemand beschikbaar om te trainen! Zorg voor meer werkloze inwoners.");
        return;
    }
 //   console.log(`Beschikbare inwoners voor training: ${idlePop}, totalWorking: ${totalWorking}, totalMilitary: ${totalMilitary}`);

    // Check of we de kosten kunnen betalen
    if (canAfford(unit.cost)) {
        payCost(unit.cost);
        unit.total++;
        game.resources.population.amount -= 1; // Verlaag de bevolking met 1 voor elke getrainde soldaat
        // Direct de kracht herberekenen en de UI verversen
        recalcMilitary();
        recalcRates();
        updateUI();
        console.log(`${unit.name} getraind. Totaal: ${unit.total}`);
    } else {
        console.log("Niet genoeg resources om deze unit te trainen.");
    }
}

function assignUnit(unitKey, target) {
    const u = game.military.units[unitKey];
    const unassigned = u.total - u.assignedOff - u.assignedDef;

    if (target === 'off') {
        if (unassigned > 0) {
            // Er zijn vrije units, wijs toe aan off
            u.assignedOff++;
            //console.log(`Unit ${unitKey} toegewezen aan Offensie. Assigned Off: ${u.assignedOff}, Assigned Def: ${u.assignedDef}, Unassigned: ${unassigned - 1}`);
        } else if (u.assignedDef > 0) {
            // Geen vrije units, maar wel def units: verplaats van def naar off
            u.assignedDef--;
            u.assignedOff++;
            //console.log(`Unit ${unitKey} verplaatst van Defensie naar Offensie. Assigned Off: ${u.assignedOff}, Assigned Def: ${u.assignedDef}, Unassigned: ${unassigned}`);
        }
        // Anders: geen vrije units en geen def units -> doe niets
    } else if (target === 'def') {
        if (unassigned > 0) {
            // Er zijn vrije units, wijs toe aan def
            u.assignedDef++;
            //console.log(`Unit ${unitKey} toegewezen aan Defensie. Assigned Off: ${u.assignedOff}, Assigned Def: ${u.assignedDef}, Unassigned: ${unassigned - 1}`);
        } else if (u.assignedOff > 0) {
            // Geen vrije units, maar wel off units: verplaats van off naar def
            u.assignedOff--;
            u.assignedDef++;
            //console.log(`Unit ${unitKey} verplaatst van Offensie naar Defensie. Assigned Off: ${u.assignedOff}, Assigned Def: ${u.assignedDef}, Unassigned: ${unassigned}`);
        }
        // Anders: geen vrije units en geen off units -> doe niets
    }

    recalcMilitary();
    updateUI();
}

// De berekening van de aanvals- en verdedigingskracht
function recalcMilitary() {
    let offPower = 0;
    let defPower = 0;
    let offMultiplier = 1;
    let defMultiplier = 1;

    for (let key in game.military.units) {
        const u = game.military.units[key];
       // offPower += u.assignedOff * u.off;
       // defPower += u.assignedDef * u.def;
            const numOff = u.assignedOff || 0;
            const numDef = u.assignedDef || 0;
            const valOff = u.off || 0;
            const valDef = u.def || 0;

            offPower += numOff * valOff;
            defPower += numDef * valDef;

            if (u.offMultiplier) {
                offMultiplier += (numOff * (u.offMultiplier - 1));
            }
            if (u.defMultiplier) {
                defMultiplier += (numDef * (u.defMultiplier - 1));
            }
    }

    // Pas de multiplier toe op het totaal
    game.military.attackPower = isNaN(offPower) ? 0 : offPower * offMultiplier;
    game.military.defensePower = isNaN(defPower) ? 0 : defPower * defMultiplier;
}

function checkRebellions() {
    for (let key in game.diplomacy.discoveredTribes) {
        const tribe = game.diplomacy.discoveredTribes[key];
        
        if (tribe.isConquered) {
            // Basis kans op rebellie stijgt elke minuut
            // Maar wordt verlaagd door jouw Defense Power
            const suppression = game.military.defensePower / 100; 
            const rebellionRise = Math.max(0.1, 5 - suppression); 
            
            tribe.rebellionLevel += rebellionRise;
            console.log("Rebellies gecontroleerd.", tribe.name, "niveau toegenomen met:", rebellionRise, "tot:", Math.round(tribe.rebellionLevel)); 
            // Als het level boven de 100 komt, is er een opstand!
            if (tribe.rebellionLevel >= 100) {
                triggerRebellion(key);
            }
        }
    
   
    }
    updateUI();
}

function triggerRebellion(tribeKey) {
    const tribe = game.diplomacy.discoveredTribes[tribeKey];
    alert(`🚨 REBELLIE! De bevolking van ${tribe.name} is in opstand gekomen! Je ontvangt geen tribuut meer en moet ze opnieuw onderwerpen.`);
    
    tribe.isConquered = false;
    tribe.rebellionLevel = 0;
    tribe.relation = 0;
    
    // De tribe is nu weer aanvalbaar in de Leger tab
    recalcRates();
    updateUI();
}

function performPrestige() {
    const earnedPoints = calculatePrestigePoints();
    
    // 1. Punten bijschrijven
    game.prestige.points += earnedPoints;
    game.prestige.totalEarned += earnedPoints;

    // 2. Prestige Upgrades & Punten veiligstellen
    const permanentPrestige = JSON.parse(JSON.stringify(game.prestige));

    // 3. De Game resetten naar de basis
    game = getInitialState();
    
    // 4. Prestige data terugzetten
    game.prestige = permanentPrestige;

    // 5. "Starter Pack" bonus uitdelen
    const starterLevel = game.prestige.upgrades.starter_pack.level;
    if (starterLevel > 0) {
        const bonus = starterLevel * 500;
        game.resources.wood.amount += bonus ; game.resources.wood.max += bonus;
        game.resources.stone.amount += bonus ; game.resources.stone.max += bonus;
        game.resources.food.amount += bonus ; game.resources.food.max += bonus;
    }

    // 6. Opslaan en herladen
    saveGame();
    alert(`Je bent herboren! Je start nu met ${game.prestige.points} prestige punten en je bonussen zijn actief.`);
    window.location.reload(); // Dit dwingt de browser alles vers in te laden
    //updateUI();

}
function buyPrestigeUpgrade(key) {
    const upg = game.prestige.upgrades[key];
    if (game.prestige.points >= upg.cost && upg.level < upg.max) {
        game.prestige.points -= upg.cost;
        upg.level++;
        saveGame();
        renderPrestige(); // UI verversen
    }
}

// Helper functies voor kosten
function getCost(item) {
    let actualCost = {};
    for (let res in item.cost) {
        actualCost[res] = Math.floor(item.cost[res] * Math.pow(1.15, item.count || 0));
    }
    return actualCost;
}

function canAfford(cost) {
    for (let res in cost) {
        if (!game.resources[res] || game.resources[res].amount < cost[res]) return false;
    }
    return true;
}

function payCost(cost) {
    for (let res in cost) game.resources[res].amount -= cost[res];
}

function setBuyAmount(amount) {
    buyAmount = amount;
    renderJobs(); // Herteken de jobs om de knoppen te updaten
    // Optioneel: voeg een 'active' class toe aan de knoppen in de UI
}

// --- OPSLAAN & LADEN ---
function saveGame() {
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
        console.log("Game Loaded");
}

// --- UI RENDERING ---
function updateUI() {
    // Deze moet ALTIJD draaien (elke seconde)
    updateResourceBar()
  //  updateNavigationGlow();
    // De rest draait alleen voor het tabblad waar de speler op kijkt
    // Gebruik de ID's die in je HTML staan bij de buttons (data-tab)
    switch(currentTab) {
        case 'jobs':
            renderBuildings();
            break;
        case 'buildings':
            renderBuildings();
            break;
        case 'resources':
            renderResourceTable();
            renderResources();
            break;
        case 'population':
            document.getElementById('pop-idle').innerText = getIdlePopulation();
            document.getElementById('pop-total').innerText = Math.floor(game.resources.population.amount); 
            renderJobs();
            break;
        case 'research':
            renderResearch();
            break;
        case 'explore':
            renderExplore();
            break;
        case 'diplomacy':
            renderDiplomacy();
            break;
        case 'military':
            renderMilitary();
            break;
        case 'prestige':
            renderPrestige();
            break;
        case 'settings':
            renderSettings();
            break;
    }
}

function updateResourceBar() {
    // Resources updaten
    document.getElementById('res-wood').innerText = Math.floor(game.resources.wood.amount);
    document.getElementById('res-stone').innerText = Math.floor(game.resources.stone.amount);
    document.getElementById('res-gold').innerText = Math.floor(game.resources.gold.amount);
    document.getElementById('res-food').innerText = Math.floor(game.resources.food.amount);
    document.getElementById('res-research').innerText = Math.floor(game.resources.researchPoints.amount);
 //   document.getElementById('res-scouts').innerText = Math.floor(game.resources.scouts.amount);
    
    // Bevolking en Leger
    document.getElementById('res-pop').innerText = `${Math.floor(game.resources.population.amount)}/${game.resources.population.max}`;
    document.getElementById('res-power').innerText = Math.floor(game.military.attackPower) + " / " + Math.floor(game.military.defensePower);

    // Rates (per seconde) updaten met kleuren
    updateRateDisplay('rate-wood', game.resources.wood.perSec);
    updateRateDisplay('rate-stone', game.resources.stone.perSec);
    updateRateDisplay('rate-gold', game.resources.gold.perSec);
    updateRateDisplay('rate-food', game.resources.food.perSec);
    updateRateDisplay('rate-research', game.resources.researchPoints.perSec);
}

function updateRateDisplay(id, rate) {
    const el = document.getElementById(id);
    // Als het element niet bestaat, stop de functie dan hier (geen crash!)
    if (!el) return
    const prefix = rate >= 0 ? "+" : "";
    el.innerText = prefix + rate.toFixed(1);
    el.className = rate >= 0 ? "rate-pos" : "rate-neg";
}

function updateNavigationGlow() {
    const prestigeBtn = document.getElementById('nav-btn-prestige');
    const potential = calculatePrestigePoints();
    
    // Voorwaarde 1: Je hebt minimaal 100 inwoners (de basis-eis)
    // Voorwaarde 2: Je bent NIET op het prestige tabblad
    // Voorwaarde 3: (Optioneel) Je hebt bijv. 50 potentiële punten verzameld
    if (game.resources.population.amount >= 100  && potential >= 10) { //&& currentTab !== 'prestige'
        prestigeBtn.classList.add('glow-active');
    } else {
        prestigeBtn.classList.remove('glow-active');
    }

}

function renderResourceTable() {
 //   console.log("Rendering resource table...");
    const resBody = document.getElementById('resource-tbody');
    if (!resBody) return;

    resBody.innerHTML = '';
    for(let key in game.resources) {
        const r = game.resources[key];
        if(!r.discovered) continue;
        resBody.innerHTML += `<tr>
            <td>${r.name}</td>
            <td>${Math.floor(r.amount)}</td>
            <td>${r.max}</td>
            <td style="color: ${r.perSec >= 0 ? '#a6e3a1' : '#f38ba8'}">${r.perSec.toFixed(2)}/s</td>
            <td>${r.perSec !== 0 ? 'Actief' : 'Stabiel'}</td>
        </tr>`;
    }
}

function renderResources() {
    const container = document.getElementById('tab-resources');
    container.innerHTML = '<h1>Grondstoffen</h1>';

    for (let key in game.resources) {
        const res = game.resources[key];
        if (key === 'population') continue; // Bevolking doen we apart

        const max = res.max || 1000;
        const perc = Math.min(100, (res.amount / max) * 100);
        // Haal de details op via de nieuwe functie
        const productionDetails = getProductionDetails(key);
        const netColor = res.perSec >= 0 ? 'var(--green)' : 'var(--red)';

        container.innerHTML += `
            <div class="panel">
                <div style="display:flex; justify-content:space-between">
                    <strong>${res.name.charAt(0).toUpperCase() + res.name.slice(1)}</strong>
                    <span>${Math.floor(res.amount)} / ${max}</span>
                </div>
                
                <div class="progress-container">
                    <div class="progress-bar" style="width: ${perc}%"></div>
                    <div class="progress-text">${perc.toFixed(0)}%</div>
                </div>

                
                <div style="background: rgba(0,0,0,0.2); padding: 8px; border-radius: 8px; font-size: 0.8em;">
                ${getProductionDetails(key)}
                <div style="margin-top:5px; padding-top:5px; border-top: 1px solid var(--accent); color: ${netColor}; font-weight: bold; font-size: 1.1em;">
                        Netto: <span class="${res.perSec >= 0 ? 'rate-pos' : 'rate-neg'}">
                            ${res.perSec >= 0 ? '+' : ''}${res.perSec.toFixed(1)}/s
                        </span>
                     </div>
                </div>
            </div>
        `;
        
    }
}

function getProductionDetails(key) {
    let details = "";
    let baseProduction = 0;

    // --- A. BASIS PRODUCTIE (Jobs & Gebouwen) ---
    for (let jKey in game.jobs) {
        const job = game.jobs[jKey];
        if (job.effect && job.effect[key]) {
            const prod = job.effect[key] * job.count;
            if (prod !== 0) {
                baseProduction += prod;
                details += `<div style="color: #a6adc8;">${job.name}: +${prod.toFixed(1)}</div>`;
            }
        }
    }

    if (baseProduction === 0) return "Geen passieve productie";

    // --- B. MULTIPLIERS BEREKENEN ---
    let multiplier = 1;

    // 1. Prestige Punten (1% per punt)
    const prestigePointBonus = (game.prestige.points * 0.01);
    multiplier += prestigePointBonus;

    // 2. Prestige Upgrades (bijv. multiplier op specifieke jobs)
    // Voorbeeld: 'efficient_farming' geeft 10% per level
    if (key === 'food' && game.prestige.upgrades.efficient_farming) {
        multiplier += (game.prestige.upgrades.efficient_farming.level * 0.1);
    }

    // 3. Normale Research Upgrades (multiplier op gebouwen/jobs)
    // Voorbeeld: De Ploeg (plow_invention) was al 50%
    if (key === 'food' && game.research.plow_invention?.researched) {
        multiplier += 0.5;
    }

    // --- C. DETAILS SAMENSTELLEN ---
    if (multiplier > 1) {
        const bonusPerc = ((multiplier - 1) * 100).toFixed(0);
        details += `<div style="color: var(--accent); border-top: 1px dashed #444; margin-top: 5px;">
            Bonussen: +${bonusPerc}%
        </div>`;
    }

    return details;
}

function renderBuildings() {
    const container = document.getElementById('building-list');
    container.innerHTML = '';
    for (let key in game.buildings) {
        const b = game.buildings[key];
        if (!b.unlocked) continue;

        const cost = getCost(b);
        let costTxt = [];
        for (let r in cost) costTxt.push(`${cost[r]} ${game.resources[r].name}`);

        container.innerHTML += `
            <div class="panel">
                <strong>${b.name}</strong> (Aantal: ${b.count})<br>
                <small>${b.desc}</small><br>
                <button class="tap-btn" style="width: 100%; height: 50px;" onclick="buyBuilding('${key}')" ${canAfford(cost) ? '' : 'disabled'}>
                    Bouw (${costTxt.join(', ')})
                </button>
            </div>`;
    }
}

function renderJobs() {
    const container = document.getElementById('jobs-container'); // Verander naar een DIV in je HTML
    container.innerHTML = `
        <div class="buy-amount-bar">
            <button class="${buyAmount === 1 ? 'active' : ''}" onclick="setBuyAmount(1)">1</button>
            <button class="${buyAmount === 10 ? 'active' : ''}" onclick="setBuyAmount(10)">10</button>
            <button class="${buyAmount === 100 ? 'active' : ''}" onclick="setBuyAmount(100)">100</button>
            <button class="${buyAmount === 'max' ? 'active' : ''}" onclick="setBuyAmount('max')">MAX</button>
        </div>
    `;

    for (let key in game.jobs) {
        const job = game.jobs[key];
        if (!job.unlocked) continue;

        const canHire = getIdlePopulation() > 0 && job.count < job.max;
      
        // 1. Multiplier berekening (jouw logica behouden)
        let multiplier = 1;
        if (key === 'farmer' && game.research.plow_invention.unlocked) multiplier = 1.5;
        if (key === 'farmer' && game.buildings.irrigation_system.count > 0) {
            multiplier *= (1 + (game.buildings.irrigation_system.count * 0.5)); // Voorbeeld: 50% per gebouw
        }

        // 2. Effect tekst
        let effectTxtParts = [];
        for (let resType in job.effect) {
            const finalValue = (job.effect[resType] * multiplier).toFixed(1);
            const resName = game.resources[resType].name;
            effectTxtParts.push(`${finalValue > 0 ? '+' : ''}${finalValue} ${resName}`);
        }
        const effectDisplay = effectTxtParts.join(', ') + " /sec";
        const displayAmount = buyAmount === 'max' ? 'Max' : buyAmount;
        // 3. De Mobiele "Stepper" Card
        container.innerHTML += `
            <div class="panel" style="margin-bottom: 10px;">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <button class="step-btn" onclick="assignJob('${key}', -1)" style="background: var(--red);"font-size: 0.5em;>
                        <span style="font-size: 0.5em; display:block;">-${displayAmount}</span>
                    </button>
                    
                    <div style="text-align: center; flex: 1;">
                        <div style="font-weight: bold;">${job.name}</div>
                        <div style="font-size: 1.2em;">
                            <span class="big-num">${job.count}</span> / <small>${job.max}</small>
                        </div>
                        <div style="font-size: 0.7em; color: #a6adc8;">${effectDisplay}</div>
                    </div>

                    <button class="step-btn" onclick="assignJob('${key}', 1)" style="background: var(--green);"font-size: 0.5em; ${getIdlePopulation() > 0 && job.count < job.max ? '' : 'disabled'}>
                        <span style="font-size: 0.5em; display:block;">+${displayAmount}</span>
                    </button>
                </div>
            </div>`;
    }
}

function renderResearch() {
    const container = document.getElementById('tab-research');
    container.innerHTML = '<h1>Research</h1>';
    for (let key in game.research) {
        const r = game.research[key];
        if (r.unlocked || !r.requirement()) continue;

        let costTxt = [];
        for (let c in r.cost) costTxt.push(`${r.cost[c]} ${game.resources[c].name}`);

        container.innerHTML += `
            <div class="panel">
                <strong>${r.name}</strong><br><small>${r.desc}</small><br>
                <button class="tap-btn" style="width: 100%; height: 50px;" onclick="buyResearch('${key}')" ${canAfford(r.cost) ? '' : 'disabled'}>
                    Onderzoek (${costTxt.join(', ')})
                </button>
            </div>`;
            
    };
    container.innerHTML += '<h1>Research gedaan</h1>';
    for (let key in game.research) {
        const r = game.research[key];
        if (r.researched == true) {
            container.innerHTML += `
                <div class="panel">
                    <strong>${r.name}</strong><br><small>${r.desc}</small>
                </div>`;
        }
    }
}

function renderManualButtons() {
    const container = document.getElementById('manual-actions-container');
    container.innerHTML = ``;
    for (let key in game.resources) {
        const res = game.resources[key];
        if (res.manualGain) {
            const btn = document.createElement('button');
            btn.className = 'tap-btn';//'action-btn-small';
            btn.innerText = `${res.name} +${res.manualGain}`;
            btn.onclick = (e) => {
                addResource(key, res.manualGain);
                showFloatingText(e, `+${res.manualGain} ${res.name}`);
            };
            btn.style.flex = '1';
            btn.style.minWidth = '120px';
            btn.style.maxWidth = '200px';
            container.appendChild(btn);
        }
    }
}
 function showFloatingText(e, text) {
    const el = document.createElement('div');
    el.innerText = text;
    el.className = 'floating-text';

    // Haal de positie van de button op
    //const rect = element.getBoundingClientRect();
    
    // Plaats de text boven het midden van de button
   // el.style.left = `${rect.left + rect.width / 2}px`;
   // el.style.top = `${rect.top + window.scrollY}px`;
    // Gebruik pageX/pageY in plaats van clientX/clientY om rekening te houden met scrollen
    const x = e.pageX || (e.touches ? e.touches[0].pageX : 0);
    const y = e.pageY || (e.touches ? e.touches[0].pageY : 0);

    el.style.left = `${x - 20}px`; // Beetje centreren boven de vinger/muis
    el.style.top = `${y - 20}px`;
    document.body.appendChild(el);

    setTimeout(() => {
        if (el.parentNode) el.remove();
    }, 1000);
}

function renderExplore() {
    const container = document.getElementById('tab-explore');
    container.innerHTML = '<h1>Verkennen</h1>';
 //   container.innerHTML += `<p>Scouts count: ${game.jobs.scout_job.count} resources: ${game.resources.scouts.amount}</p>`;
    if (game.expeditions.active) {
        // Toon voortgangsbalk van huidige missie
        const type = game.expeditions.types[game.expeditions.currentType];
        const progress = ((type.duration - game.expeditions.timer) / type.duration) * 100;

        container.innerHTML += `
            <div class="panel">
                <h3>${type.name} in uitvoering...</h3>
                <p>Tijd resterend: ${game.expeditions.timer}s</p>
                <div style="width: 100%; background: #45475a; height: 15px; border-radius: 5px;">
                    <div style="width: ${progress}%; background: #a6e3a1; height: 100%; border-radius: 5px; transition: width 1s linear;"></div>
                </div>
            </div>
        `;
    } else {
        // Toon lijst met beschikbare missies
        for (let key in game.expeditions.types) {
            const e = game.expeditions.types[key];
            if (!e.requirements()) continue;

            let costTxt = [];
            for (let c in e.cost) costTxt.push(`${e.cost[c]} ${game.resources[c].name}`);

            container.innerHTML += `
                <div class="panel" style="margin-bottom: 10px;">
                    <strong>${e.name}</strong> (${key})<br>
                    <small>Duur: ${e.duration}s | Kans: ${e.successRate * 100}%</small><br>
                    <small>Kosten: ${costTxt.join(', ')}</small><br>
                    <button class="build-btn" onclick="startExpedition('${key}')" ${canAfford(e.cost) && game.jobs.scout_job.count >= (e.cost.scouts || 0) ? '' : 'disabled'}>
                        Start Missie
                    </button>
                </div>
            `;
        }
    }
}
function renderDiplomacy() {
    const container = document.getElementById('tab-diplomacy');
    if (!container) return;
    
    container.innerHTML = '<h1>Diplomatie</h1>';

    // Check of er al iets ontdekt is
    if (!game.diplomacy.unlocked || Object.keys(game.diplomacy.discoveredTribes).length === 0) {
        container.innerHTML += '<p>Je hebt nog geen andere volken ontdekt. Stuur expedities uit.</p>';
        return;
    }

    // De loop begint hier
    for (let key in game.diplomacy.discoveredTribes) {
        const tribe = game.diplomacy.discoveredTribes[key]; // HIER wordt 'tribe' gedefinieerd
        
        let relationText = tribe.relation > 80 ? "Bondgenoot" : tribe.relation > 40 ? "Neutraal" : "Vijandig";
        const canTrade = tribe.relation >= 60;
        const btnTradeText = tribe.tradeRouteActive ? "Handel Stoppen" : "Handelsroute Openen";

        // We bouwen de HTML op BINNEN de loop, zodat 'tribe' bekend is
        container.innerHTML += `
            <div class="panel">
                <h3>${tribe.name}</h3>
                <p><em>${tribe.desc}</em></p>
                <p>Relatie: <strong>${tribe.relation}/100 (${relationText})</strong></p>
                
                <div style="width: 100%; background: #45475a; height: 8px; border-radius: 4px; margin-bottom: 10px;">
                    <div style="width: ${tribe.relation}%; background: ${tribe.relation > 40 ? '#a6e3a1' : '#f38ba8'}; height: 100%; border-radius: 4px;"></div>
                </div>

                <button class="action-btn-small" onclick="sendGift('${key}')" ${game.resources.gold.amount >= 100 ? '' : 'disabled'}>
                    Stuur Geschenk (100 Goud, +5 Relatie)
                </button>
                <button class="action-btn-small" style="background: #fab387; color: #11111b;" onclick="deteriorateRelation('${key}', 'insult')">
                    Beledig Stam (-10 Relatie)
                </button>
                <button class="action-btn-small" style="background: #f38ba8; color: #11111b;" onclick="deteriorateRelation('${key}', 'provoke')">
                    Provoceer Leger (-25 Relatie)
                </button>

                <div style="margin-top: 10px; padding: 10px; background: rgba(255,255,255,0.05); border-radius: 5px;">
                    <p><small>Handel focus: ${Object.keys(tribe.resources).join(' & ')}</small></p>
                    <button class="action-btn-small" 
                            onclick="toggleTradeRoute('${key}')" 
                            ${canTrade || tribe.tradeRouteActive ? '' : 'disabled'}>
                        ${btnTradeText}
                    </button>
                    ${!canTrade && !tribe.tradeRouteActive ? '<br><small style="color:#f38ba8">Eis: Relatie 60+</small>' : ''}
                </div>
            </div>
        `;
    } // De loop eindigt pas HIER
}
function renderMilitary() {


    const container = document.getElementById('tab-military');
    if (!container) return; // Veiligheidscheck


    recalcMilitary();
    
    // Deel 1: Header en Kracht Overzicht
    container.innerHTML = `<h1>Militair Hoofdkwartier</h1>`;
    container.innerHTML += `
        <div style="display: flex; gap: 20px; margin-bottom: 20px;">
            <div class="panel" style="flex:1; border-left: 5px solid #f38ba8;">
                <h3>Aanvalskracht: ${Math.floor(game.military.attackPower)}</h3>
            </div>
            <div class="panel" style="flex:1; border-left: 5px solid #a6e3a1;">
                <h3>Verdedigingskracht: ${Math.floor(game.military.defensePower)}</h3>
            </div>
        </div>
    `;


    for (let key in game.military.units) {
        const u = game.military.units[key];
                if (u.unlocked === false) continue; // Sla niet-ontgrendelde units over
        const unassigned = u.total - u.assignedOff - u.assignedDef;
        const assigned = u.assignedOff + u.assignedDef;
        const unitKey = key; // Voor de functie calls


        container.innerHTML += `
    <div class="panel">
        <div style="display:flex; justify-content:space-between">
            <strong>${u.name}</strong>
            <span>Toegewezen: ${assigned}/${u.total} eenheden</span>
        </div>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 10px;">
            <button class="action-btn-small" onclick="assignUnit('${unitKey}', 'off')">⚔️ Aanval: ${u.assignedOff}</button>
            <button class="action-btn-small" onclick="assignUnit('${unitKey}', 'def')">🛡️ Verdediging: ${u.assignedDef}</button>
        </div>
        <button class="build-btn" style="background: var(--accent)" onclick="trainUnit('${key}')">
            Train (1 pop, ${u.cost.gold} gold, ${u.cost.food} food)
        </button>
    </div>
`;
    }

    // Deel 3: Doelwitten (Tribes met relatie < 30)
    container.innerHTML += `
        <div class="panel" style="margin-top: 20px; border-top: 4px solid #fab387;">
            <h2>Beschikbare Doelwitten</h2>
            <div id="military-targets"></div>
        </div>
    `;

    const targetsDiv = document.getElementById('military-targets');
    let hasTargets = false;

    for (let tKey in game.diplomacy.discoveredTribes) {
        const tribe = game.diplomacy.discoveredTribes[tKey];
        
        // Alleen tonen als relatie laag is en nog niet veroverd
        if (tribe.relation < 30 && !tribe.isConquered) {
            hasTargets = true;
            targetsDiv.innerHTML += `
                <div style="display: flex; justify-content: space-between; align-items: center; padding: 10px; border-bottom: 1px solid #45475a; background: rgba(243, 139, 168, 0.05);">
                    <span>
                        <strong>${tribe.name}</strong> (Relatie: ${tribe.relation})<br>
                        <small>Verdediging: ~${tribe.defenseValue || 300}</small>
                    </span>
                    <button class="action-btn-small" style="background: #f38ba8; color: #11111b;" onclick="attackTribe('${tKey}')">
                        ⚔️ Start Aanval
                    </button>
                </div>
            `;
        }
        // Zoek in renderMilitary naar de loop van de tribes en voeg dit toe voor veroverde tribes:
        if (tribe.isConquered) {
            hasTargets = true; // Zodat de sectie niet leeg lijkt
            const color = tribe.rebellionLevel > 70 ? '#f38ba8' : '#f9e2af';
            
            targetsDiv.innerHTML += `
                <div style="padding: 10px; border-bottom: 1px solid #45475a; background: rgba(166, 227, 161, 0.05);">
                    <span><strong>${tribe.name}</strong> (Onderworpen)</span>
                    <div style="width: 100%; background: #313244; height: 5px; margin-top: 5px; border-radius: 2px;">
                        <div style="width: ${tribe.rebellionLevel}%; background: ${color}; height: 100%; border-radius: 2px; transition: width 0.5s;"></div>
                    </div>
                    <small style="color: ${color}">Onrust: ${Math.floor(tribe.rebellionLevel)}% (Onderdrukking actief)</small>
                </div>
            `;
        }
    }

    if (!hasTargets) {
        targetsDiv.innerHTML = `<p style="opacity: 0.6; font-style: italic;">Geen vijandige stammen gevonden. Provoceer een stam in Diplomatie om een aanval mogelijk te maken.</p>`;
    }
}
function renderPrestigeDashboard() {
    const upgradeBonus = (game.prestige.upgrades.efficient_scouting?.level || 0) * 5; // 5% per level
    const pointBonus = (game.prestige.points * 1).toFixed(0); // 1% per punt
    const scoutBonus = parseInt(pointBonus) + parseInt(upgradeBonus); // 1% per punt + upgrade bonus
    
    return `
        <div class="panel" style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; background: rgba(250, 179, 135, 0.1);">
            <div>
                <small>Productie Boost</small>
                <div style="color: #a6e3a1; font-weight: bold;">+${pointBonus}%</div>
            </div>
            <div>
                <small>Scouting Snelheid</small>
                <div style="color: #89b4fa; font-weight: bold;">+${scoutBonus}%</div>
            </div>
        </div>
    `;
}
function renderPrestige() {
    const container = document.getElementById('tab-prestige');
    const potential = calculatePrestigePoints();
    const boost = game.prestige.points * 1; // 1% per punt
    const breakdown = getPrestigeBreakdown();


    container.innerHTML += `
    <div class="panel" style="border: 1px dashed #fab387; margin-top: 10px;">
        <h4>Verwachte opbrengst: ${breakdown.total} punten</h4>
        ${breakdown.details}
    </div>
`;

    container.innerHTML = `
        <h1>Prestige (Ascension)</h1>
        <div class="panel" style="background: linear-gradient(45deg, #1e1e2e, #313244); border: 1px solid #fab387;">
            <h3>Huidige Prestige Punten: <span style="color:#fab387">${game.prestige.points}</span></h3>
            <p>Onbestede punten geven een <strong>+${boost}%</strong> bonus op resource productie en verkenning snelheid.</p>
            ${renderPrestigeDashboard()}
            <hr>
            <p>Als je nu reset, ontvang je: <strong>${potential}</strong> punten.</p>
            <button class="build-btn" onclick="performPrestige()" ${game.resources.population.amount >= 100 ? '' : 'disabled'}>
                Prestige (Min. 100 inwoners vereist)
            </button>
        </div>
        
        <h2>Prestige Upgrades</h2>
        <div id="prestige-upgrades-list"></div>
    `;

    // Teken de upgrades (vergelijkbaar met gebouwen maar met prestige punten)
    const list = document.getElementById('prestige-upgrades-list');
    for (let key in game.prestige.upgrades) {
        const upg = game.prestige.upgrades[key];
        list.innerHTML += `
            <div class="panel">
                <strong>${upg.name} (Lvl ${upg.level}/${upg.max})</strong><br>
                <small>${upg.desc}</small><br>
                <button class="action-btn-small" onclick="buyPrestigeUpgrade('${key}')" ${game.prestige.points >= upg.cost && upg.level < upg.max ? '' : 'disabled'}>
                    Koop (${upg.cost} Punten)
                </button>
            </div>
        </div>
        `;
    }
//remove glow-active class van prestige button als we op het prestige tabblad zijn
    const prestigeBtn = document.getElementById('nav-btn-prestige');
    prestigeBtn.classList.remove('glow-active');
}

function renderSettings() {
    const container = document.getElementById('tab-settings');
    container.innerHTML = `
        <h1>Instellingen</h1>
    <div class="panel" style="margin-top: 30px; border-top: 2px solid #f38ba8;">
    <h3>Systeembeheer</h3>
    <div style="display: flex; gap: 10px; flex-wrap: wrap;">
        <button class="action-btn-small" onclick="exportGame()">💾 Export Save</button>
        <button class="action-btn-small" onclick="importGame()">📂 Import Save</button>
        <button class="action-btn-small" style="background: #f38ba8; color: #11111b;" onclick="hardReset()">🧨 Harde Reset</button>
    
</div>
        `;
    }

function sendGift(tribeKey) {
    if (game.resources.gold.amount >= 100) {
        game.resources.gold.amount -= 100;
        game.diplomacy.discoveredTribes[tribeKey].relation += 5;
        if (game.diplomacy.discoveredTribes[tribeKey].relation > 100) {
            game.diplomacy.discoveredTribes[tribeKey].relation = 100;
        }
        updateUI();
    }
}
function deteriorateRelation(tribeKey, action) {
    const tribe = game.diplomacy.discoveredTribes[tribeKey];
    if (!tribe) return;

    if (action === 'insult') {
        tribe.relation = Math.max(0, tribe.relation - 10);
        alert(`Je hebt de gezant van ${tribe.name} beledigd. De relatie is nu ${tribe.relation}.`);
    } else if (action === 'provoke') {
        tribe.relation = Math.max(0, tribe.relation - 25);
        alert(`Je hebt je leger laten paraderen langs de grens van ${tribe.name}. Ze zijn woedend!`);
    }

    // Direct de UI updaten om de nieuwe knoppen in de Leger tab te activeren als relatie < 30
    updateUI();
}

// --- GAME LOOP ---
setInterval(() => {
    // Resources & Groei
for (let key in game.resources) {
    if (key === 'scouts') continue;  // Skip scouts
    addResource(key, game.resources[key].perSec);
}
    if (game.resources.food.amount <= 0) {
    game.resources.food.amount = 0;
    // Mensen vertrekken of sterven bij honger
    handleFamine();
    }
    
    if (game.expeditions.active && game.expeditions.timer > 0) {
    game.expeditions.timer--;
        if (game.expeditions.timer <= 0) {
            completeExpedition();
        }
    }
    checkUnlocks();
    renderExplore();
    updateUI();
}, 1000);

// Auto-save elke 30 seconden
setInterval(saveGame, 30000);

// Check elke 60 seconden voor een event
setInterval(triggerRandomEvent, 60000);

// Check elke 60 seconden voor rebellies
setInterval(checkRebellions, 60000);//60000

setInterval(() => {
    for (let key in game.diplomacy.discoveredTribes) {
        const tribe = game.diplomacy.discoveredTribes[key];
        
        // Alleen tribes met een zeer slechte relatie vallen aan
        if (tribe.relation < 20 && !tribe.isConquered) {
            // 5% kans elke minuut op een aanval
            if (Math.random() < 0.05) {
                triggerEnemyAttack(key);
            }
        }
    }
}, 60000); // Check elke minuut 60000

// --- INITIALISATIE ---
loadGame();
renderManualButtons();
updateUI();


function showTab(tabId) {
   // console.log("Wisselen naar tab:", tabId); // Zie je dit in de console?
    // 1. Vertel de game welke tab nu 'actief' is
    currentTab = tabId;

    // 2. Visueel de tabs wisselen (CSS)
    const contents = document.getElementsByClassName('tab-content');
    for (let content of contents) {
        content.classList.remove('active');
    }

    const activeTab = document.getElementById('tab-' + tabId);
    if (activeTab) {
        activeTab.classList.add('active');
        document.documentElement.scrollTop = 0; // Scroll naar boven bij tabwissel
    }

    // 3. De navigatieknoppen ook een 'active' uiterlijk geven
    const nav = document.getElementById('main-nav');
    if (nav) {
        const buttons = nav.querySelectorAll('button');
        for (let btn of buttons) {
            btn.classList.remove('active');
        }
    }
    
    // Activeer de juiste knop op basis van ID
    const activeBtn = document.getElementById('nav-btn-' + tabId);
    if (activeBtn) {
        activeBtn.classList.add('active');
    }
    
    // 4. Meteen tekenen zodat de speler geen lege pagina ziet
    updateUI();
}

const gameEvents = [
    {
        title: "Goede Oogst",
        text: "De weergoden zijn je gunstig gezind! De schuren puilen uit.",
        action: () => { addResource('food', 200); },
        chance: 0.4
    },
    {
        title: "Diefstal!",
        text: "Een sluwe dief heeft ingebroken in de opslag.",
        action: () => { addResource('gold', -50); },
        chance: 0.2
    },
    {
        title: "Vluchteling",
        text: "Een reiziger uit een ver land vraagt om onderdak.",
        action: () => { game.resources.population.amount += 1; },
        chance: 0.1
    }
]; 

function triggerRandomEvent() {
    // 10% kans elke minuut (of hoe vaak je de functie ook aanroept)
    if (Math.random() < 0.1) {
        const event = gameEvents[Math.floor(Math.random() * gameEvents.length)];
        event.action();
        alert(`EVENT: ${event.title}\n\n${event.text}`);
        updateUI();
    }
}
// EXPORT: Maakt een code van je savegame
async function exportGame() {
  const saveString = btoa(JSON.stringify(game));
  if (navigator.clipboard && navigator.clipboard.writeText) {
    try {
      await navigator.clipboard.writeText(saveString);
      alert("Savecode gekopieerd naar klembord!");
      return;
    } catch (e) {
      // fallback below
    }
  }

  // Fallback for older browsers / insecure contexts
  const ta = document.createElement('textarea');
  ta.value = saveString;
  ta.style.position = 'fixed';
  ta.style.left = '-9999px';
  document.body.appendChild(ta);
  ta.select();
  try {
    document.execCommand('copy'); // deprecated but useful as fallback
    alert("Savecode gekopieerd naar klembord (fallback)!");
  } catch (e) {
    prompt("Kopieer deze code handmatig:", saveString);
  }
  document.body.removeChild(ta);
}

// IMPORT: Laadt een code in
function importGame() {
    const code = prompt("Plak je savecode hier:");
    if (!code) return;
    try {
        const decoded = JSON.parse(atob(code));
        if (confirm("Weet je het zeker? Dit overschrijft je huidige voortgang!")) {
            game = decoded;
            saveGame();
            window.location.reload();
        }
    } catch (e) {
        alert("Ongeldige savecode!");
    }
}

// HARDE RESET: Alles weg, inclusief Prestige
function hardReset() {
    const confirm1 = confirm("⚠️ GEVAAR: Dit wist ALLES, ook je Prestige punten en upgrades. Weet je het zeker?");
    if (confirm1) {
        const confirm2 = confirm("Laatste kans: Weet je het écht heel zeker? Dit kan niet ongedaan worden gemaakt.");
        if (confirm2) {
            localStorage.removeItem('myGameSave');
            window.location.reload();
        }
    }
}
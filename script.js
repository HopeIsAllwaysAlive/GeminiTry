//const { act } = require("react");
    let currentTab = 'jobs'; // De standaard tab bij het opstarten
// --- DE DATA (HET BREIN VAN DE GAME) ---
let game = {

    resources: {
        wood: { name: "Hout", amount: 0, max: 100, perSec: 0, manualGain: 1, discovered: true },
        food: { name: "Voedsel", amount: 10, max: 100, perSec: 0, manualGain: 1, discovered: true },
        stone: { name: "Steen", amount: 0, max: 50, perSec: 0, manualGain: 1, discovered: false },
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
        //Soldier: { name: "Soldaat", count: 0, max: 0, effect: { gold: -1, food: -2 }, unlocked: false }
        banker: { name: "Bankier", count: 0, max: 0, effect: { gold: 1 }, unlocked: false }
    },
    buildings: {
        hut: { name: "Hut", count: 0, cost: { wood: 10 }, provides: { max_population: 2 }, desc: "Woonruimte voor je bevolking.", unlocked: true },
        lumber_camp: { name: "Houthakkerskamp", count: 0, cost: { wood: 25 }, provides: { job_woodcutter: 2 ,max_wood: 20 }, desc: "Werkplek voor houthakkers.", unlocked: true },
        farm_plot: { name: "Akker", count: 0, cost: { wood: 15, stone: 5 }, provides: { job_farmer: 2, max_food: 20 }, desc: "Grond om voedsel te verbouwen.", unlocked: false },
        warehouse: { name: "Magazijn", count: 0, cost: { wood: 75, stone: 25 }, provides: { max_wood: 200, max_food: 200, max_stone: 100 }, desc: "Vergroot opslagcapaciteit voor grondstoffen.", unlocked: false }, 
        quarry: { name: "Steenhouwerij", count: 0, cost: { wood: 50, food: 20 }, provides: { job_miner: 2 , max_stone: 10 }, desc: "Plek om steen te winnen.", unlocked: false },
        school: {  name: "School", count: 0, cost: { wood: 100, stone: 50 }, provides: { job_teacher: 1 , max_researchPoints: 100 }, desc: "Een plek waar leraren research punten genereren.",  unlocked: false },
        irrigation_system: {  name: "Irrigatie Systeem", count: 0, cost: { wood: 50, stone: 100, gold: 50 }, provides: { max_food: 500 }, desc: "Verbetert de watertoevoer naar de akkers.", unlocked: false },
        scout_post: { name: "Verkennerspost", count: 0, cost: { wood: 80, food: 40 }, provides: { job_scout_job: 3 }, desc: "Traint inwoners om de wereld te verkennen.", unlocked: false },
        //barracks: { name: "Kazerne", count: 0, cost: { wood: 200, stone: 300, gold: 100 }, provides: { job_soldier: 5 }, desc: "Huisvesting voor je leger. Elke kazerne biedt plek aan 5 soldaten.", unlocked: false }
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
        agriculture: { 
            name: "Landbouw", 
            desc: "Maakt Akkers mogelijk voor betere voedselproductie.", 
            cost: { wood: 40, food: 40 }, 
            unlocked: false, 
            requirement: () => game.resources.food.amount >= 30 
        },
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
            requirement: () => game.research.education.unlocked 
        },
        plow_invention: { 
            name: "De Ploeg", 
            desc: "Door een betere ploeg werken boeren 50% effectiever.", 
            cost: { wood: 100, stone: 100, gold: 50 }, 
            unlocked: false, 
            requirement: () => game.research.agriculture.unlocked // Pas beschikbaar na Landbouw
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
            cost: { researchPoints: 500, gold: 1001 },
            unlocked: false,
            requirement: () => game.research.hard_expeditions.unlocked
        },
        banking: {
            name: "Bankenstelsel",
            desc: "Maakt het mogelijk om een bank te bouwen voor extra goudopslag en rente.",
            cost: { researchPoints: 400, gold: 800 },
            unlocked: false,
            requirement: () => game.resources.gold.amount >= 100 //1000
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
        archer: { name: "Boogschutter", total: 0, assignedOff: 0, assignedDef: 0, off: 2, def: 12, type: 'def', cost: { gold: 40, wood: 30 }, desc: "Focus op verdediging.", maintenance: { food: 1 }, unlocked: true },
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
            researchPoints: { amount: 0, perSec: 0 },
            scouts: { amount: 0, perSec: 0 }
        },
    buildings: {
        hut: { name: "Hut", count: 0, cost: { wood: 10 }, provides: { max_population: 2 }, desc: "Woonruimte voor je bevolking.", unlocked: true },
        lumber_camp: { name: "Houthakkerskamp", count: 0, cost: { wood: 25 }, provides: { job_woodcutter: 2 ,max_wood: 20 }, desc: "Werkplek voor houthakkers.", unlocked: true },
        farm_plot: { name: "Akker", count: 0, cost: { wood: 15, stone: 5 }, provides: { job_farmer: 2, max_food: 20 }, desc: "Grond om voedsel te verbouwen.", unlocked: false },
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
            agriculture: { unlocked: false },
            education: { unlocked: false },
            warehouse: { unlocked: false },
            irrigation_tech: { unlocked: false },
            plow_invention: { unlocked: false },
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
                swordsman: { total: 0, assignedOff: 0, assignedDef: 0, off: 10, def: 2, cost: { gold: 50, food: 20 },unlocked: true },
                archer: { total: 0, assignedOff: 0, assignedDef: 0, off: 2, def: 12, cost: { gold: 40, wood: 30 }, unlocked: true },
                knight: { total: 0, assignedOff: 0, assignedDef: 0, off: 25, def: 15, cost: { gold: 150, food: 80 }, unlocked: false },
                commander: { total: 0, assignedOff: 0, assignedDef: 0, offMultiplier: 1.2, defMultiplier: 1.3, cost: { gold: 500 },  unlocked: false }
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
    if (res.amount > 0) res.discovered = true;
}

function getIdlePopulation() {
    let employed = 0;
    for (let key in game.jobs) employed += game.jobs[key].count;
    return Math.floor(game.resources.population.amount) - employed;
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

function recalcRates() {
    // 1. Reset alle rates naar 0
    for(let res in game.resources) game.resources[res].perSec = 0;

    // 2. Jobs met multipliers
    for(let key in game.jobs) {
        const job = game.jobs[key];
        
        // Bepaal de multiplier (standaard 1, dus 100%)
        let multiplier = 1;
        
        const prestigeBoost = 1 + (game.prestige.points * 0.01);
        multiplier *= prestigeBoost; // 1% sneller per prestige punt
        // Check specifieke researches voor upgrades
        if (key === 'farmer' && game.research.plow_invention.unlocked) {
            multiplier *= 1.5; // 50% sneller
        }
        if (key === 'farmer' && game.buildings.irrigation_system.count > 0) {
            multiplier *= game.buildings.irrigation_system.count; // per gebouw
        }
        if (key === 'woodcutter' && game.research.axe_tech.unlocked) {
            multiplier *= 2; // 2x sneller
        }
        // Je kunt hier later makkelijk meer toevoegen, bijv:
        // if (key === 'woodcutter' && game.research.steel_axes.unlocked) multiplier *= 1.2;

        for(let resType in job.effect) {
            game.resources[resType].perSec += (job.effect[resType] * job.count * multiplier);
        }
    }   
        // Voedselconsumptie voor elke idle inwoner        
        game.resources.food.perSec += ( -0.5 * getIdlePopulation() ); // Kleine voedselconsumptie per job

//(Optioneel) Voeg een melding toe in de UI als de hongersnood dreigt
//if (game.resources.food.amount < 10 && game.resources.food.perSec < 0) {
    // Hier zou je een rode waarschuwing in je HTML kunnen zetten
 //   console.warn("Hongersnood dreigt!");

    // Link de Job 'scout_job' aan de Resource 'scouts'
    // Hierdoor heb je altijd precies evenveel scouts als mensen in die baan
    game.resources.scouts.amount = game.jobs.scout_job.count;
    game.resources.scouts.max = game.jobs.scout_job.count; // Max is ook gelijk aan totaal

    // 3. Voeg passieve belasting toe (Goud)
    // Gebruik += zodat jobs die goud geven ook blijven tellen
    const taxIncome = (game.resources.population.amount * (1/60));
    game.resources.gold.perSec += taxIncome;

    // Ontdek goud zodra er inkomen is
    if (game.resources.gold.perSec > 0) {
        game.resources.gold.discovered = true;
    }
    // --- Handelsroutes opbrengsten ---
    for (let key in game.diplomacy.discoveredTribes) {
        const tribe = game.diplomacy.discoveredTribes[key];
        if (tribe.tradeRouteActive) {
            // Kosten: Elke handelsroute kost bijv. 0.5 goud per seconde
            game.resources.gold.perSec -= 0.5;

            // Opbrengst: Voeg de resources van de stam toe aan jouw inkomsten
            for (let resType in tribe.resources) {
                const gain = tribe.resources[resType];
                if (game.resources[resType]) {
                    game.resources[resType].perSec += gain;
                }
            }
        }
    }
    // Tribuut van overwonnen tribes
    for (let key in game.diplomacy.discoveredTribes) {
        const tribe = game.diplomacy.discoveredTribes[key];
        if (tribe.isConquered) {
            game.resources.gold.perSec += tribe.tributeAmount || 5;
        }
}
// --- Leger Onderhoud ---
for (let key in game.military.units) {
    const u = game.military.units[key];
    if (u.count > 0 && u.maintenance) {
        // Als je maintenance in de data hebt gezet, bijv: maintenance: { food: 2, gold: 1 }
        if (u.maintenance.food) game.resources.food.perSec -= (u.count * u.maintenance.food);
        if (u.maintenance.gold) game.resources.gold.perSec -= (u.count * u.maintenance.gold);
    }
}
    recalcMilitary();
    // Aan het einde van recalcRates():
const prestigeMultiplier = 1 + (game.prestige.points * 0.01);

for(let key in game.resources) {
    if(key !== 'population') { // Bevolking groeit meestal niet sneller door prestige
        game.resources[key].perSec *= prestigeMultiplier;
    }
}
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
    if (game.buildings.hut.count > 0) {
        game.jobs.farmer.unlocked = true;
    }
    if (game.research.toolmaking.unlocked) {
        game.buildings.quarry.unlocked = true;
        game.jobs.miner.unlocked = true;
    }
    if (game.research.agriculture.unlocked) {
        game.buildings.farm_plot.unlocked = true;
    }
    if (game.research.expeditions.unlocked) {
        game.buildings.scout_post.unlocked = true;
        game.jobs.scout_job.unlocked = true;
        game.resources.scouts.discovered = true;
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
        checkUnlocks();
        recalcRates();
        updateUI();
    }
}

function assignJob(jobKey, change) {
    const job = game.jobs[jobKey];
    if (change === 1 && getIdlePopulation() > 0 && job.count < job.max) job.count++;
    if (change === -1 && job.count > 0) job.count--;
    recalcRates();
    updateUI();
}

function startExpedition(typeKey) {
    const type = game.expeditions.types[typeKey];
    
    // 1. Maak een kopie van de kosten ZONDER de scouts om te kunnen betalen
    let resourceCosts = { ...type.cost };
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
             game.research.banking.isVisible = true; 
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
    
    // Check of we de kosten kunnen betalen
    if (canAfford(unit.cost)) {
        payCost(unit.cost);
        unit.total++;
        
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

    if (target === 'off' && unassigned > 0) {
        u.assignedOff++;
    } else if (target === 'def' && unassigned > 0) {
        u.assignedDef++;
    } else if (target === 'unassignOff' && u.assignedOff > 0) {
        u.assignedOff--;
    } else if (target === 'unassignDef' && u.assignedDef > 0) {
        u.assignedDef--;
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
    renderSidebar(); 


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
    }
}

function renderSidebar() {
    const miniStats = document.querySelector('.mini-stats');
    if (!miniStats) return;
    
    miniStats.innerHTML = '';
    for(let key in game.resources) {
        const r = game.resources[key];
        if(r.discovered) {
            // We gebruiken toFixed(1) zodat het goud niet flikkert met teveel decimalen
            miniStats.innerHTML += `<p>${r.name}: ${Math.floor(r.amount)} / ${r.max} <small>(${r.perSec.toFixed(1)}/s)</small></p>`;
        }
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
                <button class="build-btn" onclick="buyBuilding('${key}')" ${canAfford(cost) ? '' : 'disabled'}>
                    Bouw (${costTxt.join(', ')})
                </button>
            </div>`;
    }
}

function renderJobs() {
    const tbody = document.getElementById('jobs-tbody');
    tbody.innerHTML = '';

    for (let key in game.jobs) {
        const job = game.jobs[key];
        if (!job.unlocked) continue;

        const canHire = getIdlePopulation() > 0 && job.count < job.max;

        // 1. Bereken de multiplier voor deze specifieke job
        let multiplier = 1;
        if (key === 'farmer' && game.research.plow_invention.unlocked) {
            multiplier = 1.5;
        }
        if (key === 'farmer' && game.buildings.irrigation_system.count > 0) {
            multiplier *= game.buildings.irrigation_system.count; // 50% sneller
        }

        // 2. Bouw de tekst voor de effecten (bijv: "+3.0 Voedsel, -1.5 Hout")
        let effectTxtParts = [];
        for (let resType in job.effect) {
            const baseValue = job.effect[resType];
            const finalValue = (baseValue * multiplier).toFixed(1);
            const resName = game.resources[resType].name;
            
            effectTxtParts.push(`${finalValue > 0 ? '+' : ''}${finalValue} ${resName}`);
        }
        const effectDisplay = effectTxtParts.join(', ') + " /sec";

        // 3. Vul de tabelrij
        tbody.innerHTML += `<tr>
            <td>${job.name}</td>
            <td>${job.count}</td>
            <td>${job.max}</td>
            <td><small>${effectDisplay}</small></td>
            <td>
                <button class="action-btn-small" onclick="assignJob('${key}', -1)">-</button>
                <button class="action-btn-small" onclick="assignJob('${key}', 1)" ${canHire ? '' : 'disabled'}>+</button>
            </td>
        </tr>`;
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
                <button class="build-btn" onclick="buyResearch('${key}')" ${canAfford(r.cost) ? '' : 'disabled'}>
                    Onderzoek (${costTxt.join(', ')})
                </button>
            </div>`;
    }
}

function renderManualButtons() {
    const container = document.getElementById('manual-actions-container');
    container.innerHTML = '';
    for (let key in game.resources) {
        const res = game.resources[key];
        if (res.manualGain) {
            const btn = document.createElement('button');
            btn.className = 'action-btn';
            btn.innerText = `${res.name} +${res.manualGain}`;
            btn.onclick = () => addResource(key, res.manualGain);
            container.appendChild(btn);
        }
    }
}

function renderExplore() {
    const container = document.getElementById('tab-explore');
    container.innerHTML = '<h1>Verkennen</h1>';

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

        container.innerHTML += `
            <div class="panel" style="margin-bottom: 10px;">
                <div style="display: flex; justify-content: space-between;">
                    <strong>${u.name}</strong>
                    <span>Totaal: ${u.total} (Vrij: ${unassigned})</span>
                </div>
                <div style="display: flex; gap: 10px; margin-top: 10px;">
                    <div style="flex: 1; background: rgba(255,255,255,0.05); padding: 5px; border-radius: 4px;">
                        <small>Offensief: ${u.assignedOff}</small><br>
                        <button onclick="assignUnit('${key}', 'off')">+</button>
                        <button onclick="assignUnit('${key}', 'unassignOff')">-</button>
                    </div>
                    <div style="flex: 1; background: rgba(255,255,255,0.05); padding: 5px; border-radius: 4px;">
                        <small>Defensief: ${u.assignedDef}</small><br>
                        <button onclick="assignUnit('${key}', 'def')">+</button>
                        <button onclick="assignUnit('${key}', 'unassignDef')">-</button>
                    </div>
                    <div style="flex: 1;">
                        <button class="build-btn" onclick="trainUnit('${key}')">Train Nieuwe (${u.cost.gold}g)</button>
                    </div>
                </div>
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
    // Systeembeheer sectie
    container.innerHTML += `
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
    for (let key in game.resources) addResource(key, game.resources[key].perSec);
    
    // Bevolkingsgroei
    if (game.resources.population.amount < game.resources.population.max && game.resources.food.amount > 10) {
        game.resources.population.amount += 0.25; //0.02
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
    //console.log("Wisselen naar tab:", tabId); // Zie je dit in de console?
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
    }

    // 3. De navigatieknoppen ook een 'active' uiterlijk geven (optioneel, voor de looks)
    const buttons = document.getElementsByClassName('nav-btn');
    for (let btn of buttons) {
        btn.classList.remove('active');
        if (btn.getAttribute('onclick')?.includes(tabId)) {
            btn.classList.add('active');
        }
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
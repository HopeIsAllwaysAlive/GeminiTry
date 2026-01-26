//const { act } = require("react");

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
        woodcutter: { name: "Houthakker", count: 0, max: 0, effect: { wood: 1, food: -0.5 }, unlocked: true },
        farmer: { name: "Boer", count: 0, max: 0, effect: { food: 2 }, unlocked: true },
        miner: { name: "Mijnwerker", count: 0, max: 0, effect: { stone: 0.8, food: -1 }, unlocked: false },
        teacher: { name: "Leraar", count: 0, max: 0, effect: { researchPoints: 0.5, food: -1 },unlocked: false},
        scout_job: { name: "Verkenner", count: 0, max: 0, effect: { food: -2 }, unlocked: false }
    },
    
    buildings: {
        hut: { name: "Hut", count: 0, cost: { wood: 10 }, provides: { max_population: 2 }, desc: "Woonruimte voor je bevolking.", unlocked: true },
        lumber_camp: { name: "Houthakkerskamp", count: 0, cost: { wood: 25 }, provides: { job_woodcutter: 2 }, desc: "Werkplek voor houthakkers.", unlocked: true },
        farm_plot: { name: "Akker", count: 0, cost: { wood: 15, stone: 5 }, provides: { job_farmer: 2 }, desc: "Grond om voedsel te verbouwen.", unlocked: false },
        warehouse: { name: "Magazijn", count: 0, cost: { wood: 75, stone: 25 }, provides: { max_wood: 200, max_food: 200, max_stone: 100 }, desc: "Vergroot opslagcapaciteit voor grondstoffen.", unlocked: false }, 
        quarry: { name: "Steenhouwerij", count: 0, cost: { wood: 50, food: 20 }, provides: { job_miner: 2 }, desc: "Plek om steen te winnen.", unlocked: false },
        school: {  name: "School", count: 0, cost: { wood: 100, stone: 50 }, provides: { job_teacher: 1 }, desc: "Een plek waar leraren research punten genereren.",  unlocked: false },
        irrigation_system: {  name: "Irrigatie Systeem", count: 0, cost: { wood: 50, stone: 100, gold: 50 }, provides: { max_food: 500 }, desc: "Verbetert de watertoevoer naar de akkers.", unlocked: false },
        scout_post: { name: "Verkennerspost", count: 0, cost: { wood: 80, food: 40 }, provides: { job_scout_job: 3 }, desc: "Traint inwoners om de wereld te verkennen.", unlocked: false }
    
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
            requirement: () => game.buildings.hut.count >= 5 // Verschijnt bij 5 hutten
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
            duration: 30,
            cost: { food: 50, scouts: 1 },
            successRate: 0.9, // 90%
            requirements: () => true 
        },
        medium: {
            name: "Handelsroute Zoeken",
            duration: 120,
            cost: { food: 200, gold: 50, scouts: 2 },
            successRate: 0.75,
            requirements: () => game.resources.population.amount >= 10
        },
        hard: {
            name: "Diplomatieke Missie",
            duration: 300,
            cost: { food: 500, gold: 200, scouts: 5 },
            successRate: 0.6,
            requirements: () => game.research.education.unlocked
        },
        expert: {
            name: "Verre Expeditie",
            duration: 900,
            cost: { food: 1500, gold: 1000, scouts: 10 },
            successRate: 0.4,
            requirements: () => game.buildings.school.count >= 3
        }
    }
},
    lastSave: Date.now()
};

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
    // Reset naar basis
    game.resources.wood.max = 100;
    game.resources.food.max = 100;
    game.resources.stone.max = 50;
    game.resources.population.max = 5;
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
        
        // Check specifieke researches voor upgrades
        if (key === 'farmer' && game.research.plow_invention.unlocked) {
            multiplier *= 1.5; // 50% sneller
        }
        if (key === 'farmer' && game.buildings.irrigation_system.count > 0) {
            multiplier *= game.buildings.irrigation_system.count; // per gebouw
        }
        // Je kunt hier later makkelijk meer toevoegen, bijv:
        // if (key === 'woodcutter' && game.research.steel_axes.unlocked) multiplier *= 1.2;

        for(let resType in job.effect) {
            game.resources[resType].perSec += (job.effect[resType] * job.count * multiplier);
        }
    }

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
}

function checkUnlocks() {
    // Check Research Unlocks
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
    delete resourceCosts.scouts; 

    // 2. Check of we de grondstoffen hebben EN of we genoeg verkenners hebben
    const canPayResources = canAfford(resourceCosts);
    const hasEnoughScouts = game.resources.scouts.amount >= (type.cost.scouts || 0);

    if (canPayResources && hasEnoughScouts && !game.expeditions.active) {
        // 3. Betaal alleen de grondstoffen
        payCost(resourceCosts);
        
        game.expeditions.active = true;
        game.expeditions.currentType = typeKey;
        game.expeditions.timer = type.duration;
        
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
        msg += "Je hebt contact gelegd met een nieuw volk!";
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
    localStorage.setItem('civBuilderSave', JSON.stringify(game));
    console.log("Game Saved");
}

function loadGame() {
    const saved = localStorage.getItem('civBuilderSave');
    if (saved) {
        const loadedData = JSON.parse(saved);
        
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

        // En voor research
        for (let rKey in loadedData.research) {
            if (game.research[rKey]) {
                game.research[rKey].unlocked = loadedData.research[rKey].unlocked;
            }
        }

        // Voor de jobs
        for (let jKey in loadedData.jobs) {
            if (game.jobs[jKey]) {
                game.jobs[jKey].count = loadedData.jobs[jKey].count;
                game.jobs[jKey].unlocked = loadedData.jobs[jKey].unlocked;
            }
        }

        recalcLimits();
        recalcRates();
        checkUnlocks();
    }
}

// --- UI RENDERING ---

function updateUI() {
    // Resources in sidebar
    const miniStats = document.querySelector('.mini-stats');
    miniStats.innerHTML = '';
    for(let key in game.resources) {
        const r = game.resources[key];
        if(r.discovered) {
            miniStats.innerHTML += `<p>${r.name}: ${Math.floor(r.amount)} / ${r.max}</p>`;
        }
    }

    // Bevolking Tab
    document.getElementById('pop-idle').innerText = getIdlePopulation();
    document.getElementById('pop-total').innerText = Math.floor(game.resources.population.amount);
    renderJobs();

    // Gebouwen Tab
    renderBuildings();

    // Research Tab
    renderResearch();

    // Resource Overzicht Tab
    const resBody = document.getElementById('resource-tbody');
    resBody.innerHTML = '';
    for(let key in game.resources) {
        const r = game.resources[key];
        if(!r.discovered) continue;
        resBody.innerHTML += `<tr>
            <td>${r.name}</td>
            <td>${Math.floor(r.amount)}</td>
            <td>${r.max}</td>
            <td style="color: ${r.perSec >= 0 ? '#a6e3a1' : '#f38ba8'}">${r.perSec.toFixed(1)}/s</td>
            <td>${r.perSec !== 0 ? 'Productie loopt' : 'Stabiel'}</td>
        </tr>`;
    }
    // Verkennen Tab
    renderExplore();
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

// --- GAME LOOP ---
setInterval(() => {
    // Resources & Groei
    for (let key in game.resources) addResource(key, game.resources[key].perSec);
    
    // Bevolkingsgroei
    if (game.resources.population.amount < game.resources.population.max && game.resources.food.amount > 10) {
        game.resources.population.amount += 0.02; 
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

// --- INITIALISATIE ---
loadGame();
renderManualButtons();
updateUI();

// Tab navigatie
document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
        btn.classList.add('active');
        document.getElementById(`tab-${btn.dataset.tab}`).classList.add('active');
    });
});
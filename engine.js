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
    game.resources.brick.max = 50;
    game.resources.beam.max = 50;
    game.resources.population.max = 5;//100
    game.resources.gold.max = 1000;
    game.resources.researchPoints.max = 500;
    game.resources.intel.max = 100;
    for (let j in game.jobs) game.jobs[j].max = 0;

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

function recalcWood() {
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
    game.resources.wood.perSec += (game.jobs.woodworker.effect.wood * game.jobs.woodworker.count * prestigeBoost); // Houtbewerker consumeert hout, afhankelijk van het aantal houthakkers
}

function recalcBeam() {
    game.resources.beam.perSec = 0;
    const job = game.jobs.woodworker;
    let multiplier = 1;
    const prestigeBoost = 1 + (game.prestige.points * 0.01);
    game.resources.beam.perSec += (job.effect.beam * job.count * multiplier * prestigeBoost);
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
    food.perSec += (-0.5 * idlePop); // Kleine voedselconsumptie per idle pop
    for (let key in game.jobs) {
        const jobs = game.jobs[key];
        for (let resType in jobs.effect) {
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
    game.resources.stone.perSec += (game.jobs.stoneworker.effect.stone * game.jobs.stoneworker.count * prestigeBoost); // Steenhouwer consumeert steen, afhankelijk van het aantal mijnwerkers
}
function recalcBrick() {
    game.resources.brick.perSec = 0;
    const job = game.jobs.stoneworker;
    let multiplier = 1;
    const prestigeBoost = 1 + (game.prestige.points * 0.01);
    game.resources.brick.perSec += (job.effect.brick * job.count * multiplier * prestigeBoost);
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
    const taxIncome = (game.resources.population.amount * (1 / 60));
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

function recalcIntel() {
    const job = game.jobs.scout_job;
    const prestigeBoost = 1 + (game.prestige.points * 0.01);
    game.resources.intel.perSec = (job.effect.intel * job.count) * prestigeBoost;
    if (game.resources.intel.perSec > 0) game.resources.intel.discovered = true;
}

function recalcRates() {
    recalcLimits();
    recalcWood();
    recalcBeam();
    recalcFood();
    recalcStone();
    recalcBrick();
    recalcResearch();
    recalcGold();
    recalcMilitary();
    recalcIntel();
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
                    <span style="color: #a6e3a1">${bonus}x → +${(bonus * totalBase).toFixed(1)}</span>
                </div>
            `;
        });

        // Totaal research multiplier
        researchListHTML += `
            <div class="line" style="margin-top: 8px; padding-top: 8px; border-top: 1px solid #45475a;">
                <span><strong>Totaal na Research</strong></span>
                <span style="color: #a6e3a1"><strong>+${(researchMult * totalBase).toFixed(1)}</strong></span>
            </div>
        `;
        // //${researchMult.toFixed(2)}x → +
        researchListHTML += `</div>`;
    } else {
        researchListHTML += `
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
        game.resources.intel.discovered = true;
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
    if (game.research.wood_workshop.unlocked) {
        game.resources.beam.discovered = true;
        game.buildings.wood_workshop.unlocked = true;
        game.jobs.woodworker.unlocked = true;
    }
    if (game.research.stone_workshop.unlocked) {
        game.resources.brick.discovered = true;
        game.buildings.stone_workshop.unlocked = true;
        game.jobs.stoneworker.unlocked = true;
    }
    if (game.research.houses.unlocked) {
        game.buildings.house.unlocked = true;
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
    for (let key in game.buildings) totalBuildings += game.buildings[key].count;
    points += Math.floor(totalBuildings / 10);

    // 3. Vijanden: 5 punten per veroverde tribe
    for (let key in game.diplomacy.discoveredTribes) {
        if (game.diplomacy.discoveredTribes[key].isConquered) points += 5;
    }

    // 4. Research: 2 punten per voltooide research
    for (let key in game.research) {
        if (game.research[key].researched) points += 2;
    }

    return points;
}
function getPrestigeBreakdown() {
    const goldPoints = Math.floor(game.resources.gold.amount / 10000);

    let totalBuildings = 0;
    for (let key in game.buildings) totalBuildings += game.buildings[key].count;
    const buildingPoints = Math.floor(totalBuildings / 10);

    let conqueredCount = 0;
    for (let key in game.diplomacy.discoveredTribes) {
        if (game.diplomacy.discoveredTribes[key].isConquered) conqueredCount++;
    }
    const tribePoints = conqueredCount * 5;

    let researchCount = 0;
    for (let key in game.research) {
        if (game.research[key].researched) researchCount++;
    }
    const researchPoints = researchCount * 2;

    return {
        total: goldPoints + buildingPoints + tribePoints + researchPoints,
        details: `
<table style="width: 100%; border-collapse: collapse; font-size: 0.85em;">
    <thead>
        <tr style="border-bottom: 1px solid var(--accent); opacity: 0.6;">
            <th style="text-align: left; padding: 4px 6px;">Categorie</th>
            <th style="text-align: center; padding: 4px 6px;">Punten</th>
            <th style="text-align: left; padding: 4px 6px;">Voortgang</th>
        </tr>
    </thead>
    <tbody>
        <tr style="border-bottom: 1px solid rgba(255,255,255,0.05);">
            <td style="padding: 5px 6px;">💰 Goud</td>
            <td style="text-align: center; color: var(--green);">+${goldPoints}</td>
            <td style="opacity: 0.7;">Nog ${Math.floor(Math.max(0, 10000 - (game.resources.gold.amount % 10000)))} voor volgend</td>
        </tr>
        <tr style="border-bottom: 1px solid rgba(255,255,255,0.05);">
            <td style="padding: 5px 6px;">🏠 Gebouwen</td>
            <td style="text-align: center; color: var(--green);">+${buildingPoints}</td>
            <td style="opacity: 0.7;">Nog ${Math.max(0, 10 - (totalBuildings % 10))} gebouwen</td>
        </tr>
        <tr style="border-bottom: 1px solid rgba(255,255,255,0.05);">
            <td style="padding: 5px 6px;">⚔️ Veroveringen</td>
            <td style="text-align: center; color: var(--green);">+${tribePoints}</td>
            <td style="opacity: 0.7;">${conqueredCount} stammen veroverd</td>
        </tr>
        <tr>
            <td style="padding: 5px 6px;">🧪 Research</td>
            <td style="text-align: center; color: var(--green);">+${researchPoints}</td>
            <td style="opacity: 0.7;">Nog ${Math.max(0, 10 - (researchCount % 10))} onderzoeken</td>
        </tr>
    </tbody>
</table>
`
    };
}

// --- ACTIONS ---
function buyBuilding(key) {
    const b = game.buildings[key];

    let amountToBuy = 0;
    let totalCost = {};
    let limit = buyAmount === 'max' ? Infinity : buyAmount;

    // Simuleer aankopen en bereken totale kosten
    for (let i = 0; i < limit; i++) {
        b.count += 1; // Tijdelijk verhogen zodat getCost de juiste prijs berekent
        const cost = getCost(b);
        b.count -= 1; // Terugzetten

        // Check of we deze aankoop kunnen betalen bovenop wat al gereserveerd is
        let combinedCost = {};
        for (let res in cost) {
            combinedCost[res] = (totalCost[res] || 0) + cost[res];
        }

        if (canAfford(combinedCost)) {
            totalCost = combinedCost;
            amountToBuy++;
        } else {
            break;
        }
    }

    if (amountToBuy > 0) {
        payCost(totalCost);
        b.count += amountToBuy;
        recalcLimits();
        recalcRates();
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

    // 1. Maak een kopie van de kosten (bevat nu Intel in plaats van scouts)
    let resourceCosts = { ...type.cost };

    // 2. Bereken de reductie
    const pointBonus = game.prestige.points * 0.01;
    const upgradeBonus = (game.prestige.upgrades.efficient_scouting?.level || 0) * 0.05;
    const totalReduction = pointBonus + upgradeBonus;
    const finalTime = type.duration * (1 - Math.min(0.9, totalReduction)); // Maximaal 90% sneller

    // 3. Check of we de grondstoffen hebben
    const canPayResources = canAfford(resourceCosts);

    if (canPayResources && !game.expeditions.active && !game.expeditions.activeEvent) {
        // 4. Betaal de kosten (food/gold/intel)
        payCost(resourceCosts);

        // 5. Start de expeditie
        game.expeditions.active = true;
        game.expeditions.currentType = typeKey;
        game.expeditions.timer = finalTime;
        game.expeditions.activeEvent = null;

        updateUI();
    }
}

function completeExpedition() {
    game.expeditions.active = false;
    triggerExpeditionEvent(game.expeditions.currentType);
    updateUI();
}

function triggerExpeditionEvent(typeKey) {
    const type = game.expeditions.types[typeKey];
    let r = Math.random();

    if (r < 0.2) {
        // Random Bad Event
        game.expeditions.activeEvent = {
            title: "Overvallen!",
            text: "Lokale bandieten rellen rondom je verkenners op de terugweg.",
            choices: [
                {
                    text: "Koop ze af (-50 Goud)", action: () => {
                        if (game.resources.gold.amount >= 50) {
                            game.resources.gold.amount -= 50;
                            giveReward(typeKey, 1);
                            clearEvent();
                        } else {
                            alert('Niet genoeg goud!');
                        }
                    }
                },
                {
                    text: "Vlucht! (50% kans op behoud buit)", action: () => {
                        if (Math.random() > 0.5) {
                            alert('Je verkenners zijn ontsnapt mét de buit!');
                            giveReward(typeKey, 1);
                        } else {
                            alert('Ze zijn gevlucht, maar moesten hun spullen achterlaten...');
                        }
                        clearEvent();
                    }
                }
            ]
        };
    } else if (r < 0.4) {
        // Random Good Event
        game.expeditions.activeEvent = {
            title: "Verborgen Schat",
            text: "Onderweg stuiten ze op een overwoekerde ruïne.",
            choices: [
                { text: "Doorzoek de Boel! (+50% opbrengst)", action: () => { giveReward(typeKey, 1.5); clearEvent(); } },
                { text: "Veilig Negeren", action: () => { giveReward(typeKey, 1); clearEvent(); } }
            ]
        };
    } else {
        // Standaard Voltooiing
        game.expeditions.activeEvent = {
            title: "Missie Voltooid",
            text: `De verkenners zijn terug van hun missie: ${type.name}.`,
            choices: [
                { text: "Ontvang Rapport", action: () => { giveReward(typeKey, 1); clearEvent(); } }
            ]
        };
    }
}

function clearEvent() {
    game.expeditions.activeEvent = null;
    game.expeditions.currentType = null;
    updateUI();
}

function giveReward(type, multiplier = 1) {
    let msg = "Resultaat: ";

    if (type === 'easy') {
        let wood = Math.floor((Math.floor(Math.random() * 50) + 20) * multiplier);
        addResource('wood', wood);
        msg += `Je vond een bos en verzamelde ${wood} hout.`;
    }
    else if (type === 'medium') {
        let gold = Math.floor((Math.floor(Math.random() * 100) + 50) * multiplier);
        let newPeople = Math.random() < 0.3 ? 1 : 0; // 30% kans op 1 persoon
        addResource('gold', gold);
        if (newPeople) game.resources.population.amount += newPeople;
        msg += `Je vond een handelsroute! +${gold} goud ${newPeople ? 'en een nieuwe inwoner sloot zich aan.' : ''}`;
    }
    else if (type === 'hard') {
        discoverTribe();
        // msg afgehandeld in discoverTribe function
    }
    else if (type === 'expert') {
        if (!game.research.banking.unlocked && Math.random() < 0.5) {
            game.research.banking.unlocked = true;
            msg += "Je verkenners leerden over een 'Bankenstelsel' van een verre beschaving!";
        } else {
            let gold = 2000 * multiplier;
            addResource('gold', gold);
            msg += `Je vond een verlaten schatkamer! +${gold} goud.`;
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
/*
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
}*/

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

        alert(`⚔️ OVERWINNING! \n\nJe hebt ${tribe.name} verslagen!\n\nBuit:\n- ${loot.wood} Hout\n- ${loot.stone} Steen\n- ${loot.gold} Goud\n\nZe betalen vanaf nu ook elk uur tribuut.`); tribe.isConquered = true;
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
        game.resources.wood.amount += bonus; game.resources.wood.max += bonus;
        game.resources.stone.amount += bonus; game.resources.stone.max += bonus;
        game.resources.food.amount += bonus; game.resources.food.max += bonus;
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
    renderBuildings(); // Herteken de gebouwen om de knoppen te updaten
    // Optioneel: voeg een 'active' class toe aan de knoppen in de UI
}


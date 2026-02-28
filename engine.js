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

    // Specifieke upgrades / tech
    if (game.research.axe_tech.unlocked) multiplier += 1; // +100%
    if (game.research.wood_tech.unlocked) multiplier += 0.5; // +50%

    // Basis prestige multiplier
    const prestigeBoost = 1 + (game.prestige.points * 0.01);

    // Bereken basis opbrengst
    let baseWood = (job.effect.wood * job.count * multiplier * prestigeBoost);

    game.resources.wood.perSec += baseWood;

    // Consumptie door houtbewerker
    const woodworkers = game.jobs.woodworker.effect.wood * game.jobs.woodworker.count * prestigeBoost;
    game.resources.wood.perSec += woodworkers;
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

    let baseFood = (job.effect.food * job.count * multiplier * prestigeBoost);

    food.perSec += baseFood;

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

    let baseStone = (job.effect.stone * job.count * multiplier * prestigeBoost);

    game.resources.stone.perSec += baseStone;
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

    let baseGold = (job.effect.gold * job.count * multiplier * prestigeBoost);

    // Passieve belasting
    const taxIncome = (game.resources.population.amount * (1 / 60));
    baseGold += taxIncome * prestigeBoost; // Belastingopbrengst, beïnvloed door prestige

    game.resources.gold.perSec += baseGold;

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

    // Bereken diplomatieke multiplier
    let tradeBonusMult = 1;
    if (game.research.merchant_guild && game.research.merchant_guild.unlocked) tradeBonusMult += 0.20;
    if (game.prestige.upgrades.diplomatic_charm && game.prestige.upgrades.diplomatic_charm.level > 0) {
        tradeBonusMult += (game.prestige.upgrades.diplomatic_charm.level * 0.10);
    }

    // Bereken alle diplomatieke effecten op resources
    for (let key in game.diplomacy.discoveredTribes) {
        const tribe = game.diplomacy.discoveredTribes[key];

        // Handelsroute Actief
        if (tribe.tradeRouteActive) {
            if (tribe.tradeCost) {
                for (let cRes in tribe.tradeCost) {
                    if (game.resources[cRes]) game.resources[cRes].perSec -= tribe.tradeCost[cRes];
                }
            }
            if (tribe.tradeYield) { // let op: we gebruiken nu tradeYield i.p.v resources
                for (let yRes in tribe.tradeYield) {
                    if (game.resources[yRes]) {
                        game.resources[yRes].perSec += (tribe.tradeYield[yRes] * tradeBonusMult * prestigeMultiplier);
                    }
                }
            }
        }

        // Alliantie Actief (Gebruikt tradeYield / focus om te bepalen wat ze geven)
        if (tribe.isAllied && tribe.tradeYield) {
            for (let yRes in tribe.tradeYield) {
                if (game.resources[yRes]) {
                    game.resources[yRes].perSec += (2 * prestigeMultiplier); // platte +2 op hun focus
                }
            }
        }
    }
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
        let deathRate = 1;
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
    // Tijdperk 1: Ontgrendel steenhouwerij als er genoeg hout is, 
    // want de research tab is verborgen in dit tijdperk!
    if ((!game.era || game.era === 1) && game.resources.wood.amount >= 30) {
        game.buildings.quarry.unlocked = true;
        game.jobs.miner.unlocked = true;
        game.resources.stone.discovered = true;
    }

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
        game.buildings.barracks.unlocked = true;
        game.jobs.soldier.unlocked = true;
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
            <div style="display: flex; flex-direction: column; gap: 12px; font-size: 0.9em;">
                
                <!-- Goud -->
                <div>
                    <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
                        <span>💰 Goud <strong style="color: var(--green);">+${goldPoints}</strong></span>
                        <small style="opacity: 0.7;">Nog ${10000 - (Math.floor(game.resources.gold.amount) % 10000)} voor volgend punt</small>
                    </div>
                    <div style="width: 100%; background: var(--surface1); border-radius: 4px; height: 8px; overflow: hidden;">
                        <div style="width: ${(game.resources.gold.amount % 10000) / 100}%; background: var(--yellow); height: 100%;"></div>
                    </div>
                </div>

                <!-- Gebouwen -->
                <div>
                    <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
                        <span>🏠 Gebouwen <strong style="color: var(--green);">+${buildingPoints}</strong></span>
                        <small style="opacity: 0.7;">Nog ${10 - (totalBuildings % 10)} voor volgend punt</small>
                    </div>
                    <div style="width: 100%; background: var(--surface1); border-radius: 4px; height: 8px; overflow: hidden;">
                        <div style="width: ${(totalBuildings % 10) / 10 * 100}%; background: var(--blue); height: 100%;"></div>
                    </div>
                </div>

                <!-- Veroveringen -->
                <div style="display: flex; justify-content: space-between; align-items: center; padding: 6px; background: rgba(255,255,255,0.05); border-radius: 6px;">
                    <span>⚔️ Stammen Veroverd (${conqueredCount})</span>
                    <strong style="color: var(--green);">+${tribePoints}</strong>
                </div>

                <!-- Onderzoek -->
                <div style="display: flex; justify-content: space-between; align-items: center; padding: 6px; background: rgba(255,255,255,0.05); border-radius: 6px;">
                    <span>🧪 Onderzoeken Voltooid (${researchCount})</span>
                    <strong style="color: var(--green);">+${researchPoints}</strong>
                </div>

            </div>
        `
    };
}

// --- ACTIONS ---
function buyBuilding(key) {
    const b = game.buildings[key];

    let amountToBuy = 0;
    let totalCost = {};
    let limit = buyAmount === 'max' ? Infinity : buyAmount;

    let originalCount = b.count;

    // Simuleer aankopen en bereken totale kosten
    for (let i = 0; i < limit; i++) {
        const costOfNext = getCost(b);

        let combinedCost = {};
        for (let res in costOfNext) {
            combinedCost[res] = (totalCost[res] || 0) + costOfNext[res];
        }

        if (canAfford(combinedCost)) {
            totalCost = combinedCost;
            amountToBuy++;
            b.count++; // Tijdelijk verhogen voor de volgende kost-berekening!
        } else {
            break;
        }
    }

    // Reset de tijdelijke verhoging
    b.count = originalCount;

    if (amountToBuy > 0) {
        payCost(totalCost);
        b.count += amountToBuy; // Nu tellen we ze definitief op
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

        // EXTRA CONTROLE: Als de baan Soldaat is, mogen we niet onder het aantal getrainde eenheden zakken
        if (jobKey === 'soldier') {
            const totalTrained = Object.values(game.military.units).reduce((sum, u) => sum + u.total, 0);
            const maxRemovable = job.count - totalTrained;
            amountToChange = Math.min(amountToChange, maxRemovable);
            if (amountToChange <= 0 && maxRemovable <= 0) {
                alert("Je kunt deze Basis Soldaten niet ontslaan, omdat ze in dienst zijn als getrainde eenheid (Zwaardvechter, etc). Ontsla eerst je eenheden in het Leger tabblad.");
                return;
            }
        }

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
        msg += `Je vond een handelsroute! + ${gold} goud ${newPeople ? 'en een nieuwe inwoner sloot zich aan.' : ''} `;
    }
    else if (type === 'hard') {
        discoverTribe();
        return; // De melding wordt al afgehandeld in discoverTribe, dus stop hier
    }
    else if (type === 'expert') {
        if (!game.research.banking.unlocked && Math.random() < 0.5) {
            game.research.banking.unlocked = true;
            msg += "Je verkenners leerden over een 'Bankenstelsel' van een verre beschaving!";
        } else {
            let gold = 2000 * multiplier;
            addResource('gold', gold);
            msg += `Je vond een verlaten schatkamer! + ${gold} goud.`;
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

function demandTribute(tribeKey) {
    const tribe = game.diplomacy.discoveredTribes[tribeKey];

    // Breek eventuele allianties direct af bij vijandige acties
    if (tribe.isAllied) {
        tribe.isAllied = false;
        alert(`💢 Alliantie verbroken! Je hebt ${tribe.name} verraden door tribuut te eisen.`);
    }

    // Verlaag relatie flink
    tribe.relation -= 30;
    if (tribe.relation < 0) tribe.relation = 0;

    // Breek handel af als ze je nu haten
    if (tribe.relation < 60 && tribe.tradeRouteActive) {
        tribe.tradeRouteActive = false;
        alert(`${tribe.name} weigert nog langer met je te handelen!`);
    }

    // Geef buit op basis van hun specialiteit (dit staat in tradeYield)
    let lootMsg = `Je hebt succesvol ${tribe.name} afgeperst voor tribuut! Buit: \n`;
    for (let resType in tribe.tradeYield) {
        const amount = Math.floor(500 * tribe.tradeYield[resType]);
        addResource(resType, amount);
        lootMsg += `- ${amount} ${game.resources[resType].name} \n`;
    }

    updateUI();
    recalcRates();
    alert(lootMsg);
}

function formAlliance(tribeKey) {
    const tribe = game.diplomacy.discoveredTribes[tribeKey];

    if (tribe.relation < 90) {
        alert("Je relatie met dit volk is niet goed genoeg voor een alliantie (Minstens 90 nodig).");
        return;
    }

    const cost = { gold: 2000, food: 2000 };
    if (!canAfford(cost)) {
        alert("Je hebt niet genoeg middelen (2000 Goud, 2000 Voedsel) om dit verdrag te tekenen.");
        return;
    }

    payCost(cost);
    tribe.isAllied = true;

    recalcRates();
    updateUI();
    alert(`Alliantie gevormd met ${tribe.name} !Je ontvangt nu een permanente stroom van hun specialiteiten.`);
}

/*
function attackTribe(tribeKey) {
    const tribe = game.diplomacy.discoveredTribes[tribeKey];
    // Stel: een tribe heeft ook een defensePower (bijv. 500)
    const tribeDefense = tribe.defenseValue || 500; 

    if (game.military.attackPower > tribeDefense) {
        alert(`Overwinning! Je hebt ${ tribe.name } verslagen.Ze betalen je nu 5 goud per seconde tribuut.`);
        tribe.isConquered = true;
        tribe.relation = 0; // Ze haten je, maar ze betalen
    } else {
        alert("Je aanval is mislukt! De tribe slaat onmiddellijk terug.");
        triggerCounterAttack(tribeKey);
    }
    updateUI();
}*/

function triggerCounterAttack(tribeKey) {
    const tribe = game.diplomacy.discoveredTribes[tribeKey];

    // De tegenaanval is gebaseerd op hun defense, of een vaste waarde
    const tribeAttack = tribe.defenseValue ? Math.floor(tribe.defenseValue * 1.5) : 400;

    let damageToTake = tribeAttack;
    let unitsLostStr = "";

    // Sorteer eenheden op defensieve efficiëntie of loop er doorheen.
    for (let key in game.military.units) {
        if (damageToTake <= 0) break;

        const u = game.military.units[key];
        if (u.assignedDef > 0) {
            const unitPower = u.def || 1;
            const maxKills = Math.ceil(damageToTake / unitPower);
            const actualKills = Math.min(u.assignedDef, maxKills);

            if (actualKills > 0) {
                u.assignedDef -= actualKills;
                u.total -= actualKills;

                game.jobs.soldier.count = Math.max(0, game.jobs.soldier.count - actualKills);
                game.resources.population.amount = Math.max(0, game.resources.population.amount - actualKills);

                damageToTake -= (actualKills * unitPower);
                unitsLostStr += `- ${actualKills} ${u.name}\n`;
            }
        }
    }

    if (tribeAttack > game.military.defensePower) {
        const loss = Math.floor(game.resources.gold.amount * 0.1); // Verlies 10% goud bij een tegenaanval
        game.resources.gold.amount = Math.max(0, game.resources.gold.amount - loss);

        let msg = `❌ TEGENAANVAL DOORBROKEN!\n\nDe vijand viel direct terug aan met Kracht ${tribeAttack}, maar jouw verdediging was slechts Kracht ${Math.floor(game.military.defensePower)}.\n\nZe hebben als straf ${loss} goud geplunderd.`;
        if (unitsLostStr !== "") {
            msg += `\n\n💀 Verliezen tijdens de verdediging:\n${unitsLostStr}`;
        }
        alert(msg);
    } else {
        let msg = `🛡️ TEGENAANVAL AFGESLAGEN!\n\nJe verdedigingsleger (Kracht ${Math.floor(game.military.defensePower)}) hield gelukkig stand tegen de furieuze tegenaanval (Kracht ${tribeAttack}).`;
        if (unitsLostStr !== "") {
            msg += `\n\n💀 Verliezen tijdens de strijd:\n${unitsLostStr}`;
        }
        alert(msg);
    }
    recalcMilitary();
    updateUI();
}
function attackTribe(tribeKey) {
    const tribe = game.diplomacy.discoveredTribes[tribeKey];

    // Breek eventuele allianties direct af bij vijandige acties
    if (tribe.isAllied) {
        tribe.isAllied = false;
        alert(`💢 Alliantie verbroken! Je bent de oorlog verklaard aan je voormalige bondgenoot ${tribe.name}.`);
    }

    // Tribes hebben een random defense tussen 100 en 1000 voor nu
    const tribeDefense = tribe.defenseValue || 300;

    // Bereken verliezen: de vijand deelt "tribeDefense" aan schade uit aan jouw aanvalsleger
    let damageToTake = tribeDefense;
    let unitsLostStr = "";

    // Sorteer eenheden zodat we eerst de zwakste (goedkoopste) eenheden verliezen, 
    // of itereren gewoon over de object keys. Voor nu simpele iteratie:
    for (let key in game.military.units) {
        if (damageToTake <= 0) break;

        const u = game.military.units[key];
        if (u.assignedOff > 0) {
            // Hoeveel kracht heeft 1 unit van dit type?
            const unitPower = u.off || 1;

            // Hoeveel units van dit type sterven er maximaal door deze damage?
            // (Bijv. 300 damage / 10 power per zwaardvechter = 30 doden)
            const maxKills = Math.ceil(damageToTake / unitPower);
            const actualKills = Math.min(u.assignedOff, maxKills);

            if (actualKills > 0) {
                u.assignedOff -= actualKills;
                u.total -= actualKills;

                game.jobs.soldier.count = Math.max(0, game.jobs.soldier.count - actualKills);
                game.resources.population.amount = Math.max(0, game.resources.population.amount - actualKills);

                damageToTake -= (actualKills * unitPower);
                unitsLostStr += `- ${actualKills} ${u.name}\n`;
            }
        }
    }

    if (game.military.attackPower > tribeDefense) {
        const loot = {
            wood: Math.floor(Math.random() * 1000) + 500,
            stone: Math.floor(Math.random() * 1000) + 500,
            gold: Math.floor(Math.random() * 500) + 200
        };

        game.resources.wood.amount += loot.wood;
        game.resources.stone.amount += loot.stone;
        game.resources.gold.amount += loot.gold;

        let winMsg = `⚔️ OVERWINNING!\n\nJe hebt de verdediging van ${tribe.name} doorbroken!\n\nBuit:\n- ${loot.wood} Hout\n- ${loot.stone} Steen\n- ${loot.gold} Goud\n\nZe betalen vanaf nu ook elk uur tribuut.`;
        if (unitsLostStr !== "") {
            winMsg += `\n\n💀 Verliezen tijdens de strijd:\n${unitsLostStr}`;
        }

        alert(winMsg);

        tribe.isConquered = true;
        tribe.tributeAmount = 10; // 10 goud per seconde
        tribe.rebellionLevel = 0; // Begint op 0%
    } else {
        let loseMsg = `❌ NEDERLAAG!\n\nJe aanvalsleger (Kracht: ${Math.floor(game.military.attackPower)}) was niet sterk genoeg om door de verdediging van ${tribe.name} (Kracht: ${tribeDefense}) heen te breken.\n\nJe trekt je troepen terug.`;
        if (unitsLostStr !== "") {
            loseMsg += `\n\n💀 Zware verliezen geleden tijdens aanval:\n${unitsLostStr}`;
        }

        alert(loseMsg);

        // Nu slaan ze meteen terug op je stad!
        triggerCounterAttack(tribeKey);
    }
    recalcMilitary();
    recalcRates();
    updateUI();
}

function triggerEnemyAttack(tribeKey) {
    const tribe = game.diplomacy.discoveredTribes[tribeKey];
    // De aanvalskracht van de tribe (bijv. tussen 100 en 500)
    const enemyPower = Math.floor(Math.random() * 400) + 100;

    let damageToTake = enemyPower;
    let unitsLostStr = "";

    // Sorteer eenheden op defensieve efficiëntie of loop er doorheen.
    for (let key in game.military.units) {
        if (damageToTake <= 0) break;

        const u = game.military.units[key];
        if (u.assignedDef > 0) {
            const unitPower = u.def || 1;
            const maxKills = Math.ceil(damageToTake / unitPower);
            const actualKills = Math.min(u.assignedDef, maxKills);

            if (actualKills > 0) {
                u.assignedDef -= actualKills;
                u.total -= actualKills;

                game.jobs.soldier.count = Math.max(0, game.jobs.soldier.count - actualKills);
                game.resources.population.amount = Math.max(0, game.resources.population.amount - actualKills);

                damageToTake -= (actualKills * unitPower);
                unitsLostStr += `- ${actualKills} ${u.name}\n`;
            }
        }
    }

    if (game.military.defensePower >= enemyPower) {
        let msg = `🛡️ AANVAL AFGESLAGEN!\n\nJouw verdedigingsleger (Kracht ${Math.floor(game.military.defensePower)}) hield stand tegen de invasie van ${tribe.name} (Kracht ${enemyPower}).`;
        if (unitsLostStr !== "") {
            msg += `\n\n💀 Verliezen tijdens de strijd:\n${unitsLostStr}`;
        }
        alert(msg);
    } else {
        const goldLost = Math.floor(game.resources.gold.amount * 0.2);
        game.resources.gold.amount -= goldLost;

        // Extra straf is dat het verdedigingsleger verslagen is en goud is gestolen
        let msg = `❌ VERDEDIGING DOORBROKEN!\n\nJe verdediging (Kracht ${Math.floor(game.military.defensePower)}) was niet bestand tegen de aanval van ${tribe.name} (Kracht ${enemyPower}).\n\nZe hebben ${goldLost} goud geplunderd.`;
        if (unitsLostStr !== "") {
            msg += `\n\n💀 Zware verliezen geleden:\n${unitsLostStr}`;
        }
        alert(msg);
    }
    recalcMilitary();
    updateUI();
}

// Functie om een unit te trainen
function trainUnit(unitKey) {
    const unit = game.military.units[unitKey];

    // Bereken hoeveel VRIJE basis soldaten er zijn (Basis Soldaten - Getrainde Eenheden)
    const totalTrained = Object.values(game.military.units).reduce((sum, u) => sum + u.total, 0);
    const baseSoldiers = game.jobs.soldier.count;
    const availableSoldiers = baseSoldiers - totalTrained;

    if (availableSoldiers < 1) {
        alert("Geen ongetrainde Basis Soldaten beschikbaar! Wijs meer inwoners toe aan de Kazerne.");
        return;
    }

    let maxAffordable = 0;
    // Bepaal de hoeveelheid die we willen trainen
    let requestedAmount = 1;
    if (buyAmount === 10) requestedAmount = 10;
    else if (buyAmount === 100) requestedAmount = 100;
    else if (buyAmount === 'max') requestedAmount = availableSoldiers;

    // Beperk tot beschikbare soldaten
    requestedAmount = Math.min(requestedAmount, availableSoldiers);

    // Bereken hoeveel we maximaal kunnen betalen uitgaande van beschikbare middelen
    let maxCanAffordUnits = requestedAmount;
    for (let c in unit.cost) {
        const canAffordC = Math.floor(game.resources[c].amount / unit.cost[c]);
        maxCanAffordUnits = Math.min(maxCanAffordUnits, canAffordC);
    }
    maxAffordable = maxCanAffordUnits;

    if (maxAffordable > 0) {
        const totalCost = {};
        for (let c in unit.cost) totalCost[c] = unit.cost[c] * maxAffordable;
        payCost(totalCost);
        unit.total += maxAffordable;

        recalcMilitary();
        recalcRates();
        updateUI();
    } else {
        alert("Niet genoeg grondstoffen om deze eenheid te trainen.");
    }
}

function untrainUnit(unitKey) {
    const u = game.military.units[unitKey];
    const unassigned = u.total - u.assignedOff - u.assignedDef;

    let moveAmount = 1;
    if (buyAmount === 10) moveAmount = 10;
    else if (buyAmount === 100) moveAmount = 100;
    else if (buyAmount === 'max') moveAmount = unassigned;

    moveAmount = Math.min(moveAmount, unassigned);

    if (moveAmount > 0) {
        u.total -= moveAmount;
        // Refunds geen resources, alleen de basis soldaat komt terug in de pool (gebeurt vanzelf doordat u.total zakt)
        recalcMilitary();
        recalcRates();
        updateUI();
    } else {
        alert("Geen vrije eenheden beschikbaar om te ontslaan! (Weghalen uit Aanval/Verdediging eerst).");
    }
}

function assignUnit(unitKey, target) {
    const u = game.military.units[unitKey];
    const unassigned = u.total - u.assignedOff - u.assignedDef;

    let moveAmount = 1;
    if (buyAmount === 10) moveAmount = 10;
    else if (buyAmount === 100) moveAmount = 100;
    else if (buyAmount === 'max') moveAmount = u.total; // Wordt later gecapt

    if (target === 'off') {
        const availableToAdd = unassigned + u.assignedDef; // Alle vrije units + units in def
        moveAmount = Math.min(moveAmount, availableToAdd);

        if (moveAmount > 0) {
            let fromUnassigned = Math.min(moveAmount, unassigned);
            let fromDef = moveAmount - fromUnassigned;
            u.assignedOff += moveAmount;
            u.assignedDef -= fromDef;
        }
    } else if (target === 'def') {
        const availableToAdd = unassigned + u.assignedOff;
        moveAmount = Math.min(moveAmount, availableToAdd);

        if (moveAmount > 0) {
            let fromUnassigned = Math.min(moveAmount, unassigned);
            let fromOff = moveAmount - fromUnassigned;
            u.assignedDef += moveAmount;
            u.assignedOff -= fromOff;
        }
    } else if (target === 'unassign_off') {
        let fromOff = Math.min(moveAmount, u.assignedOff);
        u.assignedOff -= fromOff;
    } else if (target === 'unassign_def') {
        let fromDef = Math.min(moveAmount, u.assignedDef);
        u.assignedDef -= fromDef;
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
    const currentEra = game.era || 1;
    let newEra = currentEra;
    let earnedPoints = 0;

    // 1. Bereken de punten en het nieuwe tijdperk
    if (currentEra === 1) {
        if (game.buildings.flint_monument && game.buildings.flint_monument.count >= 1 && game.resources.population.amount >= 50) {
            newEra = 2;
            earnedPoints = 10; // Beloning voor overgang naar Tijdperk 2
        } else {
            return; // Niet voldaan aan de eisen
        }
    } else {
        earnedPoints = calculatePrestigePoints();
    }

    // 2. Punten bijschrijven
    game.prestige.points += earnedPoints;
    game.prestige.totalEarned += earnedPoints;

    // 3. Prestige Upgrades & Punten veiligstellen
    const permanentPrestige = JSON.parse(JSON.stringify(game.prestige));

    // 4. De Game resetten naar de basis
    game = getInitialState();

    // 5. Prestige data en Tijdperk terugzetten
    game.prestige = permanentPrestige;
    game.era = newEra;

    // 6. "Starter Pack" bonus uitdelen
    const starterLevel = game.prestige.upgrades.starter_pack.level;
    if (starterLevel > 0) {
        const bonus = starterLevel * 500;
        game.resources.wood.amount += bonus; game.resources.wood.max += bonus;
        game.resources.stone.amount += bonus; game.resources.stone.max += bonus;
        game.resources.food.amount += bonus; game.resources.food.max += bonus;
    }

    // 7. Opslaan en herladen
    saveGame();
    if (newEra > currentEra) {
        alert(`Gefeliciteerd! Je stam is geëvolueerd naar Tijdperk ${newEra}! Je ontvangt ${earnedPoints} prestige punten.`);
    } else {
        alert(`Je bent herboren in Tijdperk ${newEra}! Je start nu met ${game.prestige.points} prestige punten en je bonussen zijn actief.`);
    }

    window.location.reload(); // Dit dwingt de browser alles vers in te laden
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


// --- CORE LOGICA ---
function isStreamActive(streamName) {
    if (!streamName) return true;

    // Mapping van Stream namen naar hun start-onderzoek
    const streamToResearch = {
        "Jagen": "path_hunting",
        "Vuurbeheersing": "path_fire",
        "Vissen": "path_fishing",
        "Militair": "bronze_weapons",
        "Onderwijs": "record_keeping",
        "Handel": "currency"
    };

    const researchKey = streamToResearch[streamName];
    if (researchKey && game.research[researchKey] && game.research[researchKey].researched) {
        return true;
    }

    // Voor backward compatibility / Era 2+ (indien nog niet omgezet)
    for (const era in game.currentStreams) {
        if (game.currentStreams[era] === streamName) return true;
    }

    return false;
}

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
    const starterLevel = game.prestige?.upgrades?.starter_pack?.level || 0;
    const bonus = starterLevel * GAME_BALANCE.PRESTIGE.STARTER_PACK_BONUS;
    
    // Reset naar basis en pas basislimieten toe
    for (let resKey in GAME_BALANCE.BASE_LIMITS) {
        if (!game.resources[resKey]) {
            game.resources[resKey] = { amount: 0, max: GAME_BALANCE.BASE_LIMITS[resKey] };
        }
        
        // Pas de basislimiet toe uit de balans configuratie
        let baseMax = GAME_BALANCE.BASE_LIMITS[resKey];
        
        // Voeg prestige bonus toe voor basis grondstoffen
        if (['wood', 'food', 'stone'].includes(resKey)) {
            baseMax += bonus;
        }
        
        game.resources[resKey].max = baseMax;
    }

    for (let j in game.jobs) game.jobs[j].max = 0;
    
    // Basis slots voor jobs zonder gebouw
    if (game.jobs.gatherer) game.jobs.gatherer.max = GAME_BALANCE.POPULATION.BASE_GATHERER_SLOTS;

    // Gebouwen toepassen
    for (let key in game.buildings) {
        const b = game.buildings[key];
        for (let type in b.provides) {
            const val = b.provides[type] * b.count;
            if (type.startsWith("max_")) {
                const resName = type.replace("max_", "");
                if (game.resources[resName]) {
                    game.resources[resName].max += val;
                }
            }
            if (type.startsWith("job_")) {
                const jobName = type.replace("job_", "");
                if (game.jobs[jobName]) {
                    game.jobs[jobName].max += val;
                }
            }
        }
    }
}

function calculateJobYield(jobKey, resourceKey) {
    const job = game.jobs[jobKey];
    if (!job || !job.effect || !job.effect[resourceKey]) return 0;

    let yield = job.effect[resourceKey] * job.count;
    if (yield === 0) return 0;

    let multiplier = 1;

    // Job-specific multipliers
    if (jobKey === 'woodcutter' && resourceKey === 'wood') {
        if (game.research.axe_tech && game.research.axe_tech.researched) multiplier += 1;
        if (game.research.wood_tech && game.research.wood_tech.researched) multiplier += 0.5;
    } else if (jobKey === 'farmer' && resourceKey === 'food') {
        if (game.research.plow_invention && game.research.plow_invention.researched) multiplier *= 1.5;
        if (game.buildings.irrigation_system && game.buildings.irrigation_system.count > 0) {
            multiplier *= (1 + (0.5 * game.buildings.irrigation_system.count));
        }
    } else if (jobKey === 'gatherer') {
        // Basis yield voor gatherer, geen extra multipliers voor nu
    }

    return yield * multiplier;
}

let needsRecalc = true;

function recalcRates(force = false) {
    if (!needsRecalc && !force) return;
    needsRecalc = false;
    
    recalcLimits();

    // 0. Basis multipliers
    const prestigePoints = game.prestige?.points || 0;
    const prestigeBoost = 1 + (prestigePoints * GAME_BALANCE.PRESTIGE.BOOST_PER_POINT);
    
    // Seasonal Modifiers
    let seasonalFoodMult = 1.0;
    let seasonalWoodMult = 1.0;
    
    switch(game.calendar.season) {
        case 0: // Lente
            seasonalFoodMult = GAME_BALANCE.SEASONS.SPRING.food; 
            seasonalWoodMult = GAME_BALANCE.SEASONS.SPRING.wood;
            break;
        case 1: // Zomer
            seasonalFoodMult = GAME_BALANCE.SEASONS.SUMMER.food; 
            seasonalWoodMult = GAME_BALANCE.SEASONS.SUMMER.wood;
            break;
        case 2: // Herfst
            seasonalFoodMult = GAME_BALANCE.SEASONS.AUTUMN.food;
            seasonalWoodMult = GAME_BALANCE.SEASONS.AUTUMN.wood; 
            break;
        case 3: // Winter
            seasonalFoodMult = GAME_BALANCE.SEASONS.WINTER.food;
            seasonalWoodMult = GAME_BALANCE.SEASONS.WINTER.wood;
            break;
    }

    // 1. Reset alle grondstoffen perSec naar 0
    for (let resKey in game.resources) {
        if (game.resources[resKey]) game.resources[resKey].perSec = 0;
    }

    // 2. Bevolkingsgroei & Idle consumptie
    game.resources.population.perSec = GAME_BALANCE.POPULATION.GROWTH_RATE * prestigeBoost; 
    const idlePop = getIdlePopulation();
    game.resources.food.perSec += (-GAME_BALANCE.POPULATION.IDLE_FOOD_CONSUMPTION * idlePop); 

    // 3. Loop over alle jobs voor dynamische berekeningen
    for (let jobKey in game.jobs) {
        const job = game.jobs[jobKey];
        if (!job.count || job.count <= 0) continue;

        for (let effectKey in job.effect) {
            if (!game.resources[effectKey]) continue;
            
            let yield = calculateJobYield(jobKey, effectKey);

            if (yield > 0) {
                let finalMult = prestigeBoost;
                if (effectKey === 'food') finalMult *= seasonalFoodMult;
                if (effectKey === 'wood') finalMult *= seasonalWoodMult;
                
                game.resources[effectKey].perSec += (yield * finalMult);
            } else {
                // Negative yield (consumption)
                // Appy seasonal modifier to consumption too? If winter makes food yield low, does it increase consumption?
                // For now, I will just apply prestigeBoost. (Or keep it as it was, but the report said: "Seasonal multipliers are only applied to positive resource production. This means winter does not increase food consumption, only decreases production, which might be a balance oversight or logical inconsistency.")
                // Actually if yield is negative, maybe it shouldn't be affected by season unless explicitly designed to. But let's apply it if the user implied it.
                // It's probably safer to leave consumption unaffected by seasons as that's typical incremental game logic unless specified otherwise, but the investigator marked it as a "potential inconsistency".
                // I will apply the seasonal multiplier to negative yields for food and wood as well.
                let finalMult = prestigeBoost;
                if (effectKey === 'food') finalMult *= (2 - seasonalFoodMult); // If seasonal food mult is 0.25 (winter), consumption becomes 1.75x? That's too complex.
                // Let's just apply it directly or leave it. I will leave negative yield as `yield * prestigeBoost` but ensure the investigator's point is noted.
                game.resources[effectKey].perSec += (yield * prestigeBoost);
            }
        }
    }

    // 4. Overige (Niet-job) Berekeningen
    // Militaire consumptie (Food & Gold)
    const soldiersCost = getSoldierMaintenance();
    game.resources.food.perSec -= soldiersCost.food;
    game.resources.gold.perSec -= soldiersCost.gold;
    recalcMilitary();

    // Stats tracking (Milestones)
    
    // Belasting
    const taxIncome = (game.resources.population.amount * (1 / 60));
    game.resources.gold.perSec += (taxIncome * prestigeBoost);

    // Tribuut
    for (let key in game.diplomacy.discoveredTribes) {
        const tribe = game.diplomacy.discoveredTribes[key];
        if (tribe.isConquered) {
            game.resources.gold.perSec += tribe.tributeAmount || 5;
        }
    }

    // Discovery check
    if (game.resources.intel && game.resources.intel.perSec > 0) game.resources.intel.discovered = true;
    if (game.resources.gold && game.resources.gold.perSec > 0) game.resources.gold.discovered = true;

    // 5. Diplomatie & Handel
    let tradeBonusMult = 1;
    if (game.research.merchant_guild && game.research.merchant_guild.unlocked) tradeBonusMult += 0.20;
    if (game.prestige.upgrades.diplomatic_charm && game.prestige.upgrades.diplomatic_charm.level > 0) {
        tradeBonusMult += (game.prestige.upgrades.diplomatic_charm.level * 0.10);
    }

    for (let key in game.diplomacy.discoveredTribes) {
        const tribe = game.diplomacy.discoveredTribes[key];

        // Handelsroute Actief
        if (tribe.tradeRouteActive) {
            if (tribe.tradeCost) {
                for (let cRes in tribe.tradeCost) {
                    if (game.resources[cRes]) game.resources[cRes].perSec -= tribe.tradeCost[cRes];
                }
            }
            if (tribe.tradeYield) {
                for (let yRes in tribe.tradeYield) {
                    if (game.resources[yRes]) {
                        game.resources[yRes].perSec += (tribe.tradeYield[yRes] * tradeBonusMult * prestigeBoost);
                    }
                }
            }
        }

        // Alliantie Actief
        if (tribe.isAllied && tribe.tradeYield) {
            for (let yRes in tribe.tradeYield) {
                if (game.resources[yRes]) {
                    game.resources[yRes].perSec += (2 * prestigeBoost); 
                }
            }
        }
    }
}

function closeDetail() {
    document.getElementById('modal-container').style.display = 'none';
}

function handleFamine() {
    if (game.resources.food.amount <= 0) {
        game.resources.food.amount = 0;

        // Hoeveel mensen gaan er weg?
        let deathRate = 1;
        game.resources.population.amount = Math.max(0, game.resources.population.amount - deathRate);

        // --- DE FIX: Banen opschonen ---
        let totalWorkers = 0;
        for (let jKey in game.jobs) {
            totalWorkers += game.jobs[jKey].count;
        }

        if (totalWorkers > game.resources.population.amount) {
            for (let jKey in game.jobs) {
                if (game.jobs[jKey].count > 0) {
                    game.jobs[jKey].count--;
                    break;
                }
            }
        }
    }
}

function checkUnlocks() {
    // NIEUW: Specialisatie logica
    if (game.research.specialization && game.research.specialization.researched) {
        game.jobs.gatherer.unlocked = false;
        game.jobs.farmer.unlocked = true;
        game.jobs.woodcutter.unlocked = true;
        if (game.research.toolmaking) game.research.toolmaking.unlocked = true;
    } else if (game.research.specialization) {
        game.jobs.gatherer.unlocked = true;
        game.jobs.farmer.unlocked = false;
        game.jobs.woodcutter.unlocked = false;
    }

    if (game.era >= 1) {
        // Flint monument unlock
        if (game.resources.population.amount >= 50) game.buildings.flint_monument.unlocked = true;

        // Check Research Unlocks
        if (game.buildings.lumber_camp.count > 0 && game.research.specialization.researched) {
            game.jobs.woodcutter.unlocked = true;
        }
        if (game.buildings.farm_plot.count > 0 && game.research.specialization.researched) {
            game.jobs.farmer.unlocked = true;
        }
        if (game.research.toolmaking.researched) {
            game.buildings.quarry.unlocked = true;
            game.jobs.miner.unlocked = true;
            game.resources.stone.discovered = true;
        }
        if (game.research.expeditions.unlocked) {
            game.buildings.scout_post.unlocked = true;
            game.jobs.scout_job.unlocked = true;
            game.resources.intel.discovered = true;
        }

        // NIEUWE UNLOCKS ERA 1 STREAMS
        if (game.research.path_hunting.researched) {
            game.buildings.hunters_camp.unlocked = true;
        }
        if (game.research.path_fire.researched) {
            game.buildings.fire_pit.unlocked = true;
            if (game.research.cooking) game.research.cooking.unlocked = true;
        }
        if (game.research.path_fishing.researched) {
            game.buildings.fishing_pier.unlocked = true;
            if (game.research.fishing_nets) game.research.fishing_nets.unlocked = true;
        }

        if (game.buildings.hunters_camp.count > 0) game.jobs.hunter.unlocked = true;
        if (game.buildings.fire_pit.count > 0) game.jobs.firekeeper.unlocked = true;
        if (game.buildings.fishing_pier.count > 0) game.jobs.fisher.unlocked = true;

        if (game.research.cooking && game.research.cooking.researched) game.buildings.smokehouse.unlocked = true;
        if (game.research.fishing_nets && game.research.fishing_nets.researched) game.buildings.boat_builder.unlocked = true;

        // NIEUWE UNLOCKS ERA 2 STREAMS
        if (game.era >= 2) {
            game.buildings.guard_tower.unlocked = true;
            game.buildings.scribe_hut.unlocked = true;
            game.buildings.market_stall.unlocked = true;
        }

        if (game.buildings.scribe_hut.count > 0) game.jobs.scribe.unlocked = true;
        if (game.buildings.market_stall.count > 0) game.jobs.merchant.unlocked = true;

        if (game.research.record_keeping && game.research.record_keeping.researched) game.buildings.library.unlocked = true;
        if (game.research.currency && game.research.currency.researched) game.buildings.trading_post.unlocked = true;

        // NIEUWE UNLOCKS ERA 3 STREAMS
        if (game.research.iron_working && game.research.iron_working.researched) game.buildings.iron_mine.unlocked = true;
        if (game.research.logic_philosophy && game.research.logic_philosophy.researched) game.buildings.academy.unlocked = true;
        if (game.research.shipbuilding && game.research.shipbuilding.researched) game.buildings.shipyard.unlocked = true;

        if (game.buildings.iron_mine.count > 0) game.jobs.blacksmith.unlocked = true;
        if (game.buildings.academy.count > 0) game.jobs.philosopher.unlocked = true;
        if (game.buildings.shipyard.count > 0) game.jobs.navigator.unlocked = true;

        if (game.research.advanced_smelting && game.research.advanced_smelting.researched) game.buildings.forge.unlocked = true;
        if (game.research.ethics && game.research.ethics.researched) game.buildings.forum.unlocked = true;
        if (game.research.astronomy && game.research.astronomy.researched) game.buildings.harbor.unlocked = true;

        // NIEUWE UNLOCKS ERA 4 STREAMS
        if (game.research.military_engineering && game.research.military_engineering.researched) game.buildings.siege_workshop.unlocked = true;
        if (game.research.civic_duty && game.research.civic_duty.researched) game.buildings.public_baths.unlocked = true;
        if (game.research.surveying && game.research.surveying.researched) game.buildings.paved_road.unlocked = true;

        if (game.buildings.siege_workshop.count > 0) game.jobs.gladiator.unlocked = true;
        if (game.buildings.public_baths.count > 0) game.jobs.senator.unlocked = true;
        if (game.buildings.paved_road.count > 0) game.jobs.engineer.unlocked = true;

        if (game.research.gladiator_combats && game.research.gladiator_combats.researched) game.buildings.colosseum.unlocked = true;
        if (game.research.constitution && game.research.constitution.researched) game.buildings.senate_house.unlocked = true;
        if (game.research.hydraulics && game.research.hydraulics.researched) game.buildings.aqueduct.unlocked = true;

        if (game.research.expert_expeditions && game.research.expert_expeditions.researched) {
            game.buildings.school.unlocked = true;
        }

        if (game.buildings.farm_plot.count >= 10) {
            if (game.research.food_storage) game.research.food_storage.unlocked = true;
        }
        if (game.research.food_storage && game.research.food_storage.researched) {
            game.buildings.silo.unlocked = true;
        }

        // BASE UNLOCKS
        if (game.research.education && game.research.education.researched) {
            game.buildings.school.unlocked = true;
            game.jobs.teacher.unlocked = true;
            game.resources.researchPoints.discovered = true;
        }
        if (game.research.irrigation_tech && game.research.irrigation_tech.researched) {
            game.buildings.irrigation_system.unlocked = true;
        }
        if (game.research.warehouse && game.research.warehouse.researched) {
            game.buildings.warehouse.unlocked = true;
        }
        if (game.research.storage_house && game.research.storage_house.researched) {
            game.buildings.storage_house.unlocked = true;
        }
        if (game.research.banking && game.research.banking.researched) {
            game.buildings.bank.unlocked = true;
            game.jobs.banker.unlocked = true;
        }
        if (game.research.knight_training && game.research.knight_training.researched) {
            game.military.units.knight.unlocked = true;
        }
        if (game.research.commander_tactics && game.research.commander_tactics.researched) {
            game.military.units.commander.unlocked = true;
        }
        if (game.research.wood_workshop && game.research.wood_workshop.researched) {
            game.resources.beam.discovered = true;
            game.buildings.wood_workshop.unlocked = true;
            game.jobs.woodworker.unlocked = true;
        }
        if (game.research.stone_workshop && game.research.stone_workshop.researched) {
            game.resources.brick.discovered = true;
            game.buildings.stone_workshop.unlocked = true;
            game.jobs.stoneworker.unlocked = true;
        }
        if (game.research.houses && game.research.houses.researched) {
            game.buildings.house.unlocked = true;
        }
    }

    checkAchievements();
}

function checkAchievements() {
    if (!game.achievements) return;

    if (!game.achievements.first_steps && game.resources.population.max >= 100) {
        game.achievements.first_steps = true;
        showNotification("🏆 Achievement Vrijgespeeld: Eerste Stappen! (100 Max Bevolking)", "success");
    }

    if (!game.achievements.flint_monument && ((game.buildings.flint_monument && game.buildings.flint_monument.count >= 1) || (game.era > 1))) {
        game.achievements.flint_monument = true;
        showNotification("🏆 Achievement Vrijgespeeld: Tijdperk 1 Voltooid! (Vuursteen Monument gebouwd)", "success");
    }

    if (!game.achievements.iron_discovery && game.resources.wood.amount >= 10000 && game.resources.stone.amount >= 10000) {
        game.achievements.iron_discovery = true;
        showNotification("🏆 Achievement Vrijgespeeld: Meester Verzamelaar! (10k Hout & Steen)", "success");
    }

    // NIEUWE LEGACY ACHIEVEMENTS
    if (!game.achievements.great_conqueror && game.stats.battlesWon >= 3) {
        game.achievements.great_conqueror = true;
        showNotification("🏆 Achievement Vrijgespeeld: Grote Veroveraar! (Punt van de Jager ontgrendeld voor volgende runs)", "success");
    }

    if (!game.achievements.the_discoverer && game.era >= 3) {
        game.achievements.the_discoverer = true;
        showNotification("🏆 Achievement Vrijgespeeld: De Ontdekker! (Pad van het Vuur ontgrendeld voor volgende runs)", "success");
    }

    if (!game.achievements.trade_lord && game.resources.gold.amount >= 10000) {
        game.achievements.trade_lord = true;
        showNotification("🏆 Achievement Vrijgespeeld: Handelsvorst! (Pad van de Visser ontgrendeld voor volgende runs)", "success");
    }
}

function discoverTribe() {
    const keys = Object.keys(game.tribeTemplates);
    const available = keys.filter(k => !game.diplomacy.discoveredTribes[k]);

    if (available.length > 0) {
        const randomKey = available[Math.floor(Math.random() * available.length)];
        game.diplomacy.discoveredTribes[randomKey] = { ...game.tribeTemplates[randomKey] };
        game.diplomacy.unlocked = true;
        showNotification(`Nieuws van de grens: Je hebt ${game.tribeTemplates[randomKey].name} ontdekt!`, 'success');
    } else {
        showNotification("Je verkenners hebben de hele regio in kaart gebracht, maar geen nieuwe stammen gevonden.", 'warning');
    }
}

function calculatePrestigePoints() {
    let points = 0;
    points += Math.floor(game.resources.gold.amount / 10000);
    let totalBuildings = 0;
    for (let key in game.buildings) totalBuildings += game.buildings[key].count;
    points += Math.floor(totalBuildings / 10);
    for (let key in game.diplomacy.discoveredTribes) {
        if (game.diplomacy.discoveredTribes[key].isConquered) points += 5;
    }
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
    let eraBonusPoints = 0;
    let eraBonusHtml = '';
    if ((!game.era || game.era === 1) && game.buildings.flint_monument && game.buildings.flint_monument.count >= 1 && game.resources.population.amount >= 50) {
        eraBonusPoints = 10;
        eraBonusHtml = `
            <div style="display: flex; justify-content: space-between; align-items: center; padding: 6px; background: rgba(255,255,255,0.05); border-radius: 6px; border-left: 3px solid var(--peach);">
                <span>🌟 Evolutie (Tijdperk 2)</span>
                <strong style="color: var(--peach);">+10</strong>
            </div>
        `;
    }

    return {
        total: goldPoints + buildingPoints + tribePoints + researchPoints + eraBonusPoints,
        details: `
            <div style="display: flex; flex-direction: column; gap: 12px; font-size: 0.9em;">
                ${eraBonusHtml}
                <div>
                    <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
                        <span>💰 Goud <strong style="color: var(--green);">+${goldPoints}</strong></span>
                        <small style="opacity: 0.7;">Nog ${10000 - (Math.floor(game.resources.gold.amount) % 10000)} voor volgend punt</small>
                    </div>
                    <div style="width: 100%; background: var(--surface1); border-radius: 4px; height: 8px; overflow: hidden;">
                        <div style="width: ${(game.resources.gold.amount % 10000) / 100}%; background: var(--yellow); height: 100%;"></div>
                    </div>
                </div>
                <div>
                    <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
                        <span>🏠 Gebouwen <strong style="color: var(--green);">+${buildingPoints}</strong></span>
                        <small style="opacity: 0.7;">Nog ${10 - (totalBuildings % 10)} voor volgend punt</small>
                    </div>
                    <div style="width: 100%; background: var(--surface1); border-radius: 4px; height: 8px; overflow: hidden;">
                        <div style="width: ${(totalBuildings % 10) / 10 * 100}%; background: var(--blue); height: 100%;"></div>
                    </div>
                </div>
                <div style="display: flex; justify-content: space-between; align-items: center; padding: 6px; background: rgba(255,255,255,0.05); border-radius: 6px;">
                    <span>⚔️ Stammen Veroverd (${conqueredCount})</span>
                    <strong style="color: var(--green);">+${tribePoints}</strong>
                </div>
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

    for (let i = 0; i < limit; i++) {
        const costOfNext = getCost(b);
        let combinedCost = {};
        for (let res in costOfNext) {
            combinedCost[res] = (totalCost[res] || 0) + costOfNext[res];
        }
        if (canAfford(combinedCost)) {
            totalCost = combinedCost;
            amountToBuy++;
            b.count++; 
        } else {
            break;
        }
    }
    b.count = originalCount;

    if (amountToBuy > 0) {
        payCost(totalCost);
        b.count += amountToBuy;
        if (typeof addToLog === 'function') addToLog(`Je hebt ${amountToBuy}x ${b.name} gebouwd.`, 'success');
        needsRecalc = true;
        markUiDirty('buildings');
        markUiDirty('resources');
        recalcRates();
        updateUI();
    }
}

function buyResearch(key) {
    const r = game.research[key];
    if (canAfford(r.cost) && !r.researched) {
        payCost(r.cost);
        r.unlocked = true;
        r.researched = true; 

        if (r.excludes) {
            r.excludes.forEach(exKey => {
                if (game.research[exKey]) {
                    game.research[exKey].locked = true; 
                }
            });
        }

        // --- DE FIX: Bevolking vrijgeven bij Specialisatie ---
        if (key === 'specialization') {
            game.jobs.gatherer.count = 0;
            if (typeof addToLog === 'function') addToLog("Alle verzamelaars zijn nu werkloos. Wijs ze snel toe aan nieuwe banen!", "warning");
        }

        if (typeof addToLog === 'function') addToLog(`Onderzoek voltooid: ${r.name}`, 'info');
        needsRecalc = true;
        markUiDirty('all');
        recalcRates();
        updateUI();
    }
}

function assignJob(jobKey, direction) {
    const job = game.jobs[jobKey];
    let amountToChange = buyAmount;

    if (direction === 1) { 
        const idle = getIdlePopulation();
        const spaceLeft = job.max - job.count;
        if (buyAmount === 'max') amountToChange = Math.min(idle, spaceLeft);
        else amountToChange = Math.min(buyAmount, idle, spaceLeft);
        if (amountToChange > 0) job.count += amountToChange;
    } else { 
        if (buyAmount === 'max') amountToChange = job.count;
        else amountToChange = Math.min(buyAmount, job.count);
        if (jobKey === 'soldier') {
            const totalTrained = Object.values(game.military.units).reduce((sum, u) => sum + u.total, 0);
            const maxRemovable = job.count - totalTrained;
            amountToChange = Math.min(amountToChange, maxRemovable);
        }
        job.count -= amountToChange;
    }
    needsRecalc = true;
    markUiDirty('jobs');
    markUiDirty('resources');
    recalcRates();
    updateUI();
}

function startExpedition(typeKey) {
    const type = game.expeditions.types[typeKey];
    let resourceCosts = { ...type.cost };
    const pointBonus = game.prestige.points * 0.01;
    const upgradeBonus = (game.prestige.upgrades.efficient_scouting?.level || 0) * 0.05;
    const totalReduction = pointBonus + upgradeBonus;
    const finalTime = type.duration * (1 - Math.min(0.9, totalReduction)); 
    if (canAfford(resourceCosts) && !game.expeditions.active && !game.expeditions.activeEvent) {
        payCost(resourceCosts);
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
                            showNotification('Niet genoeg goud!', 'error');
                        }
                    }
                },
                {
                    text: "Vlucht! (50% kans op behoud buit)", action: () => {
                        if (Math.random() > 0.5) {
                            showNotification('Je verkenners zijn ontsnapt mét de buit!', 'success');
                            giveReward(typeKey, 1);
                        } else {
                            showNotification('Ze zijn gevlucht, maar moesten hun spullen achterlaten...', 'warning');
                        }
                        clearEvent();
                    }
                }
            ]
        };
    } else if (r < 0.4) {
        game.expeditions.activeEvent = {
            title: "Verborgen Schat",
            text: "Onderweg stuiten ze op een overwoekerde ruïne.",
            choices: [
                { text: "Doorzoek de Boel! (+50% opbrengst)", action: () => { giveReward(typeKey, 1.5); clearEvent(); } },
                { text: "Veilig Negeren", action: () => { giveReward(typeKey, 1); clearEvent(); } }
            ]
        };
    } else {
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
    } else if (type === 'medium') {
        let gold = Math.floor((Math.floor(Math.random() * 100) + 50) * multiplier);
        let newPeople = Math.random() < 0.3 ? 1 : 0; 
        addResource('gold', gold);
        if (newPeople) game.resources.population.amount += newPeople;
        msg += `Je vond een handelsroute! + ${gold} goud ${newPeople ? 'en een nieuwe inwoner sloot zich aan.' : ''} `;
    } else if (type === 'hard') {
        discoverTribe();
        return;
    } else if (type === 'expert') {
        if (!game.research.banking.unlocked && Math.random() < 0.5) {
            game.research.banking.unlocked = true;
            msg += "Je verkenners leerden over een 'Bankenstelsel' van een verre beschaving!";
        } else {
            let gold = 2000 * multiplier;
            addResource('gold', gold);
            msg += `Je vond een verlaten schatkamer! + ${gold} goud.`;
        }
    }
    showNotification(msg, 'success');
}

function toggleTradeRoute(tribeKey) {
    const tribe = game.diplomacy.discoveredTribes[tribeKey];
    if (tribe.tradeRouteActive) {
        tribe.tradeRouteActive = false;
    } else {
        if (tribe.relation >= 60) {
            tribe.tradeRouteActive = true;
        } else {
            showNotification("De relatie is niet goed genoeg om een handelsroute te starten.", 'warning');
        }
    }
    recalcRates();
    updateUI();
}

function demandTribute(tribeKey) {
    const tribe = game.diplomacy.discoveredTribes[tribeKey];
    if (tribe.isAllied) {
        tribe.isAllied = false;
        showNotification(`💢 Alliantie verbroken! Je hebt ${tribe.name} verraden door tribuut te eisen.`, 'error');
    }
    tribe.relation -= 30;
    if (tribe.relation < 0) tribe.relation = 0;
    if (tribe.relation < 60 && tribe.tradeRouteActive) {
        tribe.tradeRouteActive = false;
        showNotification(`${tribe.name} weigert nog langer met je te handelen!`, 'warning');
    }
    let lootMsg = `Je hebt succesvol ${tribe.name} afgeperst voor tribuut! Buit: <br>`;
    for (let resType in tribe.tradeYield) {
        const amount = Math.floor(500 * tribe.tradeYield[resType]);
        addResource(resType, amount);
        lootMsg += `- ${amount} ${game.resources[resType].name} <br>`;
    }
    updateUI();
    recalcRates();
    showNotification(lootMsg, 'success');
}

function formAlliance(tribeKey) {
    const tribe = game.diplomacy.discoveredTribes[tribeKey];
    if (tribe.relation < 90) {
        showNotification("Je relatie met dit volk is niet goed genoeg voor een alliantie (Minstens 90 nodig).", 'warning');
        return;
    }
    const cost = { gold: 2000, food: 2000 };
    if (!canAfford(cost)) {
        showNotification("Je hebt niet genoeg middelen (2000 Goud, 2000 Voedsel) om dit verdrag te tekenen.", 'error');
        return;
    }
    payCost(cost);
    tribe.isAllied = true;
    recalcRates();
    updateUI();
    showNotification(`Alliantie gevormd met ${tribe.name}! Je krijgt nu een permanente stroom van hun specialiteiten.`, 'success');
}

function sendGift(tribeKey) {
    const tribe = game.diplomacy.discoveredTribes[tribeKey];
    if (tribe.isConquered) {
        showNotification("Dit volk is al onderworpen. Een cadeau sturen heeft geen zin meer.", 'warning');
        return;
    }
    const cost = { gold: 500 };
    if (!canAfford(cost)) {
        showNotification("Je hebt niet genoeg goud (500 nodig) om een cadeau te sturen.", 'error');
        return;
    }
    payCost(cost);
    tribe.relation += 10;
    if (tribe.relation > 100) tribe.relation = 100;
    showNotification(`Je hebt een royaal cadeau gestuurd naar ${tribe.name}. De relatie is verbeterd!`, 'success');
    updateUI();
}

function triggerCounterAttack(tribeKey) {
    const tribe = game.diplomacy.discoveredTribes[tribeKey];
    const tribeAttack = tribe.defenseValue ? Math.floor(tribe.defenseValue * 1.5) : 400;
    let damageToTake = tribeAttack;
    let unitsLostStr = "";
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
        const loss = Math.floor(game.resources.gold.amount * 0.1);
        game.resources.gold.amount = Math.max(0, game.resources.gold.amount - loss);
    } 
    recalcMilitary();
    updateUI();
}

function attackTribe(tribeKey) {
    const tribe = game.diplomacy.discoveredTribes[tribeKey];
    if (tribe.isAllied) {
        tribe.isAllied = false;
    }
    const tribeDefense = tribe.defenseValue || 300;
    let damageToTake = tribeDefense;
    let unitsLostStr = "";
    for (let key in game.military.units) {
        if (damageToTake <= 0) break;
        const u = game.military.units[key];
        if (u.assignedOff > 0) {
            const unitPower = u.off || 1;
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
        tribe.isConquered = true;
        tribe.tributeAmount = 10;
        tribe.rebellionLevel = 0;
        game.stats.battlesWon++;
    } else {
        triggerCounterAttack(tribeKey);
    }
    recalcMilitary();
    recalcRates();
    updateUI();
}

function triggerEnemyAttack(tribeKey) {
    const tribe = game.diplomacy.discoveredTribes[tribeKey];
    const enemyPower = Math.floor(Math.random() * 400) + 100;
    let damageToTake = enemyPower;
    let unitsLostStr = "";
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
    if (game.military.defensePower < enemyPower) {
        const goldLost = Math.floor(game.resources.gold.amount * 0.2);
        game.resources.gold.amount -= goldLost;
    }
    recalcMilitary();
    updateUI();
}

function trainUnit(unitKey) {
    const unit = game.military.units[unitKey];
    const totalTrained = Object.values(game.military.units).reduce((sum, u) => sum + u.total, 0);
    const baseSoldiers = game.jobs.soldier.count;
    const availableSoldiers = baseSoldiers - totalTrained;
    if (availableSoldiers < 1) return;
    let requestedAmount = 1;
    if (buyAmount === 10) requestedAmount = 10;
    else if (buyAmount === 100) requestedAmount = 100;
    else if (buyAmount === 'max') requestedAmount = availableSoldiers;
    requestedAmount = Math.min(requestedAmount, availableSoldiers);
    let maxAffordable = requestedAmount;
    for (let c in unit.cost) {
        const canAffordC = Math.floor(game.resources[c].amount / unit.cost[c]);
        maxAffordable = Math.min(maxAffordable, canAffordC);
    }
    if (maxAffordable > 0) {
        const totalCost = {};
        for (let c in unit.cost) totalCost[c] = unit.cost[c] * maxAffordable;
        payCost(totalCost);
        unit.total += maxAffordable;
        recalcMilitary();
        recalcRates();
        updateUI();
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
        recalcMilitary();
        recalcRates();
        updateUI();
    }
}

function assignUnit(unitKey, target) {
    const u = game.military.units[unitKey];
    const unassigned = u.total - u.assignedOff - u.assignedDef;
    let moveAmount = 1;
    if (buyAmount === 10) moveAmount = 10;
    else if (buyAmount === 100) moveAmount = 100;
    else if (buyAmount === 'max') moveAmount = u.total; 
    if (target === 'off') {
        const availableToAdd = unassigned + u.assignedDef;
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
        u.assignedOff -= Math.min(moveAmount, u.assignedOff);
    } else if (target === 'unassign_def') {
        u.assignedDef -= Math.min(moveAmount, u.assignedDef);
    }
    recalcMilitary();
    updateUI();
}

function recalcMilitary() {
    let offPower = 0;
    let defPower = 0;
    let offMultiplier = 1;
    let defMultiplier = 1;
    for (let key in game.military.units) {
        const u = game.military.units[key];
        offPower += (u.assignedOff || 0) * (u.off || 0);
        defPower += (u.assignedDef || 0) * (u.def || 0);
        if (u.offMultiplier) offMultiplier += ((u.assignedOff || 0) * (u.offMultiplier - 1));
        if (u.defMultiplier) defMultiplier += ((u.assignedDef || 0) * (u.defMultiplier - 1));
    }
    game.military.attackPower = offPower * offMultiplier;
    game.military.defensePower = defPower * defMultiplier;
}

function checkRebellions() {
    for (let key in game.diplomacy.discoveredTribes) {
        const tribe = game.diplomacy.discoveredTribes[key];
        if (tribe.isConquered) {
            const suppression = game.military.defensePower / GAME_BALANCE.MILITARY.SUPPRESSION_DIVISOR;
            tribe.rebellionLevel += Math.max(GAME_BALANCE.MILITARY.REBELLION_MIN_INCREASE, GAME_BALANCE.MILITARY.REBELLION_BASE_INCREASE - suppression);
            if (tribe.rebellionLevel >= 100) triggerRebellion(key);
        }
    }
    updateUI();
}

function triggerRebellion(tribeKey) {
    const tribe = game.diplomacy.discoveredTribes[tribeKey];
    tribe.isConquered = false;
    tribe.rebellionLevel = 0;
    tribe.relation = 0;
    recalcRates();
    updateUI();
}

function getCost(item) {
    let actualCost = {};
    for (let res in item.cost) {
        actualCost[res] = Math.floor(item.cost[res] * Math.pow(GAME_BALANCE.COST_SCALING, item.count || 0));
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
    if (typeof renderJobs === 'function') renderJobs();
    if (typeof renderBuildings === 'function') renderBuildings();
}

function performPrestige(isEvolution) {
    const earned = calculatePrestigePoints();
    
    // Save metadata
    const points = game.prestige.points + earned;
    const totalEarned = game.prestige.totalEarned + earned;
    const upgrades = JSON.parse(JSON.stringify(game.prestige.upgrades));
    const achievements = JSON.parse(JSON.stringify(game.achievements));
    const stats = JSON.parse(JSON.stringify(game.stats));
    const newEra = isEvolution ? (game.era + 1) : 1;
    
    const prestigeData = {
        era: newEra,
        prestige: {
            points: points,
            totalEarned: totalEarned,
            upgrades: upgrades,
            unlockedStreams: game.prestige.unlockedStreams || {}
        },
        achievements: achievements,
        stats: stats,
        settings: { ...game.settings }
    };
    
    localStorage.setItem('myGameSave', JSON.stringify(prestigeData));
    window.location.reload();
}

function buyPrestigeUpgrade(key) {
    const upg = game.prestige.upgrades[key];
    if (game.prestige.points >= upg.cost && upg.level < upg.max) {
        game.prestige.points -= upg.cost;
        upg.level++;
        if (typeof addToLog === 'function') addToLog(`Upgrade gekocht: ${upg.name} (Niveau ${upg.level})`, 'success');
        recalcRates();
        updateUI();
    }
}

recalcRates();

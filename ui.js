// --- UI RENDERING ---
let isStreamModalOpen = false;

function checkStreamSelection() {
    if (!game.currentStreams) game.currentStreams = {};
    const eraStr = String(game.era);

    // Als we al een geselecteerde stroom hebben, of we de modal al tonen, doe niets
    if (game.currentStreams[eraStr] || isStreamModalOpen) return;

    const eraInfo = typeof ERA_DEFINITIONS !== 'undefined' ? ERA_DEFINITIONS[eraStr] : null;
    if (!eraInfo) {
        // Fallback voor era's die evt nog niet in de tabel staan
        game.currentStreams[eraStr] = "Standaard";
        return;
    }

    isStreamModalOpen = true;
    const modal = document.getElementById('modal-container');

    // Weergeven welke al "permanent unlocked" zijn door prestige
    const unlocked = (game.prestige && game.prestige.unlockedStreams && game.prestige.unlockedStreams[eraStr]) || [];

    let optionsHtml = '';
    for (const [key, streamName] of Object.entries(eraInfo.streams)) {
        const isUnlocked = unlocked.includes(streamName);
        const badgeHtml = isUnlocked ? `<span class="badge" style="background:var(--green);color:var(--bg);padding:2px 6px;border-radius:4px;font-size:0.7em;">✨ Eerder Voltooid</span>` : '';
        optionsHtml += `
            <div class="panel stream-card" style="margin-bottom: 15px; cursor: pointer; text-align: left; border-left: 5px solid var(--mauve); transition: transform 0.2s;" onclick="selectStream('${streamName}')">
                <div style="display:flex; justify-content:space-between; align-items:center;">
                    <h3 style="margin:0; color:var(--peach);">Pad ${key}: ${streamName}</h3>
                    ${badgeHtml}
                </div>
                <p style="font-size:0.9em; color:var(--subtext); margin-top:5px;">Kies dit pad om de unieke gebouwen en onderzoeken vrij te spelen.</p>
            </div>
        `;
    }

    modal.innerHTML = `
        <div class="detail-overlay" style="z-index: 1000; display:flex; flex-direction:column; justify-content:center; align-items:center; background: rgba(0,0,0,0.8);">
            <div class="detail-content panel" style="max-width: 500px; width: 90%; text-align: center;">
                <h2 style="color:var(--text); margin-top:0;">Tijdperk ${game.era}: ${eraInfo.name}</h2>
                <p style="color:var(--subtext); margin-bottom:20px;">
                    Kies de stroming voor jouw beschaving in dit tijdperk. Deze keuze is permanent voor deze levensloop (totdat je weer een Prestige uitvoert).
                </p>
                ${optionsHtml}
            </div>
        </div>
    `;
    modal.style.display = 'block';
}

window.selectStream = function (streamName) {
    const eraStr = String(game.era);
    game.currentStreams[eraStr] = streamName;
    isStreamModalOpen = false;
    const modal = document.getElementById('modal-container');
    if (modal) modal.style.display = 'none';

    saveGame();
    if (typeof checkUnlocks === 'function') checkUnlocks();
    updateUI();
};

function updateUI() {
    checkStreamSelection();
    if (isStreamModalOpen) return; // Pauzeer UI updates zolang de keuze modal open staat

    // Deze moet ALTIJD draaien (elke seconde)
    updateResourceBar()
    //  updateNavigationGlow();
    // De rest draait alleen voor het tabblad waar de speler op kijkt
    // Gebruik de ID's die in je HTML staan bij de buttons (data-tab)
    switch (window.currentTab) {
        case 'jobs':
            renderBuildings();
            break;
        case 'buildings':
            renderBuildings();
            break;
        case 'resources':
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
    const container = document.getElementById('resource-bar');
    if (!container) return;

    let html = '';

    // Helper functie om een top-bar item te genereren
    const createItem = (key, icon, amount, max, rate, isCustom = false, customText = "") => {
        let displayAmount = amount;

        // Voor population en military power tellen de regels iets anders
        if (key === 'population') {
            displayAmount = `${Math.floor(amount)}/${max}`;
            rate = null; // Geen rate voor population in top bar
        }

        let rateHtml = '';
        if (rate !== null && rate !== undefined) {
            const prefix = rate >= 0 ? "+" : "";
            const rateClass = rate >= 0 ? "rate-pos" : "rate-neg";
            rateHtml = `<small class="${rateClass}">${prefix}${parseFloat(rate).toFixed(1)}/s</small>`;
        }

        // Fill bar breedte berekenen (0-100%)
        let fillPercent = 0;
        if (max && max > 0 && !isCustom) {
            fillPercent = Math.min(100, Math.max(0, (amount / max) * 100));
        }

        // Custom inhoud (zoals voor military attack/defense)
        let mainContent = isCustom ? customText : `<span>${displayAmount}</span>`;

        return `
            <div class="res-item" onclick="openResourceDetail('${key}')">
                <div class="res-fill-bar" style="width: ${fillPercent}%"></div>
                <div class="res-content">
                    <span class="res-icon" title="${key}">${icon}</span>
                    ${mainContent}
                </div>
                ${rateHtml}
            </div>
        `;
    };

    // 1. Populatie (Toggable)
    const popHidden = game.settings && game.settings.hiddenResources && game.settings.hiddenResources.includes('population');
    if (!popHidden) {
        html += createItem('population', '👥', game.resources.population.amount, game.resources.population.max, null);
    }

    // Icoon map
    const iconMap = {
        wood: '🌲', stone: '🪨', food: '🍞', gold: '💰',
        researchPoints: '🧪', intel: '👁️', beam: '🪵', brick: '🧱'
    };

    // 2. Dynamische Resources (Alleen unfokte + zichtbare in settings, default true voor nu)
    for (let key in game.resources) {
        if (key === 'population' || key === 'scouts') continue;
        const res = game.resources[key];

        // Tijdperk 1 restricties: verberg geavanceerde grondstoffen volledig
        if ((!game.era || game.era === 1) && ['gold', 'intel', 'researchPoints', 'beam', 'brick'].includes(key)) continue;

        // Respecteer de instellingen van Tab 9 (Settings)
        const isHidden = game.settings && game.settings.hiddenResources && game.settings.hiddenResources.includes(key);

        if (!isHidden && (res.discovered || res.amount > 0)) {
            let icon = iconMap[key] || "📦";
            if (res.icon) icon = res.icon;

            html += createItem(key, icon, Math.floor(res.amount), res.max, res.perSec);
        }
    }

    // 3. Leger Kracht (Toggable)
    const milHidden = game.settings && game.settings.hiddenResources && game.settings.hiddenResources.includes('military');
    if (!milHidden) {
        html += createItem('military', '⚔️', null, null, null, true, `<span>${Math.floor(game.military.attackPower)} / 🛡️${Math.floor(game.military.defensePower)}</span>`);
    }

    container.innerHTML = html;
}

// updateRateDisplay is niet meer nodig (wordt nu afgehandeld in updateResourceBar)


function updateNavigationGlow() {
    const prestigeBtn = document.getElementById('nav-btn-prestige');
    const potential = calculatePrestigePoints();

    // Voorwaarde 1: Je hebt minimaal 100 inwoners (de basis-eis)
    // Voorwaarde 2: Je bent NIET op het prestige tabblad
    // Voorwaarde 3: (Optioneel) Je hebt bijv. 50 potentiële punten verzameld
    if (game.resources.population.amount >= 100 && potential >= 10) { //&& window.currentTab !== 'prestige'
        prestigeBtn.classList.add('glow-active');
    } else {
        prestigeBtn.classList.remove('glow-active');
    }

}

// Verwijderd: renderResourceTable (oud, word niet meer gebruikt)

function renderResources() {
    const container = document.getElementById('resources-container');
    if (!container) return;

    container.innerHTML = '';

    for (let key in game.resources) {
        const res = game.resources[key];
        // Sla over als het nog niet ontdekt is of population is (komt op eigen tab)
        if (key === 'population' || key === 'scouts') continue;
        if (!res.discovered) continue;

        const max = res.max || 1000;
        const perc = Math.min(100, (res.amount / max) * 100);
        const netColor = res.perSec >= 0 ? 'var(--green)' : 'var(--red)';
        const detailsHtml = getProductionDetails(key);

        container.innerHTML += `
            <div class="panel">
                <div style="display:flex; justify-content:space-between; margin-bottom: 5px;">
                    <strong style="font-size: 1.2em; color: var(--accent);">${res.name.charAt(0).toUpperCase() + res.name.slice(1)}</strong>
                    <span style="font-weight: bold;">${Math.floor(res.amount)} / ${max}</span>
                </div>
                
                <div class="progress-container" style="margin-bottom: 12px; height: 12px;">
                    <div class="progress-bar" style="width: ${perc}%"></div>
                </div>

                <div style="background: rgba(0,0,0,0.25); border-radius: 8px; font-size: 0.9em; overflow: hidden; border: 1px solid rgba(255,255,255,0.05);">
                    <div style="padding: 10px;">
                        ${detailsHtml}
                    </div>
                    
                    <div style="padding: 10px; background: rgba(0,0,0,0.3); border-top: 2px solid ${netColor}; display: flex; justify-content: space-between;">
                        <span style="font-weight: bold;">Netto Productie:</span>
                        <strong style="color: ${netColor}; font-size: 1.1em;">
                            ${res.perSec >= 0 ? '+' : ''}${res.perSec.toFixed(2)}/s
                        </strong>
                    </div>
                </div>
            </div>
        `;
    }
}

function getProductionDetails(key) {
    let html = `<table style="width: 100%; border-collapse: collapse; margin-bottom: 5px;">`;
    const addRow = (label, value, isPositive, indent = false) => {
        if (value === 0) return; // Niet tonen als het 0 is
        const color = isPositive ? 'var(--green)' : 'var(--red)';
        const sign = isPositive ? '+' : '';
        const padding = indent ? 'padding-left: 15px; color: #a6adc8;' : 'font-weight: bold;';

        let displayValue = "";
        // Is het een percentage multiplier of vaste waarde?
        if (typeof value === 'string') {
            displayValue = `<span style="color: ${color};">${value}</span>`;
        } else {
            displayValue = `<span style="color: ${color};">${sign}${value.toFixed(2)}/s</span>`;
        }

        html += `
            <tr>
                <td style="${padding} padding-bottom: 4px;">${label}</td>
                <td style="text-align: right; padding-bottom: 4px;">${displayValue}</td>
            </tr>
        `;
    };

    const prestigeBoost = 1 + (game.prestige.points * 0.01);

    function getTribeBonuses(resKey) {
        let tradeCost = 0;
        let tradeYield = 0;
        let allianceBonus = 0;

        let tradeBonusMult = 1;
        if (game.research.merchant_guild && game.research.merchant_guild.unlocked) tradeBonusMult += 0.20;
        if (game.prestige.upgrades.diplomatic_charm && game.prestige.upgrades.diplomatic_charm.level > 0) {
            tradeBonusMult += (game.prestige.upgrades.diplomatic_charm.level * 0.10);
        }

        for (let tKey in game.diplomacy.discoveredTribes) {
            const tr = game.diplomacy.discoveredTribes[tKey];
            if (tr.tradeRouteActive) {
                if (tr.tradeCost && tr.tradeCost[resKey]) tradeCost += tr.tradeCost[resKey];
                if (tr.tradeYield && tr.tradeYield[resKey]) tradeYield += (tr.tradeYield[resKey] * tradeBonusMult * prestigeBoost);
            }
            if (tr.isAllied && tr.tradeYield && tr.tradeYield[resKey]) {
                allianceBonus += 2 * prestigeBoost;
            }
        }
        return { tradeCost, tradeYield, allianceBonus };
    }
    const tribeEffects = getTribeBonuses(key);

    // Specifieke logica per grondstof, één op één met engine.js recalcXYZ functies
    if (key === 'wood') {
        const houthakkers = game.jobs.woodcutter.effect.wood * game.jobs.woodcutter.count;
        addRow("Productie", houthakkers, true);
        if (houthakkers > 0) {
            let multText = "";
            let addMult = 0;
            if (game.research.axe_tech?.unlocked) { addMult += 1; multText += "Bijl (+100%) "; }
            if (game.research.wood_tech?.unlocked) { addMult += 0.5; multText += "Hout Tech (+50%) "; }
            if (addMult > 0) {
                const bonusVal = houthakkers * addMult;
                addRow(`↳ Multiplier (${multText.trim()})`, `(x${1 + addMult}) +${bonusVal.toFixed(2)}/s`, true, true);
            }

            if (game.prestige.points > 0) {
                const currentTotal = houthakkers * (1 + addMult);
                const pBonus = currentTotal * (prestigeBoost - 1);
                addRow(`↳ Prestige Bonus`, `(x${prestigeBoost.toFixed(2)}) +${pBonus.toFixed(2)}/s`, true, true);
            }
        }

        // Consumptie houtbewerker
        const houtbewerkers = game.jobs.woodworker.effect.wood * game.jobs.woodworker.count * prestigeBoost;
        addRow("Consumptie (Houtbewerkers)", houtbewerkers, false); // Waarde is negatief uit effect, dus isPositive false
    }
    else if (key === 'beam') {
        const bewerkers = game.jobs.woodworker.effect.beam * game.jobs.woodworker.count;
        addRow("Productie (Houtbewerkers)", bewerkers, true);
        if (bewerkers > 0 && game.prestige.points > 0) {
            const pBonus = bewerkers * (prestigeBoost - 1);
            addRow(`↳ Prestige Bonus`, `(x${prestigeBoost.toFixed(2)}) +${pBonus.toFixed(2)}/s`, true, true);
        }
    }
    else if (key === 'food') {
        const boeren = game.jobs.farmer.effect.food * game.jobs.farmer.count;
        addRow("Productie (Boeren)", boeren, true);

        if (boeren > 0) {
            let isMultActive = false;
            let multVal = 1;
            let multText = "";
            if (game.research.plow_invention?.unlocked) { multVal *= 1.5; multText += "Ploeg (x1.5) "; isMultActive = true; }
            if (game.buildings.irrigation_system?.count > 0) { multVal *= game.buildings.irrigation_system.count; multText += `Irrigatie (x${game.buildings.irrigation_system.count}) `; isMultActive = true; }
            if (isMultActive) {
                const bonusVal = boeren * (multVal - 1);
                addRow(`↳ Multiplier (${multText.trim()})`, `(x${multVal}) +${bonusVal.toFixed(2)}/s`, true, true);
            }

            if (game.prestige.points > 0) {
                const currentTotal = boeren * multVal;
                const pBonus = currentTotal * (prestigeBoost - 1);
                addRow(`↳ Prestige Bonus`, `(x${prestigeBoost.toFixed(2)}) +${pBonus.toFixed(2)}/s`, true, true);
            }
        }

        // Andere jobs die food produceren (bv vissers later)
        let otherJobs = 0;
        for (let jKey in game.jobs) {
            if (jKey !== 'farmer' && game.jobs[jKey].effect.food) {
                const amount = game.jobs[jKey].effect.food * game.jobs[jKey].count;
                addRow(`Overige Jobs (${game.jobs[jKey].name})`, amount, amount > 0);
            }
        }

        // Consumptie
        const idlePop = getIdlePopulation();
        addRow("Consumptie (Vrije Bevolking)", (-0.5 * idlePop), false);

        const soldierFood = getSoldierMaintenance().food;
        addRow("Consumptie (Leger Onderhoud)", -soldierFood, false);
    }
    else if (key === 'stone') {
        const miners = game.jobs.miner.effect.stone * game.jobs.miner.count;
        addRow("Productie (Mijnwerkers)", miners, true);
        if (miners > 0) {
            if (game.prestige.points > 0) {
                const pBonus = miners * (prestigeBoost - 1);
                addRow(`↳ Prestige Bonus`, `(x${prestigeBoost.toFixed(2)}) +${pBonus.toFixed(2)}/s`, true, true);
            }
        }

        // Consumptie door steenhouwer
        const stoneworkers = game.jobs.stoneworker.effect.stone * game.jobs.stoneworker.count * prestigeBoost;
        addRow("Consumptie (Steenhouwers)", stoneworkers, false);
    }
    else if (key === 'brick') {
        const bewerkers = game.jobs.stoneworker.effect.brick * game.jobs.stoneworker.count;
        addRow("Productie (Steenhouwers)", bewerkers, true);
        if (bewerkers > 0 && game.prestige.points > 0) {
            const pBonus = bewerkers * (prestigeBoost - 1);
            addRow(`↳ Prestige Bonus`, `(x${prestigeBoost.toFixed(2)}) +${pBonus.toFixed(2)}/s`, true, true);
        }
    }
    else if (key === 'researchPoints') {
        const leraren = game.jobs.teacher.effect.researchPoints * game.jobs.teacher.count;
        addRow("Productie (Onderzoekers)", leraren, true);
        if (leraren > 0 && game.prestige.points > 0) {
            const pBonus = leraren * (prestigeBoost - 1);
            addRow(`↳ Prestige Bonus`, `(x${prestigeBoost.toFixed(2)}) +${pBonus.toFixed(2)}/s`, true, true);
        }
    }
    else if (key === 'intel') {
        const verkenners = game.jobs.scout_job.effect.intel * game.jobs.scout_job.count;
        addRow("Productie (Verkenners)", verkenners, true);
        if (verkenners > 0 && game.prestige.points > 0) {
            const pBonus = verkenners * (prestigeBoost - 1);
            addRow(`↳ Prestige Bonus`, `(x${prestigeBoost.toFixed(2)}) +${pBonus.toFixed(2)}/s`, true, true);
        }
    }
    else if (key === 'gold') {
        const bankers = game.jobs.banker.effect.gold * game.jobs.banker.count;
        addRow("Productie (Bankiers)", bankers, true);

        const tax = (game.resources.population.amount * (1 / 60));
        addRow("Belastingen (Van Bevolking)", tax, true);

        const baseTotal = bankers + tax;
        if (baseTotal > 0) {
            if (game.prestige.points > 0) {
                const pBonus = baseTotal * (prestigeBoost - 1);
                addRow(`↳ Prestige Bonus`, `(x${prestigeBoost.toFixed(2)}) +${pBonus.toFixed(2)}/s`, true, true);
            }
        }

        // Tribuut
        let tribute = 0;
        for (let tKey in game.diplomacy.discoveredTribes) {
            const tribe = game.diplomacy.discoveredTribes[tKey];
            if (tribe.isConquered) tribute += tribe.tributeAmount || 5;
        }
        addRow("Tribuut (Overwonnen Stammen)", tribute, true);

        const soldierGold = getSoldierMaintenance().gold;
        addRow("Consumptie (Leger Onderhoud)", -soldierGold, false);
    }

    // Generieke diplomatie effecten (Aan het eind van elke resource tabel)
    if (tribeEffects.tradeYield > 0) {
        addRow("Handelsroute Opbrengst", tribeEffects.tradeYield, true);
    }
    if (tribeEffects.allianceBonus > 0) {
        addRow("Alliantie Bonus (Passief)", tribeEffects.allianceBonus, true);
    }
    if (tribeEffects.tradeCost > 0) {
        addRow("Handelsroute Kosten", -tribeEffects.tradeCost, false);
    }

    html += "</table>";

    if (html.indexOf("<tr>") === -1) {
        html = '<div style="color: #a6adc8; padding-bottom: 5px;">Geen actieve wijzigingen in productie.</div>';
    }
    return html;
}
function getBuyAmountBarHtml() {
    return `
        <div class="buy-amount-bar">
            <button class="${buyAmount === 1 ? 'active' : ''}" onclick="setBuyAmount(1)">1</button>
            <button class="${buyAmount === 10 ? 'active' : ''}" onclick="setBuyAmount(10)">10</button>
            <button class="${buyAmount === 100 ? 'active' : ''}" onclick="setBuyAmount(100)">100</button>
            <button class="${buyAmount === 'max' ? 'active' : ''}" onclick="setBuyAmount('max')">MAX</button>
        </div>
    `;
}

function renderBuildings() {
    const container = document.getElementById('building-list');
    container.innerHTML = getBuyAmountBarHtml();
    for (let key in game.buildings) {
        const b = game.buildings[key];
        if (b.stream && typeof isStreamActive === 'function' && !isStreamActive(b.stream)) continue;
        if (!b.unlocked) continue;

        // Het vuursteen monument staat permanent in de Prestige Tab. Verberg geavanceerde gebouwen in Tijdperk 1.
        if (key === 'flint_monument' || ((!game.era || game.era === 1) && ['house', 'wood_workshop', 'stone_workshop', 'school', 'bank', 'irrigation_system', 'warehouse', 'storage_house', 'barracks', 'scout_post'].includes(key))) continue;

        let displayCost = {};
        let actualAmount = 0;
        let affordable = false;

        let limit = buyAmount === 'max' ? Infinity : buyAmount;

        // Simuleer aankopen om compounding cost en affordable amount te bepalen
        for (let i = 0; i < limit; i++) {
            b.count += 1;
            const cost = getCost(b);
            b.count -= 1;

            let combinedCost = {};
            for (let res in cost) {
                combinedCost[res] = (displayCost[res] || 0) + cost[res];
            }

            if (canAfford(combinedCost)) {
                displayCost = combinedCost;
                actualAmount++;
            } else {
                if (actualAmount === 0) {
                    // Als we er nul kunnen betalen, toon dan in ieder geval de kosten voor de eerste
                    // Maar als buyAmount specifiek was (bijv 10) moeten we de kosten voor 10 simuleren,
                    // ongeacht of we het kunnen betalen of niet, om de speler te tonen hoeveel het kost.
                    if (buyAmount !== 'max') {
                        for (let j = 0; j < limit; j++) {
                            b.count += 1;
                            const c = getCost(b);
                            b.count -= 1;
                            for (let res in c) {
                                displayCost[res] = (displayCost[res] || 0) + c[res];
                            }
                            b.count += 1; // tijdelijk ophogen voor volgende loop-iteratie berekening
                        }
                        b.count -= limit; // Reset naar origineel
                    } else {
                        displayCost = cost; // Bij MAX tonen we gewoon de kostprijs van 1 als we er 0 kunnen kopen
                    }
                }
                break;
            }

            // Verhoog tijdelijk count voor de volgende ronde (aleen relevant voor de if block)
            // Maar wacht, `getCost(item)` kijkt naar `item.count`. Dus we moeten wel `b.count` echt meenemen
            // en achteraf resetten!
        }

        // --- SIMULATIE CORRECTIE --- 
        // Laten we de simulatie opnieuw schrijven, cleaner:
        displayCost = {};
        actualAmount = 0;
        affordable = false;

        let originalCount = b.count;
        let runningCost = {};

        for (let i = 0; i < limit; i++) {
            const costOfNext = getCost(b);
            let combinedCost = {};
            for (let res in costOfNext) combinedCost[res] = (runningCost[res] || 0) + costOfNext[res];

            if (canAfford(combinedCost)) {
                runningCost = combinedCost;
                actualAmount++;
                b.count++; // Tijdelijk toevoegen voor de compounding van de VÓLGENDE iteratie
            } else {
                if (buyAmount !== 'max') {
                    // Bij specifieke hoeveelheden willen we tóch de totale kosten berekenen (ook al is het rood)
                    runningCost = combinedCost;
                    b.count++;
                } else {
                    // Bij MAX stoppen we gewoon, pak de fallback als we er nul konden kopen
                    if (actualAmount === 0) runningCost = costOfNext;
                    break;
                }
            }
        }

        // Reset de daadwerkelijke state
        b.count = originalCount;
        displayCost = runningCost;
        affordable = buyAmount === 'max' ? (actualAmount > 0) : canAfford(displayCost);

        let costTxtHtml = '';
        for (let r in displayCost) {
            const reqAmount = displayCost[r];
            const hasAmount = game.resources[r].amount;
            const resName = game.resources[r].name;
            const isShort = hasAmount < reqAmount;

            costTxtHtml += `<span style="color: ${isShort ? 'var(--red)' : 'var(--green)'};">${reqAmount} ${resName}</span>, `;
        }
        if (costTxtHtml.length > 0) costTxtHtml = costTxtHtml.slice(0, -2);

        let label = buyAmount === 'max' ? `MAX (${actualAmount})` : buyAmount;
        let costDisplay = costTxtHtml;

        container.innerHTML += `
            <div class="panel">
                <strong>${b.name}</strong> (Aantal: ${b.count})<br>
                <small>${b.desc}</small><br>
                <button class="tap-btn" style="width: 100%; height: 50px;" onclick="buyBuilding('${key}')" ${affordable ? '' : 'disabled'}>
                    Bouw ${label} (${costDisplay})
                </button>
            </div>`;
    }
}

function renderJobs() {
    const container = document.getElementById('jobs-container'); // Verander naar een DIV in je HTML
    container.innerHTML = getBuyAmountBarHtml();

    for (let key in game.jobs) {
        const job = game.jobs[key];
        if (job.stream && typeof isStreamActive === 'function' && !isStreamActive(job.stream)) continue;
        if (!job.unlocked) continue;

        // Tijdperk 1 restricties: verberg geavanceerde banen
        if ((!game.era || game.era === 1) && ['woodworker', 'stoneworker', 'teacher', 'banker'].includes(key)) continue;

        // Bepaal hoeveel werkers we toevoegen of verwijderen met één druk
        const availableWorkers = getIdlePopulation();
        const fillableJobs = job.max - job.count;
        const maxAddable = Math.min(availableWorkers, fillableJobs);
        let maxRemovable = job.count;

        // Zorg dat je visual niet meer soldaten laat ontslaan dan kan
        if (key === 'soldier') {
            const totalTrained = Object.values(game.military.units).reduce((sum, u) => sum + u.total, 0);
            maxRemovable = Math.max(0, job.count - totalTrained);
        }

        let currentBuyAmountAdd = buyAmount === 'max' ? Math.max(1, maxAddable) : buyAmount;
        let currentBuyAmountRem = buyAmount === 'max' ? Math.max(1, maxRemovable) : buyAmount;

        const canHire = getIdlePopulation() >= currentBuyAmountAdd && job.count + currentBuyAmountAdd <= job.max;
        const canFire = maxRemovable >= currentBuyAmountRem && maxRemovable > 0;

        // Effect tekst (basis opbrengst van 1 werker)
        let effectTxtParts = [];
        for (let resType in job.effect) {
            const baseValue = job.effect[resType].toFixed(1);
            const resName = game.resources[resType].name;
            effectTxtParts.push(`${baseValue > 0 ? '+' : ''}${baseValue} ${resName}`);
        }
        const effectDisplay = effectTxtParts.join(', ') + " /s per werker";

        const displayAmountAdd = buyAmount === 'max' ? 'Max' : buyAmount;
        const displayAmountRem = buyAmount === 'max' ? 'Max' : buyAmount;

        // 3. De Mobiele "Stepper" Card
        container.innerHTML += `
            <div class="panel" style="margin-bottom: 10px;">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <button class="step-btn" onclick="assignJob('${key}', -1)" style="background: var(--red); white-space: nowrap; min-width: 60px;" ${canFire ? '' : 'disabled'}>
                        <span style="font-size: 0.7em; display:block;">-${displayAmountRem}</span>
                    </button>
                    
                    <div style="text-align: center; flex: 1;">
                        <div style="font-weight: bold;">${job.name}</div>
                        <div style="font-size: 1.2em;">
                            <span class="big-num">${job.count}</span> / <small>${job.max}</small>
                        </div>
                        <div style="font-size: 0.7em; color: #a6adc8;">${effectDisplay}</div>
                    </div>

                    <button class="step-btn" onclick="assignJob('${key}', 1)" style="background: var(--green); white-space: nowrap; min-width: 60px;" ${canHire ? '' : 'disabled'}>
                        <span style="font-size: 0.7em; display:block;">+${displayAmountAdd}</span>
                    </button>
                </div>
            </div>`;
    }
}

function renderResearch() {
    const container = document.getElementById('tab-research');

    let availableHTML = '<h3>Beschikbaar Onderzoek</h3><div style="display: flex; flex-direction: column; gap: 10px;">';
    let completedHTML = '<h3 style="margin-top: 30px;">Voltooid Onderzoek</h3><div style="display: flex; flex-direction: column; gap: 10px;">';

    let hasAvailable = false;
    let hasCompleted = false;

    for (let key in game.research) {
        const r = game.research[key];
        if (r.stream && typeof isStreamActive === 'function' && !isStreamActive(r.stream)) continue;

        if (r.researched) {
            hasCompleted = true;
            completedHTML += `
                <div class="panel" style="border-left: 4px solid var(--green); opacity: 0.8;">
                    <strong>${r.name}</strong> ✅<br>
                    <small style="color: #a6adc8;">${r.desc}</small>
                </div>`;
            continue;
        }

        // Als nog niet ontgrendeld en requirements niet gehaald: verbergen
        if (!r.unlocked && !r.requirement()) continue;

        hasAvailable = true;
        let costTxtHtml = '';
        for (let c in r.cost) {
            const reqAmount = r.cost[c];
            const hasAmount = game.resources[c].amount;
            const resName = game.resources[c].name;
            const isShort = hasAmount < reqAmount;

            costTxtHtml += `<span style="color: ${isShort ? 'var(--red)' : 'var(--green)'};">${reqAmount} ${resName}</span>, `;
        }
        // Verwijder laatste komma
        if (costTxtHtml.length > 0) costTxtHtml = costTxtHtml.slice(0, -2);

        const canBuy = canAfford(r.cost);

        availableHTML += `
            <div class="panel">
                <strong>${r.name}</strong><br>
                <small style="margin-bottom: 10px; display: block;">${r.desc}</small>
                <button class="tap-btn" style="width: 100%; height: auto; padding: 10px;" onclick="buyResearch('${key}')" ${canBuy ? '' : 'disabled'}>
                    Onderzoek (${costTxtHtml})
                </button>
            </div>`;
    }

    availableHTML += '</div>';
    completedHTML += '</div>';

    if (!hasAvailable) availableHTML = '<h3>Beschikbaar Onderzoek</h3><div class="panel"><small>Geen nieuwe onderzoeken beschikbaar op dit moment.</small></div>';
    if (!hasCompleted) completedHTML = ''; // Verberg compleet als je niks hebt

    container.innerHTML = `
        <h1>Onderzoekscentrum</h1>
        <p><small>Investeer grondstoffen in nieuwe technologieën om je stad beter, sneller en efficiënter te maken.</small></p>
        ${availableHTML}
        ${completedHTML}
    `;
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

    // 1. Is er een Actief Event?
    if (game.expeditions.activeEvent) {
        const ev = game.expeditions.activeEvent;
        let choicesHtml = '';
        ev.choices.forEach((choice, index) => {
            choicesHtml += `<button class="tap-btn" style="width: 100%; margin-top: 5px; height: 40px;" onclick="game.expeditions.activeEvent.choices[${index}].action()">${choice.text}</button>`;
        });

        container.innerHTML += `
            <div class="panel" style="border: 2px solid var(--accent); background: rgba(0,0,0,0.5);">
                <h3 style="color: var(--peach);">${ev.title}</h3>
                <p>${ev.text}</p>
                <div style="margin-top: 15px;">
                    ${choicesHtml}
                </div>
            </div>
        `;
        return; // Verberg de rest tot het event is opgelost
    }

    // 2. Is er een expeditie onderweg?
    if (game.expeditions.active) {
        const type = game.expeditions.types[game.expeditions.currentType];
        const progress = ((type.duration - game.expeditions.timer) / type.duration) * 100;

        container.innerHTML += `
            <div class="panel">
                <h3>${type.name} in uitvoering...</h3>
                <p>Tijd resterend: ${Math.ceil(game.expeditions.timer)}s</p>
                <div style="width: 100%; background: #45475a; height: 15px; border-radius: 5px;">
                    <div style="width: ${progress}%; background: var(--green); height: 100%; border-radius: 5px; transition: width 1s linear;"></div>
                </div>
            </div>
        `;
    } else {
        // 3. Toon lijst met beschikbare missies
        container.innerHTML += '<p><small>Zend je verkenners op pad om grondstoffen, nieuwe volken of geheimen te ontdekken. Kost Intel en Voedsel.</small></p>';
        for (let key in game.expeditions.types) {
            const e = game.expeditions.types[key];
            if (e.stream && typeof isStreamActive === 'function' && !isStreamActive(e.stream)) continue;
            if (!e.requirements()) continue;

            let costTxtHtml = '';
            for (let c in e.cost) {
                const reqAmount = e.cost[c];
                const hasAmount = game.resources[c].amount;
                const resName = game.resources[c].name;
                const isShort = hasAmount < reqAmount;
                costTxtHtml += `<span style="color: ${isShort ? 'var(--red)' : 'var(--green)'};">${reqAmount} ${resName}</span>, `;
            }
            if (costTxtHtml.length > 0) costTxtHtml = costTxtHtml.slice(0, -2);

            const canBuy = canAfford(e.cost);

            container.innerHTML += `
                <div class="panel" style="margin-bottom: 10px;">
                    <strong>${e.name}</strong><br>
                    <small style="color: #a6adc8;">Duur: ${e.duration}s</small><br><br>
                    <button class="tap-btn" style="width: 100%; height: auto; padding: 10px;" onclick="startExpedition('${key}')" ${canBuy ? '' : 'disabled'}>
                        Start Missie (${costTxtHtml})
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
        container.innerHTML += '<p>Je hebt nog geen andere volken ontdekt. Stuur expedities uit in de Verkenning tab.</p>';
        return;
    }

    // De loop begint hier
    for (let key in game.diplomacy.discoveredTribes) {
        const tribe = game.diplomacy.discoveredTribes[key];

        // 1. Bepaal status kleuren en tekst
        let statusColor = "var(--text)";
        let relationText = "Neutraal";
        if (tribe.relation >= 90) { statusColor = "var(--peach)"; relationText = "Bondgenoot"; }
        else if (tribe.relation >= 60) { statusColor = "var(--green)"; relationText = "Vriendelijk"; }
        else if (tribe.relation <= 30) { statusColor = "var(--red)"; relationText = "Vijandig"; }

        // Bepaal alliantie weergave
        const allianceText = tribe.isAllied ? "<span style='color: var(--peach); font-weight: bold;'>[Alliantie Actief]</span>" : "";

        // 2. Bepaal trade specs
        const canTrade = tribe.relation >= 60;

        let costDetails = [];
        if (tribe.tradeCost) {
            for (let cRes in tribe.tradeCost) {
                costDetails.push(`${tribe.tradeCost[cRes]} ${game.resources[cRes].name}/s`);
            }
        }
        const costStr = costDetails.length > 0 ? `(-${costDetails.join(', ')})` : '';
        const btnTradeText = tribe.tradeRouteActive ? "Handel Stoppen" : `Handel Starten ${costStr}`;

        let tradeBonusMult = 1;
        if (game.research.merchant_guild && game.research.merchant_guild.unlocked) tradeBonusMult += 0.20;
        if (game.prestige.upgrades.diplomatic_charm && game.prestige.upgrades.diplomatic_charm.level > 0) {
            tradeBonusMult += (game.prestige.upgrades.diplomatic_charm.level * 0.10);
        }
        let prestigeBoost = 1 + (game.prestige.points * 0.01);

        let tradeDetails = "Handel Focus: ";
        let tradeBonuses = [];
        let allianceBonuses = [];
        if (tribe.tradeYield) {
            for (let res in tribe.tradeYield) {
                let actualYield = tribe.tradeYield[res] * tradeBonusMult * prestigeBoost;
                tradeBonuses.push(`+${actualYield.toFixed(2)} ${game.resources[res].name}/s`);
                allianceBonuses.push(`+${(2 * prestigeBoost).toFixed(2)} ${game.resources[res].name}/s`);
            }
        }
        tradeDetails += tradeBonuses.length > 0 ? tradeBonuses.join(' & ') : "Geen";

        // 3. Knoppen Logica
        const giftAffordable = game.resources.gold.amount >= 100;

        const allianceCost = { gold: 2000, food: 2000 };
        const canAffordAlliance = canAfford(allianceCost);
        const allianceDisabled = tribe.isAllied || tribe.relation < 90 || !canAffordAlliance;
        let allianceBtnText = tribe.isAllied ? "Alliantie Gevormd" : "Vorm Alliantie (2k Goud, 2k Voedsel)";

        // We bouwen de HTML op BINNEN de loop, zodat 'tribe' bekend is
        container.innerHTML += `
            <div class="panel" style="border-left: 4px solid ${statusColor}; margin-bottom: 15px;">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <h3 style="margin: 0;">${tribe.name} ${allianceText}</h3>
                    <span style="color: ${statusColor}; font-weight: bold;">Relatie: ${tribe.relation}/100</span>
                </div>
                <p><em>${tribe.desc}</em></p>

                <!-- Relatie Balk -->
                <div style="width: 100%; background: #45475a; height: 10px; border-radius: 5px; margin-bottom: 12px; overflow: hidden;">
                    <div style="width: ${tribe.relation}%; background: ${statusColor}; height: 100%; transition: width 0.3s ease;"></div>
                </div>

                <!-- Acties (Grid) -->
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 10px;">
                    <button class="tap-btn" style="height: auto; padding: 8px; font-size: 0.85em;" onclick="sendGift('${key}')" ${giftAffordable ? '' : 'disabled'}>
                        Geschenk (100 Goud)<br><span style="color: var(--green);">+5 Relatie</span>
                    </button>
                    <button class="tap-btn" style="height: auto; padding: 8px; font-size: 0.85em;" onclick="demandTribute('${key}')">
                        Eis Tribuut<br><span style="color: var(--red);">-30 Relatie</span>, Directe Buit
                    </button>
                    <button class="tap-btn" style="height: auto; padding: 8px; font-size: 0.85em; grid-column: span 2;" onclick="formAlliance('${key}')" ${allianceDisabled ? 'disabled' : ''}>
                        ${allianceBtnText}<br><span style="color: var(--peach);">Passief: ${allianceBonuses.join(' & ')}</span>
                    </button>
                </div>

                <!-- Handel Sectie -->
                <div style="margin-top: 10px; padding: 12px; background: rgba(0,0,0,0.2); border-radius: 5px; border: 1px solid #45475a;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                        <span style="font-size: 0.9em;"><strong>Handelsroute</strong></span>
                        <span style="font-size: 0.8em; color: ${tribe.tradeRouteActive ? 'var(--green)' : '#a6adc8'};">${tribe.tradeRouteActive ? 'Actief' : 'Inactief'}</span>
                    </div>
                    <p style="font-size: 0.85em; color: #bac2de; margin-top: 0;">Effect: ${tradeDetails}</p>
                    <button class="tap-btn" style="width: 100%; height: auto; padding: 8px; background: ${tribe.tradeRouteActive ? 'var(--red)' : ''}" onclick="toggleTradeRoute('${key}')" ${canTrade || tribe.tradeRouteActive ? '' : 'disabled'}>
                        ${btnTradeText}
                    </button>
                    ${!canTrade && !tribe.tradeRouteActive ? '<p style="color: var(--red); font-size: 0.8em; text-align: center; margin-bottom: 0;">Relatie van minimaal 60 vereist voor handel.</p>' : ''}
                </div>
            </div>
        `;
    }
}
function renderMilitary() {


    const container = document.getElementById('tab-military');
    if (!container) return; // Veiligheidscheck


    recalcMilitary();

    // Deel 1: Header en Kracht Overzicht
    const totalTrained = Object.values(game.military.units).reduce((sum, u) => sum + u.total, 0);
    const availableSoldiers = (game.jobs.soldier.count || 0) - totalTrained;

    container.innerHTML = `<h1>Militair Hoofdkwartier</h1>`;

    container.innerHTML += `
        <div style="display: flex; gap: 8px; margin-bottom: 20px; margin-top: 15px;">
            <div class="panel" style="flex:1; border-left: 4px solid #f38ba8; padding: 10px; text-align: center;">
                <h4 style="margin: 0; font-size: 0.9em; opacity: 0.8;">Aanval</h4>
                <div style="font-size: 1.2em; font-weight: bold; margin-top: 5px; color: var(--peach);">${Math.floor(game.military.attackPower)}</div>
            </div>
            <div class="panel" style="flex:1; border-left: 4px solid #a6e3a1; padding: 10px; text-align: center;">
                <h4 style="margin: 0; font-size: 0.9em; opacity: 0.8;">Verdediging</h4>
                <div style="font-size: 1.2em; font-weight: bold; margin-top: 5px; color: var(--green);">${Math.floor(game.military.defensePower)}</div>
            </div>
            <div class="panel" style="flex:1; border-left: 4px solid var(--accent); padding: 10px; text-align: center;">
                <h4 style="margin: 0; font-size: 0.9em; opacity: 0.8;">Soldaten</h4>
                <div style="font-size: 1.2em; font-weight: bold; margin-top: 5px;">${availableSoldiers}</div>
            </div>
        </div>
    `;

    // Voeg multiplier bar toe onder het dashboard
    container.innerHTML += getBuyAmountBarHtml();

    for (let key in game.military.units) {
        const u = game.military.units[key];
        if (u.unlocked === false) continue; // Sla niet-ontgrendelde units over
        const unassigned = u.total - u.assignedOff - u.assignedDef;
        const assigned = u.assignedOff + u.assignedDef;

        // Bereken hoeveel we maximaal kunnen betalen uitgaande van beschikbare middelen
        let maxAffordableUnits = availableSoldiers;
        for (let c in u.cost) {
            maxAffordableUnits = Math.min(maxAffordableUnits, Math.floor(game.resources[c].amount / u.cost[c]));
        }
        maxAffordableUnits = Math.max(0, maxAffordableUnits);

        // Bepaal hoeveel we willen trainen obv buyAmount
        let requestedAmount = 1;
        if (buyAmount === 10) requestedAmount = 10;
        else if (buyAmount === 100) requestedAmount = 100;
        else if (buyAmount === 'max') requestedAmount = Math.max(1, maxAffordableUnits);

        // Zorg dat het berekenen visueel logisch blijft
        // Als je 10x selecteert, toon je 10x kosten (zodat speler weet wat het kost as is)
        // Maar als 'max' geselecteerd is, cap je het puur op wat er betaalbaar is qua soldaten én grondstoffen
        let visualTrainAmount = requestedAmount;
        if (buyAmount === 'max') {
            visualTrainAmount = Math.max(1, maxAffordableUnits);
        }

        // Bereken kosten string
        let costHtmlText = "";
        let affordable = true;
        for (let c in u.cost) {
            const reqAmount = u.cost[c] * visualTrainAmount;
            const hasAmount = game.resources[c].amount;
            const isShort = hasAmount < reqAmount;
            if (isShort) affordable = false;
            costHtmlText += `<span style="color: ${isShort ? 'var(--red)' : 'var(--green)'};">${reqAmount} ${game.resources[c].name}</span>, `;
        }
        if (costHtmlText.length > 0) costHtmlText = costHtmlText.slice(0, -2);

        // Zonder basis soldaten kun je sowieso niet trainen
        if (availableSoldiers < visualTrainAmount) affordable = false;

        let assignText = '+1';
        if (buyAmount === 10) assignText = '+10';
        else if (buyAmount === 100) assignText = '+100';
        else if (buyAmount === 'max') assignText = 'Max';

        let untrainAmount = 1;
        if (buyAmount === 10) untrainAmount = 10;
        else if (buyAmount === 100) untrainAmount = 100;
        else if (buyAmount === 'max') untrainAmount = unassigned;
        untrainAmount = Math.min(untrainAmount, unassigned);
        const canUntrain = untrainAmount > 0;

        container.innerHTML += `
            <div class="panel" style="margin-bottom: 10px;">
                <div style="display:flex; justify-content:space-between">
                    <strong>${u.name} <small style="color: #a6adc8; font-weight: normal;">(Onderhoud: ${Object.entries(u.maintenance).map(([k, v]) => `${v} ${game.resources[k].name}/s`).join(', ')})</small></strong>
                    <span>Totaal: ${u.total} (Vrij: <span style="color: var(--peach)">${unassigned}</span>)</span>
                </div>
                <small style="color: #a6adc8;">${u.desc} Kracht: ⚔️ ${u.off || u.offMultiplier} / 🛡️ ${u.def || u.defMultiplier}</small>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 10px;">
                    <div style="display: flex; gap: 5px;">
                        <button class="action-btn-small" style="flex: 1;" onclick="assignUnit('${key}', 'off')">⚔️ Aanval: ${u.assignedOff} <small>(${assignText})</small></button>
                        <button class="action-btn-small" style="flex: 0 0 40px; background: var(--surface1);" onclick="assignUnit('${key}', 'unassign_off')" title="Haal eenheden terug">-</button>
                    </div>
                    <div style="display: flex; gap: 5px;">
                        <button class="action-btn-small" style="flex: 1;" onclick="assignUnit('${key}', 'def')">🛡️ Verdediging: ${u.assignedDef} <small>(${assignText})</small></button>
                        <button class="action-btn-small" style="flex: 0 0 40px; background: var(--surface1);" onclick="assignUnit('${key}', 'unassign_def')" title="Haal eenheden terug">-</button>
                    </div>
                </div>
                <div style="display: flex; gap: 10px; margin-top: 10px;">
                    <button class="build-btn" style="flex: 2; background: var(--accent);" onclick="trainUnit('${key}')" ${affordable ? '' : 'disabled'}>
                        Train ${visualTrainAmount}x (Kost: <span style="color: ${availableSoldiers < visualTrainAmount ? 'var(--red)' : 'var(--green)'}">${visualTrainAmount} Basis Soldaten</span>, ${costHtmlText})
                    </button>
                    <button class="build-btn" style="flex: 1; background: var(--surface1);" onclick="untrainUnit('${key}')" ${canUntrain ? '' : 'disabled'}>
                        Ontsla ${untrainAmount}x  <br/><small>(Terug naar Basis)</small>
                    </button>
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

    // De opbouw van de upgrades als nette flex/grid kaarten
    let upgradesHtml = '<div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 15px; margin-top: 15px;">';
    for (let key in game.prestige.upgrades) {
        const upg = game.prestige.upgrades[key];
        const maxedOut = upg.level >= upg.max;
        const canAfford = game.prestige.points >= upg.cost && !maxedOut;

        upgradesHtml += `
            <div class="panel" style="display: flex; flex-direction: column; justify-content: space-between; border-color: ${maxedOut ? 'var(--green)' : 'var(--surface2)'};">
                <div>
                    <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 10px;">
                        <strong style="color: ${maxedOut ? 'var(--green)' : 'inherit'};">${upg.name}</strong>
                        <span class="badge" style="background: var(--surface1); color: var(--text); padding: 2px 6px; border-radius: 4px; font-size: 0.8em;">Lvl ${upg.level}/${upg.max}</span>
                    </div>
                    <p style="font-size: 0.85em; color: var(--subtext); margin-bottom: 15px;">${upg.desc}</p>
                </div>
                <button class="build-btn" style="background: ${maxedOut ? 'var(--surface1)' : 'var(--peach)'}; width: 100%; border: none;" onclick="buyPrestigeUpgrade('${key}')" ${canAfford ? '' : 'disabled'}>
                    ${maxedOut ? 'MAX LEVEL' : `Koop (-${upg.cost} Pnt)`}
                </button>
            </div>
        `;
    }
    upgradesHtml += '</div>';

    const achievementsMeta = {
        first_steps: { icon: '👣', name: 'Eerste Stappen', desc: 'Bereik 100 Totale Bevolking.' },
        flint_monument: { icon: '🗿', name: 'Steentijd Voltooid', desc: 'Bouw het Vuursteen Monument.' },
        iron_discovery: { icon: '⛏️', name: 'Meester Verzamelaar', desc: 'Verzamel 10k Hout en 10k Steen.' }
    };

    let canEvolve = true;
    let btnTitle = "";
    let btnText = "🌟 Evolueer Nu";
    let warningHtml = "";

    if (!game.era || game.era === 1) {
        canEvolve = (game.buildings.flint_monument && game.buildings.flint_monument.count >= 1) && game.resources.population.amount >= 50;
        btnTitle = canEvolve ? "Evolueer naar Tijdperk 2" : "Bouw het Vuursteen Monument en bereik 50 Bevolking.";
        btnText = "🌟 Evolueer naar Tijdperk 2";
        warningHtml = canEvolve ? "" : `<div style="text-align: center; margin-top: 10px; font-size: 0.8em; color: var(--red);">Vereist voor Tijdperk 2: Voltooi het Vuursteen Monument & Bereik 50 Bevolking.</div>`;
    } else {
        canEvolve = game.resources.population.amount >= 100;
        btnTitle = canEvolve ? "Start een nieuw tijdperk" : "Minstens 100 Bevolking vereist.";
        warningHtml = canEvolve ? "" : `<div style="text-align: center; margin-top: 10px; font-size: 0.8em; color: var(--red);">Je hebt 100 Totale Bevolking nodig om te evolueren.</div>`;
    }

    let achievementsHtml = `
        <h3 style="margin-top: 20px; margin-bottom: 5px;">🏆 Behaalde Prestaties</h3>
        <p style="font-size: 0.85em; color: var(--subtext); margin-bottom: 15px;">Deze achievements geven aan hoever je rijk gekomen is en gaan niet verloren bij een evolutie.</p>
        <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 10px;">
    `;

    if (game.achievements) {
        for (let aKey in game.achievements) {
            if (game.achievements[aKey]) {
                const meta = achievementsMeta[aKey];
                if (meta) {
                    achievementsHtml += `
                        <div class="panel" style="display: flex; align-items: center; gap: 15px; border-left: 4px solid var(--green); padding: 10px;">
                            <div style="font-size: 2em;">${meta.icon}</div>
                            <div>
                                <strong style="color: var(--green); display: block;">${meta.name}</strong>
                                <small style="color: var(--subtext);">${meta.desc}</small>
                            </div>
                        </div>
                    `;
                }
            }
        }
    }

    // Check of we in era 1 zitten
    if (!game.era || game.era === 1) {
        const b = game.buildings.flint_monument;
        if (!b || b.count === 0) {
            // Nog niet gebouwd: laat bouwknop zien
            let displayCost = getCost(b);
            let affordable = canAfford(displayCost);

            let costTxtHtml = '';
            for (let r in displayCost) {
                const reqAmount = displayCost[r];
                const hasAmount = game.resources[r].amount;
                const isShort = hasAmount < reqAmount;
                costTxtHtml += `<span style="color: ${isShort ? 'var(--red)' : 'var(--green)'};">${reqAmount} ${game.resources[r].name}</span>, `;
            }
            if (costTxtHtml.length > 0) costTxtHtml = costTxtHtml.slice(0, -2);

            achievementsHtml += `
                <div class="panel" style="grid-column: 1 / -1; border-left: 5px solid var(--peach); margin-top: 20px;">
                    <h3 style="margin-top: 0; color: var(--peach);">🗿 ${b.name}</h3>
                    <p style="font-size: 0.9em; color: var(--subtext);">${b.desc} (Nodig om te Evolueren)</p>
                    <button class="tap-btn" style="width: 100%; height: 50px;" onclick="buyBuilding('flint_monument')" ${affordable ? '' : 'disabled'}>
                        Bouw (${costTxtHtml})
                    </button>
                </div>
            `;
        } else if (b.count >= 1 && (!game.achievements || !game.achievements.flint_monument)) {
            // Wel gebouwd, maar nog niet geëvolueerd
            achievementsHtml = `
                <div class="panel" style="border-left: 5px solid var(--green); margin-bottom: 20px; background: rgba(166, 227, 161, 0.05);">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <h3 style="margin: 0; color: var(--green);">🗿 ${b.name}</h3>
                        <span class="badge" style="background: var(--green); color: var(--bg); padding: 5px 10px; border-radius: 20px; font-weight: bold;">✅ Gebouwd</span>
                    </div>
                    <p style="font-size: 0.9em; color: var(--subtext);">Je hebt het Vuursteen Monument opgericht! Zorg nu dat je 50 Bevolking hebt om het tijdperk af te sluiten.</p>
                </div>
            ` + achievementsHtml;
        }
    }

    achievementsHtml += '</div>';

    container.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 20px;">
            <h1>Evolutie & Prestige</h1>
            <div style="text-align: right;">
                <h3 style="margin: 0; color: var(--peach);">Huidige Prestige Punten: ${game.prestige.points}</h3>
                <small style="color: var(--subtext);">Onbestede punten geven een <strong>+${boost}%</strong> bonus op alle productie en verkenningen.</small>
            </div>
        </div>

        <div style="display: flex; flex-direction: column; gap: 20px;">
            
            <!-- Reset info en dashboard -->
            <div class="panel" style="background: rgba(243, 139, 168, 0.05); border-left: 5px solid var(--red);">
                <h3 style="color: var(--red); margin-top: 0;">⚠️ Wat gebeurt er bij een Evolutie?</h3>
                <ul style="font-size: 0.85em; color: var(--subtext); margin: 0; padding-left: 20px;">
                    <li><strong>Vernietigd:</strong> Je grondstoffen, bevolking, gebouwen, onderzoeken en leger.</li>
                    <li><strong>Behouden:</strong> Je ontdekte/veroverde stammen (Diplomatie), <strong>Prestige Punten</strong> en <strong>Verworven Upgrades</strong>.</li>
                    <li><strong>Beloning:</strong> Je claimt de verdiende Prestige Punten hieronder.</li>
                </ul>
            </div>

            <div class="panel" style="background: linear-gradient(135deg, rgba(203, 166, 247, 0.1), transparent); border-color: var(--mauve);">
                <h3 style="margin-top: 0; color: var(--mauve);">Verwachte Opbrengst: <span style="font-size: 1.5em; vertical-align: middle;">${breakdown.total}</span> Punten</h3>
                <div style="background: var(--surface0); border-radius: 8px; padding: 10px; margin-bottom: 15px;">
                    ${breakdown.details}
                </div>
                
                <button class="build-btn" style="width: 100%; height: 60px; font-size: 1.2em; background: var(--mauve); border: none; box-shadow: 0 4px 15px rgba(203, 166, 247, 0.4);" 
                        onclick="if(confirm('Weet je zeker dat je wilt evolueren naar een nieuw tijdperk? Je begint helemaal opnieuw!')) performPrestige()" 
                        ${canEvolve ? '' : 'disabled'}
                        title="${btnTitle}">
                    ${btnText}
                </button>
                ${warningHtml}
            </div>

            <hr style="border: 0; border-top: 1px solid var(--surface2); width: 100%; margin: 10px 0;">

            <!-- Upgrades -->
            <div>
                <h3 style="margin-top: 0; margin-bottom: 5px;">Permanente Upgrades</h3>
                <small style="color: var(--subtext);">Besteed hier je prestige punten. Let op: punten die je uitgeeft geven hun passieve (+1%) productiebonus op!</small>
                ${upgradesHtml}
            </div>

            ${achievementsHtml}

        </div>
    `;
}

function renderSettings() {
    const container = document.getElementById('tab-settings');
    if (!container) return;

    let manualIsOn = true;
    if (game && game.settings && typeof game.settings.showManualActions !== 'undefined') {
        manualIsOn = game.settings.showManualActions;
    }

    container.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 20px;">
            <h1>Instellingen</h1>
            <small style="color: var(--subtext);">Spelbeheer & Opties</small>
        </div>

        <div style="display: flex; flex-direction: column; gap: 20px;">

            <!-- Weergave Opties -->
            <div class="panel">
                <h3 style="margin-top: 0; color: var(--accent); display: flex; align-items: center; gap: 8px;">
                    👁️ Zichtbaarheid & Weergave
                </h3>
                <div style="display: flex; justify-content: space-between; align-items: center; background: rgba(255,255,255,0.05); padding: 10px 15px; border-radius: 8px;">
                    <div>
                        <strong>Handmatige Acties (Stad)</strong><br>
                        <small style="opacity: 0.7;">Verberg de knoppen om handmatig Hout/Voedsel/Steen te verzamelen.</small>
                    </div>
                    <label class="toggle-switch">
                        <input type="checkbox" id="toggle-manual" ${manualIsOn ? 'checked' : ''} onchange="toggleManualActions(this.checked)">
                        <span class="slider"></span>
                    </label>
                </div>
            </div>

            <!-- Topbar Weergave (Nieuw in Fase 3) -->
            <div class="panel">
                <h3 style="margin-top: 0; color: var(--accent); display: flex; align-items: center; gap: 8px;">
                    👁️ Top Bar Weergave
                </h3>
                <p style="font-size: 0.85em; color: var(--subtext); margin-bottom: 15px;">Kies welke grondstoffen je zichtbaar wilt hebben in de horizontale lijst bovenaan het scherm.</p>
                <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(120px, 1fr)); gap: 10px;" id="settings-resource-toggles">
                    <!-- Wordt dynamisch ingevuld -->
                </div>
            </div>

            <!-- Data Beheer -->
            <div class="panel" style="border-left: 3px solid var(--blue);">
                <h3 style="margin-top: 0; color: var(--blue);">💾 Data Beheer (Save & Load)</h3>
                <p style="font-size: 0.85em; color: var(--subtext); margin-bottom: 15px;">De game slaat automatisch op. Je kunt hier een backup maken of je voortgang naar een ander apparaat verplaatsen.</p>

                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 10px;">
                    <button class="build-btn" style="background: var(--surface2); color: var(--text); border: none;" onclick="saveGame(); alert('✅ Spel handmatig opgeslagen!');">
                        💾 Nu Opslaan
                    </button>
                    <button class="build-btn" style="background: var(--surface2); color: var(--text); border: none;" onclick="exportGame()">
                        📤 Exporteer Save
                    </button>
                    <button class="build-btn" style="background: var(--surface2); color: var(--text); border: none;" onclick="importGame()">
                        📥 Importeer Save
                    </button>
                </div>
            </div>

            <hr style="border: 0; border-top: 1px dashed var(--surface2); width: 100%; margin: 10px 0;">

            <!-- Gevaarzone -->
            <div class="panel" style="background: rgba(243, 139, 168, 0.05); border: 2px solid var(--red);">
                <h3 style="margin-top: 0; color: var(--red);">🧨 Gevaarzone</h3>
                <p style="font-size: 0.85em; color: var(--subtext); margin-bottom: 15px;">
                    <strong>Waarschuwing:</strong> Een harde reset wist de volledige save-file, INCLUSIEF je Prestige Punten en stammen. Je begint letterlijk vanaf het moment dat je de site voor het eerst bezocht. Dit kan niet ongedaan worden gemaakt.
                </p>

                <button class="build-btn" style="background: var(--red); border: none; width: 100%;" onclick="hardReset()">
                    ⚠️ VOLLEDIGE RESET UITVOEREN
                </button>
            </div>

        </div>
    `;

    // Vul de resource toggles dynamisch
    const togglesContainer = document.getElementById('settings-resource-toggles');
    if (togglesContainer) {
        if (!game.settings) game.settings = {};
        if (!game.settings.hiddenResources) game.settings.hiddenResources = [];

        const iconMap = {
            wood: '🌲', stone: '🪨', food: '🍞', gold: '💰',
            researchPoints: '🧪', intel: '👁️', beam: '🪵', brick: '🧱'
        };

        for (let key in game.resources) {
            if (key === 'population' || key === 'scouts') continue;

            // Tijdperk 1 restricties voor toggles
            if ((!game.era || game.era === 1) && ['gold', 'intel', 'researchPoints', 'beam', 'brick'].includes(key)) continue;

            const res = game.resources[key];

            if (res.unlocked || res.amount > 0) {
                const isHidden = game.settings.hiddenResources.includes(key);
                let icon = iconMap[key] || "📦";
                if (res.icon) icon = res.icon;
                const resName = res.name || key.charAt(0).toUpperCase() + key.slice(1);

                togglesContainer.innerHTML += `
            <label style="display: flex; align-items: center; gap: 5px; cursor: pointer; font-size: 0.9em; background: rgba(0,0,0,0.2); padding: 5px; border-radius: 4px;">
                <input type="checkbox" ${!isHidden ? 'checked' : ''} onchange="toggleResourceVisibility('${key}', this.checked)">
                ${icon} ${resName}
            </label>
        `;
            }
        }

        // Handmatig Bevolking en Leger toevoegen aan de lijst
        const popHidden = game.settings.hiddenResources.includes('population');
        const milHidden = game.settings.hiddenResources.includes('military');

        togglesContainer.innerHTML = `
            <label style="display: flex; align-items: center; gap: 5px; cursor: pointer; font-size: 0.9em; background: rgba(0,0,0,0.2); padding: 5px; border-radius: 4px;">
                <input type="checkbox" ${!popHidden ? 'checked' : ''} onchange="toggleResourceVisibility('population', this.checked)">
                👥 Bevolking
            </label>
            <label style="display: flex; align-items: center; gap: 5px; cursor: pointer; font-size: 0.9em; background: rgba(0,0,0,0.2); padding: 5px; border-radius: 4px;">
                <input type="checkbox" ${!milHidden ? 'checked' : ''} onchange="toggleResourceVisibility('military', this.checked)">
                ⚔️ Leger
            </label>
        ` + togglesContainer.innerHTML;
    }
}

function toggleManualActions(isChecked) {
    if (!game.settings) game.settings = { showManualActions: true, hiddenResources: [] };
    game.settings.showManualActions = isChecked;

    // Direct apply to the manual actions panel in tab 'Stad'
    const manualPanel = document.getElementById('manual-actions-panel');
    if (manualPanel) {
        manualPanel.style.display = isChecked ? 'block' : 'none';
    }
}

function toggleResourceVisibility(resKey, isVisible) {
    if (!game.settings) game.settings = { showManualActions: true, hiddenResources: [] };
    if (!game.settings.hiddenResources) game.settings.hiddenResources = [];

    if (isVisible) {
        // Verwijder uit verborgen lijst
        game.settings.hiddenResources = game.settings.hiddenResources.filter(item => item !== resKey);
    } else {
        // Voeg toe aan verborgen lijst als ie er nog niet in staat
        if (!game.settings.hiddenResources.includes(resKey)) {
            game.settings.hiddenResources.push(resKey);
        }
    }
    updateUI(); // Herteken direct de topbar
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
        alert(`Je hebt de gezant van ${tribe.name} beledigd.De relatie is nu ${tribe.relation}.`);
    } else if (action === 'provoke') {
        tribe.relation = Math.max(0, tribe.relation - 25);
        alert(`Je hebt je leger laten paraderen langs de grens van ${tribe.name}. Ze zijn woedend!`);
    }

    // Direct de UI updaten om de nieuwe knoppen in de Leger tab te activeren als relatie < 30
    updateUI();
}

// --- FASE 3: SWIPEBARE NAVIGATIE LOGICA ---

// Definitie van de 4 hoofd-categoriën en hun sub-tabs
const tabCategories = {
    management: [
        { id: 'jobs', icon: '🏠', label: 'Stad' },
        { id: 'resources', icon: '📊', label: 'Voorraad' },
        { id: 'population', icon: '👥', label: 'Bevolking' }
    ],
    world: [
        { id: 'explore', icon: '🧭', label: 'Verkennen' },
        { id: 'diplomacy', icon: '🤝', label: 'Diplomatie' },
        { id: 'military', icon: '⚔️', label: 'Leger' }
    ],
    progress: [
        { id: 'research', icon: '🧪', label: 'Onderzoek' },
        { id: 'prestige', icon: '✨', label: 'Tijdperken' }
    ],
    menu: [
        { id: 'settings', icon: '⚙️', label: 'Settings' }
    ]
};

// Een array van alle mogelijke tab ID's op volgorde om swipen naadloos te maken
const swipeOrder = [
    'jobs', 'resources', 'population',
    'explore', 'diplomacy', 'military',
    'research', 'prestige',
    'settings'
];

window.currentCategory = 'management';

const mainCategoryIcons = {
    management: '🏗️',
    world: '🌍',
    progress: '✨',
    menu: '⚙️'
};
const categoryOrder = ['management', 'world', 'progress', 'menu'];

window.selectCategory = function (catKey, forceRebuild = false) {
    window.currentCategory = catKey;
    const container = document.getElementById('unified-nav-container');
    if (!container) return;

    // Check if we need to build the DOM
    if (forceRebuild || container.children.length === 0) {
        let html = '';
        for (let c of categoryOrder) {
            html += `<button class="nav-main-icon" id="nav-main-${c}" onclick="selectCategory('${c}')" title="${c}">${mainCategoryIcons[c]}</button>`;

            html += `<div class="sub-nav-group" id="sub-nav-group-${c}">`;
            const tabs = tabCategories[c];
            tabs.forEach(tab => {
                if ((!game.era || game.era === 1) && ['research', 'diplomacy', 'explore', 'military'].includes(tab.id)) return;
                html += `<button class="nav-sub-btn" id="sub-nav-${tab.id}" onclick="showTab('${tab.id}')"><span>${tab.icon}</span> <span>${tab.label}</span></button>`;
            });
            html += `</div>`;
        }
        container.innerHTML = html;
    }

    // Now toggle classes for expansion
    for (let c of categoryOrder) {
        const mainIcon = document.getElementById(`nav-main-${c}`);
        const subGroup = document.getElementById(`sub-nav-group-${c}`);

        if (mainIcon) {
            if (c === catKey) mainIcon.classList.add('active');
            else mainIcon.classList.remove('active');
        }

        if (subGroup) {
            if (c === catKey) subGroup.classList.add('expanded');
            else subGroup.classList.remove('expanded');
        }
    }

    const tabs = tabCategories[catKey];
    const isActiveInCat = tabs.some(t => t.id === window.currentTab);

    if (!isActiveInCat && tabs.length > 0) {
        const validTabs = tabs.filter(tab => !((!game.era || game.era === 1) && ['research', 'diplomacy', 'explore', 'military'].includes(tab.id)));
        if (validTabs.length > 0) {
            showTab(validTabs[0].id);
        }
    } else {
        highlightSubNavButton(window.currentTab);
    }
}

// Helper functie om de actieve stijl op sub-nav tabs te zetten
window.highlightSubNavButton = function (tabId) {
    document.querySelectorAll('.nav-sub-btn').forEach(btn => btn.classList.remove('active'));
    let activeBtn = document.getElementById('sub-nav-' + tabId);
    if (activeBtn) {
        activeBtn.classList.add('active');
        activeBtn.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
}

// Swipe Herkenning Logica (Touch events)
let touchStartX = 0;
let touchEndX = 0;

function handleSwipe() {
    const minSwipeDistance = 50; // minimale pixels voor een swipe
    const swipeDistance = touchEndX - touchStartX;

    // Als de afstand te klein is, doe niets
    if (Math.abs(swipeDistance) < minSwipeDistance) return;

    if (swipeDistance < 0) {
        changeTabDirection(1); // Naar rechts (volgende)
    } else if (swipeDistance > 0) {
        changeTabDirection(-1); // Naar links (vorige)
    }
}

function changeTabDirection(direction) {
    const currentIndex = swipeOrder.indexOf(window.currentTab);
    if (currentIndex === -1) return;

    let targetIndex = currentIndex;
    let foundValid = false;

    while (!foundValid) {
        targetIndex += direction;

        if (targetIndex < 0 || targetIndex >= swipeOrder.length) break;

        const nextTabId = swipeOrder[targetIndex];

        // Check Tijdperk 1 restricties
        if ((!game.era || game.era === 1) && ['research', 'diplomacy', 'explore', 'military'].includes(nextTabId)) {
            continue; // Sla over en probeer de volgende
        }

        foundValid = true;
    }

    if (foundValid && targetIndex !== currentIndex) {
        const nextTabId = swipeOrder[targetIndex];

        // Bepaal in welke categorie de volgende tab zit en activeer deze indien nodig
        let targetCategory = '';
        for (let cat in tabCategories) {
            if (tabCategories[cat].some(t => t.id === nextTabId)) {
                targetCategory = cat;
                break;
            }
        }

        if (targetCategory && targetCategory !== window.currentCategory) {
            selectCategory(targetCategory);
            showTab(nextTabId); // Geforceerd, overschrijft de categorie-default
        } else {
            showTab(nextTabId);
        }
    }
}

// Global Touch & Mouse listeners
function initSwipeListeners() {
    const swipeArea = document.getElementById('tab-content');
    if (!swipeArea) return;

    // --- Touch (Mobiel) ---
    swipeArea.addEventListener('touchstart', e => {
        touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    swipeArea.addEventListener('touchend', e => {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
    }, { passive: true });

    // --- Mouse Drag (Desktop/Laptop) ---
    let isMouseDown = false;
    swipeArea.addEventListener('mousedown', e => {
        isMouseDown = true;
        touchStartX = e.screenX;
    });

    // Voorkom dat de tekst wordt geselecteerd tijdens drag
    swipeArea.addEventListener('mousemove', e => {
        if (isMouseDown) e.preventDefault();
    });

    swipeArea.addEventListener('mouseup', e => {
        if (!isMouseDown) return;
        isMouseDown = false;
        touchEndX = e.screenX;
        handleSwipe();
    });

    // Annuleer swipe als muis buiten het vlak gaat
    swipeArea.addEventListener('mouseleave', e => {
        isMouseDown = false;
    });
}

// Setup via event listener
document.addEventListener("DOMContentLoaded", () => {
    initSwipeListeners();
    // Desktop "Muiswiel" scroll ondersteuning toevoegen voor sub-nav
    const subNav = document.getElementById('sub-nav-container');
    if (subNav) {
        subNav.addEventListener('wheel', (e) => {
            if (e.deltaY !== 0) {
                subNav.scrollLeft += e.deltaY;
                e.preventDefault(); // Voorkom dat de hele pagina scrolt
            }
        });
    }
});

// --- Floating Notifications ---
function showNotification(message, type = 'info') {
    let container = document.getElementById('notification-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'notification-container';
        document.body.appendChild(container);
    }
    const notif = document.createElement('div');
    notif.className = 'notification';
    notif.innerHTML = message;

    if (type === 'error') notif.style.borderLeftColor = 'var(--red)';
    else if (type === 'success') notif.style.borderLeftColor = 'var(--green)';
    else if (type === 'warning') notif.style.borderLeftColor = 'var(--yellow)';

    container.appendChild(notif);
    setTimeout(() => {
        notif.style.opacity = '0';
        notif.style.transform = 'translateX(100%)';
        notif.style.transition = 'all 0.3s ease';
        setTimeout(() => notif.remove(), 300);
    }, 3000);
}

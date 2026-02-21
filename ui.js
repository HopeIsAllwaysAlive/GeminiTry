// --- UI RENDERING ---
function updateUI() {
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

        // Diplomatie
        let diploIn = 0;
        for (let tKey in game.diplomacy.discoveredTribes) {
            const tribe = game.diplomacy.discoveredTribes[tKey];
            if (tribe.tradeRouteActive && tribe.resources.wood) diploIn += tribe.resources.wood;
        }
        addRow("Handelsroutes", diploIn, true);

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
        if (miners > 0 && game.prestige.points > 0) {
            const pBonus = miners * (prestigeBoost - 1);
            addRow(`↳ Prestige Bonus`, `(x${prestigeBoost.toFixed(2)}) +${pBonus.toFixed(2)}/s`, true, true);
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
    else if (key === 'gold') {
        const bankers = game.jobs.banker.effect.gold * game.jobs.banker.count;
        addRow("Productie (Bankiers)", bankers, true);

        const tax = (game.resources.population.amount * (1 / 60));
        addRow("Belastingen (Van Bevolking)", tax, true);

        if ((bankers > 0 || tax > 0) && game.prestige.points > 0) {
            const pBonus = (bankers + tax) * (prestigeBoost - 1);
            addRow(`↳ Prestige Bonus`, `(x${prestigeBoost.toFixed(2)}) +${pBonus.toFixed(2)}/s`, true, true);
        }

        // Tribuut
        let tribute = 0;
        for (let tKey in game.diplomacy.discoveredTribes) {
            const tribe = game.diplomacy.discoveredTribes[tKey];
            if (tribe.isConquered) tribute += tribe.tributeAmount || 5;
        }
        addRow("Tribuut (Overwonnen Stammen)", tribute, true);

        // Trade route costs
        let tradeCost = 0;
        for (let tKey in game.diplomacy.discoveredTribes) {
            if (game.diplomacy.discoveredTribes[tKey].tradeRouteActive) tradeCost += 0.5;
        }
        addRow("Onderhoud (Handelsroutes)", -tradeCost, false);

        const soldierGold = getSoldierMaintenance().gold;
        addRow("Consumptie (Leger Onderhoud)", -soldierGold, false);
    }

    html += `</table>`;

    if (html.indexOf("<tr>") === -1) {
        html = '<div style="color: #a6adc8; padding-bottom: 5px;">Geen actieve wijzigingen in productie.</div>';
    }
    return html;
}
function renderBuildings() {
    const container = document.getElementById('building-list');
    container.innerHTML = `
        <div class="buy-amount-bar">
            <button class="${buyAmount === 1 ? 'active' : ''}" onclick="setBuyAmount(1)">1</button>
            <button class="${buyAmount === 10 ? 'active' : ''}" onclick="setBuyAmount(10)">10</button>
            <button class="${buyAmount === 100 ? 'active' : ''}" onclick="setBuyAmount(100)">100</button>
            <button class="${buyAmount === 'max' ? 'active' : ''}" onclick="setBuyAmount('max')">MAX</button>
        </div>
    `;
    for (let key in game.buildings) {
        const b = game.buildings[key];
        if (!b.unlocked) continue;

        let displayCost = {};
        let actualAmount = 0;
        let affordable = false;

        if (buyAmount === 'max') {
            for (let i = 0; i < Infinity; i++) {
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
                        // Still show the cost of 1 if they can afford 0
                        displayCost = cost;
                    }
                    break;
                }
            }
            affordable = actualAmount > 0;
        } else {
            for (let i = 0; i < buyAmount; i++) {
                b.count += 1;
                const cost = getCost(b);
                b.count -= 1;

                for (let res in cost) {
                    displayCost[res] = (displayCost[res] || 0) + cost[res];
                }
            }
            actualAmount = buyAmount;
            affordable = canAfford(displayCost);
        }

        let costTxt = [];
        for (let r in displayCost) costTxt.push(`${displayCost[r]} ${game.resources[r].name}`);

        let label = buyAmount === 'max' ? `MAX (${actualAmount})` : buyAmount;
        let costDisplay = costTxt.join(', ');

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

        // Bepaal hoeveel werkers we toevoegen of verwijderen met één druk
        const availableWorkers = getIdlePopulation();
        const fillableJobs = job.max - job.count;
        const maxAddable = Math.min(availableWorkers, fillableJobs);
        let currentBuyAmountAdd = buyAmount === 'max' ? Math.max(1, maxAddable) : buyAmount;
        let currentBuyAmountRem = buyAmount === 'max' ? job.count : buyAmount;

        const canHire = getIdlePopulation() >= currentBuyAmountAdd && job.count + currentBuyAmountAdd <= job.max;
        const canFire = job.count >= currentBuyAmountRem;

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
                    <button class="step-btn" onclick="assignJob('${key}', -${currentBuyAmountRem})" style="background: var(--red); white-space: nowrap; min-width: 60px;" ${canFire ? '' : 'disabled'}>
                        <span style="font-size: 0.7em; display:block;">-${displayAmountRem}</span>
                    </button>
                    
                    <div style="text-align: center; flex: 1;">
                        <div style="font-weight: bold;">${job.name}</div>
                        <div style="font-size: 1.2em;">
                            <span class="big-num">${job.count}</span> / <small>${job.max}</small>
                        </div>
                        <div style="font-size: 0.7em; color: #a6adc8;">${effectDisplay}</div>
                    </div>

                    <button class="step-btn" onclick="assignJob('${key}', ${currentBuyAmountAdd})" style="background: var(--green); white-space: nowrap; min-width: 60px;" ${canHire ? '' : 'disabled'}>
                        <span style="font-size: 0.7em; display:block;">+${displayAmountAdd}</span>
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
    //   container.innerHTML += `< p > Scouts count: ${ game.jobs.scout_job.count } resources: ${ game.resources.scouts.amount }</p > `;
    if (game.expeditions.active) {
        // Toon voortgangsbalk van huidige missie
        const type = game.expeditions.types[game.expeditions.currentType];
        const progress = ((type.duration - game.expeditions.timer) / type.duration) * 100;

        container.innerHTML += `
        < div class="panel" >
                <h3>${type.name} in uitvoering...</h3>
                <p>Tijd resterend: ${game.expeditions.timer}s</p>
                <div style="width: 100%; background: #45475a; height: 15px; border-radius: 5px;">
                    <div style="width: ${progress}%; background: #a6e3a1; height: 100%; border-radius: 5px; transition: width 1s linear;"></div>
                </div>
            </div >
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


        const canTrainUnit = getIdlePopulation() >= 1 && canAfford(u.cost);

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
                        <button class="build-btn" style="background: var(--accent)" onclick="trainUnit('${key}')" ${canTrainUnit ? '' : 'disabled'}>
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

    container.innerHTML = `
                    <h1>Prestige</h1>
                    <div class="panel" style="background: linear-gradient(45deg, #d6e2c8, #313244); border: 1px solid #d6e2c8;">
                        <h3>Huidige Prestige Punten: <span style="color:#d6e2c8">${game.prestige.points}</span></h3>
                        <p>Onbestede punten geven een <strong>+${boost}%</strong> bonus op resource productie en verkenning snelheid.</p>
                        ${renderPrestigeDashboard()}
                        <hr>

                    </div>

                    <div class="panel" style="background: linear-gradient(45deg, #d6e2c8, #313244); border: 1px solid #d6e2c8;">
                        <h4>Verwachte opbrengst: ${breakdown.total} punten</h4>
                        ${breakdown.details}
                        <p></p>
                        <button class="tap-btn" style="width: 100%; height: 50px; background: linear-gradient(45deg, #d6e2c8, #313244); border: 1px solid #d6e2c8;" onclick="performPrestige()" ${game.resources.population.amount >= 100 ? '' : 'disabled'}>
                            Prestige
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
                                <button class="action-btn-small" style="width: 100%; height: 50px; background: linear-gradient(45deg, #d6e2c8, #313244); border: 1px solid #d6e2c8;" onclick="buyPrestigeUpgrade('${key}')" ${game.prestige.points >= upg.cost && upg.level < upg.max ? '' : 'disabled'}>
                                    Koop (${upg.cost} Punten)
                                </button>
                            </div>
                            `;
    }
    //remove glow-active class van prestige button als we op het prestige tabblad zijn
    //   const prestigeBtn = document.getElementById('nav-btn-prestige');
    //  prestigeBtn.classList.remove('glow-active');
    //remove glow-active class van prestige button als we op het prestige tabblad zijn
    //   const prestigeBtn = document.getElementById('nav-btn-prestige');
    //  prestigeBtn.classList.remove('glow-active');
}

function renderSettings() {
    const container = document.getElementById('tab-settings');
    if (!container) return;

    let manualIsOn = true;
    if (game && game.settings && typeof game.settings.showManualActions !== 'undefined') {
        manualIsOn = game.settings.showManualActions;
    }

    container.innerHTML = `
    <h1>Instellingen</h1>

    <div class="panel" style="margin-top: 30px; border-top: 2px solid #a6e3a1;">
        <h3>Zichtbaarheid</h3>
        <div style="display: flex; justify-content: space-between; align-items: center;">
            <span>Toon Handmatige Acties (Stad)</span>
            <label class="toggle-switch">
                <input type="checkbox" id="toggle-manual" ${manualIsOn ? 'checked' : ''} onchange="toggleManualActions(this.checked)">
                <span class="slider"></span>
            </label>
        </div>
    </div>

    <div class="panel" style="margin-top: 30px; border-top: 2px solid #f38ba8;">
        <h3>Systeembeheer</h3>
        <div style="display: flex; gap: 10px; flex-wrap: wrap;">
            <button class="tap-btn" onclick="saveGame()">💾 Save</button>
            <button class="tap-btn" onclick="exportGame()">💾 Export Save</button>
            <button class="tap-btn" onclick="importGame()">📂 Import Save</button>
            <button class="tap-btn" style="background: #f38ba8; color: #11111b;" onclick="hardReset()">🧨 Harde Reset</button>
        </div>
    </div>
    `;
}

function toggleManualActions(isChecked) {
    if (!game.settings) game.settings = { showManualActions: true };
    game.settings.showManualActions = isChecked;

    // Direct apply to the manual actions panel in tab 'Stad'
    const manualPanel = document.getElementById('manual-actions-panel');
    if (manualPanel) {
        manualPanel.style.display = isChecked ? 'block' : 'none';
    }
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


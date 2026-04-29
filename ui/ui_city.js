// --- UI CITY TAB ---

window.currentCitySubTab = 'manual_actions'; // 'manual_actions' or 'buildings'
window.currentBuildingFilter = 'all';

function renderCity() {
    const container = document.getElementById('tab-jobs');
    if (!container) return;

    let html = `
        <div class="sub-nav" style="margin-bottom: 20px; display: flex; gap: 10px; border-bottom: 1px solid #333; padding-bottom: 10px;">
            <button class="btn ${window.currentCitySubTab === 'manual_actions' ? 'active' : ''}" onclick="showCitySubTab('manual_actions')">Handmatige Acties</button>
            <button class="btn ${window.currentCitySubTab === 'buildings' ? 'active' : ''}" onclick="showCitySubTab('buildings')">Gebouwen</button>
        </div>
    `;

    if (window.currentCitySubTab === 'manual_actions') {
        html += renderManualActions();
    } else {
        html += renderBuildingsWithFilters();
    }

    container.innerHTML = html;
}

window.showCitySubTab = function(subId) {
    window.currentCitySubTab = subId;
    renderCity();
};

window.setBuildingFilter = function(filter) {
    window.currentBuildingFilter = filter;
    renderCity();
};

function renderManualActions() {
    let html = '<h2>Handmatige Acties</h2><div class="panel">';
    html += '<button class="btn" onclick="gatherFood()">Verzamel Voedsel</button>';
    
    const canCraftWood = game.resources.food.amount >= 10 || game.resources.wood.discovered;
    const hasWood = game.resources.wood.discovered || game.resources.wood.amount > 0;
    const hasStone = game.resources.stone.discovered || game.resources.stone.amount > 0;
    
    if (canCraftWood || hasWood || hasStone) {
        html += '<h3 style="margin-top:20px;">Vervaardigen</h3>';
        if (canCraftWood) html += '<button class="btn" onclick="craft(\'wood\', 1)">Vervaardig Hout (10 Voedsel)</button> ';
        if (hasWood) html += '<button class="btn" onclick="craft(\'beam\', 1)">Vervaardig Balk (100 Hout)</button> ';
        if (hasStone) html += '<button class="btn" onclick="craft(\'brick\', 1)">Vervaardig Baksteen (100 Steen)</button> ';
    }
    
    html += '</div>';
    return html;
}

function renderBuildingsWithFilters() {
    let html = '<h2>Gebouwen</h2>';
    
    // Filters
    html += `
        <div style="margin-bottom: 15px; display: flex; flex-wrap: wrap; gap: 5px;">
            <button class="btn ${window.currentBuildingFilter === 'all' ? 'active' : ''}" onclick="setBuildingFilter('all')" style="font-size: 0.8em; padding: 2px 8px;">Alles</button>
            <button class="btn ${window.currentBuildingFilter === 'population' ? 'active' : ''}" onclick="setBuildingFilter('population')" style="font-size: 0.8em; padding: 2px 8px;">Bevolking</button>
            <button class="btn ${window.currentBuildingFilter === 'production' ? 'active' : ''}" onclick="setBuildingFilter('production')" style="font-size: 0.8em; padding: 2px 8px;">Productie & Opslag</button>
            <button class="btn ${window.currentBuildingFilter === 'research' ? 'active' : ''}" onclick="setBuildingFilter('research')" style="font-size: 0.8em; padding: 2px 8px;">Onderzoek</button>
            <button class="btn ${window.currentBuildingFilter === 'military' ? 'active' : ''}" onclick="setBuildingFilter('military')" style="font-size: 0.8em; padding: 2px 8px;">Militair</button>
            <button class="btn ${window.currentBuildingFilter === 'explore' ? 'active' : ''}" onclick="setBuildingFilter('explore')" style="font-size: 0.8em; padding: 2px 8px;">Verkenning</button>
        </div>
        <div class="grid-container">
    `;

    for (let key in game.buildings) {
        const b = game.buildings[key];
        if (!b.unlocked || (b.stream && !isStreamActive(b.stream))) continue;

        // Bepaal de categorie van het gebouw
        let category = 'production'; // default
        if (['hut', 'house', 'fire_pit', 'public_baths', 'castle', 'market_square'].includes(key) || (b.provides && b.provides.max_population)) {
            category = 'population';
        } else if (['school', 'library', 'academy', 'monastery', 'observatory', 'laboratory', 'scribe_hut'].includes(key) || (b.provides && b.provides.max_researchPoints)) {
            category = 'research';
        } else if (['guard_tower', 'barracks', 'star_fort', 'siege_workshop', 'castle', 'cannon_foundry'].includes(key) || (b.provides && b.provides.job_soldier)) {
            category = 'military';
        } else if (['scout_post', 'shipyard', 'harbor', 'naval_base'].includes(key) || (b.provides && b.provides.max_intel)) {
            category = 'explore';
        }

        // Filter logica
        if (window.currentBuildingFilter !== 'all' && window.currentBuildingFilter !== category) {
            continue;
        }

        const cost = getCost(b);
        const canBuy = canAfford(cost);
        let costStr = Object.entries(cost).map(([res, amt]) => `${amt} ${game.resources[res].name}`).join(', ');

        html += `
            <div class="panel">
                <strong>${b.name}</strong> (${b.count})<br>
                <small>${b.desc}</small><br>
                <button class="btn" onclick="buyBuilding('${key}')" ${canBuy ? '' : 'disabled'}>
                    Bouw (${costStr})
                </button>
            </div>
        `;
    }
    html += '</div>';
    return html;
}

window.gatherFood = function() {
    addResource('food', game.resources.food.manualGain || 1);
    addToLog(`Je hebt ${game.resources.food.manualGain || 1} voedsel verzameld.`, 'success');
};

window.craft = function(resKey, amount) {
    const recipes = {
        wood: { food: 10 },
        beam: { wood: 100 },
        brick: { stone: 100 }
    };
    const recipe = recipes[resKey];
    if (!recipe) return;

    let totalCost = {};
    for (let r in recipe) totalCost[r] = recipe[r] * amount;

    if (canAfford(totalCost)) {
        for (let r in totalCost) game.resources[r].amount -= totalCost[r];
        addResource(resKey, amount);
        addToLog(`Je hebt ${amount} ${game.resources[resKey].name} vervaardigd.`, 'success');
    } else {
        addToLog(`Niet genoeg grondstoffen om ${resKey} te vervaardigen.`, 'warning');
    }
};

window.renderBuildings = function() {
    renderCity();
};

// --- UI RESOURCES TAB ---

function renderResourcesTab() {
    if (!window.uiDirty.all && !window.uiDirty.resources) return;

    const header = document.getElementById('resources-analysis-header');
    if (header) {
        header.innerHTML = `
            <h2>${t("label_resources")}</h2>
            <p>${t("desc_resources_analysis")}</p>
        `;
    }

    const container = document.getElementById('resources-analysis-container');
    if (!container) return;

    let html = '<div class="grid-container">';
    
    // Seasonal Modifiers from Balance
    const season = game.calendar.season;
    let seasonalFoodMult = 1.0;
    let seasonalWoodMult = 1.0;
    
    if (season === 0) {
        seasonalFoodMult = GAME_BALANCE.SEASONS.SPRING.food;
        seasonalWoodMult = GAME_BALANCE.SEASONS.SPRING.wood;
    } else if (season === 1) {
        seasonalFoodMult = GAME_BALANCE.SEASONS.SUMMER.food;
        seasonalWoodMult = GAME_BALANCE.SEASONS.SUMMER.wood;
    } else if (season === 2) {
        seasonalFoodMult = GAME_BALANCE.SEASONS.AUTUMN.food;
        seasonalWoodMult = GAME_BALANCE.SEASONS.AUTUMN.wood;
    } else if (season === 3) {
        seasonalFoodMult = GAME_BALANCE.SEASONS.WINTER.food;
        seasonalWoodMult = GAME_BALANCE.SEASONS.WINTER.wood;
    }

    for (let key in game.resources) {
        const res = game.resources[key];
        if (!res.discovered && res.amount <= 0) continue;

        const producingJobs = [];
        for (let jKey in game.jobs) {
            const j = game.jobs[jKey];
            if (j.count > 0 && j.effect && j.effect[key] > 0) {
                producingJobs.push(jKey);
            }
        }
        
        const cJobs = findJobsForConsumption(key);
        
        let prodLines = [];

        producingJobs.forEach(jobKey => {
            const job = game.jobs[jobKey];
            let runningYield = job.effect[key] * job.count;
            let baseYield = runningYield;
            
            // Apply multipliers (to match calculateJobYield in engine.js)
            let multiplier = 1;
            
            if (jobKey === 'woodcutter' && key === 'wood') {
                if (game.research.axe_tech && game.research.axe_tech.unlocked) multiplier += 1;
                if (game.research.wood_tech && game.research.wood_tech.unlocked) multiplier += 0.5;
            } else if (jobKey === 'farmer' && key === 'food') {
                if (game.research.plow_invention && game.research.plow_invention.unlocked) multiplier *= 1.5;
                if (game.buildings.irrigation_system && game.buildings.irrigation_system.count > 0) {
                    multiplier *= (1 + (0.5 * game.buildings.irrigation_system.count));
                }
            }

            let finalYield = baseYield * multiplier;
            let detailLine = `<div class="res-row"><small>${job.name}:</small> <span>+${finalYield.toFixed(2)}/s</span></div>`;
            prodLines.push(detailLine);

            // Seasonal Impact per job
            let seasonMult = 1.0;
            if (key === 'food') seasonMult = seasonalFoodMult;
            if (key === 'wood') seasonMult = seasonalWoodMult;

            if (seasonMult !== 1.0) {
                let seasonImpact = finalYield * (seasonMult - 1);
                let perc = ((seasonMult - 1) * 100).toFixed(0);
                prodLines.push(`<div class="res-row" style="padding-left: 10px; opacity: 0.8;"><small>└ ${t("season_" + ["spring", "summer", "autumn", "winter"][season])} (${perc > 0 ? '+' : ''}${perc}%):</small> <span class="${seasonImpact > 0 ? 'rate-pos' : 'rate-neg'}">${seasonImpact > 0 ? '+' : ''}${seasonImpact.toFixed(2)}/s</span></div>`);
            }
        });

        let consHtml = '';
        cJobs.forEach(cj => {
            if (cj.count > 0) {
                consHtml += `<div class="res-row"><small>${cj.name}:</small> <span class="rate-neg">${(cj.effect[key] * cj.count).toFixed(2)}/s</span></div>`;
            }
        });

        if (key === 'food') {
            const idle = getIdlePopulation();
            if (idle > 0) consHtml += `<div class="res-row"><small>${t("label_idle_pop", "Idle Bevolking")}:</small> <span class="rate-neg">${(-GAME_BALANCE.POPULATION.IDLE_FOOD_CONSUMPTION * idle).toFixed(2)}/s</span></div>`;
        }

        html += `
            <div class="panel">
                <h3 style="margin-bottom: 5px;">${getResourceIcon(key)} ${res.name}</h3>
                <div style="background: rgba(0,0,0,0.2); padding: 5px 10px; border-radius: 4px; margin-bottom: 10px;">
                    <strong>Netto: <span class="${res.perSec >= 0 ? 'rate-pos' : 'rate-neg'}">${res.perSec >= 0 ? '+' : ''}${res.perSec.toFixed(2)}/s</span></strong>
                </div>
                <div style="display: flex; flex-direction: column; gap: 2px;">
                    ${prodLines.join('') || `<small style="opacity:0.5;">${t("label_no_production", "Geen passieve productie")}</small>`}
                    ${consHtml}
                </div>
                <div style="margin-top: 12px; font-size: 0.8em; opacity: 0.7; border-top: 1px solid #333; padding-top: 8px; display: flex; justify-content: space-between;">
                    <span>${t("label_storage", "Opslag")}:</span>
                    <span>${Math.floor(res.amount)} / ${res.max}</span>
                </div>
            </div>
        `;
    }
    html += '</div>';
    container.innerHTML = html;
    window.uiDirty.resources = false;
}

function findJobsForConsumption(resKey) {
    const list = [];
    for (let jKey in game.jobs) {
        const j = game.jobs[jKey];
        if (j.effect && j.effect[resKey] < 0) {
            list.push(j);
        }
    }
    return list;
}

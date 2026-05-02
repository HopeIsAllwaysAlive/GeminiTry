// --- UI RESOURCES TAB ---

function renderResourcesTab() {
    const container = document.getElementById('resources-analysis-container');
    if (!container) return;

    let html = '<div class="grid-container">';
    
    // Seasonal Modifiers
    let seasonalFoodMult = 1.0;
    let seasonalWoodMult = 1.0;
    if (game.calendar && game.calendar.season !== undefined) {
        switch(game.calendar.season) {
            case 0: seasonalFoodMult = 1.5; break;
            case 2: seasonalWoodMult = 1.1; break;
            case 3: seasonalFoodMult = 0.25; seasonalWoodMult = 0.75; break;
        }
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
            let detailLine = `<div class="res-row"><small>${job.name}:</small> <span>+${baseYield.toFixed(2)}/s</span></div>`;

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
            if (multiplier !== 1) {
                detailLine = `<div class="res-row"><small>${job.name} (incl. bonus):</small> <span>+${finalYield.toFixed(2)}/s</span></div>`;
            }
            prodLines.push(detailLine);

            // Seasonal Impact per job
            let seasonMult = 1.0;
            if (key === 'food') seasonMult = seasonalFoodMult;
            if (key === 'wood') seasonMult = seasonalWoodMult;

            if (seasonMult !== 1.0) {
                let seasonImpact = finalYield * (seasonMult - 1);
                let perc = ((seasonMult - 1) * 100).toFixed(0);
                prodLines.push(`<div class="res-row" style="padding-left: 10px; opacity: 0.8;"><small>└ Seizoen (${perc > 0 ? '+' : ''}${perc}%):</small> <span class="${seasonImpact > 0 ? 'rate-pos' : 'rate-neg'}">${seasonImpact > 0 ? '+' : ''}${seasonImpact.toFixed(2)}/s</span></div>`);
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
            if (idle > 0) consHtml += `<div class="res-row"><small>Idle Bevolking:</small> <span class="rate-neg">${(-1.2 * idle).toFixed(2)}/s</span></div>`;
        }

        html += `
            <div class="panel">
                <h3 style="margin-bottom: 5px;">${getResourceIcon(key)} ${res.name}</h3>
                <div style="background: rgba(0,0,0,0.2); padding: 5px 10px; border-radius: 4px; margin-bottom: 10px;">
                    <strong>Netto: <span class="${res.perSec >= 0 ? 'rate-pos' : 'rate-neg'}">${res.perSec >= 0 ? '+' : ''}${res.perSec.toFixed(2)}/s</span></strong>
                </div>
                <div style="display: flex; flex-direction: column; gap: 2px;">
                    ${prodLines.join('') || '<small style="opacity:0.5;">Geen passieve productie</small>'}
                    ${consHtml}
                </div>
                <div style="margin-top: 12px; font-size: 0.8em; opacity: 0.7; border-top: 1px solid #333; padding-top: 8px; display: flex; justify-content: space-between;">
                    <span>Opslag:</span>
                    <span>${Math.floor(res.amount)} / ${res.max}</span>
                </div>
            </div>
        `;
    }
    html += '</div>';
    container.innerHTML = html;
}

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

        const jobKey = findJobKeyForResource(key);
        const job = game.jobs[jobKey];
        const cJobs = findJobsForConsumption(key);
        
        let prodLines = [];
        let runningYield = 0;

        if (job && job.count > 0) {
            // 1. Base Production
            let baseYield = job.effect[key] * job.count;
            runningYield = baseYield;
            prodLines.push(`<div class="res-row"><small>Basis (${job.name}):</small> <span>+${baseYield.toFixed(2)}/s</span></div>`);

            // 2. Tech / Building Multipliers (Multiplicative to match engine.js)
            if (key === 'food') {
                if (game.research.plow_invention && game.research.plow_invention.unlocked) {
                    let impact = runningYield * 0.5;
                    runningYield += impact;
                    prodLines.push(`<div class="res-row"><small>Tech (De Ploeg):</small> <span class="rate-pos">+${impact.toFixed(2)}/s</span></div>`);
                }
                if (game.buildings.irrigation_system && game.buildings.irrigation_system.count > 0) {
                    let mult = 0.5 * game.buildings.irrigation_system.count;
                    let impact = runningYield * mult;
                    runningYield += impact;
                    prodLines.push(`<div class="res-row"><small>Irrigatie (x${game.buildings.irrigation_system.count}):</small> <span class="rate-pos">+${impact.toFixed(2)}/s</span></div>`);
                }
            } else if (key === 'wood') {
                if (game.research.axe_tech && game.research.axe_tech.unlocked) {
                    let impact = runningYield * 1.0;
                    runningYield += impact;
                    prodLines.push(`<div class="res-row"><small>Tech (Hak Techniek):</small> <span class="rate-pos">+${impact.toFixed(2)}/s</span></div>`);
                }
                if (game.research.wood_tech && game.research.wood_tech.unlocked) {
                    let impact = runningYield * 0.5;
                    runningYield += impact;
                    prodLines.push(`<div class="res-row"><small>Tech (Hout Techniek):</small> <span class="rate-pos">+${impact.toFixed(2)}/s</span></div>`);
                }
            }

            // 3. Seasonal Impact (Applied after job multipliers)
            let seasonMult = 1.0;
            if (key === 'food') seasonMult = seasonalFoodMult;
            if (key === 'wood') seasonMult = seasonalWoodMult;

            if (seasonMult !== 1.0 && game.calendar && game.calendar.season !== undefined && game.seasonNames) {
                let seasonImpact = runningYield * (seasonMult - 1);
                let perc = ((seasonMult - 1) * 100).toFixed(0);
                prodLines.push(`<div class="res-row"><small>Seizoen (${game.seasonNames[game.calendar.season]} ${perc > 0 ? '+' : ''}${perc}%):</small> <span class="${seasonImpact > 0 ? 'rate-pos' : 'rate-neg'}">${seasonImpact > 0 ? '+' : ''}${seasonImpact.toFixed(2)}/s</span></div>`);
            }
        }

        let consHtml = '';
        cJobs.forEach(cj => {
            if (cj.count > 0) {
                consHtml += `<div class="res-row"><small>${cj.name}:</small> <span class="rate-neg">${(cj.effect[key] * cj.count).toFixed(2)}/s</span></div>`;
            }
        });

        if (key === 'food') {
            const idle = getIdlePopulation();
            if (idle > 0) consHtml += `<div class="res-row"><small>Idle Bevolking:</small> <span class="rate-neg">${(-0.5 * idle).toFixed(2)}/s</span></div>`;
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

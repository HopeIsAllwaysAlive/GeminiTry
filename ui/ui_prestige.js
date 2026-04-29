// --- UI PRESTIGE (LEGACY) TAB ---

function renderPrestige() {
    const container = document.getElementById('tab-prestige');
    if (!container) return;

    const points = game.prestige.points;
    const totalEarned = game.prestige.totalEarned;
    const prestigeBoost = (points * 0.01 * 100).toFixed(0);

    let html = `
        <h2>Tijdperken & Nalatenschap</h2>
        <div class="panel" style="background: linear-gradient(135deg, #1e1e2e 0%, #313244 100%); border: 1px solid #fab387;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <div>
                    <h3 style="color: #fab387; margin: 0;">Prestige Punten: ${points.toFixed(2)}</h3>
                    <p style="font-size: 0.9em; opacity: 0.8; margin: 5px 0 0 0;">Totaal verdiend over alle levens: ${totalEarned.toFixed(2)}</p>
                </div>
                <div style="text-align: right;">
                    <div style="font-size: 1.2em; font-weight: bold; color: #a6e3a1;">+${prestigeBoost}% Bonus</div>
                    <small style="opacity: 0.6;">op alle productie & goud</small>
                </div>
            </div>
        </div>

        <div style="margin-top: 30px;">
            <h3>Permanente Upgrades</h3>
            <div class="grid-container">
    `;

    for (let key in game.prestige.upgrades) {
        const upg = game.prestige.upgrades[key];
        const canBuy = points >= upg.cost && upg.level < upg.max;
        
        html += `
            <div class="panel prestige-card ${upg.level >= upg.max ? 'completed' : ''}">
                <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                    <strong>${upg.name}</strong>
                    <span style="font-size: 0.8em; opacity: 0.7;">Lvl ${upg.level}/${upg.max}</span>
                </div>
                <p style="font-size: 0.85em; opacity: 0.8; margin: 10px 0;">${upg.desc}</p>
                <button class="btn" onclick="buyPrestigeUpgrade('${key}')" ${canBuy ? '' : 'disabled'} style="width: 100%; margin-top: auto; border-color: #fab387; color: #fab387;">
                    ${upg.level >= upg.max ? 'MAXED' : `Koop (${upg.cost} Pnt)`}
                </button>
            </div>
        `;
    }

    html += `
            </div>
        </div>

        <div style="margin-top: 40px; border-top: 1px solid #333; padding-top: 20px;">
            <h3>Evolutie & Reset</h3>
            ${game.era === 1 && game.buildings.flint_monument && game.buildings.flint_monument.count >= 1 ? `
            <div class="panel" style="border-color: #a6e3a1; margin-bottom: 20px;">
                <p>Je Vuursteen Monument staat fier overeind. Je beschaving is klaar voor de volgende stap!</p>
                <button class="btn" onclick="confirmEvolution()" style="background: #a6e3a1; color: #11111b; font-weight: bold; width: 100%; padding: 10px;" ${game.resources.population.amount >= 50 ? '' : 'disabled'}>
                    ${game.resources.population.amount >= 50 ? 'EVOLUEER NAAR TIJDPERK 2' : 'Evolueer (Vereist 50 Bevolking)'}
                </button>
            </div>` : ''}

            <div class="panel" style="border-color: #f38ba8;">
                <p>Door je beschaving te beëindigen, laat je een nalatenschap achter voor de volgende generatie. Je verliest al je gebouwen, resources en onderzoek, maar je ontvangt <strong>Prestige Punten</strong> op basis van je voortgang.</p>
                
                <div style="background: rgba(0,0,0,0.3); padding: 15px; border-radius: 8px; margin: 15px 0;">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                        <span>Verwachte punten bij reset:</span>
                        <strong style="color: #fab387;">+${calculatePrestigePoints().toFixed(2)}</strong>
                    </div>
                    <small style="opacity: 0.6;">Gebaseerd op bevolking, gebouwen en ontdekkingen.</small>
                </div>

                <button class="btn" onclick="confirmPrestige()" style="background: #f38ba8; color: #11111b; font-weight: bold; width: 100%; padding: 10px;">
                    HERBORE WORDEN (Prestige Reset)
                </button>
            </div>
        </div>
    `;

    container.innerHTML = html;
}

window.confirmEvolution = function() {
    if (confirm(`Je staat op het punt te evolueren naar Tijdperk 2!\n\nJe huidige stad wordt achtergelaten als fundament. Je behoudt toegang tot de Prestige Punten en upgrades, maar begint met een schone lei voor je nieuwe beschaving. \n\nDoorgaan?`)) {
        performPrestige(true); // true = isEvolution
    }
};

window.confirmPrestige = function() {
    const earned = calculatePrestigePoints();
    if (confirm(`Weet je zeker dat je wilt resetten? Je ontvangt ${earned.toFixed(2)} Prestige Punten.\n\nAl je huidige voortgang (gebouwen, resources, onderzoek) gaat verloren!`)) {
        performPrestige(false);
        showTab('jobs');
    }
};

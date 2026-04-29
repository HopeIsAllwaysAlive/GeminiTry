// --- UI EXPLORE TAB ---

function renderExplore() {
    const container = document.getElementById('tab-explore');
    if (!container) return;

    if (game.expeditions.active) {
        container.innerHTML = `
            <h2>Expeditie Bezig...</h2>
            <div class="panel">
                <p>Je verkenners zijn onderweg. Nog <strong>${game.expeditions.timer} seconden</strong> te gaan.</p>
                <div style="background: #222; height: 10px; width: 100%; border: 1px solid var(--border);">
                    <div style="background: var(--accent); height: 100%; width: ${((game.expeditions.types[game.expeditions.currentType].duration - game.expeditions.timer) / game.expeditions.types[game.expeditions.currentType].duration) * 100}%"></div>
                </div>
            </div>
        `;
        return;
    }

    let html = '<h2>Verkennen</h2><div class="grid-container">';
    for (let key in game.expeditions.types) {
        const type = game.expeditions.types[key];
        if (!type.requirements()) continue;

        const canAffordExp = canAfford(type.cost);
        let costStr = Object.entries(type.cost).map(([res, amt]) => `${amt} ${game.resources[res]?.name || res}`).join(', ');

        html += `
            <div class="panel">
                <strong>${type.name}</strong><br>
                <small>Duur: ${type.duration}s | Kans: ${Math.floor(type.successRate * 100)}%</small><br>
                <button class="btn" onclick="startExpedition('${key}')" ${canAffordExp ? '' : 'disabled'}>
                    Start Expeditie (${costStr})
                </button>
            </div>
        `;
    }
    html += '</div>';
    container.innerHTML = html;
}

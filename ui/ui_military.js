// --- UI MILITARY TAB ---

function renderMilitary() {
    const container = document.getElementById('tab-military');
    if (!container) return;

    let html = '<h2>Militair</h2>';
    
    // Stats Overview
    html += `
        <div class="military-stats panel">
            <div class="stat-item">
                <label>Aanvalskracht</label>
                <span>⚔️ ${Math.floor(game.military.attackPower)}</span>
            </div>
            <div class="stat-item">
                <label>Verdedigingskracht</label>
                <span>🛡️ ${Math.floor(game.military.defensePower)}</span>
            </div>
            <div class="stat-item">
                <label>Soldaten</label>
                <span>👥 ${game.jobs.soldier.count}</span>
            </div>
        </div>
    `;

    // Units Grid
    html += '<h3>Je Eenheden</h3><div class="grid-container">';
    for (let key in game.military.units) {
        const u = game.military.units[key];
        if (!u.unlocked) continue;

        const unassigned = u.total - u.assignedOff - u.assignedDef;

        html += `
            <div class="panel unit-card">
                <h3>${u.name}</h3>
                <p style="font-size: 0.8em; opacity: 0.7;">${u.desc}</p>
                <div style="margin: 10px 0; font-size: 0.9em;">
                    <strong>Totaal:</strong> ${u.total}<br>
                    <strong>Vrij:</strong> ${unassigned}<br>
                    <strong>Aanval:</strong> ${u.assignedOff} | <strong>Verdediging:</strong> ${u.assignedDef}
                </div>
                
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 5px; margin-top: 10px;">
                    <button class="btn" onclick="trainUnit('${key}')">Train (+${buyAmount})</button>
                    <button class="btn" onclick="untrainUnit('${key}')" ${unassigned > 0 ? '' : 'disabled'}>Ontsla</button>
                    <button class="btn" onclick="assignUnit('${key}', 'off')" ${unassigned + u.assignedDef > 0 ? '' : 'disabled'}>Naar Aanval</button>
                    <button class="btn" onclick="assignUnit('${key}', 'def')" ${unassigned + u.assignedOff > 0 ? '' : 'disabled'}>Naar Verdediging</button>
                </div>
            </div>
        `;
    }
    html += '</div>';

    // Discovered Tribes for interaction (Attack)
    const tribes = game.diplomacy?.discoveredTribes || {};
    if (Object.keys(tribes).length > 0) {
        html += '<h3 style="margin-top: 30px;">Doelwitten</h3><div class="grid-container">';
        for (let key in tribes) {
            const tribe = tribes[key];
            if (tribe.isConquered) continue;

            html += `
                <div class="panel">
                    <strong>${tribe.name}</strong><br>
                    <small>Defensie: ~${tribe.defenseValue || 300}</small><br>
                    <button class="btn" style="width: 100%; margin-top: 10px; color: var(--red); border-color: var(--red);" onclick="attackTribe('${key}')">
                        VAL AAN ⚔️
                    </button>
                </div>
            `;
        }
        html += '</div>';
    }

    container.innerHTML = html;
}

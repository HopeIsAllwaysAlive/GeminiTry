// --- UI DEBUG TAB ---

function renderDebug() {
    const container = document.getElementById('debug-container');
    if (!container) return;
    let html = '<h3>🧪 Onderzoeken</h3><table class="panel" style="width:100%; border-collapse: collapse; font-size: 0.8em; text-align: left;">';
    html += '<tr><th>Naam</th><th>Status</th><th>Kosten</th><th>Voorwaarde</th></tr>';
    for (let key in game.research) {
        const r = game.research[key];
        const status = r.researched ? '<span class="rate-pos">VOLTOOID</span>' : (r.unlocked ? 'ZICHTBAAR' : 'VERBORGEN');
        const costStr = Object.entries(r.cost || {}).map(([res, amt]) => `${amt} ${res}`).join(', ');
        const reqStr = r.requirement ? r.requirement.toString().split('=>')[1].trim() : 'Geen';
        html += `<tr style="border-bottom: 1px solid #333;"><td title="${r.desc}">${r.name}</td><td>${status}</td><td>${costStr}</td><td style="color: #89b4fa;">${reqStr}</td></tr>`;
    }
    html += '</table>';
    container.innerHTML = html;
}

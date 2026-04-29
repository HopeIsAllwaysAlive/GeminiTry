// --- UI DIPLOMACY TAB ---

function renderDiplomacy() {
    const container = document.getElementById('tab-diplomacy');
    if (!container) return;

    let html = '<h2>Diplomatie</h2>';
    const tribes = game.diplomacy?.discoveredTribes || {};

    if (Object.keys(tribes).length === 0) {
        html += '<p>Je hebt nog geen andere volken ontdekt. Stuur verkenners op expeditie!</p>';
    } else {
        html += '<div class="grid-container">';
        for (let key in tribes) {
            const tribe = tribes[key];
            const relation = tribe.relation || 50;
            
            let statusClass = 'status-neutral';
            let statusText = 'Neutraal';
            if (tribe.isAllied) { statusClass = 'status-allied'; statusText = 'Bondgenoot'; }
            else if (tribe.isConquered) { statusClass = 'status-conquered'; statusText = 'Onderworpen'; }

            html += `
                <div class="panel tribe-card">
                    <div class="status-badge ${statusClass}">${statusText}</div>
                    <h3>${tribe.name}</h3>
                    <p style="font-size: 0.85em; opacity: 0.8; margin-bottom: 15px;">${tribe.desc}</p>
                    
                    <div style="margin-bottom: 15px; font-size: 0.9em;">
                        <strong>Relatie:</strong> ${relation}/100
                        <div style="width: 100%; background: #222; height: 6px; border-radius: 3px; margin-top: 5px;">
                            <div style="width: ${relation}%; background: ${relation >= 60 ? 'var(--green)' : (relation <= 30 ? 'var(--red)' : '#89b4fa')}; height: 100%; border-radius: 3px;"></div>
                        </div>
                    </div>

                    <div style="display: flex; flex-direction: column; gap: 8px;">
                        <button class="btn" onclick="sendGift('${key}')" ${tribe.isConquered || relation >= 100 || !canAfford({ gold: 500 }) ? 'disabled' : ''}>
                            Zend Cadeau (500 Goud)
                        </button>
                        <button class="btn" onclick="toggleTradeRoute('${key}')" ${relation >= 60 || tribe.tradeRouteActive ? '' : 'disabled'}>
                            ${tribe.tradeRouteActive ? 'Stop Handelsroute' : 'Start Handelsroute (Relatie 60+)'}
                        </button>
                        <button class="btn" onclick="formAlliance('${key}')" ${tribe.isAllied || relation < 90 ? 'disabled' : ''}>
                            Vorm Alliantie (Relatie 90+)
                        </button>
                        <button class="btn" onclick="demandTribute('${key}')" ${tribe.isConquered ? 'disabled' : ''}>
                            Eis Tribuut (-30 Relatie)
                        </button>
                    </div>
                </div>
            `;
        }
        html += '</div>';
    }
    container.innerHTML = html;
}

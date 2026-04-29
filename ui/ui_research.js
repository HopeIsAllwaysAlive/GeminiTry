// --- UI RESEARCH TAB ---

window.currentResearchSubTab = 'research_list'; // 'research_list' or 'impact_roadmap'

function renderResearch() {
    const container = document.getElementById('tab-research');
    if (!container) return;

    // Sub-tab Navigation
    let html = `
        <div class="sub-nav" style="margin-bottom: 20px; display: flex; gap: 10px; border-bottom: 1px solid #333; padding-bottom: 10px;">
            <button class="btn ${window.currentResearchSubTab === 'research_list' ? 'active' : ''}" onclick="showResearchSubTab('research_list')">Onderzoek</button>
            <button class="btn ${window.currentResearchSubTab === 'impact_roadmap' ? 'active' : ''}" onclick="showResearchSubTab('impact_roadmap')">Beschavings Effecten</button>
        </div>
    `;

    if (window.currentResearchSubTab === 'research_list') {
        html += renderResearchList();
    } else {
        html += renderImpactRoadmap();
    }

    container.innerHTML = html;
}

window.showResearchSubTab = function(subId) {
    window.currentResearchSubTab = subId;
    renderResearch();
};

function renderResearchList() {
    let availableHtml = '<h2>Beschikbaar Onderzoek</h2><div class="grid-container">';
    let completedHtml = '<h2 style="margin-top:30px; opacity:0.6;">Voltooid Onderzoek</h2><div class="grid-container" style="opacity:0.6;">';
    
    let hasAvailable = false;
    let hasCompleted = false;

    for (let key in game.research) {
        const r = game.research[key];
        
        if (r.researched) {
            completedHtml += `
                <div class="panel" style="border-color: var(--green);">
                    <strong>${r.name}</strong><br>
                    <small>${r.desc}</small>
                </div>
            `;
            hasCompleted = true;
            continue;
        }

        if (!r.requirement()) continue;
        
        const canBuy = canAfford(r.cost);
        let costStr = Object.entries(r.cost).map(([res, amt]) => `${amt} ${game.resources[res]?.name || res}`).join(', ');

        availableHtml += `
            <div class="panel">
                <strong>${r.name}</strong><br>
                <small>${r.desc}</small><br>
                <button class="btn" onclick="buyResearch('${key}')" ${canBuy ? '' : 'disabled'}>
                    Onderzoek (${costStr})
                </button>
            </div>
        `;
        hasAvailable = true;
    }

    availableHtml += '</div>';
    completedHtml += '</div>';

    return (hasAvailable ? availableHtml : '<p>Geen nieuw onderzoek beschikbaar op dit moment.</p>') + 
           (hasCompleted ? completedHtml : '');
}

function renderImpactRoadmap() {
    let impactHtml = `
        <h2>Beschavings Effecten</h2>
        <div class="panel">
            <p style="font-size: 0.9em; opacity: 0.8; margin-bottom: 15px;">Overzicht van hoe technologieën en gebouwen je grondstoffen beïnvloeden.</p>
            <div class="tech-impact-grid">
    `;

    for (let resKey in game.resources) {
        let researches = findResearchesForResource(resKey);
        
        let relevantBuildings = [];
        if (resKey === 'food') {
            relevantBuildings.push({
                name: "Irrigatie Systeem",
                count: game.buildings.irrigation_system.count,
                unlocked: game.buildings.irrigation_system.unlocked,
                desc: "Verhoogt de boerenproductie met 50% per systeem (multiplicatief)."
            });
            relevantBuildings.push({
                name: "Silo",
                count: game.buildings.silo.count,
                unlocked: game.buildings.silo.unlocked,
                desc: "Massale voedselopslag (+500 cap)."
            });
        }

        if (researches.length === 0 && relevantBuildings.length === 0) continue;

        impactHtml += `
            <div class="impact-card">
                <strong>${getResourceIcon(resKey)} ${game.resources[resKey].name}</strong>
        `;

        relevantBuildings.forEach(b => {
            const statusIcon = b.count > 0 ? '🏠' : (b.unlocked ? '🔓' : '🔒');
            const statusColor = b.count > 0 ? 'var(--green)' : (b.unlocked ? '#f9e2af' : '#6c7086');
            impactHtml += `
                <div style="margin-bottom: 12px; font-size: 0.85em; opacity: ${b.count > 0 || b.unlocked ? '1' : '0.6'}">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 3px;">
                        <span style="font-weight: 500;"><span style="color: ${statusColor}">${statusIcon}</span> ${b.name}</span>
                        <small style="opacity: 0.6; font-size: 0.8em; text-transform: uppercase;">${b.count > 0 ? b.count + 'x Actief' : (b.unlocked ? 'Zichtbaar' : 'Locked')}</small>
                    </div>
                    <div style="font-size: 0.85em; opacity: 0.7; padding-left: 18px; line-height: 1.2;">${b.desc}</div>
                </div>
            `;
        });

        researches.forEach(r => {
            const statusIcon = r.researched ? '✓' : (r.unlocked ? '🔓' : '🔒');
            const statusColor = r.researched ? 'var(--green)' : (r.unlocked ? '#f9e2af' : '#6c7086');
            impactHtml += `
                <div style="margin-bottom: 12px; font-size: 0.85em; opacity: ${r.researched || r.unlocked ? '1' : '0.6'}">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 3px;">
                        <span style="font-weight: 500;"><span style="color: ${statusColor}">${statusIcon}</span> ${r.name}</span>
                        <small style="opacity: 0.6; font-size: 0.8em; text-transform: uppercase;">${r.researched ? 'Actief' : (r.unlocked ? 'Zichtbaar' : 'Locked')}</small>
                    </div>
                    <div style="font-size: 0.85em; opacity: 0.7; padding-left: 18px; line-height: 1.2;">${r.desc}</div>
                </div>
            `;
        });
        impactHtml += `</div>`;
    }
    impactHtml += `</div></div>`;
    return impactHtml;
}

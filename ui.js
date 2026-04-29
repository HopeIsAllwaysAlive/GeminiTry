// --- UI CORE (Kittens Edition) ---

window.currentTab = 'jobs';

// Message Log System
function addToLog(message, type = 'info') {
    const logContainer = document.getElementById('log-container');
    if (!logContainer) return;

    const msgEl = document.createElement('div');
    msgEl.className = `log-msg log-${type}`;
    msgEl.innerText = `[Dag ${game.calendar.day}] ${message}`;
    
    logContainer.prepend(msgEl);

    // Limit log size
    if (logContainer.childNodes.length > 100) {
        logContainer.removeChild(logContainer.lastChild);
    }
}

// Override global notification functions to use the log
window.showNotification = (msg, type) => addToLog(msg, type === 'error' ? 'warning' : type);
window.showFloatingText = (e, text) => addToLog(text, 'success');

function updateUI() {
    if (isStreamModalOpen) return;

    renderCalendar();
    renderLeftResources();
    renderActiveEvent();
    updateTabVisibility();

    switch (window.currentTab) {
        case 'jobs':
            renderCity();
            break;
        case 'resources_tab':
            renderResourcesTab();
            break;
        case 'population':
            renderJobs();
            break;
        case 'research':
            renderResearch();
            break;
        case 'explore':
            renderExplore();
            break;
        case 'diplomacy':
            renderDiplomacy();
            break;
        case 'military':
            renderMilitary();
            break;
        case 'prestige':
            renderPrestige();
            break;
        case 'debug':
            renderDebug();
            break;
        case 'settings':
            renderSettings();
            break;
    }
}

function renderCalendar() {
    const el = document.getElementById('calendar-display');
    if (!el) return;
    const season = game.seasonNames[game.calendar.season];
    
    // Add seasonal impact percentages to calendar display
    let impactStr = "";
    if (game.calendar.season === 0) impactStr = " (+50% Voedsel)";
    else if (game.calendar.season === 2) impactStr = " (+10% Hout)";
    else if (game.calendar.season === 3) impactStr = " (-75% Voedsel, -25% Hout)";

    el.innerText = `Dag ${game.calendar.day}, Jaar ${game.calendar.year} - ${season}${impactStr}`;
}

function renderLeftResources() {
    const container = document.getElementById('left-resources');
    if (!container) return;

    let html = '';
    for (let key in game.resources) {
        const res = game.resources[key];
        if (!res.discovered && res.amount <= 0) continue;

        const ratePrefix = res.perSec >= 0 ? "+" : "";
        const rateClass = res.perSec >= 0 ? "rate-pos" : "rate-neg";
        
        html += `
            <div class="res-row" title="${res.name}">
                <span>${res.name}:</span>
                <span>${Math.floor(res.amount)}<small>/${res.max || '∞'}</small></span>
            </div>
            <div class="res-row" style="justify-content: flex-end; margin-top: -4px; opacity: 0.8;">
                <span class="res-rate ${rateClass}">${ratePrefix}${res.perSec.toFixed(2)}/s</span>
            </div>
        `;
    }
    container.innerHTML = html;
}

function updateTabVisibility() {
    const navButtons = document.querySelectorAll('.top-nav button');
    navButtons.forEach(btn => {
        const id = btn.id.replace('nav-', '');
        
        // Default: toon de knop (Stad, Bevolking, Onderzoek, Instellingen)
        let shouldShow = true;

        // Alleen de echt geavanceerde tabs nog verbergen
        if (id === 'explore') {
            shouldShow = (game.research?.expeditions?.researched || game.research?.expeditions?.unlocked);
        } else if (id === 'diplomacy') {
            const hasTribes = Object.keys(game.diplomacy?.discoveredTribes || {}).length > 0;
            shouldShow = (game.diplomacy?.unlocked || hasTribes);
        } else if (id === 'military') {
            const hasSoldiers = game.jobs.soldier && game.jobs.soldier.count > 0;
            shouldShow = (game.buildings.barracks && game.buildings.barracks.count > 0) || hasSoldiers;
        } else if (id === 'prestige') {
            shouldShow = (game.era > 1 || (game.prestige && game.prestige.totalEarned > 0) || (game.buildings.flint_monument && game.buildings.flint_monument.count >= 1));
        }

        btn.style.display = shouldShow ? 'inline-block' : 'none';
        btn.classList.toggle('active', id === window.currentTab);
    });
}

window.showTab = function(tabId) {
    window.currentTab = tabId;
    
    // Update Content Visibility
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.toggle('active', content.id === `tab-${tabId}`);
    });

    updateUI();
};

// Initial render call
document.addEventListener('DOMContentLoaded', () => {
    updateUI();
});

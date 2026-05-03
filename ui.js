// --- UI CORE (Kittens Edition) ---

window.currentTab = 'jobs';

// Message Log System
function addToLog(message, type = 'info') {
    const logContainer = document.getElementById('log-container');
    if (!logContainer) return;

    const msgEl = document.createElement('div');
    msgEl.className = `log-msg log-${type}`;
    msgEl.innerText = `[${t("label_day")} ${game.calendar.day}] ${message}`;
    
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
    if (typeof isStreamModalOpen !== 'undefined' && isStreamModalOpen) return;

    renderCalendar();
    renderLeftResources();
    if (typeof renderActiveEvent === 'function') renderActiveEvent();
    updateTabVisibility();

    switch (window.currentTab) {
        case 'jobs':
            if (typeof renderCity === 'function') renderCity();
            break;
        case 'resources_tab':
            if (typeof renderResourcesTab === 'function') renderResourcesTab();
            break;
        case 'population':
            if (typeof renderJobs === 'function') renderJobs();
            break;
        case 'research':
            if (typeof renderResearch === 'function') renderResearch();
            break;
        case 'explore':
            if (typeof renderExplore === 'function') renderExplore();
            break;
        case 'diplomacy':
            if (typeof renderDiplomacy === 'function') renderDiplomacy();
            break;
        case 'military':
            if (typeof renderMilitary === 'function') renderMilitary();
            break;
        case 'workshop':
            if (typeof renderWorkshop === 'function') renderWorkshop();
            break;
        case 'debug':
            if (typeof renderDebug === 'function') renderDebug();
            break;
        case 'settings':
            if (typeof renderSettings === 'function') renderSettings();
            break;
    }
}

function renderCalendar() {
    const el = document.getElementById('calendar-display');
    if (!el) return;
    const season = game.seasonNames[game.calendar.season];
    
    // Add seasonal impact percentages to calendar display
    let impactStr = "";
    if (game.calendar.season === 0) impactStr = ` (+50% ${t("res_food")})`;
    else if (game.calendar.season === 2) impactStr = ` (+10% ${t("res_wood")})`;
    else if (game.calendar.season === 3) impactStr = ` (-75% ${t("res_food")}, -25% ${t("res_wood")})`;

    el.innerText = `${t("label_day")} ${game.calendar.day}, ${t("label_year")} ${game.calendar.year} - ${season}${impactStr}`;
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
        } else if (id === 'workshop') {
            shouldShow = (game.buildings.wood_workshop && game.buildings.wood_workshop.count > 0);
        } else if (id === 'debug') {
            shouldShow = true;
        }

        btn.style.display = shouldShow ? 'inline-block' : 'none';
        btn.classList.toggle('active', id === window.currentTab);
        
        // Localize tab labels if we have them
        const tabLabels = {
            'jobs': t("label_jobs"),
            'resources_tab': t("label_resources", "Resources"),
            'population': t("label_population", "Population"),
            'research': t("label_research"),
            'explore': t("label_explore", "Explore"),
            'diplomacy': t("label_diplomacy", "Diplomacy"),
            'military': t("label_military", "Military"),
            'workshop': t("label_workshop", "Workshop"),
            'settings': t("label_settings")
        };
        if (tabLabels[id]) btn.innerText = tabLabels[id];
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

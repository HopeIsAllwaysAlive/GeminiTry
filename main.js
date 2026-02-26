// --- GAME LOOP ---
// --- INITIALISATIE ---
document.addEventListener('DOMContentLoaded', () => {
    loadGame();
    handleOfflineProgress();
    renderManualButtons();
    updateUI();

    setInterval(() => {
        // Resources & Groei
        for (let key in game.resources) {
            if (key === 'scouts') continue;  // Skip scouts
            addResource(key, game.resources[key].perSec);
        }
        if (game.resources.food.amount <= 0) {
            game.resources.food.amount = 0;
            // Mensen vertrekken of sterven bij honger
            handleFamine();
        }

        if (game.expeditions.active && game.expeditions.timer > 0) {
            game.expeditions.timer--;
            if (game.expeditions.timer <= 0) {
                completeExpedition();
            }
        }
        checkUnlocks();
        renderExplore();
        updateUI();
    }, 1000);

    // Auto-save elke 30 seconden
    setInterval(saveGame, 30000);

    // Check elke 60 seconden voor een event
    setInterval(triggerRandomEvent, 60000);

    // Check elke 60 seconden voor rebellies
    setInterval(checkRebellions, 60000);//60000

    setInterval(() => {
        for (let key in game.diplomacy.discoveredTribes) {
            const tribe = game.diplomacy.discoveredTribes[key];

            // Alleen tribes met een zeer slechte relatie vallen aan
            if (tribe.relation < 20 && !tribe.isConquered) {
                // 5% kans elke minuut op een aanval
                if (Math.random() < 0.05) {
                    triggerEnemyAttack(key);
                }
            }
        }
    }, 60000); // Check elke minuut 60000
});



window.showTab = function (tabId) {
    // console.log("Wisselen naar tab:", tabId); // Zie je dit in de console?
    // 1. Vertel de game welke tab nu 'actief' is
    window.currentTab = tabId;
    setBuyAmount(1); // Reset de multiplier naar 1 bij het wisselen van een tab

    // 2. Visueel de tabs wisselen (CSS)
    const contents = document.getElementsByClassName('tab-content');
    for (let content of contents) {
        content.classList.remove('active');
    }

    const activeTab = document.getElementById('tab-' + tabId);
    if (activeTab) {
        activeTab.classList.add('active');
        // NIEUW: Scroll de container zelf naar boven
        const container = activeTab.closest('.scroll-container'); // Pas de selector aan naar je werkelijke container class
        if (container) {
            container.scrollTop = 0;
        } else {
            window.scrollTo(0, 0); // Fallback voor het volledige viewport
        }
    }

    // 3. De navigatieknoppen in de swipeable subnav 'active' uiterlijk geven
    if (typeof highlightSubNavButton !== 'undefined') {
        highlightSubNavButton(tabId);
    }

    // 4. Meteen tekenen zodat de speler geen lege pagina ziet
    updateUI();
}

const gameEvents = [
    {
        title: "Goede Oogst",
        text: "De weergoden zijn je gunstig gezind! De schuren puilen uit.",
        action: () => { addResource('food', 200); },
        chance: 0.4
    },
    {
        title: "Diefstal!",
        text: "Een sluwe dief heeft ingebroken in de opslag.",
        action: () => { addResource('gold', -50); },
        chance: 0.2
    },
    {
        title: "Vluchteling",
        text: "Een reiziger uit een ver land vraagt om onderdak.",
        action: () => { game.resources.population.amount += 1; },
        chance: 0.1
    }
];

function triggerRandomEvent() {
    // 10% kans elke minuut (of hoe vaak je de functie ook aanroept)
    if (Math.random() < 0.1) {
        const event = gameEvents[Math.floor(Math.random() * gameEvents.length)];
        event.action();
        alert(`EVENT: ${event.title}\n\n${event.text}`);
        updateUI();
    }
}
// EXPORT: Maakt een code van je savegame
async function exportGame() {
    try {
        const saveString = btoa(JSON.stringify(game));
        if (navigator.clipboard && window.isSecureContext) {
            await navigator.clipboard.writeText(saveString);
            alert("💾 Savecode succesvol gekopieerd naar je klembord!");
        } else {
            // Fallback for older browsers / insecure contexts
            const ta = document.createElement('textarea');
            ta.value = saveString;
            ta.style.position = 'absolute';
            ta.style.left = '-9999px';
            document.body.appendChild(ta);
            ta.select();
            document.execCommand('copy');
            document.body.removeChild(ta);
            alert("💾 Savecode succesvol gekopieerd naar je klembord (fallback)!");
        }
    } catch (e) {
        console.error("Export mislukt:", e);
        const saveString = btoa(JSON.stringify(game));
        prompt("We konden niet automatisch kopiëren. Kopieer deze code handmatig:", saveString);
    }
}

// IMPORT: Laadt een code in
function importGame() {
    const code = prompt("📥 Plak je savecode hier:");
    if (!code) return;
    try {
        const decoded = JSON.parse(atob(code));
        if (decoded && decoded.resources) {
            if (confirm("⚠️ Weet je dit heel zeker? Het laden van een save overschrijft je HUDIGE voortgang direct!")) {
                game = decoded;
                saveGame();
                alert("✅ Savegame succesvol ingeladen! De game wordt nu herstart.");
                window.location.reload();
            }
        } else {
            alert("❌ Dit lijkt geen geldige savecode voor deze game te zijn.");
        }
    } catch (e) {
        alert("❌ Ongeldige savecode! Check of je de hele code hebt gekopieerd.");
    }
}

// HARDE RESET: Alles weg, inclusief Prestige
function hardReset() {
    const firstCheck = confirm("⚠️ GEVAAR: Dit wist je VOLLEDIGE voortgang, INCLUSIEF al je Prestige punten en upgrades.\n\nKlik alleen op OK als je letterlijk vanaf NUL wilt beginnen.");

    if (firstCheck) {
        const checkWord = prompt("Om te bevestigen dat dit geen ongeluk is, typ het woord RESET in hoofdletters:");

        if (checkWord === "RESET") {
            localStorage.removeItem('myGameSave');
            alert("🧨 Je hele beschaving is vernietigd. De begin der tijden start nu opnieuw.");
            window.location.reload();
        } else {
            alert("Harde reset geannuleerd. Je beschaving is veilig.");
        }
    }
}
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



window.showTab = function(tabId) {
   // console.log("Wisselen naar tab:", tabId); // Zie je dit in de console?
    // 1. Vertel de game welke tab nu 'actief' is
    window.currentTab = tabId;

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

    // 3. De navigatieknoppen ook een 'active' uiterlijk geven
    const nav = document.getElementById('main-nav');
    if (nav) {
        const buttons = nav.querySelectorAll('button');
        for (let btn of buttons) {
            btn.classList.remove('active');
        }
    }
    
    // Activeer de juiste knop op basis van ID
    const activeBtn = document.getElementById('nav-btn-' + tabId);
    if (activeBtn) {
        activeBtn.classList.add('active');
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
  const saveString = btoa(JSON.stringify(game));
  if (navigator.clipboard && navigator.clipboard.writeText) {
    try {
      await navigator.clipboard.writeText(saveString);
      alert("Savecode gekopieerd naar klembord!");
      return;
    } catch (e) {
      // fallback below
    }
  }

  // Fallback for older browsers / insecure contexts
  const ta = document.createElement('textarea');
  ta.value = saveString;
  ta.style.position = 'fixed';
  ta.style.left = '-9999px';
  document.body.appendChild(ta);
  ta.select();
  try {
    document.execCommand('copy'); // deprecated but useful as fallback
    alert("Savecode gekopieerd naar klembord (fallback)!");
  } catch (e) {
    prompt("Kopieer deze code handmatig:", saveString);
  }
  document.body.removeChild(ta);
}

// IMPORT: Laadt een code in
function importGame() {
    const code = prompt("Plak je savecode hier:");
    if (!code) return;
    try {
        const decoded = JSON.parse(atob(code));
        if (confirm("Weet je het zeker? Dit overschrijft je huidige voortgang!")) {
            game = decoded;
            saveGame();
            window.location.reload();
        }
    } catch (e) {
        alert("Ongeldige savecode!");
    }
}

// HARDE RESET: Alles weg, inclusief Prestige
function hardReset() {
    const confirm1 = confirm("⚠️ GEVAAR: Dit wist ALLES, ook je Prestige punten en upgrades. Weet je het zeker?");
    if (confirm1) {
        const confirm2 = confirm("Laatste kans: Weet je het écht heel zeker? Dit kan niet ongedaan worden gemaakt.");
        if (confirm2) {
            localStorage.removeItem('myGameSave');
            window.location.reload();
        }
    }
}
// --- UI WORKSHOP TAB ---

function renderWorkshop() {
    const container = document.getElementById('tab-workshop');
    if (!container) return;
    
    // We tonen enkel als Houtzagerij is gebouwd
    if (game.buildings.wood_workshop.count < 1) {
        container.innerHTML = "<h3>Workshop</h3><p>Bouw een Houtzagerij om de Workshop te ontgrendelen.</p>";
        return;
    }

    let html = `<h3>Workshop</h3>
    <div class="panel">
        <p>Verwerk grondstoffen tot geavanceerde materialen.</p>
        <div class="grid-container">
            <div class="panel">
                <strong>Balken (Balk)</strong>
                <p>5 Hout -> 1 Balk</p>
                <button class="btn" onclick="refineResource('beam')">Maak Balk</button>
            </div>
            <div class="panel">
                <strong>Bakstenen (Baksteen)</strong>
                <p>5 Hout + 2 Steen -> 1 Baksteen</p>
                <button class="btn" onclick="refineResource('brick')">Maak Baksteen</button>
            </div>
        </div>
    </div>`;
    container.innerHTML = html;
}

window.refineResource = function(type) {
    if (type === 'beam') {
        if (game.resources.wood.amount >= 5) {
            game.resources.wood.amount -= 5;
            game.resources.beam.amount = Math.min(game.resources.beam.max, game.resources.beam.amount + 1);
            updateUI();
        }
    } else if (type === 'brick') {
        if (game.resources.wood.amount >= 5 && game.resources.stone.amount >= 2) {
            game.resources.wood.amount -= 5;
            game.resources.stone.amount -= 2;
            game.resources.brick.amount = Math.min(game.resources.brick.max, game.resources.brick.amount + 1);
            updateUI();
        }
    }
};
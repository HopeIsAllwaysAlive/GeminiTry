// --- UI EVENTS & MODALS ---

let isStreamModalOpen = false;

function renderActiveEvent() {
    const event = game.expeditions?.activeEvent;
    const container = document.getElementById('modal-container');
    if (!container) return;

    if (!event) {
        if (!isStreamModalOpen) container.style.display = 'none';
        return;
    }

    container.innerHTML = `
        <div style="position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.8);display:flex;justify-content:center;align-items:center;z-index:1000;">
            <div class="panel" style="max-width:500px; text-align:center;">
                <h2>${event.title}</h2>
                <p>${event.text}</p>
                <div style="margin-top: 20px; display: flex; flex-direction: column; gap: 10px;">
                    ${event.choices.map((c, i) => `
                        <button class="btn" onclick="executeEventChoice(${i})">${c.text}</button>
                    `).join('')}
                </div>
            </div>
        </div>
    `;
    container.style.display = 'block';
}

window.executeEventChoice = function(index) {
    const event = game.expeditions?.activeEvent;
    if (event && event.choices[index]) {
        event.choices[index].action();
        updateUI();
    }
};

function checkStreamSelection() {
    if (!game.currentStreams) game.currentStreams = {};
    const eraStr = String(game.era);
    if (game.currentStreams[eraStr] || isStreamModalOpen) return;

    isStreamModalOpen = true;
    const modal = document.getElementById('modal-container');
    modal.innerHTML = `
        <div style="position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.9);display:flex;justify-content:center;align-items:center;z-index:1000;">
            <div class="panel" style="max-width:400px;text-align:center;">
                <h2>Kies een Pad (Era ${game.era})</h2>
                <button class="btn" onclick="selectStream('Jagen')">Pad A: Jagen</button>
                <button class="btn" onclick="selectStream('Vuurbeheersing')">Pad B: Vuur</button>
                <button class="btn" onclick="selectStream('Vissen')">Pad C: Vissen</button>
            </div>
        </div>
    `;
    modal.style.display = 'block';
}

window.selectStream = function(name) {
    game.currentStreams[String(game.era)] = name;
    isStreamModalOpen = false;
    document.getElementById('modal-container').style.display = 'none';
    saveGame();
    updateUI();
};

function isStreamActive(streamName) {
    return Object.values(game.currentStreams).includes(streamName);
}

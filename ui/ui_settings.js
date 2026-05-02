// --- UI SETTINGS TAB ---

function renderSettings() { 
    document.getElementById('tab-settings').innerHTML = `
        <h2>Instellingen</h2>
        <div class="panel">
            <p>Beheer je voortgang. Een Hard Reset wist alles, inclusief prestige.</p>
            <button class="btn" onclick="saveGame(true)">Spel Opslaan</button>
            <button class="btn" onclick="exportGame()">Export Save (Copy)</button>
            <button class="btn" onclick="importGame()">Import Save</button>
            <hr style="border-color: #333; margin: 20px 0;">
            <button class="btn" style="color: #f38ba8; border-color: #f38ba8;" onclick="hardReset()">⚠️ HARD RESET</button>
        </div>
    `; 
}

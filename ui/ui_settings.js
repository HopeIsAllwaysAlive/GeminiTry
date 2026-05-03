// --- UI SETTINGS TAB ---

function renderSettings() { 
    if (!window.uiDirty.all && !window.uiDirty.settings) return;

    const container = document.getElementById('tab-settings');
    if (!container) return;

    container.innerHTML = `
        <h2>${t("label_settings")}</h2>
        <div class="panel" style="margin-bottom: 10px;">
            <label style="display: block; margin-bottom: 5px;">Taal / Language</label>
            <select onchange="setLanguage(this.value)" style="width: 100%; padding: 8px; background: var(--surface0); color: var(--text); border: 1px solid var(--overlay0); border-radius: 4px;">
                <option value="nl" ${game.settings.language === 'nl' ? 'selected' : ''}>Nederlands (Dutch)</option>
                <option value="en" ${game.settings.language === 'en' ? 'selected' : ''}>English</option>
            </select>
        </div>

        <div class="panel">
            <p>Beheer je voortgang. Een Hard Reset wist alles, inclusief prestige.</p>
            <button class="btn" onclick="saveGame(true)">${t("label_save")}</button>
            <button class="btn" onclick="exportGame()">${t("label_export")}</button>
            <button class="btn" onclick="importGame()">${t("label_import")}</button>
            <hr style="border-color: #333; margin: 20px 0;">
            <button class="btn" style="color: #f38ba8; border-color: #f38ba8;" onclick="hardReset()">⚠️ ${t("label_hard_reset")}</button>
        </div>
    `; 

    window.uiDirty.settings = false;
}

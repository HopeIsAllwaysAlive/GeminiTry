// --- INTERNATIONALIZATION DATA ---
const LANG_DATA = {
    en: {
        // Seasons
        "season_spring": "Spring",
        "season_summer": "Summer",
        "season_autumn": "Autumn",
        "season_winter": "Winter",

        // Resources
        "res_food": "Food",
        "res_wood": "Wood",
        "res_beam": "Beams",
        "res_stone": "Stone",
        "res_brick": "Bricks",
        "res_population": "Population",
        "res_gold": "Gold",
        "res_research": "Research",
        "res_intel": "Intel",

        // UI Labels
        "label_per_sec": "per sec",
        "label_max": "max",
        "label_idle": "idle",
        "label_total": "total",
        "label_year": "Year",
        "label_day": "Day",
        "label_buy": "Buy",
        "label_research": "Research",
        "label_cost": "Cost",
        "label_requires": "Requires",
        "label_assigned": "Assigned",
        "label_settings": "Settings",
        "label_save": "Save Game",
        "label_export": "Export Save",
        "label_import": "Import Save",
        "label_hard_reset": "HARD RESET",
        "label_storage": "Storage",
        "label_net": "Net",
        "label_no_production": "No passive production",
        "label_idle_pop": "Idle Population",
        "label_jobs": "City",
        "label_buildings": "Buildings",
        "label_resources": "Resources",
        "label_population": "Population",
        "label_explore": "Explore",
        "label_diplomacy": "Diplomacy",
        "label_military": "Military",
        "label_workshop": "Workshop",
        "label_era": "Era",
        "desc_resources_analysis": "Overview of production, consumption and multipliers.",

        // Messages
        "msg_game_saved": "Game manually saved.",
        "msg_new_year": "Year {0} has begun.",
        "msg_new_season": "The season is now {0}.",
        "msg_reset_confirm": "⚠️ DANGER: This will wipe your ENTIRE progress, INCLUDING all Prestige points and upgrades.\n\nClick OK only if you want to start from absolute ZERO.",
        "msg_reset_prompt": "To confirm this is not an accident, type the word RESET in all caps:",
        "msg_reset_success": "🧨 Your entire civilization has been destroyed. The beginning of time starts again.",
        "msg_reset_cancel": "Hard reset cancelled. Your civilization is safe."
    },
    nl: {
        // Seasons
        "season_spring": "Lente",
        "season_summer": "Zomer",
        "season_autumn": "Herfst",
        "season_winter": "Winter",

        // Resources
        "res_food": "Voedsel",
        "res_wood": "Hout",
        "res_beam": "Balken",
        "res_stone": "Steen",
        "res_brick": "Bakstenen",
        "res_population": "Bevolking",
        "res_gold": "Goud",
        "res_research": "Research",
        "res_intel": "Intel",

        // UI Labels
        "label_per_sec": "per sec",
        "label_max": "max",
        "label_idle": "vrij",
        "label_total": "totaal",
        "label_year": "Jaar",
        "label_day": "Dag",
        "label_buy": "Koop",
        "label_research": "Onderzoek",
        "label_cost": "Kosten",
        "label_requires": "Vereist",
        "label_assigned": "Toegewezen",
        "label_settings": "Instellingen",
        "label_save": "Spel Opslaan",
        "label_export": "Export Save",
        "label_import": "Import Save",
        "label_hard_reset": "HARD RESET",
        "label_storage": "Opslag",
        "label_net": "Netto",
        "label_no_production": "Geen passieve productie",
        "label_idle_pop": "Idle Bevolking",
        "label_jobs": "Stad",
        "label_buildings": "Gebouwen",
        "label_resources": "Grondstoffen",
        "label_population": "Bevolking",
        "label_explore": "Verkennen",
        "label_diplomacy": "Diplomatie",
        "label_military": "Militair",
        "label_workshop": "Werkplaats",
        "label_era": "Tijdperk",
        "desc_resources_analysis": "Overzicht van productie, consumptie en multipliers.",

        // Messages
        "msg_game_saved": "Spel handmatig opgeslagen.",
        "msg_new_year": "Jaar {0} is begonnen.",
        "msg_new_season": "Het seizoen is nu {0}.",
        "msg_reset_confirm": "⚠️ GEVAAR: Dit wist je VOLLEDIGE voortgang, INCLUSIEF al je Prestige punten en upgrades.\n\nKlik alleen op OK als je letterlijk vanaf NUL wilt beginnen.",
        "msg_reset_prompt": "Om te bevestigen dat dit geen ongeluk is, typ het woord RESET in hoofdletters:",
        "msg_reset_success": "🧨 Je hele beschaving is vernietigd. De begin der tijden start nu opnieuw.",
        "msg_reset_cancel": "Harde reset geannuleerd. Je beschaving is veilig."
    }
};

function setLanguage(lang) {
    if (LANG_DATA[lang]) {
        game.settings.language = lang;
        window.TRANSLATIONS = LANG_DATA[lang];
        
        // Refresh state names (since they were set at init)
        const initialState = getInitialState();
        for (let resKey in game.resources) {
            if (initialState.resources[resKey]) {
                const translationKey = resKey === 'researchPoints' ? 'res_research' : "res_" + resKey;
                game.resources[resKey].name = t(translationKey);
            }
        }
        game.seasonNames = [t("season_spring"), t("season_summer"), t("season_autumn"), t("season_winter")];
        
        markUiDirty('all');
        updateUI();
    }
}

// Initialize based on game settings if available, else default to NL
window.TRANSLATIONS = LANG_DATA.nl;
if (typeof game !== 'undefined' && game.settings && game.settings.language) {
    window.TRANSLATIONS = LANG_DATA[game.settings.language] || LANG_DATA.nl;
}

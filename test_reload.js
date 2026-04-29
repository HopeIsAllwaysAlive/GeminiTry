const fs = require('fs');

// Create a simple mock for the browser environment
global.window = {};
global.document = {
    addEventListener: () => {},
    getElementById: (id) => ({
        id,
        innerHTML: '',
        innerText: '',
        style: {},
        classList: { toggle: () => {} },
        appendChild: () => {},
        prepend: () => {},
        removeChild: () => {},
        childNodes: []
    }),
    createElement: () => ({ className: '', innerText: '' }),
    querySelectorAll: () => []
};
global.localStorage = {
    getItem: () => {
        try {
            return fs.readFileSync('test_save.json', 'utf8');
        } catch(e) {
            return null;
        }
    },
    setItem: (key, val) => fs.writeFileSync('test_save.json', val)
};
global.prompt = () => "RESET";
global.alert = () => {};

// Load the game files
eval(fs.readFileSync('state.js', 'utf8').replace('let game = {', 'var game = {'));
eval(fs.readFileSync('engine.js', 'utf8'));
eval(fs.readFileSync('ui.js', 'utf8'));

// Fake save
game.buildings.hut.count = 5;
game.buildings.farm_plot.count = 10;
game.research.toolmaking.researched = true;
game.research.food_storage.researched = true;

saveGame(); // Save it
console.log("Saved.");

// Now reload script to simulate fresh page load
eval(fs.readFileSync('state.js', 'utf8').replace('let game = {', 'var game = {'));
eval(fs.readFileSync('engine.js', 'utf8'));
eval(fs.readFileSync('ui.js', 'utf8'));

loadGame(); // Load it
console.log("Loaded.");

try {
    let researchHtml = renderResearchList();
    console.log("Research List HTML length:", researchHtml.length);
} catch (e) {
    console.error("Error rendering research:", e);
}

try {
    let buildingsHtml = renderBuildingsWithFilters();
    console.log("Buildings HTML length:", buildingsHtml.length);
} catch (e) {
    console.error("Error rendering buildings:", e);
}

try {
    let jobsHtml = renderJobs();
    // length is not available since renderJobs mutates container, but we check if it throws
    console.log("Jobs rendered");
} catch (e) {
    console.error("Error rendering jobs:", e);
}

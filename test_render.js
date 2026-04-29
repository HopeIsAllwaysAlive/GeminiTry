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
        removeChild: () => {},
        childNodes: []
    }),
    createElement: () => ({ className: '', innerText: '' }),
    querySelectorAll: () => []
};
global.localStorage = {
    getItem: () => fs.readFileSync('save.json', 'utf8').catch(() => null),
    setItem: () => {}
};
global.prompt = () => "RESET";
global.alert = () => {};

// Load the game files
eval(fs.readFileSync('state.js', 'utf8'));
eval(fs.readFileSync('engine.js', 'utf8'));
eval(fs.readFileSync('ui.js', 'utf8'));

// Try loading a dummy save that resembles what the user might have
const dummySave = getInitialState();
// simulate broken save with missing types functions
dummySave.expeditions.types = JSON.parse(JSON.stringify(dummySave.expeditions.types));
global.localStorage.getItem = () => JSON.stringify(dummySave);

loadGame();

const exploreContainer = document.getElementById('tab-explore');
renderExplore();
console.log("Explore HTML length:", exploreContainer.innerHTML.length);
console.log("Explore HTML:", exploreContainer.innerHTML.substring(0, 200));

console.log("Buildings HTML check:");
const buildingsContainer = document.getElementById('building-list');
renderBuildings();
console.log("Buildings HTML:", buildingsContainer.innerHTML.substring(0, 200));

// --- UI UTILITIES ---

function findResearchesForResource(resourceKey) {
    let list = [];
    for (let key in game.research) {
        const r = game.research[key];
        if (r.affects && r.affects.includes(resourceKey)) {
            list.push(r);
        }
    }
    return list;
}

function findJobsForConsumption(resourceKey) {
    let consumingJobs = [];
    for (let key in game.jobs) {
        let cjob = game.jobs[key];
        if (cjob.effect && cjob.effect[resourceKey] < 0) {
            consumingJobs.push(cjob);
        }
    }
    return consumingJobs;
}

function getResourceIcon(key) {
    const icons = { wood: '🌲', stone: '🧱', gold: '💰', food: '🍞', population: '👥', beam: '🪵', brick: '🧱', intel: '👁️', researchPoints: '🧪' };
    return icons[key] || '📦';
}

function findJobKeyForResource(resourceKey) {
    for (let key in game.jobs) {
        if (game.jobs[key].effect && game.jobs[key].effect[resourceKey] > 0) return key;
    }
    return null;
}

function findJobForResource(resourceKey) {
    const key = findJobKeyForResource(resourceKey);
    return key ? game.jobs[key] : null;
}

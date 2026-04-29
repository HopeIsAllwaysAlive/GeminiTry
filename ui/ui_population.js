// --- UI POPULATION TAB ---

function renderJobs() {
    const container = document.getElementById('jobs-container');
    if (!container) return;

    document.getElementById('pop-idle').innerText = getIdlePopulation();
    document.getElementById('pop-total').innerText = Math.floor(game.resources.population.amount);

    let html = '<div class="grid-container">';
    for (let key in game.jobs) {
        const job = game.jobs[key];
        if (!job.unlocked || (job.stream && !isStreamActive(job.stream))) continue;

        const canHire = getIdlePopulation() >= 1 && job.count < job.max;
        const canFire = job.count > 0;

        html += `
            <div class="panel">
                <strong>${job.name}</strong> (${job.count} / ${job.max})<br>
                <div style="margin-top: 5px;">
                    <button class="btn" onclick="assignJob('${key}', 1)" ${canHire ? '' : 'disabled'}>+</button>
                    <button class="btn" onclick="assignJob('${key}', -1)" ${canFire ? '' : 'disabled'}>-</button>
                </div>
            </div>
        `;
    }
    html += '</div>';
    container.innerHTML = html;
}

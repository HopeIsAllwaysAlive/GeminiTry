// --- UTILITIES ---

/**
 * Deep merge two objects.
 * @param {Object} target - The target object to merge into.
 * @param {Object} source - The source object to merge from.
 * @returns {Object} The merged object.
 */
function deepMerge(target, source) {
    for (const key in source) {
        if (source[key] instanceof Object && !Array.isArray(source[key]) && key in target && target[key] instanceof Object && !Array.isArray(target[key])) {
            deepMerge(target[key], source[key]);
        } else {
            target[key] = source[key];
        }
    }
    return target;
}

/**
 * Translation helper.
 * Supports placeholders: t("key", value1, value2) replaces {0}, {1} etc.
 */
function t(key, ...args) {
    let translation = key;
    if (window.TRANSLATIONS && window.TRANSLATIONS[key]) {
        translation = window.TRANSLATIONS[key];
    }
    
    // Replace {0}, {1} etc with args
    if (args.length > 0) {
        args.forEach((arg, i) => {
            translation = translation.replace(`{${i}}`, arg);
        });
    }
    
    return translation;
}

/**
 * Global "dirty" flags for UI updates
 */
window.uiDirty = {
    resources: true,
    jobs: true,
    buildings: true,
    research: true,
    explore: true,
    diplomacy: true,
    military: true,
    prestige: true,
    debug: true,
    all: true
};

function markUiDirty(category = 'all') {
    if (category === 'all') {
        for (let key in window.uiDirty) window.uiDirty[key] = true;
    } else if (window.uiDirty[category] !== undefined) {
        window.uiDirty[category] = true;
    }
}

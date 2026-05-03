// --- GAME BALANCE CONFIGURATION ---
// Central location for all "magic numbers" to allow easy tuning.

const GAME_BALANCE = {
    // Scaling factor for building and research costs (exponential)
    COST_SCALING: 1.15,

    // Prestige system multipliers
    PRESTIGE: {
        BOOST_PER_POINT: 0.01,    // 1% boost per prestige point
        STARTER_PACK_BONUS: 500   // Bonus resource max per level
    },

    // Population and job constants
    POPULATION: {
        GROWTH_RATE: 0.1,         // Base population gain per second (1/10)
        IDLE_FOOD_CONSUMPTION: 0.1, // Reduced from 1.2 to allow survival
        BASE_GATHERER_SLOTS: 10
    },

    // Seasonal production modifiers
    SEASONS: {
        SPRING: { food: 1.5, wood: 1.0 },
        SUMMER: { food: 1.0, wood: 1.0 },
        AUTUMN: { food: 1.0, wood: 1.1 },
        WINTER: { food: 0.25, wood: 0.75 }
    },

    // Base limits for resources (before building bonuses)
    BASE_LIMITS: {
        food: 250,
        wood: 250,
        stone: 150,
        brick: 50,
        beam: 50,
        gold: 1000,
        researchPoints: 500,
        intel: 250,
        population: 0
    },

    // Military and Diplomacy
    MILITARY: {
        REBELLION_BASE_INCREASE: 5,
        REBELLION_MIN_INCREASE: 0.1,
        SUPPRESSION_DIVISOR: 100
    }
};

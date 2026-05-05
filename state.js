window.currentTab = 'jobs'; // De standaard tab bij het opstarten
let buyAmount = 1;

const ERA_DEFINITIONS = {
    1: { name: "Prehistorie" }, 2: { name: "Bronstijd" }, 3: { name: "IJzertijd" }, 4: { name: "Klassieke Oudheid" },
    5: { name: "Middeleeuwen" }, 6: { name: "Renaissance" }, 7: { name: "Verlichting" }, 8: { name: "Industrie" },
    9: { name: "Atoom" }, 10: { name: "Digitaal" }, 11: { name: "Toekomst" }
};

const TRAIT_DEFINITIONS = {
    master_builder: { name: "Meesterbouwer", desc: "Verlaagt alle bouwkosten met 10%." },
    metabolism: { name: "Efficiente Stofwisseling", desc: "Idle voedselconsumptie -20%." },
    knowledge_seeker: { name: "Kenniszoeker", desc: "Research opbrengst +20%." }
};

// --- DE DATA (HET BREIN VAN DE GAME) ---
let game = {

    era: 1,
    traits: [],
    stats: { battlesWon: 0, treatiesSigned: 0, aggressiveActions: 0 },

    resources: {
        food: { name: t("res_food"), amount: 50, max: 250, perSec: 0, manualGain: 1, discovered: true },
        wood: { name: t("res_wood"), amount: 50, max: 250, perSec: 0, manualGain: 1, discovered: true },
        beam: { name: t("res_beam"), amount: 0, max: 50, perSec: 0, discovered: false },
        stone: { name: t("res_stone"), amount: 0, max: 150, perSec: 0, manualGain: 1, discovered: true },
        brick: { name: t("res_brick"), amount: 0, max: 50, perSec: 0, discovered: false },
        population: { name: t("res_population"), amount: 2, max: 2, perSec: 0, discovered: true },
        gold: { name: t("res_gold"), amount: 0, max: 1000, perSec: 0, discovered: false },
        researchPoints: { name: t("res_research"), amount: 0, max: 0, perSec: 0, discovered: false },
        intel: { name: t("res_intel"), amount: 0, max: 100, perSec: 0, discovered: false }
    },
    calendar: {
        day: 0,
        year: 0,
        season: 0 // 0: Spring, 1: Summer, 2: Autumn, 3: Winter
    },
    seasonNames: [t("season_spring"), t("season_summer"), t("season_autumn"), t("season_winter")],
    jobs: {
        gatherer: { name: "Verzamelaar", count: 0, max: 2, effect: { food: 1.5, wood: 0.3, stone: 0.1 }, unlocked: true, desc: "Een all-round verzamelaar van basis grondstoffen." },
        farmer: { name: "Boer", count: 0, max: 0, effect: { food: 2 }, unlocked: false },
        woodcutter: { name: "Houthakker", count: 0, max: 0, effect: { wood: 1, food: -1 }, unlocked: false },
        woodworker: { name: "Timmerman", count: 0, max: 0, effect: { wood: -3, food: -1, beam: 0.5 }, unlocked: false },
        miner: { name: "Mijnwerker", count: 0, max: 0, effect: { stone: 0.8, food: -1.5 }, unlocked: false },
        stoneworker: { name: "Metselaar", count: 0, max: 0, effect: { stone: -3, food: -1, brick: 0.5 }, unlocked: false },
        teacher: { name: "Leraar", count: 0, max: 0, effect: { researchPoints: 0.5, food: -1 }, unlocked: false },
        scout_job: { name: "Verkenner", count: 0, max: 0, effect: { intel: 1, food: -2 }, unlocked: false },
        soldier: { name: "Soldaat", count: 0, max: 0, effect: { gold: -0.1, food: -2 }, unlocked: false },
        banker: { name: "Bankier", count: 0, max: 0, effect: { gold: 1 }, unlocked: false },
        // Era 1 & 2 Streams
        hunter: { name: "Jager", count: 0, max: 0, effect: { food: 1.5, intel: 0.2 }, unlocked: false },
        firekeeper: { name: "Vuurbewaarder", count: 0, max: 0, effect: { researchPoints: 0.5, wood: -0.5 }, unlocked: false },
        fisher: { name: "Visser", count: 0, max: 0, effect: { food: 3 }, unlocked: false },
        scribe: { name: "Klerk", count: 0, max: 0, effect: { researchPoints: 2, food: -1 }, unlocked: false },
        merchant: { name: "Marktkoopman", count: 0, max: 0, effect: { gold: 0.5, food: -0.5 }, unlocked: false },
        // Era 3 Streams
        blacksmith: { name: "Smid", count: 0, max: 0, effect: { brick: -0.5, gold: 1, food: -2 }, unlocked: false },
        philosopher: { name: "Filosoof", count: 0, max: 0, effect: { researchPoints: 5, intel: 1, food: -1 }, unlocked: false },
        navigator: { name: "Navigator", count: 0, max: 0, effect: { gold: 3, intel: 2, food: -2 }, unlocked: false },
        // Era 4 Streams
        gladiator: { name: "Gladiator", count: 0, max: 0, effect: { gold: 4, food: -3 }, unlocked: false },
        senator: { name: "Senator", count: 0, max: 0, effect: { intel: 3, researchPoints: 5, gold: -2 }, unlocked: false },
        engineer: { name: "Ingenieur", count: 0, max: 0, effect: { stone: 5, brick: 5, food: -2 }, unlocked: false },
        // Era 5
        knight_lord: { name: "Ridderlijk Heer", count: 0, max: 0, effect: { gold: 3, food: 2, intel: -1 }, unlocked: false },
        monk: { name: "Monnik", count: 0, max: 0, effect: { researchPoints: 8, intel: 2, food: -2 }, unlocked: false },
        artisan: { name: "Ambachtsman", count: 0, max: 0, effect: { brick: 4, beam: 4, gold: 2, food: -3 }, unlocked: false },
        // Era 6
        musketeer: { name: "Musketier", count: 0, max: 0, effect: { gold: 6, intel: 1, beam: -2, brick: -2 }, unlocked: false },
        artist: { name: "Kunstenaar", count: 0, max: 0, effect: { researchPoints: 12, gold: 5, intel: 3, food: -3 }, unlocked: false },
        explorer: { name: "Ontdekkingsreiziger", count: 0, max: 0, effect: { intel: 10, gold: 8, food: -4 }, unlocked: false },
        // Era 7
        colonist: { name: "Kolonist", count: 0, max: 0, effect: { food: 15, wood: 10, stone: 10, gold: -5 }, unlocked: false },
        scientist: { name: "Wetenschapper", count: 0, max: 0, effect: { researchPoints: 25, intel: 5, gold: -4 }, unlocked: false },
        trader: { name: "Handelaar", count: 0, max: 0, effect: { gold: 20, food: 5, intel: -3 }, unlocked: false },
        // Era 8
        factory_worker: { name: "Fabrieksarbeider", count: 0, max: 0, effect: { beam: 15, brick: 15, food: -5 }, unlocked: false },
        mechanical_engineer: { name: "Engineer", count: 0, max: 0, effect: { researchPoints: 40, intel: 10, beam: -5 }, unlocked: false },
        union_leader: { name: "Vakbondsleider", count: 0, max: 0, effect: { gold: 15, researchPoints: 5, food: -4 }, unlocked: false },
        // Era 9
        nuclear_physicist: { name: "Kernfysicus", count: 0, max: 0, effect: { gold: 50, researchPoints: 60, food: -10 }, unlocked: false },
        quantum_scientist: { name: "Kwantumwetenschapper", count: 0, max: 0, effect: { researchPoints: 100, intel: 20, gold: -10 }, unlocked: false },
        pilot: { name: "Piloot", count: 0, max: 0, effect: { intel: 30, gold: 40, beam: -10, brick: -10 }, unlocked: false },
        // Era 10
        hacker: { name: "Hacker", count: 0, max: 0, effect: { gold: 100, intel: 50, researchPoints: -20 }, unlocked: false },
        ai_developer: { name: "AI Developer", count: 0, max: 0, effect: { researchPoints: 200, gold: 20, food: -15 }, unlocked: false },
        crypto_trader: { name: "Crypto Trader", count: 0, max: 0, effect: { gold: 300, intel: -10 }, unlocked: false },
        // Era 11
        space_marine: { name: "Ruimtemarinier", count: 0, max: 0, effect: { gold: 500, intel: 100, food: -30 }, unlocked: false },
        cyborg: { name: "Cyborg", count: 0, max: 0, effect: { researchPoints: 500, intel: 100, gold: -50 }, unlocked: false },
        solar_architect: { name: "Zonnearchitect", count: 0, max: 0, effect: { beam: 200, brick: 200, gold: 200 }, unlocked: false }
    },
    buildings: {
        flint_monument: { name: "Vuursteen Monument", count: 0, cost: { wood: 2500, stone: 1000, food: 1000 }, provides: {}, desc: "Een machtig monument. Het voltooien hiervan luidt een nieuw tijdperk in!", unlocked: true },
        // Era 1 Streams
        hunters_camp: { name: "Jagerskamp", count: 0, cost: { wood: 150, food: 50 }, provides: { job_hunter: 2 }, desc: "Werkplek voor jagers. (+Voedsel, +Intel)", unlocked: false, stream: "Jagen" },
        fire_pit: { name: "Vuurplaats", count: 0, cost: { wood: 250, stone: 50 }, provides: { max_population: 5, job_firekeeper: 1 }, desc: "Houdt dieren weg. (+Bevolking, +Research)", unlocked: false, stream: "Vuurbeheersing" },
        smokehouse: { name: "Rookhuis", count: 0, cost: { wood: 500, stone: 150 }, provides: { max_food: 300 }, desc: "Maakt voedsel lang houdbaar.", unlocked: false, stream: "Vuurbeheersing" },
        fishing_pier: { name: "Vissteiger", count: 0, cost: { wood: 200, food: 50 }, provides: { job_fisher: 2 }, desc: "Een plek om enorme hoeveelheden vis te vangen.", unlocked: false, stream: "Vissen" },
        boat_builder: { name: "Botenbouwer", count: 0, cost: { wood: 600 }, provides: { job_fisher: 3, max_wood: 100 }, desc: "Kano's voor dieper water.", unlocked: false, stream: "Vissen" },
        // Era 2 Streams
        guard_tower: { name: "Uitkijktoren", count: 0, cost: { wood: 300, stone: 100 }, provides: { job_scout_job: 5, max_intel: 100 }, desc: "Versterkte verkenning en veiligheid.", unlocked: false },
        scribe_hut: { name: "Schrijvershut", count: 0, cost: { wood: 200, food: 100 }, provides: { job_scribe: 2, max_researchPoints: 500 }, desc: "Klerken verwerken informatie sneller.", unlocked: false },
        library: { name: "Bibliotheek", count: 0, cost: { wood: 500, stone: 200 }, provides: { job_teacher: 5, max_researchPoints: 1500 }, desc: "Het absolute kenniscentrum van Tijdperk 2.", unlocked: false },
        market_stall: { name: "Marktkraam", count: 0, cost: { wood: 100, stone: 50 }, provides: { job_merchant: 2 }, desc: "Beginnende ruilhandel genereert wat goud.", unlocked: false },
        trading_post: { name: "Handelspost", count: 0, cost: { wood: 400, stone: 200 }, provides: { max_gold: 1500, job_merchant: 5 }, desc: "Knooppunt voor verre handelaren.", unlocked: false },
        // Era 3 Streams
        iron_mine: { name: "IJzermijn", count: 0, cost: { wood: 500, stone: 500 }, provides: { job_blacksmith: 2 }, desc: "Een diepe mijn voor sterker metaal.", unlocked: false },
        forge: { name: "Smidse", count: 0, cost: { brick: 200, beam: 200, gold: 500 }, provides: { max_brick: 1000, job_blacksmith: 5 }, desc: "Hier worden ijzeren voorwerpen gesmeed.", unlocked: false },
        academy: { name: "Academie", count: 0, cost: { wood: 800, stone: 400, gold: 200 }, provides: { job_philosopher: 2, max_researchPoints: 2000 }, desc: "Een plek voor denkers.", unlocked: false },
        forum: { name: "Forum", count: 0, cost: { brick: 500, gold: 1000 }, provides: { job_philosopher: 5, max_intel: 500 }, desc: "Publiek debat versterkt de kennis.", unlocked: false },
        shipyard: { name: "Scheepswerf", count: 0, cost: { beam: 300, wood: 1000 }, provides: { job_navigator: 2 }, desc: "Bouwt boten voor de verre handel.", unlocked: false },
        harbor: { name: "Haven", count: 0, cost: { beam: 500, stone: 1000, gold: 2000 }, provides: { max_gold: 5000, job_navigator: 5 }, desc: "Een enorm handelsknooppunt over zee.", unlocked: false },
        // Era 4 Streams
        colosseum: { name: "Colosseum", count: 0, cost: { brick: 2000, stone: 5000 }, provides: { job_gladiator: 5, max_population: 50 }, desc: "Gladiatorengevechten leveren massief goud op.", unlocked: false },
        siege_workshop: { name: "Belegeringswerkplaats", count: 0, cost: { wood: 3000, beam: 1000 }, provides: { job_gladiator: 2, max_gold: 5000 }, desc: "Bouwt wapens voor de verovering.", unlocked: false },
        senate_house: { name: "Senaatsgebouw", count: 0, cost: { stone: 2000, gold: 3000 }, provides: { job_senator: 5, max_intel: 1000 }, desc: "Het politieke hart van je rijk.", unlocked: false },
        public_baths: { name: "Badhuis", count: 0, cost: { stone: 4000, brick: 1000 }, provides: { max_population: 100, job_senator: 2 }, desc: "Verbetert de publieke hygiëne enorm.", unlocked: false },
        paved_road: { name: "Verharde Weg", count: 0, cost: { stone: 5000, brick: 5000 }, provides: { job_engineer: 3, max_stone: 10000 }, desc: "Grootschalige logistiek.", unlocked: false },
        aqueduct: { name: "Aquaduct", count: 0, cost: { brick: 8000, gold: 2000 }, provides: { max_food: 10000, job_engineer: 2 }, desc: "Voorziet steden van vers water.", unlocked: false },
        // Era 5 Streams
        castle: { name: "Kasteel", count: 0, cost: { stone: 10000, wood: 5000 }, provides: { job_knight_lord: 5, max_population: 100 }, desc: "Een machtig fort voor ridders.", unlocked: false },
        feudal_estate: { name: "Feodaal Landgoed", count: 0, cost: { gold: 5000, food: 10000 }, provides: { job_knight_lord: 2, max_food: 15000 }, desc: "Uitgestrekte landerijen.", unlocked: false },
        monastery: { name: "Klooster", count: 0, cost: { stone: 8000, wood: 4000 }, provides: { job_monk: 5, max_researchPoints: 5000 }, desc: "Een plek voor stilte en studie.", unlocked: false },
        cathedral: { name: "Kathedraal", count: 0, cost: { brick: 15000, gold: 10000 }, provides: { job_monk: 2, max_intel: 2000 }, desc: "Een monumentaal religieus gebouw.", unlocked: false },
        guild_hall: { name: "Gildehuis", count: 0, cost: { beam: 5000, brick: 5000 }, provides: { job_artisan: 5, max_gold: 15000 }, desc: "Het centrum van handel en ambacht.", unlocked: false },
        market_square: { name: "Marktplein", count: 0, cost: { wood: 10000, stone: 10000 }, provides: { job_artisan: 2, max_population: 200 }, desc: "Vergroot de bevolking en trekt ambachtslieden aan.", unlocked: false },
        // Era 6 Streams
        cannon_foundry: { name: "Kanongieterij", count: 0, cost: { beam: 10000, brick: 10000, gold: 15000 }, provides: { job_musketeer: 5, max_gold: 20000 }, desc: "Produceert verwoestende wapens.", unlocked: false },
        star_fort: { name: "Sterfort", count: 0, cost: { brick: 25000, stone: 20000 }, provides: { job_musketeer: 2, max_population: 300 }, desc: "Onneembare verdedigingslinie.", unlocked: false },
        printing_press: { name: "Drukpers", count: 0, cost: { beam: 8000, gold: 10000 }, provides: { job_artist: 5, max_researchPoints: 15000 }, desc: "Verspreidt kennis razendsnel.", unlocked: false },
        art_academy: { name: "Kunstacademie", count: 0, cost: { stone: 15000, gold: 12000 }, provides: { job_artist: 2, max_intel: 5000 }, desc: "Opleidingscentrum voor de meesters.", unlocked: false },
        observatory: { name: "Observatorium", count: 0, cost: { brick: 12000, researchPoints: 10000 }, provides: { job_explorer: 5, max_intel: 10000 }, desc: "Bestudeer de sterren en ontdek de wereld.", unlocked: false },
        naval_base: { name: "Vlootbasis", count: 0, cost: { beam: 15000, gold: 20000 }, provides: { job_explorer: 2, max_gold: 30000 }, desc: "Bouwt expeditieschepen.", unlocked: false },
        // Era 7 Streams
        governor_mansion: { name: "Gouverneurshuis", count: 0, cost: { gold: 30000, brick: 20000 }, provides: { job_colonist: 5, max_food: 50000 }, desc: "Zetel van de overzeese macht.", unlocked: false },
        colony: { name: "Kolonie", count: 0, cost: { beam: 20000, food: 40000 }, provides: { job_colonist: 2, max_population: 500 }, desc: "Uitbreiding van je rijk over zee.", unlocked: false },
        laboratory: { name: "Laboratorium", count: 0, cost: { brick: 20000, researchPoints: 20000 }, provides: { job_scientist: 5, max_researchPoints: 40000 }, desc: "Moderne onderzoeksfaciliteit.", unlocked: false },
        science_institute: { name: "Wetenschappelijk Instituut", count: 0, cost: { gold: 25000, beam: 15000 }, provides: { job_scientist: 2, max_intel: 15000 }, desc: "Bundelt de knapste koppen.", unlocked: false },
        stock_exchange: { name: "Beurs", count: 0, cost: { gold: 50000, brick: 30000 }, provides: { job_trader: 5, max_gold: 100000 }, desc: "Laat kapitaal exponentieel groeen.", unlocked: false },
        trading_company: { name: "Oost-Indisch Huis", count: 0, cost: { beam: 30000, gold: 40000 }, provides: { job_trader: 2, max_population: 400 }, desc: "De eerste multinationals.", unlocked: false },
        // Era 8 Streams
        steam_factory: { name: "Stoommachinefabriek", count: 0, cost: { brick: 50000, beam: 40000 }, provides: { job_factory_worker: 5, max_beam: 20000, max_brick: 20000 }, desc: "Massaproductie in de hoogste versnelling.", unlocked: false },
        assembly_line: { name: "Lopende Band", count: 0, cost: { gold: 60000, researchPoints: 30000 }, provides: { job_factory_worker: 2, max_population: 1000 }, desc: "Ultieme industriële efficiëntie.", unlocked: false },
        coal_mine: { name: "Kolenmijn", count: 0, cost: { beam: 30000, stone: 80000 }, provides: { job_mechanical_engineer: 5, max_intel: 30000 }, desc: "Brandstof voor de revolutie.", unlocked: false },
        power_plant: { name: "Energiecentrale", count: 0, cost: { brick: 60000, gold: 80000 }, provides: { job_mechanical_engineer: 2, max_researchPoints: 80000 }, desc: "Voorziet de stad van stroom.", unlocked: false },
        union_hall: { name: "Vakbondshuis", count: 0, cost: { food: 100000, gold: 50000 }, provides: { job_union_leader: 5, max_population: 1500 }, desc: "Strijdt voor betere rechten.", unlocked: false },
        worker_district: { name: "Arbeiderswijk", count: 0, cost: { brick: 40000, beam: 40000 }, provides: { job_union_leader: 2, max_food: 100000 }, desc: "Huisvesting voor de massa.", unlocked: false },
        // Era 9 Streams
        uranium_mine: { name: "Uraniummijn", count: 0, cost: { beam: 80000, gold: 150000 }, provides: { job_nuclear_physicist: 5, max_gold: 500000 }, desc: "Gevaarlijk maar lucratief.", unlocked: false },
        nuclear_reactor: { name: "Kernreactor", count: 0, cost: { brick: 150000, researchPoints: 100000 }, provides: { job_nuclear_physicist: 2, max_researchPoints: 200000 }, desc: "Eindeloze energie.", unlocked: false },
        particle_accelerator: { name: "Deeltjesversneller", count: 0, cost: { gold: 200000, researchPoints: 150000 }, provides: { job_quantum_scientist: 5, max_researchPoints: 300000 }, desc: "Onderzoekt de fundamentele bouwstenen.", unlocked: false },
        quantum_lab: { name: "Kwantumlab", count: 0, cost: { beam: 100000, intel: 50000 }, provides: { job_quantum_scientist: 2, max_intel: 100000 }, desc: "Breekt de wetten van de natuurkunde.", unlocked: false },
        airport: { name: "Vliegveld", count: 0, cost: { brick: 120000, beam: 120000 }, provides: { job_pilot: 5, max_population: 3000 }, desc: "Wereldwijde logistiek.", unlocked: false },
        aerospace_factory: { name: "Luchtvaartfabriek", count: 0, cost: { gold: 250000, researchPoints: 80000 }, provides: { job_pilot: 2, max_gold: 800000 }, desc: "Bouwt vliegtuigen.", unlocked: false },
        // Era 10 Streams
        server_farm: { name: "Serverboerderij", count: 0, cost: { gold: 500000, beam: 200000 }, provides: { job_hacker: 5, max_intel: 300000 }, desc: "Verwerkt enorme hoeveelheden data.", unlocked: false },
        cyber_defense_center: { name: "Cyberdefensie Centrum", count: 0, cost: { researchPoints: 400000, gold: 400000 }, provides: { job_hacker: 2, max_gold: 1500000 }, desc: "Bewaakt de firewalls.", unlocked: false },
        data_center: { name: "Datacenter", count: 0, cost: { brick: 300000, gold: 600000 }, provides: { job_ai_developer: 5, max_researchPoints: 1000000 }, desc: "De longen van kunstmatige intelligentie.", unlocked: false },
        neural_network: { name: "Neuraal Netwerk", count: 0, cost: { researchPoints: 600000, intel: 200000 }, provides: { job_ai_developer: 2, max_food: 500000 }, desc: "Een brein van silicium.", unlocked: false },
        world_trade_center: { name: "World Trade Center", count: 0, cost: { brick: 500000, beam: 500000 }, provides: { job_crypto_trader: 5, max_gold: 5000000 }, desc: "Het financiële centrum van de aarde.", unlocked: false },
        multinational_corp: { name: "Multinational", count: 0, cost: { gold: 1000000, researchPoints: 300000 }, provides: { job_crypto_trader: 2, max_population: 10000 }, desc: "Bedrijven machtiger dan landen.", unlocked: false },
        // Era 11 Streams
        starbase: { name: "Sterrenbasis", count: 0, cost: { beam: 1000000, brick: 1000000 }, provides: { job_space_marine: 5, max_population: 50000 }, desc: "Je uitkijkpost in de kosmos.", unlocked: false },
        space_fleet: { name: "Ruimtevloot", count: 0, cost: { gold: 5000000, intel: 1000000 }, provides: { job_space_marine: 2, max_gold: 20000000 }, desc: "Domineer de Melkweg.", unlocked: false },
        mind_upload_center: { name: "Mind Upload Center", count: 0, cost: { researchPoints: 2000000, gold: 2000000 }, provides: { job_cyborg: 5, max_researchPoints: 10000000 }, desc: "Ontsnap aan het biologische.", unlocked: false },
        megastructure: { name: "Megastructuur", count: 0, cost: { brick: 2000000, beam: 2000000 }, provides: { job_cyborg: 2, max_intel: 5000000 }, desc: "Een huis voor miljarden bewustzijnen.", unlocked: false },
        orbital_shipyard: { name: "Orbitale Werf", count: 0, cost: { gold: 4000000, beam: 2000000 }, provides: { job_solar_architect: 5, max_beam: 5000000, max_brick: 5000000 }, desc: "Bouwt planetair grote schepen.", unlocked: false },
        dyson_swarm: { name: "Dyson Zwerm", count: 0, cost: { researchPoints: 5000000, intel: 2000000 }, provides: { job_solar_architect: 2, max_gold: 50000000 }, desc: "Oogst de energie van een hele ster.", unlocked: false },
        // Basis gebouwen
        hut: { name: "Hut", count: 1, cost: { wood: 50 }, provides: { max_population: 2 }, desc: "Woonruimte voor je bevolking.", unlocked: true },
        house: { name: "Huis", count: 0, cost: { beam: 150, brick: 200 }, provides: { max_population: 5 }, desc: "Een stevig huis voor je inwoners.", unlocked: false },
        farm_plot: { name: "Akker", count: 0, cost: { wood: 100, stone: 40 }, provides: { job_farmer: 2, max_food: 20 }, desc: "Grond om voedsel te verbouwen.", unlocked: true },
        irrigation_system: { name: "Irrigatie Systeem", count: 0, cost: { wood: 500, stone: 800, gold: 500 }, provides: { max_food: 500 }, desc: "Verbetert de watertoevoer naar de akkers.", unlocked: false },
        lumber_camp: { name: "Houthakkerskamp", count: 0, cost: { wood: 150 }, provides: { job_woodcutter: 2, max_wood: 20 }, desc: "Werkplek voor houthakkers.", unlocked: true },
        wood_workshop: { name: "Houtzagerij", count: 0, cost: { wood: 1500, stone: 500 }, provides: { job_woodworker: 1, max_beam: 50 }, desc: "Verbetert houtproductie en opslag.", unlocked: false },
        quarry: { name: "Steenhouwerij", count: 0, cost: { wood: 200, food: 200 }, provides: { job_miner: 2, max_stone: 10 }, desc: "Plek om steen te winnen.", unlocked: false },
        stone_workshop: { name: "Steenoven", count: 0, cost: { wood: 1500, stone: 2000 }, provides: { job_stoneworker: 1, max_brick: 100 }, desc: "Verbetert steenproductie en opslag.", unlocked: false },
        warehouse: { name: "Pakhuis", count: 0, cost: { wood: 500, stone: 500 }, provides: { max_wood: 100, max_food: 100, max_stone: 100 }, desc: "Vergroot opslagcapaciteit voor basis grondstoffen.", unlocked: false },
        storage_house: { name: "Opslaghuis", count: 0, cost: { beam: 500, brick: 500 }, provides: { max_wood: 500, max_stone: 500, max_beam: 200, max_brick: 200 }, desc: "Een massief opslaghuis voor geavanceerde grondstoffen.", unlocked: false },
        school: { name: "School", count: 0, cost: { wood: 100, stone: 50 }, provides: { job_teacher: 1, max_researchPoints: 100 }, desc: "Een plek waar leraren research genereren.", unlocked: false },
        scout_post: { name: "Verkennerspost", count: 0, cost: { wood: 80, food: 40 }, provides: { job_scout_job: 3, max_intel: 50 }, desc: "Traint inwoners om de wereld te verkennen en vergroot opslag voor Intel (+50).", unlocked: false },
        barracks: { name: "Kazerne", count: 0, cost: { wood: 200, stone: 300, gold: 100 }, provides: { job_soldier: 20 }, desc: "Huisvesting voor je leger. Elke kazerne biedt plek aan 20 soldaten.", unlocked: false },
        bank: { name: "Bank", count: 0, cost: { wood: 200, stone: 200, gold: 500 }, provides: { max_gold: 2000, job_banker: 1 }, desc: "Vergroot de opslagcapaciteit voor goud en genereert rente.", unlocked: false },
        silo: { name: "Silo", count: 0, cost: { wood: 100, stone: 50 }, provides: { max_food: 500 }, desc: "Een grote opslagplaats voor voedsel.", unlocked: false }
    },

    research: {
        specialization: {
            name: "Specialisatie",
            desc: "Leert je volk om zich te focussen. Ontgrendelt Boeren en Houthakkers, maar maakt Verzamelaars overbodig. <br><b style='color: var(--red);'>LET OP:</b> Je voedselproductie valt direct stil totdat je nieuwe Boeren toewijst!",
            cost: { food: 50, wood: 50 },
            unlocked: true,
            requirement: () => game.resources.population.amount >= 5,
            affects: ["food", "wood"]
        },
        path_hunting: {
            name: "Pad van de Jager",
            desc: "Focus op jacht en verkenning. (Exclusief: Pad van Vuur/Vissen)",
            cost: { food: 100, wood: 50 },
            unlocked: false,
            excludes: ["path_fire", "path_fishing"],
            requirement: () => game.prestige.totalEarned > 0 && game.achievements.great_conqueror,
            affects: ["food", "intel"]
        },
        path_fire: {
            name: "Pad van het Vuur",
            desc: "Focus op technologie en groei. (Exclusief: Pad van Jager/Vissen)",
            cost: { food: 100, wood: 50 },
            unlocked: false,
            excludes: ["path_hunting", "path_fishing"],
            requirement: () => game.prestige.totalEarned > 0 && game.achievements.the_discoverer,
            affects: ["researchPoints", "population"]
        },
        path_fishing: {
            name: "Pad van de Visser",
            desc: "Focus op overvloed en water. (Exclusief: Pad van Jager/Vuur)",
            cost: { food: 100, wood: 50 },
            unlocked: false,
            excludes: ["path_hunting", "path_fire"],
            requirement: () => game.prestige.totalEarned > 0 && game.achievements.trade_lord,
            affects: ["food"]
        },
        food_storage: {
            name: "Voedselopslag",
            desc: "Maakt het bouwen van Silo's mogelijk voor massale voedselopslag.",
            cost: { researchPoints: 200, wood: 500 },
            unlocked: false,
            requirement: () => game.buildings.farm_plot.count >= 10,
            affects: ["food"]
        },
        // Era 1 Streams
        cooking: {
            name: "Kookkunst",
            desc: "Voedsel wordt efficiënter verteerd. Speelt het Rookhuis vrij voor opslag.",
            cost: { food: 30, researchPoints: 20 },
            unlocked: false,

            requirement: () => game.buildings.fire_pit && game.buildings.fire_pit.count >= 1,
            affects: ["food"]
        },
        fishing_nets: {
            name: "Vangnetten",
            desc: "Speelt de Botenbouwer vrij voor betere visserij.",
            cost: { wood: 100, food: 50 },
            unlocked: false,

            requirement: () => game.buildings.fishing_pier && game.buildings.fishing_pier.count >= 1,
            affects: ["food"]
        },
        spear_crafting: {
            name: "Speer Vervaardiging",
            desc: "Maakt toekomstige offensieve expedities makkelijker.",
            cost: { wood: 100, intel: 20 },
            unlocked: false,

            requirement: () => game.buildings.hunters_camp && game.buildings.hunters_camp.count >= 2,
            affects: ["intel"]
        },
        // Era 2 Streams
        bronze_weapons: {
            name: "Bronzen Wapens",
            desc: "Een opstapje voor krachtigere gevechtseenheden.",
            cost: { stone: 200, researchPoints: 100 },
            unlocked: false,

            requirement: () => game.buildings.guard_tower && game.buildings.guard_tower.count >= 1,
            affects: ["gold"]
        },
        record_keeping: {
            name: "Boekhouding",
            desc: "Gestructureerde verwerking van data. Ontgrendelt de Bibliotheek.",
            cost: { researchPoints: 200, wood: 200 },
            unlocked: false,

            requirement: () => game.buildings.scribe_hut && game.buildings.scribe_hut.count >= 1,
            affects: ["researchPoints"]
        },
        currency: {
            name: "Valuta",
            desc: "Ontgrendelt de grootschalige Handelspost.",
            cost: { gold: 100, researchPoints: 50 },
            unlocked: false,

            requirement: () => game.buildings.market_stall && game.buildings.market_stall.count >= 2,
            affects: ["gold"]
        },
        // Era 3 Streams
        iron_working: {
            name: "IJzerbewerking",
            desc: "Speelt de IJzermijn vrij voor ijzersterke materialen.",
            cost: { researchPoints: 1000, stone: 1000 },
            unlocked: false,

            requirement: () => game.era >= 3,
            affects: ["stone"]
        },
        advanced_smelting: {
            name: "Geavanceerd Smeden",
            desc: "Speelt de Smidse vrij.",
            cost: { brick: 500, researchPoints: 2000 },
            unlocked: false,

            requirement: () => game.buildings.iron_mine && game.buildings.iron_mine.count >= 1,
            affects: ["brick"]
        },
        logic_philosophy: {
            name: "Logica",
            desc: "Speelt de Academie vrij.",
            cost: { researchPoints: 1200, wood: 1000 },
            unlocked: false,

            requirement: () => game.era >= 3,
            affects: ["researchPoints"]
        },
        ethics: {
            name: "Ethiek",
            desc: "Speelt het Forum vrij.",
            cost: { intel: 200, researchPoints: 2500 },
            unlocked: false,

            requirement: () => game.buildings.academy && game.buildings.academy.count >= 1,
            affects: ["intel", "researchPoints"]
        },
        shipbuilding: {
            name: "Scheepsbouw",
            desc: "Speelt de Scheepswerf vrij voor overzeese verkenning.",
            cost: { researchPoints: 1000, beam: 200 },
            unlocked: false,

            requirement: () => game.era >= 3,
            affects: ["intel"]
        },
        astronomy: {
            name: "Astronomie",
            desc: "Navigeer op de sterren. Speelt de Haven vrij.",
            cost: { intel: 200, researchPoints: 2000 },
            unlocked: false,

            requirement: () => game.buildings.shipyard && game.buildings.shipyard.count >= 1,
            affects: ["gold", "intel"]
        },
        // Era 4 Streams
        military_engineering: {
            name: "Militaire Bouwkunde",
            desc: "Speelt de Belegeringswerkplaats vrij.",
            cost: { researchPoints: 3000, beam: 1000 },
            unlocked: false,

            requirement: () => game.era >= 4,
            affects: ["gold"]
        },
        gladiator_combats: {
            name: "Gladiatorengevechten",
            desc: "Speelt het Colosseum vrij.",
            cost: { gold: 3000, researchPoints: 4000 },
            unlocked: false,

            requirement: () => game.buildings.siege_workshop && game.buildings.siege_workshop.count >= 1,
            affects: ["gold"]
        },
        civic_duty: {
            name: "Burgerplicht",
            desc: "Speelt het Badhuis vrij.",
            cost: { researchPoints: 3000, brick: 1000 },
            unlocked: false,

            requirement: () => game.era >= 4,
            affects: ["researchPoints"]
        },
        constitution: {
            name: "Grondwet",
            desc: "Speelt het Senaatsgebouw vrij.",
            cost: { intel: 500, researchPoints: 5000 },
            unlocked: false,

            requirement: () => game.buildings.public_baths && game.buildings.public_baths.count >= 1,
            affects: ["intel", "researchPoints"]
        },
        surveying: {
            name: "Landmeetkunde",
            desc: "Speelt de Verharde Weg vrij.",
            cost: { researchPoints: 3000, stone: 2000 },
            unlocked: false,

            requirement: () => game.era >= 4,
            affects: ["stone"]
        },
        hydraulics: {
            name: "Hydraulica",
            desc: "Speelt het Aquaduct vrij.",
            cost: { brick: 3000, researchPoints: 4000 },
            unlocked: false,

            requirement: () => game.buildings.paved_road && game.buildings.paved_road.count >= 1,
            affects: ["food"]
        },
        // Era 5 Streams
        vassalage: { name: "Vassallage", desc: "Speelt Kasteel vrij.", cost: { gold: 4000, researchPoints: 6000 }, unlocked: false, requirement: () => game.era >= 5, affects: ["population"] },
        chivalry: { name: "Ridderorde", desc: "Speelt Feodaal Landgoed vrij.", cost: { food: 5000, researchPoints: 8000 }, unlocked: false, requirement: () => game.buildings.castle && game.buildings.castle.count >= 1, affects: ["food"] },
        divine_right: { name: "Goddelijk Recht", desc: "Speelt het Klooster vrij.", cost: { researchPoints: 5000, intel: 2000 }, unlocked: false, requirement: () => game.era >= 5, affects: ["researchPoints"] },
        scholasticism: { name: "Scholastiek", desc: "Speelt de Kathedraal vrij.", cost: { researchPoints: 8000, gold: 3000 }, unlocked: false, requirement: () => game.buildings.monastery && game.buildings.monastery.count >= 1, affects: ["intel"] },
        guild_system: { name: "Gilde Systeem", desc: "Speelt het Gildehuis vrij.", cost: { beam: 3000, brick: 3000 }, unlocked: false, requirement: () => game.era >= 5, affects: ["gold"] },
        masterpieces: { name: "Meesterwerken", desc: "Speelt het Marktplein vrij.", cost: { gold: 6000, researchPoints: 7000 }, unlocked: false, requirement: () => game.buildings.guild_hall && game.buildings.guild_hall.count >= 1, affects: ["population"] },
        // Era 6 Streams
        black_powder: { name: "Zwart Kruit", desc: "Speelt Kanongieterij vrij.", cost: { researchPoints: 12000, gold: 8000 }, unlocked: false, requirement: () => game.era >= 6, affects: ["gold"] },
        artillery: { name: "Artillerie", desc: "Speelt het Sterfort vrij.", cost: { brick: 8000, researchPoints: 15000 }, unlocked: false, requirement: () => game.buildings.cannon_foundry && game.buildings.cannon_foundry.count >= 1, affects: ["population"] },
        perspective: { name: "Perspectief", desc: "Speelt de Drukpers vrij.", cost: { intel: 5000, researchPoints: 12000 }, unlocked: false, requirement: () => game.era >= 6, affects: ["researchPoints"] },
        typography: { name: "Drukwerk", desc: "Speelt de Kunstacademie vrij.", cost: { gold: 10000, researchPoints: 18000 }, unlocked: false, requirement: () => game.buildings.printing_press && game.buildings.printing_press.count >= 1, affects: ["intel"] },
        compass: { name: "Kompas", desc: "Speelt het Observatorium vrij.", cost: { researchPoints: 10000, intel: 4000 }, unlocked: false, requirement: () => game.era >= 6, affects: ["intel"] },
        world_map: { name: "Wereldkaart", desc: "Speelt de Vlootbasis vrij.", cost: { intel: 8000, gold: 12000 }, unlocked: false, requirement: () => game.buildings.observatory && game.buildings.observatory.count >= 1, affects: ["gold"] },
        // Era 7 Streams
        overseas_expansion: { name: "Overzeese Expansie", desc: "Speelt Gouverneurshuis vrij.", cost: { gold: 20000, intel: 10000 }, unlocked: false, requirement: () => game.era >= 7, affects: ["food"] },
        colonial_rule: { name: "Koloniaal Bestuur", desc: "Speelt de Kolonie vrij.", cost: { food: 25000, researchPoints: 20000 }, unlocked: false, requirement: () => game.buildings.governor_mansion && game.buildings.governor_mansion.count >= 1, affects: ["population"] },
        empiricism: { name: "Empirisme", desc: "Speelt Laboratorium vrij.", cost: { researchPoints: 25000, intel: 12000 }, unlocked: false, requirement: () => game.era >= 7, affects: ["researchPoints"] },
        calculus: { name: "Calculus", desc: "Speelt Wetenschappelijk Instituut vrij.", cost: { researchPoints: 35000, gold: 15000 }, unlocked: false, requirement: () => game.buildings.laboratory && game.buildings.laboratory.count >= 1, affects: ["intel"] },
        merchant_fleets: { name: "Handelsvloten", desc: "Speelt de Beurs vrij.", cost: { beam: 15000, gold: 25000 }, unlocked: false, requirement: () => game.era >= 7, affects: ["gold"] },
        stocks: { name: "Aandelen", desc: "Speelt het Oost-Indisch Huis vrij.", cost: { gold: 40000, intel: 15000 }, unlocked: false, requirement: () => game.buildings.stock_exchange && game.buildings.stock_exchange.count >= 1, affects: ["population"] },
        // Era 8 Streams
        steam_power: { name: "Stoomkracht", desc: "Speelt Stoommachinefabriek vrij.", cost: { brick: 25000, researchPoints: 40000 }, unlocked: false, requirement: () => game.era >= 8, affects: ["beam", "brick"] },
        mass_production: { name: "Massaproductie", desc: "Speelt Lopende Band vrij.", cost: { gold: 50000, beam: 30000 }, unlocked: false, requirement: () => game.buildings.steam_factory && game.buildings.steam_factory.count >= 1, affects: ["population"] },
        combustion_engine: { name: "Verbrandingsmotor", desc: "Speelt Kolenmijn vrij.", cost: { beam: 20000, researchPoints: 45000 }, unlocked: false, requirement: () => game.era >= 8, affects: ["intel"] },
        electricity: { name: "Elektriciteit", desc: "Speelt Energiecentrale vrij.", cost: { intel: 20000, gold: 60000 }, unlocked: false, requirement: () => game.buildings.coal_mine && game.buildings.coal_mine.count >= 1, affects: ["researchPoints"] },
        labor_rights: { name: "Arbeidsrechten", desc: "Speelt Vakbondshuis vrij.", cost: { food: 50000, intel: 20000 }, unlocked: false, requirement: () => game.era >= 8, affects: ["population"] },
        social_reform: { name: "Sociale Hervorming", desc: "Speelt Arbeiderswijk vrij.", cost: { gold: 40000, researchPoints: 30000 }, unlocked: false, requirement: () => game.buildings.union_hall && game.buildings.union_hall.count >= 1, affects: ["food"] },
        // Era 9 Streams
        radioactivity: { name: "Radioactiviteit", desc: "Speelt Uraniummijn vrij.", cost: { gold: 100000, researchPoints: 80000 }, unlocked: false, requirement: () => game.era >= 9, affects: ["gold"] },
        atomic_bomb: { name: "Atoombom", desc: "Speelt Kernreactor vrij.", cost: { intel: 50000, researchPoints: 120000 }, unlocked: false, requirement: () => game.buildings.uranium_mine && game.buildings.uranium_mine.count >= 1, affects: ["researchPoints"] },
        quantum_mechanics: { name: "Kwantummechanica", desc: "Speelt Deeltjesversneller vrij.", cost: { researchPoints: 100000, intel: 40000 }, unlocked: false, requirement: () => game.era >= 9, affects: ["researchPoints"] },
        superconductivity: { name: "Supergeleiding", desc: "Speelt Kwantumlab vrij.", cost: { gold: 120000, researchPoints: 150000 }, unlocked: false, requirement: () => game.buildings.particle_accelerator && game.buildings.particle_accelerator.count >= 1, affects: ["intel"] },
        aerodynamics: { name: "Aerodynamica", desc: "Speelt Vliegveld vrij.", cost: { beam: 80000, brick: 80000 }, unlocked: false, requirement: () => game.era >= 9, affects: ["population"] },
        jet_engines: { name: "Straalmotoren", desc: "Speelt Luchtvaartfabriek vrij.", cost: { gold: 150000, intel: 60000 }, unlocked: false, requirement: () => game.buildings.airport && game.buildings.airport.count >= 1, affects: ["gold"] },
        // Era 10 Streams
        cryptography: { name: "Cryptografie", desc: "Speelt Serverboerderij vrij.", cost: { researchPoints: 250000, intel: 100000 }, unlocked: false, requirement: () => game.era >= 10, affects: ["intel"] },
        cyber_espionage: { name: "Cyberspionage", desc: "Speelt Cyberdefensie Centrum vrij.", cost: { gold: 300000, intel: 150000 }, unlocked: false, requirement: () => game.buildings.server_farm && game.buildings.server_farm.count >= 1, affects: ["gold"] },
        machine_learning: { name: "Machine Learning", desc: "Speelt Datacenter vrij.", cost: { researchPoints: 300000, gold: 200000 }, unlocked: false, requirement: () => game.era >= 10, affects: ["researchPoints"] },
        artificial_intelligence: { name: "Kunstmatige Intelligentie", desc: "Speelt Neuraal Netwerk vrij.", cost: { intel: 150000, researchPoints: 400000 }, unlocked: false, requirement: () => game.buildings.data_center && game.buildings.data_center.count >= 1, affects: ["food"] },
        globalization: { name: "Globalisatie", desc: "Speelt World Trade Center vrij.", cost: { gold: 400000, beam: 200000 }, unlocked: false, requirement: () => game.era >= 10, affects: ["gold"] },
        digital_currency: { name: "Digitale Valuta", desc: "Speelt Multinationals vrij.", cost: { gold: 800000, intel: 200000 }, unlocked: false, requirement: () => game.buildings.world_trade_center && game.buildings.world_trade_center.count >= 1, affects: ["population"] },
        // Era 11 Streams
        warp_drive: { name: "Warp Drive", desc: "Speelt Sterrenbasis vrij.", cost: { researchPoints: 1000000, gold: 1000000 }, unlocked: false, requirement: () => game.era >= 11, affects: ["population"] },
        galactic_empire: { name: "Galactisch Imperium", desc: "Speelt Ruimtevloot vrij.", cost: { gold: 3000000, intel: 500000 }, unlocked: false, requirement: () => game.buildings.starbase && game.buildings.starbase.count >= 1, affects: ["gold"] },
        mind_uploading: { name: "Bewustzijns-upload", desc: "Speelt Mind Upload Center vrij.", cost: { researchPoints: 1500000, intel: 500000 }, unlocked: false, requirement: () => game.era >= 11, affects: ["researchPoints"] },
        singularity: { name: "Singularity", desc: "Speelt Megastructuur vrij.", cost: { researchPoints: 3000000, gold: 2000000 }, unlocked: false, requirement: () => game.buildings.mind_upload_center && game.buildings.mind_upload_center.count >= 1, affects: ["intel"] },
        energy_harvesting: { name: "Energie Oogst", desc: "Speelt Orbitale Werf vrij.", cost: { beam: 1000000, brick: 1000000 }, unlocked: false, requirement: () => game.era >= 11, affects: ["beam", "brick"] },
        dyson_sphere: { name: "Dyson Bol", desc: "Speelt Dyson Zwerm vrij.", cost: { gold: 5000000, researchPoints: 2500000 }, unlocked: false, requirement: () => game.buildings.orbital_shipyard && game.buildings.orbital_shipyard.count >= 1, affects: ["gold"] },
        toolmaking: {
            name: "Gereedschap maken",
            desc: "Ontgrendelt de Steenhouwerij en Mijnwerkers.",
            cost: { wood: 30, food: 20 },
            unlocked: false,
            requirement: () => game.research.specialization.researched,
            affects: ["stone"]
        },
        education: {
            name: "Educatie",
            desc: "Ontgrendelt de School en Leraren.",
            cost: { wood: 100, food: 100, stone: 20 },
            unlocked: false,
            requirement: () => game.buildings.hut.count >= 2,
            affects: ["researchPoints"]
        },
        warehouse: {
            name: "Pakhuis",
            desc: "Maakt het mogelijk om een Pakhuis te bouwen voor extra basisopslag.",
            cost: { researchPoints: 50 },
            unlocked: false,
            requirement: () => game.research.education.researched,
            affects: ["food", "wood", "stone"]
        },
        storage_house: {
            name: "Opslaghuis",
            desc: "Maakt een enorm Opslaghuis mogelijk voor geavanceerde grondstoffen.",
            cost: { researchPoints: 200, gold: 50 },
            unlocked: false,
            requirement: () => game.resources.wood.max >= 500 && game.resources.stone.max >= 500,
            affects: ["wood", "stone", "beam", "brick"]
        },
        irrigation_tech: {
            name: "Irrigatie Techniek",
            desc: "Maakt het bouwen van irrigatiesystemen mogelijk.",
            cost: { researchPoints: 50, gold: 20 },
            unlocked: false,
            requirement: () => game.research.plow_invention.researched,
            affects: ["food"]
        },
        plow_invention: {
            name: "De Ploeg",
            desc: "Door een betere ploeg werken boeren 50% effectiever.",
            cost: { wood: 100, stone: 100, gold: 50 },
            unlocked: false,
            requirement: () => game.buildings.farm_plot.count >= 10,
            affects: ["food"]
        },
        expeditions: {
            name: "Expedities",
            desc: "Maakt het mogelijk om expedities te sturen om nieuwe gebieden te verkennen.",
            cost: { researchPoints: 100, gold: 100 },
            unlocked: false,
            requirement: () => game.resources.population.amount >= 25,
            affects: ["intel"]
        },
        medium_expeditions: {
            name: "Handelsroute zoeken",
            desc: "Verbeterde expedities die handelsroutes kunnen vinden.",
            cost: { researchPoints: 150, gold: 200 },
            unlocked: false,
            requirement: () => game.research.expeditions.researched,
            affects: ["intel"]
        },
        hard_expeditions: {
            name: "Diplomatieke Missies",
            desc: "Geavanceerde expedities die diplomatieke contacten kunnen leggen.",
            cost: { researchPoints: 300, gold: 500 },
            unlocked: false,
            requirement: () => game.research.medium_expeditions.researched,
            affects: ["intel"]
        },
        expert_expeditions: {
            name: "Verre Expedities",
            desc: "Expert expedities die unieke ontdekkingen kunnen doen.",
            cost: { researchPoints: 500, gold: 1000 },
            unlocked: false,
            requirement: () => game.research.hard_expeditions.researched,
            affects: ["intel"]
        },
        banking: {
            name: "Bankenstelsel",
            desc: "Maakt het mogelijk om een bank te bouwen voor extra goudopslag en rente.",
            cost: { researchPoints: 400, gold: 800 },
            unlocked: false,
            requirement: () => game.resources.gold.amount >= 1000,
            affects: ["gold"]
        },
        knight_training: {
            name: "Ridder Training",
            desc: "Ontgrendelt de Ridder eenheid voor je leger.",
            cost: { researchPoints: 200, gold: 300 },
            unlocked: false,
            requirement: () => false, // Tijdelijk verborgen
            affects: ["food", "gold"]
        },
        commander_tactics: {
            name: "Commandant Tactieken",
            desc: "Ontgrendelt de Commandant eenheid die de kracht van je leger verhoogt.",
            cost: { researchPoints: 400, gold: 600 },
            unlocked: false,
            requirement: () => game.research.knight_training.researched,
            affects: ["food", "gold"]
        },
        wood_tech: {
            name: "Hout Techniek",
            desc: "Door betere houtbewerking, wordt het houtproductie verhoogd.",
            cost: { researchPoints: 50, gold: 50 },
            unlocked: false,
            requirement: () => game.resources.wood.amount >= 5000,
            affects: ["wood"]
        },
        axe_tech: {
            name: "Hak Techniek",
            desc: "Door slim te hakken, wordt het houtproductie verhoogd.",
            cost: { researchPoints: 100, gold: 100 },
            unlocked: false,
            requirement: () => game.jobs.woodcutter.count >= 25,
            affects: ["wood"]
        },
        wood_workshop: {
            name: "Houtzagerij",
            desc: "Verbetert houtproductie en opslag.",
            cost: { researchPoints: 50, gold: 50 },
            unlocked: false,
            requirement: () => game.buildings.lumber_camp.count >= 5,
            affects: ["wood", "beam"]
        },
        stone_workshop: {
            name: "Steenoven",
            desc: "Verbetert steenproductie en opslag.",
            cost: { researchPoints: 50, gold: 50 },
            unlocked: false,
            requirement: () => game.buildings.quarry.count >= 5,
            affects: ["stone", "brick"]
        },
        houses: {
            name: "Huis",
            desc: "Een mooi stenen huis.",
            cost: { researchPoints: 75 },
            unlocked: false,
            requirement: () => game.resources.beam.amount >= 10 && game.resources.brick.amount >= 10,
            affects: ["population"]
        },
        merchant_guild: {
            name: "Handelsgilde",
            desc: "Verhoogt de opbrengst van alle actieve handelsroutes met 20%.",
            cost: { researchPoints: 800, gold: 1500 },
            unlocked: false,
            requirement: () => game.buildings.bank.count >= 5 && game.diplomacy.researched,
            affects: ["gold"]
        }
    },

    expeditions: {
        active: false,
        timer: 0,
        currentType: null,
        unlocked: true, // Zichtbaar zodra de tab dat is
        types: {
            easy: {
                name: "Korte Verkenning",
                duration: 10,
                cost: { food: 100, intel: 50 },
                successRate: 0.9,
                requirements: () => true
            },
            medium: {
                name: "Handelsroute Zoeken",
                duration: 20,
                cost: { food: 300, gold: 100, intel: 150 },
                successRate: 0.75,
                requirements: () => game.research.medium_expeditions.researched
            },
            hard: {
                name: "Diplomatieke Missie",
                duration: 30,
                cost: { food: 800, gold: 300, intel: 400 },
                successRate: 0.6,
                requirements: () => game.research.hard_expeditions.researched
            },
            expert: {
                name: "Verre Expeditie",
                duration: 40,
                cost: { food: 2000, gold: 1500, intel: 800 },
                successRate: 0.4,
                requirements: () => game.research.expert_expeditions.researched
            }
        }
    },
    diplomacy: {
        unlocked: false,
        discoveredTribes: {}
    },
    // Een 'bibliotheek' met mogelijke volken die je kunt ontdekken
    tribeTemplates: {
        forest_dwellers: {
            name: "De Bosjesmannen",
            desc: "Een vreedzame stam die diep in de wouden leeft.",
            relation: 50, // 0 = Oorlog, 50 = Neutraal, 100 = Bondgenoot
            tradeUnlocked: true,
            defenseValue: 200,
            tradeYield: { wood: 2, food: 1 },
            tradeCost: { gold: 2 }
        },
        mountain_clan: {
            name: "De Bergstam",
            desc: "Trotse krijgers die veel weten van mijnbouw.",
            relation: 30, // Beginnen iets wantrouwiger
            tradeUnlocked: false,
            defenseValue: 200,
            tradeYield: { stone: 3, gold: 1 },
            tradeCost: { food: 4 }
        },
        river_folk: {
            name: "De Rivierbewoners",
            desc: "Een handelend volk dat langs de grote rivieren woont.",
            relation: 70,
            tradeUnlocked: true,
            defenseValue: 150,
            tradeYield: { food: 3, gold: 2 },
            tradeCost: { wood: 4 }
        }
    },

    military: {
        attackPower: 0,
        defensePower: 0,
        units: {
            swordsman: { name: "Zwaardvechter", total: 0, assignedOff: 0, assignedDef: 0, off: 10, def: 2, type: 'off', cost: { gold: 50, food: 2000 }, desc: "Focus op aanval.", maintenance: { food: 1 }, unlocked: true },
            archer: { name: "Boogschutter", total: 0, assignedOff: 0, assignedDef: 0, off: 2, def: 12, type: 'def', cost: { gold: 40, food: 3000 }, desc: "Focus op verdediging.", maintenance: { food: 1 }, unlocked: true },
            knight: { name: "Ridder", total: 0, assignedOff: 0, assignedDef: 0, off: 25, def: 15, type: 'both', cost: { gold: 150, food: 8000 }, desc: "Sterk in beide.", maintenance: { food: 2, gold: 1 }, unlocked: false },
            commander: { name: "Commandant", total: 0, assignedOff: 0, assignedDef: 0, offMultiplier: 1.2, defMultiplier: 1.3, type: 'support', cost: { gold: 500, food: 10000 }, desc: "Verhoogt totale kracht met 20%.", maintenance: { food: 2, gold: 1 }, unlocked: false }
        }
    },
    prestige: {
        points: 0,
        totalEarned: 0,
        unlockedStreams: {}, // Era -> Array van Stream IDs die ooit gekozen zijn
        upgrades: {
            starter_pack: { name: "Snelle Start", level: 0, max: 5, cost: 10, desc: "Begin elke reset met +500 alle resources per level." },
            military_academy: { name: "Militaire Academie", level: 0, max: 1, cost: 50, desc: "Unlockt de 'Ridder' unit vanaf het begin." },
            efficient_scouting: { name: "Ervaren Gidsen", level: 0, max: 10, cost: 20, desc: "Verkenningen gaan 5% sneller per level (bovenop de 1% per onbesteed punt)." },
            meditation: { name: "Meditatie", level: 0, max: 9, cost: 30, desc: "Offline progressie is 10% efficiënter per level." },
            sunDail: { name: "Zonnewijzer", level: 0, max: 11, cost: 40, desc: "Je krijgt een extra uur offline tijd per level." },
            diplomatic_charm: { name: "Diplomatieke Charme", level: 0, max: 10, cost: 50, desc: "Verhoogt alle handelsroute opbrengsten met +10% per level." }
        }
    },
    settings: {
        showManualActions: true,
        language: 'nl'
    },
    lastTick: Date.now(),
    lastSave: Date.now()
};

function getInitialState() {
    return {
        era: 1,
        traits: [],
        currentStreams: {},
        stats: { battlesWon: 0, treatiesSigned: 0, aggressiveActions: 0 },
        calendar: { day: 0, year: 0, season: 0 },
        seasonNames: [t("season_spring"), t("season_summer"), t("season_autumn"), t("season_winter")],
        resources: {
            food: { amount: 50, discovered: true },
            wood: { amount: 50, discovered: true },
            stone: { amount: 0, discovered: true },
            beam: { amount: 0, discovered: false },
            brick: { amount: 0, discovered: false },
            gold: { amount: 0, discovered: false },
            population: { amount: 2, discovered: true },
            researchPoints: { amount: 0, discovered: false },
            intel: { amount: 0, discovered: false }
        },
        buildings: {}, 
        jobs: {},
        research: {},
        military: { attackPower: 0, defensePower: 0, units: {} },
        expeditions: { active: false, timer: 0, currentType: null, unlocked: true },
        diplomacy: { unlocked: false, discoveredTribes: {} },
        prestige: { points: 0, totalEarned: 0, upgrades: {} },
        achievements: {
            first_steps: false, flint_monument: false, iron_discovery: false,
            great_conqueror: false, the_discoverer: false, trade_lord: false
        },
        settings: { showManualActions: true, language: 'nl' },
        lastTick: Date.now(),
        lastSave: Date.now()
    };
}

// --- OPSLAAN & LADEN ---
function saveGame(showLog = false) {
    game.lastSave = Date.now();
    localStorage.setItem('myGameSave', JSON.stringify(game));
    console.log("Game Saved");
    if (showLog && typeof addToLog === 'function') {
        addToLog(t("msg_game_saved"), "info");
    }
}

function loadGame() {
    const saved = localStorage.getItem('myGameSave');
    
    // De globale 'game' variabele is al geïnitialiseerd met alle functies en definities.
    // We laden alleen de data eroverheen.

    if (!saved) {
        // Indien geen save, zorg dat we de initial state hebben (reeds in 'game')
        recalcLimits();
        recalcRates();
        checkUnlocks();
        return;
    }

    try {
        const loadedData = JSON.parse(saved);
        
        // Gebruik deepMerge om de geladen data over de globale template te leggen
        // Zo behouden we de functies (zoals requirement()) en nieuwe definities
        deepMerge(game, loadedData);
        
        console.log("Game Loaded & Deep Merged");
        
        // Restore language choice
        if (game.settings && game.settings.language && typeof setLanguage === 'function') {
            setLanguage(game.settings.language);
        }
        
        // Post-load fixes
        recalcLimits();
        recalcRates();
        checkUnlocks();
        
        markUiDirty('all');
    } catch (e) {
        console.error("Fout bij laden van savegame:", e);
    }
}


function hardReset() {
    const firstCheck = confirm(t("msg_reset_confirm"));

    if (firstCheck) {
        const checkWord = prompt(t("msg_reset_prompt"));

        if (checkWord === "RESET") {
            localStorage.removeItem('myGameSave');
            alert(t("msg_reset_success"));
            window.location.reload();
        } else {
            alert(t("msg_reset_cancel"));
        }
    }
}
function handleOfflineProgress() {
    const now = Date.now();
    const diffInSeconds = Math.floor((now - game.lastTick) / 1000);
    // Alleen verwerken als er meer dan 10 seconden voorbij zijn
    if (diffInSeconds > 10) {
        // Bereken eerst de rates (voor het geval ze nog niet geüpdatet zijn)
        recalcRates();

        // Als de upgrade niet bestaat of level 0 is, is de multiplier 0.1
        let offlineEfficiency = 0.1;
        if (game.prestige.upgrades.meditation) {
            // Elke level voegt 10% toe, tot max 100%
            offlineEfficiency += (game.prestige.upgrades.meditation.level * 0.1);
        }
        offlineEfficiency = Math.min(1, offlineEfficiency); // Nooit meer dan 100%

        // 2. Tijdslimiet: Start op 1 uur (3600s), +1 uur per level
        let maxOfflineSeconds = 3600 + (game.prestige.upgrades.sunDail.level * 3600);
        const actualSeconds = Math.min(diffInSeconds, maxOfflineSeconds);
        const capped = diffInSeconds > maxOfflineSeconds;



        let summary = {};

        // Pas de rates toe op elke resource
        for (let key in game.resources) {
            const res = game.resources[key];
            if (res.perSec) {
                const gained = res.perSec * actualSeconds * offlineEfficiency;
                const oldAmount = res.amount;

                // Voeg toe maar let op de max
                res.amount = Math.min(res.max || 1000, Math.max(0, res.amount + gained));

                // Hou bij hoeveel er echt bij is gekomen voor de popup
                summary[key] = Math.floor(res.amount - oldAmount);
            }
        }

        showOfflineModal(actualSeconds, summary, capped, diffInSeconds);
    }

    // Reset de lastTick naar nu
    game.lastTick = Date.now();
}

function showOfflineModal(seconds, summary, capped, totalSeconds) {
    let resourceList = "";
    for (let res in summary) {
        if (summary[res] !== 0) {
            resourceList += `<div>${getResourceIcon(res)} ${res}: +${summary[res]}</div>`;
        }
    }

    const modal = document.getElementById('modal-container');
    modal.innerHTML = `
        <div class="detail-overlay">
            <div class="detail-content panel">
                <h2>Welkom terug!</h2>
                <p>Geproduceerd voor: <strong>${formatTime(seconds)}</strong></p>
                
                ${capped ? `<p style="color: var(--red); font-size: 0.8em;">
                    Let op: Je was ${formatTime(totalSeconds)} weg, maar je limiet is ${formatTime(seconds)}. 
                    Upgrade 'Meditatie' voor meer tijd!
                </p>` : ''}

                <div class="breakdown-section" style="text-align: left;">
                    ${resourceList || "Geen opbrengst."}
                </div>
                
                <button class="tap-btn" style="width:100%" onclick="closeDetail()">Lekker!</button>
            </div>
        </div>
    `;
    modal.style.display = 'block';
}

function formatTime(seconds) {
    if (seconds < 3600) return Math.floor(seconds / 60) + "m";
    let h = Math.floor(seconds / 3600);
    let m = Math.floor((seconds % 3600) / 60);
    return `${h}u ${m}m`;
}

/**
 * Returns a FontAwesome icon or emoji for a resource.
 */
function getResourceIcon(resKey) {
    const icons = {
        food: "🍎",
        wood: "🪵",
        stone: "🪨",
        beam: "📏",
        brick: "🧱",
        gold: "💰",
        population: "🐱",
        researchPoints: "🧪",
        intel: "🗺️",
        scouts: "🕵️"
    };
    return icons[resKey] || "📦";
}

/**
 * Finds all researches that affect a specific resource.
 */
function findResearchesForResource(resKey) {
    const list = [];
    if (!game.research) return list;
    for (let key in game.research) {
        const r = game.research[key];
        if (r.affects && r.affects.includes(resKey)) {
            list.push(r);
        }
    }
    return list;
}

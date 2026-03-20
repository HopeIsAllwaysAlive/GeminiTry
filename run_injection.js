const fs = require('fs');

const stateFile = 'c:/Users/77hoo/Documents/GeminiTry/state.js';
const engineFile = 'c:/Users/77hoo/Documents/GeminiTry/engine.js';

let stateStr = fs.readFileSync(stateFile, 'utf8');
let engineStr = fs.readFileSync(engineFile, 'utf8');

const jobsPayload = `
        // Era 5
        knight_lord: { name: "Ridderlijk Heer", count: 0, max: 0, effect: { gold: 3, food: 2, intel: -1 }, unlocked: false, stream: "Feodalisme" },
        monk: { name: "Monnik", count: 0, max: 0, effect: { researchPoints: 8, intel: 2, food: -2 }, unlocked: false, stream: "Theologie" },
        artisan: { name: "Ambachtsman", count: 0, max: 0, effect: { brick: 4, beam: 4, gold: 2, food: -3 }, unlocked: false, stream: "Gilden" },
        // Era 6
        musketeer: { name: "Musketier", count: 0, max: 0, effect: { gold: 6, intel: 1, beam: -2, brick: -2 }, unlocked: false, stream: "Buskruit" },
        artist: { name: "Kunstenaar", count: 0, max: 0, effect: { researchPoints: 12, gold: 5, intel: 3, food: -3 }, unlocked: false, stream: "Humanisme" },
        explorer: { name: "Ontdekkingsreiziger", count: 0, max: 0, effect: { intel: 10, gold: 8, food: -4 }, unlocked: false, stream: "Cartografie" },
        // Era 7
        colonist: { name: "Kolonist", count: 0, max: 0, effect: { food: 15, wood: 10, stone: 10, gold: -5 }, unlocked: false, stream: "Imperialisme" },
        scientist: { name: "Wetenschapper", count: 0, max: 0, effect: { researchPoints: 25, intel: 5, gold: -4 }, unlocked: false, stream: "Wetenschappelijke Methode" },
        trader: { name: "Handelaar", count: 0, max: 0, effect: { gold: 20, food: 5, intel: -3 }, unlocked: false, stream: "Mercantillisme" },
        // Era 8
        factory_worker: { name: "Fabrieksarbeider", count: 0, max: 0, effect: { beam: 15, brick: 15, food: -5 }, unlocked: false, stream: "Automatisering" },
        mechanical_engineer: { name: "Engineer", count: 0, max: 0, effect: { researchPoints: 40, intel: 10, beam: -5 }, unlocked: false, stream: "Thermodynamica" },
        union_leader: { name: "Vakbondsleider", count: 0, max: 0, effect: { gold: 15, researchPoints: 5, food: -4 }, unlocked: false, stream: "Vakbonden" },
        // Era 9
        nuclear_physicist: { name: "Kernfysicus", count: 0, max: 0, effect: { gold: 50, researchPoints: 60, food: -10 }, unlocked: false, stream: "Kernsplitsing" },
        quantum_scientist: { name: "Kwantumwetenschapper", count: 0, max: 0, effect: { researchPoints: 100, intel: 20, gold: -10 }, unlocked: false, stream: "Kwantumfysica" },
        pilot: { name: "Piloot", count: 0, max: 0, effect: { intel: 30, gold: 40, beam: -10, brick: -10 }, unlocked: false, stream: "Luchtvaart" },
        // Era 10
        hacker: { name: "Hacker", count: 0, max: 0, effect: { gold: 100, intel: 50, researchPoints: -20 }, unlocked: false, stream: "Cyber-oorlogsvoering" },
        ai_developer: { name: "AI Developer", count: 0, max: 0, effect: { researchPoints: 200, gold: 20, food: -15 }, unlocked: false, stream: "AI & Algoritmes" },
        crypto_trader: { name: "Crypto Trader", count: 0, max: 0, effect: { gold: 300, intel: -10 }, unlocked: false, stream: "Wereldeconomie" },
        // Era 11
        space_marine: { name: "Ruimtemarinier", count: 0, max: 0, effect: { gold: 500, intel: 100, food: -30 }, unlocked: false, stream: "Galactische Hegemonie" },
        cyborg: { name: "Cyborg", count: 0, max: 0, effect: { researchPoints: 500, intel: 100, gold: -50 }, unlocked: false, stream: "Transcendentie" },
        solar_architect: { name: "Zonnearchitect", count: 0, max: 0, effect: { beam: 200, brick: 200, gold: 200 }, unlocked: false, stream: "Dyson-technologie" }
    },`;

const buildingsPayload = `
        // Era 5 Streams
        castle: { name: "Kasteel", count: 0, cost: { stone: 10000, wood: 5000 }, provides: { job_knight_lord: 5, max_population: 100 }, desc: "Een machtig fort voor ridders.", unlocked: false, stream: "Feodalisme" },
        feudal_estate: { name: "Feodaal Landgoed", count: 0, cost: { gold: 5000, food: 10000 }, provides: { job_knight_lord: 2, max_food: 15000 }, desc: "Uitgestrekte landerijen.", unlocked: false, stream: "Feodalisme" },
        monastery: { name: "Klooster", count: 0, cost: { stone: 8000, wood: 4000 }, provides: { job_monk: 5, max_researchPoints: 5000 }, desc: "Een plek voor stilte en studie.", unlocked: false, stream: "Theologie" },
        cathedral: { name: "Kathedraal", count: 0, cost: { brick: 15000, gold: 10000 }, provides: { job_monk: 2, max_intel: 2000 }, desc: "Een monumentaal religieus gebouw.", unlocked: false, stream: "Theologie" },
        guild_hall: { name: "Gildehuis", count: 0, cost: { beam: 5000, brick: 5000 }, provides: { job_artisan: 5, max_gold: 15000 }, desc: "Het centrum van handel en ambacht.", unlocked: false, stream: "Gilden" },
        market_square: { name: "Marktplein", count: 0, cost: { wood: 10000, stone: 10000 }, provides: { job_artisan: 2, max_population: 200 }, desc: "Vergroot de bevolking en trekt ambachtslieden aan.", unlocked: false, stream: "Gilden" },
        // Era 6 Streams
        cannon_foundry: { name: "Kanongieterij", count: 0, cost: { beam: 10000, brick: 10000, gold: 15000 }, provides: { job_musketeer: 5, max_gold: 20000 }, desc: "Produceert verwoestende wapens.", unlocked: false, stream: "Buskruit" },
        star_fort: { name: "Sterfort", count: 0, cost: { brick: 25000, stone: 20000 }, provides: { job_musketeer: 2, max_population: 300 }, desc: "Onneembare verdedigingslinie.", unlocked: false, stream: "Buskruit" },
        printing_press: { name: "Drukpers", count: 0, cost: { beam: 8000, gold: 10000 }, provides: { job_artist: 5, max_researchPoints: 15000 }, desc: "Verspreidt kennis razendsnel.", unlocked: false, stream: "Humanisme" },
        art_academy: { name: "Kunstacademie", count: 0, cost: { stone: 15000, gold: 12000 }, provides: { job_artist: 2, max_intel: 5000 }, desc: "Opleidingscentrum voor de meesters.", unlocked: false, stream: "Humanisme" },
        observatory: { name: "Observatorium", count: 0, cost: { brick: 12000, researchPoints: 10000 }, provides: { job_explorer: 5, max_intel: 10000 }, desc: "Bestudeer de sterren en ontdek de wereld.", unlocked: false, stream: "Cartografie" },
        naval_base: { name: "Vlootbasis", count: 0, cost: { beam: 15000, gold: 20000 }, provides: { job_explorer: 2, max_gold: 30000 }, desc: "Bouwt expeditieschepen.", unlocked: false, stream: "Cartografie" },
        // Era 7 Streams
        governor_mansion: { name: "Gouverneurshuis", count: 0, cost: { gold: 30000, brick: 20000 }, provides: { job_colonist: 5, max_food: 50000 }, desc: "Zetel van de overzeese macht.", unlocked: false, stream: "Imperialisme" },
        colony: { name: "Kolonie", count: 0, cost: { beam: 20000, food: 40000 }, provides: { job_colonist: 2, max_population: 500 }, desc: "Uitbreiding van je rijk over zee.", unlocked: false, stream: "Imperialisme" },
        laboratory: { name: "Laboratorium", count: 0, cost: { brick: 20000, researchPoints: 20000 }, provides: { job_scientist: 5, max_researchPoints: 40000 }, desc: "Moderne onderzoeksfaciliteit.", unlocked: false, stream: "Wetenschappelijke Methode" },
        science_institute: { name: "Wetenschappelijk Instituut", count: 0, cost: { gold: 25000, beam: 15000 }, provides: { job_scientist: 2, max_intel: 15000 }, desc: "Bundelt de knapste koppen.", unlocked: false, stream: "Wetenschappelijke Methode" },
        stock_exchange: { name: "Beurs", count: 0, cost: { gold: 50000, brick: 30000 }, provides: { job_trader: 5, max_gold: 100000 }, desc: "Laat kapitaal exponentieel groeen.", unlocked: false, stream: "Mercantillisme" },
        trading_company: { name: "Oost-Indisch Huis", count: 0, cost: { beam: 30000, gold: 40000 }, provides: { job_trader: 2, max_population: 400 }, desc: "De eerste multinationals.", unlocked: false, stream: "Mercantillisme" },
        // Era 8 Streams
        steam_factory: { name: "Stoommachinefabriek", count: 0, cost: { brick: 50000, beam: 40000 }, provides: { job_factory_worker: 5, max_beam: 20000, max_brick: 20000 }, desc: "Massaproductie in de hoogste versnelling.", unlocked: false, stream: "Automatisering" },
        assembly_line: { name: "Lopende Band", count: 0, cost: { gold: 60000, researchPoints: 30000 }, provides: { job_factory_worker: 2, max_population: 1000 }, desc: "Ultieme industriële efficiëntie.", unlocked: false, stream: "Automatisering" },
        coal_mine: { name: "Kolenmijn", count: 0, cost: { beam: 30000, stone: 80000 }, provides: { job_mechanical_engineer: 5, max_intel: 30000 }, desc: "Brandstof voor de revolutie.", unlocked: false, stream: "Thermodynamica" },
        power_plant: { name: "Energiecentrale", count: 0, cost: { brick: 60000, gold: 80000 }, provides: { job_mechanical_engineer: 2, max_researchPoints: 80000 }, desc: "Voorziet de stad van stroom.", unlocked: false, stream: "Thermodynamica" },
        union_hall: { name: "Vakbondshuis", count: 0, cost: { food: 100000, gold: 50000 }, provides: { job_union_leader: 5, max_population: 1500 }, desc: "Strijdt voor betere rechten.", unlocked: false, stream: "Vakbonden" },
        worker_district: { name: "Arbeiderswijk", count: 0, cost: { brick: 40000, beam: 40000 }, provides: { job_union_leader: 2, max_food: 100000 }, desc: "Huisvesting voor de massa.", unlocked: false, stream: "Vakbonden" },
        // Era 9 Streams
        uranium_mine: { name: "Uraniummijn", count: 0, cost: { beam: 80000, gold: 150000 }, provides: { job_nuclear_physicist: 5, max_gold: 500000 }, desc: "Gevaarlijk maar lucratief.", unlocked: false, stream: "Kernsplitsing" },
        nuclear_reactor: { name: "Kernreactor", count: 0, cost: { brick: 150000, researchPoints: 100000 }, provides: { job_nuclear_physicist: 2, max_researchPoints: 200000 }, desc: "Eindeloze energie.", unlocked: false, stream: "Kernsplitsing" },
        particle_accelerator: { name: "Deeltjesversneller", count: 0, cost: { gold: 200000, researchPoints: 150000 }, provides: { job_quantum_scientist: 5, max_researchPoints: 300000 }, desc: "Onderzoekt de fundamentele bouwstenen.", unlocked: false, stream: "Kwantumfysica" },
        quantum_lab: { name: "Kwantumlab", count: 0, cost: { beam: 100000, intel: 50000 }, provides: { job_quantum_scientist: 2, max_intel: 100000 }, desc: "Breekt de wetten van de natuurkunde.", unlocked: false, stream: "Kwantumfysica" },
        airport: { name: "Vliegveld", count: 0, cost: { brick: 120000, beam: 120000 }, provides: { job_pilot: 5, max_population: 3000 }, desc: "Wereldwijde logistiek.", unlocked: false, stream: "Luchtvaart" },
        aerospace_factory: { name: "Luchtvaartfabriek", count: 0, cost: { gold: 250000, researchPoints: 80000 }, provides: { job_pilot: 2, max_gold: 800000 }, desc: "Bouwt vliegtuigen.", unlocked: false, stream: "Luchtvaart" },
        // Era 10 Streams
        server_farm: { name: "Serverboerderij", count: 0, cost: { gold: 500000, beam: 200000 }, provides: { job_hacker: 5, max_intel: 300000 }, desc: "Verwerkt enorme hoeveelheden data.", unlocked: false, stream: "Cyber-oorlogsvoering" },
        cyber_defense_center: { name: "Cyberdefensie Centrum", count: 0, cost: { researchPoints: 400000, gold: 400000 }, provides: { job_hacker: 2, max_gold: 1500000 }, desc: "Bewaakt de firewalls.", unlocked: false, stream: "Cyber-oorlogsvoering" },
        data_center: { name: "Datacenter", count: 0, cost: { brick: 300000, gold: 600000 }, provides: { job_ai_developer: 5, max_researchPoints: 1000000 }, desc: "De longen van kunstmatige intelligentie.", unlocked: false, stream: "AI & Algoritmes" },
        neural_network: { name: "Neuraal Netwerk", count: 0, cost: { researchPoints: 600000, intel: 200000 }, provides: { job_ai_developer: 2, max_food: 500000 }, desc: "Een brein van silicium.", unlocked: false, stream: "AI & Algoritmes" },
        world_trade_center: { name: "World Trade Center", count: 0, cost: { brick: 500000, beam: 500000 }, provides: { job_crypto_trader: 5, max_gold: 5000000 }, desc: "Het financiële centrum van de aarde.", unlocked: false, stream: "Wereldeconomie" },
        multinational_corp: { name: "Multinational", count: 0, cost: { gold: 1000000, researchPoints: 300000 }, provides: { job_crypto_trader: 2, max_population: 10000 }, desc: "Bedrijven machtiger dan landen.", unlocked: false, stream: "Wereldeconomie" },
        // Era 11 Streams
        starbase: { name: "Sterrenbasis", count: 0, cost: { beam: 1000000, brick: 1000000 }, provides: { job_space_marine: 5, max_population: 50000 }, desc: "Je uitkijkpost in de kosmos.", unlocked: false, stream: "Galactische Hegemonie" },
        space_fleet: { name: "Ruimtevloot", count: 0, cost: { gold: 5000000, intel: 1000000 }, provides: { job_space_marine: 2, max_gold: 20000000 }, desc: "Domineer de Melkweg.", unlocked: false, stream: "Galactische Hegemonie" },
        mind_upload_center: { name: "Mind Upload Center", count: 0, cost: { researchPoints: 2000000, gold: 2000000 }, provides: { job_cyborg: 5, max_researchPoints: 10000000 }, desc: "Ontsnap aan het biologische.", unlocked: false, stream: "Transcendentie" },
        megastructure: { name: "Megastructuur", count: 0, cost: { brick: 2000000, beam: 2000000 }, provides: { job_cyborg: 2, max_intel: 5000000 }, desc: "Een huis voor miljarden bewustzijnen.", unlocked: false, stream: "Transcendentie" },
        orbital_shipyard: { name: "Orbitale Werf", count: 0, cost: { gold: 4000000, beam: 2000000 }, provides: { job_solar_architect: 5, max_beam: 5000000, max_brick: 5000000 }, desc: "Bouwt planetair grote schepen.", unlocked: false, stream: "Dyson-technologie" },
        dyson_swarm: { name: "Dyson Zwerm", count: 0, cost: { researchPoints: 5000000, intel: 2000000 }, provides: { job_solar_architect: 2, max_gold: 50000000 }, desc: "Oogst de energie van een hele ster.", unlocked: false, stream: "Dyson-technologie" },
        // Basis gebouwen`;

const researchPayload = `
        // Era 5 Streams
        vassalage: { name: "Vassallage", desc: "Speelt Kasteel vrij.", cost: { gold: 4000, researchPoints: 6000 }, unlocked: false, stream: "Feodalisme", requirement: () => game.era >= 5 },
        chivalry: { name: "Ridderorde", desc: "Speelt Feodaal Landgoed vrij.", cost: { food: 5000, researchPoints: 8000 }, unlocked: false, stream: "Feodalisme", requirement: () => game.buildings.castle && game.buildings.castle.count >= 1 },
        divine_right: { name: "Goddelijk Recht", desc: "Speelt het Klooster vrij.", cost: { researchPoints: 5000, intel: 2000 }, unlocked: false, stream: "Theologie", requirement: () => game.era >= 5 },
        scholasticism: { name: "Scholastiek", desc: "Speelt de Kathedraal vrij.", cost: { researchPoints: 8000, gold: 3000 }, unlocked: false, stream: "Theologie", requirement: () => game.buildings.monastery && game.buildings.monastery.count >= 1 },
        guild_system: { name: "Gilde Systeem", desc: "Speelt het Gildehuis vrij.", cost: { beam: 3000, brick: 3000 }, unlocked: false, stream: "Gilden", requirement: () => game.era >= 5 },
        masterpieces: { name: "Meesterwerken", desc: "Speelt het Marktplein vrij.", cost: { gold: 6000, researchPoints: 7000 }, unlocked: false, stream: "Gilden", requirement: () => game.buildings.guild_hall && game.buildings.guild_hall.count >= 1 },
        // Era 6 Streams
        black_powder: { name: "Zwart Kruit", desc: "Speelt Kanongieterij vrij.", cost: { researchPoints: 12000, gold: 8000 }, unlocked: false, stream: "Buskruit", requirement: () => game.era >= 6 },
        artillery: { name: "Artillerie", desc: "Speelt het Sterfort vrij.", cost: { brick: 8000, researchPoints: 15000 }, unlocked: false, stream: "Buskruit", requirement: () => game.buildings.cannon_foundry && game.buildings.cannon_foundry.count >= 1 },
        perspective: { name: "Perspectief", desc: "Speelt de Drukpers vrij.", cost: { intel: 5000, researchPoints: 12000 }, unlocked: false, stream: "Humanisme", requirement: () => game.era >= 6 },
        typography: { name: "Drukwerk", desc: "Speelt de Kunstacademie vrij.", cost: { gold: 10000, researchPoints: 18000 }, unlocked: false, stream: "Humanisme", requirement: () => game.buildings.printing_press && game.buildings.printing_press.count >= 1 },
        compass: { name: "Kompas", desc: "Speelt het Observatorium vrij.", cost: { researchPoints: 10000, intel: 4000 }, unlocked: false, stream: "Cartografie", requirement: () => game.era >= 6 },
        world_map: { name: "Wereldkaart", desc: "Speelt de Vlootbasis vrij.", cost: { intel: 8000, gold: 12000 }, unlocked: false, stream: "Cartografie", requirement: () => game.buildings.observatory && game.buildings.observatory.count >= 1 },
        // Era 7 Streams
        overseas_expansion: { name: "Overzeese Expansie", desc: "Speelt Gouverneurshuis vrij.", cost: { gold: 20000, intel: 10000 }, unlocked: false, stream: "Imperialisme", requirement: () => game.era >= 7 },
        colonial_rule: { name: "Koloniaal Bestuur", desc: "Speelt de Kolonie vrij.", cost: { food: 25000, researchPoints: 20000 }, unlocked: false, stream: "Imperialisme", requirement: () => game.buildings.governor_mansion && game.buildings.governor_mansion.count >= 1 },
        empiricism: { name: "Empirisme", desc: "Speelt Laboratorium vrij.", cost: { researchPoints: 25000, intel: 12000 }, unlocked: false, stream: "Wetenschappelijke Methode", requirement: () => game.era >= 7 },
        calculus: { name: "Calculus", desc: "Speelt Wetenschappelijk Instituut vrij.", cost: { researchPoints: 35000, gold: 15000 }, unlocked: false, stream: "Wetenschappelijke Methode", requirement: () => game.buildings.laboratory && game.buildings.laboratory.count >= 1 },
        merchant_fleets: { name: "Handelsvloten", desc: "Speelt de Beurs vrij.", cost: { beam: 15000, gold: 25000 }, unlocked: false, stream: "Mercantillisme", requirement: () => game.era >= 7 },
        stocks: { name: "Aandelen", desc: "Speelt het Oost-Indisch Huis vrij.", cost: { gold: 40000, intel: 15000 }, unlocked: false, stream: "Mercantillisme", requirement: () => game.buildings.stock_exchange && game.buildings.stock_exchange.count >= 1 },
        // Era 8 Streams
        steam_power: { name: "Stoomkracht", desc: "Speelt Stoommachinefabriek vrij.", cost: { brick: 25000, researchPoints: 40000 }, unlocked: false, stream: "Automatisering", requirement: () => game.era >= 8 },
        mass_production: { name: "Massaproductie", desc: "Speelt Lopende Band vrij.", cost: { gold: 50000, beam: 30000 }, unlocked: false, stream: "Automatisering", requirement: () => game.buildings.steam_factory && game.buildings.steam_factory.count >= 1 },
        combustion_engine: { name: "Verbrandingsmotor", desc: "Speelt Kolenmijn vrij.", cost: { beam: 20000, researchPoints: 45000 }, unlocked: false, stream: "Thermodynamica", requirement: () => game.era >= 8 },
        electricity: { name: "Elektriciteit", desc: "Speelt Energiecentrale vrij.", cost: { intel: 20000, gold: 60000 }, unlocked: false, stream: "Thermodynamica", requirement: () => game.buildings.coal_mine && game.buildings.coal_mine.count >= 1 },
        labor_rights: { name: "Arbeidsrechten", desc: "Speelt Vakbondshuis vrij.", cost: { food: 50000, intel: 20000 }, unlocked: false, stream: "Vakbonden", requirement: () => game.era >= 8 },
        social_reform: { name: "Sociale Hervorming", desc: "Speelt Arbeiderswijk vrij.", cost: { gold: 40000, researchPoints: 30000 }, unlocked: false, stream: "Vakbonden", requirement: () => game.buildings.union_hall && game.buildings.union_hall.count >= 1 },
        // Era 9 Streams
        radioactivity: { name: "Radioactiviteit", desc: "Speelt Uraniummijn vrij.", cost: { gold: 100000, researchPoints: 80000 }, unlocked: false, stream: "Kernsplitsing", requirement: () => game.era >= 9 },
        atomic_bomb: { name: "Atoombom", desc: "Speelt Kernreactor vrij.", cost: { intel: 50000, researchPoints: 120000 }, unlocked: false, stream: "Kernsplitsing", requirement: () => game.buildings.uranium_mine && game.buildings.uranium_mine.count >= 1 },
        quantum_mechanics: { name: "Kwantummechanica", desc: "Speelt Deeltjesversneller vrij.", cost: { researchPoints: 100000, intel: 40000 }, unlocked: false, stream: "Kwantumfysica", requirement: () => game.era >= 9 },
        superconductivity: { name: "Supergeleiding", desc: "Speelt Kwantumlab vrij.", cost: { gold: 120000, researchPoints: 150000 }, unlocked: false, stream: "Kwantumfysica", requirement: () => game.buildings.particle_accelerator && game.buildings.particle_accelerator.count >= 1 },
        aerodynamics: { name: "Aerodynamica", desc: "Speelt Vliegveld vrij.", cost: { beam: 80000, brick: 80000 }, unlocked: false, stream: "Luchtvaart", requirement: () => game.era >= 9 },
        jet_engines: { name: "Straalmotoren", desc: "Speelt Luchtvaartfabriek vrij.", cost: { gold: 150000, intel: 60000 }, unlocked: false, stream: "Luchtvaart", requirement: () => game.buildings.airport && game.buildings.airport.count >= 1 },
        // Era 10 Streams
        cryptography: { name: "Cryptografie", desc: "Speelt Serverboerderij vrij.", cost: { researchPoints: 250000, intel: 100000 }, unlocked: false, stream: "Cyber-oorlogsvoering", requirement: () => game.era >= 10 },
        cyber_espionage: { name: "Cyberspionage", desc: "Speelt Cyberdefensie Centrum vrij.", cost: { gold: 300000, intel: 150000 }, unlocked: false, stream: "Cyber-oorlogsvoering", requirement: () => game.buildings.server_farm && game.buildings.server_farm.count >= 1 },
        machine_learning: { name: "Machine Learning", desc: "Speelt Datacenter vrij.", cost: { researchPoints: 300000, gold: 200000 }, unlocked: false, stream: "AI & Algoritmes", requirement: () => game.era >= 10 },
        artificial_intelligence: { name: "Kunstmatige Intelligentie", desc: "Speelt Neuraal Netwerk vrij.", cost: { intel: 150000, researchPoints: 400000 }, unlocked: false, stream: "AI & Algoritmes", requirement: () => game.buildings.data_center && game.buildings.data_center.count >= 1 },
        globalization: { name: "Globalisatie", desc: "Speelt World Trade Center vrij.", cost: { gold: 400000, beam: 200000 }, unlocked: false, stream: "Wereldeconomie", requirement: () => game.era >= 10 },
        digital_currency: { name: "Digitale Valuta", desc: "Speelt Multinationals vrij.", cost: { gold: 800000, intel: 200000 }, unlocked: false, stream: "Wereldeconomie", requirement: () => game.buildings.world_trade_center && game.buildings.world_trade_center.count >= 1 },
        // Era 11 Streams
        warp_drive: { name: "Warp Drive", desc: "Speelt Sterrenbasis vrij.", cost: { researchPoints: 1000000, gold: 1000000 }, unlocked: false, stream: "Galactische Hegemonie", requirement: () => game.era >= 11 },
        galactic_empire: { name: "Galactisch Imperium", desc: "Speelt Ruimtevloot vrij.", cost: { gold: 3000000, intel: 500000 }, unlocked: false, stream: "Galactische Hegemonie", requirement: () => game.buildings.starbase && game.buildings.starbase.count >= 1 },
        mind_uploading: { name: "Bewustzijns-upload", desc: "Speelt Mind Upload Center vrij.", cost: { researchPoints: 1500000, intel: 500000 }, unlocked: false, stream: "Transcendentie", requirement: () => game.era >= 11 },
        singularity: { name: "Singularity", desc: "Speelt Megastructuur vrij.", cost: { researchPoints: 3000000, gold: 2000000 }, unlocked: false, stream: "Transcendentie", requirement: () => game.buildings.mind_upload_center && game.buildings.mind_upload_center.count >= 1 },
        energy_harvesting: { name: "Energie Oogst", desc: "Speelt Orbitale Werf vrij.", cost: { beam: 1000000, brick: 1000000 }, unlocked: false, stream: "Dyson-technologie", requirement: () => game.era >= 11 },
        dyson_sphere: { name: "Dyson Bol", desc: "Speelt Dyson Zwerm vrij.", cost: { gold: 5000000, researchPoints: 2500000 }, unlocked: false, stream: "Dyson-technologie", requirement: () => game.buildings.orbital_shipyard && game.buildings.orbital_shipyard.count >= 1 },
        toolmaking: {`;

stateStr = stateStr.replace(/        engineer: { name: "Ingenieur"[\s\S]*?},/, "        engineer: { name: \"Ingenieur\", count: 0, max: 0, effect: { stone: 5, brick: 5, food: -2 }, unlocked: false, stream: \"Wegenbouw\" },\n" + jobsPayload.trim() + "\n    },");
stateStr = stateStr.replace(/        \/\/ Basis gebouwen/, buildingsPayload.trim());
stateStr = stateStr.replace(/        toolmaking: {/, researchPayload.trim());

// Initial State Replace
const initialJobs = `
            engineer: { count: 0 },
            knight_lord: { count: 0 }, monk: { count: 0 }, artisan: { count: 0 },
            musketeer: { count: 0 }, artist: { count: 0 }, explorer: { count: 0 },
            colonist: { count: 0 }, scientist: { count: 0 }, trader: { count: 0 },
            factory_worker: { count: 0 }, mechanical_engineer: { count: 0 }, union_leader: { count: 0 },
            nuclear_physicist: { count: 0 }, quantum_scientist: { count: 0 }, pilot: { count: 0 },
            hacker: { count: 0 }, ai_developer: { count: 0 }, crypto_trader: { count: 0 },
            space_marine: { count: 0 }, cyborg: { count: 0 }, solar_architect: { count: 0 }
        },`;

const initialBuildings = `
            aqueduct: { name: "Aquaduct", count: 0, cost: { brick: 8000, gold: 2000 }, provides: { max_food: 10000, job_engineer: 2 }, desc: "Voorziet steden van vers water.", unlocked: false, stream: "Wegenbouw" },
            // Era 5-11 Streams
            castle: { name: "Kasteel", count: 0, cost: { stone: 10000, wood: 5000 }, provides: { job_knight_lord: 5, max_population: 100 }, desc: "Een machtig fort voor ridders.", unlocked: false, stream: "Feodalisme" },
            feudal_estate: { name: "Feodaal Landgoed", count: 0, cost: { gold: 5000, food: 10000 }, provides: { job_knight_lord: 2, max_food: 15000 }, desc: "Uitgestrekte landerijen.", unlocked: false, stream: "Feodalisme" },
            monastery: { name: "Klooster", count: 0, cost: { stone: 8000, wood: 4000 }, provides: { job_monk: 5, max_researchPoints: 5000 }, desc: "Een plek voor stilte en studie.", unlocked: false, stream: "Theologie" },
            cathedral: { name: "Kathedraal", count: 0, cost: { brick: 15000, gold: 10000 }, provides: { job_monk: 2, max_intel: 2000 }, desc: "Een monumentaal religieus gebouw.", unlocked: false, stream: "Theologie" },
            guild_hall: { name: "Gildehuis", count: 0, cost: { beam: 5000, brick: 5000 }, provides: { job_artisan: 5, max_gold: 15000 }, desc: "Het centrum van handel en ambacht.", unlocked: false, stream: "Gilden" },
            market_square: { name: "Marktplein", count: 0, cost: { wood: 10000, stone: 10000 }, provides: { job_artisan: 2, max_population: 200 }, desc: "Vergroot de bevolking en trekt ambachtslieden aan.", unlocked: false, stream: "Gilden" },
            cannon_foundry: { name: "Kanongieterij", count: 0, cost: { beam: 10000, brick: 10000, gold: 15000 }, provides: { job_musketeer: 5, max_gold: 20000 }, desc: "Produceert verwoestende wapens.", unlocked: false, stream: "Buskruit" },
            star_fort: { name: "Sterfort", count: 0, cost: { brick: 25000, stone: 20000 }, provides: { job_musketeer: 2, max_population: 300 }, desc: "Onneembare verdedigingslinie.", unlocked: false, stream: "Buskruit" },
            printing_press: { name: "Drukpers", count: 0, cost: { beam: 8000, gold: 10000 }, provides: { job_artist: 5, max_researchPoints: 15000 }, desc: "Verspreidt kennis razendsnel.", unlocked: false, stream: "Humanisme" },
            art_academy: { name: "Kunstacademie", count: 0, cost: { stone: 15000, gold: 12000 }, provides: { job_artist: 2, max_intel: 5000 }, desc: "Opleidingscentrum voor de meesters.", unlocked: false, stream: "Humanisme" },
            observatory: { name: "Observatorium", count: 0, cost: { brick: 12000, researchPoints: 10000 }, provides: { job_explorer: 5, max_intel: 10000 }, desc: "Bestudeer de sterren en ontdek de wereld.", unlocked: false, stream: "Cartografie" },
            naval_base: { name: "Vlootbasis", count: 0, cost: { beam: 15000, gold: 20000 }, provides: { job_explorer: 2, max_gold: 30000 }, desc: "Bouwt expeditieschepen.", unlocked: false, stream: "Cartografie" },
            governor_mansion: { name: "Gouverneurshuis", count: 0, cost: { gold: 30000, brick: 20000 }, provides: { job_colonist: 5, max_food: 50000 }, desc: "Zetel van de overzeese macht.", unlocked: false, stream: "Imperialisme" },
            colony: { name: "Kolonie", count: 0, cost: { beam: 20000, food: 40000 }, provides: { job_colonist: 2, max_population: 500 }, desc: "Uitbreiding van je rijk over zee.", unlocked: false, stream: "Imperialisme" },
            laboratory: { name: "Laboratorium", count: 0, cost: { brick: 20000, researchPoints: 20000 }, provides: { job_scientist: 5, max_researchPoints: 40000 }, desc: "Moderne onderzoeksfaciliteit.", unlocked: false, stream: "Wetenschappelijke Methode" },
            science_institute: { name: "Wetenschappelijk Instituut", count: 0, cost: { gold: 25000, beam: 15000 }, provides: { job_scientist: 2, max_intel: 15000 }, desc: "Bundelt de knapste koppen.", unlocked: false, stream: "Wetenschappelijke Methode" },
            stock_exchange: { name: "Beurs", count: 0, cost: { gold: 50000, brick: 30000 }, provides: { job_trader: 5, max_gold: 100000 }, desc: "Laat kapitaal exponentieel groeen.", unlocked: false, stream: "Mercantillisme" },
            trading_company: { name: "Oost-Indisch Huis", count: 0, cost: { beam: 30000, gold: 40000 }, provides: { job_trader: 2, max_population: 400 }, desc: "De eerste multinationals.", unlocked: false, stream: "Mercantillisme" },
            steam_factory: { name: "Stoommachinefabriek", count: 0, cost: { brick: 50000, beam: 40000 }, provides: { job_factory_worker: 5, max_beam: 20000, max_brick: 20000 }, desc: "Massaproductie in de hoogste versnelling.", unlocked: false, stream: "Automatisering" },
            assembly_line: { name: "Lopende Band", count: 0, cost: { gold: 60000, researchPoints: 30000 }, provides: { job_factory_worker: 2, max_population: 1000 }, desc: "Ultieme industriële efficiëntie.", unlocked: false, stream: "Automatisering" },
            coal_mine: { name: "Kolenmijn", count: 0, cost: { beam: 30000, stone: 80000 }, provides: { job_mechanical_engineer: 5, max_intel: 30000 }, desc: "Brandstof voor de revolutie.", unlocked: false, stream: "Thermodynamica" },
            power_plant: { name: "Energiecentrale", count: 0, cost: { brick: 60000, gold: 80000 }, provides: { job_mechanical_engineer: 2, max_researchPoints: 80000 }, desc: "Voorziet de stad van stroom.", unlocked: false, stream: "Thermodynamica" },
            union_hall: { name: "Vakbondshuis", count: 0, cost: { food: 100000, gold: 50000 }, provides: { job_union_leader: 5, max_population: 1500 }, desc: "Strijdt voor betere rechten.", unlocked: false, stream: "Vakbonden" },
            worker_district: { name: "Arbeiderswijk", count: 0, cost: { brick: 40000, beam: 40000 }, provides: { job_union_leader: 2, max_food: 100000 }, desc: "Huisvesting voor de massa.", unlocked: false, stream: "Vakbonden" },
            uranium_mine: { name: "Uraniummijn", count: 0, cost: { beam: 80000, gold: 150000 }, provides: { job_nuclear_physicist: 5, max_gold: 500000 }, desc: "Gevaarlijk maar lucratief.", unlocked: false, stream: "Kernsplitsing" },
            nuclear_reactor: { name: "Kernreactor", count: 0, cost: { brick: 150000, researchPoints: 100000 }, provides: { job_nuclear_physicist: 2, max_researchPoints: 200000 }, desc: "Eindeloze energie.", unlocked: false, stream: "Kernsplitsing" },
            particle_accelerator: { name: "Deeltjesversneller", count: 0, cost: { gold: 200000, researchPoints: 150000 }, provides: { job_quantum_scientist: 5, max_researchPoints: 300000 }, desc: "Onderzoekt de fundamentele bouwstenen.", unlocked: false, stream: "Kwantumfysica" },
            quantum_lab: { name: "Kwantumlab", count: 0, cost: { beam: 100000, intel: 50000 }, provides: { job_quantum_scientist: 2, max_intel: 100000 }, desc: "Breekt de wetten van de natuurkunde.", unlocked: false, stream: "Kwantumfysica" },
            airport: { name: "Vliegveld", count: 0, cost: { brick: 120000, beam: 120000 }, provides: { job_pilot: 5, max_population: 3000 }, desc: "Wereldwijde logistiek.", unlocked: false, stream: "Luchtvaart" },
            aerospace_factory: { name: "Luchtvaartfabriek", count: 0, cost: { gold: 250000, researchPoints: 80000 }, provides: { job_pilot: 2, max_gold: 800000 }, desc: "Bouwt vliegtuigen.", unlocked: false, stream: "Luchtvaart" },
            server_farm: { name: "Serverboerderij", count: 0, cost: { gold: 500000, beam: 200000 }, provides: { job_hacker: 5, max_intel: 300000 }, desc: "Verwerkt enorme hoeveelheden data.", unlocked: false, stream: "Cyber-oorlogsvoering" },
            cyber_defense_center: { name: "Cyberdefensie Centrum", count: 0, cost: { researchPoints: 400000, gold: 400000 }, provides: { job_hacker: 2, max_gold: 1500000 }, desc: "Bewaakt de firewalls.", unlocked: false, stream: "Cyber-oorlogsvoering" },
            data_center: { name: "Datacenter", count: 0, cost: { brick: 300000, gold: 600000 }, provides: { job_ai_developer: 5, max_researchPoints: 1000000 }, desc: "De longen van kunstmatige intelligentie.", unlocked: false, stream: "AI & Algoritmes" },
            neural_network: { name: "Neuraal Netwerk", count: 0, cost: { researchPoints: 600000, intel: 200000 }, provides: { job_ai_developer: 2, max_food: 500000 }, desc: "Een brein van silicium.", unlocked: false, stream: "AI & Algoritmes" },
            world_trade_center: { name: "World Trade Center", count: 0, cost: { brick: 500000, beam: 500000 }, provides: { job_crypto_trader: 5, max_gold: 5000000 }, desc: "Het financiële centrum van de aarde.", unlocked: false, stream: "Wereldeconomie" },
            multinational_corp: { name: "Multinational", count: 0, cost: { gold: 1000000, researchPoints: 300000 }, provides: { job_crypto_trader: 2, max_population: 10000 }, desc: "Bedrijven machtiger dan landen.", unlocked: false, stream: "Wereldeconomie" },
            starbase: { name: "Sterrenbasis", count: 0, cost: { beam: 1000000, brick: 1000000 }, provides: { job_space_marine: 5, max_population: 50000 }, desc: "Je uitkijkpost in de kosmos.", unlocked: false, stream: "Galactische Hegemonie" },
            space_fleet: { name: "Ruimtevloot", count: 0, cost: { gold: 5000000, intel: 1000000 }, provides: { job_space_marine: 2, max_gold: 20000000 }, desc: "Domineer de Melkweg.", unlocked: false, stream: "Galactische Hegemonie" },
            mind_upload_center: { name: "Mind Upload Center", count: 0, cost: { researchPoints: 2000000, gold: 2000000 }, provides: { job_cyborg: 5, max_researchPoints: 10000000 }, desc: "Ontsnap aan het biologische.", unlocked: false, stream: "Transcendentie" },
            megastructure: { name: "Megastructuur", count: 0, cost: { brick: 2000000, beam: 2000000 }, provides: { job_cyborg: 2, max_intel: 5000000 }, desc: "Een huis voor miljarden bewustzijnen.", unlocked: false, stream: "Transcendentie" },
            orbital_shipyard: { name: "Orbitale Werf", count: 0, cost: { gold: 4000000, beam: 2000000 }, provides: { job_solar_architect: 5, max_beam: 5000000, max_brick: 5000000 }, desc: "Bouwt planetair grote schepen.", unlocked: false, stream: "Dyson-technologie" },
            dyson_swarm: { name: "Dyson Zwerm", count: 0, cost: { researchPoints: 5000000, intel: 2000000 }, provides: { job_solar_architect: 2, max_gold: 50000000 }, desc: "Oogst de energie van een hele ster.", unlocked: false, stream: "Dyson-technologie" },
            hut: {`;

const initialResearch = `
            hydraulics: { unlocked: false },
            // Era 5-11 Streams
            vassalage: { unlocked: false }, chivalry: { unlocked: false },
            divine_right: { unlocked: false }, scholasticism: { unlocked: false },
            guild_system: { unlocked: false }, masterpieces: { unlocked: false },
            black_powder: { unlocked: false }, artillery: { unlocked: false },
            perspective: { unlocked: false }, typography: { unlocked: false },
            compass: { unlocked: false }, world_map: { unlocked: false },
            overseas_expansion: { unlocked: false }, colonial_rule: { unlocked: false },
            empiricism: { unlocked: false }, calculus: { unlocked: false },
            merchant_fleets: { unlocked: false }, stocks: { unlocked: false },
            steam_power: { unlocked: false }, mass_production: { unlocked: false },
            combustion_engine: { unlocked: false }, electricity: { unlocked: false },
            labor_rights: { unlocked: false }, social_reform: { unlocked: false },
            radioactivity: { unlocked: false }, atomic_bomb: { unlocked: false },
            quantum_mechanics: { unlocked: false }, superconductivity: { unlocked: false },
            aerodynamics: { unlocked: false }, jet_engines: { unlocked: false },
            cryptography: { unlocked: false }, cyber_espionage: { unlocked: false },
            machine_learning: { unlocked: false }, artificial_intelligence: { unlocked: false },
            globalization: { unlocked: false }, digital_currency: { unlocked: false },
            warp_drive: { unlocked: false }, galactic_empire: { unlocked: false },
            mind_uploading: { unlocked: false }, singularity: { unlocked: false },
            energy_harvesting: { unlocked: false }, dyson_sphere: { unlocked: false },
            toolmaking: { unlocked: false },`;

stateStr = stateStr.replace(/            engineer: { count: 0 }\n        },/, initialJobs.trim());
stateStr = stateStr.replace(/            aqueduct: { name: "Aquaduct"[\s\S]*?},\n            hut: {/, initialBuildings.trim());
stateStr = stateStr.replace(/            hydraulics: { unlocked: false },\n            toolmaking: { unlocked: false },/, initialResearch.trim());

fs.writeFileSync(stateFile, stateStr);


const engineLogicPayload = `
    // ERA 5
    if (game.research.vassalage.unlocked) game.buildings.castle.unlocked = true;
    if (game.buildings.castle.count > 0) game.jobs.knight_lord.unlocked = true;
    if (game.research.chivalry.unlocked) game.buildings.feudal_estate.unlocked = true;
    
    if (game.research.divine_right.unlocked) game.buildings.monastery.unlocked = true;
    if (game.buildings.monastery.count > 0) game.jobs.monk.unlocked = true;
    if (game.research.scholasticism.unlocked) game.buildings.cathedral.unlocked = true;

    if (game.research.guild_system.unlocked) game.buildings.guild_hall.unlocked = true;
    if (game.buildings.guild_hall.count > 0) game.jobs.artisan.unlocked = true;
    if (game.research.masterpieces.unlocked) game.buildings.market_square.unlocked = true;

    // ERA 6
    if (game.research.black_powder.unlocked) game.buildings.cannon_foundry.unlocked = true;
    if (game.buildings.cannon_foundry.count > 0) game.jobs.musketeer.unlocked = true;
    if (game.research.artillery.unlocked) game.buildings.star_fort.unlocked = true;

    if (game.research.perspective.unlocked) game.buildings.printing_press.unlocked = true;
    if (game.buildings.printing_press.count > 0) game.jobs.artist.unlocked = true;
    if (game.research.typography.unlocked) game.buildings.art_academy.unlocked = true;

    if (game.research.compass.unlocked) game.buildings.observatory.unlocked = true;
    if (game.buildings.observatory.count > 0) game.jobs.explorer.unlocked = true;
    if (game.research.world_map.unlocked) game.buildings.naval_base.unlocked = true;

    // ERA 7
    if (game.research.overseas_expansion.unlocked) game.buildings.governor_mansion.unlocked = true;
    if (game.buildings.governor_mansion.count > 0) game.jobs.colonist.unlocked = true;
    if (game.research.colonial_rule.unlocked) game.buildings.colony.unlocked = true;

    if (game.research.empiricism.unlocked) game.buildings.laboratory.unlocked = true;
    if (game.buildings.laboratory.count > 0) game.jobs.scientist.unlocked = true;
    if (game.research.calculus.unlocked) game.buildings.science_institute.unlocked = true;

    if (game.research.merchant_fleets.unlocked) game.buildings.stock_exchange.unlocked = true;
    if (game.buildings.stock_exchange.count > 0) game.jobs.trader.unlocked = true;
    if (game.research.stocks.unlocked) game.buildings.trading_company.unlocked = true;

    // ERA 8
    if (game.research.steam_power.unlocked) game.buildings.steam_factory.unlocked = true;
    if (game.buildings.steam_factory.count > 0) game.jobs.factory_worker.unlocked = true;
    if (game.research.mass_production.unlocked) game.buildings.assembly_line.unlocked = true;

    if (game.research.combustion_engine.unlocked) game.buildings.coal_mine.unlocked = true;
    if (game.buildings.coal_mine.count > 0) game.jobs.mechanical_engineer.unlocked = true;
    if (game.research.electricity.unlocked) game.buildings.power_plant.unlocked = true;

    if (game.research.labor_rights.unlocked) game.buildings.union_hall.unlocked = true;
    if (game.buildings.union_hall.count > 0) game.jobs.union_leader.unlocked = true;
    if (game.research.social_reform.unlocked) game.buildings.worker_district.unlocked = true;

    // ERA 9
    if (game.research.radioactivity.unlocked) game.buildings.uranium_mine.unlocked = true;
    if (game.buildings.uranium_mine.count > 0) game.jobs.nuclear_physicist.unlocked = true;
    if (game.research.atomic_bomb.unlocked) game.buildings.nuclear_reactor.unlocked = true;

    if (game.research.quantum_mechanics.unlocked) game.buildings.particle_accelerator.unlocked = true;
    if (game.buildings.particle_accelerator.count > 0) game.jobs.quantum_scientist.unlocked = true;
    if (game.research.superconductivity.unlocked) game.buildings.quantum_lab.unlocked = true;

    if (game.research.aerodynamics.unlocked) game.buildings.airport.unlocked = true;
    if (game.buildings.airport.count > 0) game.jobs.pilot.unlocked = true;
    if (game.research.jet_engines.unlocked) game.buildings.aerospace_factory.unlocked = true;

    // ERA 10
    if (game.research.cryptography.unlocked) game.buildings.server_farm.unlocked = true;
    if (game.buildings.server_farm.count > 0) game.jobs.hacker.unlocked = true;
    if (game.research.cyber_espionage.unlocked) game.buildings.cyber_defense_center.unlocked = true;

    if (game.research.machine_learning.unlocked) game.buildings.data_center.unlocked = true;
    if (game.buildings.data_center.count > 0) game.jobs.ai_developer.unlocked = true;
    if (game.research.artificial_intelligence.unlocked) game.buildings.neural_network.unlocked = true;

    if (game.research.globalization.unlocked) game.buildings.world_trade_center.unlocked = true;
    if (game.buildings.world_trade_center.count > 0) game.jobs.crypto_trader.unlocked = true;
    if (game.research.digital_currency.unlocked) game.buildings.multinational_corp.unlocked = true;

    // ERA 11
    if (game.research.warp_drive.unlocked) game.buildings.starbase.unlocked = true;
    if (game.buildings.starbase.count > 0) game.jobs.space_marine.unlocked = true;
    if (game.research.galactic_empire.unlocked) game.buildings.space_fleet.unlocked = true;

    if (game.research.mind_uploading.unlocked) game.buildings.mind_upload_center.unlocked = true;
    if (game.buildings.mind_upload_center.count > 0) game.jobs.cyborg.unlocked = true;
    if (game.research.singularity.unlocked) game.buildings.megastructure.unlocked = true;

    if (game.research.energy_harvesting.unlocked) game.buildings.orbital_shipyard.unlocked = true;
    if (game.buildings.orbital_shipyard.count > 0) game.jobs.solar_architect.unlocked = true;
    if (game.research.dyson_sphere.unlocked) game.buildings.dyson_swarm.unlocked = true;

    // BASE UNLOCKS`;

engineStr = engineStr.replace(/    if \(game.research.hydraulics.unlocked\) game.buildings.aqueduct.unlocked = true;\n\n    \/\/ BASE UNLOCKS/, "    if (game.research.hydraulics.unlocked) game.buildings.aqueduct.unlocked = true;\n\n" + engineLogicPayload.trim() + "\n\n    // BASE UNLOCKS");

fs.writeFileSync(engineFile, engineStr);

console.log("Done");

import { BaseShipModel } from '../types/ship';

export const BASE_SHIPS: BaseShipModel[] = [
  {
    id: 'destroyer-aegis',
    name: 'Aegis Guided Destroyer',
    type: 'Guided-Missile Destroyer',
    hullClass: 'DDG',
    description: 'Premier modern multi-mission surface combatant with phased-array radar, forward naval deck gun, and vertical launch missile cells.',
    hullLength: 104,
    hullWidth: 32,
    baseHp: 850,
    baseSpeed: 88,
    baseTurnRate: 1.10,
    baseArmor: 22,
    hardpoints: [
      { id: 'hp-bow', name: 'Bow Main Deck Gun', x: 0.72, y: 0, allowedArc: 'bow', defaultComponentId: 'mk45-naval-gun' },
      { id: 'hp-port-missile', name: 'Port Harpoon Rack', x: 0.15, y: -0.65, allowedArc: 'broadside-left', defaultComponentId: 'harpoon-missile' },
      { id: 'hp-starboard-missile', name: 'Starboard Harpoon Rack', x: 0.15, y: 0.65, allowedArc: 'broadside-right', defaultComponentId: 'harpoon-missile' },
      { id: 'hp-mid-vls', name: 'Midship VLS Missile Silo', x: -0.15, y: 0, allowedArc: 'all', defaultComponentId: 'vls-tomahawk' },
      { id: 'hp-aft-ciws', name: 'Aft Phalanx CIWS', x: -0.55, y: 0, allowedArc: 'all', defaultComponentId: 'phalanx-ciws' },
      { id: 'hp-stern-aux', name: 'Gas Turbine Aux', x: -0.80, y: 0, allowedArc: 'stern', defaultComponentId: 'gas-turbine' },
    ],
    svgHullPath: 'M 52,0 L 40,-13 L -36,-14 L -48,-11 L -52,-7 L -52,7 L -48,11 L -36,14 L 40,13 Z',
    spriteStyle: {
      deckColor: '#334155', // Modern nonskid dark slate
      hullColor: '#1e293b', // Navy slate gray
      accentColor: '#38bdf8', // Tactical blue
      details: '#475569',
      stealthFacets: true,
      hasHelipad: true,
    }
  },
  {
    id: 'frigate-stealth',
    name: 'Ghost Trimaran Frigate',
    type: 'Littoral Stealth Frigate',
    hullClass: 'FFG',
    description: 'Advanced wave-piercing trimaran with radar-deflecting stealth geometry, extreme speed, and rapid-fire naval autocannons.',
    hullLength: 92,
    hullWidth: 42,
    baseHp: 680,
    baseSpeed: 98,
    baseTurnRate: 1.25,
    baseArmor: 16,
    hardpoints: [
      { id: 'hp-bow-gun', name: 'Bow Stealth Autocannon', x: 0.70, y: 0, allowedArc: 'bow', defaultComponentId: 'mk45-naval-gun' },
      { id: 'hp-port-wing', name: 'Port Outrigger Launcher', x: 0.10, y: -0.75, allowedArc: 'broadside-left', defaultComponentId: 'harpoon-missile' },
      { id: 'hp-starboard-wing', name: 'Starboard Outrigger Launcher', x: 0.10, y: 0.75, allowedArc: 'broadside-right', defaultComponentId: 'harpoon-missile' },
      { id: 'hp-center-ciws', name: 'Superstructure CIWS', x: -0.10, y: 0, allowedArc: 'all', defaultComponentId: 'phalanx-ciws' },
      { id: 'hp-stern-jet', name: 'Hydro-Jet Vector Thruster', x: -0.68, y: 0, allowedArc: 'stern', defaultComponentId: 'azipod-propulsor' },
    ],
    svgHullPath: 'M 46,0 L 32,-8 L -32,-9 L -44,-6 L -44,6 L -32,9 L 32,8 Z M 20,-16 L -28,-18 L -36,-14 L -24,-13 Z M 20,16 L -28,18 L -36,14 L -24,13 Z',
    spriteStyle: {
      deckColor: '#1e293b',
      hullColor: '#0f172a',
      accentColor: '#22d3ee', // Cyan
      details: '#334155',
      stealthFacets: true,
      hasHelipad: true,
    }
  },
  {
    id: 'cruiser-cgn',
    name: 'Titan Heavy Missile Cruiser',
    type: 'Nuclear Guided Cruiser',
    hullClass: 'CGN',
    description: 'Colossal naval flagship packed with heavy deck artillery, extended VLS missile banks, and thick titanium composite bulkheads.',
    hullLength: 122,
    hullWidth: 36,
    baseHp: 1350,
    baseSpeed: 70,
    baseTurnRate: 0.72,
    baseArmor: 35,
    hardpoints: [
      { id: 'hp-bow-heavy', name: 'Forward Heavy Deck Gun', x: 0.76, y: 0, allowedArc: 'bow', defaultComponentId: 'mk45-naval-gun' },
      { id: 'hp-vls-forward', name: 'Forward VLS Missile Bank', x: 0.42, y: 0, allowedArc: 'all', defaultComponentId: 'vls-tomahawk' },
      { id: 'hp-port-torp', name: 'Port Mk48 Torpedo Tube', x: 0.05, y: -0.70, allowedArc: 'broadside-left', defaultComponentId: 'mk48-torpedo' },
      { id: 'hp-starboard-torp', name: 'Starboard Mk48 Torpedo Tube', x: 0.05, y: 0.70, allowedArc: 'broadside-right', defaultComponentId: 'mk48-torpedo' },
      { id: 'hp-aft-vls', name: 'Aft VLS Missile Bank', x: -0.30, y: 0, allowedArc: 'all', defaultComponentId: 'vls-tomahawk' },
      { id: 'hp-aft-heavy', name: 'Rear Deck Gun', x: -0.58, y: 0, allowedArc: 'all', defaultComponentId: 'mk45-naval-gun' },
      { id: 'hp-stern-defense', name: 'Aft SeaRAM Interceptor', x: -0.78, y: 0, allowedArc: 'stern', defaultComponentId: 'searam-launcher' },
    ],
    svgHullPath: 'M 61,0 L 48,-14 L -44,-16 L -58,-12 L -61,-6 L -61,6 L -58,12 L -44,16 L 48,14 Z',
    spriteStyle: {
      deckColor: '#334155',
      hullColor: '#1e293b',
      accentColor: '#f59e0b', // Amber tactical
      details: '#475569',
      stealthFacets: false,
      hasHelipad: true,
    }
  },
  {
    id: 'battlecruiser-hyperion',
    name: 'Hyperion Railgun Battlecruiser',
    type: 'Arsenal Battlecruiser',
    hullClass: 'BBG',
    description: 'Experimental capital vessel mounting a bow-mounted electromagnetic railgun capable of hypervelocity kinetic armor-piercing strikes.',
    hullLength: 128,
    hullWidth: 38,
    baseHp: 1400,
    baseSpeed: 72,
    baseTurnRate: 0.68,
    baseArmor: 38,
    hardpoints: [
      { id: 'hp-bow-railgun', name: 'Bow EM Railgun Turret', x: 0.78, y: 0, allowedArc: 'bow', defaultComponentId: 'em-railgun' },
      { id: 'hp-port-missiles', name: 'Port Anti-Ship Pod', x: 0.28, y: -0.72, allowedArc: 'broadside-left', defaultComponentId: 'harpoon-missile' },
      { id: 'hp-starboard-missiles', name: 'Starboard Anti-Ship Pod', x: 0.28, y: 0.72, allowedArc: 'broadside-right', defaultComponentId: 'harpoon-missile' },
      { id: 'hp-mid-vls', name: 'Heavy VLS Missile Grid', x: -0.10, y: 0, allowedArc: 'all', defaultComponentId: 'vls-tomahawk' },
      { id: 'hp-aft-ciws', name: 'Dual Phalanx CIWS', x: -0.48, y: 0, allowedArc: 'all', defaultComponentId: 'phalanx-ciws' },
      { id: 'hp-armor-bay', name: 'Heavy Composite Armor Bay', x: -0.75, y: 0, allowedArc: 'stern', defaultComponentId: 'composite-armor' },
    ],
    svgHullPath: 'M 64,0 L 52,-15 L -45,-17 L -60,-13 L -64,-8 L -64,8 L -60,13 L -45,17 L 52,15 Z',
    spriteStyle: {
      deckColor: '#1e293b',
      hullColor: '#0f172a',
      accentColor: '#3b82f6',
      details: '#475569',
      stealthFacets: true,
      hasHelipad: true,
    }
  },
  {
    id: 'sub-raider',
    name: 'Vanguard Surface Submersible',
    type: 'Attack Submersible',
    hullClass: 'SSN',
    description: 'Ultra-low radar cross-section surface raider equipped with acoustic heavy torpedo tubes and sea-skimming missile strikes.',
    hullLength: 96,
    hullWidth: 26,
    baseHp: 620,
    baseSpeed: 65,
    baseTurnRate: 0.85,
    baseArmor: 18,
    hardpoints: [
      { id: 'hp-port-bow-torp', name: 'Port Bow Torpedo', x: 0.72, y: -0.40, allowedArc: 'bow', defaultComponentId: 'mk48-torpedo' },
      { id: 'hp-star-bow-torp', name: 'Starboard Bow Torpedo', x: 0.72, y: 0.40, allowedArc: 'bow', defaultComponentId: 'mk48-torpedo' },
      { id: 'hp-conning-gun', name: 'Conning Tower Autocannon', x: 0.10, y: 0, allowedArc: 'all', defaultComponentId: 'phalanx-ciws' },
      { id: 'hp-missile-tube', name: 'Vertical Cruise Missile Tube', x: -0.32, y: 0, allowedArc: 'all', defaultComponentId: 'vls-tomahawk' },
      { id: 'hp-silent-drive', name: 'Pump-Jet Silent Drive', x: -0.75, y: 0, allowedArc: 'stern', defaultComponentId: 'azipod-propulsor' },
    ],
    svgHullPath: 'M 48,0 C 44,-8 28,-11 -28,-11 C -42,-11 -48,-6 -48,0 C -48,6 -42,11 -28,11 C 28,11 44,8 48,0 Z',
    spriteStyle: {
      deckColor: '#090d16',
      hullColor: '#111827',
      accentColor: '#10b981', // Emerald sonar green
      details: '#1f2937',
      stealthFacets: false,
      hasHelipad: false,
    }
  },
  {
    id: 'corvette-fast',
    name: 'Viper Fast Attack Craft',
    type: 'Missile Patrol Corvette',
    hullClass: 'FAC',
    description: 'High-speed interceptor craft designed for hit-and-run strikes with twin torpedoes and rapid autocannon salvos.',
    hullLength: 76,
    hullWidth: 25,
    baseHp: 520,
    baseSpeed: 108,
    baseTurnRate: 1.40,
    baseArmor: 12,
    hardpoints: [
      { id: 'hp-bow-cannon', name: 'Bow 30mm Chain Gun', x: 0.68, y: 0, allowedArc: 'bow', defaultComponentId: 'phalanx-ciws' },
      { id: 'hp-port-torp', name: 'Port Light Torpedo', x: -0.05, y: -0.65, allowedArc: 'broadside-left', defaultComponentId: 'mk48-torpedo' },
      { id: 'hp-star-torp', name: 'Starboard Light Torpedo', x: -0.05, y: 0.65, allowedArc: 'broadside-right', defaultComponentId: 'mk48-torpedo' },
      { id: 'hp-aft-booster', name: 'Marine Gas Turbine', x: -0.65, y: 0, allowedArc: 'stern', defaultComponentId: 'gas-turbine' },
    ],
    svgHullPath: 'M 38,0 L 26,-10 L -24,-11 L -36,-8 L -38,-5 L -38,5 L -36,8 L -24,11 L 26,10 Z',
    spriteStyle: {
      deckColor: '#334155',
      hullColor: '#1e293b',
      accentColor: '#f43f5e', // Rose red
      details: '#475569',
      stealthFacets: true,
      hasHelipad: false,
    }
  },
  {
    id: 'carrier-corvette',
    name: 'Centurion Strike Drone Corvette',
    type: 'Multi-Mission Strike Corvette',
    hullClass: 'FSG',
    description: 'Balanced modern combatant with an extended aft helipad/drone deck, VLS missile cells, and heavy point defense.',
    hullLength: 90,
    hullWidth: 32,
    baseHp: 800,
    baseSpeed: 85,
    baseTurnRate: 1.10,
    baseArmor: 20,
    hardpoints: [
      { id: 'hp-bow-gun', name: 'Bow 76mm Rapid Gun', x: 0.70, y: 0, allowedArc: 'bow', defaultComponentId: 'mk45-naval-gun' },
      { id: 'hp-port-missile', name: 'Port Harpoon Tube', x: 0.15, y: -0.65, allowedArc: 'broadside-left', defaultComponentId: 'harpoon-missile' },
      { id: 'hp-star-missile', name: 'Starboard Harpoon Tube', x: 0.15, y: 0.65, allowedArc: 'broadside-right', defaultComponentId: 'harpoon-missile' },
      { id: 'hp-vls-cell', name: 'VLS Swarm Cell', x: -0.15, y: 0, allowedArc: 'all', defaultComponentId: 'vls-tomahawk' },
      { id: 'hp-aft-dc', name: 'Damage Control Center', x: -0.60, y: 0, allowedArc: 'stern', defaultComponentId: 'auto-damage-control' },
    ],
    svgHullPath: 'M 45,0 L 32,-13 L -28,-14 L -42,-10 L -45,-6 L -45,6 L -42,10 L -28,14 L 32,13 Z',
    spriteStyle: {
      deckColor: '#1e293b',
      hullColor: '#0f172a',
      accentColor: '#a855f7', // Purple
      details: '#334155',
      stealthFacets: true,
      hasHelipad: true,
    }
  }
];

export const SHIP_MODEL_MAP = new Map<string, BaseShipModel>(
  BASE_SHIPS.map(m => [m.id, m])
);

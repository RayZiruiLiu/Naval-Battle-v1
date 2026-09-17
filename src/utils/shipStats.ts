import { BaseShipModel, CustomShipConfig, ShipStats } from '../types/ship';
import { BASE_SHIPS, SHIP_MODEL_MAP } from '../data/shipModels';
import { COMPONENT_MAP } from '../data/components';

export function calculateShipStats(model: BaseShipModel, config: CustomShipConfig): ShipStats {
  let maxHp = model.baseHp;
  let speed = model.baseSpeed;
  let turnRate = model.baseTurnRate;
  let armorRating = model.baseArmor;
  let totalDps = 0;
  let maxRange = 0;
  let componentCount = 0;

  for (const hardpoint of model.hardpoints) {
    const compId = config.equippedComponents[hardpoint.id];
    if (!compId) continue;
    const comp = COMPONENT_MAP.get(compId);
    if (!comp) continue;

    componentCount++;

    if (comp.bonusHp) maxHp += comp.bonusHp;
    if (comp.bonusSpeed) speed += comp.bonusSpeed;
    if (comp.bonusTurnRate) turnRate += comp.bonusTurnRate;
    if (comp.damageReduction) armorRating += Math.round(comp.damageReduction * 100);

    if (comp.damage > 0 && comp.reloadTime > 0) {
      const shotsPerSec = 1 / comp.reloadTime;
      const count = comp.projectilesPerShot || 1;
      totalDps += comp.damage * count * shotsPerSec;
      if (comp.range > maxRange) {
        maxRange = comp.range;
      }
    }
  }

  return {
    maxHp: Math.round(maxHp),
    speed: Math.round(speed),
    turnRate: Number(turnRate.toFixed(2)),
    firepowerDps: Math.round(totalDps),
    effectiveRange: Math.round(maxRange),
    armorRating: Math.round(armorRating),
    componentCount,
  };
}

export const SHIP_PRESETS: { name: string; description: string; config: CustomShipConfig }[] = [
  {
    name: 'Aegis Destroyer (DDG)',
    description: 'Premier modern guided-missile destroyer equipped with forward 127mm naval gun, Harpoon missiles, and midship VLS Tomahawk cells.',
    config: {
      name: 'USS Aegis Vanguard',
      baseModelId: 'destroyer-aegis',
      primaryColor: '#1e293b', // Modern Navy Slate
      accentColor: '#38bdf8', // Tactical Cyan
      equippedComponents: {
        'hp-bow': 'mk45-naval-gun',
        'hp-port-missile': 'harpoon-missile',
        'hp-starboard-missile': 'harpoon-missile',
        'hp-mid-vls': 'vls-tomahawk',
        'hp-aft-ciws': 'phalanx-ciws',
        'hp-stern-aux': 'gas-turbine',
      },
    },
  },
  {
    name: 'Ghost Stealth Trimaran (FFG)',
    description: 'Wave-piercing littoral combat trimaran with radar-deflecting stealth facets, rapid autocannon, and high-speed hydro-jets.',
    config: {
      name: 'Ghost Spectre',
      baseModelId: 'frigate-stealth',
      primaryColor: '#0f172a', // Midnight Stealth
      accentColor: '#22d3ee', // Cyan Glow
      equippedComponents: {
        'hp-bow-gun': 'mk45-naval-gun',
        'hp-port-wing': 'harpoon-missile',
        'hp-starboard-wing': 'harpoon-missile',
        'hp-center-ciws': 'phalanx-ciws',
        'hp-stern-jet': 'azipod-propulsor',
      },
    },
  },
  {
    name: 'Titan Heavy Cruiser (CGN)',
    description: 'Colossal nuclear-powered missile cruiser outfitted with dual heavy deck artillery, double VLS missile banks, and titanium composite armor.',
    config: {
      name: 'Titan Colossus',
      baseModelId: 'cruiser-cgn',
      primaryColor: '#1e3a5f', // Deep Ocean Blue
      accentColor: '#f59e0b', // Amber
      equippedComponents: {
        'hp-bow-heavy': 'mk45-naval-gun',
        'hp-vls-forward': 'vls-tomahawk',
        'hp-port-torp': 'mk48-torpedo',
        'hp-starboard-torp': 'mk48-torpedo',
        'hp-aft-vls': 'vls-tomahawk',
        'hp-aft-heavy': 'mk45-naval-gun',
        'hp-stern-defense': 'searam-launcher',
      },
    },
  },
  {
    name: 'Hyperion Railgun Battlecruiser',
    description: 'Capital warship boasting an experimental electromagnetic railgun firing hypervelocity Mach 7 kinetic penetrators.',
    config: {
      name: 'Hyperion Apex',
      baseModelId: 'battlecruiser-hyperion',
      primaryColor: '#1e1b4b', // Deep Indigo
      accentColor: '#60a5fa', // Electric Blue
      equippedComponents: {
        'hp-bow-railgun': 'em-railgun',
        'hp-port-missiles': 'harpoon-missile',
        'hp-starboard-missiles': 'harpoon-missile',
        'hp-mid-vls': 'vls-tomahawk',
        'hp-aft-ciws': 'phalanx-ciws',
        'hp-armor-bay': 'composite-armor',
      },
    },
  },
  {
    name: 'Vanguard Attack Submersible (SSN)',
    description: 'Low-silhouette surface submersible with acoustic homing Mk48 torpedo tubes and conning tower autocannon.',
    config: {
      name: 'Shadow Shark',
      baseModelId: 'sub-raider',
      primaryColor: '#090d16', // Dark Submarine Hull
      accentColor: '#10b981', // Sonar Emerald
      equippedComponents: {
        'hp-port-bow-torp': 'mk48-torpedo',
        'hp-star-bow-torp': 'mk48-torpedo',
        'hp-conning-gun': 'phalanx-ciws',
        'hp-missile-tube': 'vls-tomahawk',
        'hp-silent-drive': 'azipod-propulsor',
      },
    },
  },
  {
    name: 'Viper Fast Attack Craft (FAC)',
    description: 'Ultra-fast missile patrol boat built for high-speed hit-and-run ambushes and rapid evasion.',
    config: {
      name: 'Viper Strike',
      baseModelId: 'corvette-fast',
      primaryColor: '#27272a', // Zinc
      accentColor: '#f43f5e', // Rose Red
      equippedComponents: {
        'hp-bow-cannon': 'phalanx-ciws',
        'hp-port-torp': 'mk48-torpedo',
        'hp-star-torp': 'mk48-torpedo',
        'hp-aft-booster': 'gas-turbine',
      },
    },
  },
];

const MODERN_NPC_NAMES = [
  'Arleigh', 'Dauntless', 'Visakhapatnam', 'Kongo',
  'Seawolf', 'Trident', 'Poseidon', 'Defender',
  'Sentinel', 'Falcon', 'Hydra', 'Vanguard',
  'Phantom', 'Valiant', 'Invincible', 'Stormbringer',
  'Apex', 'Gorgon', 'Manticore', 'Kraken'
];

const MODERN_PALETTES = [
  { primary: '#1e293b', accent: '#38bdf8' }, // Slate & Sky
  { primary: '#0f172a', accent: '#f43f5e' }, // Dark & Crimson
  { primary: '#1e3a5f', accent: '#34d399' }, // Ocean & Emerald
  { primary: '#1e1b4b', accent: '#a855f7' }, // Indigo & Purple
  { primary: '#27272a', accent: '#facc15' }, // Zinc & Amber
  { primary: '#022c22', accent: '#2dd4bf' }, // Deep Teal & Cyan
  { primary: '#311042', accent: '#f472b6' }, // Violet & Pink
];

// Generates varied modern NPC warships that are diverse and balanced
export function generateNpcShipConfig(index: number, team: 'player' | 'enemy'): { model: BaseShipModel; config: CustomShipConfig } {
  // Cycle across modern warship models
  const modelIdx = (index + (team === 'enemy' ? 1 : 0)) % BASE_SHIPS.length;
  const model = BASE_SHIPS[modelIdx];

  const palette = MODERN_PALETTES[(index * 2 + (team === 'enemy' ? 3 : 0)) % MODERN_PALETTES.length];
  const name = `${team === 'player' ? 'Allied' : 'Hostile'} ${MODERN_NPC_NAMES[(index + (team === 'enemy' ? 7 : 0)) % MODERN_NPC_NAMES.length]}`;

  const equippedComponents: Record<string, string> = {};

  // Equip modern combat components based on hardpoint arcs
  model.hardpoints.forEach((hp, hpIdx) => {
    if (hp.allowedArc === 'bow') {
      const options = ['mk45-naval-gun', 'phalanx-ciws', 'mk48-torpedo', 'em-railgun'];
      equippedComponents[hp.id] = options[(index + hpIdx) % options.length];
    } else if (hp.allowedArc.startsWith('broadside')) {
      const options = ['harpoon-missile', 'mk48-torpedo', 'phalanx-ciws', 'composite-armor'];
      equippedComponents[hp.id] = options[(index + hpIdx) % options.length];
    } else if (hp.allowedArc === 'stern') {
      const options = ['gas-turbine', 'azipod-propulsor', 'searam-launcher', 'auto-damage-control'];
      equippedComponents[hp.id] = options[(index + hpIdx) % options.length];
    } else {
      // all arc (turret / VLS)
      const options = ['vls-tomahawk', 'phalanx-ciws', 'mk45-naval-gun', 'searam-launcher'];
      equippedComponents[hp.id] = options[(index + hpIdx) % options.length];
    }
  });

  return {
    model,
    config: {
      name,
      baseModelId: model.id,
      primaryColor: palette.primary,
      accentColor: palette.accent,
      equippedComponents,
    },
  };
}

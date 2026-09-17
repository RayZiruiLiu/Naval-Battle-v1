export type WeaponArc = 'all' | 'broadside-left' | 'broadside-right' | 'bow' | 'stern';

export type ComponentCategory =
  | 'cannon'
  | 'special-weapon'
  | 'defensive'
  | 'mobility'
  | 'support'
  | 'artillery'
  | 'missile'
  | 'electronic';

export interface ShipComponent {
  id: string;
  name: string;
  category: ComponentCategory;
  description: string;
  iconName: string;
  // Combat stats
  damage: number;          // Damage per shot/tick
  reloadTime: number;      // Seconds between shots
  range: number;           // Max firing range in pixels
  projectileSpeed: number; // Pixels per second
  projectileType: 'shell' | 'missile' | 'torpedo' | 'railgun' | 'flak' | 'cannonball' | 'mortar' | 'swivel' | 'fire' | 'none';
  spreadAngle?: number;    // In radians
  splashRadius?: number;   // Splash damage radius
  projectilesPerShot?: number;
  homing?: boolean;
  
  // Passive bonuses to ship
  bonusHp?: number;
  bonusSpeed?: number;
  bonusTurnRate?: number;
  damageReduction?: number; // e.g. 0.15 = 15% reduction
  repairRate?: number;     // HP repaired per sec when idle
  
  color: string;
}

export interface HardpointSlot {
  id: string;
  name: string;
  x: number; // -1 to 1 normalized offset relative to ship center (x = forward/stern or left/right)
  y: number; // -1 to 1 normalized offset relative to ship center
  allowedArc: WeaponArc;
  defaultComponentId?: string;
}

export interface BaseShipModel {
  id: string;
  name: string;
  type: string;
  hullClass: 'DDG' | 'FFG' | 'CGN' | 'SSN' | 'BBG' | 'FSG' | 'FAC';
  description: string;
  hullLength: number;
  hullWidth: number;
  baseHp: number;
  baseSpeed: number;
  baseTurnRate: number; // rad/s
  baseArmor: number;
  hardpoints: HardpointSlot[];
  svgHullPath: string;
  spriteStyle: {
    deckColor: string;
    hullColor: string;
    accentColor: string;
    details: string;
    stealthFacets?: boolean;
    hasHelipad?: boolean;
  };
}

export interface CustomShipConfig {
  name: string;
  baseModelId: string;
  primaryColor: string;
  accentColor: string;
  // Mapping hardpoint slot ID -> component ID
  equippedComponents: Record<string, string>;
}

export interface SavedShipProfile {
  id: string;
  name: string;
  savedAt: number;
  config: CustomShipConfig;
}

export interface ShipStats {
  maxHp: number;
  speed: number;
  turnRate: number;
  firepowerDps: number;
  effectiveRange: number;
  armorRating: number;
  componentCount: number;
}

export type Team = 'player' | 'enemy';

export interface Projectile {
  id: string;
  x: number;
  y: number;
  startX: number;
  startY: number;
  targetX?: number;
  targetY?: number;
  vx: number;
  vy: number;
  damage: number;
  splashRadius: number;
  type: 'shell' | 'missile' | 'torpedo' | 'railgun' | 'flak' | 'cannonball' | 'mortar' | 'swivel' | 'fire';
  team: Team;
  sourceShipId: string;
  life: number;
  maxLife: number;
  altitude?: number;
  color: string;
  homing?: boolean;
}

export interface ShipEntity {
  id: string;
  name: string;
  team: Team;
  isPlayer: boolean;
  model: BaseShipModel;
  config: CustomShipConfig;
  stats: ShipStats;
  
  // Physics & Transform
  x: number;
  y: number;
  angle: number; // in radians (0 = pointing right)
  vx: number;
  vy: number;
  speed: number;
  targetSpeedLevel: number; // -1 (reverse), 0 (stopped), 1 (standard/half), 2 (full flank speed)
  rudderAngle: number; // -1 (full port) to 1 (full starboard)
  
  // Combat state
  currentHp: number;
  maxHp: number;
  isSunk: boolean;
  sinkProgress: number; // 0 to 1
  idleTimer: number;    // seconds since last taken damage (for repair bays)
  fireTimer: number;    // seconds on fire
  
  // Weapon cooldowns mapped by hardpointId -> remaining cooldown in seconds
  cooldowns: Record<string, number>;
  
  // AI state for NPCs
  aiTargetId?: string;
  aiState?: 'patrol' | 'chase' | 'broadside' | 'flee';
  aiDecisionTimer?: number;
  aiFireTimer?: number;
  aiWaypoint?: { x: number; y: number };
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  color: string;
  type: 'water' | 'smoke' | 'fire' | 'spark' | 'wake' | 'wood' | 'plasma' | 'exhaust';
}

export interface WaterRipple {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  alpha: number;
}

export interface BattleIsland {
  x: number;
  y: number;
  radius: number;
  points: { x: number; y: number }[];
  foliage: { x: number; y: number; radius: number; color: string; type?: 'tree' | 'ice' | 'bunker' | 'buoy' }[];
  style?: 'sand' | 'ice' | 'rock' | 'harbor';
}

export interface BattleMapConfig {
  id: string;
  name: string;
  theme: string;
  description: string;
  waterColors: {
    deep: string;
    mid: string;
    surface: string;
    wave: string;
    boundary: string;
  };
  islandStyle: 'sand' | 'ice' | 'rock' | 'harbor';
  obstacles: BattleIsland[];
  ambientWeather?: 'clear' | 'snow' | 'storm' | 'harbor';
}

export interface BattleSettings {
  shipsPerTeam: number; // 1 to 5
  autoFire: boolean;
  soundEnabled: boolean;
  gameSpeed: number; // 1, 1.5, 2
  selectedMapId: string;
}

export interface SavedShipProfile {
  id: string;
  name: string;
  savedAt: number;
  config: CustomShipConfig;
  notes?: string;
}

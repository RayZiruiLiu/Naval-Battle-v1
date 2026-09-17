import {
  BattleIsland,
  BattleMapConfig,
  BattleSettings,
  CustomShipConfig,
  Particle,
  Projectile,
  ShipEntity,
  Team,
  WaterRipple
} from '../types/ship';
import { BASE_SHIPS, SHIP_MODEL_MAP } from '../data/shipModels';
import { COMPONENT_MAP } from '../data/components';
import { BATTLE_MAPS, BATTLE_MAP_MAP } from '../data/battleMaps';
import { calculateShipStats, generateNpcShipConfig } from '../utils/shipStats';
import { sounds } from '../audio/soundEffects';

export interface BattleState {
  arenaWidth: number;
  arenaHeight: number;
  ships: ShipEntity[];
  projectiles: Projectile[];
  particles: Particle[];
  ripples: WaterRipple[];
  islands: BattleIsland[];
  mapConfig: BattleMapConfig;
  time: number;
  gameOver: boolean;
  winner: Team | null;
  camera: { x: number; y: number; zoom: number };
  mouseWorldPos: { x: number; y: number };
  playerShipId: string;
  combatLog: { id: string; text: string; time: number; team: Team }[];
  stats: {
    damageDealt: number;
    shipsSunk: number;
    shotsFired: number;
    shotsHit: number;
  };
}

export class BattleEngine {
  public state: BattleState;
  private settings: BattleSettings;
  private nextId: number = 1;
  private animationFrameId: number | null = null;
  private lastTimestamp: number = 0;
  private onStateUpdate?: (state: BattleState) => void;

  constructor(
    playerConfig: CustomShipConfig,
    settings: BattleSettings,
    onStateUpdate?: (state: BattleState) => void
  ) {
    this.settings = settings;
    this.onStateUpdate = onStateUpdate;
    this.state = this.initBattle(playerConfig, settings.shipsPerTeam);
  }

  private initBattle(playerConfig: CustomShipConfig, shipsPerTeam: number): BattleState {
    const arenaWidth = 2600;
    const arenaHeight = 2000;

    // Retrieve active battle map
    const mapConfig = BATTLE_MAP_MAP.get(this.settings.selectedMapId) || BATTLE_MAPS[0];
    const islands: BattleIsland[] = mapConfig.obstacles;

    const ships: ShipEntity[] = [];

    // 1. Create Player Ship (Blue Team Flagship)
    const playerModel = SHIP_MODEL_MAP.get(playerConfig.baseModelId) || BASE_SHIPS[0];
    const playerStats = calculateShipStats(playerModel, playerConfig);
    const playerShip: ShipEntity = {
      id: 'player-flagship',
      name: playerConfig.name || 'Flagship Vanguard',
      team: 'player',
      isPlayer: true,
      model: playerModel,
      config: playerConfig,
      stats: playerStats,
      x: 420,
      y: arenaHeight * 0.5,
      angle: 0, // facing right toward center
      vx: 0,
      vy: 0,
      speed: 0,
      targetSpeedLevel: 0,
      rudderAngle: 0,
      currentHp: playerStats.maxHp,
      maxHp: playerStats.maxHp,
      isSunk: false,
      sinkProgress: 0,
      idleTimer: 0,
      fireTimer: 0,
      cooldowns: {},
    };
    ships.push(playerShip);

    // 2. Create Allied NPC ships to match shipsPerTeam
    for (let i = 1; i < shipsPerTeam; i++) {
      const { model, config } = generateNpcShipConfig(i, 'player');
      const stats = calculateShipStats(model, config);
      const spacingY = (i % 2 === 1 ? -1 : 1) * Math.ceil(i / 2) * 150;
      const npcShip: ShipEntity = {
        id: `allied-npc-${i}`,
        name: config.name,
        team: 'player',
        isPlayer: false,
        model,
        config,
        stats,
        x: 360 - Math.floor(i / 2) * 70,
        y: arenaHeight * 0.5 + spacingY,
        angle: 0,
        vx: 0,
        vy: 0,
        speed: 0,
        targetSpeedLevel: 2, // Cruise into center combat zone
        rudderAngle: 0,
        currentHp: stats.maxHp,
        maxHp: stats.maxHp,
        isSunk: false,
        sinkProgress: 0,
        idleTimer: 0,
        fireTimer: 0,
        cooldowns: {},
        aiState: 'chase',
        aiDecisionTimer: Math.random() * 2,
      };
      ships.push(npcShip);
    }

    // 3. Create Hostile Enemy NPC ships (exactly shipsPerTeam)
    for (let i = 0; i < shipsPerTeam; i++) {
      const { model, config } = generateNpcShipConfig(i, 'enemy');
      const stats = calculateShipStats(model, config);
      const spacingY = (i === 0 ? 0 : (i % 2 === 1 ? -1 : 1) * Math.ceil(i / 2) * 150);
      const enemyShip: ShipEntity = {
        id: `enemy-npc-${i}`,
        name: config.name,
        team: 'enemy',
        isPlayer: false,
        model,
        config,
        stats,
        x: arenaWidth - 420 + (i === 0 ? 0 : Math.floor(i / 2) * 70),
        y: arenaHeight * 0.5 + spacingY,
        angle: Math.PI, // facing left toward player fleet
        vx: 0,
        vy: 0,
        speed: 0,
        targetSpeedLevel: 2, // Cruise into center combat zone
        rudderAngle: 0,
        currentHp: stats.maxHp,
        maxHp: stats.maxHp,
        isSunk: false,
        sinkProgress: 0,
        idleTimer: 0,
        fireTimer: 0,
        cooldowns: {},
        aiState: 'chase',
        aiDecisionTimer: Math.random() * 2,
      };
      ships.push(enemyShip);
    }

    return {
      arenaWidth,
      arenaHeight,
      ships,
      projectiles: [],
      particles: [],
      ripples: [],
      islands,
      mapConfig,
      time: 0,
      gameOver: false,
      winner: null,
      camera: { x: playerShip.x, y: playerShip.y, zoom: 0.95 },
      mouseWorldPos: { x: arenaWidth * 0.5, y: arenaHeight * 0.5 },
      playerShipId: playerShip.id,
      combatLog: [
        {
          id: 'log-0',
          text: `Fleet deployed in ${mapConfig.name}! All systems armed and operational.`,
          time: 0,
          team: 'player',
        },
      ],
      stats: {
        damageDealt: 0,
        shipsSunk: 0,
        shotsFired: 0,
        shotsHit: 0,
      },
    };
  }

  public updateSettings(newSettings: Partial<BattleSettings>) {
    this.settings = { ...this.settings, ...newSettings };
    sounds.enabled = this.settings.soundEnabled;

    // If map changed, update obstacles and map config
    if (newSettings.selectedMapId) {
      const map = BATTLE_MAP_MAP.get(newSettings.selectedMapId);
      if (map) {
        this.state.mapConfig = map;
        this.state.islands = map.obstacles;
      }
    }
  }

  public setMouseWorldPos(worldX: number, worldY: number) {
    if (!isNaN(worldX) && !isNaN(worldY)) {
      this.state.mouseWorldPos = { x: worldX, y: worldY };
    }
  }

  public adjustPlayerThrottle(delta: number) {
    const player = this.getPlayerShip();
    if (!player || player.isSunk) return;
    const current = player.targetSpeedLevel;
    player.targetSpeedLevel = Math.max(-1, Math.min(2, current + delta));
  }

  public setPlayerThrottle(level: number) {
    const player = this.getPlayerShip();
    if (!player || player.isSunk) return;
    player.targetSpeedLevel = Math.max(-1, Math.min(2, Math.round(level)));
  }

  public setPlayerThrottleDirect(level: number) {
    this.setPlayerThrottle(level);
  }

  public setPlayerRudder(angle: number) {
    const player = this.getPlayerShip();
    if (!player || player.isSunk) return;
    player.rudderAngle = Math.max(-1, Math.min(1, angle));
  }

  public firePlayerWeapons(customTargetX?: number, customTargetY?: number): boolean {
    const player = this.getPlayerShip();
    if (!player || player.isSunk) return false;
    const targetX = customTargetX !== undefined && !isNaN(customTargetX) ? customTargetX : this.state.mouseWorldPos.x;
    const targetY = customTargetY !== undefined && !isNaN(customTargetY) ? customTargetY : this.state.mouseWorldPos.y;
    if (isNaN(targetX) || isNaN(targetY)) return false;
    return this.fireShipWeapons(player, targetX, targetY);
  }

  public getPlayerShip(): ShipEntity | undefined {
    return this.state.ships.find(s => s.id === this.state.playerShipId);
  }

  public start() {
    this.lastTimestamp = performance.now();
    const loop = (timestamp: number) => {
      const dtMs = timestamp - this.lastTimestamp;
      this.lastTimestamp = timestamp;
      const dt = Math.min(0.08, dtMs / 1000) * (this.settings.gameSpeed || 1);

      this.update(dt);
      if (this.onStateUpdate) {
        this.onStateUpdate(this.state);
      }

      this.animationFrameId = requestAnimationFrame(loop);
    };

    this.animationFrameId = requestAnimationFrame(loop);
  }

  public stop() {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  public update(dt: number) {
    this.state.time += dt;

    // 1. Update Ship Physics, Cooldowns, Repair Systems
    for (const ship of this.state.ships) {
      this.updateShip(ship, dt);
    }

    // 2. Update NPCs AI
    for (const ship of this.state.ships) {
      if (!ship.isPlayer && !ship.isSunk) {
        this.updateNpcAi(ship, dt);
      }
    }

    // 3. Player Auto-fire if enabled
    if (this.settings.autoFire) {
      const player = this.getPlayerShip();
      if (player && !player.isSunk) {
        const enemies = this.state.ships.filter(s => s.team === 'enemy' && !s.isSunk);
        let nearest: ShipEntity | null = null;
        let minDist = Infinity;
        for (const e of enemies) {
          const d = Math.hypot(e.x - player.x, e.y - player.y);
          if (d < minDist && d < (player.stats.effectiveRange || 780)) {
            minDist = d;
            nearest = e;
          }
        }
        if (nearest) {
          this.fireShipWeapons(player, nearest.x, nearest.y);
        }
      }
    }

    // 4. Update Projectiles
    this.updateProjectiles(dt);

    // 5. Update Particles & Ripples
    this.updateParticles(dt);

    // 6. Camera follows player
    const player = this.getPlayerShip();
    if (player) {
      const targetCamX = player.x;
      const targetCamY = player.y;
      this.state.camera.x += (targetCamX - this.state.camera.x) * 0.1;
      this.state.camera.y += (targetCamY - this.state.camera.y) * 0.1;
    }

    // 7. Check Game Over conditions
    if (!this.state.gameOver) {
      const livingPlayers = this.state.ships.filter(s => s.team === 'player' && !s.isSunk);
      const livingEnemies = this.state.ships.filter(s => s.team === 'enemy' && !s.isSunk);

      if (livingPlayers.length === 0) {
        this.state.gameOver = true;
        this.state.winner = 'enemy';
        sounds.playDefeat();
        this.addCombatLog('Fleet defeated! All allied warships have been lost.', 'enemy');
      } else if (livingEnemies.length === 0) {
        this.state.gameOver = true;
        this.state.winner = 'player';
        sounds.playVictory();
        this.addCombatLog('Victory! Hostile naval force neutralized completely!', 'player');
      }
    }
  }

  private updateShip(ship: ShipEntity, dt: number) {
    if (ship.isSunk) {
      ship.sinkProgress = Math.min(1, ship.sinkProgress + dt * 0.3);
      if (Math.random() < 0.25) {
        this.addParticle({
          x: ship.x + (Math.random() - 0.5) * 30,
          y: ship.y + (Math.random() - 0.5) * 30,
          vx: (Math.random() - 0.5) * 15,
          vy: -20 - Math.random() * 20,
          life: 0.8,
          maxLife: 0.8,
          size: 4 + Math.random() * 6,
          color: '#64748b',
          type: 'smoke',
        });
      }
      return;
    }

    // Cooldown timers
    for (const key of Object.keys(ship.cooldowns)) {
      if (ship.cooldowns[key] > 0) {
        ship.cooldowns[key] = Math.max(0, ship.cooldowns[key] - dt);
      }
    }

    // Idle timer and automatic damage control repairs
    ship.idleTimer += dt;
    if (ship.idleTimer > 4.0 && ship.currentHp < ship.maxHp) {
      let repairRate = 4; // base passive crew damage control
      for (const hp of ship.model.hardpoints) {
        const compId = ship.config.equippedComponents[hp.id];
        const comp = compId ? COMPONENT_MAP.get(compId) : null;
        if (comp?.repairRate) {
          repairRate += comp.repairRate;
        }
      }
      ship.currentHp = Math.min(ship.maxHp, ship.currentHp + repairRate * dt);
    }

    // Fire damage over time
    if (ship.fireTimer > 0) {
      ship.fireTimer -= dt;
      ship.currentHp = Math.max(0, ship.currentHp - 8 * dt);
      if (Math.random() < 0.3) {
        this.addParticle({
          x: ship.x + (Math.random() - 0.5) * 20,
          y: ship.y + (Math.random() - 0.5) * 20,
          vx: (Math.random() - 0.5) * 10,
          vy: -30,
          life: 0.4,
          maxLife: 0.4,
          size: 5,
          color: '#f97316',
          type: 'fire',
        });
      }
      if (ship.currentHp <= 0) {
        this.sinkShip(ship);
        return;
      }
    }

    // Physics: Rudder Steering
    const turnRate = ship.stats.turnRate;
    const speedRatio = Math.max(0.25, Math.abs(ship.speed) / Math.max(1, ship.stats.speed));
    ship.angle += ship.rudderAngle * turnRate * speedRatio * dt;
    ship.angle = this.normalizeAngle(ship.angle);

    // Physics: Throttle Acceleration
    let targetSpeed = 0;
    if (ship.targetSpeedLevel === 2) targetSpeed = ship.stats.speed;
    else if (ship.targetSpeedLevel === 1) targetSpeed = ship.stats.speed * 0.55;
    else if (ship.targetSpeedLevel === -1) targetSpeed = -ship.stats.speed * 0.35;

    const accel = 35;
    const decel = 25;
    if (ship.speed < targetSpeed) {
      ship.speed = Math.min(targetSpeed, ship.speed + accel * dt);
    } else if (ship.speed > targetSpeed) {
      ship.speed = Math.max(targetSpeed, ship.speed - decel * dt);
    }

    // Forward velocity components
    ship.vx = Math.cos(ship.angle) * ship.speed;
    ship.vy = Math.sin(ship.angle) * ship.speed;

    const nextX = ship.x + ship.vx * dt;
    const nextY = ship.y + ship.vy * dt;

    // Island collision check
    const shipRadius = Math.max(20, ship.model.hullLength * 0.4);
    let hitIsland = false;

    for (const island of this.state.islands) {
      const dist = Math.hypot(nextX - island.x, nextY - island.y);
      if (dist < island.radius + shipRadius) {
        hitIsland = true;
        const pushAngle = Math.atan2(ship.y - island.y, ship.x - island.x);
        ship.x = island.x + Math.cos(pushAngle) * (island.radius + shipRadius + 1);
        ship.y = island.y + Math.sin(pushAngle) * (island.radius + shipRadius + 1);
        ship.speed *= 0.3;
        sounds.playHit(false);
        break;
      }
    }

    // Boundary bounce & inward deflection logic
    // Prevents ships from scraping along or getting stuck on edge
    if (!hitIsland) {
      const padding = 85;
      let bounced = false;

      if (nextX < padding) {
        ship.x = padding;
        ship.vx = Math.abs(ship.vx);
        if (Math.cos(ship.angle) < 0) {
          // If heading into left wall, turn inward towards center
          ship.angle = Math.atan2(Math.sin(ship.angle), 0.5);
          ship.rudderAngle = 0;
        }
        bounced = true;
      } else if (nextX > this.state.arenaWidth - padding) {
        ship.x = this.state.arenaWidth - padding;
        ship.vx = -Math.abs(ship.vx);
        if (Math.cos(ship.angle) > 0) {
          // If heading into right wall, turn inward towards center
          ship.angle = Math.atan2(Math.sin(ship.angle), -0.5);
          ship.rudderAngle = 0;
        }
        bounced = true;
      } else {
        ship.x = nextX;
      }

      if (nextY < padding) {
        ship.y = padding;
        ship.vy = Math.abs(ship.vy);
        if (Math.sin(ship.angle) < 0) {
          // If heading into top wall, turn downward towards center
          ship.angle = Math.atan2(0.5, Math.cos(ship.angle));
          ship.rudderAngle = 0;
        }
        bounced = true;
      } else if (nextY > this.state.arenaHeight - padding) {
        ship.y = this.state.arenaHeight - padding;
        ship.vy = -Math.abs(ship.vy);
        if (Math.sin(ship.angle) > 0) {
          // If heading into bottom wall, turn upward towards center
          ship.angle = Math.atan2(-0.5, Math.cos(ship.angle));
          ship.rudderAngle = 0;
        }
        bounced = true;
      } else {
        ship.y = nextY;
      }

      if (bounced) {
        ship.speed = Math.max(30, Math.abs(ship.speed) * 0.7);
      }
    }

    // Wake trail effect when moving through water
    if (Math.abs(ship.speed) > 25 && Math.random() < 0.45) {
      const sternOffset = -ship.model.hullLength * 0.5;
      const sternX = ship.x + Math.cos(ship.angle) * sternOffset;
      const sternY = ship.y + Math.sin(ship.angle) * sternOffset;
      this.addParticle({
        x: sternX + (Math.random() - 0.5) * 10,
        y: sternY + (Math.random() - 0.5) * 10,
        vx: -Math.cos(ship.angle) * 10 + (Math.random() - 0.5) * 8,
        vy: -Math.sin(ship.angle) * 10 + (Math.random() - 0.5) * 8,
        life: 0.9,
        maxLife: 0.9,
        size: 5 + Math.random() * 6,
        color: '#e0f2fe',
        type: 'wake',
      });
    }
  }

  private updateNpcAi(ship: ShipEntity, dt: number) {
    ship.aiDecisionTimer = (ship.aiDecisionTimer || 0) - dt;

    // Find nearest hostile target
    const targetTeam = ship.team === 'player' ? 'enemy' : 'player';
    const hostiles = this.state.ships.filter(s => s.team === targetTeam && !s.isSunk);

    if (hostiles.length === 0) {
      // No targets left, return to gentle center cruise
      const centerX = this.state.arenaWidth * 0.5;
      const centerY = this.state.arenaHeight * 0.5;
      const toCenter = Math.atan2(centerY - ship.y, centerX - ship.x);
      const diff = this.normalizeAngle(toCenter - ship.angle);
      ship.rudderAngle = Math.max(-0.5, Math.min(0.5, diff));
      ship.targetSpeedLevel = 1;
      return;
    }

    let target: ShipEntity | null = null;
    let minDist = Infinity;
    for (const h of hostiles) {
      const d = Math.hypot(h.x - ship.x, h.y - ship.y);
      if (d < minDist) {
        minDist = d;
        target = h;
      }
    }

    if (!target) return;

    const centerX = this.state.arenaWidth * 0.5;
    const centerY = this.state.arenaHeight * 0.5;

    // 1. ARENA BOUNDARY REPULSION (TOP PRIORITY)
    // Proactively steer away before ever getting near the edges
    const boundarySafetyMargin = 320;
    let avoidX = 0;
    let avoidY = 0;

    if (ship.x < boundarySafetyMargin) {
      avoidX += (boundarySafetyMargin - ship.x) / boundarySafetyMargin;
    } else if (ship.x > this.state.arenaWidth - boundarySafetyMargin) {
      avoidX -= (ship.x - (this.state.arenaWidth - boundarySafetyMargin)) / boundarySafetyMargin;
    }

    if (ship.y < boundarySafetyMargin) {
      avoidY += (boundarySafetyMargin - ship.y) / boundarySafetyMargin;
    } else if (ship.y > this.state.arenaHeight - boundarySafetyMargin) {
      avoidY -= (ship.y - (this.state.arenaHeight - boundarySafetyMargin)) / boundarySafetyMargin;
    }

    // Look-ahead probe directly forward
    const forwardProbeDist = 240;
    const probeX = ship.x + Math.cos(ship.angle) * forwardProbeDist;
    const probeY = ship.y + Math.sin(ship.angle) * forwardProbeDist;

    if (probeX < 140) avoidX += 1.8;
    else if (probeX > this.state.arenaWidth - 140) avoidX -= 1.8;
    if (probeY < 140) avoidY += 1.8;
    else if (probeY > this.state.arenaHeight - 140) avoidY -= 1.8;

    const avoidMag = Math.hypot(avoidX, avoidY);
    if (avoidMag > 0.15) {
      const safeAngle = Math.atan2(avoidY, avoidX);
      const diff = this.normalizeAngle(safeAngle - ship.angle);

      // Forceful steering towards open center waters
      ship.rudderAngle = diff > 0 ? 1 : -1;
      ship.targetSpeedLevel = 2; // Keep engine thrust to make the turn clean
      return;
    }

    // 2. ISLAND OBSTACLE AVOIDANCE
    const islandLookAhead = 190;
    const islandProbeX = ship.x + Math.cos(ship.angle) * islandLookAhead;
    const islandProbeY = ship.y + Math.sin(ship.angle) * islandLookAhead;
    let obstacleAvoidAngle: number | null = null;

    for (const island of this.state.islands) {
      const dist = Math.hypot(islandProbeX - island.x, islandProbeY - island.y);
      if (dist < island.radius + 85) {
        const toIslandAngle = Math.atan2(island.y - ship.y, island.x - ship.x);
        const diff = this.normalizeAngle(toIslandAngle - ship.angle);
        obstacleAvoidAngle = diff > 0 ? -1 : 1;
        break;
      }
    }

    if (obstacleAvoidAngle !== null) {
      ship.rudderAngle = obstacleAvoidAngle;
      ship.targetSpeedLevel = 1;
      return;
    }

    // 3. COMBAT MANEUVERING & TACTICAL ENGAGEMENT
    const dx = target.x - ship.x;
    const dy = target.y - ship.y;
    const angleToTarget = Math.atan2(dy, dx);
    const angleDiff = this.normalizeAngle(angleToTarget - ship.angle);
    const hasBroadsides = ship.model.hardpoints.some(hp => hp.allowedArc.startsWith('broadside'));
    const idealRange = hasBroadsides ? 400 : 300;

    if (minDist > idealRange + 140) {
      // Approach hostile ship
      ship.targetSpeedLevel = 2;
      ship.rudderAngle = Math.max(-1, Math.min(1, angleDiff * 2));
    } else if (minDist < idealRange - 90) {
      // Too close: turn away or maintain flanking distance
      ship.targetSpeedLevel = 1;
      ship.rudderAngle = angleDiff > 0 ? -1 : 1;
    } else {
      // In optimal combat bracket
      if (hasBroadsides) {
        const portAngle = this.normalizeAngle(ship.angle - Math.PI / 2);
        const starboardAngle = this.normalizeAngle(ship.angle + Math.PI / 2);

        // Check which broadside direction heads towards arena center rather than edges
        const portProbeDist = Math.hypot(
          ship.x + Math.cos(portAngle) * 150 - centerX,
          ship.y + Math.sin(portAngle) * 150 - centerY
        );
        const starProbeDist = Math.hypot(
          ship.x + Math.cos(starboardAngle) * 150 - centerX,
          ship.y + Math.sin(starboardAngle) * 150 - centerY
        );

        const diffPort = Math.abs(this.normalizeAngle(angleToTarget - portAngle));
        const diffStar = Math.abs(this.normalizeAngle(angleToTarget - starboardAngle));

        const scorePort = diffPort + (portProbeDist > starProbeDist ? 0.7 : 0);
        const scoreStar = diffStar + (starProbeDist > portProbeDist ? 0.7 : 0);

        const chosenBroadside = scorePort < scoreStar ? portAngle : starboardAngle;
        const broadsideDiff = this.normalizeAngle(angleToTarget - chosenBroadside);

        ship.rudderAngle = Math.max(-0.85, Math.min(0.85, broadsideDiff * 2));
        ship.targetSpeedLevel = 1;
      } else {
        // Forward bow gun focus
        ship.rudderAngle = Math.max(-1, Math.min(1, angleDiff * 2));
        ship.targetSpeedLevel = minDist > 220 ? 1 : 0;
      }
    }

    // Deliberate, tactical NPC firing cadence
    ship.aiFireTimer = (ship.aiFireTimer || 0) - dt;
    if (ship.aiFireTimer <= 0) {
      const jitterX = (Math.random() - 0.5) * 45;
      const jitterY = (Math.random() - 0.5) * 45;
      const fired = this.fireShipWeapons(ship, target.x + jitterX, target.y + jitterY);
      if (fired) {
        ship.aiFireTimer = 2.2 + Math.random() * 1.2;
      }
    }
  }

  public fireShipWeapons(ship: ShipEntity, targetX: number, targetY: number): boolean {
    if (ship.isSunk) return false;
    if (isNaN(targetX) || isNaN(targetY)) return false;

    let firedAny = false;

    for (const hardpoint of ship.model.hardpoints) {
      const compId = ship.config.equippedComponents[hardpoint.id];
      if (!compId) continue;

      const comp = COMPONENT_MAP.get(compId);
      if (!comp || comp.damage <= 0 || comp.reloadTime <= 0) continue;

      const remainingCd = ship.cooldowns[hardpoint.id] || 0;
      if (remainingCd > 0) continue;

      const localForward = hardpoint.x * (ship.model.hullLength * 0.5);
      const localSide = hardpoint.y * (ship.model.hullWidth * 0.5);

      const cos = Math.cos(ship.angle);
      const sin = Math.sin(ship.angle);
      const hpWorldX = ship.x + localForward * cos - localSide * sin;
      const hpWorldY = ship.y + localForward * sin + localSide * cos;

      const rawDist = Math.hypot(targetX - hpWorldX, targetY - hpWorldY);
      if (rawDist < 0.1) continue;

      const angleToTarget = Math.atan2(targetY - hpWorldY, targetX - hpWorldX);
      const relAngle = this.normalizeAngle(angleToTarget - ship.angle);

      let inArc = false;
      if (hardpoint.allowedArc === 'all') {
        inArc = true;
      } else if (hardpoint.allowedArc === 'bow') {
        inArc = Math.abs(relAngle) <= Math.PI * 0.40;
      } else if (hardpoint.allowedArc === 'stern') {
        inArc = Math.abs(relAngle) >= Math.PI * 0.60;
      } else if (hardpoint.allowedArc === 'broadside-left') {
        inArc = relAngle < -Math.PI * 0.08 && relAngle > -Math.PI * 0.92;
      } else if (hardpoint.allowedArc === 'broadside-right') {
        inArc = relAngle > Math.PI * 0.08 && relAngle < Math.PI * 0.92;
      }

      if (!inArc) continue;

      // When targeting beyond component maximum range, fire along that line of sight up to max range
      const effectiveDist = Math.min(rawDist, comp.range);
      const endTargetX = hpWorldX + Math.cos(angleToTarget) * effectiveDist;
      const endTargetY = hpWorldY + Math.sin(angleToTarget) * effectiveDist;

      // Weapon fired! Reset cooldown
      ship.cooldowns[hardpoint.id] = comp.reloadTime;
      firedAny = true;

      const count = comp.projectilesPerShot || 1;
      for (let i = 0; i < count; i++) {
        const spread = (Math.random() - 0.5) * (comp.spreadAngle || 0.05);
        const fireAngle = angleToTarget + spread;
        const vx = Math.cos(fireAngle) * comp.projectileSpeed;
        const vy = Math.sin(fireAngle) * comp.projectileSpeed;

        const projLife = effectiveDist / comp.projectileSpeed;

        this.state.projectiles.push({
          id: `proj-${this.nextId++}`,
          x: hpWorldX,
          y: hpWorldY,
          startX: hpWorldX,
          startY: hpWorldY,
          targetX: endTargetX,
          targetY: endTargetY,
          vx,
          vy,
          damage: comp.damage,
          splashRadius: comp.splashRadius || 0,
          type: comp.projectileType as Projectile['type'],
          team: ship.team,
          sourceShipId: ship.id,
          life: 0,
          maxLife: Math.max(0.2, projLife),
          color: comp.color,
        });

        if (ship.isPlayer) {
          this.state.stats.shotsFired++;
        }
      }

      // Muzzle flash particle effect
      this.addParticle({
        x: hpWorldX,
        y: hpWorldY,
        vx: Math.cos(angleToTarget) * 40 + (Math.random() - 0.5) * 15,
        vy: Math.sin(angleToTarget) * 40 + (Math.random() - 0.5) * 15,
        life: 0.25,
        maxLife: 0.25,
        size: 6 + Math.random() * 4,
        color: comp.projectileType === 'railgun' ? '#93c5fd' : '#fdba74',
        type: 'spark',
      });

      // Sound dispatch
      if (comp.projectileType === 'railgun') sounds.playCannonShot('railgun');
      else if (comp.projectileType === 'missile') sounds.playCannonShot('missile');
      else if (comp.projectileType === 'swivel' || comp.projectileType === 'flak') sounds.playCannonShot('swivel');
      else if (comp.projectileType === 'torpedo') sounds.playCannonShot('torpedo');
      else sounds.playCannonShot('heavy');
    }

    return firedAny;
  }

  private updateProjectiles(dt: number) {
    for (let i = this.state.projectiles.length - 1; i >= 0; i--) {
      const p = this.state.projectiles[i];
      p.life += dt;

      p.x += p.vx * dt;
      p.y += p.vy * dt;

      // Missile rocket exhaust trail
      if (p.type === 'missile' && Math.random() < 0.7) {
        this.addParticle({
          x: p.x - p.vx * 0.02,
          y: p.y - p.vy * 0.02,
          vx: -p.vx * 0.1 + (Math.random() - 0.5) * 20,
          vy: -p.vy * 0.1 + (Math.random() - 0.5) * 20,
          life: 0.35,
          maxLife: 0.35,
          size: 4 + Math.random() * 4,
          color: '#f97316',
          type: 'smoke',
        });
      }

      // Railgun plasma discharge trail
      if (p.type === 'railgun') {
        this.addParticle({
          x: p.x,
          y: p.y,
          vx: (Math.random() - 0.5) * 25,
          vy: (Math.random() - 0.5) * 25,
          life: 0.25,
          maxLife: 0.25,
          size: 3,
          color: '#60a5fa',
          type: 'plasma',
        });
      }

      // Torpedo water wake
      if (p.type === 'torpedo' && Math.random() < 0.6) {
        this.addParticle({
          x: p.x,
          y: p.y,
          vx: -p.vx * 0.1,
          vy: -p.vy * 0.1,
          life: 0.45,
          maxLife: 0.45,
          size: 3,
          color: '#ffffff',
          type: 'wake',
        });
      }

      // Check collision with ships
      let collided = false;
      for (const ship of this.state.ships) {
        if (ship.team === p.team || ship.isSunk) continue;

        const hitRadius = Math.max(22, ship.model.hullLength * 0.45);
        const dist = Math.hypot(ship.x - p.x, ship.y - p.y);

        if (dist < hitRadius || (p.splashRadius > 0 && p.life >= p.maxLife && dist < p.splashRadius + hitRadius)) {
          collided = true;
          this.applyHit(ship, p);
          break;
        }
      }

      // Check collision with islands
      if (!collided) {
        for (const island of this.state.islands) {
          const dist = Math.hypot(p.x - island.x, p.y - island.y);
          if (dist < island.radius) {
            collided = true;
            this.addParticle({
              x: p.x,
              y: p.y,
              vx: (Math.random() - 0.5) * 35,
              vy: (Math.random() - 0.5) * 35,
              life: 0.5,
              maxLife: 0.5,
              size: 6,
              color: '#64748b',
              type: 'spark',
            });
            sounds.playWaterSplash();
            break;
          }
        }
      }

      // Expired without hit or exploded
      if (p.life >= p.maxLife || collided) {
        if (!collided) {
          this.state.ripples.push({
            x: p.x,
            y: p.y,
            radius: 4,
            maxRadius: 30,
            alpha: 0.8,
          });
          sounds.playWaterSplash();
        }
        this.state.projectiles.splice(i, 1);
      }
    }
  }

  private applyHit(ship: ShipEntity, projectile: Projectile) {
    const reduction = Math.min(0.65, ship.stats.armorRating / 100);
    const finalDamage = Math.round(projectile.damage * (1 - reduction));

    ship.currentHp = Math.max(0, ship.currentHp - finalDamage);
    ship.idleTimer = 0; // reset repair countdown

    if (projectile.sourceShipId === this.state.playerShipId) {
      this.state.stats.damageDealt += finalDamage;
      this.state.stats.shotsHit++;
    }

    const fatal = ship.currentHp <= 0;
    sounds.playHit(fatal);

    const debrisCount = fatal ? 18 : 8;
    for (let i = 0; i < debrisCount; i++) {
      this.addParticle({
        x: projectile.x,
        y: projectile.y,
        vx: (Math.random() - 0.5) * 140,
        vy: (Math.random() - 0.5) * 140,
        life: 0.6,
        maxLife: 0.6,
        size: 3 + Math.random() * 5,
        color: Math.random() < 0.6 ? '#475569' : '#f97316',
        type: 'spark',
      });
    }

    this.state.ripples.push({
      x: projectile.x,
      y: projectile.y,
      radius: 6,
      maxRadius: 45,
      alpha: 0.9,
    });

    if (fatal) {
      this.sinkShip(ship, projectile.sourceShipId);
    }
  }

  private sinkShip(ship: ShipEntity, killerId?: string) {
    if (ship.isSunk) return;
    ship.isSunk = true;
    ship.speed = 0;
    ship.targetSpeedLevel = 0;

    const killer = this.state.ships.find(s => s.id === killerId);
    const killerName = killer ? killer.name : 'Concentrated Fire';

    if (killer?.isPlayer) {
      this.state.stats.shipsSunk++;
    }

    this.addCombatLog(
      `${ship.name} (${ship.team === 'player' ? 'Allied' : 'Hostile'}) was destroyed by ${killerName}!`,
      ship.team === 'player' ? 'enemy' : 'player'
    );

    this.state.ripples.push({
      x: ship.x,
      y: ship.y,
      radius: 15,
      maxRadius: 90,
      alpha: 1.0,
    });
  }

  private updateParticles(dt: number) {
    for (let i = this.state.particles.length - 1; i >= 0; i--) {
      const part = this.state.particles[i];
      part.life -= dt;
      part.x += part.vx * dt;
      part.y += part.vy * dt;

      if (part.life <= 0) {
        this.state.particles.splice(i, 1);
      }
    }

    for (let i = this.state.ripples.length - 1; i >= 0; i--) {
      const r = this.state.ripples[i];
      r.radius += 25 * dt;
      r.alpha -= 0.6 * dt;

      if (r.alpha <= 0 || r.radius >= r.maxRadius) {
        this.state.ripples.splice(i, 1);
      }
    }
  }

  public addParticle(particle: Particle) {
    if (this.state.particles.length > 250) {
      this.state.particles.shift();
    }
    this.state.particles.push(particle);
  }

  public addCombatLog(text: string, team: Team) {
    this.state.combatLog.unshift({
      id: `log-${this.nextId++}`,
      text,
      time: Math.round(this.state.time),
      team,
    });
    if (this.state.combatLog.length > 15) {
      this.state.combatLog.pop();
    }
  }

  private normalizeAngle(angle: number): number {
    while (angle > Math.PI) angle -= Math.PI * 2;
    while (angle < -Math.PI) angle += Math.PI * 2;
    return angle;
  }
}

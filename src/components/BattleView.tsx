import React, { useEffect, useRef, useState } from 'react';
import { BattleSettings, CustomShipConfig, ShipEntity, Team } from '../types/ship';
import { BattleEngine, BattleState } from '../game/battleEngine';
import { renderBattle } from '../game/battleRenderer';
import { COMPONENT_MAP } from '../data/components';
import {
  Anchor,
  ArrowLeft,
  Crosshair,
  Gauge,
  HelpCircle,
  Pause,
  Play,
  RotateCcw,
  Shield,
  Swords,
  Target,
  Volume2,
  VolumeX,
  Wind,
  Zap
} from 'lucide-react';
import { sounds } from '../audio/soundEffects';

interface BattleViewProps {
  playerConfig: CustomShipConfig;
  settings: BattleSettings;
  onUpdateSettings: (newSettings: Partial<BattleSettings>) => void;
  onReturnToShipyard: () => void;
}

export const BattleView: React.FC<BattleViewProps> = ({
  playerConfig,
  settings,
  onUpdateSettings,
  onReturnToShipyard,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const minimapCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const engineRef = useRef<BattleEngine | null>(null);
  const [battleState, setBattleState] = useState<BattleState | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [showControlsModal, setShowControlsModal] = useState(false);

  // Initialize and run Battle Engine
  useEffect(() => {
    const engine = new BattleEngine(playerConfig, settings, (updatedState) => {
      setBattleState({ ...updatedState });
    });
    engineRef.current = engine;
    engine.start();

    return () => {
      engine.stop();
      engineRef.current = null;
    };
  }, [playerConfig, settings.shipsPerTeam, settings.selectedMapId]);

  // Handle Canvas Rendering & Resize
  useEffect(() => {
    let animId: number;

    const renderLoop = () => {
      const canvas = canvasRef.current;
      const engine = engineRef.current;
      if (canvas && engine) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          renderBattle(ctx, engine.state, canvas.width, canvas.height);
        }
      }

      // Render Tactical Minimap
      const miniCanvas = minimapCanvasRef.current;
      if (miniCanvas && engine) {
        renderMinimap(miniCanvas, engine.state);
      }

      animId = requestAnimationFrame(renderLoop);
    };

    animId = requestAnimationFrame(renderLoop);

    const handleResize = () => {
      if (canvasRef.current) {
        canvasRef.current.width = window.innerWidth;
        canvasRef.current.height = window.innerHeight;
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Keyboard navigation & controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const engine = engineRef.current;
      if (!engine || isPaused) return;

      if (e.key === 'w' || e.key === 'ArrowUp' || e.key === 'W') {
        if (!e.repeat) engine.adjustPlayerThrottle(1);
      } else if (e.key === 's' || e.key === 'ArrowDown' || e.key === 'S') {
        if (!e.repeat) engine.adjustPlayerThrottle(-1);
      } else if (e.key === '1') {
        engine.setPlayerThrottle(1); // Half speed
      } else if (e.key === '2') {
        engine.setPlayerThrottle(2); // Full speed
      } else if (e.key === '0') {
        engine.setPlayerThrottle(0); // Stop
      } else if (e.key === 'r' || e.key === 'R') {
        engine.setPlayerThrottle(-1); // Reverse
      } else if (e.key === 'a' || e.key === 'ArrowLeft' || e.key === 'A') {
        engine.setPlayerRudder(-1);
      } else if (e.key === 'd' || e.key === 'ArrowRight' || e.key === 'D') {
        engine.setPlayerRudder(1);
      } else if (e.key === ' ' || e.code === 'Space') {
        e.preventDefault();
        engine.firePlayerWeapons();
      } else if (e.key === 'p' || e.key === 'P') {
        setIsPaused(prev => !prev);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const engine = engineRef.current;
      if (!engine) return;

      if (
        e.key === 'a' || e.key === 'd' ||
        e.key === 'A' || e.key === 'D' ||
        e.key === 'ArrowLeft' || e.key === 'ArrowRight'
      ) {
        engine.setPlayerRudder(0);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [isPaused]);

  // Mouse aim & fire
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    const engine = engineRef.current;
    if (!canvas || !engine) return;

    const rect = canvas.getBoundingClientRect();
    const mouseScreenX = e.clientX - rect.left;
    const mouseScreenY = e.clientY - rect.top;

    // Convert screen coordinates to world coordinates based on camera
    const zoom = engine.state.camera.zoom;
    const worldX = (mouseScreenX - canvas.width / 2) / zoom + engine.state.camera.x;
    const worldY = (mouseScreenY - canvas.height / 2) / zoom + engine.state.camera.y;

    engine.setMouseWorldPos(worldX, worldY);
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (e.button === 0) {
      // Left click fire towards clicked world point
      const canvas = canvasRef.current;
      const engine = engineRef.current;
      if (!canvas || !engine) return;

      const rect = canvas.getBoundingClientRect();
      const mouseScreenX = e.clientX - rect.left;
      const mouseScreenY = e.clientY - rect.top;

      const zoom = engine.state.camera.zoom;
      const worldX = (mouseScreenX - canvas.width / 2) / zoom + engine.state.camera.x;
      const worldY = (mouseScreenY - canvas.height / 2) / zoom + engine.state.camera.y;

      engine.setMouseWorldPos(worldX, worldY);
      engine.firePlayerWeapons(worldX, worldY);
    }
  };

  const handleRestartBattle = () => {
    if (engineRef.current) {
      engineRef.current.stop();
      const newEngine = new BattleEngine(playerConfig, settings, (updatedState) => {
        setBattleState({ ...updatedState });
      });
      engineRef.current = newEngine;
      newEngine.start();
      setIsPaused(false);
      sounds.playCannonShot('mortar');
    }
  };

  const playerShip = battleState?.ships.find(s => s.id === battleState.playerShipId);
  const alliedShips = battleState?.ships.filter(s => s.team === 'player') || [];
  const enemyShips = battleState?.ships.filter(s => s.team === 'enemy') || [];

  const aliveAllies = alliedShips.filter(s => !s.isSunk).length;
  const aliveEnemies = enemyShips.filter(s => !s.isSunk).length;

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-slate-950 select-none">
      {/* Main Ocean Battle Canvas */}
      <canvas
        ref={canvasRef}
        onMouseMove={handleMouseMove}
        onMouseDown={handleMouseDown}
        className="w-full h-full cursor-crosshair block"
      />

      {/* Top HUD: Fleets status, timer, controls */}
      <header className="absolute top-3 left-4 right-4 z-20 flex items-center justify-between pointer-events-none">
        {/* Blue Team Fleet Roster */}
        <div className="pointer-events-auto flex items-center gap-2 bg-slate-900/85 backdrop-blur-md px-3.5 py-2 rounded-2xl border border-sky-900/60 shadow-lg">
          <div className="w-2.5 h-2.5 rounded-full bg-sky-400 animate-pulse" />
          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-sky-200">
              <span>Allied Fleet</span>
              <span className="font-mono text-[10px] text-sky-400 bg-sky-950 px-1.5 py-0.5 rounded">
                {aliveAllies}/{alliedShips.length}
              </span>
            </div>
            {/* Health indicators */}
            <div className="flex items-center gap-1.5 mt-1">
              {alliedShips.map((ship) => {
                const hpRatio = Math.max(0, ship.currentHp / ship.maxHp);
                return (
                  <div
                    key={ship.id}
                    className="w-6 h-2 rounded bg-slate-800 border border-slate-700 overflow-hidden"
                    title={`${ship.name}: ${Math.round(ship.currentHp)}/${ship.maxHp} HP`}
                  >
                    <div
                      className={`h-full transition-all ${ship.isSunk ? 'bg-slate-600' : 'bg-sky-400'}`}
                      style={{ width: `${hpRatio * 100}%` }}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Center: Match Info & Timer */}
        <div className="pointer-events-auto flex items-center gap-4 bg-slate-900/85 backdrop-blur-md px-4 py-2 rounded-2xl border border-slate-800 shadow-lg">
          <div className="text-center">
            <span className="text-[10px] uppercase font-mono text-cyan-400 block truncate max-w-[150px]">
              {battleState?.mapConfig?.name || 'Naval Battle'}
            </span>
            <span className="text-sm font-mono font-bold text-slate-100">
              {Math.floor((battleState?.time || 0) / 60)}:
              {Math.floor((battleState?.time || 0) % 60).toString().padStart(2, '0')}
            </span>
          </div>

          <div className="h-6 w-px bg-slate-800" />

          {/* Quick Settings Bar */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => onUpdateSettings({ soundEnabled: !settings.soundEnabled })}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
              title={settings.soundEnabled ? 'Mute' : 'Unmute'}
            >
              {settings.soundEnabled ? <Volume2 className="w-4 h-4 text-cyan-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
            </button>

            <button
              onClick={() => onUpdateSettings({ autoFire: !settings.autoFire })}
              className={`px-2 py-1 rounded-lg text-xs font-mono transition flex items-center gap-1 ${
                settings.autoFire
                  ? 'bg-cyan-600 text-white font-semibold'
                  : 'bg-slate-800 text-slate-400 hover:text-slate-200'
              }`}
              title="Toggle automatic firing at in-range enemies"
            >
              <Crosshair className="w-3 h-3" />
              <span>Auto-Fire</span>
            </button>

            <button
              onClick={() => onUpdateSettings({ gameSpeed: settings.gameSpeed === 1 ? 1.5 : settings.gameSpeed === 1.5 ? 2 : 1 })}
              className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono transition"
              title="Game Speed"
            >
              {settings.gameSpeed}x
            </button>

            <button
              onClick={() => setShowControlsModal(true)}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
              title="Show Controls"
            >
              <HelpCircle className="w-4 h-4" />
            </button>

            <button
              onClick={onReturnToShipyard}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Shipyard</span>
            </button>
          </div>
        </div>

        {/* Red Team Fleet Roster */}
        <div className="pointer-events-auto flex items-center gap-2 bg-slate-900/85 backdrop-blur-md px-3.5 py-2 rounded-2xl border border-rose-900/60 shadow-lg">
          <div className="text-right">
            <div className="flex items-center justify-end gap-1.5 text-xs font-bold text-rose-200">
              <span className="font-mono text-[10px] text-rose-400 bg-rose-950 px-1.5 py-0.5 rounded">
                {aliveEnemies}/{enemyShips.length}
              </span>
              <span>Hostile Fleet</span>
            </div>
            {/* Health indicators */}
            <div className="flex items-center justify-end gap-1.5 mt-1">
              {enemyShips.map((ship) => {
                const hpRatio = Math.max(0, ship.currentHp / ship.maxHp);
                return (
                  <div
                    key={ship.id}
                    className="w-6 h-2 rounded bg-slate-800 border border-slate-700 overflow-hidden"
                    title={`${ship.name}: ${Math.round(ship.currentHp)}/${ship.maxHp} HP`}
                  >
                    <div
                      className={`h-full transition-all ${ship.isSunk ? 'bg-slate-600' : 'bg-rose-500'}`}
                      style={{ width: `${hpRatio * 100}%` }}
                    />
                  </div>
                );
              })}
            </div>
          </div>
          <div className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />
        </div>
      </header>

      {/* Top-Right Tactical Radar / Minimap */}
      <div className="absolute top-16 right-4 z-20 pointer-events-auto bg-slate-900/90 backdrop-blur-md p-2 rounded-2xl border border-slate-700/80 shadow-2xl flex flex-col items-center">
        <div className="flex items-center justify-between w-full px-1 pb-1 text-[10px] font-mono text-slate-400">
          <span>RADAR</span>
          <span className="text-cyan-400">Tactical Map</span>
        </div>
        <canvas
          ref={minimapCanvasRef}
          width={180}
          height={140}
          className="rounded-xl border border-slate-800 bg-slate-950 block"
        />
      </div>

      {/* Bottom-Left Helm Control Console */}
      <div className="absolute bottom-4 left-4 z-20 pointer-events-auto flex flex-col gap-2 max-w-sm">
        {playerShip && (
          <div className="bg-slate-900/90 backdrop-blur-md rounded-2xl border border-slate-800 p-3.5 shadow-2xl flex flex-col gap-3">
            {/* Flagship Title & Health */}
            <div>
              <div className="flex items-center justify-between text-xs font-bold text-slate-100 mb-1">
                <span className="flex items-center gap-1.5">
                  <span className="text-amber-400">⭐</span>
                  <span>{playerShip.name}</span>
                </span>
                <span className="font-mono text-cyan-400">
                  {Math.round(playerShip.currentHp)} / {playerShip.maxHp} HP
                </span>
              </div>
              <div className="w-full h-3 bg-slate-800 rounded-full border border-slate-700 overflow-hidden">
                <div
                  className={`h-full transition-all duration-200 ${
                    playerShip.currentHp / playerShip.maxHp < 0.25
                      ? 'bg-rose-500 animate-pulse'
                      : playerShip.currentHp / playerShip.maxHp < 0.6
                      ? 'bg-amber-400'
                      : 'bg-emerald-400'
                  }`}
                  style={{ width: `${Math.max(0, (playerShip.currentHp / playerShip.maxHp) * 100)}%` }}
                />
              </div>
            </div>

            {/* Throttle & Rudder Controls */}
            <div className="flex items-center justify-between gap-3 pt-2 border-t border-slate-800/80">
              {/* Sails / Speed Level */}
              <div>
                <span className="text-[10px] font-mono text-slate-400 block mb-1">SAILS / THROTTLE (W/S)</span>
                <div className="flex items-center gap-1">
                  {[
                    { level: -1, label: 'REV' },
                    { level: 0, label: 'STOP' },
                    { level: 1, label: 'HALF' },
                    { level: 2, label: 'FULL' },
                  ].map(btn => (
                    <button
                      key={btn.level}
                      onClick={() => engineRef.current?.setPlayerThrottle(btn.level)}
                      className={`px-2 py-1 rounded-md text-[10px] font-mono font-bold transition ${
                        playerShip.targetSpeedLevel === btn.level
                          ? 'bg-cyan-500 text-white shadow-sm shadow-cyan-500/50'
                          : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                      }`}
                    >
                      {btn.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Knot Speed gauge */}
              <div className="text-right">
                <span className="text-[10px] font-mono text-slate-400 block mb-1">SPEED</span>
                <span className="text-sm font-mono font-bold text-amber-300">
                  {Math.round(playerShip.speed)} <span className="text-[10px] font-normal text-slate-400">kts</span>
                </span>
              </div>
            </div>

            {/* Rudder buttons for touch/mouse */}
            <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-800/80 text-xs">
              <button
                onMouseDown={() => engineRef.current?.setPlayerRudder(-1)}
                onMouseUp={() => engineRef.current?.setPlayerRudder(0)}
                className="flex-1 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono text-[11px] active:bg-cyan-600 transition"
              >
                ◀ PORT (A)
              </button>
              <button
                onClick={() => engineRef.current?.setPlayerRudder(0)}
                className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 font-mono text-[10px]"
              >
                RUDDER MID
              </button>
              <button
                onMouseDown={() => engineRef.current?.setPlayerRudder(1)}
                onMouseUp={() => engineRef.current?.setPlayerRudder(0)}
                className="flex-1 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono text-[11px] active:bg-cyan-600 transition"
              >
                STARBOARD (D) ▶
              </button>
            </div>
          </div>
        )}

        {/* Combat Log */}
        <div className="bg-slate-900/80 backdrop-blur-md rounded-2xl border border-slate-800/80 p-2.5 max-h-24 overflow-hidden flex flex-col gap-1 text-[11px] font-mono">
          {battleState?.combatLog.slice(0, 3).map(log => (
            <div
              key={log.id}
              className={`leading-tight ${log.team === 'player' ? 'text-sky-300' : 'text-rose-300'}`}
            >
              • {log.text}
            </div>
          ))}
        </div>
      </div>

      {/* Bottom-Right Weapons Status Console */}
      <div className="absolute bottom-4 right-4 z-20 pointer-events-auto flex flex-col gap-2 max-w-xs">
        {playerShip && (
          <div className="bg-slate-900/90 backdrop-blur-md rounded-2xl border border-slate-800 p-3.5 shadow-2xl flex flex-col gap-2.5">
            <div className="flex items-center justify-between text-xs font-bold text-slate-200">
              <span className="flex items-center gap-1.5">
                <Crosshair className="w-3.5 h-3.5 text-cyan-400" />
                <span>Battery Hardpoints</span>
              </span>
              <span className="text-[10px] font-mono text-slate-400">Aim: Mouse Reticle</span>
            </div>

            {/* Weapon Hardpoints Battery List */}
            <div className="flex flex-col gap-1.5 max-h-36 overflow-y-auto pr-1">
              {playerShip.model.hardpoints.map(hp => {
                const compId = playerShip.config.equippedComponents[hp.id];
                const comp = compId ? COMPONENT_MAP.get(compId) : null;
                const cd = playerShip.cooldowns[hp.id] || 0;
                const totalCd = comp?.reloadTime || 1;
                const progress = totalCd > 0 ? (totalCd - cd) / totalCd : 1;
                const isReady = cd <= 0;

                return (
                  <div
                    key={hp.id}
                    className="p-1.5 rounded-lg bg-slate-800/70 border border-slate-700/60 flex items-center justify-between text-[11px]"
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: comp?.color || '#64748b' }}
                      />
                      <div>
                        <div className="font-semibold text-slate-200 leading-none">
                          {comp ? comp.name : 'Empty Slot'}
                        </div>
                        <div className="text-[9px] text-slate-400 font-mono mt-0.5">
                          {hp.name}
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      {comp && comp.damage > 0 ? (
                        <div className="flex items-center gap-1.5">
                          <div className="w-12 h-1.5 rounded-full bg-slate-700 overflow-hidden">
                            <div
                              className={`h-full ${isReady ? 'bg-cyan-400' : 'bg-amber-400'}`}
                              style={{ width: `${Math.min(1, Math.max(0, progress)) * 100}%` }}
                            />
                          </div>
                          <span className={`text-[10px] font-mono font-bold ${isReady ? 'text-cyan-400' : 'text-slate-400'}`}>
                            {isReady ? 'READY' : `${cd.toFixed(1)}s`}
                          </span>
                        </div>
                      ) : (
                        <span className="text-[10px] text-emerald-400 font-mono">PASSIVE</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Fire Button */}
            <button
              onClick={() => engineRef.current?.firePlayerWeapons()}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white font-bold text-xs shadow-lg shadow-rose-900/30 active:scale-98 transition flex items-center justify-center gap-2"
            >
              <Zap className="w-4 h-4 fill-current" />
              <span>FIRE SALVO (Space / Left Click)</span>
            </button>
          </div>
        )}
      </div>

      {/* Game Over / Victory Modal */}
      {battleState?.gameOver && (
        <div className="absolute inset-0 z-40 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 lg:p-8 max-w-md w-full shadow-2xl text-center flex flex-col items-center">
            <div
              className={`w-16 h-16 rounded-3xl flex items-center justify-center text-3xl shadow-xl mb-4 ${
                battleState.winner === 'player'
                  ? 'bg-gradient-to-br from-cyan-500 to-blue-600 text-white shadow-cyan-600/30'
                  : 'bg-gradient-to-br from-rose-600 to-red-700 text-white shadow-rose-600/30'
              }`}
            >
              {battleState.winner === 'player' ? '🏆' : '💀'}
            </div>

            <h2 className="text-2xl font-black text-slate-100 tracking-tight">
              {battleState.winner === 'player' ? 'FLEET VICTORY!' : 'FLEET SUNK'}
            </h2>
            <p className="text-xs text-slate-400 mt-1 mb-6">
              {battleState.winner === 'player'
                ? 'All hostile NPC warships have been eliminated. Your naval design proved dominant!'
                : 'All allied ships were destroyed in battle. Return to the shipyard to refit and upgrade your armor or cannons.'}
            </p>

            {/* Performance Stats */}
            <div className="grid grid-cols-2 gap-3 w-full mb-6">
              <div className="bg-slate-800/70 border border-slate-700/60 rounded-xl p-3 text-left">
                <span className="text-[10px] font-mono text-slate-400 block">DAMAGE DEALT</span>
                <span className="text-base font-bold font-mono text-cyan-400">
                  {battleState.stats.damageDealt}
                </span>
              </div>

              <div className="bg-slate-800/70 border border-slate-700/60 rounded-xl p-3 text-left">
                <span className="text-[10px] font-mono text-slate-400 block">SHIPS SUNK</span>
                <span className="text-base font-bold font-mono text-amber-400">
                  {battleState.stats.shipsSunk}
                </span>
              </div>

              <div className="bg-slate-800/70 border border-slate-700/60 rounded-xl p-3 text-left">
                <span className="text-[10px] font-mono text-slate-400 block">SALVOS FIRED</span>
                <span className="text-base font-bold font-mono text-slate-200">
                  {battleState.stats.shotsFired}
                </span>
              </div>

              <div className="bg-slate-800/70 border border-slate-700/60 rounded-xl p-3 text-left">
                <span className="text-[10px] font-mono text-slate-400 block">ACCURACY</span>
                <span className="text-base font-bold font-mono text-emerald-400">
                  {battleState.stats.shotsFired > 0
                    ? `${Math.round((battleState.stats.shotsHit / battleState.stats.shotsFired) * 100)}%`
                    : '0%'}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3 w-full">
              <button
                onClick={handleRestartBattle}
                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs shadow-lg shadow-cyan-600/30 transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Play Again (Rematch)</span>
              </button>

              <button
                onClick={onReturnToShipyard}
                className="flex-1 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs border border-slate-700 transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <Anchor className="w-4 h-4" />
                <span>Refit in Shipyard</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Controls Help Modal */}
      {showControlsModal && (
        <div className="absolute inset-0 z-40 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 max-w-sm w-full shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-cyan-400" />
                <span>Naval Helm Controls</span>
              </h3>
              <button
                onClick={() => setShowControlsModal(false)}
                className="text-xs text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="flex flex-col gap-2.5 my-4 text-xs">
              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-800/60">
                <span className="text-slate-300">Throttle (Sails)</span>
                <span className="font-mono text-cyan-400 font-bold">W / S (or Up / Down)</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-800/60">
                <span className="text-slate-300">Rudder (Steering)</span>
                <span className="font-mono text-cyan-400 font-bold">A / D (or Left / Right)</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-800/60">
                <span className="text-slate-300">Aim Weapons</span>
                <span className="font-mono text-cyan-400 font-bold">Mouse Cursor</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-800/60">
                <span className="text-slate-300">Fire Weapons in Arc</span>
                <span className="font-mono text-cyan-400 font-bold">Left Click or Spacebar</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-800/60">
                <span className="text-slate-300">Automatic Firing</span>
                <span className="font-mono text-cyan-400 font-bold">Toggle in Top Bar</span>
              </div>
            </div>

            <button
              onClick={() => setShowControlsModal(false)}
              className="w-full py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs transition"
            >
              Back to Battle
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// Render mini tactical radar
function renderMinimap(canvas: HTMLCanvasElement, state: BattleState) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const w = canvas.width;
  const h = canvas.height;
  const scaleX = w / state.arenaWidth;
  const scaleY = h / state.arenaHeight;

  // Background
  ctx.fillStyle = '#082f49';
  ctx.fillRect(0, 0, w, h);

  // Islands
  ctx.fillStyle = '#15803d';
  for (const island of state.islands) {
    ctx.beginPath();
    ctx.arc(island.x * scaleX, island.y * scaleY, Math.max(3, island.radius * scaleX), 0, Math.PI * 2);
    ctx.fill();
  }

  // Ships
  for (const ship of state.ships) {
    if (ship.isSunk) continue;

    const sx = ship.x * scaleX;
    const sy = ship.y * scaleY;

    ctx.save();
    ctx.translate(sx, sy);
    ctx.rotate(ship.angle);

    if (ship.isPlayer) {
      ctx.fillStyle = '#38bdf8';
      ctx.beginPath();
      ctx.arc(0, 0, 4, 0, Math.PI * 2);
      ctx.fill();
      // Heading line
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(8, 0);
      ctx.stroke();
    } else if (ship.team === 'player') {
      ctx.fillStyle = '#60a5fa';
      ctx.beginPath();
      ctx.arc(0, 0, 2.5, 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.fillStyle = '#f87171';
      ctx.beginPath();
      ctx.arc(0, 0, 2.5, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }

  // Camera viewport box
  const camScreenW = (window.innerWidth / state.camera.zoom) * scaleX;
  const camScreenH = (window.innerHeight / state.camera.zoom) * scaleY;
  const camScreenX = (state.camera.x * scaleX) - camScreenW / 2;
  const camScreenY = (state.camera.y * scaleY) - camScreenH / 2;

  ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
  ctx.lineWidth = 1;
  ctx.strokeRect(camScreenX, camScreenY, camScreenW, camScreenH);
}

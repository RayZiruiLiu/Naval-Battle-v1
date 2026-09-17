import React from 'react';
import { BaseShipModel, CustomShipConfig, HardpointSlot } from '../types/ship';
import { COMPONENT_MAP } from '../data/components';
import { Bomb, Compass, Crosshair, Flame, Gauge, Rocket, Shield, Target, Wrench, Zap } from 'lucide-react';

interface ShipDeckBlueprintProps {
  model: BaseShipModel;
  config: CustomShipConfig;
  selectedHardpointId: string | null;
  onSelectHardpoint: (hardpointId: string) => void;
}

export const ShipDeckBlueprint: React.FC<ShipDeckBlueprintProps> = ({
  model,
  config,
  selectedHardpointId,
  onSelectHardpoint,
}) => {
  // SVG view coordinates centered at 0,0
  const width = 360;
  const height = 480;
  const cx = width / 2;
  const cy = height / 2;

  // Scale factor to fit ship in preview: ship length along Y axis (pointing UP)
  const scale = 2.4;

  const renderIcon = (iconName?: string) => {
    const props = { className: 'w-4 h-4' };
    switch (iconName) {
      case 'Bomb': return <Bomb {...props} />;
      case 'Crosshair': return <Crosshair {...props} />;
      case 'Target': return <Target {...props} />;
      case 'Zap': return <Zap {...props} />;
      case 'Rocket': return <Rocket {...props} />;
      case 'Flame': return <Flame {...props} />;
      case 'Shield': return <Shield {...props} />;
      case 'Gauge': return <Gauge {...props} />;
      case 'Compass': return <Compass {...props} />;
      case 'Wrench': return <Wrench {...props} />;
      default: return <Zap {...props} />;
    }
  };

  const getArcLabel = (arc: string) => {
    switch (arc) {
      case 'bow': return 'Bow Arc (Forward)';
      case 'stern': return 'Stern Arc (Aft)';
      case 'broadside-left': return 'Port Broadside (Left)';
      case 'broadside-right': return 'Starboard Broadside (Right)';
      case 'all': return '360° Turret Arc';
      default: return arc;
    }
  };

  return (
    <div className="relative w-full h-[460px] bg-slate-900/90 rounded-2xl border border-slate-700/60 overflow-hidden flex flex-col items-center justify-center p-4 select-none shadow-xl shadow-cyan-950/20">
      {/* Blueprint grid background */}
      <div 
        className="absolute inset-0 opacity-15 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(to right, #0284c7 1px, transparent 1px),
            linear-gradient(to bottom, #0284c7 1px, transparent 1px)
          `,
          backgroundSize: '24px 24px'
        }}
      />

      {/* Top Legend info */}
      <div className="absolute top-3 left-4 z-10 flex items-center gap-2">
        <span className="text-xs font-mono font-semibold uppercase tracking-wider text-cyan-400 bg-cyan-950/60 px-2.5 py-1 rounded-md border border-cyan-800/50">
          Deck Blueprint
        </span>
        <span className="text-xs text-slate-400 font-mono">
          Click hardpoint to equip weapon
        </span>
      </div>

      <div className="absolute top-3 right-4 z-10 flex items-center gap-2">
        <span className="text-xs font-mono text-slate-400">
          Bow (Forward) ↑
        </span>
      </div>

      {/* SVG Ship Canvas */}
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full h-full max-w-[340px] max-h-[420px] drop-shadow-2xl"
      >
        <defs>
          <radialGradient id="waterGaze" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#0369a1" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#0f172a" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Ambient hull glow */}
        <circle cx={cx} cy={cy} r={140} fill="url(#waterGaze)" />

        {/* Center line axes */}
        <line
          x1={cx}
          y1={40}
          x2={cx}
          y2={height - 40}
          stroke="#0284c7"
          strokeWidth="1"
          strokeDasharray="4 4"
          opacity="0.35"
        />
        <line
          x1={40}
          y1={cy}
          x2={width - 40}
          y2={cy}
          stroke="#0284c7"
          strokeWidth="1"
          strokeDasharray="4 4"
          opacity="0.35"
        />

        {/* Ship Hull Group - Rotated 90 deg so Bow points UP */}
        <g transform={`translate(${cx}, ${cy}) rotate(-90)`}>
          {/* Main outer hull */}
          <path
            d={getHullSvgPath(model.id, model.hullLength * scale, model.hullWidth * scale)}
            fill={config.primaryColor}
            stroke="#0f172a"
            strokeWidth="3.5"
            className="transition-colors duration-300"
          />

          {/* Inner deck */}
          <path
            d={getHullSvgPath(model.id, model.hullLength * scale * 0.86, model.hullWidth * scale * 0.8)}
            fill={model.spriteStyle.deckColor}
            opacity="0.9"
          />

          {/* Accent trim line */}
          <line
            x1={-model.hullLength * scale * 0.42}
            y1={-model.hullWidth * scale * 0.38}
            x2={model.hullLength * scale * 0.32}
            y2={-model.hullWidth * scale * 0.28}
            stroke={config.accentColor}
            strokeWidth="3"
          />
          <line
            x1={-model.hullLength * scale * 0.42}
            y1={model.hullWidth * scale * 0.38}
            x2={model.hullLength * scale * 0.32}
            y2={model.hullWidth * scale * 0.28}
            stroke={config.accentColor}
            strokeWidth="3"
          />

          {/* Hardpoint weapon firing arc indicators if selected */}
          {model.hardpoints.map((hp) => {
            const isSelected = hp.id === selectedHardpointId;
            if (!isSelected) return null;

            const hpX = hp.x * (model.hullLength * scale * 0.5);
            const hpY = hp.y * (model.hullWidth * scale * 0.5);

            return (
              <g key={`arc-${hp.id}`} transform={`translate(${hpX}, ${hpY})`}>
                <circle
                  r="36"
                  fill="none"
                  stroke="#38bdf8"
                  strokeWidth="2"
                  strokeDasharray="4 4"
                  className="animate-pulse"
                />
              </g>
            );
          })}
        </g>

        {/* Interactive Hardpoints (Rendered in screen space: x=cy-rotated, y=cx-rotated) */}
        {model.hardpoints.map((hp) => {
          // Model x is forward/back (-1 back to +1 forward)
          // Model y is port/starboard (-1 left/port to +1 right/starboard)
          // Since ship points UP:
          // screen Y decreases with forward (+x)
          // screen X increases with starboard (+y)
          const screenX = cx + hp.y * (model.hullWidth * scale * 0.5);
          const screenY = cy - hp.x * (model.hullLength * scale * 0.5);

          const isSelected = hp.id === selectedHardpointId;
          const compId = config.equippedComponents[hp.id];
          const comp = compId ? COMPONENT_MAP.get(compId) : null;

          return (
            <g
              key={hp.id}
              transform={`translate(${screenX}, ${screenY})`}
              className="cursor-pointer group"
              onClick={() => onSelectHardpoint(hp.id)}
            >
              {/* Pulsing ring on selection */}
              {isSelected && (
                <circle
                  r="24"
                  fill="none"
                  stroke="#38bdf8"
                  strokeWidth="2"
                  className="animate-ping opacity-75"
                />
              )}

              {/* Hardpoint background badge */}
              <circle
                r="18"
                fill={isSelected ? '#0284c7' : comp ? '#1e293b' : '#334155'}
                stroke={isSelected ? '#7dd3fc' : comp ? comp.color : '#94a3b8'}
                strokeWidth={isSelected ? 3 : 2}
                className="transition-all duration-200 group-hover:scale-115"
              />

              {/* Component color pip */}
              {comp && (
                <circle
                  r="5"
                  fill={comp.color}
                  className="opacity-90"
                />
              )}

              {/* Label text */}
              <text
                y="28"
                textAnchor="middle"
                className="text-[10px] font-sans font-medium fill-slate-300 pointer-events-none drop-shadow"
              >
                {hp.name}
              </text>
            </g>
          );
        })}
      </svg>

      {/* Selected Hardpoint bottom summary bar */}
      <div className="absolute bottom-3 left-4 right-4 z-10 flex items-center justify-between bg-slate-950/85 backdrop-blur-md px-4 py-2.5 rounded-xl border border-slate-700/80">
        {selectedHardpointId ? (
          (() => {
            const hp = model.hardpoints.find(h => h.id === selectedHardpointId);
            const compId = hp ? config.equippedComponents[hp.id] : null;
            const comp = compId ? COMPONENT_MAP.get(compId) : null;
            return (
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-slate-800 border border-slate-700 text-cyan-400">
                    {renderIcon(comp?.iconName)}
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-slate-200 flex items-center gap-2">
                      <span>{hp?.name}</span>
                      <span className="text-[10px] text-cyan-400 font-mono px-1.5 py-0.5 bg-cyan-950/70 rounded">
                        {hp ? getArcLabel(hp.allowedArc) : ''}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400">
                      Equipped: <strong className="text-amber-400">{comp ? comp.name : 'Empty Slot'}</strong>
                    </div>
                  </div>
                </div>
                <div className="text-xs text-cyan-400 font-medium animate-pulse">
                  Choose module below →
                </div>
              </div>
            );
          })()
        ) : (
          <div className="text-xs text-slate-400 flex items-center gap-2 mx-auto">
            <span>Select any deck slot to change weapons or modules</span>
          </div>
        )}
      </div>
    </div>
  );
};

function getHullSvgPath(modelId: string, length: number, width: number): string {
  const halfL = length * 0.5;
  const halfW = width * 0.5;

  if (modelId === 'frigate-stealth') {
    // Wave-piercing trimaran
    return `
      M ${halfL},0 
      L ${halfL * 0.7},${-halfW * 0.35} 
      L ${-halfL * 0.75},${-halfW * 0.38} 
      L ${-halfL},${-halfW * 0.25} 
      L ${-halfL},${halfW * 0.25} 
      L ${-halfL * 0.75},${halfW * 0.38} 
      L ${halfL * 0.7},${halfW * 0.35} Z
      M ${halfL * 0.2},${-halfW} 
      L ${-halfL * 0.7},${-halfW} 
      L ${-halfL * 0.7},${-halfW * 0.72} 
      L ${halfL * 0.2},${-halfW * 0.72} Z
      M ${halfL * 0.2},${halfW * 0.72} 
      L ${-halfL * 0.7},${halfW * 0.72} 
      L ${-halfL * 0.7},${halfW} 
      L ${halfL * 0.2},${halfW} Z
    `;
  } else if (modelId === 'sub-raider') {
    return `
      M ${halfL},0 
      C ${halfL * 0.8},${-halfW} ${-halfL * 0.7},${-halfW} ${-halfL},0 
      C ${-halfL * 0.7},${halfW} ${halfL * 0.8},${halfW} ${halfL},0 Z
    `;
  } else if (modelId === 'corvette-fast') {
    return `
      M ${halfL},0 
      L ${halfL * 0.6},${-halfW} 
      L ${-halfL * 0.9},${-halfW * 0.85} 
      L ${-halfL},0 
      L ${-halfL * 0.9},${halfW * 0.85} 
      L ${halfL * 0.6},${halfW} Z
    `;
  } else {
    // Guided-Missile Destroyer / Cruiser / Battlecruiser faceted stealth hull
    return `
      M ${halfL},0 
      L ${halfL * 0.75},${-halfW * 0.85} 
      L ${-halfL * 0.7},${-halfW} 
      L ${-halfL},${-halfW * 0.55} 
      L ${-halfL},${halfW * 0.55} 
      L ${-halfL * 0.7},${halfW} 
      L ${halfL * 0.75},${halfW * 0.85} Z
    `;
  }
}

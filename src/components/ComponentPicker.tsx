import React, { useState } from 'react';
import { ComponentCategory, HardpointSlot, ShipComponent } from '../types/ship';
import { SHIP_COMPONENTS } from '../data/components';
import {
  Bomb,
  Compass,
  Crosshair,
  Flame,
  Gauge,
  Rocket,
  Shield,
  Target,
  Wrench,
  Zap,
  Check,
  Info
} from 'lucide-react';

interface ComponentPickerProps {
  selectedHardpoint: HardpointSlot | null;
  currentlyEquippedId: string | null;
  onEquipComponent: (componentId: string) => void;
  onUnequipComponent: () => void;
}

export const ComponentPicker: React.FC<ComponentPickerProps> = ({
  selectedHardpoint,
  currentlyEquippedId,
  onEquipComponent,
  onUnequipComponent,
}) => {
  const [filter, setFilter] = useState<'all' | ComponentCategory>('all');

  const renderIcon = (iconName: string) => {
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

  const filteredComponents = SHIP_COMPONENTS.filter(comp => {
    if (filter === 'all') return true;
    return comp.category === filter;
  });

  return (
    <div className="bg-slate-900/90 rounded-2xl border border-slate-700/70 p-4 flex flex-col h-full shadow-lg">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div>
          <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
            <span>Armory & Ship Components</span>
            {selectedHardpoint && (
              <span className="text-xs font-mono font-normal text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800/40">
                Target: {selectedHardpoint.name}
              </span>
            )}
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Select a cannon, missile, engine, or armor module for this deck slot
          </p>
        </div>

        {currentlyEquippedId && (
          <button
            onClick={onUnequipComponent}
            className="text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 px-2.5 py-1 rounded-lg border border-rose-800/40 transition"
          >
            Clear Slot
          </button>
        )}
      </div>

      {/* Category Filter Pills */}
      <div className="flex items-center gap-1.5 py-2.5 overflow-x-auto scrollbar-none text-xs">
        {(['all', 'cannon', 'special-weapon', 'defensive', 'mobility', 'support'] as const).map(cat => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            className={`px-2.5 py-1 rounded-lg font-medium capitalize whitespace-nowrap transition ${
              filter === cat
                ? 'bg-cyan-600 text-white shadow-sm shadow-cyan-600/30'
                : 'bg-slate-800/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            {cat === 'all' ? 'All Modules' : cat.replace('-', ' ')}
          </button>
        ))}
      </div>

      {/* Component Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 overflow-y-auto max-h-[380px] pr-1 py-1">
        {filteredComponents.map(comp => {
          const isEquipped = currentlyEquippedId === comp.id;

          return (
            <div
              key={comp.id}
              onClick={() => onEquipComponent(comp.id)}
              className={`group relative p-3 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                isEquipped
                  ? 'bg-cyan-950/40 border-cyan-500 shadow-md shadow-cyan-950/30 ring-1 ring-cyan-400'
                  : 'bg-slate-800/60 border-slate-700/60 hover:bg-slate-800 hover:border-slate-600'
              }`}
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div
                    className="p-2 rounded-lg text-white shadow-inner flex items-center justify-center"
                    style={{ backgroundColor: comp.color }}
                  >
                    {renderIcon(comp.iconName)}
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-slate-100 group-hover:text-cyan-300 transition">
                      {comp.name}
                    </h4>
                    <span className="text-[10px] uppercase font-mono text-slate-400">
                      {comp.category.replace('-', ' ')}
                    </span>
                  </div>
                </div>

                {isEquipped && (
                  <span className="flex items-center gap-1 text-[10px] font-semibold text-cyan-400 bg-cyan-900/60 px-1.5 py-0.5 rounded border border-cyan-700/50">
                    <Check className="w-3 h-3" /> Equipped
                  </span>
                )}
              </div>

              {/* Description */}
              <p className="text-[11px] text-slate-300 my-2 leading-relaxed line-clamp-2">
                {comp.description}
              </p>

              {/* Stats Bar */}
              <div className="pt-2 border-t border-slate-700/50 flex flex-wrap items-center gap-2 text-[10px] font-mono text-slate-300">
                {comp.damage > 0 && (
                  <span className="bg-slate-900/70 px-1.5 py-0.5 rounded text-amber-300">
                    Dmg: {comp.damage}{comp.projectilesPerShot && comp.projectilesPerShot > 1 ? `x${comp.projectilesPerShot}` : ''}
                  </span>
                )}
                {comp.reloadTime > 0 && (
                  <span className="bg-slate-900/70 px-1.5 py-0.5 rounded text-sky-300">
                    Reload: {comp.reloadTime}s
                  </span>
                )}
                {comp.range > 0 && (
                  <span className="bg-slate-900/70 px-1.5 py-0.5 rounded text-emerald-300">
                    Rng: {comp.range}m
                  </span>
                )}
                {comp.bonusHp && (
                  <span className="bg-slate-900/70 px-1.5 py-0.5 rounded text-green-400">
                    +{comp.bonusHp} HP
                  </span>
                )}
                {comp.bonusSpeed && (
                  <span className="bg-slate-900/70 px-1.5 py-0.5 rounded text-yellow-400">
                    +{comp.bonusSpeed} Spd
                  </span>
                )}
                {comp.bonusTurnRate && (
                  <span className="bg-slate-900/70 px-1.5 py-0.5 rounded text-cyan-300">
                    +{Math.round(comp.bonusTurnRate * 100)}% Turn
                  </span>
                )}
                {comp.damageReduction && (
                  <span className="bg-slate-900/70 px-1.5 py-0.5 rounded text-purple-300">
                    +{Math.round(comp.damageReduction * 100)}% Armor
                  </span>
                )}
                {comp.repairRate && (
                  <span className="bg-slate-900/70 px-1.5 py-0.5 rounded text-emerald-400">
                    +{comp.repairRate} HP/s Repair
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

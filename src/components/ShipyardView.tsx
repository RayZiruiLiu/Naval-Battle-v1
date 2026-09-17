import React, { useState, useEffect } from 'react';
import { BaseShipModel, CustomShipConfig, SavedShipProfile } from '../types/ship';
import { BASE_SHIPS, SHIP_MODEL_MAP } from '../data/shipModels';
import { calculateShipStats, SHIP_PRESETS } from '../utils/shipStats';
import { getSavedShips, saveShipProfile, deleteSavedShipProfile } from '../utils/savedShips';
import { ShipDeckBlueprint } from './ShipDeckBlueprint';
import { ComponentPicker } from './ComponentPicker';
import { MapSelector } from './MapSelector';
import { SavedShipsModal } from './SavedShipsModal';
import {
  Anchor,
  Bookmark,
  Compass,
  Gauge,
  HelpCircle,
  Palette,
  Play,
  RotateCcw,
  Save,
  Shield,
  Sparkles,
  Swords,
  Users,
  Volume2,
  VolumeX,
  Zap,
  Check
} from 'lucide-react';
import { sounds } from '../audio/soundEffects';

interface ShipyardViewProps {
  playerConfig: CustomShipConfig;
  onUpdateConfig: (newConfig: CustomShipConfig) => void;
  shipsPerTeam: number;
  onChangeShipsPerTeam: (count: number) => void;
  selectedMapId: string;
  onSelectMap: (mapId: string) => void;
  onLaunchBattle: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
}

const COLOR_PALETTES = [
  { name: 'US Navy Haze Gray', primary: '#1e293b', accent: '#38bdf8' },
  { name: 'Stealth Carbon Black', primary: '#090d16', accent: '#22d3ee' },
  { name: 'Arctic Camo White', primary: '#334155', accent: '#e2e8f0' },
  { name: 'Deep Pacific Blue', primary: '#1e3a8a', accent: '#60a5fa' },
  { name: 'Desert Coastal Sand', primary: '#451a03', accent: '#fbbf24' },
  { name: 'Strike Crimson Camo', primary: '#881337', accent: '#fb7185' },
];

export const ShipyardView: React.FC<ShipyardViewProps> = ({
  playerConfig,
  onUpdateConfig,
  shipsPerTeam,
  onChangeShipsPerTeam,
  selectedMapId,
  onSelectMap,
  onLaunchBattle,
  soundEnabled,
  onToggleSound,
}) => {
  const currentModel = SHIP_MODEL_MAP.get(playerConfig.baseModelId) || BASE_SHIPS[0];
  const [selectedHardpointId, setSelectedHardpointId] = useState<string | null>(
    currentModel.hardpoints[0]?.id || null
  );
  const [savedShips, setSavedShips] = useState<SavedShipProfile[]>(() => getSavedShips());
  const [isSavedFleetModalOpen, setIsSavedFleetModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const stats = calculateShipStats(currentModel, playerConfig);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleSelectModel = (model: BaseShipModel) => {
    // Retain or initialize hardpoints
    const newEquipped: Record<string, string> = {};
    model.hardpoints.forEach(hp => {
      // Keep existing if slot matches or assign default
      newEquipped[hp.id] = playerConfig.equippedComponents[hp.id] || hp.defaultComponentId || 'mk45-naval-gun';
    });

    onUpdateConfig({
      ...playerConfig,
      baseModelId: model.id,
      equippedComponents: newEquipped,
    });
    setSelectedHardpointId(model.hardpoints[0]?.id || null);
    sounds.playCannonShot('swivel');
  };

  const handleEquipComponent = (componentId: string) => {
    if (!selectedHardpointId) return;
    onUpdateConfig({
      ...playerConfig,
      equippedComponents: {
        ...playerConfig.equippedComponents,
        [selectedHardpointId]: componentId,
      },
    });
    sounds.playCannonShot('swivel');
  };

  const handleUnequipComponent = () => {
    if (!selectedHardpointId) return;
    const updated = { ...playerConfig.equippedComponents };
    delete updated[selectedHardpointId];
    onUpdateConfig({
      ...playerConfig,
      equippedComponents: updated,
    });
  };

  const handleApplyPreset = (preset: typeof SHIP_PRESETS[0]) => {
    onUpdateConfig({
      ...preset.config,
    });
    const model = SHIP_MODEL_MAP.get(preset.config.baseModelId) || BASE_SHIPS[0];
    setSelectedHardpointId(model.hardpoints[0]?.id || null);
    sounds.playCannonShot('mortar');
    showToast(`Loaded preset: ${preset.name}`);
  };

  // Save / Load ship configuration handlers
  const handleQuickSaveShip = () => {
    const name = playerConfig.name || 'Custom Modern Warship';
    const updated = saveShipProfile(playerConfig, name);
    setSavedShips(updated);
    sounds.playCannonShot('swivel');
    showToast(`Saved "${name}" to your fleet!`);
  };

  const handleSaveShipWithName = (customName?: string) => {
    const updated = saveShipProfile(playerConfig, customName);
    setSavedShips(updated);
    showToast(`Saved "${customName || playerConfig.name}" to your fleet!`);
  };

  const handleLoadSavedShip = (config: CustomShipConfig) => {
    onUpdateConfig(config);
    const model = SHIP_MODEL_MAP.get(config.baseModelId) || BASE_SHIPS[0];
    setSelectedHardpointId(model.hardpoints[0]?.id || null);
    showToast(`Loaded "${config.name}" into Shipyard!`);
  };

  const handleDeleteSavedShip = (profileId: string) => {
    const updated = deleteSavedShipProfile(profileId);
    setSavedShips(updated);
  };

  const selectedHardpoint = currentModel.hardpoints.find(h => h.id === selectedHardpointId) || null;
  const currentlyEquippedId = selectedHardpoint ? playerConfig.equippedComponents[selectedHardpoint.id] || null : null;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-cyan-500 selection:text-white">
      {/* Top Navbar */}
      <header className="border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-md sticky top-0 z-30 px-4 lg:px-8 py-3.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-cyan-600 to-blue-700 text-white shadow-md shadow-cyan-900/30">
              <Anchor className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <span>Modern Naval Architect</span>
                <span className="text-[10px] uppercase font-mono font-semibold bg-cyan-950 text-cyan-400 px-2 py-0.5 rounded border border-cyan-800/50">
                  Fleet Yard
                </span>
              </h1>
              <p className="text-xs text-slate-400">
                Design modern guided warships, save customized hulls & command balanced fleet battles
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Saved Ships Fleet Button */}
            <button
              onClick={() => setIsSavedFleetModalOpen(true)}
              className="px-3 py-2 rounded-xl bg-slate-800/90 hover:bg-slate-700/90 text-cyan-300 border border-slate-700/80 transition flex items-center gap-1.5 text-xs font-semibold shadow-sm cursor-pointer"
              title="View and load your saved ships"
            >
              <Bookmark className="w-4 h-4 text-cyan-400" />
              <span>Saved Fleet</span>
              <span className="ml-1 px-1.5 py-0.2 rounded-full bg-cyan-950 border border-cyan-800 text-[10px] font-mono text-cyan-300">
                {savedShips.length}
              </span>
            </button>

            {/* Sound Toggle */}
            <button
              onClick={onToggleSound}
              className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700/60 transition flex items-center gap-1.5 text-xs cursor-pointer"
              title={soundEnabled ? 'Mute Audio' : 'Unmute Audio'}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4 text-cyan-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
            </button>

            {/* Launch Battle Primary Action */}
            <button
              onClick={onLaunchBattle}
              className="group relative flex items-center gap-2 px-4 sm:px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold text-xs sm:text-sm shadow-lg shadow-cyan-600/25 transition-all hover:scale-102 cursor-pointer"
            >
              <Swords className="w-4 h-4 transition-transform group-hover:rotate-12" />
              <span>Deploy Battle</span>
            </button>
          </div>
        </div>
      </header>

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-2.5 rounded-xl bg-cyan-950/95 border border-cyan-500 text-cyan-200 text-xs font-medium shadow-2xl flex items-center gap-2 backdrop-blur-md animate-slide-up">
          <Check className="w-4 h-4 text-cyan-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 lg:p-8 flex flex-col gap-6">
        
        {/* Step 1: Base Modern Ship Models Row */}
        <section className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 lg:p-5 backdrop-blur-sm">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-3">
            <div>
              <h2 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-cyan-600/30 text-cyan-400 text-xs flex items-center justify-center font-bold">1</span>
                <span>Select Modern Warship Class</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Choose from modern destroyers, stealth trimaran frigates, nuclear cruisers, submarines, and railgun battlecruisers.
              </p>
            </div>

            {/* Quick Presets Dropdown */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 font-mono hidden sm:inline">Presets:</span>
              <div className="flex items-center gap-1.5 overflow-x-auto max-w-full pb-1 sm:pb-0">
                {SHIP_PRESETS.map(preset => (
                  <button
                    key={preset.name}
                    onClick={() => handleApplyPreset(preset)}
                    className="text-xs px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700/60 transition whitespace-nowrap cursor-pointer"
                  >
                    {preset.name}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-3">
            {BASE_SHIPS.map(model => {
              const isSelected = model.id === currentModel.id;
              return (
                <div
                  key={model.id}
                  onClick={() => handleSelectModel(model)}
                  className={`relative p-3 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'bg-cyan-950/40 border-cyan-500 shadow-md shadow-cyan-950/40 ring-1 ring-cyan-500'
                      : 'bg-slate-800/40 border-slate-700/60 hover:bg-slate-800/80 hover:border-slate-600'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-slate-100">{model.name}</span>
                      <span className="text-[10px] font-mono text-cyan-400 px-1.5 py-0.5 bg-cyan-950 rounded">
                        {model.hardpoints.length} Slots
                      </span>
                    </div>
                    <span className="text-[10px] text-cyan-400/90 font-mono block mb-1.5">{model.type}</span>
                    <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                      {model.description}
                    </p>
                  </div>

                  <div className="mt-3 pt-2 border-t border-slate-700/50 flex items-center justify-between text-[10px] font-mono text-slate-300">
                    <span>HP: {model.baseHp}</span>
                    <span>{model.baseSpeed} kts</span>
                    <span>Arm: {model.baseArmor}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Step 2: Customization Grid (Blueprint + Armory + Stats) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left / Center: Interactive Modern Ship Blueprint (5 cols on lg) */}
          <div className="lg:col-span-5 flex flex-col gap-4">
            <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 flex flex-col gap-3">
              {/* Ship Name, Save Button & Camo Selector */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
                <div className="flex-1 w-full">
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block">
                      Flagship Warship Name
                    </label>
                    <button
                      type="button"
                      onClick={handleQuickSaveShip}
                      className="text-[11px] text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1 transition cursor-pointer"
                      title="Save this customized warship"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>Save Build</span>
                    </button>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={playerConfig.name}
                      onChange={(e) => onUpdateConfig({ ...playerConfig, name: e.target.value })}
                      maxLength={28}
                      placeholder="e.g. USS Arleigh Vanguard..."
                      className="w-full bg-slate-800/90 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block mb-1">
                    Stealth Camo
                  </label>
                  <div className="flex items-center gap-1.5">
                    {COLOR_PALETTES.map(p => (
                      <button
                        key={p.name}
                        onClick={() => onUpdateConfig({ ...playerConfig, primaryColor: p.primary, accentColor: p.accent })}
                        className={`w-6 h-6 rounded-full border-2 transition-transform cursor-pointer ${
                          playerConfig.primaryColor === p.primary ? 'scale-115 border-white shadow-md ring-2 ring-cyan-500/50' : 'border-transparent hover:scale-105'
                        }`}
                        style={{ backgroundColor: p.primary }}
                        title={p.name}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Interactive Modern Deck Blueprint Canvas */}
              <ShipDeckBlueprint
                model={currentModel}
                config={playerConfig}
                selectedHardpointId={selectedHardpointId}
                onSelectHardpoint={setSelectedHardpointId}
              />
            </div>
          </div>

          {/* Right: Armory & Component Picker (7 cols on lg) */}
          <div className="lg:col-span-7 flex flex-col gap-4">
            
            {/* Real-time Ship Performance Overview Cards */}
            <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4">
              <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider font-mono mb-3 flex items-center justify-between">
                <span>Ship Tactical Capabilities & Firepower</span>
                <span className="text-cyan-400 lowercase font-mono">{currentModel.name} system suite</span>
              </h3>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5">
                <div className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/60">
                  <div className="flex items-center gap-1 text-[11px] text-slate-400 mb-1">
                    <Shield className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Hull HP</span>
                  </div>
                  <div className="text-base font-bold font-mono text-emerald-300">{stats.maxHp}</div>
                  <div className="text-[9px] text-slate-500 font-mono">base {currentModel.baseHp}</div>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/60">
                  <div className="flex items-center gap-1 text-[11px] text-slate-400 mb-1">
                    <Gauge className="w-3.5 h-3.5 text-amber-400" />
                    <span>Speed</span>
                  </div>
                  <div className="text-base font-bold font-mono text-amber-300">{stats.speed} <span className="text-xs font-normal">kts</span></div>
                  <div className="text-[9px] text-slate-500 font-mono">base {currentModel.baseSpeed}</div>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/60">
                  <div className="flex items-center gap-1 text-[11px] text-slate-400 mb-1">
                    <Compass className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Agility</span>
                  </div>
                  <div className="text-base font-bold font-mono text-cyan-300">{stats.turnRate} <span className="text-xs font-normal">rad/s</span></div>
                  <div className="text-[9px] text-slate-500 font-mono">rudder response</div>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/60">
                  <div className="flex items-center gap-1 text-[11px] text-slate-400 mb-1">
                    <Zap className="w-3.5 h-3.5 text-rose-400" />
                    <span>Firepower</span>
                  </div>
                  <div className="text-base font-bold font-mono text-rose-300">{stats.firepowerDps} <span className="text-xs font-normal">DPS</span></div>
                  <div className="text-[9px] text-slate-500 font-mono">all batteries</div>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/60">
                  <div className="flex items-center gap-1 text-[11px] text-slate-400 mb-1">
                    <Anchor className="w-3.5 h-3.5 text-purple-400" />
                    <span>Max Range</span>
                  </div>
                  <div className="text-base font-bold font-mono text-purple-300">{stats.effectiveRange} <span className="text-xs font-normal">m</span></div>
                  <div className="text-[9px] text-slate-500 font-mono">artillery reach</div>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/60">
                  <div className="flex items-center gap-1 text-[11px] text-slate-400 mb-1">
                    <Shield className="w-3.5 h-3.5 text-sky-400" />
                    <span>Armor</span>
                  </div>
                  <div className="text-base font-bold font-mono text-sky-300">{stats.armorRating}%</div>
                  <div className="text-[9px] text-slate-500 font-mono">damage absorb</div>
                </div>
              </div>
            </div>

            {/* Component Picker List */}
            <div className="flex-1">
              <ComponentPicker
                selectedHardpoint={selectedHardpoint}
                currentlyEquippedId={currentlyEquippedId}
                onEquipComponent={handleEquipComponent}
                onUnequipComponent={handleUnequipComponent}
              />
            </div>
          </div>
        </div>

        {/* Step 3: Combat Theater (Map Selector) */}
        <MapSelector
          selectedMapId={selectedMapId}
          onSelectMap={onSelectMap}
        />

        {/* Step 4: Fleet Battle Configuration & Launch Banner */}
        <section className="bg-gradient-to-r from-slate-900 via-slate-900/95 to-cyan-950/40 border border-slate-800 rounded-2xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-xl">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-2xl bg-cyan-600/20 text-cyan-400 border border-cyan-800/40 mt-1">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-cyan-600/30 text-cyan-400 text-xs flex items-center justify-center font-bold">4</span>
                <h3 className="text-sm font-bold text-slate-100">Fleet Balance & Team Size</h3>
              </div>
              <p className="text-xs text-slate-300 mt-1 max-w-xl leading-relaxed">
                Both teams always field the exact same number of ships. Your custom ship commands Team Blue as Flagship, supported by varied modern NPC warships against an equally balanced hostile task force.
              </p>

              {/* Team Size Selector Buttons */}
              <div className="flex items-center gap-2 mt-3 flex-wrap">
                <span className="text-xs text-slate-400 font-mono">Ships per team:</span>
                {[1, 2, 3, 4, 5].map(num => (
                  <button
                    key={num}
                    onClick={() => onChangeShipsPerTeam(num)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition cursor-pointer ${
                      shipsPerTeam === num
                        ? 'bg-cyan-500 text-white shadow-md shadow-cyan-600/30 ring-1 ring-cyan-300'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700'
                    }`}
                  >
                    {num} vs {num} ({num * 2} ships)
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="w-full md:w-auto flex flex-col items-end gap-2">
            <button
              onClick={onLaunchBattle}
              className="w-full md:w-auto flex items-center justify-center gap-3 px-8 py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-bold text-base shadow-xl shadow-cyan-600/30 transition-all hover:scale-102 active:scale-98 cursor-pointer"
            >
              <Play className="w-5 h-5 fill-current" />
              <span>Launch Water Battle ({shipsPerTeam}v{shipsPerTeam})</span>
            </button>
            <span className="text-[11px] text-slate-400 font-mono">
              Ready to sail • Full tactical helm & weapon controls
            </span>
          </div>
        </section>

      </main>

      {/* Saved Ships Management Drawer / Modal */}
      <SavedShipsModal
        isOpen={isSavedFleetModalOpen}
        onClose={() => setIsSavedFleetModalOpen(false)}
        currentConfig={playerConfig}
        savedShips={savedShips}
        onLoadShip={handleLoadSavedShip}
        onSaveShip={handleSaveShipWithName}
        onDeleteShip={handleDeleteSavedShip}
      />
    </div>
  );
};

import React from 'react';
import { Inventory, PlayerStats, GamePhase } from '../types';
import { sound } from '../audio';
import { 
  Key, 
  BatteryCharging, 
  Diamond, 
  Flame, 
  Volume2, 
  VolumeX, 
  Code2, 
  Compass, 
  Heart,
  Navigation,
  Sparkles,
  Film
} from 'lucide-react';

interface HUDProps {
  currentPhase: GamePhase;
  inventory: Inventory;
  playerStats: PlayerStats;
  onOpenGodotFiles: () => void;
  onTeleport: (area: 'gateway' | 'bridge' | 'puzzle_area' | 'boss') => void;
  onInteract?: () => void;
  onReplayCinematic?: () => void;
  noticeMsg: string | null;
}

export const HUD: React.FC<HUDProps> = ({
  currentPhase,
  inventory,
  playerStats,
  onOpenGodotFiles,
  onTeleport,
  onInteract,
  onReplayCinematic,
  noticeMsg,
}) => {
  const [soundActive, setSoundActive] = React.useState(sound.isSoundEnabled());

  const handleToggleSound = () => {
    const next = sound.toggleMute();
    setSoundActive(next);
  };

  const getObjectiveText = () => {
    switch (currentPhase) {
      case GamePhase.START_SCREEN:
        return 'Press Begin Journey to Enter the Citadel';
      case GamePhase.INTRO_DIALOGUE:
        return 'Listen to Aethelgard, Architect of Trials';
      case GamePhase.EXPLORING_GATEWAY:
        return 'Approach the Grand Gateway and speak with Aethelgard [E]';
      case GamePhase.CROSSING_BRIDGE:
        return 'Cross the Celestial Bridge toward the Puzzle Nexus';
      case GamePhase.PUZZLE_AREA:
        if (!inventory.keys.sunKey) return 'Enter Puzzle Level 1: 3-Lever Power Matrix [E to Interact]';
        if (!inventory.keys.moonKey) return 'Enter Puzzle Level 2: Intelligence Quiz [E to Interact]';
        if (!inventory.keys.starKey) return 'Enter Puzzle Level 3: Runic Keystone Alignment [E to Interact]';
        return 'All 3 Keystones Acquired! Cross the North Bridge to Confront the Final Boss!';
      case GamePhase.FINAL_BOSS:
        return 'Defeat The Chrono-Colossus using your Collected Resources!';
      case GamePhase.VICTORY:
        return 'Trials Completed! You are the Sovereign of Engineering!';
      default:
        return 'Explore the Celestial Citadel';
    }
  };

  return (
    <div className="pointer-events-none fixed inset-0 z-40 flex flex-col justify-between p-4 sm:p-6 text-slate-100">
      {/* TOP BAR: Player Health, Objective, Tools */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        {/* Left: Player Status */}
        <div className="pointer-events-auto flex items-center gap-3 bg-slate-900/85 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-slate-700 shadow-xl">
          <div className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-rose-500 fill-rose-500/30" />
            <div className="w-28 sm:w-36 bg-slate-800 h-3 rounded-full overflow-hidden border border-slate-700">
              <div
                className="bg-gradient-to-r from-rose-600 to-rose-400 h-full transition-all duration-300"
                style={{ width: `${(playerStats.health / playerStats.maxHealth) * 100}%` }}
              />
            </div>
            <span className="text-xs font-mono font-bold text-slate-300">
              {Math.round(playerStats.health)}%
            </span>
          </div>

          <div className="h-4 w-px bg-slate-700 mx-1 hidden sm:block" />

          {/* Quick Controls Hint */}
          <div className="hidden md:flex items-center gap-1.5 text-[11px] text-slate-400">
            <span className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 font-mono text-slate-300">WASD</span>
            <span>Move</span>
            <span className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 font-mono text-slate-300 ml-1">Space</span>
            <span>Jump</span>
            <span className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 font-mono text-slate-300 ml-1">Mouse</span>
            <span>Camera</span>
            <span className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 font-mono text-slate-300 ml-1">E</span>
            <span>Interact</span>
          </div>
        </div>

        {/* Center: Objective Banner */}
        <div className="pointer-events-auto bg-slate-900/90 backdrop-blur-md px-5 py-2.5 rounded-2xl border border-cyan-500/40 shadow-xl flex items-center gap-3 max-w-lg">
          <Compass className="w-5 h-5 text-cyan-400 animate-spin-slow" />
          <div className="text-left">
            <div className="text-[10px] uppercase tracking-widest text-cyan-400 font-bold">Current Objective</div>
            <div className="text-xs sm:text-sm font-semibold text-slate-100">{getObjectiveText()}</div>
          </div>
        </div>

        {/* Right: Quick Teleport & Godot Files Button */}
        <div className="pointer-events-auto flex items-center gap-2">
          {/* Quick fast-travel */}
          <div className="hidden lg:flex items-center gap-1 bg-slate-900/80 backdrop-blur-md p-1.5 rounded-2xl border border-slate-700">
            <button
              onClick={() => onTeleport('gateway')}
              className="px-2.5 py-1 text-xs rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
              title="Return to Gateway"
            >
              Gateway
            </button>
            <button
              onClick={() => onTeleport('bridge')}
              className="px-2.5 py-1 text-xs rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
              title="Bridge"
            >
              Bridge
            </button>
            <button
              onClick={() => onTeleport('puzzle_area')}
              className="px-2.5 py-1 text-xs rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
              title="Puzzle Nexus"
            >
              Nexus
            </button>
            {inventory.keys.starKey && (
              <button
                onClick={() => onTeleport('boss')}
                className="px-2.5 py-1 text-xs rounded-xl bg-rose-900/60 hover:bg-rose-800 text-rose-300 border border-rose-600/40 transition"
                title="Boss Arena"
              >
                Boss Arena
              </button>
            )}
          </div>

          <button
            onClick={handleToggleSound}
            className="p-2.5 rounded-2xl bg-slate-900/80 backdrop-blur-md border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800 shadow-xl transition"
            title="Toggle Sound"
          >
            {soundActive ? <Volume2 className="w-5 h-5 text-cyan-400" /> : <VolumeX className="w-5 h-5 text-slate-500" />}
          </button>

          {onReplayCinematic && (
            <button
              onClick={onReplayCinematic}
              className="flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 font-semibold text-xs border border-amber-500/30 shadow-xl transition active:scale-95"
              title="Watch or Replay 30-Second Cinematic Intro Video"
            >
              <Film className="w-4 h-4 text-amber-400" />
              <span className="hidden sm:inline">Cinematic Intro (30s)</span>
            </button>
          )}

          <button
            onClick={onOpenGodotFiles}
            className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-gradient-to-r from-blue-700 to-indigo-700 hover:from-blue-600 hover:to-indigo-600 text-white font-semibold text-xs border border-blue-400/40 shadow-xl shadow-blue-950/50 transition active:scale-95"
            title="Inspect & Download Complete Godot 4.x Project (.ZIP)"
          >
            <Code2 className="w-4 h-4" />
            <span className="hidden sm:inline">Godot 4.x Project (.ZIP)</span>
          </button>

          {onInteract && (
            <button
              onClick={onInteract}
              className="flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold text-xs shadow-lg shadow-amber-950 transition active:scale-95 animate-pulse"
              title="Interact with Guide or Puzzle Terminal [E]"
            >
              <Sparkles className="w-4 h-4 text-slate-950" />
              <span>Interact [E]</span>
            </button>
          )}
        </div>
      </div>

      {/* NOTICE TOAST */}
      {noticeMsg && (
        <div className="self-center pointer-events-auto px-5 py-2.5 rounded-xl bg-rose-950/90 border border-rose-500/60 text-rose-200 text-xs sm:text-sm font-semibold shadow-2xl backdrop-blur-md animate-in slide-in-from-top-4 duration-200">
          ⚠️ {noticeMsg}
        </div>
      )}

      {/* BOTTOM BAR: Keystones & Resources Inventory */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        {/* Keys System */}
        <div className="pointer-events-auto bg-slate-900/85 backdrop-blur-md px-4 py-3 rounded-2xl border border-slate-700 shadow-2xl flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-amber-400">
            <Key className="w-4 h-4" /> Keystones:
          </div>
          <div className="flex items-center gap-2">
            {/* Sun Key */}
            <div
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-semibold border transition ${
                inventory.keys.sunKey
                  ? 'bg-amber-950/60 border-amber-500/70 text-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.35)]'
                  : 'bg-slate-800/40 border-slate-700/50 text-slate-500 opacity-60'
              }`}
            >
              <span>☀️</span>
              <span className="hidden sm:inline">Sun</span>
            </div>

            {/* Moon Key */}
            <div
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-semibold border transition ${
                inventory.keys.moonKey
                  ? 'bg-purple-950/60 border-purple-500/70 text-purple-300 shadow-[0_0_12px_rgba(168,85,247,0.35)]'
                  : 'bg-slate-800/40 border-slate-700/50 text-slate-500 opacity-60'
              }`}
            >
              <span>🌙</span>
              <span className="hidden sm:inline">Moon</span>
            </div>

            {/* Star Key */}
            <div
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-semibold border transition ${
                inventory.keys.starKey
                  ? 'bg-cyan-950/60 border-cyan-500/70 text-cyan-300 shadow-[0_0_12px_rgba(6,182,212,0.35)]'
                  : 'bg-slate-800/40 border-slate-700/50 text-slate-500 opacity-60'
              }`}
            >
              <span>⭐</span>
              <span className="hidden sm:inline">Star</span>
            </div>
          </div>
        </div>

        {/* Resources System */}
        <div className="pointer-events-auto bg-slate-900/85 backdrop-blur-md px-4 py-3 rounded-2xl border border-slate-700 shadow-2xl flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-cyan-400">
            <BatteryCharging className="w-4 h-4" /> Titan Resources:
          </div>
          <div className="flex items-center gap-2">
            {/* Resource 1: Aether Core */}
            <div
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-semibold border transition ${
                inventory.resources.aetherCore > 0
                  ? 'bg-cyan-950/60 border-cyan-500/70 text-cyan-300'
                  : 'bg-slate-800/40 border-slate-700/50 text-slate-500 opacity-60'
              }`}
            >
              <BatteryCharging className="w-3.5 h-3.5 text-cyan-400" />
              <span>Aether Core: {inventory.resources.aetherCore}</span>
            </div>

            {/* Resource 2: Resonant Crystal */}
            <div
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-semibold border transition ${
                inventory.resources.resonantCrystal > 0
                  ? 'bg-purple-950/60 border-purple-500/70 text-purple-300'
                  : 'bg-slate-800/40 border-slate-700/50 text-slate-500 opacity-60'
              }`}
            >
              <Diamond className="w-3.5 h-3.5 text-purple-400" />
              <span>Resonant Crystal: {inventory.resources.resonantCrystal}</span>
            </div>

            {/* Resource 3: Titan Catalyst */}
            <div
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-semibold border transition ${
                inventory.resources.titanCatalyst > 0
                  ? 'bg-amber-950/60 border-amber-500/70 text-amber-300'
                  : 'bg-slate-800/40 border-slate-700/50 text-slate-500 opacity-60'
              }`}
            >
              <Flame className="w-3.5 h-3.5 text-amber-400" />
              <span>Titan Catalyst: {inventory.resources.titanCatalyst}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

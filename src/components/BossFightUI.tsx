import React, { useEffect, useState } from 'react';
import { Inventory } from '../types';
import { ShieldAlert, Zap, Diamond, Flame, RefreshCw, AlertTriangle } from 'lucide-react';

interface BossFightUIProps {
  bossState: {
    health: number;
    maxHealth: number;
    phase: string;
    attackName: string;
  };
  inventory: Inventory;
  onAttack: (resourceType: 1 | 2 | 3) => void;
  onRestartBoss: () => void;
}

export const BossFightUI: React.FC<BossFightUIProps> = ({
  bossState,
  inventory,
  onAttack,
  onRestartBoss,
}) => {
  const [cooldowns, setCooldowns] = useState<{ [k: number]: boolean }>({ 1: false, 2: false, 3: false });

  // Listen to hotkeys 1, 2, 3
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Digit1' && !cooldowns[1] && inventory.resources.aetherCore > 0) {
        triggerAttack(1);
      } else if (e.code === 'Digit2' && !cooldowns[2] && inventory.resources.resonantCrystal > 0) {
        triggerAttack(2);
      } else if (e.code === 'Digit3' && !cooldowns[3] && inventory.resources.titanCatalyst > 0) {
        triggerAttack(3);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [cooldowns, inventory]);

  const triggerAttack = (type: 1 | 2 | 3) => {
    if (cooldowns[type]) return;
    onAttack(type);

    setCooldowns((prev) => ({ ...prev, [type]: true }));
    const cdTime = type === 1 ? 1200 : type === 2 ? 2000 : 3000;
    setTimeout(() => {
      setCooldowns((prev) => ({ ...prev, [type]: false }));
    }, cdTime);
  };

  const healthPercent = Math.max(0, (bossState.health / bossState.maxHealth) * 100);

  return (
    <div className="pointer-events-none fixed inset-0 z-40 flex flex-col justify-between p-6">
      {/* BOSS HEALTH BAR TOP CENTER */}
      <div className="self-center pointer-events-auto w-full max-w-xl bg-slate-950/90 backdrop-blur-md rounded-2xl border-2 border-rose-600/60 p-4 shadow-2xl shadow-rose-950/60 text-center animate-in slide-in-from-top-6 duration-300">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-rose-500 animate-pulse" />
            <span className="font-cinzel font-bold text-lg text-rose-300 tracking-wider">
              The Chrono-Colossus
            </span>
          </div>
          <span className="text-xs uppercase font-mono tracking-widest px-2.5 py-0.5 rounded-full bg-rose-950 border border-rose-600 text-rose-300">
            {bossState.phase === 'stunned' ? '⚡ STUNNED!' : bossState.phase === 'attack' ? '⚠️ ATTACKING!' : 'ACTIVE'}
          </span>
        </div>

        {/* Health bar container */}
        <div className="relative w-full h-5 bg-slate-900 rounded-full overflow-hidden border border-slate-700">
          <div
            className="h-full bg-gradient-to-r from-rose-600 via-red-500 to-amber-500 transition-all duration-300 shadow-[0_0_15px_rgba(244,63,94,0.6)]"
            style={{ width: `${healthPercent}%` }}
          />
          <span className="absolute inset-0 flex items-center justify-center text-[11px] font-mono font-bold text-white drop-shadow">
            {Math.round(bossState.health)} / {bossState.maxHealth} HP
          </span>
        </div>

        {/* Warning Indicator */}
        {bossState.phase === 'attack' && (
          <div className="mt-2 text-xs font-bold text-rose-400 flex items-center justify-center gap-1.5 animate-bounce">
            <AlertTriangle className="w-4 h-4" />
            <span>WARNING: Shockwave incoming! JUMP [Spacebar] to dodge!</span>
          </div>
        )}
      </div>

      {/* RESOURCE COMBAT ACTION BAR (BOTTOM CENTER) */}
      <div className="self-center pointer-events-auto bg-slate-900/90 backdrop-blur-md rounded-3xl border border-slate-700 p-4 shadow-2xl flex flex-col items-center gap-3">
        <div className="text-xs uppercase tracking-wider font-semibold text-slate-400 flex items-center gap-2">
          <span>Unleash Stored Resources to Pierce Titan Armor</span>
        </div>

        <div className="flex items-center gap-3">
          {/* Skill 1: Aether Core Pulse */}
          <button
            onClick={() => triggerAttack(1)}
            disabled={cooldowns[1] || inventory.resources.aetherCore <= 0}
            className={`relative flex flex-col items-center justify-center w-24 h-24 rounded-2xl border transition-all ${
              inventory.resources.aetherCore > 0 && !cooldowns[1]
                ? 'bg-gradient-to-b from-cyan-900/60 to-slate-900 border-cyan-500/70 text-cyan-300 hover:scale-105 shadow-lg shadow-cyan-950/60 active:scale-95'
                : 'bg-slate-950 border-slate-800 text-slate-600 opacity-50 cursor-not-allowed'
            }`}
          >
            <span className="absolute top-1.5 left-2 text-[10px] font-mono bg-slate-950/80 px-1 rounded text-cyan-400">
              [1]
            </span>
            <Zap className="w-6 h-6 mb-1 text-cyan-400" />
            <span className="text-[11px] font-bold text-center leading-tight">Aether Pulse</span>
            <span className="text-[9px] text-cyan-300 font-mono mt-0.5">25 DMG</span>
          </button>

          {/* Skill 2: Resonant Prism Ray */}
          <button
            onClick={() => triggerAttack(2)}
            disabled={cooldowns[2] || inventory.resources.resonantCrystal <= 0}
            className={`relative flex flex-col items-center justify-center w-24 h-24 rounded-2xl border transition-all ${
              inventory.resources.resonantCrystal > 0 && !cooldowns[2]
                ? 'bg-gradient-to-b from-purple-900/60 to-slate-900 border-purple-500/70 text-purple-300 hover:scale-105 shadow-lg shadow-purple-950/60 active:scale-95'
                : 'bg-slate-950 border-slate-800 text-slate-600 opacity-50 cursor-not-allowed'
            }`}
          >
            <span className="absolute top-1.5 left-2 text-[10px] font-mono bg-slate-950/80 px-1 rounded text-purple-400">
              [2]
            </span>
            <Diamond className="w-6 h-6 mb-1 text-purple-400" />
            <span className="text-[11px] font-bold text-center leading-tight">Crystal Beam</span>
            <span className="text-[9px] text-purple-300 font-mono mt-0.5">35 DMG</span>
          </button>

          {/* Skill 3: Titan Overdrive Barrage */}
          <button
            onClick={() => triggerAttack(3)}
            disabled={cooldowns[3] || inventory.resources.titanCatalyst <= 0}
            className={`relative flex flex-col items-center justify-center w-24 h-24 rounded-2xl border transition-all ${
              inventory.resources.titanCatalyst > 0 && !cooldowns[3]
                ? 'bg-gradient-to-b from-amber-900/60 to-slate-900 border-amber-500/70 text-amber-300 hover:scale-105 shadow-lg shadow-amber-950/60 active:scale-95'
                : 'bg-slate-950 border-slate-800 text-slate-600 opacity-50 cursor-not-allowed'
            }`}
          >
            <span className="absolute top-1.5 left-2 text-[10px] font-mono bg-slate-950/80 px-1 rounded text-amber-400">
              [3]
            </span>
            <Flame className="w-6 h-6 mb-1 text-amber-400" />
            <span className="text-[11px] font-bold text-center leading-tight">Overdrive</span>
            <span className="text-[9px] text-amber-300 font-mono mt-0.5">45 DMG + Stun</span>
          </button>
        </div>

        <button
          onClick={onRestartBoss}
          className="mt-1 text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1.5 px-3 py-1 rounded-lg hover:bg-slate-800 transition"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Restart Boss Battle
        </button>
      </div>
    </div>
  );
};

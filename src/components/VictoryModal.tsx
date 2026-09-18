import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Trophy, Award, RefreshCw, Code2, Sparkles, CheckCircle2 } from 'lucide-react';
import { sound } from '../audio';

interface VictoryModalProps {
  onRestartGame: () => void;
  onOpenGodotFiles: () => void;
}

export const VictoryModal: React.FC<VictoryModalProps> = ({ onRestartGame, onOpenGodotFiles }) => {
  useEffect(() => {
    sound.playPuzzleSuccess();

    // Trigger celebratory confetti cannons
    const duration = 3.5 * 1000;
    const animationEnd = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 4,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#38bdf8', '#fbbf24', '#a855f7', '#34d399'],
      });
      confetti({
        particleCount: 4,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#38bdf8', '#fbbf24', '#a855f7', '#34d399'],
      });

      if (Date.now() < animationEnd) {
        requestAnimationFrame(frame);
      }
    };
    frame();
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in zoom-in-95 duration-300">
      <div className="relative w-full max-w-lg rounded-3xl bg-slate-900 border-2 border-amber-500/70 p-8 shadow-2xl text-center shadow-amber-950/60 text-slate-100">
        {/* Glow halo */}
        <div className="mx-auto w-24 h-24 rounded-full bg-gradient-to-tr from-amber-500 to-yellow-300 p-1 mb-5 shadow-[0_0_40px_rgba(245,158,11,0.5)]">
          <div className="w-full h-full rounded-full bg-slate-950 flex items-center justify-center text-amber-400">
            <Trophy className="w-12 h-12 animate-bounce" />
          </div>
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-950/80 border border-amber-500/50 text-amber-300 text-xs font-bold uppercase tracking-widest mb-3">
          <Sparkles className="w-3.5 h-3.5" /> Sovereign of the Citadel
        </div>

        <h1 className="text-3xl font-extrabold font-cinzel text-amber-300 tracking-wide mb-2">
          VICTORY ACHIEVED!
        </h1>
        <p className="text-slate-300 text-sm leading-relaxed mb-6">
          You navigated the Grand Gateway, crossed the celestial abyss, mastered all 3 engineering trials, collected the sacred keystones & resources, and vanquished The Chrono-Colossus!
        </p>

        {/* Quest summary accomplishments */}
        <div className="grid grid-cols-3 gap-2 bg-slate-950/80 p-3.5 rounded-2xl border border-slate-800 mb-6 text-xs">
          <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
            <span className="text-amber-400 font-bold block">Trial 1</span>
            <span className="text-slate-400">Power Matrix</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400 mx-auto mt-1" />
          </div>
          <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
            <span className="text-purple-400 font-bold block">Trial 2</span>
            <span className="text-slate-400">Harmonics</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400 mx-auto mt-1" />
          </div>
          <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
            <span className="text-cyan-400 font-bold block">Trial 3</span>
            <span className="text-slate-400">Hydraulics</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400 mx-auto mt-1" />
          </div>
        </div>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={onRestartGame}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-sm flex items-center justify-center gap-2 border border-slate-700 transition"
          >
            <RefreshCw className="w-4 h-4" /> Play Again
          </button>
          <button
            onClick={onOpenGodotFiles}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-950/50 transition active:scale-95"
          >
            <Code2 className="w-4 h-4" /> View Godot 4.x Code
          </button>
        </div>
      </div>
    </div>
  );
};

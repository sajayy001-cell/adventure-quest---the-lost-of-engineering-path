import React from 'react';
import { Play, Sparkles, Compass, Shield, Film, ArrowRight } from 'lucide-react';
import { sound } from '../audio';

interface StartScreenProps {
  onPlayCinematic: () => void;
  onStartDirectly: () => void;
  onOpenGodotFiles: () => void;
}

export const StartScreen: React.FC<StartScreenProps> = ({
  onPlayCinematic,
  onStartDirectly,
  onOpenGodotFiles,
}) => {
  const handlePlayCinematic = () => {
    sound.startCinematicAudio();
    onPlayCinematic();
  };

  const handleStartDirectly = () => {
    sound.playDialogueChime();
    onStartDirectly();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-4 animate-in fade-in duration-300">
      <div className="relative w-full max-w-2xl rounded-3xl bg-slate-900/95 border-2 border-slate-700/80 p-6 sm:p-10 shadow-2xl text-slate-100 text-center shadow-black/80">
        {/* Emblem */}
        <div className="mx-auto w-20 h-20 rounded-2xl bg-gradient-to-tr from-cyan-600 via-blue-600 to-indigo-600 p-0.5 shadow-xl shadow-cyan-950/60 mb-5">
          <div className="w-full h-full rounded-[14px] bg-slate-950 flex items-center justify-center text-cyan-400">
            <Compass className="w-10 h-10 animate-spin-slow" />
          </div>
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 text-xs font-bold uppercase tracking-widest mb-3">
          <Sparkles className="w-3.5 h-3.5" /> 3D Adventure Game & Cinematic Intro
        </div>

        <h1 className="text-3xl sm:text-4xl font-black font-cinzel tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-500 mb-3">
          TRIALS OF THE ARCHITECT
        </h1>

        <p className="text-slate-300 text-xs sm:text-sm max-w-lg mx-auto leading-relaxed mb-5">
          Experience the complete 30-second cinematic 3D adventure game intro featuring Arrival, The Guide, Grand Gateway, Gate Opening, and Bridge Reveal into the ancient world.
        </p>

        {/* 5-Scene Roadmap Visual */}
        <div className="bg-slate-950/70 p-4 rounded-2xl border border-slate-800 mb-6 text-left">
          <div className="text-[11px] uppercase tracking-widest font-bold text-slate-400 mb-2.5 flex items-center gap-1.5">
            <Film className="w-3.5 h-3.5 text-amber-400" /> 30-Second Cinematic Scene Breakdown:
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center text-[11px] font-mono">
            <div className="p-2 rounded bg-slate-800/80 border border-slate-700">
              <span className="text-amber-400 font-bold block">0s - 6s</span>
              <span className="text-slate-300 text-[10px]">1. Arrival</span>
            </div>
            <div className="p-2 rounded bg-slate-800/80 border border-slate-700">
              <span className="text-amber-400 font-bold block">6s - 13s</span>
              <span className="text-slate-300 text-[10px]">2. The Guide</span>
            </div>
            <div className="p-2 rounded bg-slate-800/80 border border-slate-700">
              <span className="text-amber-400 font-bold block">13s - 19s</span>
              <span className="text-slate-300 text-[10px]">3. Closed Gate</span>
            </div>
            <div className="p-2 rounded bg-slate-800/80 border border-slate-700">
              <span className="text-amber-400 font-bold block">19s - 25s</span>
              <span className="text-slate-300 text-[10px]">4. Gate Opens</span>
            </div>
            <div className="p-2 rounded bg-slate-800/80 border border-slate-700 col-span-2 sm:col-span-1">
              <span className="text-amber-400 font-bold block">25s - 30s</span>
              <span className="text-slate-300 text-[10px]">5. Bridge Reveal</span>
            </div>
          </div>
        </div>

        {/* Controls Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-7 text-xs">
          <div className="p-2.5 bg-slate-950/60 rounded-xl border border-slate-800">
            <div className="font-mono font-bold text-cyan-400">Timeline / Space</div>
            <div className="text-[11px] text-slate-400">Scrub & Play/Pause</div>
          </div>
          <div className="p-2.5 bg-slate-950/60 rounded-xl border border-slate-800">
            <div className="font-mono font-bold text-cyan-400">WASD / Keys</div>
            <div className="text-[11px] text-slate-400">Player Movement</div>
          </div>
          <div className="p-2.5 bg-slate-950/60 rounded-xl border border-slate-800">
            <div className="font-mono font-bold text-cyan-400">Mouse Drag</div>
            <div className="text-[11px] text-slate-400">Orbit Camera</div>
          </div>
          <div className="p-2.5 bg-slate-950/60 rounded-xl border border-slate-800">
            <div className="font-mono font-bold text-cyan-400">Director Cam</div>
            <div className="text-[11px] text-slate-400">Multi-Angle Views</div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            id="btn-play-cinematic-intro"
            onClick={handlePlayCinematic}
            className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-bold text-base flex items-center justify-center gap-2 shadow-xl shadow-amber-950/60 transition active:scale-95"
          >
            <Film className="w-5 h-5 text-slate-950" />
            <span>PLAY 30S CINEMATIC INTRO</span>
          </button>
          <button
            id="btn-start-gameplay-directly"
            onClick={handleStartDirectly}
            className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-sm flex items-center justify-center gap-2 border border-slate-700 transition active:scale-95"
          >
            <span>Play Game Directly</span>
            <ArrowRight className="w-4 h-4" />
          </button>
          <button
            onClick={onOpenGodotFiles}
            className="w-full sm:w-auto px-4 py-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 font-medium text-xs flex items-center justify-center gap-1.5 border border-slate-800 transition"
          >
            Godot 4.x Project (.ZIP)
          </button>
        </div>
      </div>
    </div>
  );
};


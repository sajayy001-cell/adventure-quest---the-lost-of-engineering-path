import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, Volume2, VolumeX, Eye, ArrowRight, Film, Sparkles, Compass } from 'lucide-react';
import { CameraDirectorMode } from '../types';

interface CinematicOverlayProps {
  currentTime: number;
  isPlaying: boolean;
  activeSceneId: number;
  onTogglePlay: () => void;
  onSeek: (time: number) => void;
  onReplay: () => void;
  onSkipToGame: () => void;
  onSetCameraMode: (mode: CameraDirectorMode) => void;
  cameraMode: CameraDirectorMode;
}

const SCENE_INFO = [
  { id: 1, start: 0, end: 6, title: 'SCENE 1 — ARRIVAL', desc: 'A lone male adventurer enters the ancient ruins amidst dense atmospheric fog and weathered stone megaliths.' },
  { id: 2, start: 6, end: 13, title: 'SCENE 2 — THE GUIDE', desc: 'A powerful celestial deity manifests before the adventurer, declaring the start of his trials.' },
  { id: 3, start: 13, end: 19, title: 'SCENE 3 — GRAND GATEWAY', desc: 'The adventurer approaches the closed monumental stone gateway with glowing runes, pillars, and braziers.' },
  { id: 4, start: 19, end: 25, title: 'SCENE 4 — GATE OPENS', desc: 'The gauntlet unleashes resonant power; the giant stone doors swing open with brilliant magical shockwaves.' },
  { id: 5, start: 25, end: 30, title: 'SCENE 5 — BRIDGE REVEAL', desc: 'A dramatic wide camera shot reveals the immense ancient bridge extending into the cosmic adventure world.' },
];

export const CinematicOverlay: React.FC<CinematicOverlayProps> = ({
  currentTime,
  isPlaying,
  activeSceneId,
  onTogglePlay,
  onSeek,
  onReplay,
  onSkipToGame,
  onSetCameraMode,
  cameraMode,
}) => {
  const [isMuted, setIsMuted] = useState(false);
  const [showControls, setShowControls] = useState(true);

  // Auto-hide controls during playback after inactivity, or keep visible on mouse move
  useEffect(() => {
    let timeout: NodeJS.Timeout;
    const handleActivity = () => {
      setShowControls(true);
      clearTimeout(timeout);
      if (isPlaying) {
        timeout = setTimeout(() => setShowControls(false), 4500);
      }
    };
    window.addEventListener('mousemove', handleActivity);
    return () => {
      window.removeEventListener('mousemove', handleActivity);
      clearTimeout(timeout);
    };
  }, [isPlaying]);

  // Spacebar toggle playback
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        onTogglePlay();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onTogglePlay]);

  const currentScene = SCENE_INFO.find((s) => s.id === activeSceneId) || SCENE_INFO[0];
  const progressPercent = Math.min(100, (currentTime / 30.0) * 100);

  return (
    <div className="pointer-events-none fixed inset-0 z-40 flex flex-col justify-between overflow-hidden select-none">
      {/* 1. TOP CINEMATIC LETTERBOX BAR */}
      <div className="w-full h-14 sm:h-20 bg-black/95 backdrop-blur-sm flex items-center justify-between px-4 sm:px-8 border-b border-white/5 transition-all duration-500">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-2.5 py-1 rounded bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold tracking-wider uppercase">
            <Film className="w-3.5 h-3.5" />
            <span>3D Cinematic Intro</span>
          </div>
          <span className="hidden sm:inline text-xs font-mono text-slate-400">
            {currentTime.toFixed(1)}s / 30.0s
          </span>
        </div>

        {/* Scene Tag in Header */}
        <div className="text-center">
          <h2 className="text-xs sm:text-sm font-semibold tracking-widest text-slate-200 uppercase">
            {currentScene.title}
          </h2>
        </div>

        {/* Top Right Actions */}
        <div className="pointer-events-auto flex items-center gap-2">
          <button
            id="btn-skip-intro"
            onClick={onSkipToGame}
            className="px-3.5 py-1.5 rounded-lg bg-cyan-600/80 hover:bg-cyan-500 text-white text-xs font-medium tracking-wide flex items-center gap-1.5 shadow-lg shadow-cyan-950 transition active:scale-95"
            title="Skip directly to playable adventure mode"
          >
            <span>Play Game</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 2. CENTER STAGE: SUBTITLES & CINEMATIC TITLE CARD */}
      <div className="flex-1 flex flex-col items-center justify-end pb-8 sm:pb-12 px-6">
        {/* Divine Dialogue Subtitle during Scene 2 (6s to 13s) */}
        {currentTime >= 6.2 && currentTime < 13.0 && (
          <div className="max-w-2xl text-center px-6 py-3 rounded-2xl bg-black/70 backdrop-blur-md border border-amber-500/30 shadow-2xl transition-all duration-300 animate-in fade-in">
            <div className="flex items-center justify-center gap-2 text-amber-400 text-xs font-semibold uppercase tracking-widest mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Aethelgard, Mystical Guide</span>
            </div>
            <p className="text-sm sm:text-base text-slate-100 font-medium italic leading-relaxed">
              &ldquo;Traveler... your journey has begun. You must conquer the ancient trials to breach the inner sanctum and face the Chrono-Colossus.&rdquo;
            </p>
          </div>
        )}

        {/* Gateway Closed / Sealed Subtitle during Scene 3 (13s to 19s) */}
        {currentTime >= 13.2 && currentTime < 18.8 && (
          <div className="max-w-xl text-center px-5 py-2.5 rounded-xl bg-black/60 backdrop-blur-md border border-cyan-500/20 shadow-xl transition-all duration-300 animate-in fade-in">
            <p className="text-xs sm:text-sm text-cyan-200/90 font-medium tracking-wide">
              The Grand Gateway stands sealed with ancient glyphs. The adventurer gathers celestial focus in his gauntlet...
            </p>
          </div>
        )}

        {/* Gate Activation & Opening Subtitle during Scene 4 (19s to 25s) */}
        {currentTime >= 19.2 && currentTime < 24.8 && (
          <div className="max-w-xl text-center px-5 py-2.5 rounded-xl bg-black/60 backdrop-blur-md border border-cyan-500/40 shadow-xl transition-all duration-300 animate-in fade-in">
            <p className="text-xs sm:text-sm text-cyan-100 font-medium tracking-wide">
              Ancient mechanisms resonate with light. The monumental stone doors unseal!
            </p>
          </div>
        )}

        {/* FINAL TITLE CARD: "THE ADVENTURE BEGINS" (27.2s to 30.0s) */}
        {currentTime >= 27.2 && (
          <div className="text-center px-8 py-6 rounded-3xl bg-black/80 backdrop-blur-lg border border-amber-400/40 shadow-2xl shadow-amber-950/80 animate-in zoom-in-95 duration-500 max-w-xl">
            <p className="text-xs uppercase tracking-[0.35em] text-cyan-400 font-semibold mb-2">
              CHRONO CITADEL: THE ANCIENT TRIALS
            </p>
            <h1 className="text-3xl sm:text-5xl font-black tracking-[0.2em] text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-100 to-amber-400 drop-shadow-md">
              THE ADVENTURE BEGINS
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-3 font-light tracking-wide">
              Cross the ancient bridge and conquer the 3 elemental trials.
            </p>
            <div className="pointer-events-auto mt-5 flex items-center justify-center gap-3">
              <button
                id="btn-start-adventure"
                onClick={onSkipToGame}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-bold text-sm tracking-wider flex items-center gap-2 shadow-lg shadow-amber-950 transition active:scale-95"
              >
                <span>ENTER ADVENTURE WORLD</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                id="btn-replay-card"
                onClick={onReplay}
                className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium text-sm flex items-center gap-1.5 transition active:scale-95"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Replay Video</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 3. BOTTOM CINEMATIC LETTERBOX BAR & CONTROLS */}
      <div className={`w-full bg-black/95 backdrop-blur-md px-4 sm:px-8 pt-3 pb-4 sm:pb-6 border-t border-white/5 transition-all duration-300 ${showControls ? 'opacity-100 translate-y-0' : 'opacity-30 hover:opacity-100 translate-y-0'}`}>
        {/* Timeline Slider with Chapter Markers */}
        <div className="relative mb-3.5 group">
          {/* Timeline background track */}
          <div className="relative h-2 w-full bg-slate-800/90 rounded-full overflow-hidden cursor-pointer">
            <div
              className="absolute left-0 top-0 bottom-0 bg-gradient-to-r from-cyan-500 via-amber-400 to-yellow-400 transition-all duration-75"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          {/* Interactive Native Range Slider on top */}
          <input
            type="range"
            id="cinematic-scrubber"
            min={0}
            max={30}
            step={0.05}
            value={currentTime}
            onChange={(e) => onSeek(parseFloat(e.target.value))}
            className="pointer-events-auto absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            title="Seek timeline"
          />

          {/* Scene Chapter Markers along track */}
          <div className="absolute top-3 left-0 right-0 flex justify-between pointer-events-none px-1">
            {SCENE_INFO.map((scene) => {
              const leftPercent = (scene.start / 30.0) * 100;
              const isActive = activeSceneId === scene.id;
              return (
                <div
                  key={scene.id}
                  style={{ left: `${leftPercent}%` }}
                  className="absolute -top-1.5 transform -translate-x-1/2 flex flex-col items-center"
                >
                  <div
                    className={`w-2.5 h-2.5 rounded-full border-2 transition ${
                      isActive ? 'bg-amber-400 border-white scale-125' : 'bg-slate-700 border-slate-500'
                    }`}
                  />
                  <span className="hidden sm:inline text-[9px] font-mono tracking-tighter text-slate-400 mt-1 uppercase">
                    {scene.title.split('—')[1]?.trim() || `S${scene.id}`}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Control Bar: Play/Pause, Scrubber, Camera Angle, Scenes, Audio */}
        <div className="pointer-events-auto flex items-center justify-between gap-3 pt-2">
          {/* Left Controls: Play/Pause, Replay, Timestamp */}
          <div className="flex items-center gap-2">
            <button
              id="btn-toggle-play"
              onClick={onTogglePlay}
              className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition active:scale-95 border border-white/10"
              title={isPlaying ? 'Pause (Space)' : 'Play (Space)'}
            >
              {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
            </button>

            <button
              id="btn-replay"
              onClick={onReplay}
              className="w-9 h-9 rounded-full bg-white/5 hover:bg-white/15 text-slate-300 hover:text-white flex items-center justify-center transition active:scale-95"
              title="Replay from start (0s)"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            <span className="text-xs font-mono text-slate-300 ml-1">
              00:{Math.floor(currentTime).toString().padStart(2, '0')} <span className="text-slate-500">/ 00:30</span>
            </span>
          </div>

          {/* Center Controls: Scene Jump Buttons */}
          <div className="hidden md:flex items-center gap-1.5 bg-slate-900/80 px-2.5 py-1 rounded-xl border border-white/10">
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mr-1">Scenes:</span>
            {SCENE_INFO.map((scene) => (
              <button
                key={scene.id}
                id={`btn-scene-${scene.id}`}
                onClick={() => onSeek(scene.start)}
                className={`px-2 py-0.5 rounded text-[11px] font-mono transition ${
                  activeSceneId === scene.id
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                }`}
                title={scene.desc}
              >
                {scene.id}. {scene.title.split('—')[1]?.trim()}
              </button>
            ))}
          </div>

          {/* Right Controls: Camera Director Switcher & Audio */}
          <div className="flex items-center gap-2">
            {/* Camera Angle Selector */}
            <div className="flex items-center gap-1 bg-slate-900/80 px-2 py-1 rounded-lg border border-white/10">
              <Compass className="w-3.5 h-3.5 text-cyan-400" />
              <select
                id="select-camera-mode"
                value={cameraMode}
                onChange={(e) => onSetCameraMode(e.target.value as CameraDirectorMode)}
                className="bg-transparent text-xs text-slate-200 focus:outline-none cursor-pointer pr-1"
                title="Select camera angle"
              >
                <option value="CINEMATIC" className="bg-slate-900 text-slate-200">Director Cam</option>
                <option value="FREE_ORBIT" className="bg-slate-900 text-slate-200">Free Orbit Cam</option>
                <option value="FIRST_PERSON" className="bg-slate-900 text-slate-200">First-Person View</option>
                <option value="WIDE_DRONE" className="bg-slate-900 text-slate-200">Wide Drone Vista</option>
              </select>
            </div>

            {/* Audio Toggle */}
            <button
              id="btn-toggle-audio"
              onClick={() => setIsMuted(!isMuted)}
              className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/15 text-slate-300 hover:text-white flex items-center justify-center transition"
              title={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted ? <VolumeX className="w-3.5 h-3.5 text-rose-400" /> : <Volume2 className="w-3.5 h-3.5 text-slate-300" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

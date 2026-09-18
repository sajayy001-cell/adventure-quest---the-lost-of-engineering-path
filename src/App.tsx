import React, { useEffect, useRef, useState, useCallback } from 'react';
import { GameEngine } from './game/GameEngine';
import { GamePhase, Inventory, PlayerStats, CameraDirectorMode } from './types';
import { HUD } from './components/HUD';
import { CinematicOverlay } from './components/CinematicOverlay';
import { DialogueModal } from './components/DialogueModal';
import { PuzzleModals } from './components/PuzzleModals';
import { BossFightUI } from './components/BossFightUI';
import { VictoryModal } from './components/VictoryModal';
import { StartScreen } from './components/StartScreen';
import { GodotExporterModal } from './components/GodotExporterModal';
import { sound } from './audio';
import { AlertCircle, RefreshCw } from 'lucide-react';

export default function App() {
  const containerRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<GameEngine | null>(null);

  // Core Game State - Starts directly with the 30-second Cinematic Intro
  const [gamePhase, setGamePhase] = useState<GamePhase>(GamePhase.CINEMATIC_INTRO);
  const [cinematicTime, setCinematicTime] = useState(0);
  const [isCinematicPlaying, setIsCinematicPlaying] = useState(true);
  const [cinematicSceneId, setCinematicSceneId] = useState(1);
  const [cameraMode, setCameraMode] = useState<CameraDirectorMode>('CINEMATIC');

  const [inventory, setInventory] = useState<Inventory>({
    keys: { sunKey: false, moonKey: false, starKey: false },
    resources: { aetherCore: 0, resonantCrystal: 0, titanCatalyst: 0 },
  });

  const [playerStats, setPlayerStats] = useState<PlayerStats>({
    health: 100,
    maxHealth: 100,
    stamina: 100,
    isGrounded: true,
    position: [0, 1.2, 20],
  });

  const [bossState, setBossState] = useState<{
    health: number;
    maxHealth: number;
    phase: string;
    attackName: string;
  }>({
    health: 100,
    maxHealth: 100,
    phase: 'idle',
    attackName: 'Idle',
  });

  // Modals & UI overlays
  const [activePuzzle, setActivePuzzle] = useState<1 | 2 | 3 | null>(null);
  const [showDialogue, setShowDialogue] = useState(false);
  const [showGodotModal, setShowGodotModal] = useState(false);
  const [noticeMsg, setNoticeMsg] = useState<string | null>(null);

  const showNotice = useCallback((msg: string) => {
    setNoticeMsg(msg);
    setTimeout(() => {
      setNoticeMsg((current) => (current === msg ? null : current));
    }, 3500);
  }, []);

  // Initialize 3D GameEngine
  useEffect(() => {
    if (!containerRef.current) return;

    const engine = new GameEngine(containerRef.current, {
      onPhaseChange: (phase) => {
        setGamePhase(phase);
      },
      onOpenDialogue: () => {
        setShowDialogue(true);
      },
      onOpenPuzzle: (level) => {
        setActivePuzzle(level);
      },
      onLockedNotice: (msg) => {
        showNotice(msg);
      },
      onBossStateChange: (state) => {
        setBossState(state);
      },
      onPlayerStatsChange: (stats) => {
        setPlayerStats(stats);
      },
      onCinematicTimeUpdate: (time, sceneId, isPlaying) => {
        setCinematicTime(time);
        setCinematicSceneId(sceneId);
        setIsCinematicPlaying(isPlaying);
      },
      onCinematicComplete: () => {
        // Keeps user on final screen with title card "THE ADVENTURE BEGINS" and call-to-action button
      },
    });

    engineRef.current = engine;

    return () => {
      engine.dispose();
      engineRef.current = null;
    };
  }, [showNotice]);

  // Sync inventory changes to 3D engine (e.g. barrier visibility, character backpack glow)
  useEffect(() => {
    if (engineRef.current) {
      engineRef.current.updateInventory(inventory);
    }
  }, [inventory]);

  // Cinematic Intro Controls
  const handleTogglePlayCinematic = () => {
    if (!engineRef.current) return;
    const nextPlaying = engineRef.current.togglePlayCinematic();
    setIsCinematicPlaying(nextPlaying);
  };

  const handleSeekCinematic = (time: number) => {
    if (!engineRef.current) return;
    engineRef.current.setCinematicTime(time);
    setCinematicTime(time);
  };

  const handleReplayCinematic = () => {
    if (!engineRef.current) return;
    setGamePhase(GamePhase.CINEMATIC_INTRO);
    engineRef.current.replayCinematic();
  };

  const handleSkipToGame = () => {
    if (!engineRef.current) return;
    engineRef.current.enterPlayableMode();
    setGamePhase(GamePhase.CROSSING_BRIDGE);
    showNotice('Welcome to the Ancient Adventure World! Cross the bridge and conquer the 3 trials.');
  };

  const handleSetCameraMode = (mode: CameraDirectorMode) => {
    setCameraMode(mode);
    engineRef.current?.setCameraMode(mode);
  };

  // Handle Starting Journey
  const handleStartJourney = () => {
    setGamePhase(GamePhase.EXPLORING_GATEWAY);
    setShowDialogue(true);
  };

  // Handle Solving Puzzles
  const handleSolvePuzzle = (level: 1 | 2 | 3) => {
    setActivePuzzle(null);

    setInventory((prev) => {
      const next = { ...prev, keys: { ...prev.keys }, resources: { ...prev.resources } };
      if (level === 1) {
        next.keys.sunKey = true;
        next.resources.aetherCore += 1;
        showNotice('Trial 1 Conquered! Sun Keystone & Aether Core Acquired. Path to Trial 2 Unlocked!');
        engineRef.current?.teleportToArea('puzzle_area');
      } else if (level === 2) {
        next.keys.moonKey = true;
        next.resources.resonantCrystal += 1;
        showNotice('Trial 2 Conquered! Moon Keystone & Resonant Crystal Acquired. Path to Trial 3 Unlocked!');
        engineRef.current?.teleportToArea('puzzle_area');
      } else if (level === 3) {
        next.keys.starKey = true;
        next.resources.titanCatalyst += 1;
        showNotice('Trial 3 Conquered! Star Keystone & Titan Catalyst Acquired. The Boss Barrier is Dissolved!');
      }
      return next;
    });
  };

  // Boss Attack using Resource
  const handleBossAttack = (type: 1 | 2 | 3) => {
    if (!engineRef.current) return;
    engineRef.current.attackBossWithResource(type);
  };

  // Restart handlers
  const handleRestartLevel = () => {
    if (engineRef.current) {
      engineRef.current.resetBossFight();
    }
    setGamePhase(GamePhase.FINAL_BOSS);
  };

  const handleRestartEntireGame = () => {
    setInventory({
      keys: { sunKey: false, moonKey: false, starKey: false },
      resources: { aetherCore: 0, resonantCrystal: 0, titanCatalyst: 0 },
    });
    setBossState({
      health: 100,
      maxHealth: 100,
      phase: 'idle',
      attackName: 'Idle',
    });
    if (engineRef.current) {
      engineRef.current.teleportToArea('gateway');
      engineRef.current.resetBossFight();
    }
    setGamePhase(GamePhase.EXPLORING_GATEWAY);
  };

  const handleTeleport = (area: 'gateway' | 'bridge' | 'puzzle_area' | 'boss') => {
    engineRef.current?.teleportToArea(area);
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#0a0e1a]">
      {/* 3D WebGL Canvas Viewport */}
      <div ref={containerRef} className="absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Crosshair / Reticle for 3D Camera (Only during gameplay, not cinematic) */}
      {gamePhase !== GamePhase.CINEMATIC_INTRO && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="w-1.5 h-1.5 rounded-full bg-cyan-400/50 ring-2 ring-cyan-400/20" />
        </div>
      )}

      {/* 30-SECOND CINEMATIC INTRO VIDEO OVERLAY */}
      {gamePhase === GamePhase.CINEMATIC_INTRO && (
        <CinematicOverlay
          currentTime={cinematicTime}
          isPlaying={isCinematicPlaying}
          activeSceneId={cinematicSceneId}
          onTogglePlay={handleTogglePlayCinematic}
          onSeek={handleSeekCinematic}
          onReplay={handleReplayCinematic}
          onSkipToGame={handleSkipToGame}
          onSetCameraMode={handleSetCameraMode}
          cameraMode={cameraMode}
        />
      )}

      {/* In-Game HUD (Always visible during gameplay) */}
      {gamePhase !== GamePhase.START_SCREEN && gamePhase !== GamePhase.CINEMATIC_INTRO && (
        <HUD
          currentPhase={gamePhase}
          inventory={inventory}
          playerStats={playerStats}
          onOpenGodotFiles={() => setShowGodotModal(true)}
          onTeleport={handleTeleport}
          onInteract={() => engineRef.current?.checkPlayerInteractions()}
          onReplayCinematic={handleReplayCinematic}
          noticeMsg={noticeMsg}
        />
      )}

      {/* START SCREEN */}
      {gamePhase === GamePhase.START_SCREEN && (
        <StartScreen
          onPlayCinematic={handleReplayCinematic}
          onStartDirectly={handleStartJourney}
          onOpenGodotFiles={() => setShowGodotModal(true)}
        />
      )}

      {/* GOD/GUIDE DIALOGUE MODAL */}
      {showDialogue && (
        <DialogueModal
          onClose={() => setShowDialogue(false)}
          onProceedToBridge={() => {
            engineRef.current?.teleportToArea('bridge');
          }}
        />
      )}

      {/* PUZZLE MODALS (Trial 1, 2, or 3) */}
      {activePuzzle !== null && (
        <PuzzleModals
          level={activePuzzle}
          onClose={() => setActivePuzzle(null)}
          onSolve={handleSolvePuzzle}
        />
      )}

      {/* FINAL BOSS COMBAT OVERLAY */}
      {gamePhase === GamePhase.FINAL_BOSS && (
        <BossFightUI
          bossState={bossState}
          inventory={inventory}
          onAttack={handleBossAttack}
          onRestartBoss={handleRestartLevel}
        />
      )}

      {/* GAME OVER MODAL */}
      {gamePhase === GamePhase.GAME_OVER && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="max-w-md w-full rounded-3xl bg-slate-900 border-2 border-rose-600/70 p-6 text-center shadow-2xl shadow-rose-950/60 text-slate-100">
            <div className="mx-auto w-16 h-16 rounded-full bg-rose-950 flex items-center justify-center text-rose-500 mb-4 border border-rose-600/50">
              <AlertCircle className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold font-cinzel text-rose-400 mb-2">TRIAL FAILED</h2>
            <p className="text-slate-300 text-xs sm:text-sm mb-6 leading-relaxed">
              Your mechanical construct sustained critical energy collapse. The citadel allows you to retry the current encounter.
            </p>
            <button
              onClick={handleRestartLevel}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-rose-950 transition active:scale-95"
            >
              <RefreshCw className="w-4 h-4" /> Restart Current Encounter
            </button>
          </div>
        </div>
      )}

      {/* VICTORY MODAL */}
      {gamePhase === GamePhase.VICTORY && (
        <VictoryModal
          onRestartGame={handleRestartEntireGame}
          onOpenGodotFiles={() => setShowGodotModal(true)}
        />
      )}

      {/* GODOT 4.X CODE EXPORTER MODAL */}
      {showGodotModal && (
        <GodotExporterModal onClose={() => setShowGodotModal(false)} />
      )}
    </div>
  );
}


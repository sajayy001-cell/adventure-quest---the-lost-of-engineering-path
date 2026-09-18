import React, { useState } from 'react';
import { sound } from '../audio';
import { 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  X, 
  Sliders, 
  HelpCircle, 
  Layers,
  ArrowRight,
  Sparkles,
  Zap,
  Key
} from 'lucide-react';

interface PuzzleModalProps {
  level: 1 | 2 | 3;
  onClose: () => void;
  onSolve: (level: 1 | 2 | 3) => void;
}

// -------------------------------------------------------------
// LEVEL 1: 3 MOVABLE BLOCKS / LEVERS (ENGINEERING MATRIX)
// Objective: Place/Activate 3 energy power blocks/levers into target positions
// Target Positions: Lever A -> HIGH (3), Lever B -> LOW (1), Lever C -> OPTIMAL (2)
// -------------------------------------------------------------
const L1_TARGET = [3, 1, 2]; // Levers 1, 2, 3

// -------------------------------------------------------------
// LEVEL 2: INTELLIGENCE QUESTION PUZZLE (3 ANSWER BUTTONS)
// Question: Celestial Engineering question with 3 answers
// -------------------------------------------------------------
interface QuestionData {
  question: string;
  context: string;
  options: { label: string; explanation: string; isCorrect: boolean }[];
}

const L2_QUESTIONS: QuestionData[] = [
  {
    question: "Which foundational engineering law governs the resonance frequency of a celestial harmonic prism?",
    context: "Ancient Citadel Archive • Codex of Waves",
    options: [
      {
        label: "A. The Law of Harmonic Superposition (f = v / 2L)",
        explanation: "Correct! Equalizing the wave phase allows celestial resonant energy to align.",
        isCorrect: true,
      },
      {
        label: "B. The Friction Dissipation Principle",
        explanation: "Incorrect: Mechanical friction dampens rather than harmonizes crystal energy.",
        isCorrect: false,
      },
      {
        label: "C. The Unbounded Entropy Expansion Constant",
        explanation: "Incorrect: Unbounded entropy would shatter the crystal structure.",
        isCorrect: false,
      },
    ],
  },
  {
    question: "To prevent thermal meltdown in the Titan's Overdrive Core, what valve ratio must balance intake and exhaust?",
    context: "Ancient Citadel Archive • Hydraulic Mechanics",
    options: [
      {
        label: "A. 1:1 Direct Symmetrical Flow",
        explanation: "Incorrect: Backpressure will build up in the catalytic chamber.",
        isCorrect: false,
      },
      {
        label: "B. 3:2 Inverse Differential Pressure Ratio",
        explanation: "Correct! The 3:2 ratio balances rapid intake compression with stable exhaust dissipation.",
        isCorrect: true,
      },
      {
        label: "C. Total Seal (0:0 Closed System)",
        explanation: "Incorrect: A sealed system causes catastrophic pressure explosion.",
        isCorrect: false,
      },
    ],
  }
];

// -------------------------------------------------------------
// LEVEL 3: INTERACTIVE FREQUENCY TUNER / GEAR ENIGMA
// A distinct interactive puzzle: 3 Runic Energy Rings that must be rotated
// until their alignment indices match the Citadel Key Alignment (0, 0, 0)
// -------------------------------------------------------------
const L3_TARGET_ALIGNMENT = [0, 0, 0];

export const PuzzleModals: React.FC<PuzzleModalProps> = ({ level, onClose, onSolve }) => {
  // ==========================================
  // Level 1 State: 3 Movable Blocks / Levers
  // ==========================================
  const [levers, setLevers] = useState<number[]>([1, 2, 3]); // Initial positions
  const [l1Status, setL1Status] = useState<'idle' | 'success' | 'failed'>('idle');

  const handleLeverChange = (index: number, val: number) => {
    sound.playPuzzleRotate();
    const next = [...levers];
    next[index] = val;
    setLevers(next);
    setL1Status('idle');
  };

  const handleCheckLevel1 = () => {
    const isCorrect = levers.every((val, idx) => val === L1_TARGET[idx]);
    if (isCorrect) {
      sound.playPuzzleSuccess();
      setL1Status('success');
      setTimeout(() => {
        onSolve(1);
      }, 1500);
    } else {
      sound.playFailure();
      setL1Status('failed');
    }
  };

  const handleResetLevel1 = () => {
    setLevers([1, 2, 3]);
    setL1Status('idle');
  };

  // ==========================================
  // Level 2 State: Intelligence Question Puzzle (3 Answer Buttons)
  // ==========================================
  const [qIndex, setQIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [l2Status, setL2Status] = useState<'idle' | 'success' | 'failed'>('idle');

  const currentQ = L2_QUESTIONS[qIndex];

  const handleSelectOption = (index: number) => {
    setSelectedOption(index);
    setL2Status('idle');
  };

  const handleCheckLevel2 = () => {
    if (selectedOption === null) return;
    const option = currentQ.options[selectedOption];

    if (option.isCorrect) {
      sound.playPuzzleSuccess();
      setL2Status('success');
      setTimeout(() => {
        onSolve(2);
      }, 1500);
    } else {
      sound.playFailure();
      setL2Status('failed');
    }
  };

  const handleResetLevel2 = () => {
    setSelectedOption(null);
    setL2Status('idle');
  };

  // ==========================================
  // Level 3 State: 3 Interactive Energy Cylinders (Gear Enigma)
  // ==========================================
  const [rings, setRings] = useState<number[]>([2, 5, 3]); // 8 positions each (0..7)
  const [l3Status, setL3Status] = useState<'idle' | 'success' | 'failed'>('idle');

  const rotateRing = (index: number, dir: 1 | -1) => {
    sound.playPuzzleRotate();
    setRings((prev) => {
      const next = [...prev];
      next[index] = (next[index] + dir + 8) % 8;
      return next;
    });
    setL3Status('idle');
  };

  const handleCheckLevel3 = () => {
    const isCorrect = rings.every((val, idx) => val === L3_TARGET_ALIGNMENT[idx]);
    if (isCorrect) {
      sound.playPuzzleSuccess();
      setL3Status('success');
      setTimeout(() => {
        onSolve(3);
      }, 1500);
    } else {
      sound.playFailure();
      setL3Status('failed');
    }
  };

  const handleResetLevel3 = () => {
    setRings([2, 5, 3]);
    setL3Status('idle');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl rounded-3xl bg-slate-900 border-2 border-slate-700 shadow-2xl p-6 text-slate-100 shadow-cyan-950/40">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-cyan-950/90 border border-cyan-500/40 text-cyan-400">
              {level === 1 && <Sliders className="w-6 h-6" />}
              {level === 2 && <HelpCircle className="w-6 h-6" />}
              {level === 3 && <Layers className="w-6 h-6" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-cyan-900/60 text-cyan-300 border border-cyan-500/30">
                  Engineering Trial {level}
                </span>
                <span className="text-xs text-amber-400 font-semibold">
                  {level === 1 && 'Unlocks Key 1 + Resource 1'}
                  {level === 2 && 'Unlocks Key 2 + Resource 2'}
                  {level === 3 && 'Unlocks Key 3 + Resource 3'}
                </span>
              </div>
              <h2 className="text-xl font-bold font-cinzel tracking-wide text-slate-100 mt-0.5">
                {level === 1 && 'Trial 1: Power Conductor Matrix'}
                {level === 2 && 'Trial 2: Intelligence of the Ancients'}
                {level === 3 && 'Trial 3: Celestial Runic Alignment'}
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ============================================================== */}
        {/* LEVEL 1: 3 MOVABLE BLOCKS / LEVERS */}
        {/* ============================================================== */}
        {level === 1 && (
          <div>
            {/* Objective Banner */}
            <div className="mb-5 p-3.5 rounded-2xl bg-slate-950/80 border border-cyan-500/30">
              <div className="text-xs uppercase font-bold text-cyan-400 tracking-wider mb-1 flex items-center gap-1.5">
                <Zap className="w-4 h-4" /> OBJECTIVE:
              </div>
              <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                Calibrate the 3 energy levers to the architect's power specification:{' '}
                <span className="text-amber-400 font-mono font-bold">Lever A: High (Pos 3)</span>,{' '}
                <span className="text-cyan-400 font-mono font-bold">Lever B: Low (Pos 1)</span>,{' '}
                <span className="text-emerald-400 font-mono font-bold">Lever C: Optimal (Pos 2)</span>.
              </p>
            </div>

            {/* 3 Levers UI */}
            <div className="grid grid-cols-3 gap-3 mb-5">
              {[
                { name: 'Lever A', label: 'Primary Conductor', color: 'cyan', target: 3 },
                { name: 'Lever B', label: 'Secondary Ground', color: 'amber', target: 1 },
                { name: 'Lever C', label: 'Harmonic Bridge', color: 'emerald', target: 2 },
              ].map((lever, idx) => (
                <div
                  key={lever.name}
                  className="p-4 bg-slate-950 rounded-2xl border border-slate-800 flex flex-col items-center text-center shadow-inner"
                >
                  <span className="text-xs font-bold text-slate-300 mb-0.5">{lever.name}</span>
                  <span className="text-[10px] text-slate-400 mb-3">{lever.label}</span>

                  {/* Vertical Lever Position Indicator */}
                  <div className="relative w-10 h-32 bg-slate-900 rounded-full border border-slate-700 flex flex-col justify-between items-center py-2 mb-3">
                    {[3, 2, 1].map((pos) => (
                      <div
                        key={pos}
                        className={`w-3 h-1.5 rounded-full ${levers[idx] === pos ? 'bg-cyan-400 shadow-[0_0_8px_#38bdf8]' : 'bg-slate-700'}`}
                      />
                    ))}

                    {/* Draggable/Clickable Handle */}
                    <div
                      className={`absolute w-8 h-8 rounded-full border-2 border-slate-900 flex items-center justify-center font-mono font-bold text-xs shadow-lg transition-all duration-200 ${
                        levers[idx] === 3
                          ? 'top-1 bg-amber-500 text-slate-950'
                          : levers[idx] === 2
                          ? 'top-12 bg-cyan-500 text-slate-950'
                          : 'bottom-1 bg-blue-600 text-white'
                      }`}
                    >
                      {levers[idx]}
                    </div>
                  </div>

                  {/* Position Selector Buttons */}
                  <div className="flex gap-1 w-full justify-center">
                    {[1, 2, 3].map((pos) => (
                      <button
                        key={pos}
                        onClick={() => handleLeverChange(idx, pos)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition ${
                          levers[idx] === pos
                            ? 'bg-cyan-600 text-white ring-2 ring-cyan-400'
                            : 'bg-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-700'
                        }`}
                      >
                        {pos}
                      </button>
                    ))}
                  </div>
                  <span className="text-[10px] text-slate-400 mt-1">
                    {levers[idx] === 3 ? 'High' : levers[idx] === 2 ? 'Optimal' : 'Low'}
                  </span>
                </div>
              ))}
            </div>

            {/* Win / Fail Feedback */}
            {l1Status === 'success' && (
              <div className="mb-4 p-4 rounded-2xl bg-emerald-950/80 border-2 border-emerald-500 text-emerald-200 flex items-center gap-3 animate-in zoom-in-95 duration-200">
                <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
                <div>
                  <div className="font-bold text-base text-emerald-300">LEVEL COMPLETE!</div>
                  <div className="text-xs text-emerald-200">
                    Awarded: <span className="font-bold">SUN KEYSTONE</span> + <span className="font-bold">AETHER CORE</span>. Path to Level 2 Unlocked!
                  </div>
                </div>
              </div>
            )}

            {l1Status === 'failed' && (
              <div className="mb-4 p-4 rounded-2xl bg-rose-950/80 border-2 border-rose-500 text-rose-200 flex items-center justify-between animate-in shake duration-200">
                <div className="flex items-center gap-3">
                  <AlertCircle className="w-6 h-6 text-rose-400 shrink-0" />
                  <div>
                    <div className="font-bold text-sm text-rose-300">WRONG - RESTART</div>
                    <div className="text-xs text-rose-200">Levers do not match the required power matrix. Check the objective.</div>
                  </div>
                </div>
                <button
                  onClick={handleResetLevel1}
                  className="px-3 py-1.5 rounded-xl bg-rose-800 hover:bg-rose-700 text-white font-semibold text-xs transition"
                >
                  Restart
                </button>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-800">
              <button
                onClick={handleResetLevel1}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition"
              >
                <RefreshCw className="w-4 h-4" /> Reset Levers
              </button>
              <button
                onClick={handleCheckLevel1}
                disabled={l1Status === 'success'}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 disabled:opacity-50 text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-cyan-950/60 transition active:scale-95"
              >
                <Zap className="w-4 h-4" /> Activate Matrix
              </button>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* LEVEL 2: INTELLIGENCE QUESTION PUZZLE (3 ANSWER BUTTONS) */}
        {/* ============================================================== */}
        {level === 2 && (
          <div>
            {/* Question Banner */}
            <div className="mb-4 p-4 rounded-2xl bg-slate-950/80 border border-purple-500/30">
              <div className="text-[10px] uppercase font-bold text-purple-400 tracking-wider mb-1 flex items-center gap-1.5">
                <HelpCircle className="w-3.5 h-3.5" /> {currentQ.context}
              </div>
              <h3 className="text-sm sm:text-base font-semibold text-slate-100 leading-snug">
                {currentQ.question}
              </h3>
            </div>

            {/* 3 Answer Buttons */}
            <div className="space-y-2.5 mb-5">
              {currentQ.options.map((opt, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSelectOption(idx)}
                  className={`w-full text-left p-4 rounded-2xl border transition-all text-xs sm:text-sm flex items-center justify-between ${
                    selectedOption === idx
                      ? 'bg-purple-950/70 border-purple-500 text-purple-100 shadow-lg shadow-purple-950/40'
                      : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-6 h-6 rounded-full border flex items-center justify-center font-bold text-xs shrink-0 ${
                        selectedOption === idx
                          ? 'border-purple-400 bg-purple-600 text-white'
                          : 'border-slate-700 bg-slate-800 text-slate-400'
                      }`}
                    >
                      {String.fromCharCode(65 + idx)}
                    </div>
                    <span>{opt.label}</span>
                  </div>
                  <div
                    className={`w-4 h-4 rounded-full border shrink-0 ${
                      selectedOption === idx ? 'border-purple-400 bg-purple-500' : 'border-slate-700'
                    }`}
                  />
                </button>
              ))}
            </div>

            {/* Win / Fail Feedback */}
            {l2Status === 'success' && (
              <div className="mb-4 p-4 rounded-2xl bg-emerald-950/80 border-2 border-emerald-500 text-emerald-200 flex items-center gap-3 animate-in zoom-in-95 duration-200">
                <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
                <div>
                  <div className="font-bold text-base text-emerald-300">LEVEL COMPLETE!</div>
                  <div className="text-xs text-emerald-200">
                    Awarded: <span className="font-bold">MOON KEYSTONE</span> + <span className="font-bold">RESONANT CRYSTAL</span>. Path to Level 3 Unlocked!
                  </div>
                </div>
              </div>
            )}

            {l2Status === 'failed' && (
              <div className="mb-4 p-4 rounded-2xl bg-rose-950/80 border-2 border-rose-500 text-rose-200 flex items-center justify-between animate-in shake duration-200">
                <div className="flex items-center gap-3">
                  <AlertCircle className="w-6 h-6 text-rose-400 shrink-0" />
                  <div>
                    <div className="font-bold text-sm text-rose-300">WRONG - RESTART</div>
                    <div className="text-xs text-rose-200">Incorrect theorem selected. The celestial archive rejects this answer.</div>
                  </div>
                </div>
                <button
                  onClick={handleResetLevel2}
                  className="px-3 py-1.5 rounded-xl bg-rose-800 hover:bg-rose-700 text-white font-semibold text-xs transition"
                >
                  Restart
                </button>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-800">
              <button
                onClick={handleResetLevel2}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition"
              >
                <RefreshCw className="w-4 h-4" /> Reset Answer
              </button>
              <button
                onClick={handleCheckLevel2}
                disabled={selectedOption === null || l2Status === 'success'}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:opacity-50 text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-purple-950/60 transition active:scale-95"
              >
                <span>Submit Answer</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* LEVEL 3: INTERACTIVE RUNIC ALIGNMENT (GEAR CYLINDERS) */}
        {/* ============================================================== */}
        {level === 3 && (
          <div>
            {/* Objective Banner */}
            <div className="mb-4 p-3.5 rounded-2xl bg-slate-950/80 border border-amber-500/30">
              <div className="text-[10px] uppercase font-bold text-amber-400 tracking-wider mb-1 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4" /> OBJECTIVE:
              </div>
              <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                Rotate the 3 celestial astral rings until all top alignment markers point to the golden zenith:{' '}
                <span className="text-amber-400 font-mono font-bold">Target Index: [0, 0, 0]</span>.
              </p>
            </div>

            {/* 3 Interactive Rings */}
            <div className="grid grid-cols-3 gap-3 mb-5">
              {['Aura Ring I', 'Chrono Ring II', 'Titan Ring III'].map((name, idx) => {
                const currentVal = rings[idx];
                const isAligned = currentVal === 0;

                return (
                  <div
                    key={name}
                    className={`p-4 rounded-2xl border flex flex-col items-center text-center shadow-inner transition-colors ${
                      isAligned
                        ? 'bg-amber-950/40 border-amber-500/50'
                        : 'bg-slate-950 border-slate-800'
                    }`}
                  >
                    <span className="text-xs font-bold text-slate-300 mb-2">{name}</span>

                    {/* Circular Runic Wheel Representation */}
                    <div className="relative w-20 h-20 rounded-full border-4 border-slate-800 bg-slate-900 flex items-center justify-center my-2 shadow-lg">
                      <div
                        className="w-16 h-16 rounded-full border-2 border-dashed border-amber-400/40 flex items-center justify-center transition-transform duration-300"
                        style={{ transform: `rotate(${currentVal * 45}deg)` }}
                      >
                        <div className="absolute -top-1 w-3 h-3 rounded-full bg-amber-400 shadow-[0_0_10px_#f59e0b]" />
                      </div>
                      <span className="font-mono text-sm font-bold text-amber-300">
                        {currentVal === 0 ? 'ZENITH' : `${currentVal}`}
                      </span>
                    </div>

                    {/* Ring rotation step controls */}
                    <div className="flex gap-2 mt-2 w-full justify-center">
                      <button
                        onClick={() => rotateRing(idx, -1)}
                        className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-bold transition"
                      >
                        ◀ -1
                      </button>
                      <button
                        onClick={() => rotateRing(idx, 1)}
                        className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-bold transition"
                      >
                        +1 ▶
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Win / Fail Feedback */}
            {l3Status === 'success' && (
              <div className="mb-4 p-4 rounded-2xl bg-emerald-950/80 border-2 border-emerald-500 text-emerald-200 flex items-center gap-3 animate-in zoom-in-95 duration-200">
                <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
                <div>
                  <div className="font-bold text-base text-emerald-300">LEVEL COMPLETE!</div>
                  <div className="text-xs text-emerald-200">
                    Awarded: <span className="font-bold">STAR KEYSTONE</span> + <span className="font-bold">TITAN CATALYST</span>. Boss Barrier Dissolved!
                  </div>
                </div>
              </div>
            )}

            {l3Status === 'failed' && (
              <div className="mb-4 p-4 rounded-2xl bg-rose-950/80 border-2 border-rose-500 text-rose-200 flex items-center justify-between animate-in shake duration-200">
                <div className="flex items-center gap-3">
                  <AlertCircle className="w-6 h-6 text-rose-400 shrink-0" />
                  <div>
                    <div className="font-bold text-sm text-rose-300">WRONG - RESTART</div>
                    <div className="text-xs text-rose-200">Astral rings misaligned. All 3 must reach Zenith (0).</div>
                  </div>
                </div>
                <button
                  onClick={handleResetLevel3}
                  className="px-3 py-1.5 rounded-xl bg-rose-800 hover:bg-rose-700 text-white font-semibold text-xs transition"
                >
                  Restart
                </button>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-800">
              <button
                onClick={handleResetLevel3}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition"
              >
                <RefreshCw className="w-4 h-4" /> Reset Rings
              </button>
              <button
                onClick={handleCheckLevel3}
                disabled={l3Status === 'success'}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-500 hover:to-yellow-500 disabled:opacity-50 text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-amber-950/60 transition active:scale-95"
              >
                <Key className="w-4 h-4" /> Align Keystone Matrix
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

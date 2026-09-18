import React, { useState } from 'react';
import { sound } from '../audio';
import { Sparkles, ArrowRight, Check } from 'lucide-react';

interface DialogueModalProps {
  onClose: () => void;
  onProceedToBridge: () => void;
}

const dialogueLines = [
  {
    speaker: 'Aethelgard',
    title: 'Architect of Trials',
    text: 'Welcome, mortal, to the Citadel of Celestial Trials. You stand above the infinite cosmic expanse where gods forged the foundational laws of engineering and logic.',
  },
  {
    speaker: 'Aethelgard',
    title: 'Architect of Trials',
    text: 'Ahead lies the Grand Gateway, spanning across the bridge to the three sacred trial pavilions. No brute force will serve you here; only intellect and engineering acumen shall open the way.',
  },
  {
    speaker: 'Aethelgard',
    title: 'Architect of Trials',
    text: 'Each trial you conquer bestows a KEY and a sacred RESOURCE:\n• Trial 1: Power Matrix → Sun Keystone + Aether Core\n• Trial 2: Harmonic Resonance → Moon Keystone + Resonant Crystal\n• Trial 3: Hydraulic Pressure → Star Keystone + Titan Catalyst',
  },
  {
    speaker: 'Aethelgard',
    title: 'Architect of Trials',
    text: 'The keystones will shatter the barriers blocking the next levels. And the resources? You must hoard them, for at the highest pinnacle waits The Chrono-Colossus, who can only be brought down by their harnessed power.',
  },
  {
    speaker: 'Aethelgard',
    title: 'Architect of Trials',
    text: 'Walk forward through the Gateway, traverse the stone bridge, and begin your first trial. The cosmos watches your every move!',
  },
];

export const DialogueModal: React.FC<DialogueModalProps> = ({ onClose, onProceedToBridge }) => {
  const [currentStep, setCurrentStep] = useState(0);

  const handleNext = () => {
    sound.playDialogueChime();
    if (currentStep < dialogueLines.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onProceedToBridge();
      onClose();
    }
  };

  const line = dialogueLines[currentStep];

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center pb-12 px-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-2xl rounded-3xl bg-slate-900/95 border-2 border-amber-500/50 shadow-2xl p-6 text-slate-100 shadow-amber-950/50">
        <div className="flex items-start gap-4">
          {/* Celestial Portrait Avatar */}
          <div className="relative shrink-0 w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-600 via-yellow-500 to-amber-300 p-0.5 shadow-lg shadow-amber-500/30">
            <div className="w-full h-full rounded-[14px] bg-slate-950 flex items-center justify-center text-amber-400">
              <Sparkles className="w-8 h-8 animate-pulse" />
            </div>
            <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-cyan-400 rounded-full border-2 border-slate-900 animate-ping" />
          </div>

          {/* Dialogue Text */}
          <div className="flex-1">
            <div className="flex items-baseline gap-2 mb-1">
              <h3 className="font-bold font-cinzel text-lg text-amber-400 tracking-wide">{line.speaker}</h3>
              <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold">({line.title})</span>
            </div>
            <p className="text-slate-200 text-sm sm:text-base leading-relaxed whitespace-pre-line min-h-[4.5rem]">
              {line.text}
            </p>
          </div>
        </div>

        {/* Footer Navigation */}
        <div className="mt-5 pt-3 border-t border-slate-800 flex items-center justify-between">
          <span className="text-xs font-mono text-slate-400">
            Speech {currentStep + 1} of {dialogueLines.length}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onProceedToBridge();
                onClose();
              }}
              className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              Skip
            </button>
            <button
              onClick={handleNext}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-bold text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-amber-900/40 transition active:scale-95"
            >
              {currentStep < dialogueLines.length - 1 ? (
                <>
                  Next <ArrowRight className="w-4 h-4" />
                </>
              ) : (
                <>
                  Understood <Check className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

import React, { useEffect, useState } from 'react';
import { CryptexLogo } from './CryptexLogo';

interface OpeningAnimationProps {
  onComplete: () => void;
}

export const OpeningAnimation: React.FC<OpeningAnimationProps> = ({ onComplete }) => {
  // Steps: 0 = dark/materialize, 1 = unlock rotation, 2 = cyan light burst, 3 = letters emerge, 4 = subtitle & finish
  const [step, setStep] = useState<number>(0);
  const [typedTitle, setTypedTitle] = useState<string>('');

  const fullTitle = 'CRYPTEX';

  useEffect(() => {
    // Step 0 -> Step 1: Materialize key & rotation click (at 400ms)
    const t1 = setTimeout(() => {
      setStep(1);
    }, 400);

    // Step 1 -> Step 2: Cyan light burst & key open (at 1000ms)
    const t2 = setTimeout(() => {
      setStep(2);
    }, 1000);

    // Step 2 -> Step 3: Letter typing generation (at 1400ms)
    const t3 = setTimeout(() => {
      setStep(3);
    }, 1400);

    // Step 4: Subtitles appear (at 2300ms)
    const t4 = setTimeout(() => {
      setStep(4);
    }, 2300);

    // Complete and transition (at 3000ms)
    const t5 = setTimeout(() => {
      onComplete();
    }, 3200);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
      clearTimeout(t5);
    };
  }, [onComplete]);

  // Letter by letter particle emergence effect
  useEffect(() => {
    if (step >= 3) {
      let idx = 0;
      const interval = setInterval(() => {
        idx++;
        setTypedTitle(fullTitle.slice(0, idx));
        if (idx >= fullTitle.length) {
          clearInterval(interval);
        }
      }, 100);
      return () => clearInterval(interval);
    }
  }, [step]);

  // Allow ESC key to skip
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onComplete();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#05070D] text-[#F5F7FA] overflow-hidden select-none">
      {/* Soft central cyan glow that bursts open */}
      <div
        className={`absolute rounded-full pointer-events-none transition-all duration-1000 ease-out ${
          step >= 2
            ? 'w-[500px] h-[500px] bg-[#00C8FF]/15 blur-[120px] scale-100'
            : 'w-[150px] h-[150px] bg-[#00C8FF]/5 blur-[60px] scale-50'
        }`}
      />

      {/* Main Center Stage */}
      <div className="relative z-10 flex flex-col items-center text-center px-6">
        {/* Animated Keyhole / Cryptographic Key */}
        <div
          className={`relative mb-8 transition-all duration-700 ease-out ${
            step === 0
              ? 'opacity-40 scale-75'
              : step === 1
              ? 'opacity-100 scale-105 rotate-45'
              : 'opacity-100 scale-100 rotate-0'
          }`}
        >
          {/* Subtle rotating halo */}
          <div
            className={`absolute -inset-4 rounded-full border border-[#00C8FF]/20 transition-all duration-1000 ${
              step >= 2 ? 'scale-125 opacity-100 animate-spin-slow' : 'opacity-0'
            }`}
          />

          <CryptexLogo size={64} glow={step >= 2} />
        </div>

        {/* Title emergence */}
        <div className="h-16 flex items-center justify-center">
          {step >= 3 ? (
            <h1 className="text-4xl sm:text-6xl font-black font-display tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-white via-[#F5F7FA] to-[#00C8FF] drop-shadow-[0_0_20px_rgba(0,200,255,0.4)]">
              {typedTitle}
              {typedTitle.length < fullTitle.length && (
                <span className="inline-block w-1.5 h-8 ml-1 bg-[#00C8FF] animate-pulse align-middle" />
              )}
            </h1>
          ) : (
            <div className="h-12" />
          )}
        </div>

        {/* Step 4: Subtitles */}
        <div
          className={`mt-4 space-y-2 transition-all duration-700 ${
            step >= 4
              ? 'opacity-100 translate-y-0'
              : 'opacity-0 translate-y-3 pointer-events-none'
          }`}
        >
          <div className="flex items-center justify-center gap-3 text-sm sm:text-base font-mono text-[#00C8FF] font-medium tracking-wide">
            <span>Plain Text</span>
            <span className="text-[#536DFF]">→</span>
            <span>Cipher Text</span>
          </div>

          <p className="text-xs sm:text-sm text-[#8B95A7] font-medium tracking-wider">
            Transform. Encrypt. Understand.
          </p>
        </div>
      </div>

      {/* Skip button in bottom corner */}
      <button
        onClick={onComplete}
        className="absolute bottom-8 text-xs font-mono text-[#8B95A7]/60 hover:text-[#00C8FF] transition-colors px-3 py-1.5 rounded-full hover:bg-white/5"
      >
        Press <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-white text-[10px]">ESC</kbd> or click to skip
      </button>
    </div>
  );
};

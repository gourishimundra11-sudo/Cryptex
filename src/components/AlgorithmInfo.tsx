import React, { useState } from 'react';
import { AlgorithmId } from '../types/crypto';
import { ALGORITHM_REGISTRY } from '../algorithms';
import { ChevronDown, ChevronUp, AlertTriangle, BookOpen, ShieldAlert, CheckCircle2 } from 'lucide-react';

interface AlgorithmInfoProps {
  algorithmId: AlgorithmId;
}

export const AlgorithmInfo: React.FC<AlgorithmInfoProps> = ({ algorithmId }) => {
  const [isOpen, setIsOpen] = useState<boolean>(true);
  const meta = ALGORITHM_REGISTRY[algorithmId];

  return (
    <div className="w-full rounded-xl bg-[#0A1224]/80 border border-[#00BFFF]/20 overflow-hidden shadow-md">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-4 flex items-center justify-between text-left hover:bg-white/5 transition-colors focus:outline-none"
      >
        <div className="flex items-center gap-3">
          <div className="p-1.5 rounded-lg bg-[#00BFFF]/10 text-[#00E5FF]">
            <BookOpen className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold font-mono text-white">
                HOW IT WORKS: {meta.name.toUpperCase()}
              </span>
              <span className="text-[11px] font-mono text-[#7D91A8] px-2 py-0.5 rounded bg-[#050914] border border-[#00BFFF]/15 hidden sm:inline">
                {meta.category}
              </span>
            </div>
            <p className="text-xs text-[#7D91A8]">Mathematical mechanics, cryptanalysis, and history</p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-[#7D91A8]">
          <span className="text-xs font-mono hidden sm:inline">{isOpen ? 'Hide' : 'Expand'}</span>
          {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>
      </button>

      {isOpen && (
        <div className="p-5 border-t border-[#00BFFF]/15 space-y-5 text-sm">
          {/* Overview & Key Concept */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-3.5 rounded-lg bg-[#050914]/80 border border-[#00BFFF]/15">
              <span className="text-xs font-mono text-[#00E5FF] font-semibold block mb-1">
                Overview & Mechanics
              </span>
              <p className="text-xs text-[#EAF6FF]/90 leading-relaxed">
                {meta.shortDescription}
              </p>
            </div>

            <div className="p-3.5 rounded-lg bg-[#050914]/80 border border-[#00BFFF]/15">
              <span className="text-xs font-mono text-[#39FF88] font-semibold block mb-1">
                Mathematical Foundation
              </span>
              <p className="text-xs text-[#EAF6FF]/90 leading-relaxed font-mono">
                {meta.keyConcept}
              </p>
              {meta.formula && (
                <div className="mt-2 text-xs font-mono text-[#00E5FF] bg-black/40 px-2 py-1 rounded inline-block">
                  {meta.formula}
                </div>
              )}
            </div>
          </div>

          {/* Historical Usage & Example */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-3.5 rounded-lg bg-[#050914]/80 border border-[#00BFFF]/15">
              <span className="text-xs font-mono text-[#7D91A8] font-semibold block mb-1">
                Historical Context & Origin
              </span>
              <p className="text-xs text-[#EAF6FF]/80 leading-relaxed">
                {meta.historicalUsage}
              </p>
            </div>

            <div className="p-3.5 rounded-lg bg-[#050914]/80 border border-[#00BFFF]/15">
              <span className="text-xs font-mono text-[#7D91A8] font-semibold block mb-1">
                Reference Transformation Example
              </span>
              <div className="text-xs font-mono space-y-1">
                <div>
                  <span className="text-[#7D91A8]">Plain: </span>
                  <span className="text-white">{meta.example.plain}</span>
                </div>
                {meta.example.key && (
                  <div>
                    <span className="text-[#7D91A8]">Key: </span>
                    <span className="text-[#00E5FF]">{meta.example.key}</span>
                  </div>
                )}
                <div>
                  <span className="text-[#7D91A8]">Cipher: </span>
                  <span className="text-[#39FF88] font-bold">{meta.example.cipher}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Mandatory Security Notice */}
          <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3">
            <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="text-xs font-mono font-bold text-amber-300 uppercase tracking-wider block">
                Security Notice — Educational Cryptography Only
              </span>
              <p className="text-xs text-amber-200/90 leading-relaxed">
                Caesar, Vigenère, Atbash, ROT13, Playfair, Hill, and transposition ciphers are primarily educational and classical techniques and should <strong className="text-amber-100 underline">NOT</strong> be used to protect sensitive real-world data. Modern systems require mathematically proven primitives like AES-256-GCM, RSA, ChaCha20, and SHA-256.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

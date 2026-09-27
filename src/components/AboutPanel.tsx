import React from 'react';
import { CryptexLogo } from './CryptexLogo';
import { Shield, Lock, Cpu, Sparkles, CheckCircle2 } from 'lucide-react';

export const AboutPanel: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto py-8 space-y-10 text-[#F5F7FA]">
      {/* Header */}
      <div className="flex flex-col items-center text-center space-y-4">
        <CryptexLogo size={56} glow={true} />
        <div>
          <h1 className="text-3xl sm:text-4xl font-black font-display tracking-wider text-white">
            CRYPTEX
          </h1>
          <p className="text-sm font-mono text-[#00C8FF] mt-1">
            Plain Text → Cipher Text
          </p>
        </div>
        <p className="text-sm sm:text-base text-[#8B95A7] max-w-xl leading-relaxed">
          An interactive classical cryptography playground crafted with the elegance of modern AI workspaces and the rigorous precision of cybersecurity laboratories.
        </p>
      </div>

      {/* Philosophy Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="p-6 rounded-2xl bg-[#0A0E1A] border border-[rgba(0,200,255,0.12)] space-y-3">
          <div className="w-9 h-9 rounded-xl bg-[#00C8FF]/10 text-[#00C8FF] flex items-center justify-center">
            <Lock className="w-5 h-5" />
          </div>
          <h3 className="text-base font-semibold font-display text-white">Classical Heritage</h3>
          <p className="text-xs text-[#8B95A7] leading-relaxed">
            From Julius Caesar’s military dispatches to Wheatstone’s Playfair matrix and Hill’s modular linear algebra, explore the foundational stepping stones of human ciphercraft.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-[#0A0E1A] border border-[rgba(0,200,255,0.12)] space-y-3">
          <div className="w-9 h-9 rounded-xl bg-[#00C8FF]/10 text-[#00C8FF] flex items-center justify-center">
            <Cpu className="w-5 h-5" />
          </div>
          <h3 className="text-base font-semibold font-display text-white">100% Local Sandboxing</h3>
          <p className="text-xs text-[#8B95A7] leading-relaxed">
            All transformations occur exclusively inside your web browser. No plaintexts or keys are ever logged or sent to any remote servers.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-[#0A0E1A] border border-[rgba(0,200,255,0.12)] space-y-3">
          <div className="w-9 h-9 rounded-xl bg-[#00C8FF]/10 text-[#00C8FF] flex items-center justify-center">
            <Shield className="w-5 h-5" />
          </div>
          <h3 className="text-base font-semibold font-display text-white">Educational Disclaimer</h3>
          <p className="text-xs text-[#8B95A7] leading-relaxed">
            Classical ciphers are preserved for mathematical study and cryptanalysis. Real-world sensitive data should strictly use certified modern primitives like AES-256-GCM.
          </p>
        </div>
      </div>

      {/* Specifications list */}
      <div className="p-6 rounded-2xl bg-[#0A0E1A] border border-[rgba(0,200,255,0.12)] space-y-4">
        <h4 className="text-sm font-mono font-semibold text-[#00C8FF] uppercase tracking-wider">
          Architecture & Standards
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono text-[#8B95A7]">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#00C8FF]" />
            <span>10 Verified Classical Ciphers</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#00C8FF]" />
            <span>Web Crypto API (SubtleCrypto)</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#00C8FF]" />
            <span>Shannon Entropy & IoC Analysis</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#00C8FF]" />
            <span>Local Storage Session Audit Trail</span>
          </div>
        </div>
      </div>
    </div>
  );
};

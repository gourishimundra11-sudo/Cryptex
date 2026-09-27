import React from 'react';
import { Shield, Lock, Terminal, ArrowRight, Key, Cpu, Zap, Eye, CheckCircle2 } from 'lucide-react';

interface LandingScreenProps {
  onEnter: () => void;
}

export const LandingScreen: React.FC<LandingScreenProps> = ({ onEnter }) => {
  return (
    <div className="relative min-h-screen w-full flex flex-col justify-between bg-[#050914] text-[#EAF6FF] overflow-hidden cyber-grid">
      {/* Background glow effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#00BFFF]/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-[350px] h-[350px] bg-[#00E5FF]/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute top-10 right-10 w-[300px] h-[300px] bg-[#39FF88]/5 rounded-full blur-[90px] pointer-events-none" />

      {/* Scanline overlay */}
      <div className="scanline-overlay absolute inset-0 opacity-20 pointer-events-none" />

      {/* Top micro bar */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded border border-[#00BFFF]/40 bg-[#0A1224] flex items-center justify-center text-[#00E5FF]">
            <Lock className="w-4 h-4" />
          </div>
          <span className="font-display font-bold tracking-widest text-lg text-white">CRYPTEX</span>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-[#39FF88] px-3 py-1 rounded bg-[#0A1224]/80 border border-[#39FF88]/30">
          <span className="w-2 h-2 rounded-full bg-[#39FF88] animate-pulse" />
          <span>CRYPTO ENGINE READY</span>
        </div>
      </div>

      {/* Main Hero Section */}
      <main className="relative z-10 w-full max-w-5xl mx-auto px-6 py-12 flex flex-col items-center text-center">
        {/* Monogram / Cipher Lock Icon */}
        <div className="relative mb-8 group cursor-pointer" onClick={onEnter}>
          <div className="w-24 h-24 rounded-2xl bg-[#0A1224]/90 border-2 border-[#00BFFF]/50 flex items-center justify-center text-[#00E5FF] shadow-[0_0_35px_rgba(0,191,255,0.25)] group-hover:border-[#00E5FF] group-hover:shadow-[0_0_50px_rgba(0,229,255,0.4)] transition-all duration-300">
            <div className="relative">
              <Key className="w-10 h-10 text-[#00E5FF]" />
              <Shield className="w-6 h-6 text-[#39FF88] absolute -bottom-1 -right-1" />
            </div>
          </div>
          {/* Subtle concentric rings */}
          <div className="absolute -inset-2 rounded-2xl border border-[#00BFFF]/20 animate-pulse pointer-events-none" />
        </div>

        {/* Main Title */}
        <h1 className="text-5xl sm:text-7xl lg:text-8xl font-black font-display tracking-tight text-white mb-4">
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-[#EAF6FF] to-[#00E5FF]">
            CRYPTEX
          </span>
        </h1>

        {/* Subtitle */}
        <div className="flex items-center gap-3 text-lg sm:text-2xl font-mono text-[#00E5FF] font-semibold mb-4 tracking-wide">
          <span>Plain Text</span>
          <span className="text-[#39FF88] animate-pulse">→</span>
          <span>Cipher Text</span>
        </div>

        {/* Supporting texts */}
        <p className="text-base sm:text-lg text-[#7D91A8] max-w-2xl mb-2 font-medium">
          “Encode. Transform. Understand Cryptography.”
        </p>
        <p className="text-sm sm:text-base text-[#7D91A8]/80 max-w-xl mb-10">
          Transform messages through the fascinating world of classical cryptography.
          Explore substitution, transposition, matrix, and mathematical ciphers with live step-by-step visual transformations.
        </p>

        {/* Prominent Animated Button */}
        <button
          onClick={onEnter}
          className="group relative inline-flex items-center gap-3 px-8 py-4 rounded-xl text-base sm:text-lg font-bold font-mono tracking-wider text-black bg-gradient-to-r from-[#00BFFF] to-[#00E5FF] hover:from-[#00E5FF] hover:to-[#39FF88] shadow-[0_0_30px_rgba(0,191,255,0.4)] hover:shadow-[0_0_40px_rgba(57,255,136,0.5)] transition-all duration-300 transform hover:-translate-y-0.5 active:translate-y-0 focus:outline-none"
        >
          <span>ENTER CRYPTEX</span>
          <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
        </button>

        {/* Key Features Preview Badges */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mt-14 w-full max-w-3xl">
          <div className="p-3 rounded-lg bg-[#0A1224]/80 border border-[#00BFFF]/15 text-left">
            <div className="flex items-center gap-2 text-[#00E5FF] mb-1">
              <Terminal className="w-4 h-4" />
              <span className="text-xs font-mono font-semibold">10 Classical Ciphers</span>
            </div>
            <p className="text-[11px] text-[#7D91A8]">Caesar, Vigenère, Playfair, Hill, Transposition, & more</p>
          </div>

          <div className="p-3 rounded-lg bg-[#0A1224]/80 border border-[#00BFFF]/15 text-left">
            <div className="flex items-center gap-2 text-[#39FF88] mb-1">
              <Eye className="w-4 h-4" />
              <span className="text-xs font-mono font-semibold">Live Visualizer</span>
            </div>
            <p className="text-[11px] text-[#7D91A8]">Step-by-step mathematical & matrix transformations</p>
          </div>

          <div className="p-3 rounded-lg bg-[#0A1224]/80 border border-[#00BFFF]/15 text-left">
            <div className="flex items-center gap-2 text-[#00E5FF] mb-1">
              <Cpu className="w-4 h-4" />
              <span className="text-xs font-mono font-semibold">Crypto Lab</span>
            </div>
            <p className="text-[11px] text-[#7D91A8]">Brute-force cracker, frequency & entropy analysis</p>
          </div>

          <div className="p-3 rounded-lg bg-[#0A1224]/80 border border-[#00BFFF]/15 text-left">
            <div className="flex items-center gap-2 text-[#39FF88] mb-1">
              <CheckCircle2 className="w-4 h-4" />
              <span className="text-xs font-mono font-semibold">100% Client-Side</span>
            </div>
            <p className="text-[11px] text-[#7D91A8]">Zero network requests. Local browser sandboxing</p>
          </div>
        </div>
      </main>

      {/* Small Footer Text */}
      <footer className="relative z-10 w-full border-t border-[#00BFFF]/10 bg-[#050914]/80 px-6 py-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-xs font-mono text-[#7D91A8]">
          <span className="tracking-wider text-[#00E5FF]/90 font-medium">
            LOCAL PROCESSING • EDUCATIONAL CRYPTOGRAPHY LAB
          </span>
          <span className="text-[11px]">
            Designed for cryptography students, cybersecurity professionals, and puzzle enthusiasts
          </span>
        </div>
      </footer>
    </div>
  );
};

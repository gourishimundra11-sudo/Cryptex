import React, { useState } from 'react';
import { AlgorithmId, AlgorithmCategory } from '../types/crypto';
import { ALGORITHM_REGISTRY } from '../algorithms';
import { BookOpen, ArrowRight, ShieldAlert, Cpu, CheckCircle2, Lock } from 'lucide-react';

interface AlgorithmsLibraryProps {
  onSelectAlgorithm: (id: AlgorithmId) => void;
}

export const AlgorithmsLibrary: React.FC<AlgorithmsLibraryProps> = ({
  onSelectAlgorithm,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const algorithms = Object.values(ALGORITHM_REGISTRY);

  const categories = [
    { id: 'all', label: 'All Methods' },
    { id: 'Monoalphabetic Substitution', label: 'Monoalphabetic' },
    { id: 'Polyalphabetic Substitution', label: 'Polyalphabetic' },
    { id: 'Polygraphic / Matrix', label: 'Polygraphic / Matrix' },
    { id: 'Transposition / Permutation', label: 'Transposition' },
    { id: 'Mathematical', label: 'Mathematical' },
  ];

  const filtered = selectedCategory === 'all'
    ? algorithms
    : algorithms.filter((a) => a.category === selectedCategory);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="pb-4 border-b border-[#00BFFF]/20">
        <div className="flex items-center gap-2 mb-1">
          <div className="p-1.5 rounded-lg bg-[#00BFFF]/10 text-[#00E5FF]">
            <BookOpen className="w-5 h-5" />
          </div>
          <h2 className="text-xl sm:text-2xl font-bold font-display tracking-tight text-white">
            CRYPTOGRAPHIC ALGORITHMS DIRECTORY
          </h2>
        </div>
        <p className="text-xs sm:text-sm text-[#7D91A8]">
          Explore the architectural concepts, mathematical formulas, and historical origins of all 10 classical ciphers
        </p>
      </div>

      {/* Category Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-mono font-medium whitespace-nowrap transition-all ${
              selectedCategory === cat.id
                ? 'bg-[#00BFFF] text-black font-bold shadow-[0_0_12px_rgba(0,191,255,0.4)]'
                : 'bg-[#0A1224] text-[#7D91A8] hover:text-white border border-[#00BFFF]/15'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Algorithms Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filtered.map((algo) => (
          <div
            key={algo.id}
            className="p-5 rounded-xl bg-[#0A1224] border border-[#00BFFF]/20 hover:border-[#00BFFF]/50 hover:box-glow-blue transition-all flex flex-col justify-between space-y-4"
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-base font-bold font-mono text-white flex items-center gap-2">
                    <span>{algo.name}</span>
                  </h3>
                  <span className="text-[11px] font-mono text-[#00E5FF] mt-0.5 block">
                    {algo.category}
                  </span>
                </div>
                <span
                  className={`text-[10px] font-mono px-2 py-0.5 rounded shrink-0 border ${
                    algo.modernSecurityStatus === 'Broken / Trivial'
                      ? 'bg-red-500/10 text-red-400 border-red-500/20'
                      : algo.modernSecurityStatus === 'Insecure / Educational Only'
                      ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                      : 'bg-orange-500/10 text-orange-400 border-orange-500/20'
                  }`}
                >
                  {algo.modernSecurityStatus}
                </span>
              </div>

              <p className="text-xs text-[#EAF6FF]/90 leading-relaxed">
                {algo.shortDescription}
              </p>

              <div className="p-3 rounded-lg bg-[#050914] border border-[#00BFFF]/15 space-y-1.5 font-mono text-xs">
                <div>
                  <span className="text-[#7D91A8] text-[11px]">Key Concept: </span>
                  <span className="text-[#39FF88]">{algo.keyConcept}</span>
                </div>
                {algo.formula && (
                  <div>
                    <span className="text-[#7D91A8] text-[11px]">Formula: </span>
                    <span className="text-[#00E5FF]">{algo.formula}</span>
                  </div>
                )}
                <div>
                  <span className="text-[#7D91A8] text-[11px]">History: </span>
                  <span className="text-[#EAF6FF]/80 text-[11px]">{algo.historicalUsage}</span>
                </div>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between border-t border-[#00BFFF]/10">
              <div className="text-[11px] font-mono text-[#7D91A8]">
                Example: <span className="text-white">{algo.example.plain}</span> → <span className="text-[#39FF88]">{algo.example.cipher}</span>
              </div>
              <button
                onClick={() => onSelectAlgorithm(algo.id)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#00BFFF]/15 border border-[#00BFFF]/30 text-[#00E5FF] hover:bg-[#00BFFF] hover:text-black font-mono text-xs font-semibold transition-all group"
              >
                <span>Launch</span>
                <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

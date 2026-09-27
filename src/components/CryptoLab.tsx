import React, { useState } from 'react';
import {
  computeFrequencyAnalysis,
  calculateShannonEntropy,
  calculateIndexOfCoincidence,
  bruteForceCaesar,
  ENGLISH_FREQ,
} from '../algorithms/analysis';
import { Cpu, Search, BarChart3, Binary, Lock, RefreshCw, Key, ShieldCheck, Zap } from 'lucide-react';

interface CryptoLabProps {
  currentPlaintext: string;
  currentCiphertext: string;
  onApplyCiphertextToPlaintext?: (text: string) => void;
}

export const CryptoLab: React.FC<CryptoLabProps> = ({
  currentPlaintext,
  currentCiphertext,
  onApplyCiphertextToPlaintext,
}) => {
  const [labText, setLabText] = useState<string>(
    currentCiphertext || 'JGNNQ MEET ME AT 10 PM'
  );
  const [activeTool, setActiveTool] = useState<
    'bruteforce' | 'frequency' | 'shiftexplorer' | 'entropy' | 'ioc' | 'strength'
  >('bruteforce');

  // Interactive shift explorer state
  const [interactiveShift, setInteractiveShift] = useState<number>(3);

  // Analysis calculations
  const bruteForceResults = bruteForceCaesar(labText);
  const freqAnalysis = computeFrequencyAnalysis(labText);
  const entropyAnalysis = calculateShannonEntropy(labText);
  const iocAnalysis = calculateIndexOfCoincidence(labText);

  // Shift explorer generator
  const getShiftedAlphabet = (shift: number) => {
    return Array.from({ length: 26 }, (_, i) => String.fromCharCode(65 + ((i + shift) % 26)));
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#00BFFF]/20">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="p-1.5 rounded-lg bg-[#00BFFF]/10 text-[#00E5FF]">
              <Cpu className="w-5 h-5" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold font-display tracking-tight text-white">
              CRYPTO LAB
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-[#7D91A8]">
            Interactive cryptanalysis, entropy measurement, and frequency attack simulations
          </p>
        </div>

        {/* Sync with main workspace button */}
        {currentCiphertext && currentCiphertext !== labText && (
          <button
            onClick={() => setLabText(currentCiphertext)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-mono font-medium text-[#00E5FF] bg-[#00BFFF]/10 border border-[#00BFFF]/30 hover:bg-[#00BFFF]/20 transition-all self-start md:self-auto"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Load Active Ciphertext ({currentCiphertext.length} chars)</span>
          </button>
        )}
      </div>

      {/* Target Ciphertext Input for Analysis */}
      <div className="p-4 rounded-xl bg-[#0A1224] border border-[#00BFFF]/20 space-y-2">
        <div className="flex items-center justify-between text-xs font-mono">
          <span className="text-[#00E5FF] font-semibold">LAB SAMPLE INPUT / TARGET CIPHERTEXT</span>
          <span className="text-[#7D91A8]">{labText.length} characters</span>
        </div>
        <textarea
          value={labText}
          onChange={(e) => setLabText(e.target.value)}
          placeholder="Paste or type ciphertext to analyze..."
          rows={2}
          className="w-full p-3 rounded-lg bg-[#050914] border border-[#00BFFF]/20 text-[#EAF6FF] font-mono text-sm focus:outline-none focus:border-[#00BFFF] transition-all resize-y"
        />
        <div className="flex items-center justify-between text-[11px] text-[#7D91A8]">
          <span>Demonstrating classical cryptanalytic techniques strictly on local educational samples</span>
          <button
            onClick={() => setLabText('JGNNQ YQTNF MEET ME AT TWELVE PM')}
            className="text-[#00E5FF] hover:underline font-mono"
          >
            Load Sample (Caesar Shift = 2)
          </button>
        </div>
      </div>

      {/* Tool Selector Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        <button
          onClick={() => setActiveTool('bruteforce')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-mono font-medium whitespace-nowrap transition-all ${
            activeTool === 'bruteforce'
              ? 'bg-[#00BFFF] text-black font-bold shadow-[0_0_15px_rgba(0,191,255,0.4)]'
              : 'bg-[#0A1224] text-[#7D91A8] hover:text-white border border-[#00BFFF]/15'
          }`}
        >
          <Search className="w-3.5 h-3.5" />
          <span>Brute-Force Simulator</span>
        </button>

        <button
          onClick={() => setActiveTool('frequency')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-mono font-medium whitespace-nowrap transition-all ${
            activeTool === 'frequency'
              ? 'bg-[#00BFFF] text-black font-bold shadow-[0_0_15px_rgba(0,191,255,0.4)]'
              : 'bg-[#0A1224] text-[#7D91A8] hover:text-white border border-[#00BFFF]/15'
          }`}
        >
          <BarChart3 className="w-3.5 h-3.5" />
          <span>Frequency Analysis</span>
        </button>

        <button
          onClick={() => setActiveTool('shiftexplorer')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-mono font-medium whitespace-nowrap transition-all ${
            activeTool === 'shiftexplorer'
              ? 'bg-[#00BFFF] text-black font-bold shadow-[0_0_15px_rgba(0,191,255,0.4)]'
              : 'bg-[#0A1224] text-[#7D91A8] hover:text-white border border-[#00BFFF]/15'
          }`}
        >
          <Key className="w-3.5 h-3.5" />
          <span>Caesar Shift Explorer</span>
        </button>

        <button
          onClick={() => setActiveTool('ioc')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-mono font-medium whitespace-nowrap transition-all ${
            activeTool === 'ioc'
              ? 'bg-[#00BFFF] text-black font-bold shadow-[0_0_15px_rgba(0,191,255,0.4)]'
              : 'bg-[#0A1224] text-[#7D91A8] hover:text-white border border-[#00BFFF]/15'
          }`}
        >
          <Binary className="w-3.5 h-3.5" />
          <span>Vigenère & IoC Concept</span>
        </button>

        <button
          onClick={() => setActiveTool('entropy')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-mono font-medium whitespace-nowrap transition-all ${
            activeTool === 'entropy'
              ? 'bg-[#00BFFF] text-black font-bold shadow-[0_0_15px_rgba(0,191,255,0.4)]'
              : 'bg-[#0A1224] text-[#7D91A8] hover:text-white border border-[#00BFFF]/15'
          }`}
        >
          <Zap className="w-3.5 h-3.5" />
          <span>Shannon Entropy</span>
        </button>

        <button
          onClick={() => setActiveTool('strength')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-mono font-medium whitespace-nowrap transition-all ${
            activeTool === 'strength'
              ? 'bg-[#00BFFF] text-black font-bold shadow-[0_0_15px_rgba(0,191,255,0.4)]'
              : 'bg-[#0A1224] text-[#7D91A8] hover:text-white border border-[#00BFFF]/15'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Cipher Strength Matrix</span>
        </button>
      </div>

      {/* 1. BRUTE-FORCE SIMULATOR */}
      {activeTool === 'bruteforce' && (
        <div className="p-5 rounded-xl bg-[#0A1224] border border-[#00BFFF]/20 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-sm font-semibold font-mono text-white">
                EXHAUSTIVE KEY SEARCH (25 SHIFTS)
              </h3>
              <p className="text-xs text-[#7D91A8]">
                Testing all 25 possible Caesar shifts simultaneously with dictionary word detection
              </p>
            </div>
            {bruteForceResults[0] && bruteForceResults[0].score > 0 && (
              <div className="flex items-center gap-2 px-3 py-1 rounded bg-[#39FF88]/10 border border-[#39FF88]/30 text-xs font-mono text-[#39FF88]">
                <span>TOP MATCH: SHIFT #{bruteForceResults[0].shift}</span>
                <span className="text-[10px] bg-[#39FF88]/20 px-1.5 rounded">
                  Score: {bruteForceResults[0].score}
                </span>
              </div>
            )}
          </div>

          <div className="overflow-y-auto max-h-[450px] space-y-2 pr-1">
            {bruteForceResults.map((res, idx) => {
              const isTop = idx === 0 && res.score > 0;
              return (
                <div
                  key={res.shift}
                  className={`p-3 rounded-lg border font-mono text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all ${
                    isTop
                      ? 'bg-[#39FF88]/10 border-[#39FF88]/40 shadow-sm'
                      : 'bg-[#050914] border-[#00BFFF]/15 text-[#7D91A8]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`w-14 shrink-0 font-bold ${
                        isTop ? 'text-[#39FF88]' : 'text-[#00E5FF]'
                      }`}
                    >
                      Shift {res.shift.toString().padStart(2, '0')}:
                    </span>
                    <span className={`text-sm break-all ${isTop ? 'text-white font-semibold' : 'text-[#EAF6FF]/80'}`}>
                      {res.decryptedText}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    {res.matchedWords.length > 0 && (
                      <div className="flex items-center gap-1">
                        {res.matchedWords.slice(0, 3).map((w, i) => (
                          <span
                            key={i}
                            className="px-1.5 py-0.5 rounded bg-[#00BFFF]/20 text-[#00E5FF] text-[10px]"
                          >
                            {w}
                          </span>
                        ))}
                      </div>
                    )}
                    <span className="text-[11px] text-[#7D91A8]">
                      Score: <strong className={isTop ? 'text-[#39FF88]' : 'text-white'}>{res.score}</strong>
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 2. FREQUENCY ANALYSIS */}
      {activeTool === 'frequency' && (
        <div className="p-5 rounded-xl bg-[#0A1224] border border-[#00BFFF]/20 space-y-5">
          <div>
            <h3 className="text-sm font-semibold font-mono text-white">
              LETTER FREQUENCY COMPARISON
            </h3>
            <p className="text-xs text-[#7D91A8]">
              Target Text ({freqAnalysis.totalLetters} alphabetic characters) vs Standard English baseline (ETAOIN SHRDLU)
            </p>
          </div>

          <div className="space-y-2">
            {freqAnalysis.frequencies.slice(0, 10).map((item) => (
              <div key={item.letter} className="space-y-1 font-mono text-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-5 text-white font-bold">{item.letter}</span>
                    <span className="text-[#7D91A8] text-[11px]">
                      Count: {item.count} ({item.frequency.toFixed(1)}%)
                    </span>
                  </div>
                  <span className="text-[#00E5FF] text-[11px]">
                    English Expected: {item.expectedEnglish}%
                  </span>
                </div>
                {/* Dual bar comparison */}
                <div className="h-3 w-full rounded bg-[#050914] overflow-hidden flex flex-col gap-0.5">
                  <div
                    className="h-1.5 bg-[#39FF88] rounded"
                    style={{ width: `${Math.min(item.frequency * 4, 100)}%` }}
                    title={`Text Frequency: ${item.frequency.toFixed(1)}%`}
                  />
                  <div
                    className="h-1 bg-[#00BFFF]/40 rounded"
                    style={{ width: `${Math.min(item.expectedEnglish * 4, 100)}%` }}
                    title={`Standard English: ${item.expectedEnglish}%`}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-4 text-xs font-mono text-[#7D91A8] pt-2 border-t border-[#00BFFF]/10">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-2 rounded bg-[#39FF88]" />
              <span>Target Text Frequency</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-2 rounded bg-[#00BFFF]/40" />
              <span>Standard English Benchmark</span>
            </div>
          </div>
        </div>
      )}

      {/* 3. CAESAR SHIFT EXPLORER */}
      {activeTool === 'shiftexplorer' && (
        <div className="p-5 rounded-xl bg-[#0A1224] border border-[#00BFFF]/20 space-y-6">
          <div>
            <h3 className="text-sm font-semibold font-mono text-white">
              INTERACTIVE CIPHER WHEEL / DUAL ALPHABET SLIDER
            </h3>
            <p className="text-xs text-[#7D91A8]">
              Slide to observe how modular rotation shifts every character uniformly
            </p>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-xs font-mono text-[#00E5FF]">Shift Value: {interactiveShift}</span>
            <input
              type="range"
              min={1}
              max={25}
              value={interactiveShift}
              onChange={(e) => setInteractiveShift(Number(e.target.value))}
              className="flex-1 accent-[#00BFFF] cursor-pointer"
            />
            <span className="text-xs font-mono text-white font-bold">{interactiveShift} / 25</span>
          </div>

          {/* Interactive dual track */}
          <div className="overflow-x-auto pb-2 scrollbar-none p-3 rounded-lg bg-[#050914] border border-[#00BFFF]/20">
            <div className="flex flex-col gap-2 min-w-[720px] font-mono text-xs">
              <div className="flex items-center gap-1">
                <span className="w-16 text-[#7D91A8] shrink-0">PLAIN:</span>
                {Array.from({ length: 26 }, (_, i) => String.fromCharCode(65 + i)).map((ch) => (
                  <div
                    key={ch}
                    className="w-6 h-7 rounded bg-[#0A1224] border border-[#00BFFF]/20 flex items-center justify-center text-white"
                  >
                    {ch}
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-1">
                <span className="w-16 text-[#39FF88] shrink-0 font-bold">CIPHER:</span>
                {getShiftedAlphabet(interactiveShift).map((ch, i) => (
                  <div
                    key={i}
                    className="w-6 h-7 rounded bg-[#00BFFF]/15 border border-[#00BFFF]/50 flex items-center justify-center text-[#00E5FF] font-bold"
                  >
                    {ch}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. VIGENERE KEY LENGTH & INDEX OF COINCIDENCE */}
      {activeTool === 'ioc' && (
        <div className="p-5 rounded-xl bg-[#0A1224] border border-[#00BFFF]/20 space-y-5">
          <div>
            <h3 className="text-sm font-semibold font-mono text-white">
              INDEX OF COINCIDENCE (IoC) & KEY-LENGTH ANALYSIS
            </h3>
            <p className="text-xs text-[#7D91A8]">
              Differentiating monoalphabetic ciphers from polyalphabetic ciphers using statistical variance
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-lg bg-[#050914] border border-[#00BFFF]/20 space-y-2">
              <span className="text-xs font-mono text-[#7D91A8] block">Current Sample IoC:</span>
              <div className="text-3xl font-mono font-bold text-[#00E5FF]">
                {iocAnalysis.ioc}
              </div>
              <p className="text-xs text-[#EAF6FF]/90 font-mono">
                {iocAnalysis.explanation}
              </p>
            </div>

            <div className="p-4 rounded-lg bg-[#050914] border border-[#00BFFF]/20 space-y-2">
              <span className="text-xs font-mono text-[#7D91A8] block">Theoretical Reference IoC:</span>
              <div className="space-y-1 text-xs font-mono">
                <div className="flex justify-between py-1 border-b border-[#00BFFF]/10">
                  <span className="text-white">English Language / Monoalphabetic:</span>
                  <span className="text-[#39FF88] font-bold">≈ 0.0667</span>
                </div>
                <div className="flex justify-between py-1 border-b border-[#00BFFF]/10">
                  <span className="text-white">Uniform Random / Long Vigenère:</span>
                  <span className="text-[#00E5FF] font-bold">≈ 0.0385</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-white">Sample Letter Count:</span>
                  <span className="text-[#7D91A8]">{iocAnalysis.totalLetters} letters</span>
                </div>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-lg bg-[#050914]/80 border border-[#00BFFF]/15 text-xs text-[#EAF6FF]/80 space-y-2 leading-relaxed">
            <span className="text-[#00E5FF] font-mono font-semibold block">
              How the Kasiski Examination Cracks Vigenère:
            </span>
            <p>
              When a keyword repeats periodically across regular text, common words (like &quot;THE&quot; or &quot;AND&quot;) occasionally align with the same keyword segment, generating identical repeating ciphertext fragments. The distances between these identical fragments are multiples of the secret keyword length. By finding the Greatest Common Divisor (GCD) of these intervals, cryptanalysts determine the exact key length and reduce Vigenère to independent Caesar shifts!
            </p>
          </div>
        </div>
      )}

      {/* 5. SHANNON ENTROPY */}
      {activeTool === 'entropy' && (
        <div className="p-5 rounded-xl bg-[#0A1224] border border-[#00BFFF]/20 space-y-5">
          <div>
            <h3 className="text-sm font-semibold font-mono text-white">
              SHANNON INFORMATION ENTROPY H(X)
            </h3>
            <p className="text-xs text-[#7D91A8]">
              Measuring unpredictability and information density in bits per symbol
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-lg bg-[#050914] border border-[#00BFFF]/20">
              <span className="text-xs font-mono text-[#7D91A8] block mb-1">Measured Entropy:</span>
              <div className="text-3xl font-mono font-bold text-[#39FF88]">
                {entropyAnalysis.entropy} <span className="text-xs text-[#7D91A8]">bits/char</span>
              </div>
              <span className="text-[11px] text-[#7D91A8] font-mono">
                {entropyAnalysis.ratio}% of theoretical maximum
              </span>
            </div>

            <div className="p-4 rounded-lg bg-[#050914] border border-[#00BFFF]/20">
              <span className="text-xs font-mono text-[#7D91A8] block mb-1">Max Uniform Entropy:</span>
              <div className="text-3xl font-mono font-bold text-[#00E5FF]">
                {entropyAnalysis.maxEntropy} <span className="text-xs text-[#7D91A8]">bits/char</span>
              </div>
              <span className="text-[11px] text-[#7D91A8] font-mono">
                log₂(unique symbols)
              </span>
            </div>

            <div className="p-4 rounded-lg bg-[#050914] border border-[#00BFFF]/20">
              <span className="text-xs font-mono text-[#7D91A8] block mb-1">Classification:</span>
              <div className="text-sm font-mono font-semibold text-white mt-1">
                {entropyAnalysis.interpretation}
              </div>
            </div>
          </div>

          <div className="p-4 rounded-lg bg-[#050914]/80 border border-[#00BFFF]/15 text-xs text-[#EAF6FF]/80 space-y-2 leading-relaxed">
            <span className="text-[#00E5FF] font-mono font-semibold block">
              Cryptographic Significance of Entropy:
            </span>
            <p>
              Natural human language is highly redundant (English entropy is only ~4.0 bits/char due to letter frequencies like &apos;E&apos; and digraph pairings like &apos;TH&apos;). A secure modern cipher (such as AES-GCM) achieves nearly maximal entropy (~8 bits per byte), appearing indistinguishable from true random noise. Classical substitution ciphers fail because they preserve the underlying low entropy of natural language!
            </p>
          </div>
        </div>
      )}

      {/* 6. CIPHER STRENGTH COMPARISON MATRIX */}
      {activeTool === 'strength' && (
        <div className="p-5 rounded-xl bg-[#0A1224] border border-[#00BFFF]/20 space-y-4">
          <div>
            <h3 className="text-sm font-semibold font-mono text-white">
              CLASSICAL CIPHER STRENGTH COMPARISON MATRIX
            </h3>
            <p className="text-xs text-[#7D91A8]">
              Key space, mathematical vulnerability, and break resistance
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono text-xs border-collapse">
              <thead>
                <tr className="border-b border-[#00BFFF]/20 text-[#7D91A8]">
                  <th className="py-2 px-3">Algorithm</th>
                  <th className="py-2 px-3">Key Space</th>
                  <th className="py-2 px-3">Frequency Resistance</th>
                  <th className="py-2 px-3">Primary Cryptanalysis Vector</th>
                  <th className="py-2 px-3">Modern Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#00BFFF]/10">
                <tr className="hover:bg-white/5">
                  <td className="py-2 px-3 font-bold text-white">Caesar Cipher</td>
                  <td className="py-2 px-3 text-[#00E5FF]">25 keys</td>
                  <td className="py-2 px-3 text-red-400">None (Shifted ETAOIN)</td>
                  <td className="py-2 px-3 text-[#7D91A8]">Instant Brute Force</td>
                  <td className="py-2 px-3 text-red-400">Broken / Trivial</td>
                </tr>
                <tr className="hover:bg-white/5">
                  <td className="py-2 px-3 font-bold text-white">ROT13 / Atbash</td>
                  <td className="py-2 px-3 text-[#00E5FF]">0 keys (Fixed)</td>
                  <td className="py-2 px-3 text-red-400">None</td>
                  <td className="py-2 px-3 text-[#7D91A8]">Direct Inversion</td>
                  <td className="py-2 px-3 text-red-400">Broken / Trivial</td>
                </tr>
                <tr className="hover:bg-white/5">
                  <td className="py-2 px-3 font-bold text-white">Affine Cipher</td>
                  <td className="py-2 px-3 text-[#00E5FF]">12 × 26 = 312 keys</td>
                  <td className="py-2 px-3 text-red-400">None</td>
                  <td className="py-2 px-3 text-[#7D91A8]">2 Known Letters / Frequency</td>
                  <td className="py-2 px-3 text-red-400">Broken / Trivial</td>
                </tr>
                <tr className="hover:bg-white/5">
                  <td className="py-2 px-3 font-bold text-white">Vigenère Cipher</td>
                  <td className="py-2 px-3 text-[#00E5FF]">26ᴸ (L = key length)</td>
                  <td className="py-2 px-3 text-amber-400">Moderate (Flattens 1-gram)</td>
                  <td className="py-2 px-3 text-[#7D91A8]">Kasiski / IoC Key Deduce</td>
                  <td className="py-2 px-3 text-amber-400">Insecure / Broken</td>
                </tr>
                <tr className="hover:bg-white/5">
                  <td className="py-2 px-3 font-bold text-white">Playfair Cipher</td>
                  <td className="py-2 px-3 text-[#00E5FF]">25! ≈ 1.55 × 10²⁵</td>
                  <td className="py-2 px-3 text-amber-400">Digraph Flattened</td>
                  <td className="py-2 px-3 text-[#7D91A8]">Digraph Frequency Analysis</td>
                  <td className="py-2 px-3 text-amber-400">Insecure / Broken</td>
                </tr>
                <tr className="hover:bg-white/5">
                  <td className="py-2 px-3 font-bold text-white">Hill Cipher (2×2)</td>
                  <td className="py-2 px-3 text-[#00E5FF]">≈ 1.57 × 10⁵ matrices</td>
                  <td className="py-2 px-3 text-amber-400">Polygraphic</td>
                  <td className="py-2 px-3 text-[#7D91A8]">Known-Plaintext (Linear Eq)</td>
                  <td className="py-2 px-3 text-amber-400">Insecure / Broken</td>
                </tr>
                <tr className="hover:bg-white/5">
                  <td className="py-2 px-3 font-bold text-white">Transposition (Rail/Col)</td>
                  <td className="py-2 px-3 text-[#00E5FF]">N! permutations</td>
                  <td className="py-2 px-3 text-red-400">Zero (Preserves exact counts)</td>
                  <td className="py-2 px-3 text-[#7D91A8]">Anagramming / Digraph Adjacency</td>
                  <td className="py-2 px-3 text-amber-400">Insecure / Broken</td>
                </tr>
                <tr className="hover:bg-white/5 bg-[#00BFFF]/5">
                  <td className="py-2 px-3 font-bold text-[#00E5FF]">AES-256-GCM (Modern)</td>
                  <td className="py-2 px-3 text-[#39FF88] font-bold">2²⁵⁶ ≈ 1.15 × 10⁷⁷</td>
                  <td className="py-2 px-3 text-[#39FF88] font-bold">Perfect (Maximal Entropy)</td>
                  <td className="py-2 px-3 text-[#39FF88]">No Known Practical Attack</td>
                  <td className="py-2 px-3 text-[#39FF88] font-bold">Secure (Industry Standard)</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

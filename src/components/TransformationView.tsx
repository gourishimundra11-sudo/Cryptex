import React, { useState } from 'react';
import { AlgorithmId, TransformationDetails } from '../types/crypto';
import { Eye, ArrowRight, Table, Sparkles, CheckCircle2, Binary, Compass } from 'lucide-react';

interface TransformationViewProps {
  algorithmId: AlgorithmId;
  details: TransformationDetails;
  plaintext: string;
  ciphertext: string;
}

export const TransformationView: React.FC<TransformationViewProps> = ({
  algorithmId,
  details,
  plaintext,
  ciphertext,
}) => {
  const [selectedPlayfairIndex, setSelectedPlayfairIndex] = useState<number>(0);

  return (
    <div className="w-full rounded-xl bg-[#0A1224]/90 border border-[#00BFFF]/25 p-5 shadow-lg">
      <div className="flex items-center justify-between pb-4 border-b border-[#00BFFF]/15 mb-5">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-[#00BFFF]/10 text-[#00E5FF]">
            <Eye className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold font-mono text-white tracking-wide uppercase">
              Transformation View
            </h3>
            <p className="text-xs text-[#7D91A8]">
              Step-by-step mathematical & structural mechanics
            </p>
          </div>
        </div>
        <span className="text-[11px] font-mono text-[#39FF88] px-2 py-0.5 rounded bg-[#39FF88]/10 border border-[#39FF88]/20 flex items-center gap-1.5">
          <Sparkles className="w-3 h-3" />
          Interactive Breakdown
        </span>
      </div>

      {/* 1. Caesar Cipher Visualization */}
      {algorithmId === 'caesar' && details.caesar && (
        <div className="space-y-6">
          <div>
            <span className="text-xs font-mono text-[#00E5FF] mb-2 block">
              Alphabet Shift Alignment (26-Letter Mapping)
            </span>
            <div className="overflow-x-auto pb-2 scrollbar-none">
              <div className="flex flex-col gap-1 min-w-[700px] text-xs font-mono">
                <div className="flex items-center gap-1">
                  <span className="w-14 text-[#7D91A8] shrink-0 font-medium">PLAIN:</span>
                  {Object.keys(details.caesar.shiftMap).map((char) => (
                    <div
                      key={char}
                      className="w-6 h-7 rounded bg-[#050914] border border-[#00BFFF]/20 flex items-center justify-center text-[#EAF6FF]"
                    >
                      {char}
                    </div>
                  ))}
                </div>
                <div className="flex items-center gap-1">
                  <span className="w-14 text-[#7D91A8] shrink-0 font-medium">CIPHER:</span>
                  {Object.values(details.caesar.shiftMap).map((char, idx) => (
                    <div
                      key={idx}
                      className="w-6 h-7 rounded bg-[#00BFFF]/10 border border-[#00BFFF]/40 flex items-center justify-center text-[#00E5FF] font-bold"
                    >
                      {char}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div>
            <span className="text-xs font-mono text-[#00E5FF] mb-2 block">
              Character-by-Character Progression
            </span>
            <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto p-2 rounded-lg bg-[#050914]/80 border border-[#00BFFF]/15 font-mono text-xs">
              {details.caesar.steps.slice(0, 40).map((step, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-1 px-2 py-1 rounded bg-[#0A1224] border border-[#00BFFF]/20"
                >
                  <span className="text-[#EAF6FF]">{step.plain === ' ' ? '␣' : step.plain}</span>
                  <span className="text-[#7D91A8]">→</span>
                  <span className="text-[#39FF88] font-bold">{step.cipher === ' ' ? '␣' : step.cipher}</span>
                </div>
              ))}
              {details.caesar.steps.length > 40 && (
                <span className="text-xs text-[#7D91A8] self-center">
                  +{details.caesar.steps.length - 40} more characters
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 2. Vigenère Cipher Visualization */}
      {algorithmId === 'vigenere' && details.vigenere && (
        <div className="space-y-4">
          <span className="text-xs font-mono text-[#00E5FF] block">
            Polyalphabetic Alignment Matrix (Plaintext + Repeating Key)
          </span>
          <div className="overflow-x-auto pb-2 scrollbar-none">
            <div className="flex flex-col gap-1 min-w-[500px] text-xs font-mono">
              {/* Row 1: Plain */}
              <div className="flex items-center gap-1">
                <span className="w-20 text-[#7D91A8] shrink-0">PLAINTEXT:</span>
                {details.vigenere.steps.slice(0, 30).map((s, i) => (
                  <div
                    key={i}
                    className="w-7 h-7 rounded bg-[#050914] border border-[#00BFFF]/20 flex items-center justify-center text-[#EAF6FF]"
                  >
                    {s.plain === ' ' ? '␣' : s.plain}
                  </div>
                ))}
              </div>
              {/* Row 2: Key */}
              <div className="flex items-center gap-1">
                <span className="w-20 text-[#00E5FF] shrink-0 font-medium">KEY CHAR:</span>
                {details.vigenere.steps.slice(0, 30).map((s, i) => (
                  <div
                    key={i}
                    className="w-7 h-7 rounded bg-[#00BFFF]/10 border border-[#00BFFF]/30 flex items-center justify-center text-[#00E5FF] font-semibold"
                  >
                    {s.keyChar}
                  </div>
                ))}
              </div>
              {/* Row 3: Shift */}
              <div className="flex items-center gap-1">
                <span className="w-20 text-[#7D91A8] shrink-0">SHIFT (+k):</span>
                {details.vigenere.steps.slice(0, 30).map((s, i) => (
                  <div
                    key={i}
                    className="w-7 h-6 flex items-center justify-center text-[10px] text-[#7D91A8]"
                  >
                    {s.isLetter ? `+${s.shift}` : '—'}
                  </div>
                ))}
              </div>
              {/* Row 4: Cipher */}
              <div className="flex items-center gap-1">
                <span className="w-20 text-[#39FF88] shrink-0 font-medium">CIPHER:</span>
                {details.vigenere.steps.slice(0, 30).map((s, i) => (
                  <div
                    key={i}
                    className="w-7 h-7 rounded bg-[#39FF88]/10 border border-[#39FF88]/40 flex items-center justify-center text-[#39FF88] font-bold"
                  >
                    {s.cipher === ' ' ? '␣' : s.cipher}
                  </div>
                ))}
              </div>
            </div>
          </div>
          <p className="text-xs text-[#7D91A8] font-mono">
            Notice how identical plaintext letters map to different cipher letters depending on which keyword letter aligns with them.
          </p>
        </div>
      )}

      {/* 3. Atbash Cipher Visualization */}
      {algorithmId === 'atbash' && details.atbash && (
        <div className="space-y-4">
          <span className="text-xs font-mono text-[#00E5FF] block">
            Alphabet Symmetrical Reflection (Mirror Tape)
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-13 gap-1.5 font-mono text-xs">
            {Object.entries(details.atbash.map).slice(0, 13).map(([orig, rev]) => (
              <div
                key={orig}
                className="p-2 rounded bg-[#050914] border border-[#00BFFF]/20 flex flex-col items-center justify-center text-center"
              >
                <span className="text-white font-bold">{orig}</span>
                <span className="text-[#39FF88] text-[10px]">↕</span>
                <span className="text-[#00E5FF] font-bold">{rev}</span>
              </div>
            ))}
          </div>
          <p className="text-xs text-[#7D91A8]">
            Atbash maps 1st to 26th letter (A ↔ Z), 2nd to 25th (B ↔ Y), etc. Applying Atbash twice restores the original text.
          </p>
        </div>
      )}

      {/* 4. ROT13 Visualization */}
      {algorithmId === 'rot13' && (
        <div className="space-y-4">
          <span className="text-xs font-mono text-[#00E5FF] block">
            Half-Alphabet Rotation (Shift = 13)
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-13 gap-1.5 font-mono text-xs">
            {Array.from({ length: 13 }, (_, i) => {
              const a = String.fromCharCode(65 + i);
              const b = String.fromCharCode(65 + i + 13);
              return (
                <div
                  key={a}
                  className="p-2 rounded bg-[#050914] border border-[#00BFFF]/20 flex flex-col items-center justify-center text-center"
                >
                  <span className="text-white font-bold">{a}</span>
                  <span className="text-[#39FF88] text-[10px]">↕</span>
                  <span className="text-[#00E5FF] font-bold">{b}</span>
                </div>
              );
            })}
          </div>
          <p className="text-xs text-[#7D91A8]">
            Since 26 / 2 = 13, rotating any letter twice by 13 results in 26 mod 26 = 0, returning the original character.
          </p>
        </div>
      )}

      {/* 5. Affine Cipher Visualization */}
      {algorithmId === 'affine' && details.affine && (
        <div className="space-y-4">
          <div className="p-3 rounded-lg bg-[#050914] border border-[#00BFFF]/30 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
            <div>
              <span className="text-[#7D91A8]">Encryption Formula: </span>
              <span className="text-[#00E5FF] font-bold">
                E(x) = ({details.affine.a}x + {details.affine.b}) mod 26
              </span>
            </div>
            <div>
              <span className="text-[#7D91A8]">Modular Inverse a⁻¹: </span>
              <span className="text-[#39FF88] font-bold">{details.affine.aInverse}</span>
            </div>
            <div>
              <span className="text-[#7D91A8]">Decryption Formula: </span>
              <span className="text-white font-bold">
                D(y) = {details.affine.aInverse}(y - {details.affine.b}) mod 26
              </span>
            </div>
          </div>

          <div className="overflow-x-auto max-h-56">
            <table className="w-full text-xs font-mono text-left">
              <thead>
                <tr className="border-b border-[#00BFFF]/20 text-[#7D91A8]">
                  <th className="py-1.5 px-3">Plain</th>
                  <th className="py-1.5 px-3">Index (x)</th>
                  <th className="py-1.5 px-3">Formula: ({details.affine.a}×x + {details.affine.b}) mod 26</th>
                  <th className="py-1.5 px-3">Cipher Index</th>
                  <th className="py-1.5 px-3">Cipher</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#00BFFF]/10">
                {details.affine.steps.slice(0, 15).map((s, idx) => (
                  <tr key={idx} className="hover:bg-white/5">
                    <td className="py-1.5 px-3 font-bold text-white">{s.plain}</td>
                    <td className="py-1.5 px-3 text-[#7D91A8]">{s.isLetter ? s.x : '—'}</td>
                    <td className="py-1.5 px-3 text-[#00E5FF]">{s.calculation}</td>
                    <td className="py-1.5 px-3 text-[#7D91A8]">{s.isLetter ? s.resultNum : '—'}</td>
                    <td className="py-1.5 px-3 font-bold text-[#39FF88]">{s.cipher}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 6. Playfair Cipher Visualization */}
      {algorithmId === 'playfair' && details.playfair && (
        <div className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            {/* 5x5 Key Matrix */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-mono text-[#00E5FF]">5×5 Key Matrix (I/J Combined)</span>
                <span className="text-[11px] font-mono text-[#7D91A8]">Active Digraph Highlighted</span>
              </div>
              <div className="grid grid-cols-5 gap-1.5 p-3 rounded-xl bg-[#050914] border border-[#00BFFF]/25 max-w-[280px]">
                {details.playfair.matrix.map((row, r) =>
                  row.map((cell, c) => {
                    const activeStep = details.playfair?.steps[selectedPlayfairIndex];
                    const isInput =
                      activeStep &&
                      ((activeStep.pos1[0] === r && activeStep.pos1[1] === c) ||
                        (activeStep.pos2[0] === r && activeStep.pos2[1] === c));
                    const isOutput =
                      activeStep &&
                      ((activeStep.newPos1[0] === r && activeStep.newPos1[1] === c) ||
                        (activeStep.newPos2[0] === r && activeStep.newPos2[1] === c));

                    return (
                      <div
                        key={`${r}-${c}`}
                        className={`h-10 rounded-lg flex items-center justify-center font-mono font-bold text-sm transition-all ${
                          isInput
                            ? 'bg-[#00BFFF] text-black shadow-[0_0_12px_rgba(0,191,255,0.7)] scale-105'
                            : isOutput
                            ? 'bg-[#39FF88] text-black shadow-[0_0_12px_rgba(57,255,136,0.7)] scale-105'
                            : 'bg-[#0A1224] text-[#EAF6FF] border border-[#00BFFF]/15'
                        }`}
                      >
                        {cell}
                      </div>
                    );
                  })
                )}
              </div>
              <div className="flex items-center gap-4 mt-2 text-[11px] font-mono">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded bg-[#00BFFF]" />
                  <span className="text-[#7D91A8]">Input Pair</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded bg-[#39FF88]" />
                  <span className="text-[#7D91A8]">Cipher Output</span>
                </div>
              </div>
            </div>

            {/* Digraph breakdown */}
            <div>
              <span className="text-xs font-mono text-[#00E5FF] mb-2 block">
                Digraph Transformations (Click pair to inspect)
              </span>
              <div className="space-y-1.5 max-h-60 overflow-y-auto pr-1">
                {details.playfair.steps.map((step, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedPlayfairIndex(idx)}
                    className={`w-full p-2 rounded-lg text-left font-mono text-xs flex items-center justify-between border transition-all ${
                      selectedPlayfairIndex === idx
                        ? 'bg-[#00BFFF]/15 border-[#00BFFF] text-white shadow-sm'
                        : 'bg-[#050914] border-[#00BFFF]/15 text-[#7D91A8] hover:text-[#EAF6FF]'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white px-1.5 py-0.5 rounded bg-black/40">
                        {step.digraph.join('')}
                      </span>
                      <ArrowRight className="w-3 h-3 text-[#7D91A8]" />
                      <span className="font-bold text-[#39FF88] px-1.5 py-0.5 rounded bg-black/40">
                        {step.transformed.join('')}
                      </span>
                    </div>
                    <span className="text-[11px] text-[#00E5FF]">{step.description}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 7. Hill Cipher Visualization */}
      {algorithmId === 'hill' && details.hill && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-3 rounded-lg bg-[#050914] border border-[#00BFFF]/20">
              <span className="text-xs font-mono text-[#7D91A8] block mb-1">2×2 Key Matrix K:</span>
              <div className="font-mono text-sm text-[#00E5FF] font-bold">
                [{details.hill.matrix[0][0]}, {details.hill.matrix[0][1]}]<br />
                [{details.hill.matrix[1][0]}, {details.hill.matrix[1][1]}]
              </div>
            </div>
            <div className="p-3 rounded-lg bg-[#050914] border border-[#00BFFF]/20">
              <span className="text-xs font-mono text-[#7D91A8] block mb-1">Determinant:</span>
              <div className="font-mono text-sm text-white font-bold">
                {details.hill.determinant}
              </div>
              <span className="text-[11px] text-[#7D91A8] font-mono">
                {details.hill.detMod26} mod 26 (Coprime to 26: ✓)
              </span>
            </div>
            <div className="p-3 rounded-lg bg-[#050914] border border-[#00BFFF]/20">
              <span className="text-xs font-mono text-[#7D91A8] block mb-1">Linear System:</span>
              <div className="font-mono text-xs text-[#39FF88]">
                C₁ = (k₀₀P₁ + k₀₁P₂) mod 26<br />
                C₂ = (k₁₀P₁ + k₁₁P₂) mod 26
              </div>
            </div>
          </div>

          <div className="overflow-x-auto max-h-52">
            <table className="w-full text-xs font-mono text-left">
              <thead>
                <tr className="border-b border-[#00BFFF]/20 text-[#7D91A8]">
                  <th className="py-1.5 px-3">Plain Pair</th>
                  <th className="py-1.5 px-3">Vector P</th>
                  <th className="py-1.5 px-3">Matrix Dot Product</th>
                  <th className="py-1.5 px-3">Vector C mod 26</th>
                  <th className="py-1.5 px-3">Cipher Pair</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#00BFFF]/10">
                {details.hill.steps.slice(0, 12).map((s, idx) => (
                  <tr key={idx} className="hover:bg-white/5">
                    <td className="py-1.5 px-3 font-bold text-white">{s.pair.join('')}</td>
                    <td className="py-1.5 px-3 text-[#7D91A8]">[{s.vector[0]}, {s.vector[1]}]</td>
                    <td className="py-1.5 px-3 text-[#00E5FF]">{s.calculation}</td>
                    <td className="py-1.5 px-3 text-[#7D91A8]">[{s.resultVector[0]}, {s.resultVector[1]}]</td>
                    <td className="py-1.5 px-3 font-bold text-[#39FF88]">{s.cipherPair.join('')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 8. Rail Fence Visualization */}
      {algorithmId === 'railfence' && details.railFence && (
        <div className="space-y-4">
          <span className="text-xs font-mono text-[#00E5FF] block">
            Zigzag Rail Wave Visualization ({details.railFence.rails} Rails)
          </span>
          <div className="overflow-x-auto pb-2 scrollbar-none p-3 rounded-lg bg-[#050914] border border-[#00BFFF]/20">
            <div className="flex flex-col gap-2 min-w-[500px] font-mono text-xs">
              {details.railFence.grid.map((row, rIdx) => (
                <div key={rIdx} className="flex items-center gap-1.5">
                  <span className="w-16 text-[#7D91A8] shrink-0 font-medium">
                    Rail {rIdx + 1}:
                  </span>
                  <div className="flex items-center gap-1">
                    {row.map((cell, cIdx) => (
                      <div
                        key={cIdx}
                        className={`w-6 h-6 rounded flex items-center justify-center font-bold text-xs ${
                          cell !== null
                            ? 'bg-[#00BFFF]/20 border border-[#00BFFF] text-[#00E5FF]'
                            : 'text-[#7D91A8]/20'
                        }`}
                      >
                        {cell !== null ? cell : '·'}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <p className="text-xs text-[#7D91A8] font-mono">
            Characters bounce down and up across rails in a triangular waveform. Ciphertext is formed by reading characters row by row from Rail 1 to Rail {details.railFence.rails}.
          </p>
        </div>
      )}

      {/* 9. Columnar Transposition Visualization */}
      {algorithmId === 'columnar' && details.columnar && (
        <div className="space-y-4">
          <span className="text-xs font-mono text-[#00E5FF] block">
            Transposition Grid (Keyword Reordered Extraction)
          </span>
          <div className="overflow-x-auto pb-2 p-3 rounded-lg bg-[#050914] border border-[#00BFFF]/20">
            <table className="font-mono text-xs text-center border-collapse">
              <thead>
                <tr>
                  <th className="p-1 text-[#7D91A8] text-[10px]">KEY:</th>
                  {details.columnar.keyword.split('').map((char, i) => (
                    <th key={i} className="p-2 border border-[#00BFFF]/20 text-[#00E5FF] font-bold text-sm bg-[#00BFFF]/10">
                      {char}
                    </th>
                  ))}
                </tr>
                <tr>
                  <th className="p-1 text-[#7D91A8] text-[10px]">ORDER:</th>
                  {details.columnar.colOrder.map((order, i) => (
                    <th key={i} className="p-1 border border-[#00BFFF]/20 text-[#39FF88] font-semibold bg-[#39FF88]/10 text-xs">
                      #{order}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {details.columnar.grid.map((row, r) => (
                  <tr key={r}>
                    <td className="p-1 text-[#7D91A8] text-[10px]">Row {r + 1}</td>
                    {row.map((cell, c) => (
                      <td key={c} className="p-2 border border-[#00BFFF]/15 text-white font-bold bg-[#0A1224]/50">
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div>
            <span className="text-xs font-mono text-[#00E5FF] block mb-1.5">Column Read Sequence:</span>
            <div className="flex flex-wrap gap-2 text-xs font-mono">
              {details.columnar.readOrder.map((item, idx) => (
                <div key={idx} className="px-2.5 py-1 rounded bg-[#050914] border border-[#39FF88]/30 flex items-center gap-1.5">
                  <span className="text-[#39FF88] font-bold">Col #{item.order}:</span>
                  <span className="text-white font-mono">{item.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 10. Reverse Cipher Visualization */}
      {algorithmId === 'reverse' && details.reverse && (
        <div className="space-y-4">
          <span className="text-xs font-mono text-[#00E5FF] block">
            End-to-Beginning Index Inversion
          </span>
          <div className="p-4 rounded-lg bg-[#050914] border border-[#00BFFF]/20 font-mono text-sm space-y-3">
            <div className="flex items-center gap-3">
              <span className="w-16 text-[#7D91A8] text-xs">ORIGINAL:</span>
              <span className="text-white tracking-widest">{details.reverse.original}</span>
            </div>
            <div className="text-[#39FF88] flex items-center justify-center text-xs">
              ↓ characters swapped across center axis ↓
            </div>
            <div className="flex items-center gap-3">
              <span className="w-16 text-[#39FF88] text-xs font-bold">REVERSED:</span>
              <span className="text-[#39FF88] tracking-widest font-bold">{details.reverse.reversed}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

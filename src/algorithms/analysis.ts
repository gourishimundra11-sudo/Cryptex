// Educational cryptanalysis utilities for Crypto Lab

export const ENGLISH_FREQ: { [key: string]: number } = {
  E: 12.7,
  T: 9.06,
  A: 8.17,
  O: 7.51,
  I: 6.97,
  N: 6.75,
  S: 6.33,
  H: 6.09,
  R: 5.99,
  D: 4.25,
  L: 4.03,
  C: 2.78,
  U: 2.76,
  M: 2.41,
  W: 2.36,
  F: 2.23,
  G: 2.02,
  Y: 1.97,
  P: 1.93,
  B: 1.49,
  V: 0.98,
  K: 0.77,
  X: 0.15,
  J: 0.15,
  Q: 0.1,
  Z: 0.07,
};

export interface FrequencyData {
  letter: string;
  count: number;
  frequency: number; // percentage (0 - 100)
  expectedEnglish: number; // percentage
}

export function computeFrequencyAnalysis(text: string): {
  frequencies: FrequencyData[];
  totalLetters: number;
  topLetter: string;
} {
  const counts: { [key: string]: number } = {};
  for (let i = 0; i < 26; i++) {
    counts[String.fromCharCode(65 + i)] = 0;
  }

  let totalLetters = 0;
  const upper = text.toUpperCase();

  for (let i = 0; i < upper.length; i++) {
    const code = upper.charCodeAt(i);
    if (code >= 65 && code <= 90) {
      const ch = upper[i];
      counts[ch] = (counts[ch] || 0) + 1;
      totalLetters++;
    }
  }

  const frequencies: FrequencyData[] = Object.keys(counts).map((letter) => {
    const count = counts[letter];
    const frequency = totalLetters > 0 ? (count / totalLetters) * 100 : 0;
    return {
      letter,
      count,
      frequency,
      expectedEnglish: ENGLISH_FREQ[letter] || 0,
    };
  });

  // Sort alphabetically or by frequency
  frequencies.sort((a, b) => b.count - a.count);
  const topLetter = frequencies[0]?.letter || 'E';

  return {
    frequencies,
    totalLetters,
    topLetter,
  };
}

export function calculateShannonEntropy(text: string): {
  entropy: number;
  maxEntropy: number;
  ratio: number;
  interpretation: string;
} {
  if (!text || text.length === 0) {
    return { entropy: 0, maxEntropy: 0, ratio: 0, interpretation: 'Empty text' };
  }

  const charCounts: { [key: string]: number } = {};
  for (const ch of text) {
    charCounts[ch] = (charCounts[ch] || 0) + 1;
  }

  const len = text.length;
  let entropy = 0;

  for (const ch in charCounts) {
    const p = charCounts[ch] / len;
    entropy -= p * Math.log2(p);
  }

  // Theoretical max entropy for alphabet (log2 of unique characters or 26 letters)
  const uniqueChars = Object.keys(charCounts).length;
  const maxEntropy = uniqueChars > 1 ? Math.log2(uniqueChars) : 1;
  const ratio = maxEntropy > 0 ? entropy / maxEntropy : 0;

  let interpretation = 'Low Entropy (Highly patterned)';
  if (entropy > 3.8) {
    interpretation = 'High Entropy (Resembles random or modern encrypted data)';
  } else if (entropy > 2.8) {
    interpretation = 'Moderate Entropy (Typical natural human language)';
  }

  return {
    entropy: Number(entropy.toFixed(3)),
    maxEntropy: Number(maxEntropy.toFixed(3)),
    ratio: Number((ratio * 100).toFixed(1)),
    interpretation,
  };
}

export function calculateIndexOfCoincidence(text: string): {
  ioc: number;
  totalLetters: number;
  isPolyalphabetic: boolean;
  explanation: string;
} {
  const upper = text.toUpperCase().replace(/[^A-Z]/g, '');
  const n = upper.length;

  if (n <= 1) {
    return {
      ioc: 0,
      totalLetters: n,
      isPolyalphabetic: false,
      explanation: 'Text too short to compute reliable Index of Coincidence.',
    };
  }

  const counts: { [key: string]: number } = {};
  for (const ch of upper) {
    counts[ch] = (counts[ch] || 0) + 1;
  }

  let sum = 0;
  for (const ch in counts) {
    const f = counts[ch];
    sum += f * (f - 1);
  }

  const ioc = sum / (n * (n - 1));

  // English plain/monoalphabetic IoC is ~0.067
  // Random / polyalphabetic with long key IoC is ~0.0385
  const isPolyalphabetic = ioc < 0.052;
  const explanation =
    ioc >= 0.058
      ? 'IoC is close to ~0.067 (Standard English). Strong indicator of Monoalphabetic Substitution or Transposition.'
      : ioc < 0.045
      ? 'IoC is close to ~0.0385 (Uniform Random). Strong indicator of Polyalphabetic (Vigenère) or Flat distribution.'
      : 'IoC is intermediate (~0.050). Likely a short keyword or short sample text.';

  return {
    ioc: Number(ioc.toFixed(4)),
    totalLetters: n,
    isPolyalphabetic,
    explanation,
  };
}

// Common English words for scoring brute force
const COMMON_WORDS = new Set([
  'THE', 'BE', 'TO', 'OF', 'AND', 'A', 'IN', 'THAT', 'HAVE', 'I',
  'IT', 'FOR', 'NOT', 'ON', 'WITH', 'HE', 'AS', 'YOU', 'DO', 'AT',
  'THIS', 'BUT', 'HIS', 'BY', 'FROM', 'THEY', 'WE', 'SAY', 'HER',
  'SHE', 'OR', 'AN', 'WILL', 'MY', 'ONE', 'ALL', 'WOULD', 'THERE',
  'THEIR', 'WHAT', 'SO', 'UP', 'OUT', 'IF', 'ABOUT', 'WHO', 'GET',
  'WHICH', 'GO', 'ME', 'MEET', 'ATTACK', 'DAWN', 'TIME', 'HELLO',
  'WORLD', 'SECRET', 'CIPHER', 'NIGHT', 'SECURITY', 'KEY', 'LOCK'
]);

export interface BruteForceResult {
  shift: number;
  decryptedText: string;
  score: number;
  matchedWords: string[];
}

export function bruteForceCaesar(ciphertext: string): BruteForceResult[] {
  const results: BruteForceResult[] = [];

  for (let shift = 1; shift < 26; shift++) {
    let decrypted = '';
    for (let i = 0; i < ciphertext.length; i++) {
      const code = ciphertext.charCodeAt(i);
      if (code >= 65 && code <= 90) {
        decrypted += String.fromCharCode(((code - 65 - shift + 26) % 26) + 65);
      } else if (code >= 97 && code <= 122) {
        decrypted += String.fromCharCode(((code - 97 - shift + 26) % 26) + 97);
      } else {
        decrypted += ciphertext[i];
      }
    }

    // Score based on word matches and English letter frequency
    const tokens = decrypted.toUpperCase().split(/[^A-Z]+/);
    const matchedWords: string[] = [];
    let score = 0;

    for (const token of tokens) {
      if (token.length >= 2 && COMMON_WORDS.has(token)) {
        matchedWords.push(token);
        score += token.length * 15;
      }
    }

    // Letter frequency correlation bonus
    let freqScore = 0;
    const upper = decrypted.toUpperCase();
    for (let i = 0; i < upper.length; i++) {
      const ch = upper[i];
      if (ENGLISH_FREQ[ch]) {
        freqScore += ENGLISH_FREQ[ch];
      }
    }
    score += Math.round(freqScore / 10);

    results.push({
      shift,
      decryptedText: decrypted,
      score,
      matchedWords,
    });
  }

  // Sort descending by score
  results.sort((a, b) => b.score - a.score);
  return results;
}

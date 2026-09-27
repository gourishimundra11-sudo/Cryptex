import { AlgorithmId, AlgorithmMetadata, AlgorithmParams, CipherResult } from '../types/crypto';
import { caesarCipher } from './caesar';
import { vigenereCipher } from './vigenere';
import { atbashCipher } from './atbash';
import { rot13Cipher } from './rot13';
import { affineCipher } from './affine';
import { playfairCipher } from './playfair';
import { hillCipher } from './hill';
import { railFenceCipher } from './railFence';
import { columnarTranspositionCipher } from './columnar';
import { reverseCipher } from './reverse';

export const ALGORITHM_REGISTRY: Record<AlgorithmId, AlgorithmMetadata> = {
  caesar: {
    id: 'caesar',
    name: 'Caesar Cipher',
    category: 'Monoalphabetic Substitution',
    shortDescription: 'Shifts each alphabetic character forward by a fixed numeric offset.',
    example: {
      plain: 'HELLO',
      key: 'Shift 2',
      cipher: 'JGNNQ',
    },
    keyConcept: 'Modular addition: C = (P + k) mod 26',
    historicalUsage: 'Used by Julius Caesar in 58 BC to protect military dispatches across the Roman Empire.',
    modernSecurityStatus: 'Broken / Trivial',
    formula: 'E(x) = (x + k) mod 26',
    defaultParams: { type: 'caesar', shift: 2 },
  },
  vigenere: {
    id: 'vigenere',
    name: 'Vigenère Cipher',
    category: 'Polyalphabetic Substitution',
    shortDescription: 'Uses a repeating keyword to apply different Caesar shifts to successive characters.',
    example: {
      plain: 'ATTACKATDAWN',
      key: 'LEMON',
      cipher: 'LXFOPVEFRNHR',
    },
    keyConcept: 'Periodic polyalphabetic shift: Cᵢ = (Pᵢ + Kᵢ) mod 26',
    historicalUsage: 'Published by Blaise de Vigenère in 1586; held unbroken for ~300 years and dubbed "the indecipherable cipher".',
    modernSecurityStatus: 'Easily Broken via Frequency Analysis',
    formula: 'E(pᵢ, kᵢ) = (pᵢ + kᵢ) mod 26',
    defaultParams: { type: 'vigenere', keyword: 'LEMON' },
  },
  atbash: {
    id: 'atbash',
    name: 'Atbash Cipher',
    category: 'Monoalphabetic Substitution',
    shortDescription: 'Maps each alphabet character to its symmetrical reverse counterpart (A ↔ Z, B ↔ Y).',
    example: {
      plain: 'HELLO',
      cipher: 'SVOOL',
    },
    keyConcept: 'Reflection involution: C = (25 - P) mod 26',
    historicalUsage: 'Biblical Hebrew cipher found in the Book of Jeremiah (~500 BC) encoding Babel as Sheshach.',
    modernSecurityStatus: 'Broken / Trivial',
    formula: 'E(x) = 25 - x',
    defaultParams: { type: 'atbash' },
  },
  rot13: {
    id: 'rot13',
    name: 'ROT13',
    category: 'Monoalphabetic Substitution',
    shortDescription: 'Rotates each alphabet character by 13 positions; self-reciprocal (decrypting is identical to encrypting).',
    example: {
      plain: 'HELLO',
      cipher: 'URYYB',
    },
    keyConcept: 'Involution with half-alphabet shift (13 positions)',
    historicalUsage: 'Adopted across Usenet newsgroups in the 1980s to conceal jokes, puzzle solutions, and offensive text.',
    modernSecurityStatus: 'Broken / Trivial',
    formula: 'E(x) = (x + 13) mod 26',
    defaultParams: { type: 'rot13' },
  },
  affine: {
    id: 'affine',
    name: 'Affine Cipher',
    category: 'Mathematical',
    shortDescription: 'Transforms characters using a linear algebraic function E(x) = (a × x + b) mod 26 where gcd(a,26) = 1.',
    example: {
      plain: 'HELLO',
      key: 'a = 5, b = 8',
      cipher: 'RCLLA',
    },
    keyConcept: 'Linear congruence over Galois field ℤ₂₆ with modular multiplicative inverse',
    historicalUsage: 'Formalized in the 20th century as a bridge between classical monoalphabetic ciphers and algebraic geometry.',
    modernSecurityStatus: 'Easily Broken via Frequency Analysis',
    formula: 'E(x) = (a × x + b) mod 26',
    defaultParams: { type: 'affine', a: 5, b: 8 },
  },
  playfair: {
    id: 'playfair',
    name: 'Playfair Cipher',
    category: 'Polygraphic / Matrix',
    shortDescription: 'Encrypts letter pairs (digraphs) across a dynamically generated 5×5 key matrix with merged I/J.',
    example: {
      plain: 'SECRET',
      key: 'MONARCHY',
      cipher: 'QCSPDU',
    },
    keyConcept: 'Digraph permutation via row, column, and rectangular coordinate substitution',
    historicalUsage: 'Invented by Charles Wheatstone in 1854; used tactically by British forces in the Boer War and WWII.',
    modernSecurityStatus: 'Easily Broken via Frequency Analysis',
    formula: '5×5 Matrix Digraph Rules (Row/Col/Rect)',
    defaultParams: { type: 'playfair', keyword: 'MONARCHY' },
  },
  hill: {
    id: 'hill',
    name: 'Hill Cipher',
    category: 'Polygraphic / Matrix',
    shortDescription: 'Encrypts letter pairs using linear algebra and a 2×2 key matrix invertible modulo 26.',
    example: {
      plain: 'HELP',
      key: 'Matrix [[3,3],[2,5]]',
      cipher: 'HIAT',
    },
    keyConcept: 'Vector matrix multiplication: C = K · P (mod 26)',
    historicalUsage: 'Invented by mathematician Lester S. Hill in 1929 as the first polygraphic cipher practical on more than 3 symbols.',
    modernSecurityStatus: 'Insecure / Educational Only',
    formula: 'C = K × P (mod 26)',
    defaultParams: {
      type: 'hill',
      matrix: [
        [3, 3],
        [2, 5],
      ],
    },
  },
  railfence: {
    id: 'railfence',
    name: 'Rail Fence Cipher',
    category: 'Transposition / Permutation',
    shortDescription: 'Writes plaintext in a zigzag wave across multiple imaginary rails, then reads rows off sequentially.',
    example: {
      plain: 'WEAREDISCOVERED',
      key: '3 Rails',
      cipher: 'WECRERDSOEEAIVD',
    },
    keyConcept: 'Geometric wave permutation preserving symbol identity while scrambling sequential positions',
    historicalUsage: 'Used in the American Civil War for military field telegrams due to ease of pencil-and-paper execution.',
    modernSecurityStatus: 'Broken / Trivial',
    formula: 'Zigzag Wave Permutation P(i) → Row, Col',
    defaultParams: { type: 'railfence', rails: 3 },
  },
  columnar: {
    id: 'columnar',
    name: 'Columnar Transposition',
    category: 'Transposition / Permutation',
    shortDescription: 'Writes plaintext into rows beneath a keyword, then extracts columns in alphabetical order of the key.',
    example: {
      plain: 'DEFENDTHEEAST',
      key: 'GERMAN',
      cipher: 'EETDDFNEATHSE',
    },
    keyConcept: 'Grid transposition reordered by key permutation vector',
    historicalUsage: 'Widely used in WWI and WWII by reconnaissance officers, resistance networks, and spy rings.',
    modernSecurityStatus: 'Insecure / Educational Only',
    formula: 'Grid Write(Row, Col) → Read(Sorted Order)',
    defaultParams: { type: 'columnar', keyword: 'CIPHER' },
  },
  reverse: {
    id: 'reverse',
    name: 'Reverse Cipher',
    category: 'Transposition / Permutation',
    shortDescription: 'Inverts the entire sequential order of characters from end to beginning.',
    example: {
      plain: 'HELLO WORLD',
      cipher: 'DLROW OLLEH',
    },
    keyConcept: 'Index reversal: Cᵢ = Pₙ₋₁₋ᵢ',
    historicalUsage: 'One of the earliest recorded techniques for message scrambling; found in ancient scribal riddles.',
    modernSecurityStatus: 'Broken / Trivial',
    formula: 'C[i] = P[n - 1 - i]',
    defaultParams: { type: 'reverse' },
  },
};

export function executeCipher(
  id: AlgorithmId,
  plaintext: string,
  params: AlgorithmParams
): CipherResult {
  if (!plaintext || plaintext.trim().length === 0) {
    throw new Error('Please enter plaintext to transform.');
  }

  switch (id) {
    case 'caesar': {
      const shift = params.type === 'caesar' ? params.shift : 2;
      return caesarCipher(plaintext, shift);
    }
    case 'vigenere': {
      const keyword = params.type === 'vigenere' ? params.keyword : 'LEMON';
      return vigenereCipher(plaintext, keyword);
    }
    case 'atbash': {
      return atbashCipher(plaintext);
    }
    case 'rot13': {
      return rot13Cipher(plaintext);
    }
    case 'affine': {
      const a = params.type === 'affine' ? params.a : 5;
      const b = params.type === 'affine' ? params.b : 8;
      return affineCipher(plaintext, a, b);
    }
    case 'playfair': {
      const keyword = params.type === 'playfair' ? params.keyword : 'MONARCHY';
      return playfairCipher(plaintext, keyword);
    }
    case 'hill': {
      const matrix =
        params.type === 'hill'
          ? params.matrix
          : ([
              [3, 3],
              [2, 5],
            ] as [[number, number], [number, number]]);
      return hillCipher(plaintext, matrix);
    }
    case 'railfence': {
      const rails = params.type === 'railfence' ? params.rails : 3;
      return railFenceCipher(plaintext, rails);
    }
    case 'columnar': {
      const keyword = params.type === 'columnar' ? params.keyword : 'CIPHER';
      return columnarTranspositionCipher(plaintext, keyword);
    }
    case 'reverse': {
      return reverseCipher(plaintext);
    }
    default: {
      throw new Error(`Unsupported algorithm: ${id}`);
    }
  }
}

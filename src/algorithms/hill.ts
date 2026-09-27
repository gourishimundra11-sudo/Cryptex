import { CipherResult, HillStep } from '../types/crypto';
import { gcd, modInverse } from './affine';

export function validateHillMatrix(matrix: [[number, number], [number, number]]): {
  isValid: boolean;
  det: number;
  detMod26: number;
  detInverse?: number;
  errorMessage?: string;
} {
  const [[k00, k01], [k10, k11]] = matrix;
  const det = k00 * k11 - k01 * k10;
  const detMod26 = ((det % 26) + 26) % 26;

  if (detMod26 === 0) {
    return {
      isValid: false,
      det,
      detMod26,
      errorMessage: `Matrix determinant is ${det} (0 mod 26). The matrix is singular and cannot be inverted.`,
    };
  }

  const g = gcd(detMod26, 26);
  if (g !== 1) {
    return {
      isValid: false,
      det,
      detMod26,
      errorMessage: `Determinant mod 26 is ${detMod26}, which shares common factor ${g} with 26 (gcd(${detMod26}, 26) = ${g}). A Hill key matrix must have a determinant coprime to 26 to be invertible.`,
    };
  }

  const detInverse = modInverse(detMod26, 26);
  return {
    isValid: true,
    det,
    detMod26,
    detInverse,
  };
}

export function hillCipher(
  plaintext: string,
  matrix: [[number, number], [number, number]]
): CipherResult {
  const validation = validateHillMatrix(matrix);
  if (!validation.isValid) {
    throw new Error(validation.errorMessage || 'Invalid 2×2 Hill Cipher Key Matrix.');
  }

  const cleaned = plaintext.toUpperCase().replace(/[^A-Z]/g, '');
  if (cleaned.length === 0) {
    throw new Error('Plaintext must contain at least one alphabetic letter for Hill cipher.');
  }

  // Pad to even length with 'X'
  const padded = cleaned.length % 2 === 0 ? cleaned : cleaned + 'X';
  const [[k00, k01], [k10, k11]] = matrix;

  const steps: HillStep[] = [];
  let ciphertext = '';

  for (let i = 0; i < padded.length; i += 2) {
    const ch1 = padded[i];
    const ch2 = padded[i + 1];
    const p1 = ch1.charCodeAt(0) - 65;
    const p2 = ch2.charCodeAt(0) - 65;

    const c1 = ((k00 * p1 + k01 * p2) % 26 + 26) % 26;
    const c2 = ((k10 * p1 + k11 * p2) % 26 + 26) % 26;

    const enc1 = String.fromCharCode(c1 + 65);
    const enc2 = String.fromCharCode(c2 + 65);
    ciphertext += enc1 + enc2;

    steps.push({
      pair: [ch1, ch2],
      vector: [p1, p2],
      resultVector: [c1, c2],
      cipherPair: [enc1, enc2],
      calculation: `[${k00}×${p1} + ${k01}×${p2}, ${k10}×${p1} + ${k11}×${p2}] mod 26 = [${c1}, ${c2}]`,
    });
  }

  return {
    ciphertext,
    parametersSummary: `2×2 Matrix [${k00}, ${k01}; ${k10}, ${k11}] (Det: ${validation.det}, Det mod 26: ${validation.detMod26})`,
    inputLength: plaintext.length,
    outputLength: ciphertext.length,
    details: {
      hill: {
        steps,
        matrix,
        determinant: validation.det,
        detMod26: validation.detMod26,
      },
    },
    warningNotice:
      'The Hill cipher is a linear transformation over GF(26). Because matrix multiplication is completely linear, it is vulnerable to a Known-Plaintext Attack using just two 2-character pairs and Gaussian elimination.',
  };
}

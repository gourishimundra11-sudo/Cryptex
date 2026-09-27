import { CaesarStep, CipherResult } from '../types/crypto';

export function caesarCipher(plaintext: string, shift: number): CipherResult {
  // Normalize shift to 0..25
  const normalizedShift = ((shift % 26) + 26) % 26;
  const steps: CaesarStep[] = [];
  let ciphertext = '';

  for (let i = 0; i < plaintext.length; i++) {
    const char = plaintext[i];
    const code = char.charCodeAt(0);

    // Uppercase A-Z
    if (code >= 65 && code <= 90) {
      const shifted = ((code - 65 + normalizedShift) % 26) + 65;
      const cipherChar = String.fromCharCode(shifted);
      ciphertext += cipherChar;
      steps.push({
        plain: char,
        isLetter: true,
        shift: normalizedShift,
        cipher: cipherChar,
      });
    }
    // Lowercase a-z
    else if (code >= 97 && code <= 122) {
      const shifted = ((code - 97 + normalizedShift) % 26) + 97;
      const cipherChar = String.fromCharCode(shifted);
      ciphertext += cipherChar;
      steps.push({
        plain: char,
        isLetter: true,
        shift: normalizedShift,
        cipher: cipherChar,
      });
    }
    // Non-alphabetic: preserve
    else {
      ciphertext += char;
      steps.push({
        plain: char,
        isLetter: false,
        shift: 0,
        cipher: char,
      });
    }
  }

  // Generate 26-letter shift map for visualization
  const shiftMap: { [key: string]: string } = {};
  for (let i = 0; i < 26; i++) {
    const original = String.fromCharCode(65 + i);
    const shifted = String.fromCharCode(65 + ((i + normalizedShift) % 26));
    shiftMap[original] = shifted;
  }

  return {
    ciphertext,
    parametersSummary: `Shift = ${normalizedShift}`,
    inputLength: plaintext.length,
    outputLength: ciphertext.length,
    details: {
      caesar: {
        steps,
        shiftMap,
      },
    },
    warningNotice:
      'Caesar cipher has a key space of only 25 possible shifts and can be trivially cracked in milliseconds via brute-force or frequency analysis.',
  };
}

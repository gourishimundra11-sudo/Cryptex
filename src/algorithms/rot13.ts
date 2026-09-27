import { CipherResult } from '../types/crypto';

export function rot13Cipher(plaintext: string): CipherResult {
  let ciphertext = '';
  const sampleSteps: { plain: string; cipher: string }[] = [];

  for (let i = 0; i < plaintext.length; i++) {
    const char = plaintext[i];
    const code = char.charCodeAt(0);

    if (code >= 65 && code <= 90) {
      const shifted = ((code - 65 + 13) % 26) + 65;
      const cipherChar = String.fromCharCode(shifted);
      ciphertext += cipherChar;
      if (sampleSteps.length < 15) {
        sampleSteps.push({ plain: char, cipher: cipherChar });
      }
    } else if (code >= 97 && code <= 122) {
      const shifted = ((code - 97 + 13) % 26) + 97;
      const cipherChar = String.fromCharCode(shifted);
      ciphertext += cipherChar;
      if (sampleSteps.length < 15) {
        sampleSteps.push({ plain: char, cipher: cipherChar });
      }
    } else {
      ciphertext += char;
    }
  }

  return {
    ciphertext,
    parametersSummary: 'Fixed Rotation = 13 (Self-Inverse)',
    inputLength: plaintext.length,
    outputLength: ciphertext.length,
    details: {
      rot13: {
        sampleSteps,
      },
    },
    warningNotice:
      'ROT13 provides zero confidentiality and is historically used on forums only to obscure spoilers and puzzle answers.',
  };
}

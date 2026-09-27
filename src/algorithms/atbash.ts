import { CipherResult } from '../types/crypto';

export function atbashCipher(plaintext: string): CipherResult {
  const map: { [key: string]: string } = {};
  for (let i = 0; i < 26; i++) {
    const orig = String.fromCharCode(65 + i);
    const rev = String.fromCharCode(90 - i);
    map[orig] = rev;
  }

  let ciphertext = '';
  const sampleSteps: { plain: string; cipher: string }[] = [];

  for (let i = 0; i < plaintext.length; i++) {
    const char = plaintext[i];
    const code = char.charCodeAt(0);

    if (code >= 65 && code <= 90) {
      const mapped = String.fromCharCode(90 - (code - 65));
      ciphertext += mapped;
      if (sampleSteps.length < 15) {
        sampleSteps.push({ plain: char, cipher: mapped });
      }
    } else if (code >= 97 && code <= 122) {
      const mapped = String.fromCharCode(122 - (code - 97));
      ciphertext += mapped;
      if (sampleSteps.length < 15) {
        sampleSteps.push({ plain: char, cipher: mapped });
      }
    } else {
      ciphertext += char;
    }
  }

  return {
    ciphertext,
    parametersSummary: 'Fixed Alphabet Reversal (A ↔ Z)',
    inputLength: plaintext.length,
    outputLength: ciphertext.length,
    details: {
      atbash: {
        map,
        sampleSteps,
      },
    },
    warningNotice:
      'Atbash has zero key space (it is self-reciprocal). Anyone who recognizes the cipher can decipher it immediately without a key.',
  };
}

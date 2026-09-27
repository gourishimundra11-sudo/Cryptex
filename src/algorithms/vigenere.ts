import { CipherResult, VigenereStep } from '../types/crypto';

export function vigenereCipher(plaintext: string, keyword: string): CipherResult {
  const cleanKey = keyword.toUpperCase().replace(/[^A-Z]/g, '');

  if (cleanKey.length === 0) {
    throw new Error('Keyword must contain at least one English alphabetic character (A-Z).');
  }

  const steps: VigenereStep[] = [];
  let ciphertext = '';
  let keyIndex = 0;

  for (let i = 0; i < plaintext.length; i++) {
    const char = plaintext[i];
    const code = char.charCodeAt(0);

    if (code >= 65 && code <= 90) {
      // Uppercase A-Z
      const keyChar = cleanKey[keyIndex % cleanKey.length];
      const shift = keyChar.charCodeAt(0) - 65;
      const cipherChar = String.fromCharCode(((code - 65 + shift) % 26) + 65);
      ciphertext += cipherChar;
      steps.push({
        plain: char,
        isLetter: true,
        keyChar,
        shift,
        cipher: cipherChar,
      });
      keyIndex++;
    } else if (code >= 97 && code <= 122) {
      // Lowercase a-z
      const keyChar = cleanKey[keyIndex % cleanKey.length];
      const shift = keyChar.charCodeAt(0) - 65;
      const cipherChar = String.fromCharCode(((code - 97 + shift) % 26) + 97);
      ciphertext += cipherChar;
      steps.push({
        plain: char,
        isLetter: true,
        keyChar,
        shift,
        cipher: cipherChar,
      });
      keyIndex++;
    } else {
      // Non-alphabetic character preserved
      ciphertext += char;
      steps.push({
        plain: char,
        isLetter: false,
        keyChar: '-',
        shift: 0,
        cipher: char,
      });
    }
  }

  return {
    ciphertext,
    parametersSummary: `Keyword = "${cleanKey}" (Length: ${cleanKey.length})`,
    inputLength: plaintext.length,
    outputLength: ciphertext.length,
    details: {
      vigenere: {
        steps,
      },
    },
    warningNotice:
      'Although once deemed "le chiffre indéchiffrable", Vigenère ciphers are broken using Kasiski examination and Index of Coincidence to determine key length, followed by frequency analysis.',
  };
}

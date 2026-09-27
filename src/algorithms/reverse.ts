import { CipherResult } from '../types/crypto';

export function reverseCipher(plaintext: string): CipherResult {
  const reversed = plaintext.split('').reverse().join('');

  return {
    ciphertext: reversed,
    parametersSummary: 'Direct Character Order Inversion',
    inputLength: plaintext.length,
    outputLength: reversed.length,
    details: {
      reverse: {
        original: plaintext,
        reversed,
      },
    },
    warningNotice:
      'Reverse cipher is an elementary obfuscaton technique offering zero cryptographic protection.',
  };
}

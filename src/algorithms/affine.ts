import { AffineStep, CipherResult } from '../types/crypto';

export function gcd(a: number, b: number): number {
  let x = Math.abs(a);
  let y = Math.abs(b);
  while (y !== 0) {
    const t = y;
    y = x % y;
    x = t;
  }
  return x;
}

export const VALID_AFFINE_A = [1, 3, 5, 7, 9, 11, 15, 17, 19, 21, 23, 25];

export function modInverse(a: number, m: number = 26): number {
  a = ((a % m) + m) % m;
  for (let x = 1; x < m; x++) {
    if ((a * x) % m === 1) {
      return x;
    }
  }
  return 1;
}

export function affineCipher(plaintext: string, a: number, b: number): CipherResult {
  const g = gcd(a, 26);
  if (g !== 1) {
    throw new Error(
      `Invalid multiplier 'a' = ${a}. gcd(${a}, 26) = ${g}. For Affine cipher decryption to be mathematically unique, 'a' must be coprime to 26 (share no factors with 26 other than 1). Divisors 2 and 13 divide 26. Valid values for 'a' are: ${VALID_AFFINE_A.join(', ')}.`
    );
  }

  const normalizedB = ((b % 26) + 26) % 26;
  const aInv = modInverse(a, 26);
  const steps: AffineStep[] = [];
  let ciphertext = '';

  for (let i = 0; i < plaintext.length; i++) {
    const char = plaintext[i];
    const code = char.charCodeAt(0);

    if (code >= 65 && code <= 90) {
      const x = code - 65;
      const rawVal = a * x + normalizedB;
      const resultNum = rawVal % 26;
      const cipherChar = String.fromCharCode(resultNum + 65);
      ciphertext += cipherChar;
      steps.push({
        plain: char,
        isLetter: true,
        x,
        calculation: `(${a} × ${x} + ${normalizedB}) mod 26 = ${rawVal} mod 26`,
        resultNum,
        cipher: cipherChar,
      });
    } else if (code >= 97 && code <= 122) {
      const x = code - 97;
      const rawVal = a * x + normalizedB;
      const resultNum = rawVal % 26;
      const cipherChar = String.fromCharCode(resultNum + 97);
      ciphertext += cipherChar;
      steps.push({
        plain: char,
        isLetter: true,
        x,
        calculation: `(${a} × ${x} + ${normalizedB}) mod 26 = ${rawVal} mod 26`,
        resultNum,
        cipher: cipherChar,
      });
    } else {
      ciphertext += char;
      steps.push({
        plain: char,
        isLetter: false,
        x: 0,
        calculation: 'Non-alphabetic character preserved',
        resultNum: 0,
        cipher: char,
      });
    }
  }

  return {
    ciphertext,
    parametersSummary: `a = ${a}, b = ${normalizedB} (E(x) = (${a}x + ${normalizedB}) mod 26, a⁻¹ = ${aInv})`,
    inputLength: plaintext.length,
    outputLength: ciphertext.length,
    details: {
      affine: {
        steps,
        a,
        b: normalizedB,
        aInverse: aInv,
      },
    },
    warningNotice:
      'Affine cipher combines multiplication and addition modulo 26. Because it remains a monoalphabetic substitution, it is vulnerable to frequency analysis and requires only two known letters to deduce both "a" and "b".',
  };
}

import { CipherResult, PlayfairStep } from '../types/crypto';

export function generatePlayfairMatrix(keyword: string): string[][] {
  const cleanKey = keyword.toUpperCase().replace(/[^A-Z]/g, '').replace(/J/g, 'I');
  const seen = new Set<string>();
  const keyChars: string[] = [];

  for (const ch of cleanKey) {
    if (!seen.has(ch)) {
      seen.add(ch);
      keyChars.push(ch);
    }
  }

  // Fill in the rest of the alphabet (excluding J)
  for (let i = 0; i < 26; i++) {
    const ch = String.fromCharCode(65 + i);
    if (ch === 'J') continue;
    if (!seen.has(ch)) {
      seen.add(ch);
      keyChars.push(ch);
    }
  }

  const matrix: string[][] = [];
  for (let r = 0; r < 5; r++) {
    matrix.push(keyChars.slice(r * 5, (r + 1) * 5));
  }
  return matrix;
}

export function playfairCipher(plaintext: string, keyword: string): CipherResult {
  const matrix = generatePlayfairMatrix(keyword);
  const positionMap = new Map<string, [number, number]>();

  for (let r = 0; r < 5; r++) {
    for (let c = 0; c < 5; c++) {
      positionMap.set(matrix[r][c], [r, c]);
    }
  }

  // Normalize plaintext: letters only, J -> I
  const cleaned = plaintext.toUpperCase().replace(/[^A-Z]/g, '').replace(/J/g, 'I');
  if (cleaned.length === 0) {
    throw new Error('Plaintext must contain at least one alphabetic letter for Playfair cipher.');
  }

  // Prepare digraphs
  const digraphs: [string, string][] = [];
  let i = 0;
  while (i < cleaned.length) {
    const c1 = cleaned[i];
    if (i + 1 >= cleaned.length) {
      // Odd character at the end -> pad with X (or Z if c1 is X)
      const pad = c1 === 'X' ? 'Z' : 'X';
      digraphs.push([c1, pad]);
      i += 1;
    } else {
      const c2 = cleaned[i + 1];
      if (c1 === c2) {
        // Repeated letter -> insert filler X (or Z if c1 is X)
        const filler = c1 === 'X' ? 'Z' : 'X';
        digraphs.push([c1, filler]);
        i += 1;
      } else {
        digraphs.push([c1, c2]);
        i += 2;
      }
    }
  }

  const steps: PlayfairStep[] = [];
  let ciphertext = '';

  for (const [ch1, ch2] of digraphs) {
    const pos1 = positionMap.get(ch1)!;
    const pos2 = positionMap.get(ch2)!;

    let newPos1: [number, number];
    let newPos2: [number, number];
    let rule: 'same-row' | 'same-col' | 'rectangle';
    let description = '';

    if (pos1[0] === pos2[0]) {
      // Same row: shift right circularly
      rule = 'same-row';
      newPos1 = [pos1[0], (pos1[1] + 1) % 5];
      newPos2 = [pos2[0], (pos2[1] + 1) % 5];
      description = `Same row (${pos1[0] + 1}) → shift right`;
    } else if (pos1[1] === pos2[1]) {
      // Same column: shift down circularly
      rule = 'same-col';
      newPos1 = [(pos1[0] + 1) % 5, pos1[1]];
      newPos2 = [(pos2[0] + 1) % 5, pos2[1]];
      description = `Same column (${pos1[1] + 1}) → shift down`;
    } else {
      // Rectangle: swap columns
      rule = 'rectangle';
      newPos1 = [pos1[0], pos2[1]];
      newPos2 = [pos2[0], pos1[1]];
      description = `Rectangle → opposite column corners`;
    }

    const enc1 = matrix[newPos1[0]][newPos1[1]];
    const enc2 = matrix[newPos2[0]][newPos2[1]];
    ciphertext += enc1 + enc2;

    steps.push({
      digraph: [ch1, ch2],
      transformed: [enc1, enc2],
      rule,
      description,
      pos1,
      pos2,
      newPos1,
      newPos2,
    });
  }

  return {
    ciphertext,
    parametersSummary: `Keyword = "${keyword.toUpperCase().replace(/[^A-Z]/g, '') || 'KEY'}" (5×5 Matrix, J merged with I)`,
    inputLength: plaintext.length,
    outputLength: ciphertext.length,
    details: {
      playfair: {
        matrix,
        steps,
        normalizedText: cleaned,
      },
    },
    warningNotice:
      'Playfair ciphers encrypt digraphs rather than single letters, flattening single-letter frequency analysis. However, digraph frequency analysis (e.g. TH, HE, IN) easily breaks Playfair.',
  };
}

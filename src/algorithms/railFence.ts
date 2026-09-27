import { CipherResult, RailFenceVisual } from '../types/crypto';

export function railFenceCipher(plaintext: string, rails: number): CipherResult {
  if (rails < 2) {
    throw new Error('Rail Fence cipher requires at least 2 rails.');
  }

  if (plaintext.length === 0) {
    throw new Error('Plaintext cannot be empty.');
  }

  const effectiveRails = Math.min(rails, plaintext.length);
  const len = plaintext.length;

  // Initialize visual grid
  const grid: (string | null)[][] = Array.from({ length: effectiveRails }, () =>
    Array(len).fill(null)
  );

  let currentRail = 0;
  let directionDown = false;

  for (let col = 0; col < len; col++) {
    grid[currentRail][col] = plaintext[col];

    if (currentRail === 0 || currentRail === effectiveRails - 1) {
      directionDown = !directionDown;
    }

    currentRail += directionDown ? 1 : -1;
  }

  // Read row by row
  let ciphertext = '';
  const readOrder: { char: string; rail: number; col: number }[] = [];

  for (let r = 0; r < effectiveRails; r++) {
    for (let c = 0; c < len; c++) {
      if (grid[r][c] !== null) {
        ciphertext += grid[r][c]!;
        readOrder.push({ char: grid[r][c]!, rail: r, col: c });
      }
    }
  }

  const visual: RailFenceVisual = {
    rails: effectiveRails,
    grid,
    readOrder,
  };

  return {
    ciphertext,
    parametersSummary: `Rails = ${effectiveRails}`,
    inputLength: plaintext.length,
    outputLength: ciphertext.length,
    details: {
      railFence: visual,
    },
    warningNotice:
      'Rail fence is a transposition cipher that preserves letter frequencies while merely shuffling character order. An attacker only needs to test small rail counts (2 to N) to reconstruct the original text.',
  };
}

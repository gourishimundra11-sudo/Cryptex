import { CipherResult, ColumnarVisual } from '../types/crypto';

export function getColumnarOrder(keyword: string): number[] {
  const chars = keyword.toUpperCase().split('');
  const indexed = chars.map((char, index) => ({ char, index }));

  // Sort alphabetically by char, then by original index for ties
  indexed.sort((a, b) => {
    if (a.char < b.char) return -1;
    if (a.char > b.char) return 1;
    return a.index - b.index;
  });

  // Assign order (1-indexed)
  const order = new Array(chars.length);
  indexed.forEach((item, sortedPos) => {
    order[item.index] = sortedPos + 1;
  });

  return order;
}

export function columnarTranspositionCipher(
  plaintext: string,
  keyword: string
): CipherResult {
  const cleanKey = keyword.toUpperCase().replace(/[^A-Z]/g, '');
  if (cleanKey.length === 0) {
    throw new Error('Keyword must contain at least one alphabetic character (A-Z).');
  }

  if (plaintext.length === 0) {
    throw new Error('Plaintext cannot be empty.');
  }

  const numCols = cleanKey.length;
  const colOrder = getColumnarOrder(cleanKey);

  // Write plaintext into rows of width numCols
  const numRows = Math.ceil(plaintext.length / numCols);
  const grid: string[][] = [];

  let charIdx = 0;
  for (let r = 0; r < numRows; r++) {
    const row: string[] = [];
    for (let c = 0; c < numCols; c++) {
      if (charIdx < plaintext.length) {
        row.push(plaintext[charIdx]);
        charIdx++;
      } else {
        // Pad with 'X' to complete rectangle
        row.push('X');
      }
    }
    grid.push(row);
  }

  // Read columns by sorted order (1, 2, ..., numCols)
  // Create an array mapping order rank -> column index
  const orderToColIndex: { order: number; colIndex: number }[] = [];
  for (let c = 0; c < numCols; c++) {
    orderToColIndex.push({ order: colOrder[c], colIndex: c });
  }
  orderToColIndex.sort((a, b) => a.order - b.order);

  let ciphertext = '';
  const readOrder: { colIndex: number; order: number; text: string }[] = [];

  for (const item of orderToColIndex) {
    let colText = '';
    for (let r = 0; r < numRows; r++) {
      colText += grid[r][item.colIndex];
    }
    ciphertext += colText;
    readOrder.push({
      colIndex: item.colIndex,
      order: item.order,
      text: colText,
    });
  }

  const visual: ColumnarVisual = {
    keyword: cleanKey,
    colOrder,
    grid,
    readOrder,
  };

  return {
    ciphertext,
    parametersSummary: `Keyword = "${cleanKey}" (${numCols} Columns, Sorted Order: ${colOrder.join('-')})`,
    inputLength: plaintext.length,
    outputLength: ciphertext.length,
    details: {
      columnar: visual,
    },
    warningNotice:
      'Transposition ciphers do not alter character frequencies. By anagramming columns or examining digraph probabilities, columnar transpositions can be reconstructed without knowing the secret keyword.',
  };
}

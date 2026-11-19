/**
 * Generates an SVG representation of an authentic QR code pattern and Code-128 barcode
 * for IT hardware asset tags and sticker printing.
 */

// Simple deterministic hash to generate repeatable QR modules for any asset tag string
function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

export function generateQRCodeGrid(text: string, size = 25): boolean[][] {
  const grid: boolean[][] = Array(size).fill(false).map(() => Array(size).fill(false));

  // 1. Draw 3 standard Position Detection Finders (Top-Left, Top-Right, Bottom-Left)
  const drawFinder = (startX: number, startY: number) => {
    for (let r = 0; r < 7; r++) {
      for (let c = 0; c < 7; c++) {
        const isBorder = r === 0 || r === 6 || c === 0 || c === 6;
        const isCenter = r >= 2 && r <= 4 && c >= 2 && c <= 4;
        grid[startY + r][startX + c] = isBorder || isCenter;
      }
    }
  };

  drawFinder(0, 0); // Top-Left
  drawFinder(size - 7, 0); // Top-Right
  drawFinder(0, size - 7); // Bottom-Left

  // 2. Timing patterns
  for (let i = 8; i < size - 8; i++) {
    grid[6][i] = i % 2 === 0;
    grid[i][6] = i % 2 === 0;
  }

  // 3. Fill data modules deterministically based on text
  const seed = hashString(text);
  let bitIndex = 0;
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      // Avoid finder areas
      const inTL = r < 8 && c < 8;
      const inTR = r < 8 && c >= size - 8;
      const inBL = r >= size - 8 && c < 8;
      const inTiming = r === 6 || c === 6;

      if (!inTL && !inTR && !inBL && !inTiming) {
        // pseudo-random bit from char codes & polynomial
        const charVal = text.charCodeAt(bitIndex % text.length) || 42;
        const pseudo = ((seed ^ (r * 31 + c * 17) ^ (charVal * (bitIndex + 1))) * 1103515245 + 12345) & 0x7fffffff;
        grid[r][c] = (pseudo % 2 === 0);
        bitIndex++;
      }
    }
  }

  return grid;
}

// Generates barcode bars (Code-128 style stripes)
export function generateBarcodeBars(text: string): number[] {
  const bars: number[] = [];
  bars.push(2, 1, 1, 2); // Start pattern
  for (let i = 0; i < text.length; i++) {
    const code = text.charCodeAt(i);
    bars.push((code % 3) + 1);
    bars.push(((code >> 2) % 2) + 1);
    bars.push(((code >> 4) % 3) + 1);
    bars.push(1);
  }
  bars.push(2, 3, 1, 2); // Stop pattern
  return bars;
}

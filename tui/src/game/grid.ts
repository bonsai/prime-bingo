import { isPrime } from "./rules";

export const ROWS = 7;
export const COLS = 7;

export type Grid = Array<Array<number | null>>;

export interface Break {
  r: number;
  c: number;
  /** the adjacent neighbor value that makes this tile break */
  by: number;
}

export function emptyGrid(): Grid {
  return Array.from({ length: ROWS }, () => Array<number | null>(COLS).fill(null));
}

/** Row where a tile dropped into `col` would come to rest. -1 = column full. */
export function landingRow(grid: Grid, col: number): number {
  for (let r = ROWS - 1; r >= 0; r--) {
    if (grid[r][col] === null) return r;
  }
  return -1;
}

/** Compact every column downward (no floating tiles). */
export function applyGravity(grid: Grid): void {
  for (let c = 0; c < COLS; c++) {
    let write = ROWS - 1;
    for (let r = ROWS - 1; r >= 0; r--) {
      const v = grid[r][c];
      if (v !== null) {
        grid[write][c] = v;
        if (write !== r) grid[r][c] = null;
        write--;
      }
    }
  }
}

/**
 * Composite tiles that qualify to break: value is an exact multiple of at
 * least one orthogonally adjacent tile (and not equal to it).
 * Prime tiles are never returned — primes cannot break.
 */
export function findBreaks(grid: Grid): Break[] {
  const out: Break[] = [];
  const dirs = [
    [-1, 0],
    [1, 0],
    [0, -1],
    [0, 1],
  ];
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const v = grid[r][c];
      if (v === null || isPrime(v)) continue;
      for (const [dr, dc] of dirs) {
        const nr = r + dr;
        const nc = c + dc;
        if (nr < 0 || nr >= ROWS || nc < 0 || nc >= COLS) continue;
        const u = grid[nr][nc];
        if (u !== null && u !== v && v % u === 0) {
          out.push({ r, c, by: u });
          break;
        }
      }
    }
  }
  return out;
}

/** Number of prime tiles orthogonally adjacent to (r,c) — used for the "trapped harvest" bonus. */
export function orthoPrimeCount(grid: Grid, r: number, c: number): number {
  const dirs = [
    [-1, 0],
    [1, 0],
    [0, -1],
    [0, 1],
  ];
  let n = 0;
  for (const [dr, dc] of dirs) {
    const nr = r + dr;
    const nc = c + dc;
    if (nr < 0 || nr >= ROWS || nc < 0 || nc >= COLS) continue;
    const v = grid[nr][nc];
    if (v !== null && isPrime(v)) n++;
  }
  return n;
}

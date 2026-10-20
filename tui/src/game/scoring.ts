/** Base 10, +5 for each further step of the same gravity cascade: 10, 15, 20, ... */
export function cascadePoints(chain: number, tileCount: number): number {
  return (10 + 5 * chain) * tileCount;
}

export const PRIME_TRAP_BONUS = 25;

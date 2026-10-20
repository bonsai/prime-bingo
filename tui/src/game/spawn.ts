const RANGES: Record<number, [number, number]> = {
  1: [2, 12], // small primes, obvious multiples
  2: [2, 20], // introduces squares (4, 9, 16)
  3: [2, 30], // larger primes: 17, 19, 23, 29
};

export function levelFor(drops: number): number {
  if (drops < 10) return 1;
  if (drops < 25) return 2;
  return 3;
}

export function spawnValue(level: number): number {
  const [min, max] = RANGES[level] ?? RANGES[1];
  return min + Math.floor(Math.random() * (max - min + 1));
}

export function isPrime(n: number): boolean {
  if (n < 2) return false;
  for (let i = 2; i * i <= n; i++) {
    if (n % i === 0) return false;
  }
  return true;
}

export function factorPairs(n: number): Array<[number, number]> {
  const out: Array<[number, number]> = [];
  for (let i = 2; i * i <= n; i++) {
    if (n % i === 0) out.push([i, n / i]);
  }
  return out;
}

/** Human-readable explanation used by the inspect mode / teaching lines. */
export function describeTile(n: number): string {
  if (isPrime(n)) {
    return `${n} is PRIME — factors are 1 and ${n}, so it can never break`;
  }
  const [a, b] = factorPairs(n)[0];
  return `${n} = ${a} × ${b} — composite, a multiple of ${a} (and ${b})`;
}

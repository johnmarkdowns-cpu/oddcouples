/**
 * Normalize a pair of image IDs so that order doesn't matter.
 * Always returns [smaller, larger] lexicographically.
 */
export function normalizePair(a: string, b: string): [string, string] {
  return a <= b ? [a, b] : [b, a];
}

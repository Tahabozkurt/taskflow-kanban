export const POSITION_STEP = 1024;

export function getBetweenPosition(previous?: number, next?: number): number {
  if (previous == null && next == null) return POSITION_STEP;
  if (previous == null && next != null) return next / 2;
  if (previous != null && next == null) return previous + POSITION_STEP;
  return (previous! + next!) / 2;
}

export function byPosition<T extends { position: number }>(items: T[]): T[] {
  return [...items].sort((a, b) => a.position - b.position);
}

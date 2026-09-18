export function todayUtc(): string {
  return new Date().toISOString().slice(0, 10);
}

export function puzzleNumber(date: string): number {
  const start = Date.UTC(2026, 0, 1);
  const current = Date.parse(`${date}T00:00:00Z`);
  return Math.floor((current - start) / 86_400_000) + 1;
}

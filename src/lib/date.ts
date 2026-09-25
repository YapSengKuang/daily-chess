export function todayUtc(): string {
  return new Date().toISOString().slice(0, 10);
}

export function puzzleNumber(date: string): number {
  const start = Date.UTC(2026, 0, 1);
  const current = Date.parse(`${date}T00:00:00Z`);
  return Math.floor((current - start) / 86_400_000) + 1;
}

export function shiftDay(isoDate: string, delta: number): string {
  const date = new Date(`${isoDate}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + delta);
  return date.toISOString().slice(0, 10);
}

export function isIsoDate(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(`${value}T00:00:00Z`));
}

export function nextUtcMidnight(from = new Date()): Date {
  return new Date(Date.UTC(from.getUTCFullYear(), from.getUTCMonth(), from.getUTCDate() + 1));
}

export function msUntilNextUtcMidnight(from = new Date()): number {
  return Math.max(0, nextUtcMidnight(from).getTime() - from.getTime());
}

export function formatCountdown(ms: number): string {
  const total = Math.floor(ms / 1000);
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const seconds = total % 60;
  return [hours, minutes, seconds].map((part) => String(part).padStart(2, "0")).join(":");
}

export function monthKey(date: string): string {
  return date.slice(0, 7);
}

export function daysInUtcMonth(year: number, monthIndex: number): number {
  return new Date(Date.UTC(year, monthIndex + 1, 0)).getUTCDate();
}

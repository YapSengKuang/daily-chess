export type AttemptRow = {
  puzzle_date: string;
  solved: boolean;
};

export function currentStreak(
  attempts: AttemptRow[],
  today: string,
): number {
  const solvedDays = new Set(
    attempts.filter((attempt) => attempt.solved).map((attempt) => attempt.puzzle_date),
  );

  let cursor = today;
  if (!solvedDays.has(cursor)) {
    cursor = shiftDay(cursor, -1);
  }

  let streak = 0;
  while (solvedDays.has(cursor)) {
    streak += 1;
    cursor = shiftDay(cursor, -1);
  }
  return streak;
}

function shiftDay(isoDate: string, delta: number): string {
  const date = new Date(`${isoDate}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + delta);
  return date.toISOString().slice(0, 10);
}

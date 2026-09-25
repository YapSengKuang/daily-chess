import { shiftDay } from "./date";

export type AttemptRow = {
  puzzle_date: string;
  solved: boolean;
};

export function currentStreak(attempts: AttemptRow[], today: string): number {
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

export function longestStreak(attempts: AttemptRow[]): number {
  const days = [
    ...new Set(attempts.filter((attempt) => attempt.solved).map((attempt) => attempt.puzzle_date)),
  ].sort();

  let best = 0;
  let run = 0;
  let previous: string | null = null;
  for (const day of days) {
    run = previous && shiftDay(previous, 1) === day ? run + 1 : 1;
    best = Math.max(best, run);
    previous = day;
  }
  return best;
}

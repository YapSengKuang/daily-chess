import type { PlyResult } from "./share";
import { todayUtc } from "./date";
import { currentStreak, longestStreak } from "./streak";

export type StoredAttempt = {
  solved: boolean;
  failed: boolean;
  completed: boolean;
  results: PlyResult[];
  livesLeft?: number;
};

export type AccountStats = {
  played: number;
  solved: number;
  failed: number;
  currentStreak: number;
  maxStreak: number;
  solveRate: number;
  avgLivesLeft: number;
};

const PLY_RESULTS = new Set<PlyResult>(["correct", "retry", "miss", "empty"]);

export function isPlyResult(value: unknown): value is PlyResult {
  return typeof value === "string" && PLY_RESULTS.has(value as PlyResult);
}

export function parseStoredAttempt(value: unknown): StoredAttempt | null {
  if (!value || typeof value !== "object") return null;
  const row = value as Record<string, unknown>;
  if (typeof row.solved !== "boolean" || typeof row.failed !== "boolean") return null;
  const results = Array.isArray(row.results) ? row.results.filter(isPlyResult) : [];
  const livesLeft =
    typeof row.livesLeft === "number"
      ? row.livesLeft
      : typeof row.lives_left === "number"
        ? row.lives_left
        : undefined;
  return {
    solved: row.solved,
    failed: row.failed,
    completed: row.completed === false ? false : true,
    results,
    livesLeft,
  };
}

export function computeStats(
  attempts: Record<string, StoredAttempt>,
  today = todayUtc(),
): AccountStats {
  const completed = Object.values(attempts).filter((attempt) => attempt.completed);
  const solved = completed.filter((attempt) => attempt.solved).length;
  const failed = completed.filter((attempt) => attempt.failed || !attempt.solved).length;
  const livesValues = completed
    .map((attempt) => attempt.livesLeft)
    .filter((value): value is number => typeof value === "number");
  const rows = Object.entries(attempts).map(([puzzle_date, attempt]) => ({
    puzzle_date,
    solved: attempt.solved,
  }));
  return {
    played: completed.length,
    solved,
    failed,
    currentStreak: currentStreak(rows, today),
    maxStreak: longestStreak(rows),
    solveRate: completed.length === 0 ? 0 : Math.round((solved / completed.length) * 100),
    avgLivesLeft:
      livesValues.length === 0
        ? 0
        : Math.round((livesValues.reduce((sum, value) => sum + value, 0) / livesValues.length) * 10) /
          10,
  };
}

import { isIsoDate, todayUtc } from "./date";
import {
  computeStats,
  parseStoredAttempt,
  type AccountStats,
  type StoredAttempt,
} from "./progress-types";
import type { PlyResult } from "./share";
import { supabaseAdmin } from "./supabase";

type AttemptRow = {
  user_id: string;
  puzzle_date: string;
  solved: boolean;
  failed: boolean;
  completed: boolean;
  results: PlyResult[];
  lives_left: number | null;
};

export type ProgressPayload = {
  signedIn: true;
  streak: number;
  stats: AccountStats;
  attempts: Record<string, StoredAttempt>;
};

function requireDb() {
  const db = supabaseAdmin();
  if (!db) {
    throw new Error("Supabase is not configured");
  }
  return db;
}

function asAttempts(rows: AttemptRow[]): Record<string, StoredAttempt> {
  const attempts: Record<string, StoredAttempt> = {};
  for (const row of rows) {
    attempts[row.puzzle_date] = {
      solved: row.solved,
      failed: row.failed,
      completed: row.completed,
      results: Array.isArray(row.results) ? row.results : [],
      livesLeft: row.lives_left ?? undefined,
    };
  }
  return attempts;
}

export async function upsertUser(user: {
  id: string;
  email?: string | null;
  name?: string | null;
  image?: string | null;
}) {
  const db = supabaseAdmin();
  if (!db) return;
  const { error } = await db.from("users").upsert({
    id: user.id,
    email: user.email ?? null,
    name: user.name ?? null,
    image: user.image ?? null,
  });
  if (error) throw error;
}

export async function loadUserProgress(userId: string): Promise<ProgressPayload> {
  const db = requireDb();
  const { data, error } = await db.from("attempts").select("*").eq("user_id", userId);
  if (error) throw error;
  const attempts = asAttempts((data ?? []) as AttemptRow[]);
  const stats = computeStats(attempts, todayUtc());
  return {
    signedIn: true,
    streak: stats.currentStreak,
    stats,
    attempts,
  };
}

export async function saveUserAttempt(
  userId: string,
  date: string,
  attempt: {
    solved: boolean;
    failed: boolean;
    results: PlyResult[];
    livesLeft: number;
  },
): Promise<ProgressPayload> {
  if (!isIsoDate(date) || date > todayUtc()) {
    throw new Error("That puzzle is not available yet");
  }
  const db = requireDb();
  const { error } = await db.from("attempts").upsert({
    user_id: userId,
    puzzle_date: date,
    solved: attempt.solved,
    failed: attempt.failed,
    completed: true,
    results: attempt.results,
    lives_left: attempt.livesLeft,
    updated_at: new Date().toISOString(),
  });
  if (error) throw error;
  return loadUserProgress(userId);
}

export async function importLocalAttempts(
  userId: string,
  incoming: Record<string, unknown>,
): Promise<{ imported: number; skipped: boolean }> {
  const existing = await loadUserProgress(userId);
  if (Object.keys(existing.attempts).length > 0) {
    return { imported: 0, skipped: true };
  }

  const rows: AttemptRow[] = [];
  for (const [date, value] of Object.entries(incoming)) {
    if (!isIsoDate(date) || date > todayUtc()) continue;
    const attempt = parseStoredAttempt(value);
    if (!attempt?.completed) continue;
    rows.push({
      user_id: userId,
      puzzle_date: date,
      solved: attempt.solved,
      failed: attempt.failed,
      completed: true,
      results: attempt.results,
      lives_left: attempt.livesLeft ?? null,
    });
  }

  if (rows.length === 0) return { imported: 0, skipped: false };

  const db = requireDb();
  const { error } = await db.from("attempts").insert(
    rows.map((row) => ({
      ...row,
      updated_at: new Date().toISOString(),
    })),
  );
  if (error) throw error;
  return { imported: rows.length, skipped: false };
}

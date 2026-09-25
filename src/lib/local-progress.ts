import type { Attempt } from "./chess";
import { computeStats, type AccountStats, type StoredAttempt } from "./progress-types";
import { todayUtc } from "./date";
import type { PlyResult } from "./share";

export type { AccountStats as LocalStats, StoredAttempt };

const KEY = "daily-chess-progress";

type Store = {
  attempts: Record<string, StoredAttempt>;
};

function readStore(): Store {
  if (typeof window === "undefined") return { attempts: {} };
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return { attempts: {} };
    const parsed = JSON.parse(raw) as Store;
    return { attempts: parsed.attempts ?? {} };
  } catch {
    return { attempts: {} };
  }
}

function writeStore(store: Store) {
  window.localStorage.setItem(KEY, JSON.stringify(store));
}

export function replaceLocalAttempts(attempts: Record<string, StoredAttempt>) {
  writeStore({ attempts });
}

export function getAllAttempts(): Record<string, StoredAttempt> {
  return readStore().attempts;
}

export function loadLocalProgress(today: string): {
  streak: number;
  attempt: (Attempt & { livesLeft?: number }) | null;
} {
  const store = readStore();
  const todayRow = store.attempts[today];
  return {
    streak: computeStats(store.attempts, today).currentStreak,
    attempt: todayRow
      ? {
          completed: todayRow.completed,
          solved: todayRow.solved,
          failed: todayRow.failed,
          results: todayRow.results,
          livesLeft: todayRow.livesLeft,
        }
      : null,
  };
}

export function saveLocalAttempt(
  date: string,
  attempt: {
    solved: boolean;
    failed: boolean;
    results: PlyResult[];
    livesLeft: number;
  },
): number {
  const store = readStore();
  store.attempts[date] = {
    solved: attempt.solved,
    failed: attempt.failed,
    completed: true,
    results: attempt.results,
    livesLeft: attempt.livesLeft,
  };
  writeStore(store);
  return loadLocalProgress(date).streak;
}

export function getLocalStats(): AccountStats {
  return computeStats(readStore().attempts, todayUtc());
}

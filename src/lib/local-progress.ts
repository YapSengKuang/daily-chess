import type { Attempt } from "./chess";
import { computeStats, type AccountStats, type StoredAttempt } from "./progress-types";
import { todayUtc } from "./date";

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

export function getAllAttempts(): Record<string, StoredAttempt> {
  return readStore().attempts;
}

export function clearLocalProgress() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(KEY);
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

export function getLocalStats(): AccountStats {
  return computeStats(readStore().attempts, todayUtc());
}

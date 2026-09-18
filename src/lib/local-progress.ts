import type { Attempt } from "./chess";
import type { PlyResult } from "./share";
import { currentStreak } from "./streak";

const KEY = "daily-chess-progress";

type Store = {
  attempts: Record<
    string,
    {
      solved: boolean;
      failed: boolean;
      completed: boolean;
      results: PlyResult[];
    }
  >;
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

export function loadLocalProgress(today: string): {
  streak: number;
  attempt: Attempt | null;
} {
  const store = readStore();
  const rows = Object.entries(store.attempts).map(([puzzle_date, attempt]) => ({
    puzzle_date,
    solved: attempt.solved,
  }));
  const todayRow = store.attempts[today];
  return {
    streak: currentStreak(rows, today),
    attempt: todayRow
      ? {
          completed: todayRow.completed,
          solved: todayRow.solved,
          failed: todayRow.failed,
          results: todayRow.results,
        }
      : null,
  };
}

export function saveLocalAttempt(
  today: string,
  attempt: {
    solved: boolean;
    failed: boolean;
    results: PlyResult[];
  },
): number {
  const store = readStore();
  store.attempts[today] = {
    solved: attempt.solved,
    failed: attempt.failed,
    completed: true,
    results: attempt.results,
  };
  writeStore(store);
  return loadLocalProgress(today).streak;
}

"use client";

import { clearLocalProgress, getAllAttempts } from "@/lib/local-progress";
import type { AccountStats, StoredAttempt } from "@/lib/progress-types";
import { useSession } from "next-auth/react";
import { useCallback, useEffect, useState } from "react";

export type RemoteProgress = {
  streak: number;
  stats: AccountStats;
  attempts: Record<string, StoredAttempt>;
};

async function fetchProgress(): Promise<
  | { signedIn: false }
  | ({ signedIn: true } & RemoteProgress)
  | { error: string }
> {
  const response = await fetch("/api/progress");
  const body = (await response.json()) as
    | { signedIn: false }
    | ({ signedIn: true } & RemoteProgress)
    | { error: string };
  if (!response.ok) {
    return { error: "error" in body ? body.error : "Could not load progress" };
  }
  return body;
}

let migratePromise: Promise<void> | null = null;

async function migrateIfNeeded() {
  if (!migratePromise) {
    migratePromise = (async () => {
      const local = getAllAttempts();
      if (Object.keys(local).length === 0) return;
      const response = await fetch("/api/progress/migrate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ attempts: local }),
      });
      if (response.ok) {
        clearLocalProgress();
      }
    })().finally(() => {
      migratePromise = null;
    });
  }
  await migratePromise;
}

export function useAccountProgress() {
  const { data: session, status } = useSession();
  const [progress, setProgress] = useState<RemoteProgress | null>(null);
  const [error, setError] = useState("");

  const reload = useCallback(async () => {
    const next = await fetchProgress();
    if ("error" in next) {
      setError(next.error);
      return null;
    }
    if (!next.signedIn) {
      setProgress(null);
      setError("");
      return null;
    }
    await migrateIfNeeded();
    const imported = await fetchProgress();
    const payload =
      !("error" in imported) && imported.signedIn ? imported : next;
    if (!payload.signedIn) {
      setProgress(null);
      return null;
    }
    setError("");
    const remote = { streak: payload.streak, stats: payload.stats, attempts: payload.attempts };
    setProgress(remote);
    return remote;
  }, []);

  useEffect(() => {
    void reload();
  }, [reload, session?.user?.id, status]);

  return {
    status,
    signedIn: status === "authenticated",
    progress,
    error,
    reload,
  };
}

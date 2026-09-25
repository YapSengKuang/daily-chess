"use client";

import { collection, doc, getDocs, setDoc } from "firebase/firestore";
import { getCurrentUser, getFirebaseDb } from "./firebase";
import {
  clearLocalProgress,
  getAllAttempts,
  getProgressOwner,
  replaceLocalAttempts,
  saveLocalAttempt,
  setProgressOwner,
  type StoredAttempt,
} from "./local-progress";
import { parseStoredAttempt } from "./progress-types";
import type { PlyResult } from "./share";

function attemptsCollection(uid: string) {
  const db = getFirebaseDb();
  if (!db) return null;
  return collection(db, "users", uid, "attempts");
}

async function fetchRemoteAttempts(uid: string): Promise<Record<string, StoredAttempt>> {
  const ref = attemptsCollection(uid);
  if (!ref) return {};
  const snapshot = await getDocs(ref);
  const attempts: Record<string, StoredAttempt> = {};
  snapshot.forEach((row) => {
    const parsed = parseStoredAttempt(row.data());
    if (parsed) attempts[row.id] = parsed;
  });
  return attempts;
}

async function writeRemoteAttempt(uid: string, date: string, attempt: StoredAttempt) {
  const db = getFirebaseDb();
  if (!db) return;
  await setDoc(doc(db, "users", uid, "attempts", date), {
    solved: attempt.solved,
    failed: attempt.failed,
    completed: attempt.completed,
    results: attempt.results,
    livesLeft: attempt.livesLeft ?? null,
    updatedAt: new Date().toISOString(),
  });
}

let boot: Promise<void> | null = null;

async function syncUserProgress() {
  const user = await getCurrentUser();
  if (!user || user.isAnonymous) {
    if (getProgressOwner()) {
      clearLocalProgress();
    }
    return;
  }

  const remote = await fetchRemoteAttempts(user.uid);
  const local = getAllAttempts();
  const owner = getProgressOwner();
  const sameOwner = !owner || owner === user.uid;
  const remoteCount = Object.keys(remote).length;
  const localCount = Object.keys(local).length;

  if (owner && owner !== user.uid) {
    replaceLocalAttempts(remote);
    setProgressOwner(user.uid);
    return;
  }

  if (remoteCount === 0 && localCount > 0 && sameOwner) {
    await Promise.all(
      Object.entries(local).map(([date, attempt]) => writeRemoteAttempt(user.uid, date, attempt)),
    );
    setProgressOwner(user.uid);
    return;
  }

  if (remoteCount > 0) {
    replaceLocalAttempts(remote);
  } else {
    replaceLocalAttempts({});
  }
  setProgressOwner(user.uid);
}

export function bootstrapProgress(): Promise<void> {
  if (!boot) {
    boot = (async () => {
      try {
        await syncUserProgress();
      } catch (error) {
        console.error("Firebase progress sync failed", error);
        boot = null;
      }
    })();
  }
  return boot;
}

export function resetProgressSync(): Promise<void> {
  boot = null;
  return bootstrapProgress();
}

export async function saveProgressAttempt(
  date: string,
  attempt: {
    solved: boolean;
    failed: boolean;
    results: PlyResult[];
    livesLeft: number;
  },
): Promise<number> {
  const streak = saveLocalAttempt(date, attempt);
  try {
    const user = await getCurrentUser();
    if (user && !user.isAnonymous) {
      setProgressOwner(user.uid);
      await writeRemoteAttempt(user.uid, date, {
        solved: attempt.solved,
        failed: attempt.failed,
        completed: true,
        results: attempt.results,
        livesLeft: attempt.livesLeft,
      });
    }
  } catch (error) {
    console.error("Could not save progress to Firebase", error);
  }
  return streak;
}

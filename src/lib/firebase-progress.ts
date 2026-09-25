"use client";

import { collection, doc, getDocs, setDoc } from "firebase/firestore";
import { getCurrentUser, getFirebaseDb } from "./firebase";
import {
  getAllAttempts,
  replaceLocalAttempts,
  saveLocalAttempt,
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
  if (!user) return;
  const remote = await fetchRemoteAttempts(user.uid);
  const local = getAllAttempts();
  const remoteCount = Object.keys(remote).length;
  const localCount = Object.keys(local).length;
  if (remoteCount === 0 && localCount > 0) {
    await Promise.all(
      Object.entries(local).map(([date, attempt]) => writeRemoteAttempt(user.uid, date, attempt)),
    );
    return;
  }
  if (remoteCount > 0) {
    replaceLocalAttempts(remote);
  }
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
    if (user) {
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

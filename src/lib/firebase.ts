"use client";

import { getAnalytics, isSupported } from "firebase/analytics";
import { getApp, getApps, initializeApp, type FirebaseApp } from "firebase/app";
import {
  createUserWithEmailAndPassword,
  EmailAuthProvider,
  GoogleAuthProvider,
  getAuth,
  linkWithCredential,
  linkWithPopup,
  onAuthStateChanged,
  signInWithCredential,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut as firebaseSignOut,
  updateProfile,
  type Auth,
  type User,
} from "firebase/auth";
import { doc, getFirestore, setDoc, type Firestore } from "firebase/firestore";
import { getFirebaseConfig, isFirebaseConfigured } from "./firebase-config";

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;
let analyticsStarted = false;

function getAppInstance() {
  if (!isFirebaseConfigured() || typeof window === "undefined") return null;
  if (!app) {
    app = getApps().length ? getApp() : initializeApp(getFirebaseConfig());
  }
  return app;
}

export function getFirebaseAuth() {
  const instance = getAppInstance();
  if (!instance) return null;
  if (!auth) auth = getAuth(instance);
  return auth;
}

export function getFirebaseDb() {
  const instance = getAppInstance();
  if (!instance) return null;
  if (!db) db = getFirestore(instance);
  return db;
}

async function startAnalytics() {
  if (analyticsStarted) return;
  analyticsStarted = true;
  const instance = getAppInstance();
  if (!instance) return;
  try {
    if (await isSupported()) getAnalytics(instance);
  } catch {
    // Analytics is optional.
  }
}

export async function getCurrentUser(): Promise<User | null> {
  const firebaseAuth = getFirebaseAuth();
  if (!firebaseAuth) return null;
  void startAnalytics();
  await firebaseAuth.authStateReady();
  return firebaseAuth.currentUser;
}

export function authErrorMessage(error: unknown) {
  const code = error && typeof error === "object" && "code" in error ? String(error.code) : "";
  if (code.includes("popup-closed")) return "Sign-in popup was closed.";
  if (code.includes("unauthorized-domain")) {
    return "Add this site to Firebase authorized domains (localhost, 127.0.0.1, and your Vercel host).";
  }
  if (code.includes("email-already-in-use")) return "That email already has an account. Sign in instead.";
  if (code.includes("invalid-credential") || code.includes("wrong-password") || code.includes("user-not-found")) {
    return "Email or password is incorrect.";
  }
  if (code.includes("weak-password")) return "Password must be at least 6 characters.";
  if (code.includes("invalid-email")) return "Enter a valid email address.";
  if (code.includes("too-many-requests")) return "Too many attempts. Try again later.";
  return error instanceof Error ? error.message : "Could not sign in.";
}

async function afterAccountChange() {
  const { resetProgressSync } = await import("./firebase-progress");
  await resetProgressSync();
}

export async function signInWithGoogle() {
  const firebaseAuth = getFirebaseAuth();
  if (!firebaseAuth) throw new Error("Firebase is not configured");
  await firebaseAuth.authStateReady();
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: "select_account" });
  const current = firebaseAuth.currentUser;
  try {
    if (current?.isAnonymous) {
      await linkWithPopup(current, provider);
    } else {
      await signInWithPopup(firebaseAuth, provider);
    }
  } catch (error) {
    const code = error && typeof error === "object" && "code" in error ? String(error.code) : "";
    const credential = GoogleAuthProvider.credentialFromError(error as Parameters<typeof GoogleAuthProvider.credentialFromError>[0]);
    if (credential && (code.includes("credential-already-in-use") || code.includes("email-already-in-use"))) {
      await signInWithCredential(firebaseAuth, credential);
    } else {
      throw error;
    }
  }
  await afterAccountChange();
}

export function accountLabel(user: User | null | undefined) {
  if (!user || user.isAnonymous) return "Guest";
  return user.displayName?.trim() || user.email || "Signed in";
}

export async function saveUsername(username: string) {
  const value = username.trim();
  if (value.length < 2) throw new Error("Username must be at least 2 characters.");
  const firebaseAuth = getFirebaseAuth();
  const user = firebaseAuth?.currentUser;
  if (!user) throw new Error("Sign in first, then choose a username.");
  await updateProfile(user, { displayName: value });
  const db = getFirebaseDb();
  if (db) {
    await setDoc(
      doc(db, "users", user.uid),
      { username: value, email: user.email ?? null, updatedAt: new Date().toISOString() },
      { merge: true },
    );
  }
  await user.reload();
}

export async function signInWithEmail(email: string, password: string) {
  const firebaseAuth = getFirebaseAuth();
  if (!firebaseAuth) throw new Error("Firebase is not configured");
  await firebaseAuth.authStateReady();
  await signInWithEmailAndPassword(firebaseAuth, email, password);
  await afterAccountChange();
}

export async function createEmailAccount(email: string, password: string, username: string) {
  const firebaseAuth = getFirebaseAuth();
  if (!firebaseAuth) throw new Error("Firebase is not configured");
  await firebaseAuth.authStateReady();
  const current = firebaseAuth.currentUser;
  if (current?.isAnonymous) {
    try {
      await linkWithCredential(current, EmailAuthProvider.credential(email, password));
      await saveUsername(username);
      await afterAccountChange();
      return;
    } catch (error) {
      const code = error && typeof error === "object" && "code" in error ? String(error.code) : "";
      if (!code.includes("email-already-in-use") && !code.includes("credential-already-in-use")) {
        throw error;
      }
    }
  }
  const created = await createUserWithEmailAndPassword(firebaseAuth, email, password);
  await updateProfile(created.user, { displayName: username.trim() });
  await saveUsername(username);
  await afterAccountChange();
}

export async function signOutUser() {
  const firebaseAuth = getFirebaseAuth();
  if (!firebaseAuth) return;
  await firebaseSignOut(firebaseAuth);
  await afterAccountChange();
}

export function subscribeAuth(listener: (user: User | null) => void) {
  const firebaseAuth = getFirebaseAuth();
  if (!firebaseAuth) {
    listener(null);
    return () => undefined;
  }
  return onAuthStateChanged(firebaseAuth, listener);
}

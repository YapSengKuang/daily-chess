"use client";

import {
  authErrorMessage,
  createEmailAccount,
  signInWithEmail,
  signInWithGoogle,
  signOutUser,
  subscribeAuth,
} from "@/lib/firebase";
import { useEffect, useState, type FormEvent } from "react";
import type { User } from "firebase/auth";

export function AuthControls() {
  const [user, setUser] = useState<User | null | undefined>(undefined);
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => subscribeAuth(setUser), []);

  async function run(action: () => Promise<void>) {
    setBusy(true);
    setError("");
    try {
      await action();
      setOpen(false);
      setPassword("");
    } catch (cause) {
      setError(authErrorMessage(cause));
    } finally {
      setBusy(false);
    }
  }

  if (user === undefined) {
    return <span className="muted">Checking account…</span>;
  }

  if (user && !user.isAnonymous) {
    return (
      <div className="account">
        <span className="account-name">{user.email ?? "Signed in"}</span>
        <button className="btn btn-ghost" type="button" onClick={() => void signOutUser()} disabled={busy}>
          Sign out
        </button>
      </div>
    );
  }

  return (
    <div className="auth-wrap">
      <button className="btn" type="button" onClick={() => setOpen((value) => !value)}>
        Sign in
      </button>
      {open ? (
        <div className="auth-panel">
          <p className="muted">Sign in to keep streak and stats on this account across devices.</p>
          <button
            className="btn"
            type="button"
            disabled={busy}
            onClick={() => void run(signInWithGoogle)}
          >
            Continue with Google
          </button>
          <form
            className="auth-form"
            onSubmit={(event: FormEvent) => {
              event.preventDefault();
              void run(() => signInWithEmail(email, password));
            }}
          >
            <input
              type="email"
              autoComplete="email"
              placeholder="Email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
            <input
              type="password"
              autoComplete="current-password"
              placeholder="Password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              minLength={6}
              required
            />
            <div className="actions">
              <button className="btn" type="submit" disabled={busy}>
                Sign in
              </button>
              <button
                className="btn btn-ghost"
                type="button"
                disabled={busy}
                onClick={() => void run(() => createEmailAccount(email, password))}
              >
                Create account
              </button>
            </div>
          </form>
          {error ? <p className="muted">{error}</p> : null}
        </div>
      ) : null}
    </div>
  );
}

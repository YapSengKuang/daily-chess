"use client";

import {
  accountLabel,
  authErrorMessage,
  createEmailAccount,
  getCurrentUser,
  saveUsername,
  signInWithEmail,
  signInWithGoogle,
  signOutUser,
  subscribeAuth,
} from "@/lib/firebase";
import { getSoundEnabled, getStoredTheme, setSoundEnabled, setStoredTheme } from "@/lib/settings";
import type { User } from "firebase/auth";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";

const LINKS = [
  { href: "/", label: "Today" },
  { href: "/archive", label: "Archive" },
  { href: "/random", label: "Random" },
  { href: "/stats", label: "Stats" },
  { href: "/about", label: "About" },
];

function GuestIcon() {
  return (
    <svg className="guest-icon" viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="8" r="3.2" fill="currentColor" />
      <path
        d="M5 19.2c.8-3.4 3.6-5.2 7-5.2s6.2 1.8 7 5.2"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function linkActive(pathname: string, href: string) {
  if (href === "/archive") return pathname === "/archive" || pathname.startsWith("/p/");
  if (href === "/random") return pathname === "/random" || pathname === "/practice";
  return pathname === href;
}

export function SiteMenu() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [panel, setPanel] = useState<"menu" | "auth">("menu");
  const [mode, setMode] = useState<"create" | "signin">("create");
  const [user, setUser] = useState<User | null | undefined>(undefined);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [sound, setSound] = useState(true);
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const signedIn = Boolean(user && !user.isAnonymous);
  const needsUsername = signedIn && !user?.displayName?.trim();

  useEffect(() => subscribeAuth(setUser), []);

  useEffect(() => {
    setSound(getSoundEnabled());
    const stored = getStoredTheme();
    const next =
      stored ?? (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    setTheme(next);
    document.documentElement.dataset.theme = next;
  }, []);

  useEffect(() => {
    setOpen(false);
    setPanel("menu");
    setError("");
  }, [pathname]);

  async function run(action: () => Promise<void>) {
    setBusy(true);
    setError("");
    try {
      await action();
      setPassword("");
      setConfirm("");
      setPanel("menu");
      setUser(await getCurrentUser());
    } catch (cause) {
      setError(authErrorMessage(cause));
    } finally {
      setBusy(false);
    }
  }

  function submitAuth(event: FormEvent) {
    event.preventDefault();
    if (mode === "create") {
      if (password !== confirm) {
        setError("Passwords do not match.");
        return;
      }
      void run(() => createEmailAccount(email, password, username));
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    void run(() => signInWithEmail(email, password));
  }

  return (
    <div className="menu-wrap">
      <button
        className="burger"
        type="button"
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
        onClick={() => {
          setOpen((value) => !value);
          setPanel("menu");
          setError("");
        }}
      >
        <span />
        <span />
        <span />
      </button>

      {open ? (
        <div className="menu-panel">
          {panel === "menu" ? (
            <>
              <div className="menu-account">
                {signedIn ? (
                  <>
                    <span className="account-name">{accountLabel(user)}</span>
                    <button
                      className="btn btn-ghost"
                      type="button"
                      onClick={() => void signOutUser()}
                      disabled={busy}
                    >
                      Sign out
                    </button>
                  </>
                ) : (
                  <>
                    <span className="guest-chip">
                      <GuestIcon />
                      Guest
                    </span>
                    <p className="muted">Create an account to keep your streak on every device.</p>
                    <button
                      className="btn"
                      type="button"
                      onClick={() => {
                        setPanel("auth");
                        setMode("create");
                        setError("");
                      }}
                    >
                      Sign in
                    </button>
                  </>
                )}
              </div>

              {needsUsername ? (
                <form
                  className="auth-form"
                  onSubmit={(event) => {
                    event.preventDefault();
                    void run(() => saveUsername(username));
                  }}
                >
                  <p className="muted">Choose a username to show on the site.</p>
                  <input
                    type="text"
                    placeholder="Username"
                    value={username}
                    onChange={(event) => setUsername(event.target.value)}
                    minLength={2}
                    required
                  />
                  <button className="btn" type="submit" disabled={busy}>
                    Save username
                  </button>
                  {error ? <p className="muted">{error}</p> : null}
                </form>
              ) : null}

              <nav className="menu-nav">
                {LINKS.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={linkActive(pathname, link.href) ? "nav-link active" : "nav-link"}
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>

              <div className="menu-settings">
                <p className="menu-heading">Settings</p>
                <button
                  className="icon-btn"
                  type="button"
                  onClick={() => {
                    const next = theme === "dark" ? "light" : "dark";
                    setTheme(next);
                    setStoredTheme(next);
                  }}
                >
                  {theme === "dark" ? "Dark mode" : "Light mode"}
                </button>
                <button
                  className="icon-btn"
                  type="button"
                  onClick={() => {
                    const next = !sound;
                    setSound(next);
                    setSoundEnabled(next);
                  }}
                >
                  {sound ? "Sound on" : "Sound off"}
                </button>
              </div>
            </>
          ) : (
            <div className="auth-panel nested">
              <button className="btn btn-ghost" type="button" onClick={() => setPanel("menu")}>
                Back
              </button>
              <p className="muted">
                {mode === "create"
                  ? "Create an account. Pick a username so we can greet you."
                  : "Sign in with the email and password for your account."}
              </p>
              <button
                className="btn"
                type="button"
                disabled={busy}
                onClick={() => void run(signInWithGoogle)}
              >
                Continue with Google
              </button>
              <form className="auth-form" onSubmit={submitAuth}>
                {mode === "create" ? (
                  <input
                    type="text"
                    autoComplete="username"
                    placeholder="Username"
                    value={username}
                    onChange={(event) => setUsername(event.target.value)}
                    minLength={2}
                    required
                  />
                ) : null}
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
                  autoComplete={mode === "create" ? "new-password" : "current-password"}
                  placeholder="Password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  minLength={6}
                  required
                />
                <input
                  type="password"
                  autoComplete="new-password"
                  placeholder="Confirm password"
                  value={confirm}
                  onChange={(event) => setConfirm(event.target.value)}
                  minLength={6}
                  required
                />
                <button className="btn" type="submit" disabled={busy}>
                  {mode === "create" ? "Create account" : "Sign in"}
                </button>
              </form>
              <button
                className="btn btn-ghost"
                type="button"
                onClick={() => {
                  setMode(mode === "create" ? "signin" : "create");
                  setError("");
                }}
              >
                {mode === "create" ? "Already have an account? Sign in" : "Need an account? Create one"}
              </button>
              {error ? <p className="muted">{error}</p> : null}
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}

"use client";

import { loadFirebase } from "@/lib/firebase-lazy";
import { normalizeEmail, passwordIssue } from "@/lib/credentials";
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

function SunIcon() {
  return (
    <svg className="setting-icon" viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="4" fill="currentColor" />
      <path
        d="M12 3v2.2M12 18.8V21M4.9 4.9l1.6 1.6M17.5 17.5l1.6 1.6M3 12h2.2M18.8 12H21M4.9 19.1l1.6-1.6M17.5 6.5l1.6-1.6"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg className="setting-icon" viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M16.2 13.4A6.4 6.4 0 0 1 10.6 5a6.6 6.6 0 1 0 5.6 8.4Z"
        fill="currentColor"
      />
    </svg>
  );
}

function SoundOnIcon() {
  return (
    <svg className="setting-icon" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4 9.5h3.2L12 5.8v12.4L7.2 14.5H4z" fill="currentColor" />
      <path
        d="M15.4 9.2a4.2 4.2 0 0 1 0 5.6M17.8 7a7 7 0 0 1 0 10"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function SoundOffIcon() {
  return (
    <svg className="setting-icon" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4 9.5h3.2L12 5.8v12.4L7.2 14.5H4z" fill="currentColor" />
      <path
        d="M16 9.5 21 14.5M21 9.5 16 14.5"
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

  useEffect(() => {
    let unsub = () => {};
    const start = () => {
      void loadFirebase().then((api) => {
        unsub = api.subscribeAuth(setUser);
      });
    };
    const canIdle = typeof requestIdleCallback === "function";
    const idle = canIdle ? requestIdleCallback(start, { timeout: 1500 }) : window.setTimeout(start, 1);
    return () => {
      if (canIdle) cancelIdleCallback(idle);
      else window.clearTimeout(idle);
      unsub();
    };
  }, []);

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

  async function run(action: (api: Awaited<ReturnType<typeof loadFirebase>>) => Promise<void>) {
    setBusy(true);
    setError("");
    try {
      const api = await loadFirebase();
      await action(api);
      setPassword("");
      setConfirm("");
      setPanel("menu");
      const nextUser = await api.getCurrentUser();
      setUser(nextUser);
      if (nextUser && !nextUser.isAnonymous) {
        setOpen(false);
      }
    } catch (cause) {
      const api = await loadFirebase();
      setError(api.authErrorMessage(cause));
    } finally {
      setBusy(false);
    }
  }

  function submitAuth(event: FormEvent) {
    event.preventDefault();
    const cleanEmail = normalizeEmail(email);
    if (!cleanEmail) {
      setError("Enter a valid email address.");
      return;
    }
    const issue = passwordIssue(password, mode);
    if (issue) {
      setError(issue);
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    if (mode === "create") {
      void run((api) => api.createEmailAccount(cleanEmail, password, username));
      return;
    }
    void run((api) => api.signInWithEmail(cleanEmail, password));
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
                    <span className="account-name">{user?.displayName?.trim() || user?.email || "Signed in"}</span>
                    <button
                      className="btn btn-ghost"
                      type="button"
                      onClick={() => void loadFirebase().then((api) => api.signOutUser())}
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
                    void run((api) => api.saveUsername(username));
                  }}
                >
                  <p className="muted">Choose a username to show on the site.</p>
                  <input
                    type="text"
                    placeholder="Username"
                    value={username}
                    onChange={(event) => setUsername(event.target.value)}
                    minLength={2}
                    maxLength={32}
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
                <div className="setting-pair" role="group" aria-label="Theme">
                  <button
                    className={theme === "light" ? "setting-btn active" : "setting-btn"}
                    type="button"
                    aria-label="Light mode"
                    aria-pressed={theme === "light"}
                    onClick={() => {
                      setTheme("light");
                      setStoredTheme("light");
                    }}
                  >
                    <SunIcon />
                  </button>
                  <button
                    className={theme === "dark" ? "setting-btn active" : "setting-btn"}
                    type="button"
                    aria-label="Dark mode"
                    aria-pressed={theme === "dark"}
                    onClick={() => {
                      setTheme("dark");
                      setStoredTheme("dark");
                    }}
                  >
                    <MoonIcon />
                  </button>
                </div>
                <div className="setting-pair" role="group" aria-label="Sound">
                  <button
                    className={sound ? "setting-btn active" : "setting-btn"}
                    type="button"
                    aria-label="Sound on"
                    aria-pressed={sound}
                    onClick={() => {
                      setSound(true);
                      setSoundEnabled(true);
                    }}
                  >
                    <SoundOnIcon />
                  </button>
                  <button
                    className={!sound ? "setting-btn active" : "setting-btn"}
                    type="button"
                    aria-label="Sound off"
                    aria-pressed={!sound}
                    onClick={() => {
                      setSound(false);
                      setSoundEnabled(false);
                    }}
                  >
                    <SoundOffIcon />
                  </button>
                </div>
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
                onClick={() => void run((api) => api.signInWithGoogle())}
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
                    maxLength={32}
                    required
                  />
                ) : null}
                <input
                  type="email"
                  autoComplete="email"
                  autoCapitalize="none"
                  autoCorrect="off"
                  spellCheck={false}
                  placeholder="Email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  maxLength={254}
                  required
                />
                <input
                  type="password"
                  autoComplete={mode === "create" ? "new-password" : "current-password"}
                  placeholder={mode === "create" ? "Password (8+ characters)" : "Password"}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  minLength={mode === "create" ? 8 : 6}
                  maxLength={128}
                  required
                />
                <input
                  type="password"
                  autoComplete="new-password"
                  placeholder="Confirm password"
                  value={confirm}
                  onChange={(event) => setConfirm(event.target.value)}
                  minLength={mode === "create" ? 8 : 6}
                  maxLength={128}
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

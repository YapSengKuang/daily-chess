"use client";

import { signIn } from "next-auth/react";
import { useAccountProgress } from "@/lib/use-account-progress";
import { usePathname } from "next/navigation";

export function StatsPanel() {
  const pathname = usePathname();
  const { status, signedIn, progress, error, reload } = useAccountProgress();

  if (status === "loading") {
    return <p className="muted">Loading stats…</p>;
  }

  if (!signedIn) {
    return (
      <section className="panel stats">
        <h2>Your stats</h2>
        <p>Sign in with Google to store streak and solves on your account.</p>
        <button className="btn" type="button" onClick={() => signIn("google", { callbackUrl: pathname })}>
          Sign in with Google
        </button>
      </section>
    );
  }

  if (error) {
    return (
      <section className="panel stats">
        <h2>Your stats</h2>
        <p>{error}</p>
        <button className="btn" type="button" onClick={() => void reload()}>
          Retry
        </button>
      </section>
    );
  }

  if (!progress) {
    return <p className="muted">Loading stats…</p>;
  }

  const items = [
    ["Current streak", String(progress.stats.currentStreak)],
    ["Max streak", String(progress.stats.maxStreak)],
    ["Days played", String(progress.stats.played)],
    ["Solved", String(progress.stats.solved)],
    ["Failed", String(progress.stats.failed)],
    ["Solve rate", `${progress.stats.solveRate}%`],
    ["Avg lives left", String(progress.stats.avgLivesLeft)],
  ];

  return (
    <section className="panel stats">
      <h2>Your stats</h2>
      <p className="muted">Saved to your Google account. Same streak on every device.</p>
      <dl className="stat-grid">
        {items.map(([label, value]) => (
          <div key={label}>
            <dt>{label}</dt>
            <dd>{value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

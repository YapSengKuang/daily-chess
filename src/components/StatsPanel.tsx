"use client";

import { getLocalStats, type LocalStats } from "@/lib/local-progress";
import { useEffect, useState } from "react";

export function StatsPanel() {
  const [stats, setStats] = useState<LocalStats | null>(null);

  useEffect(() => {
    const show = () => setStats(getLocalStats());
    show();
    let cancelled = false;
    let unsub = () => {};
    void Promise.all([import("@/lib/firebase-progress"), import("@/lib/firebase")]).then(
      ([{ bootstrapProgress }, { subscribeAuth }]) => {
        if (cancelled) return;
        void bootstrapProgress().then(() => {
          if (!cancelled) show();
        });
        unsub = subscribeAuth(() => {
          void bootstrapProgress().then(() => {
            if (!cancelled) show();
          });
        });
      },
    );
    return () => {
      cancelled = true;
      unsub();
    };
  }, []);

  if (!stats) {
    return <p className="muted">Loading stats…</p>;
  }

  const items = [
    ["Current streak", String(stats.currentStreak)],
    ["Max streak", String(stats.maxStreak)],
    ["Days played", String(stats.played)],
    ["Solved", String(stats.solved)],
    ["Failed", String(stats.failed)],
    ["Solve rate", `${stats.solveRate}%`],
    ["Avg lives left", String(stats.avgLivesLeft)],
  ];

  return (
    <section className="panel stats">
      <h2>Your stats</h2>
      <p className="muted">
        Sign in to sync streak and stats to Firebase. Guests keep progress in this browser only.
      </p>
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

"use client";

import { formatCountdown, msUntilNextUtcMidnight } from "@/lib/date";
import { useEffect, useState } from "react";

export function Countdown() {
  const [label, setLabel] = useState("");

  useEffect(() => {
    let reloaded = false;
    const reloadToday = () => {
      if (reloaded) return;
      const path = window.location.pathname;
      if (path !== "/" && path !== "") return;
      reloaded = true;
      window.location.reload();
    };

    const tick = () => {
      const ms = msUntilNextUtcMidnight();
      setLabel(formatCountdown(ms));
      if (ms <= 0) reloadToday();
      return ms;
    };

    const remaining = tick();
    const interval = window.setInterval(tick, 1000);
    const timeout = window.setTimeout(reloadToday, remaining + 400);
    return () => {
      window.clearInterval(interval);
      window.clearTimeout(timeout);
    };
  }, []);

  return (
    <p className="muted countdown">
      Next puzzle in {label || "—"} · resets 00:00 UTC
    </p>
  );
}

"use client";

import { formatCountdown, msUntilNextUtcMidnight } from "@/lib/date";
import { useEffect, useState } from "react";

export function Countdown() {
  const [label, setLabel] = useState("");

  useEffect(() => {
    const tick = () => setLabel(formatCountdown(msUntilNextUtcMidnight()));
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, []);

  return (
    <p className="muted countdown">
      Next puzzle in {label || "—"} · resets 00:00 UTC
    </p>
  );
}

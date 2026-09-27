"use client";

import { useEffect, useState } from "react";

export function FunFact() {
  const [text, setText] = useState("Loading today's fun fact…");
  const [source, setSource] = useState("");

  useEffect(() => {
    let cancelled = false;
    void fetch("/api/fun-fact")
      .then(async (response) => {
        const body = (await response.json()) as { text?: string; source?: string; error?: string };
        if (cancelled) return;
        if (body.text) {
          setText(body.text);
          setSource(body.source ?? "");
          return;
        }
        setText(
          response.status === 429
            ? "Too many requests for today's fun fact. Try again in a minute."
            : "Could not load today's fun fact.",
        );
      })
      .catch(() => {
        if (!cancelled) setText("Could not load today's fun fact.");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <aside className="fun-fact panel">
      <p className="kicker">Today&apos;s fun fact</p>
      <p>{text}</p>
      {source ? <p className="muted">Source: {source}</p> : null}
    </aside>
  );
}

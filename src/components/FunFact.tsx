"use client";

import { useEffect, useState } from "react";

export function FunFact() {
  const [text, setText] = useState("Loading today's fun fact…");
  const [source, setSource] = useState("");

  useEffect(() => {
    let cancelled = false;
    void fetch("/api/fun-fact")
      .then((response) => response.json())
      .then((body: { text?: string; source?: string }) => {
        if (cancelled || !body.text) return;
        setText(body.text);
        setSource(body.source ?? "");
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

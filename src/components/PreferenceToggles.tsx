"use client";

import { getSoundEnabled, getStoredTheme, setSoundEnabled, setStoredTheme } from "@/lib/settings";
import { useEffect, useState } from "react";

export function PreferenceToggles() {
  const [sound, setSound] = useState(true);
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    setSound(getSoundEnabled());
    const stored = getStoredTheme();
    const next =
      stored ??
      (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    setTheme(next);
    document.documentElement.dataset.theme = next;
  }, []);

  return (
    <div className="toggles">
      <button
        className="icon-btn"
        type="button"
        onClick={() => {
          const next = theme === "dark" ? "light" : "dark";
          setTheme(next);
          setStoredTheme(next);
        }}
        aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
      >
        {theme === "dark" ? "Light" : "Dark"}
      </button>
      <button
        className="icon-btn"
        type="button"
        onClick={() => {
          const next = !sound;
          setSound(next);
          setSoundEnabled(next);
        }}
        aria-label={sound ? "Mute sounds" : "Unmute sounds"}
      >
        {sound ? "Sound on" : "Sound off"}
      </button>
    </div>
  );
}

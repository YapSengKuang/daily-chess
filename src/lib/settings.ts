const SOUND_KEY = "daily-chess-sound";
const THEME_KEY = "daily-chess-theme";
const BOARD_STYLE_KEY = "daily-chess-board-style";
const BOARD_STYLE_EVENT = "daily-chess-board-style";

export type BoardStyle = "pixel" | "classic";

export const THEME_COLORS = {
  light: "#f4efe4",
  dark: "#14110e",
} as const;

export function getSoundEnabled(): boolean {
  if (typeof window === "undefined") return true;
  return window.localStorage.getItem(SOUND_KEY) !== "off";
}

export function setSoundEnabled(enabled: boolean) {
  window.localStorage.setItem(SOUND_KEY, enabled ? "on" : "off");
}

export function getStoredTheme(): "light" | "dark" | null {
  if (typeof window === "undefined") return null;
  const value = window.localStorage.getItem(THEME_KEY);
  return value === "dark" || value === "light" ? value : null;
}

export function applyTheme(theme: "light" | "dark") {
  const dark = theme === "dark";
  const root = document.documentElement;
  root.dataset.theme = theme;
  root.classList.toggle("dark", dark);
  root.style.colorScheme = theme;
  if (document.body) {
    document.body.classList.toggle("dark", dark);
    document.body.style.colorScheme = theme;
  }
  let meta = document.querySelector('meta[name="theme-color"]');
  if (!meta) {
    meta = document.createElement("meta");
    meta.setAttribute("name", "theme-color");
    document.head.appendChild(meta);
  }
  meta.setAttribute("content", THEME_COLORS[theme]);
}

export function setStoredTheme(theme: "light" | "dark") {
  window.localStorage.setItem(THEME_KEY, theme);
  applyTheme(theme);
}

export function getBoardStyle(): BoardStyle {
  if (typeof window === "undefined") return "pixel";
  return window.localStorage.getItem(BOARD_STYLE_KEY) === "classic" ? "classic" : "pixel";
}

export function setBoardStyle(style: BoardStyle) {
  window.localStorage.setItem(BOARD_STYLE_KEY, style);
  window.dispatchEvent(new Event(BOARD_STYLE_EVENT));
}

export function subscribeBoardStyle(onChange: (style: BoardStyle) => void) {
  const notify = () => onChange(getBoardStyle());
  window.addEventListener(BOARD_STYLE_EVENT, notify);
  window.addEventListener("storage", notify);
  return () => {
    window.removeEventListener(BOARD_STYLE_EVENT, notify);
    window.removeEventListener("storage", notify);
  };
}

function beep(frequency: number, duration: number, type: OscillatorType = "sine") {
  if (typeof window === "undefined" || !getSoundEnabled()) return;
  const AudioContextRef =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AudioContextRef) return;
  const context = new AudioContextRef();
  const oscillator = context.createOscillator();
  const gain = context.createGain();
  oscillator.type = type;
  oscillator.frequency.value = frequency;
  gain.gain.value = 0.05;
  oscillator.connect(gain);
  gain.connect(context.destination);
  oscillator.start();
  gain.gain.exponentialRampToValueAtTime(0.001, context.currentTime + duration);
  oscillator.stop(context.currentTime + duration);
  window.setTimeout(() => void context.close(), duration * 1000 + 50);
}

export function playSound(kind: "ok" | "bad" | "reply") {
  if (kind === "ok") beep(660, 0.12);
  if (kind === "bad") beep(180, 0.16, "square");
  if (kind === "reply") beep(420, 0.08);
}

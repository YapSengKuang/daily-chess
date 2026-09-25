const SOUND_KEY = "daily-chess-sound";
const THEME_KEY = "daily-chess-theme";

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

export function setStoredTheme(theme: "light" | "dark") {
  window.localStorage.setItem(THEME_KEY, theme);
  document.documentElement.dataset.theme = theme;
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

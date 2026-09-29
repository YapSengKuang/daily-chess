export type PlyResult = "correct" | "retry" | "miss" | "empty";

const EMOJI: Record<PlyResult, string> = {
  correct: "🟩",
  retry: "🟨",
  miss: "🟥",
  empty: "⬜",
};

export function buildShareText(options: {
  date: string;
  number: number;
  solved: boolean;
  playerMoves: number;
  results: PlyResult[];
  streak: number;
}): string {
  const grid = options.results.map((result) => EMOJI[result]).join("");
  const score = options.solved
    ? `${options.playerMoves}/${options.playerMoves}`
    : `X/${options.playerMoves}`;
  const label = options.number > 0 ? `Daily Chess #${options.number} ${options.date}` : "Daily Chess · Random";

  return [
    `${label}`,
    `${score}  ${grid}`,
    `Streak: ${options.streak} 🔥`,
    "https://daily-chess-rho.vercel.app/",
  ].join("\n");
}

export async function shareResult(text: string): Promise<"shared" | "copied"> {
  if (typeof navigator !== "undefined" && typeof navigator.share === "function") {
    try {
      await navigator.share({
        title: "Daily Chess",
        text,
        url: "https://daily-chess-rho.vercel.app/",
      });
      return "shared";
    } catch {
      // Fall through to clipboard if the user cancels or share is unavailable.
    }
  }
  await navigator.clipboard.writeText(text);
  return "copied";
}

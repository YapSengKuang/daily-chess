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

  return [
    `Daily Chess #${options.number} ${options.date}`,
    `${score}  ${grid}`,
    `Streak: ${options.streak} 🔥`,
  ].join("\n");
}

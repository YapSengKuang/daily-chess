export function prettyTheme(theme: string): string {
  const labels: Record<string, string> = {
    mateIn1: "Mate in 1",
    mateIn2: "Mate in 2",
    mateIn3: "Mate in 3",
    mateIn4: "Mate in 4",
    mateIn5: "Mate in 5",
    veryLong: "Long combo",
    short: "Short",
    long: "Long",
    endgame: "Endgame",
    middlegame: "Middlegame",
    opening: "Opening",
    kingsideAttack: "Kingside attack",
    hangingPiece: "Hanging piece",
    discoveredAttack: "Discovered attack",
    smotheredMate: "Smothered mate",
    backRankMate: "Back-rank mate",
    quietMove: "Quiet move",
    advancedPawn: "Advanced pawn",
  };
  if (labels[theme]) return labels[theme];
  return theme
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (letter) => letter.toUpperCase());
}

export function themeSummary(themes: string[], limit = 3): string {
  return themes.slice(0, limit).map(prettyTheme).join(" · ");
}

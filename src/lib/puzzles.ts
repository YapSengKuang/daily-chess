import puzzles from "../../data/puzzles.json";
import {
  playerMoveCount,
  type DailyPuzzle,
  type Puzzle,
} from "./chess";
import { puzzleNumber, todayUtc } from "./date";

function hashDate(date: string): number {
  let hash = 0;
  for (const char of date) {
    hash = (hash * 33 + char.charCodeAt(0)) >>> 0;
  }
  return hash;
}

export function eligiblePuzzles(): Puzzle[] {
  return (puzzles as Puzzle[]).filter((puzzle) => {
    const count = playerMoveCount(puzzle.moves);
    return count >= 3 && count <= 6;
  });
}

function toDailyPuzzle(puzzle: Puzzle, date: string, number: number): DailyPuzzle {
  const turn = puzzle.fen.split(" ")[1];
  return {
    ...puzzle,
    date,
    number,
    playerMoves: playerMoveCount(puzzle.moves),
    orientation: turn === "b" ? "black" : "white",
  };
}

export function getDailyPuzzle(date: string): DailyPuzzle {
  const eligible = eligiblePuzzles();
  const targetLength = [3, 4, 3, 5, 4, 3, 6][((puzzleNumber(date) - 1) % 7 + 7) % 7];
  const pool = eligible.filter((puzzle) => playerMoveCount(puzzle.moves) === targetLength);
  const source = pool.length > 0 ? pool : eligible;
  const puzzle = source[hashDate(date) % source.length];
  return toDailyPuzzle(puzzle, date, puzzleNumber(date));
}

export function getPracticePuzzle(excludeIds: string[] = []): DailyPuzzle {
  const eligible = eligiblePuzzles().filter((puzzle) => !excludeIds.includes(puzzle.id));
  const source = eligible.length > 0 ? eligible : eligiblePuzzles();
  const puzzle = source[Math.floor(Math.random() * source.length)];
  return toDailyPuzzle(puzzle, todayUtc(), 0);
}

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

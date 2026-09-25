import puzzles from "../../data/puzzles.json";
import { playerMoveCount, type DailyPuzzle, type Puzzle } from "./chess";
import { puzzleNumber, todayUtc } from "./date";

export { prettyTheme, themeSummary } from "./themes";

const ALL_PUZZLES = puzzles as Puzzle[];
const ELIGIBLE = ALL_PUZZLES.filter((puzzle) => {
  const count = playerMoveCount(puzzle.moves);
  return count >= 3 && count <= 6;
});

function hashDate(date: string): number {
  let hash = 0;
  for (const char of date) {
    hash = (hash * 33 + char.charCodeAt(0)) >>> 0;
  }
  return hash;
}

export function eligiblePuzzles(): Puzzle[] {
  return ELIGIBLE;
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

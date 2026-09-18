import puzzles from "../../data/puzzles.json";
import {
  playerMoveCount,
  type DailyPuzzle,
  type Puzzle,
} from "./chess";
import { puzzleNumber } from "./date";

function hashDate(date: string): number {
  let hash = 0;
  for (const char of date) {
    hash = (hash * 33 + char.charCodeAt(0)) >>> 0;
  }
  return hash;
}

export function getDailyPuzzle(date: string): DailyPuzzle {
  const eligible = (puzzles as Puzzle[]).filter((puzzle) => {
    const count = playerMoveCount(puzzle.moves);
    return count >= 3 && count <= 6;
  });

  const targetLength = [3, 4, 3, 5, 4, 3, 6][((puzzleNumber(date) - 1) % 7 + 7) % 7];
  const pool = eligible.filter((puzzle) => playerMoveCount(puzzle.moves) === targetLength);
  const source = pool.length > 0 ? pool : eligible;
  const puzzle = source[hashDate(date) % source.length];
  const turn = puzzle.fen.split(" ")[1];

  return {
    ...puzzle,
    date,
    number: puzzleNumber(date),
    playerMoves: playerMoveCount(puzzle.moves),
    orientation: turn === "b" ? "black" : "white",
  };
}

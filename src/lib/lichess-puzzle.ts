import { Chess } from "chess.js";
import { playerMoveCount, uciToMove, type DailyPuzzle } from "./chess";
import { todayUtc } from "./date";

type LichessPuzzleResponse = {
  game: { pgn: string };
  puzzle: {
    id: string;
    rating: number;
    solution: string[];
    themes: string[];
  };
};

function playPgn(pgn: string) {
  const chess = new Chess();
  const tokens = pgn
    .trim()
    .split(/\s+/)
    .filter((token) => token && token !== "*" && !/^\d+\.+$/.test(token));
  for (const san of tokens) {
    if (!chess.move(san)) {
      throw new Error(`Could not replay Lichess game at ${san}`);
    }
  }
  return chess;
}

export function puzzleFromLichess(data: LichessPuzzleResponse): DailyPuzzle {
  const chess = playPgn(data.game.pgn);
  const first = data.puzzle.solution[0];
  if (!first) throw new Error("Lichess puzzle has no solution");
  chess.move(uciToMove(first));
  chess.undo();
  const turn = chess.turn();
  return {
    id: data.puzzle.id,
    fen: chess.fen(),
    moves: data.puzzle.solution,
    rating: data.puzzle.rating,
    themes: data.puzzle.themes,
    date: todayUtc(),
    number: 0,
    playerMoves: playerMoveCount(data.puzzle.solution),
    orientation: turn === "b" ? "black" : "white",
  };
}

export async function fetchLichessRandomPuzzle(): Promise<DailyPuzzle> {
  const response = await fetch(`https://lichess.org/api/puzzle/next?_=${Date.now()}`, {
    cache: "no-store",
    headers: {
      Accept: "application/json",
      "User-Agent": "daily-chess/1.0 (https://github.com/YapSengKuang/daily-chess)",
    },
  });
  if (!response.ok) {
    throw new Error(`Lichess returned ${response.status}`);
  }
  const data = (await response.json()) as LichessPuzzleResponse;
  return puzzleFromLichess(data);
}

export async function fetchPlayableLichessPuzzle(attempts = 6): Promise<DailyPuzzle> {
  let lastError: unknown;
  for (let i = 0; i < attempts; i += 1) {
    try {
      const puzzle = await fetchLichessRandomPuzzle();
      if (puzzle.playerMoves >= 2 && puzzle.playerMoves <= 8) return puzzle;
    } catch (error) {
      lastError = error;
    }
  }
  if (lastError) throw lastError;
  throw new Error("Could not find a playable Lichess puzzle");
}

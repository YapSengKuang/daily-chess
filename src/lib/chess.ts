export type Puzzle = {
  id: string;
  fen: string;
  moves: string[];
  rating: number;
  themes: string[];
};

export type DailyPuzzle = Puzzle & {
  date: string;
  number: number;
  playerMoves: number;
  orientation: "white" | "black";
};

export type Attempt = {
  completed?: boolean;
  solved?: boolean;
  failed?: boolean;
  results?: Array<"correct" | "retry" | "miss" | "empty">;
  livesLeft?: number;
};

export function playerMoveCount(moves: string[]): number {
  return Math.ceil(moves.length / 2);
}

export function uciToMove(uci: string): {
  from: string;
  to: string;
  promotion?: string;
} {
  return {
    from: uci.slice(0, 2),
    to: uci.slice(2, 4),
    promotion: uci.length > 4 ? uci[4] : undefined,
  };
}

"use client";

import { Chess, type Square } from "chess.js";
import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { Chessboard } from "react-chessboard";
import { uciToMove, type Attempt, type DailyPuzzle } from "@/lib/chess";
import { loadLocalProgress, saveLocalAttempt } from "@/lib/local-progress";
import { buildShareText, type PlyResult } from "@/lib/share";

const LIVES = 3;

function emptyResults(count: number): PlyResult[] {
  return Array.from({ length: count }, () => "empty");
}

export function PuzzleGame({ puzzle }: { puzzle: DailyPuzzle }) {
  const chessRef = useRef(new Chess(puzzle.fen));
  const [fen, setFen] = useState(puzzle.fen);
  const [ply, setPly] = useState(0);
  const [lives, setLives] = useState(LIVES);
  const [selected, setSelected] = useState<Square | null>(null);
  const [lastMove, setLastMove] = useState<{ from: string; to: string } | null>(null);
  const [missedCurrent, setMissedCurrent] = useState(false);
  const [results, setResults] = useState<PlyResult[]>(emptyResults(puzzle.playerMoves));
  const [status, setStatus] = useState<"play" | "won" | "lost">("play");
  const [message, setMessage] = useState(
    `You play ${puzzle.orientation}. Find the only good moves.`,
  );
  const [shareText, setShareText] = useState("");
  const [streak, setStreak] = useState(0);
  const [copied, setCopied] = useState(false);
  const [waiting, setWaiting] = useState(false);
  const [restored, setRestored] = useState<Attempt | null>(null);
  const locked = status !== "play" || waiting || Boolean(restored?.completed);
  const playerIndex = Math.floor(ply / 2);

  const syncFen = useCallback(() => {
    setFen(chessRef.current.fen());
  }, []);

  const finish = useCallback(
    (solved: boolean, nextResults: PlyResult[]) => {
      setStatus(solved ? "won" : "lost");
      setSelected(null);
      setMessage(solved ? "Solved. Nice find." : "Out of lives. The solution is below.");
      const nextStreak = saveLocalAttempt(puzzle.date, {
        solved,
        failed: !solved,
        results: nextResults,
      });
      setStreak(nextStreak);
      setShareText(
        buildShareText({
          date: puzzle.date,
          number: puzzle.number,
          solved,
          playerMoves: puzzle.playerMoves,
          results: nextResults,
          streak: nextStreak,
        }),
      );
    },
    [puzzle],
  );

  const playUci = useCallback(
    (uci: string) => {
      const move = uciToMove(uci);
      chessRef.current.move(move);
      setLastMove({ from: move.from, to: move.to });
      syncFen();
    },
    [syncFen],
  );

  const failMove = useCallback(() => {
    const remaining = lives - 1;
    setLives(remaining);
    setMissedCurrent(true);
    setSelected(null);
    setMessage(
      remaining > 0
        ? `Not it. ${remaining} ${remaining === 1 ? "life" : "lives"} left.`
        : "That was the last life.",
    );
    if (remaining <= 0) {
      const next = results.map((result, index) => {
        if (index < playerIndex) return result === "empty" ? "miss" : result;
        if (index === playerIndex) return "miss";
        return "empty";
      });
      setResults(next);
      finish(false, next);
    }
  }, [finish, lives, playerIndex, results]);

  const succeedMove = useCallback(
    (uci: string) => {
      const plyResult: PlyResult = missedCurrent ? "retry" : "correct";
      const nextResults = results.map((result, index) =>
        index === playerIndex ? plyResult : result,
      );
      setResults(nextResults);
      setMissedCurrent(false);
      setSelected(null);
      playUci(uci);

      const opponent = puzzle.moves[ply + 1];
      const nextPly = opponent ? ply + 2 : ply + 1;
      if (opponent) {
        setWaiting(true);
        window.setTimeout(() => {
          playUci(opponent);
          setPly(nextPly);
          setWaiting(false);
          setMessage("Correct. Keep going.");
        }, 280);
      } else {
        setPly(nextPly);
      }

      if (nextPly >= puzzle.moves.length) {
        finish(true, nextResults);
      }
    },
    [finish, missedCurrent, playUci, playerIndex, ply, puzzle.moves, results],
  );

  const tryMove = useCallback(
    (from: Square, to: Square) => {
      if (locked) return false;

      const expected = puzzle.moves[ply];
      const expectedMove = uciToMove(expected);
      const legal = chessRef.current.moves({ verbose: true });
      const matches = legal.filter((move) => move.from === from && move.to === to);
      if (matches.length === 0) return false;

      if (from === expectedMove.from && to === expectedMove.to) {
        succeedMove(expected);
        return true;
      }

      const mate = matches.find((move) => {
        const trial = new Chess(chessRef.current.fen());
        trial.move({
          from: move.from,
          to: move.to,
          promotion: move.promotion,
        });
        return trial.isCheckmate();
      });
      if (mate) {
        succeedMove(`${mate.from}${mate.to}${mate.promotion ?? ""}`);
        return true;
      }

      failMove();
      return false;
    },
    [failMove, locked, ply, puzzle.moves, succeedMove],
  );

  useEffect(() => {
    const progress = loadLocalProgress(puzzle.date);
    setStreak(progress.streak);
    if (!progress.attempt?.completed) return;

    const replay = new Chess(puzzle.fen);
    let last: { from: string; to: string } | null = null;
    for (const move of puzzle.moves) {
      const played = replay.move(uciToMove(move));
      last = { from: played.from, to: played.to };
    }
    chessRef.current = replay;
    setFen(replay.fen());
    setLastMove(last);
    setRestored(progress.attempt);
    setStatus(progress.attempt.solved ? "won" : "lost");
    setResults(
      progress.attempt.results?.length === puzzle.playerMoves
        ? progress.attempt.results
        : emptyResults(puzzle.playerMoves),
    );
    setMessage(
      progress.attempt.solved ? "Solved. Nice find." : "Out of lives. The solution is below.",
    );
    setShareText(
      buildShareText({
        date: puzzle.date,
        number: puzzle.number,
        solved: Boolean(progress.attempt.solved),
        playerMoves: puzzle.playerMoves,
        results: progress.attempt.results ?? emptyResults(puzzle.playerMoves),
        streak: progress.streak,
      }),
    );
  }, [puzzle]);

  const solutionSans = useMemo(() => {
    const replay = new Chess(puzzle.fen);
    return puzzle.moves.map((uci) => replay.move(uciToMove(uci)).san);
  }, [puzzle]);

  const squareStyles = useMemo(() => {
    const styles: Record<string, CSSProperties> = {};
    if (lastMove) {
      styles[lastMove.from] = { backgroundColor: "rgba(47, 93, 80, 0.28)" };
      styles[lastMove.to] = { backgroundColor: "rgba(47, 93, 80, 0.4)" };
    }
    if (selected) {
      styles[selected] = { backgroundColor: "rgba(201, 162, 39, 0.45)" };
    }
    return styles;
  }, [lastMove, selected]);

  return (
    <section className="game">
      <div className="board-wrap">
        <Chessboard
          options={{
            id: "daily-puzzle",
            position: fen,
            boardOrientation: puzzle.orientation,
            allowDragging: !locked,
            animationDurationInMs: 220,
            boardStyle: { width: "100%" },
            squareStyles,
            canDragPiece: ({ piece }) =>
              !locked && piece.pieceType[0] === chessRef.current.turn(),
            onPieceDrop: ({ sourceSquare, targetSquare }) => {
              if (!targetSquare) return false;
              return tryMove(sourceSquare as Square, targetSquare as Square);
            },
            onSquareClick: ({ square }) => {
              if (locked) return;
              const clicked = square as Square;
              const piece = chessRef.current.get(clicked);
              if (selected) {
                if (selected === clicked) {
                  setSelected(null);
                  return;
                }
                const moved = tryMove(selected, clicked);
                if (!moved && piece && piece.color === chessRef.current.turn()) {
                  setSelected(clicked);
                }
                return;
              }
              if (piece && piece.color === chessRef.current.turn()) {
                setSelected(clicked);
              }
            },
          }}
        />
      </div>

      <div className="panel">
        <p className="kicker">
          Puzzle {puzzle.number} · {puzzle.playerMoves} moves · {puzzle.rating} elo
        </p>
        <h2>Today&apos;s puzzle</h2>
        <p>{message}</p>
        <div className="meta">
          <span>
            Lives {"♥".repeat(Math.max(lives, 0))}
            {"♡".repeat(Math.max(LIVES - lives, 0))}
          </span>
          <span>Streak {streak}</span>
        </div>
        <div className="grid" aria-label="Move results">
          {results.map((result, index) => (
            <span key={`${result}-${index}`} className={`cell cell-${result}`}>
              {index + 1}
            </span>
          ))}
        </div>
        {status !== "play" && (
          <>
            <p className="solution">Solution: {solutionSans.join(" ")}</p>
            <textarea readOnly value={shareText} rows={4} />
            <button
              className="btn"
              type="button"
              onClick={async () => {
                await navigator.clipboard.writeText(shareText);
                setCopied(true);
                window.setTimeout(() => setCopied(false), 1500);
              }}
            >
              {copied ? "Copied" : "Share result"}
            </button>
          </>
        )}
      </div>
    </section>
  );
}

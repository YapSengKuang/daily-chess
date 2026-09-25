"use client";

import { Chess, type Square } from "chess.js";
import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { Chessboard } from "react-chessboard";
import { uciToMove, type DailyPuzzle } from "@/lib/chess";
import { getProgressOwner, loadLocalProgress } from "@/lib/local-progress";
import { bootstrapProgress, saveProgressAttempt } from "@/lib/firebase-progress";
import { subscribeAuth } from "@/lib/firebase";
import { themeSummary } from "@/lib/puzzles";
import { FunFact } from "./FunFact";
import { playSound } from "@/lib/settings";
import { buildShareText, shareResult, type PlyResult } from "@/lib/share";

const LIVES = 3;

type Mode = "daily" | "archive" | "practice" | "random";

function emptyResults(count: number): PlyResult[] {
  return Array.from({ length: count }, () => "empty");
}

export function PuzzleGame({
  puzzle,
  mode = "daily",
}: {
  puzzle: DailyPuzzle;
  mode?: Mode;
}) {
  const persist = mode === "daily" || mode === "archive";
  const chessRef = useRef(new Chess(puzzle.fen));
  const [fen, setFen] = useState(puzzle.fen);
  const [ply, setPly] = useState(0);
  const [lives, setLives] = useState(LIVES);
  const [selected, setSelected] = useState<Square | null>(null);
  const [lastMove, setLastMove] = useState<{ from: string; to: string } | null>(null);
  const [hintLevel, setHintLevel] = useState(0);
  const [missedCurrent, setMissedCurrent] = useState(false);
  const [results, setResults] = useState<PlyResult[]>(emptyResults(puzzle.playerMoves));
  const [statusPlay, setStatusPlay] = useState<"play" | "won" | "lost">("play");
  const [message, setMessage] = useState(
    `You play ${puzzle.orientation}. Find the only good moves.`,
  );
  const [shareText, setShareText] = useState("");
  const [streak, setStreak] = useState(0);
  const [shareState, setShareState] = useState("");
  const [waiting, setWaiting] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [replaying, setReplaying] = useState(false);
  const replayTimer = useRef<number | null>(null);
  const recordedRef = useRef(false);
  const locked = statusPlay !== "play" || waiting || completed || replaying;
  const playerIndex = Math.floor(ply / 2);
  const expected = puzzle.moves[ply];
  const expectedMove = expected ? uciToMove(expected) : null;

  const syncFen = useCallback(() => {
    setFen(chessRef.current.fen());
  }, []);

  const finish = useCallback(
    (solved: boolean, nextResults: PlyResult[], livesLeft: number) => {
      setStatusPlay(solved ? "won" : "lost");
      setCompleted(true);
      setSelected(null);
      setHintLevel(0);

      const firstRecord = persist && !recordedRef.current;
      if (firstRecord) {
        recordedRef.current = true;
        void saveProgressAttempt(puzzle.date, {
          solved,
          failed: !solved,
          results: nextResults,
          livesLeft,
        });
        const nextStreak = loadLocalProgress(puzzle.date).streak;
        setStreak(nextStreak);
        setMessage(solved ? "Solved. Nice find." : "Out of lives. The solution is below.");
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
        return;
      }

      setMessage(
        solved
          ? "Solved again. This replay did not change your stats."
          : "Out of lives. This replay did not change your stats.",
      );
      if (!persist) {
        setShareText(
          buildShareText({
            date: puzzle.date,
            number: puzzle.number,
            solved,
            playerMoves: puzzle.playerMoves,
            results: nextResults,
            streak,
          }),
        );
      }
    },
    [persist, puzzle, streak],
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
    playSound("bad");
    const remaining = lives - 1;
    setLives(remaining);
    setMissedCurrent(true);
    setSelected(null);
    setHintLevel((level) => Math.min(level + 1, 2));
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
      finish(false, next, 0);
    }
  }, [finish, lives, playerIndex, results]);

  const succeedMove = useCallback(
    (uci: string) => {
      playSound("ok");
      const plyResult: PlyResult = missedCurrent ? "retry" : "correct";
      const nextResults = results.map((result, index) =>
        index === playerIndex ? plyResult : result,
      );
      setResults(nextResults);
      setMissedCurrent(false);
      setHintLevel(0);
      setSelected(null);
      playUci(uci);

      const opponent = puzzle.moves[ply + 1];
      const nextPly = opponent ? ply + 2 : ply + 1;
      if (opponent) {
        setWaiting(true);
        window.setTimeout(() => {
          playSound("reply");
          playUci(opponent);
          setPly(nextPly);
          setWaiting(false);
          setMessage("Correct. Keep going.");
        }, 280);
      } else {
        setPly(nextPly);
      }

      if (nextPly >= puzzle.moves.length) {
        finish(true, nextResults, lives);
      }
    },
    [finish, lives, missedCurrent, playUci, playerIndex, ply, puzzle.moves, results],
  );

  const tryMove = useCallback(
    (from: Square, to: Square) => {
      if (locked) return false;
      if (!expectedMove) return false;

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
    [expected, expectedMove, failMove, locked, succeedMove],
  );

  useEffect(() => {
    if (replayTimer.current) window.clearTimeout(replayTimer.current);
    chessRef.current = new Chess(puzzle.fen);
    setFen(puzzle.fen);
    setPly(0);
    setLives(LIVES);
    setSelected(null);
    setLastMove(null);
    setHintLevel(0);
    setMissedCurrent(false);
    setResults(emptyResults(puzzle.playerMoves));
    setStatusPlay("play");
    setMessage(`You play ${puzzle.orientation}. Find the only good moves.`);
    setShareText("");
    setShareState("");
    setWaiting(false);
    setCompleted(false);
    setReplaying(false);
    recordedRef.current = false;

    const startPosition = () => {
      if (replayTimer.current) window.clearTimeout(replayTimer.current);
      chessRef.current = new Chess(puzzle.fen);
      setFen(puzzle.fen);
      setPly(0);
      setLives(LIVES);
      setSelected(null);
      setLastMove(null);
      setHintLevel(0);
      setMissedCurrent(false);
      setResults(emptyResults(puzzle.playerMoves));
      setStatusPlay("play");
      setMessage(`You play ${puzzle.orientation}. Find the only good moves.`);
      setShareText("");
      setShareState("");
      setWaiting(false);
      setCompleted(false);
      setReplaying(false);
      recordedRef.current = false;
    };

    const restore = (resetIfOpen = false) => {
      const progress = loadLocalProgress(puzzle.date);
      setStreak(progress.streak);
      if (persist && progress.attempt?.completed) {
        recordedRef.current = true;
        const replay = new Chess(puzzle.fen);
        let last: { from: string; to: string } | null = null;
        for (const move of puzzle.moves) {
          const played = replay.move(uciToMove(move));
          last = { from: played.from, to: played.to };
        }
        chessRef.current = replay;
        setFen(replay.fen());
        setLastMove(last);
        setCompleted(true);
        setStatusPlay(progress.attempt.solved ? "won" : "lost");
        setLives(progress.attempt.livesLeft ?? 0);
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
        return;
      }
      if (resetIfOpen) startPosition();
    };

    startPosition();
    restore();
    void bootstrapProgress().then(() => restore(true));
    let owner = null as string | null;
    return subscribeAuth(() => {
      void bootstrapProgress().then(() => {
        const nextOwner = getProgressOwner();
        const switched = nextOwner !== owner;
        owner = nextOwner;
        restore(switched);
      });
    });
  }, [persist, puzzle]);

  const resetBoard = useCallback(() => {
    if (replayTimer.current) window.clearTimeout(replayTimer.current);
    chessRef.current = new Chess(puzzle.fen);
    setFen(puzzle.fen);
    setPly(0);
    setLives(LIVES);
    setSelected(null);
    setLastMove(null);
    setHintLevel(0);
    setMissedCurrent(false);
    setResults(emptyResults(puzzle.playerMoves));
    setStatusPlay("play");
    setMessage(`You play ${puzzle.orientation}. Find the only good moves.`);
    setShareState("");
    setWaiting(false);
    setCompleted(false);
    setReplaying(false);
  }, [puzzle]);

  const playAgain = useCallback(() => {
    resetBoard();
    setMessage("Replay for practice. This run will not change your stats.");
  }, [resetBoard]);

  const replaySolution = useCallback(() => {
    if (replayTimer.current) window.clearTimeout(replayTimer.current);
    setReplaying(true);
    setSelected(null);
    chessRef.current = new Chess(puzzle.fen);
    setFen(puzzle.fen);
    setLastMove(null);
    let index = 0;
    const step = () => {
      if (index >= puzzle.moves.length) {
        setReplaying(false);
        return;
      }
      playUci(puzzle.moves[index]);
      index += 1;
      replayTimer.current = window.setTimeout(step, 450);
    };
    replayTimer.current = window.setTimeout(step, 250);
  }, [playUci, puzzle]);

  useEffect(
    () => () => {
      if (replayTimer.current) window.clearTimeout(replayTimer.current);
    },
    [],
  );

  const solutionSans = useMemo(() => {
    const replay = new Chess(puzzle.fen);
    return puzzle.moves.map((uci) => replay.move(uciToMove(uci)).san);
  }, [puzzle]);

  const legalTargets = useMemo(() => {
    if (!selected || locked) return [];
    return chessRef.current.moves({ square: selected, verbose: true });
  }, [locked, selected, fen]);

  const squareStyles = useMemo(() => {
    const styles: Record<string, CSSProperties> = {};
    if (lastMove) {
      styles[lastMove.from] = { backgroundColor: "rgba(47, 93, 80, 0.28)" };
      styles[lastMove.to] = { backgroundColor: "rgba(47, 93, 80, 0.4)" };
    }
    if (hintLevel >= 1 && expectedMove && statusPlay === "play") {
      styles[expectedMove.from] = { backgroundColor: "rgba(201, 162, 39, 0.45)" };
    }
    if (hintLevel >= 2 && expectedMove && statusPlay === "play") {
      styles[expectedMove.to] = { backgroundColor: "rgba(201, 162, 39, 0.62)" };
    }
    if (selected) {
      styles[selected] = { backgroundColor: "rgba(201, 162, 39, 0.5)" };
    }
    for (const move of legalTargets) {
      const occupied = Boolean(chessRef.current.get(move.to as Square));
      styles[move.to] = occupied
        ? {
            boxShadow: "inset 0 0 0 3px rgba(47, 93, 80, 0.85)",
            backgroundColor: styles[move.to]?.backgroundColor,
          }
        : {
            backgroundImage: "radial-gradient(circle, rgba(47, 93, 80, 0.45) 18%, transparent 20%)",
            backgroundColor: styles[move.to]?.backgroundColor,
          };
    }
    return styles;
  }, [expectedMove, hintLevel, lastMove, legalTargets, selected, statusPlay]);

  const title =
    mode === "practice" || mode === "random"
      ? "Random"
      : mode === "archive"
        ? `Puzzle ${puzzle.number}`
        : "Today's puzzle";

  return (
    <section className="game">
      <div className="board-wrap">
        <Chessboard
          options={{
            id: `puzzle-${puzzle.id}`,
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
                } else if (!moved) {
                  setSelected(null);
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
          {puzzle.number > 0 ? `Puzzle ${puzzle.number} · ` : ""}
          {puzzle.playerMoves} moves · {puzzle.rating} elo
        </p>
        <h2>{title}</h2>
        <p className="themes">{themeSummary(puzzle.themes)}</p>
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
            {statusPlay === "play" && !completed && (
              <button
                className="btn btn-ghost"
                type="button"
                onClick={() => setHintLevel((level) => Math.min(level + 1, 2))}
                disabled={hintLevel >= 2}
              >
                {hintLevel === 0
                  ? "Hint: show piece"
                  : hintLevel === 1
                    ? "Hint: show square"
                    : "Hints used"}
              </button>
            )}
            {statusPlay !== "play" && (
              <>
                <p className="solution">Solution: {solutionSans.join(" ")}</p>
                <textarea readOnly value={shareText} rows={4} />
                <div className="actions">
                  <button
                    className="btn"
                    type="button"
                    onClick={async () => {
                      const result = await shareResult(shareText);
                      setShareState(result === "shared" ? "Shared" : "Copied");
                      window.setTimeout(() => setShareState(""), 1500);
                    }}
                  >
                    {shareState || "Share result"}
                  </button>
                  <button
                    className="btn btn-ghost"
                    type="button"
                    onClick={replaySolution}
                    disabled={replaying}
                  >
                    {replaying ? "Replaying…" : "Replay solution"}
                  </button>
                  {persist ? (
                    <button className="btn btn-ghost" type="button" onClick={playAgain} disabled={replaying}>
                      Replay puzzle
                    </button>
                  ) : null}
                </div>
                {persist ? (
                  <p className="muted">Replay puzzle lets you try again without changing streak or stats.</p>
                ) : null}
                {mode === "daily" && (
                  <p className="muted">
                    <a href="/random">Keep going with a random puzzle</a>
                    {" · "}
                    <a href="/archive">Browse past days</a>
                  </p>
                )}
              </>
            )}
      </div>
      <FunFact />
    </section>
  );
}

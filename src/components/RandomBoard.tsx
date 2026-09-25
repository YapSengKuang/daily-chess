"use client";

import { PuzzleGame } from "@/components/PuzzleGame";
import type { DailyPuzzle } from "@/lib/chess";
import { useCallback, useEffect, useState } from "react";

export function RandomBoard() {
  const [puzzle, setPuzzle] = useState<DailyPuzzle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [fromLichess, setFromLichess] = useState(true);

  const loadPuzzle = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch(`/api/random-puzzle?t=${Date.now()}`, { cache: "no-store" });
      const body = (await response.json()) as DailyPuzzle & { fallback?: boolean; error?: string };
      if (!response.ok || !body.fen || !body.moves?.length) {
        throw new Error(body.error ?? "Could not load a puzzle");
      }
      setPuzzle(body);
      setFromLichess(!body.fallback);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not load a puzzle");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadPuzzle();
  }, [loadPuzzle]);

  return (
    <>
      <div className="page-actions">
        <button className="btn" type="button" onClick={() => void loadPuzzle()} disabled={loading}>
          {loading ? "Finding a puzzle…" : "Another puzzle"}
        </button>
      </div>
      {error ? <p className="muted">{error}</p> : null}
      {puzzle ? (
        <>
          <p className="muted">
            {fromLichess
              ? `Live from Lichess · ${puzzle.id}`
              : "Lichess was busy, so this one is from the local set."}
          </p>
          <PuzzleGame key={puzzle.id} puzzle={puzzle} mode="random" />
        </>
      ) : loading ? (
        <p className="muted">Picking a random Lichess puzzle…</p>
      ) : null}
    </>
  );
}

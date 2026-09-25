"use client";

import { PuzzleGame } from "@/components/PuzzleGame";
import { getDailyPuzzle, getPracticePuzzle } from "@/lib/puzzles";
import { todayUtc } from "@/lib/date";
import type { DailyPuzzle } from "@/lib/chess";
import { useEffect, useState } from "react";

export function PracticeBoard() {
  const [puzzle, setPuzzle] = useState<DailyPuzzle | null>(null);

  useEffect(() => {
    const todayId = getDailyPuzzle(todayUtc()).id;
    setPuzzle(getPracticePuzzle([todayId]));
  }, []);

  if (!puzzle) {
    return <p className="muted">Picking a puzzle…</p>;
  }

  return (
    <>
      <div className="page-actions">
        <button
          className="btn"
          type="button"
          onClick={() => {
            const todayId = getDailyPuzzle(todayUtc()).id;
            setPuzzle(getPracticePuzzle([todayId, puzzle.id]));
          }}
        >
          Another puzzle
        </button>
      </div>
      <PuzzleGame key={puzzle.id} puzzle={puzzle} mode="practice" />
    </>
  );
}

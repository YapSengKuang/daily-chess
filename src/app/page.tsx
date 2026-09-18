import { PuzzleGame } from "@/components/PuzzleGame";
import { todayUtc } from "@/lib/date";
import { getDailyPuzzle } from "@/lib/puzzles";

export const dynamic = "force-dynamic";

export default function Home() {
  const puzzle = getDailyPuzzle(todayUtc());

  return (
    <main className="page">
      <header className="top">
        <div>
          <p className="brand">Daily Chess</p>
          <p className="muted">
            One puzzle. {puzzle.playerMoves} moves. New position every day.
          </p>
        </div>
      </header>
      <PuzzleGame puzzle={puzzle} />
    </main>
  );
}

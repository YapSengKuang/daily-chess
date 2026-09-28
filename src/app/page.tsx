import { PuzzleGame } from "@/components/PuzzleGame";
import { getDailyPuzzle } from "@/lib/puzzles";
import { todayUtc } from "@/lib/date";

export const dynamic = "force-dynamic";

export default function Home() {
  const puzzle = getDailyPuzzle(todayUtc());

  return (
    <main className="page">
      <PuzzleGame puzzle={puzzle} mode="daily" />
    </main>
  );
}

import { PuzzleGame } from "@/components/PuzzleGame";
import { getDailyPuzzle } from "@/lib/puzzles";
import { todayUtc } from "@/lib/date";

export const revalidate = 60;

export default function Home() {
  const puzzle = getDailyPuzzle(todayUtc());

  return (
    <main className="page">
      <PuzzleGame puzzle={puzzle} mode="daily" />
    </main>
  );
}

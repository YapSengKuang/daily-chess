import { PuzzleGame } from "@/components/PuzzleGame";
import { isIsoDate, todayUtc } from "@/lib/date";
import { getDailyPuzzle } from "@/lib/puzzles";
import Link from "next/link";
import { notFound } from "next/navigation";

export const revalidate = 60;
export const dynamicParams = true;

export default async function PuzzleDatePage({
  params,
}: {
  params: Promise<{ date: string }>;
}) {
  const { date } = await params;
  if (!isIsoDate(date)) notFound();

  const today = todayUtc();
  if (date > today) {
    return (
      <main className="page">
        <section className="panel">
          <h1>Not yet</h1>
          <p>That puzzle unlocks at 00:00 UTC.</p>
          <p>
            <Link href="/archive">Back to archive</Link>
          </p>
        </section>
      </main>
    );
  }

  if (date === today) {
    return (
      <main className="page">
        <PuzzleGame puzzle={getDailyPuzzle(today)} mode="daily" />
      </main>
    );
  }

  const puzzle = getDailyPuzzle(date);
  return (
    <main className="page">
      <p className="muted">
        <Link href="/archive">Archive</Link> · {date}
      </p>
      <PuzzleGame puzzle={puzzle} mode="archive" />
    </main>
  );
}

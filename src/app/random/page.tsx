import { RandomBoard } from "@/components/RandomBoard";

export default function RandomPage() {
  return (
    <main className="page">
      <h1 className="page-title">Random</h1>
      <p className="muted">
        A new Lichess puzzle on every load. Not the same as today&apos;s daily, and it does not
        change your streak.
      </p>
      <RandomBoard />
    </main>
  );
}

import { PracticeBoard } from "@/components/PracticeBoard";

export default function PracticePage() {
  return (
    <main className="page">
      <h1 className="page-title">Practice</h1>
      <p className="muted">Extra Lichess puzzles. These do not change today&apos;s streak.</p>
      <PracticeBoard />
    </main>
  );
}

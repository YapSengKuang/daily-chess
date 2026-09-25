import { ArchiveCalendar } from "@/components/ArchiveCalendar";
import { monthKey, todayUtc } from "@/lib/date";

export default function ArchivePage() {
  return (
    <main className="page">
      <h1 className="page-title">Archive</h1>
      <ArchiveCalendar initialMonth={monthKey(todayUtc())} />
    </main>
  );
}

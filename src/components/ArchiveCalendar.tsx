"use client";

import { daysInUtcMonth, isIsoDate, monthKey, puzzleNumber, todayUtc } from "@/lib/date";
import { useAccountProgress } from "@/lib/use-account-progress";
import Link from "next/link";
import { useMemo, useState } from "react";

function parseMonth(value: string): { year: number; month: number } {
  const [year, month] = value.split("-").map(Number);
  return { year, month: month - 1 };
}

export function ArchiveCalendar({ initialMonth }: { initialMonth: string }) {
  const today = todayUtc();
  const minMonth = "2026-01";
  const maxMonth = monthKey(today);
  const [month, setMonth] = useState(initialMonth);
  const { signedIn, progress } = useAccountProgress();
  const attempts = progress?.attempts ?? {};

  const cells = useMemo(() => {
    const { year, month: monthIndex } = parseMonth(month);
    const firstWeekday = new Date(Date.UTC(year, monthIndex, 1)).getUTCDay();
    const count = daysInUtcMonth(year, monthIndex);
    const blanks = Array.from({ length: firstWeekday }, () => null);
    const days = Array.from({ length: count }, (_, index) => {
      const date = `${year}-${String(monthIndex + 1).padStart(2, "0")}-${String(index + 1).padStart(2, "0")}`;
      return date;
    });
    return [...blanks, ...days];
  }, [month]);

  function shiftMonth(delta: number) {
    const { year, month: monthIndex } = parseMonth(month);
    const next = new Date(Date.UTC(year, monthIndex + delta, 1));
    const key = `${next.getUTCFullYear()}-${String(next.getUTCMonth() + 1).padStart(2, "0")}`;
    if (key < minMonth || key > maxMonth) return;
    setMonth(key);
  }

  return (
    <section className="panel archive">
      <div className="archive-nav">
        <button className="btn btn-ghost" type="button" onClick={() => shiftMonth(-1)} disabled={month <= minMonth}>
          Prev
        </button>
        <h2>{month}</h2>
        <button className="btn btn-ghost" type="button" onClick={() => shiftMonth(1)} disabled={month >= maxMonth}>
          Next
        </button>
      </div>
      <p className="muted">
        Past days stay open. Future days stay locked. Today resets at 00:00 UTC.
        {signedIn
          ? " Checkmarks come from your account."
          : " Sign in to save and see your results on the calendar."}
      </p>
      <div className="calendar-weekdays">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
          <span key={day}>{day}</span>
        ))}
      </div>
      <div className="calendar">
        {cells.map((date, index) => {
          if (!date || !isIsoDate(date)) return <span key={`empty-${index}`} className="cal-cell empty" />;
          const future = date > today;
          const attempt = attempts[date];
          const mark = attempt?.solved ? "✓" : attempt?.completed ? "✕" : "";
          if (future) {
            return (
              <span key={date} className="cal-cell locked">
                {Number(date.slice(8))}
              </span>
            );
          }
          return (
            <Link key={date} href={date === today ? "/" : `/p/${date}`} className="cal-cell">
              <span>{Number(date.slice(8))}</span>
              <small>#{puzzleNumber(date)}</small>
              {mark ? <b>{mark}</b> : null}
            </Link>
          );
        })}
      </div>
    </section>
  );
}

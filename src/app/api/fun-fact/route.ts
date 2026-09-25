import { NextResponse } from "next/server";
import { todayUtc } from "@/lib/date";
import { allowRequest, clientKey } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

const CHESS_FALLBACK = [
  "The longest official chess game lasted 269 moves (Ivan Nikolic vs Goran Arsovic, 1989) and ended in a draw.",
  "A standard chess set has 32 pieces, but there are more possible chess games than atoms in the observable universe.",
  "The word 'checkmate' comes from the Persian 'shah mat', meaning 'the king is helpless'.",
  "The first chess-playing computer program was written in 1951 by Alan Turing — on paper, because no machine could run it yet.",
  "Pawns were not always allowed to move two squares on their first move; that rule is a later European addition.",
  "The folding chessboard was invented in the 12th century so the game could be carried more easily.",
  "Magnus Carlsen became a grandmaster at 13, but Sergey Karjakin still holds the record as the youngest at 12 years and 7 months.",
  "Blindfold chess exhibitions sometimes involve dozens of games at once, with the master seeing none of the boards.",
];

type Cached = { date: string; text: string; source: string };
let cache: Cached | null = null;

async function fetchUselessFact() {
  const response = await fetch("https://uselessfacts.jsph.pl/api/v2/facts/today?language=en", {
    headers: { Accept: "application/json" },
    next: { revalidate: 3600 },
  });
  if (!response.ok) throw new Error("fact api failed");
  const body = (await response.json()) as { text?: string };
  if (!body.text) throw new Error("empty fact");
  return body.text.trim().slice(0, 500);
}

export async function GET(request: Request) {
  const today = todayUtc();
  if (cache?.date === today) {
    return NextResponse.json(cache, {
      headers: { "Cache-Control": "public, s-maxage=3600" },
    });
  }

  if (!allowRequest(`fact:${clientKey(request)}`, 60, 60 * 1000)) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  try {
    const text = await fetchUselessFact();
    cache = { date: today, text, source: "uselessfacts.jsph.pl" };
  } catch {
    const index = Number(today.replaceAll("-", "")) % CHESS_FALLBACK.length;
    cache = { date: today, text: CHESS_FALLBACK[index], source: "Daily Chess" };
  }

  return NextResponse.json(cache, {
    headers: { "Cache-Control": "public, s-maxage=3600" },
  });
}

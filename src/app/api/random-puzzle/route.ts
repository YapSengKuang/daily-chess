import { getPracticePuzzle } from "@/lib/puzzles";
import { fetchPlayableLichessPuzzle } from "@/lib/lichess-puzzle";
import { checkLimit, clientKey, limitHeaders } from "@/lib/rate-limit";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const limited = checkLimit(`random:${clientKey(request)}`, 20, 10 * 60 * 1000);
  if (!limited.allowed) {
    const fallback = getPracticePuzzle();
    return NextResponse.json(
      { ...fallback, fallback: true },
      { status: 200, headers: { "Cache-Control": "no-store", ...limitHeaders(limited) } },
    );
  }

  try {
    const puzzle = await fetchPlayableLichessPuzzle();
    return NextResponse.json(puzzle, {
      headers: { "Cache-Control": "no-store", ...limitHeaders(limited) },
    });
  } catch (error) {
    console.error("Lichess random puzzle failed", error);
    const fallback = getPracticePuzzle();
    return NextResponse.json(
      { ...fallback, fallback: true },
      { headers: { "Cache-Control": "no-store", ...limitHeaders(limited) } },
    );
  }
}

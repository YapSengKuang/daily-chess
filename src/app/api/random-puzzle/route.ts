import { getPracticePuzzle } from "@/lib/puzzles";
import { fetchPlayableLichessPuzzle } from "@/lib/lichess-puzzle";
import { allowRequest, clientKey } from "@/lib/rate-limit";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  if (!allowRequest(`random:${clientKey(request)}`, 20, 10 * 60 * 1000)) {
    const fallback = getPracticePuzzle();
    return NextResponse.json(
      { ...fallback, fallback: true },
      { status: 200, headers: { "Cache-Control": "no-store" } },
    );
  }

  try {
    const puzzle = await fetchPlayableLichessPuzzle();
    return NextResponse.json(puzzle, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    console.error("Lichess random puzzle failed", error);
    const fallback = getPracticePuzzle();
    return NextResponse.json(
      { ...fallback, fallback: true },
      { headers: { "Cache-Control": "no-store" } },
    );
  }
}

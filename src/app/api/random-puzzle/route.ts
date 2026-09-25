import { getPracticePuzzle } from "@/lib/puzzles";
import { fetchPlayableLichessPuzzle } from "@/lib/lichess-puzzle";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
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

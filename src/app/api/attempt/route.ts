import { auth } from "@/auth";
import { isPlyResult } from "@/lib/progress-types";
import { saveUserAttempt } from "@/lib/user-progress";
import { NextResponse } from "next/server";

export async function PUT(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  }

  const body = (await request.json()) as {
    date?: string;
    solved?: boolean;
    failed?: boolean;
    results?: unknown;
    livesLeft?: number;
  };

  if (
    typeof body.date !== "string" ||
    typeof body.solved !== "boolean" ||
    typeof body.failed !== "boolean" ||
    typeof body.livesLeft !== "number" ||
    !Array.isArray(body.results) ||
    !body.results.every(isPlyResult)
  ) {
    return NextResponse.json({ error: "Invalid attempt" }, { status: 400 });
  }

  try {
    const progress = await saveUserAttempt(session.user.id, body.date, {
      solved: body.solved,
      failed: body.failed,
      results: body.results,
      livesLeft: body.livesLeft,
    });
    return NextResponse.json(progress);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not save attempt";
    const status = message.includes("not available") ? 400 : 503;
    return NextResponse.json({ error: message }, { status });
  }
}

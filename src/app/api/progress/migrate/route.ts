import { auth } from "@/auth";
import { importLocalAttempts } from "@/lib/user-progress";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  }

  const body = (await request.json()) as { attempts?: Record<string, unknown> };
  if (!body.attempts || typeof body.attempts !== "object") {
    return NextResponse.json({ error: "Invalid attempts" }, { status: 400 });
  }

  try {
    const result = await importLocalAttempts(session.user.id, body.attempts);
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not import progress";
    return NextResponse.json({ error: message }, { status: 503 });
  }
}

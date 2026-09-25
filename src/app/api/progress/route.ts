import { auth } from "@/auth";
import { loadUserProgress } from "@/lib/user-progress";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ signedIn: false });
  }

  try {
    const progress = await loadUserProgress(session.user.id);
    return NextResponse.json(progress);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not load progress";
    return NextResponse.json({ error: message }, { status: 503 });
  }
}

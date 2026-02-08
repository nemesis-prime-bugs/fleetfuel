import { NextResponse } from "next/server";

import { clearSessionCookie, getSessionCookie } from "@/lib/auth/sessionCookie";
import { deleteSessionByRawToken } from "@/lib/auth/sessionRepo";

export async function POST() {
  const rawToken = await getSessionCookie();

  if (rawToken) {
    // Best-effort invalidation.
    await deleteSessionByRawToken(rawToken);
  }

  await clearSessionCookie();

  return NextResponse.json({ ok: true }, { status: 200 });
}

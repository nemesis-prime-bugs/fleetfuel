import { NextResponse } from "next/server";

import { clearSessionCookie, getSessionCookie } from "@/lib/auth/sessionCookie";
import { deleteSessionByRawToken } from "@/lib/auth/sessionRepo";

export async function POST() {
  const rawToken = await getSessionCookie();

  if (rawToken) {
    // Best-effort invalidation.
    try {
      await deleteSessionByRawToken(rawToken);
    } catch {
      // ignore
    }
  }

  await clearSessionCookie();

  return NextResponse.json({ ok: true }, { status: 200 });
}

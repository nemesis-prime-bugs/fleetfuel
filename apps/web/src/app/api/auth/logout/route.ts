import { NextResponse } from "next/server";

import { clearSessionCookie, getSessionCookie } from "@/lib/auth/sessionCookie";
import { deleteSessionByRawToken } from "@/lib/auth/sessionRepo";

export async function POST(req: Request) {
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

  // Redirect is handy for form submits; JSON clients can ignore it.
  return NextResponse.redirect(new URL("/login", req.url), { status: 303 });
}

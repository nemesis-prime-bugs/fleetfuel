import { NextResponse } from "next/server";

import { prisma } from "@/lib/db";
import { verifyPassword } from "@/lib/auth/password";
import { normalizeEmail } from "@/lib/auth/signupValidation";
import { createSession } from "@/lib/auth/sessionRepo";
import { setSessionCookie } from "@/lib/auth/sessionCookie";
import { getClientIp, rateLimitOrThrow } from "@/lib/auth/rateLimit";

type LoginInput = {
  email: string;
  password: string;
};

export async function POST(req: Request) {
  const ip = getClientIp(req);
  try {
    rateLimitOrThrow(`login:ip:${ip}`, { limit: 20, windowMs: 60_000 });
  } catch (e) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const retryAfterSec = (e as any).retryAfterSec ?? 60;
    return NextResponse.json({ error: "Too many requests" }, { status: 429, headers: { "Retry-After": String(retryAfterSec) } });
  }

  let body: LoginInput;

  try {
    body = (await req.json()) as LoginInput;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { emailNorm } = normalizeEmail(body.email ?? "");
  const password = body.password ?? "";

  // Generic failure response to avoid enumeration.
  const fail = () => NextResponse.json({ error: "Invalid credentials" }, { status: 401 });

  if (!emailNorm.includes("@") || password.length === 0) return fail();

  const user = await prisma.user.findUnique({
    where: { emailNorm },
    select: { id: true, passwordHash: true },
  });

  if (!user) return fail();

  const ok = await verifyPassword(user.passwordHash, password);
  if (!ok) return fail();

  const session = await createSession(user.id);
  await setSessionCookie(session.rawToken, session.expiresAt);

  return NextResponse.json({ userId: user.id }, { status: 200 });
}

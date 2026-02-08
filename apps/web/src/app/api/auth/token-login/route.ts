import { NextResponse } from "next/server";

import { prisma } from "@/lib/db";
import { verifyPassword } from "@/lib/auth/password";
import { validateAndNormalizeSignupInput, type SignupInput } from "@/lib/auth/signupValidation";
import { createSession } from "@/lib/auth/sessionRepo";
import { getClientIp } from "@/lib/auth/rateLimit";
import { rateLimitOrThrowDurable, RateLimitError } from "@/lib/auth/rateLimitDurable";
import { getEnv } from "@/lib/env";

export async function POST(req: Request) {
  const env = getEnv();
  const ip = getClientIp(req);

  // Reuse login rate limit knobs.
  try {
    await rateLimitOrThrowDurable(`login:ip:${ip}`, { limit: env.RATE_LIMIT_LOGIN_IP_PER_MIN, windowMs: 60_000 });
  } catch (e) {
    const retryAfterSec = e instanceof RateLimitError ? e.retryAfterSec : 60;
    return NextResponse.json({ error: "Too many requests" }, { status: 429, headers: { "Retry-After": String(retryAfterSec) } });
  }

  let body: SignupInput;
  try {
    body = (await req.json()) as SignupInput;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  // We can reuse the signup validation shape (email+password) even though this is login.
  let input: ReturnType<typeof validateAndNormalizeSignupInput>;
  try {
    input = validateAndNormalizeSignupInput(body);
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 400 });
  }

  try {
    await rateLimitOrThrowDurable(`login:emailNorm:${input.emailNorm}`, {
      limit: env.RATE_LIMIT_LOGIN_EMAIL_PER_MIN,
      windowMs: 60_000,
    });
  } catch (e) {
    const retryAfterSec = e instanceof RateLimitError ? e.retryAfterSec : 60;
    return NextResponse.json({ error: "Too many requests" }, { status: 429, headers: { "Retry-After": String(retryAfterSec) } });
  }

  const user = await prisma.user.findUnique({ where: { emailNorm: input.emailNorm } });
  if (!user) return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });

  const ok = await verifyPassword(user.passwordHash, input.password);
  if (!ok) return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });

  const session = await createSession(user.id);

  return NextResponse.json(
    {
      token: session.rawToken,
      expiresAt: session.expiresAt.toISOString(),
      user: { id: user.id, email: user.email },
    },
    { status: 200 }
  );
}

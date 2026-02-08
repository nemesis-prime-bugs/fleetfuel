import { NextResponse } from "next/server";

import { prisma } from "@/lib/db";
import { hashPassword } from "@/lib/auth/password";
import { validateAndNormalizeSignupInput, type SignupInput } from "@/lib/auth/signupValidation";
import { createSession } from "@/lib/auth/sessionRepo";
import { setSessionCookie } from "@/lib/auth/sessionCookie";
import { getClientIp } from "@/lib/auth/rateLimit";
import { rateLimitOrThrowDurable, RateLimitError } from "@/lib/auth/rateLimitDurable";
import { getEnv } from "@/lib/env";

export async function POST(req: Request) {
  const env = getEnv();
  const ip = getClientIp(req);
  try {
    await rateLimitOrThrowDurable(`signup:ip:${ip}`, { limit: env.RATE_LIMIT_SIGNUP_IP_PER_MIN, windowMs: 60_000 });
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

  let input: ReturnType<typeof validateAndNormalizeSignupInput>;
  try {
    input = validateAndNormalizeSignupInput(body);
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 400 });
  }

  try {
    await rateLimitOrThrowDurable(`signup:emailNorm:${input.emailNorm}`, {
      limit: env.RATE_LIMIT_SIGNUP_EMAIL_PER_MIN,
      windowMs: 60_000,
    });
  } catch (e) {
    const retryAfterSec = e instanceof RateLimitError ? e.retryAfterSec : 60;
    return NextResponse.json({ error: "Too many requests" }, { status: 429, headers: { "Retry-After": String(retryAfterSec) } });
  }

  const passwordHash = await hashPassword(input.password);

  try {
    const user = await prisma.$transaction(async (tx) => {
      const createdUser = await tx.user.create({
        data: {
          email: input.email,
          emailNorm: input.emailNorm,
          passwordHash,
          account: {
            create: {
              type: input.accountType,
            },
          },
          profile: {
            create: {
              themePreference: "SYSTEM",
            },
          },
        },
        select: { id: true, email: true },
      });

      return createdUser;
    });

    const session = await createSession(user.id);
    await setSessionCookie(session.rawToken, session.expiresAt);

    return NextResponse.json({ user }, { status: 201 });
  } catch {
    // Avoid user enumeration; generic message.
    return NextResponse.json({ error: "Unable to create account" }, { status: 400 });
  }
}

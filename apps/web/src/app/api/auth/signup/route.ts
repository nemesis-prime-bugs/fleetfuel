import { NextResponse } from "next/server";

import { prisma } from "@/lib/db";
import { hashPassword } from "@/lib/auth/password";
import { validateAndNormalizeSignupInput, type SignupInput } from "@/lib/auth/signupValidation";
import { createSession } from "@/lib/auth/sessionRepo";
import { setSessionCookie } from "@/lib/auth/sessionCookie";

export async function POST(req: Request) {
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

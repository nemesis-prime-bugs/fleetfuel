import { prisma } from "@/lib/db";

import { createSessionToken, hashSessionToken } from "./sessionToken";

const SESSION_TTL_DAYS = 30;

export type CreatedSession = {
  rawToken: string;
  expiresAt: Date;
};

export async function createSession(userId: string): Promise<CreatedSession> {
  const { raw, hash } = createSessionToken();

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + SESSION_TTL_DAYS);

  await prisma.session.create({
    data: {
      userId,
      tokenHash: hash,
      expiresAt,
    },
  });

  return { rawToken: raw, expiresAt };
}

export async function getSessionByRawToken(rawToken: string) {
  const tokenHash = hashSessionToken(rawToken);

  const session = await prisma.session.findUnique({
    where: { tokenHash },
    include: { user: true },
  });

  if (!session) return null;
  if (session.expiresAt.getTime() <= Date.now()) return null;

  return session;
}

export async function deleteSessionByRawToken(rawToken: string): Promise<void> {
  const tokenHash = hashSessionToken(rawToken);
  await prisma.session.deleteMany({ where: { tokenHash } });
}

export async function deleteAllUserSessions(userId: string): Promise<void> {
  await prisma.session.deleteMany({ where: { userId } });
}

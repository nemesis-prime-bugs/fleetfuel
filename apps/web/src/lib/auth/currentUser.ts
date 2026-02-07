import { prisma } from "@/lib/db";

import { getSessionByRawToken } from "./sessionRepo";
import { getSessionCookie } from "./sessionCookie";

export async function getCurrentUser() {
  const rawToken = await getSessionCookie();
  if (!rawToken) return null;

  const session = await getSessionByRawToken(rawToken);
  if (!session) return null;

  // session.user includes passwordHash; return a safe subset.
  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: {
      id: true,
      email: true,
      createdAt: true,
      account: { select: { id: true, type: true, name: true } },
    },
  });

  return user;
}

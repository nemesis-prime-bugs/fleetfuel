import { headers } from "next/headers";

import { prisma } from "@/lib/db";

import { getSessionByRawToken } from "./sessionRepo";
import { getSessionCookie } from "./sessionCookie";

async function getBearerTokenFromHeaders(): Promise<string | null> {
  const h = await headers();
  const auth = h.get("authorization") ?? h.get("Authorization");
  if (!auth) return null;
  const m = auth.match(/^Bearer\s+(.+)$/i);
  return m?.[1]?.trim() || null;
}

export async function getCurrentUser() {
  const rawToken = (await getSessionCookie()) ?? (await getBearerTokenFromHeaders());
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

import { NextResponse } from "next/server";

import { headers } from "next/headers";

import { deleteSessionByRawToken } from "@/lib/auth/sessionRepo";

async function getBearerToken(): Promise<string | null> {
  const h = await headers();
  const auth = h.get("authorization") ?? h.get("Authorization");
  if (!auth) return null;
  const m = auth.match(/^Bearer\s+(.+)$/i);
  return m?.[1]?.trim() || null;
}

export async function POST() {
  const token = await getBearerToken();
  if (!token) return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });

  await deleteSessionByRawToken(token);
  return NextResponse.json({ ok: true }, { status: 200 });
}

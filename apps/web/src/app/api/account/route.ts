import { NextResponse } from "next/server";

import { prisma } from "@/lib/db";
import { requireUserApi } from "@/lib/auth/requireUserApi";

type PatchAccountInput = {
  type?: "PERSONAL" | "COMPANY";
  name?: string | null;
};

export async function GET() {
  const { user, error } = await requireUserApi();
  if (error) return error;

  const account = await prisma.account.findUnique({
    where: { userId: user!.id },
    select: { id: true, type: true, name: true, createdAt: true, updatedAt: true },
  });

  if (!account) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ account }, { status: 200 });
}

export async function PATCH(req: Request) {
  const { user, error } = await requireUserApi();
  if (error) return error;

  let body: PatchAccountInput;
  try {
    body = (await req.json()) as PatchAccountInput;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const patch: { type?: "PERSONAL" | "COMPANY"; name?: string | null } = {};

  if (body.type !== undefined) {
    if (body.type !== "PERSONAL" && body.type !== "COMPANY") {
      return NextResponse.json({ error: "type invalid" }, { status: 400 });
    }
    patch.type = body.type;
  }

  if (body.name !== undefined) {
    const name = body.name === null ? null : String(body.name).trim();
    if (name && name.length > 64) return NextResponse.json({ error: "name too long" }, { status: 400 });
    patch.name = name || null;
  }

  if (Object.keys(patch).length === 0) {
    return NextResponse.json({ error: "No changes" }, { status: 400 });
  }

  const updated = await prisma.account.update({
    where: { userId: user!.id },
    data: patch,
    select: { id: true, type: true, name: true, createdAt: true, updatedAt: true },
  });

  return NextResponse.json({ account: updated }, { status: 200 });
}

import { NextResponse } from "next/server";

import { prisma } from "@/lib/db";
import { requireUserApi } from "@/lib/auth/requireUserApi";

type PatchDriverInput = {
  name?: string;
};

export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { user, error } = await requireUserApi();
  if (error) return error;

  const { id } = await ctx.params;

  let body: PatchDriverInput;
  try {
    body = (await req.json()) as PatchDriverInput;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const nameRaw = body.name;
  if (nameRaw === undefined) return NextResponse.json({ error: "name is required" }, { status: 400 });
  const name = String(nameRaw).trim();
  if (!name) return NextResponse.json({ error: "name is required" }, { status: 400 });
  if (name.length > 64) return NextResponse.json({ error: "name too long" }, { status: 400 });

  const driver = await prisma.driver.findFirst({ where: { id, userId: user!.id } });
  if (!driver) return NextResponse.json({ error: "Not found" }, { status: 404 });

  try {
    const updated = await prisma.driver.update({
      where: { id },
      data: { name },
      select: { id: true, name: true, createdAt: true, updatedAt: true },
    });
    return NextResponse.json({ driver: updated }, { status: 200 });
  } catch (e) {
    const msg = (e as Error).message;
    if (msg.includes("Unique constraint")) {
      return NextResponse.json({ error: "Driver already exists" }, { status: 409 });
    }
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}

export async function DELETE(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { user, error } = await requireUserApi();
  if (error) return error;

  const { id } = await ctx.params;

  const driver = await prisma.driver.findFirst({ where: { id, userId: user!.id } });
  if (!driver) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.driver.delete({ where: { id } });
  return NextResponse.json({ ok: true }, { status: 200 });
}

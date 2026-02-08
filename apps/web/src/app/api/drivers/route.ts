import { NextResponse } from "next/server";

import { prisma } from "@/lib/db";
import { requireUserApi } from "@/lib/auth/requireUserApi";

type CreateDriverInput = {
  name: string;
};

export async function GET() {
  const { user, error } = await requireUserApi();
  if (error) return error;

  const drivers = await prisma.driver.findMany({
    where: { userId: user!.id },
    orderBy: { name: "asc" },
    select: { id: true, name: true, createdAt: true, updatedAt: true },
  });

  return NextResponse.json({ drivers }, { status: 200 });
}

export async function POST(req: Request) {
  const { user, error } = await requireUserApi();
  if (error) return error;

  let body: CreateDriverInput;
  try {
    body = (await req.json()) as CreateDriverInput;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const name = String(body.name ?? "").trim();
  if (!name) return NextResponse.json({ error: "name is required" }, { status: 400 });
  if (name.length > 64) return NextResponse.json({ error: "name too long" }, { status: 400 });

  try {
    const driver = await prisma.driver.create({
      data: { userId: user!.id, name },
      select: { id: true, name: true, createdAt: true, updatedAt: true },
    });
    return NextResponse.json({ driver }, { status: 201 });
  } catch (e) {
    const msg = (e as Error).message;
    if (msg.includes("Unique constraint")) {
      return NextResponse.json({ error: "Driver already exists" }, { status: 409 });
    }
    return NextResponse.json({ error: "Create failed" }, { status: 500 });
  }
}

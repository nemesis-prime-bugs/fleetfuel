import { NextResponse } from "next/server";

import { prisma } from "@/lib/db";
import { requireUserApi } from "@/lib/auth/requireUserApi";

type PatchFillUpInput = {
  occurredAt?: string;
  odometer?: number;
  fuelAmount?: number;
  totalCost?: number;
  currency?: string;
  isFullTank?: boolean;
  stationName?: string;
  notes?: string;
};

async function ensureOwnership(fillUpId: string, userId: string) {
  return prisma.fillUp.findFirst({
    where: {
      id: fillUpId,
      vehicle: {
        userId,
      },
    },
  });
}

export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { user, error } = await requireUserApi();
  if (error) return error;

  const { id } = await ctx.params;

  const existing = await ensureOwnership(id, user!.id);
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  let body: PatchFillUpInput;
  try {
    body = (await req.json()) as PatchFillUpInput;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const data: any = {};

  if (typeof body.occurredAt === "string") {
    const dt = new Date(body.occurredAt);
    if (Number.isNaN(dt.getTime())) return NextResponse.json({ error: "occurredAt invalid" }, { status: 400 });
    data.occurredAt = dt;
  }
  if (typeof body.odometer === "number") {
    if (!Number.isFinite(body.odometer) || body.odometer <= 0) return NextResponse.json({ error: "odometer invalid" }, { status: 400 });
    data.odometer = Math.round(body.odometer);
  }
  if (typeof body.fuelAmount === "number") {
    if (!Number.isFinite(body.fuelAmount) || body.fuelAmount <= 0) return NextResponse.json({ error: "fuelAmount invalid" }, { status: 400 });
    data.fuelAmount = body.fuelAmount;
  }
  if (typeof body.totalCost === "number") {
    if (!Number.isFinite(body.totalCost) || body.totalCost < 0) return NextResponse.json({ error: "totalCost invalid" }, { status: 400 });
    data.totalCost = Math.round(body.totalCost);
  }
  if (typeof body.currency === "string") data.currency = body.currency.toUpperCase();
  if (typeof body.isFullTank === "boolean") data.isFullTank = body.isFullTank;
  if (typeof body.stationName === "string") data.stationName = body.stationName.trim() || null;
  if (typeof body.notes === "string") data.notes = body.notes.trim() || null;

  await prisma.fillUp.update({
    where: { id },
    data,
  });

  const fillUp = await prisma.fillUp.findUnique({ where: { id } });
  return NextResponse.json({ fillUp }, { status: 200 });
}

export async function DELETE(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { user, error } = await requireUserApi();
  if (error) return error;

  const { id } = await ctx.params;

  const existing = await ensureOwnership(id, user!.id);
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.fillUp.delete({
    where: { id },
  });

  return NextResponse.json({ ok: true }, { status: 200 });
}

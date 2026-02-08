import { NextResponse } from "next/server";

import { prisma } from "@/lib/db";
import { requireUserApi } from "@/lib/auth/requireUserApi";

type PatchTripInput = {
  driverId?: string;
  startedAt?: string;
  endedAt?: string;
  odometerStart?: number;
  odometerEnd?: number;
  notes?: string | null;
};

export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { user, error } = await requireUserApi();
  if (error) return error;

  const { id } = await ctx.params;

  let body: PatchTripInput;
  try {
    body = (await req.json()) as PatchTripInput;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const trip = await prisma.trip.findFirst({
    where: { id, vehicle: { userId: user!.id } },
  });
  if (!trip) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const startedAt = body.startedAt ? new Date(body.startedAt) : trip.startedAt;
  const endedAt = body.endedAt ? new Date(body.endedAt) : trip.endedAt;
  if (Number.isNaN(startedAt.getTime())) return NextResponse.json({ error: "startedAt invalid" }, { status: 400 });
  if (Number.isNaN(endedAt.getTime())) return NextResponse.json({ error: "endedAt invalid" }, { status: 400 });
  if (endedAt.getTime() <= startedAt.getTime()) {
    return NextResponse.json({ error: "endedAt must be after startedAt" }, { status: 400 });
  }

  const odometerStart = body.odometerStart !== undefined ? Math.round(Number(body.odometerStart)) : trip.odometerStart;
  const odometerEnd = body.odometerEnd !== undefined ? Math.round(Number(body.odometerEnd)) : trip.odometerEnd;
  if (!Number.isFinite(odometerStart) || odometerStart <= 0) {
    return NextResponse.json({ error: "odometerStart invalid" }, { status: 400 });
  }
  if (!Number.isFinite(odometerEnd) || odometerEnd <= 0) {
    return NextResponse.json({ error: "odometerEnd invalid" }, { status: 400 });
  }
  if (odometerEnd <= odometerStart) {
    return NextResponse.json({ error: "odometerEnd must be greater than odometerStart" }, { status: 400 });
  }

  const driverId = body.driverId ?? trip.driverId;
  if (body.driverId) {
    const driver = await prisma.driver.findFirst({ where: { id: driverId, userId: user!.id } });
    if (!driver) return NextResponse.json({ error: "driver not found" }, { status: 404 });
  }

  const distance = odometerEnd - odometerStart;

  const updated = await prisma.trip.update({
    where: { id },
    data: {
      driverId,
      startedAt,
      endedAt,
      odometerStart,
      odometerEnd,
      distance,
      notes: body.notes === undefined ? trip.notes : body.notes?.trim() || null,
    },
    include: { driver: { select: { id: true, name: true } } },
  });

  return NextResponse.json({ trip: updated }, { status: 200 });
}

export async function DELETE(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { user, error } = await requireUserApi();
  if (error) return error;

  const { id } = await ctx.params;

  const trip = await prisma.trip.findFirst({
    where: { id, vehicle: { userId: user!.id } },
    select: { id: true },
  });
  if (!trip) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.trip.delete({ where: { id } });
  return NextResponse.json({ ok: true }, { status: 200 });
}

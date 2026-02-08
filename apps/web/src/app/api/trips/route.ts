import { NextResponse } from "next/server";

import { prisma } from "@/lib/db";
import { requireUserApi } from "@/lib/auth/requireUserApi";

type CreateTripInput = {
  vehicleId: string;
  driverId: string;
  startedAt: string; // ISO
  endedAt: string; // ISO
  odometerStart: number;
  odometerEnd: number;
  notes?: string;
};

export async function GET(req: Request) {
  const { user, error } = await requireUserApi();
  if (error) return error;

  const url = new URL(req.url);
  const vehicleId = url.searchParams.get("vehicleId");
  if (!vehicleId) return NextResponse.json({ error: "vehicleId is required" }, { status: 400 });

  const vehicle = await prisma.vehicle.findFirst({ where: { id: vehicleId, userId: user!.id } });
  if (!vehicle) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const trips = await prisma.trip.findMany({
    where: { vehicleId },
    orderBy: { startedAt: "desc" },
    include: { driver: { select: { id: true, name: true } } },
  });

  return NextResponse.json({ trips }, { status: 200 });
}

export async function POST(req: Request) {
  const { user, error } = await requireUserApi();
  if (error) return error;

  let body: CreateTripInput;
  try {
    body = (await req.json()) as CreateTripInput;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const vehicleId = String(body.vehicleId ?? "");
  const driverId = String(body.driverId ?? "");
  if (!vehicleId) return NextResponse.json({ error: "vehicleId is required" }, { status: 400 });
  if (!driverId) return NextResponse.json({ error: "driverId is required" }, { status: 400 });

  const vehicle = await prisma.vehicle.findFirst({ where: { id: vehicleId, userId: user!.id } });
  if (!vehicle) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const driver = await prisma.driver.findFirst({ where: { id: driverId, userId: user!.id } });
  if (!driver) return NextResponse.json({ error: "driver not found" }, { status: 404 });

  const startedAt = new Date(body.startedAt);
  const endedAt = new Date(body.endedAt);
  if (Number.isNaN(startedAt.getTime())) return NextResponse.json({ error: "startedAt invalid" }, { status: 400 });
  if (Number.isNaN(endedAt.getTime())) return NextResponse.json({ error: "endedAt invalid" }, { status: 400 });
  if (endedAt.getTime() <= startedAt.getTime()) {
    return NextResponse.json({ error: "endedAt must be after startedAt" }, { status: 400 });
  }

  const odometerStart = Math.round(Number(body.odometerStart));
  const odometerEnd = Math.round(Number(body.odometerEnd));
  if (!Number.isFinite(odometerStart) || odometerStart <= 0) {
    return NextResponse.json({ error: "odometerStart invalid" }, { status: 400 });
  }
  if (!Number.isFinite(odometerEnd) || odometerEnd <= 0) {
    return NextResponse.json({ error: "odometerEnd invalid" }, { status: 400 });
  }
  if (odometerEnd <= odometerStart) {
    return NextResponse.json({ error: "odometerEnd must be greater than odometerStart" }, { status: 400 });
  }

  const distance = odometerEnd - odometerStart;

  const trip = await prisma.trip.create({
    data: {
      vehicleId,
      driverId,
      startedAt,
      endedAt,
      odometerStart,
      odometerEnd,
      distance,
      notes: body.notes?.trim() || null,
    },
    include: { driver: { select: { id: true, name: true } } },
  });

  return NextResponse.json({ trip }, { status: 201 });
}

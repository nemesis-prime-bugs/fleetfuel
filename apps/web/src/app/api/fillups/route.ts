import { NextResponse } from "next/server";

import { prisma } from "@/lib/db";
import { requireUserApi } from "@/lib/auth/requireUserApi";

type CreateFillUpInput = {
  vehicleId: string;
  occurredAt: string; // ISO
  odometer: number;
  fuelAmount: number;
  totalCost: number; // cents
  currency?: string;
  isFullTank?: boolean;
  stationName?: string;
  notes?: string;
};

export async function GET(req: Request) {
  const { user, error } = await requireUserApi();
  if (error) return error;

  const url = new URL(req.url);
  const vehicleId = url.searchParams.get("vehicleId");
  if (!vehicleId) return NextResponse.json({ error: "vehicleId is required" }, { status: 400 });

  // Ownership check
  const vehicle = await prisma.vehicle.findFirst({ where: { id: vehicleId, userId: user!.id } });
  if (!vehicle) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const fillUps = await prisma.fillUp.findMany({
    where: { vehicleId },
    orderBy: { occurredAt: "desc" },
    include: {
      receipts: {
        select: { id: true, storageKey: true, contentType: true, createdAt: true },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  return NextResponse.json({ fillUps }, { status: 200 });
}

export async function POST(req: Request) {
  const { user, error } = await requireUserApi();
  if (error) return error;

  let body: CreateFillUpInput;
  try {
    body = (await req.json()) as CreateFillUpInput;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const vehicleId = body.vehicleId;
  if (!vehicleId) return NextResponse.json({ error: "vehicleId is required" }, { status: 400 });

  const vehicle = await prisma.vehicle.findFirst({ where: { id: vehicleId, userId: user!.id } });
  if (!vehicle) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const occurredAt = new Date(body.occurredAt);
  if (Number.isNaN(occurredAt.getTime())) {
    return NextResponse.json({ error: "occurredAt must be ISO date" }, { status: 400 });
  }

  const odometer = Number(body.odometer);
  const fuelAmount = Number(body.fuelAmount);
  const totalCost = Number(body.totalCost);

  if (!Number.isFinite(odometer) || odometer <= 0) return NextResponse.json({ error: "odometer invalid" }, { status: 400 });
  if (!Number.isFinite(fuelAmount) || fuelAmount <= 0) return NextResponse.json({ error: "fuelAmount invalid" }, { status: 400 });
  if (!Number.isFinite(totalCost) || totalCost < 0) return NextResponse.json({ error: "totalCost invalid" }, { status: 400 });

  const fillUp = await prisma.fillUp.create({
    data: {
      vehicleId,
      occurredAt,
      odometer: Math.round(odometer),
      fuelAmount,
      totalCost: Math.round(totalCost),
      currency: (body.currency ?? "EUR").toUpperCase(),
      isFullTank: body.isFullTank ?? true,
      stationName: body.stationName?.trim() || null,
      notes: body.notes?.trim() || null,
    },
  });

  return NextResponse.json({ fillUp }, { status: 201 });
}

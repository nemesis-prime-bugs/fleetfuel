import { NextResponse } from "next/server";

import { prisma } from "@/lib/db";
import { requireUserApi } from "@/lib/auth/requireUserApi";

export async function GET(req: Request) {
  const { user, error } = await requireUserApi();
  if (error) return error;

  const url = new URL(req.url);
  const vehicleId = url.searchParams.get("vehicleId");
  if (!vehicleId) return NextResponse.json({ error: "vehicleId is required" }, { status: 400 });

  const vehicle = await prisma.vehicle.findFirst({ where: { id: vehicleId, userId: user!.id } });
  if (!vehicle) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const fillUps = await prisma.fillUp.findMany({
    where: { vehicleId },
    select: { occurredAt: true, fuelAmount: true, totalCost: true, currency: true },
    orderBy: { occurredAt: "asc" },
  });

  type Bucket = { fuelAmount: number; totalCost: number; currency: string };
  const buckets = new Map<string, Bucket>();

  for (const f of fillUps) {
    const y = f.occurredAt.getUTCFullYear();
    const m = String(f.occurredAt.getUTCMonth() + 1).padStart(2, "0");
    const key = `${y}-${m}`;

    const b = buckets.get(key) ?? { fuelAmount: 0, totalCost: 0, currency: f.currency };
    b.fuelAmount += f.fuelAmount;
    b.totalCost += f.totalCost;
    buckets.set(key, b);
  }

  const months = [...buckets.entries()]
    .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
    .map(([month, b]) => ({ month, ...b }));

  return NextResponse.json({ months }, { status: 200 });
}

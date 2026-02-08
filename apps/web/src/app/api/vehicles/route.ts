import { NextResponse } from "next/server";

import { prisma } from "@/lib/db";
import { requireUserApi } from "@/lib/auth/requireUserApi";

export async function GET() {
  const { user, error } = await requireUserApi();
  if (error) return error;

  const vehicles = await prisma.vehicle.findMany({
    where: { userId: user!.id },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ vehicles }, { status: 200 });
}

type CreateVehicleInput = {
  name: string;
  fuelType: "GASOLINE" | "DIESEL" | "ELECTRIC" | "HYBRID" | "OTHER";
  unitSystem?: "METRIC" | "IMPERIAL";
};

export async function POST(req: Request) {
  const { user, error } = await requireUserApi();
  if (error) return error;

  let body: CreateVehicleInput;
  try {
    body = (await req.json()) as CreateVehicleInput;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const name = (body.name ?? "").trim();
  if (!name) return NextResponse.json({ error: "Name is required" }, { status: 400 });
  if (name.length > 64) return NextResponse.json({ error: "Name too long" }, { status: 400 });

  const fuelType = body.fuelType;
  if (!fuelType) return NextResponse.json({ error: "Fuel type is required" }, { status: 400 });

  const unitSystem = body.unitSystem ?? "METRIC";

  const vehicle = await prisma.vehicle.create({
    data: {
      userId: user!.id,
      name,
      fuelType,
      unitSystem,
    },
  });

  return NextResponse.json({ vehicle }, { status: 201 });
}

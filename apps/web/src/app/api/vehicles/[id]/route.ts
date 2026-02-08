import { NextResponse } from "next/server";

import { prisma } from "@/lib/db";
import { requireUserApi } from "@/lib/auth/requireUserApi";

type UpdateVehicleInput = {
  name?: string;
  fuelType?: "GASOLINE" | "DIESEL" | "ELECTRIC" | "HYBRID" | "OTHER";
  unitSystem?: "METRIC" | "IMPERIAL";
};

export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { user, error } = await requireUserApi();
  if (error) return error;

  const { id } = await ctx.params;

  let body: UpdateVehicleInput;
  try {
    body = (await req.json()) as UpdateVehicleInput;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const data: UpdateVehicleInput = {};
  if (typeof body.name === "string") {
    const name = body.name.trim();
    if (!name) return NextResponse.json({ error: "Name cannot be empty" }, { status: 400 });
    data.name = name;
  }
  if (body.fuelType) data.fuelType = body.fuelType;
  if (body.unitSystem) data.unitSystem = body.unitSystem;

  const updated = await prisma.vehicle.updateMany({
    where: { id, userId: user!.id },
    data,
  });

  if (updated.count === 0) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const vehicle = await prisma.vehicle.findFirst({ where: { id, userId: user!.id } });
  return NextResponse.json({ vehicle }, { status: 200 });
}

export async function DELETE(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { user, error } = await requireUserApi();
  if (error) return error;

  const { id } = await ctx.params;

  const deleted = await prisma.vehicle.deleteMany({
    where: { id, userId: user!.id },
  });

  if (deleted.count === 0) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ ok: true }, { status: 200 });
}

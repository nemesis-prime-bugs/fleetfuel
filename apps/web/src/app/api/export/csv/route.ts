import { NextResponse } from "next/server";

import { prisma } from "@/lib/db";
import { requireUserApi } from "@/lib/auth/requireUserApi";

function csvEscape(v: string) {
  if (v.includes("\"")) v = v.replaceAll("\"", "\"\"");
  if (v.includes(",") || v.includes("\n") || v.includes("\r") || v.includes("\"")) return `"${v}"`;
  return v;
}

function toCsv(rows: string[][]) {
  return rows.map((r) => r.map((c) => csvEscape(c)).join(",")).join("\n") + "\n";
}

export async function GET(req: Request) {
  const { user, error } = await requireUserApi();
  if (error) return error;

  const url = new URL(req.url);
  const vehicleId = url.searchParams.get("vehicleId");
  const kind = url.searchParams.get("kind") ?? "fillups"; // fillups|trips

  if (!vehicleId) return NextResponse.json({ error: "vehicleId is required" }, { status: 400 });

  const vehicle = await prisma.vehicle.findFirst({ where: { id: vehicleId, userId: user!.id } });
  if (!vehicle) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const filenameBase = `fleetfuel-${kind}-${vehicle.name.replaceAll(/[^a-zA-Z0-9-_]+/g, "_")}`;

  if (kind === "trips") {
    const trips = await prisma.trip.findMany({
      where: { vehicleId },
      orderBy: { startedAt: "asc" },
      include: { driver: { select: { name: true } } },
    });

    const rows: string[][] = [
      ["startedAt", "endedAt", "driver", "odometerStart", "odometerEnd", "distanceKm", "notes"],
      ...trips.map((t) => [
        t.startedAt.toISOString(),
        t.endedAt.toISOString(),
        t.driver.name,
        String(t.odometerStart),
        String(t.odometerEnd),
        String(t.distance),
        t.notes ?? "",
      ]),
    ];

    const csv = toCsv(rows);
    return new NextResponse(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename=\"${filenameBase}.csv\"`,
        "Cache-Control": "private, max-age=0, no-store",
      },
    });
  }

  if (kind !== "fillups") return NextResponse.json({ error: "kind must be fillups or trips" }, { status: 400 });

  const fillUps = await prisma.fillUp.findMany({
    where: { vehicleId },
    orderBy: { occurredAt: "asc" },
  });

  const rows: string[][] = [
    ["occurredAt", "odometer", "fuelAmount", "totalCostCents", "currency", "isFullTank", "stationName", "notes"],
    ...fillUps.map((f) => [
      f.occurredAt.toISOString(),
      String(f.odometer),
      String(f.fuelAmount),
      String(f.totalCost),
      f.currency,
      f.isFullTank ? "true" : "false",
      f.stationName ?? "",
      f.notes ?? "",
    ]),
  ];

  const csv = toCsv(rows);
  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename=\"${filenameBase}.csv\"`,
      "Cache-Control": "private, max-age=0, no-store",
    },
  });
}

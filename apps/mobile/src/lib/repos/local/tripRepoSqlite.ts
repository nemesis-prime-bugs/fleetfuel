import type { ListResult, Trip, TripRepo } from "@fleetfuel/shared";
import { v4 as uuidv4 } from "uuid";

import { migrate } from "../../db/sqlite";

function nowIso() {
  return new Date().toISOString();
}

export function createTripRepoSqlite(opts?: { dbName?: string }): TripRepo {
  const dbName = opts?.dbName ?? "fleetfuel";

  return {
    async listByVehicle(vehicleId): Promise<ListResult<Trip>> {
      const db = await migrate(dbName);
      const res = await db.query(
        "SELECT id, vehicleId, driverId, startedAt, endedAt, odometerStart, odometerEnd, distance, notes FROM trips WHERE vehicleId = ? ORDER BY startedAt DESC;",
        [vehicleId]
      );
      const items = (res.values ?? []) as Trip[];
      return { items };
    },

    async create(input): Promise<Trip> {
      const db = await migrate(dbName);
      const id = uuidv4();
      const ts = nowIso();

      await db.run(
        "INSERT INTO trips (id, vehicleId, driverId, startedAt, endedAt, odometerStart, odometerEnd, distance, notes, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);",
        [
          id,
          input.vehicleId,
          input.driverId,
          input.startedAt,
          input.endedAt,
          input.odometerStart,
          input.odometerEnd,
          input.distance,
          input.notes ?? null,
          ts,
          ts,
        ]
      );

      return { ...input, id };
    },

    async patch(id, patch): Promise<void> {
      const db = await migrate(dbName);
      const ts = nowIso();

      const currentRes = await db.query(
        "SELECT id, vehicleId, driverId, startedAt, endedAt, odometerStart, odometerEnd, distance, notes FROM trips WHERE id = ? LIMIT 1;",
        [id]
      );
      const current = (currentRes.values?.[0] ?? null) as Trip | null;
      if (!current) return;

      const next: Trip = {
        ...current,
        ...patch,
        id: current.id,
      };

      await db.run(
        "UPDATE trips SET vehicleId = ?, driverId = ?, startedAt = ?, endedAt = ?, odometerStart = ?, odometerEnd = ?, distance = ?, notes = ?, updatedAt = ? WHERE id = ?;",
        [
          next.vehicleId,
          next.driverId,
          next.startedAt,
          next.endedAt,
          next.odometerStart,
          next.odometerEnd,
          next.distance,
          next.notes ?? null,
          ts,
          id,
        ]
      );
    },

    async remove(id): Promise<void> {
      const db = await migrate(dbName);
      await db.run("DELETE FROM trips WHERE id = ?;", [id]);
    },
  };
}

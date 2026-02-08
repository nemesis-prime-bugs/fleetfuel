import type { ListResult, Vehicle, VehicleRepo } from "@fleetfuel/shared";
import { v4 as uuidv4 } from "uuid";

import { migrate } from "../../db/sqlite";

function nowIso() {
  return new Date().toISOString();
}

export function createVehicleRepoSqlite(opts?: { dbName?: string }): VehicleRepo {
  const dbName = opts?.dbName ?? "fleetfuel";

  return {
    async list(): Promise<ListResult<Vehicle>> {
      const db = await migrate(dbName);
      const res = await db.query("SELECT id, name, fuelType, unitSystem, createdAt, updatedAt FROM vehicles ORDER BY name ASC;");
      const items = (res.values ?? []) as Vehicle[];
      return { items };
    },

    async create(input): Promise<Vehicle> {
      const db = await migrate(dbName);
      const id = uuidv4();
      const ts = nowIso();
      await db.run(
        "INSERT INTO vehicles (id, name, fuelType, unitSystem, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?);",
        [id, input.name, input.fuelType, input.unitSystem, ts, ts]
      );
      return { id, name: input.name, fuelType: input.fuelType, unitSystem: input.unitSystem, createdAt: ts, updatedAt: ts };
    },

    async patch(id, patch): Promise<void> {
      const db = await migrate(dbName);
      const ts = nowIso();
      // Read current
      const currentRes = await db.query(
        "SELECT id, name, fuelType, unitSystem, createdAt, updatedAt FROM vehicles WHERE id = ? LIMIT 1;",
        [id]
      );
      const current = (currentRes.values?.[0] ?? null) as Vehicle | null;
      if (!current) return;

      const next = {
        name: patch.name ?? current.name,
        fuelType: patch.fuelType ?? current.fuelType,
        unitSystem: patch.unitSystem ?? current.unitSystem,
      };

      await db.run(
        "UPDATE vehicles SET name = ?, fuelType = ?, unitSystem = ?, updatedAt = ? WHERE id = ?;",
        [next.name, next.fuelType, next.unitSystem, ts, id]
      );
    },

    async remove(id): Promise<void> {
      const db = await migrate(dbName);
      await db.run("DELETE FROM vehicles WHERE id = ?;", [id]);
    },
  };
}

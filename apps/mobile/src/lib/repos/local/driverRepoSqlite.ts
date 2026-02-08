import type { Driver, DriverRepo, ListResult } from "@fleetfuel/shared";
import { v4 as uuidv4 } from "uuid";

import { migrate } from "../../db/sqlite";

function nowIso() {
  return new Date().toISOString();
}

export function createDriverRepoSqlite(opts?: { dbName?: string }): DriverRepo {
  const dbName = opts?.dbName ?? "fleetfuel";

  return {
    async list(): Promise<ListResult<Driver>> {
      const db = await migrate(dbName);
      const res = await db.query("SELECT id, name FROM drivers ORDER BY name ASC;");
      const items = (res.values ?? []) as Driver[];
      return { items };
    },

    async create(input): Promise<Driver> {
      const db = await migrate(dbName);
      const id = uuidv4();
      const ts = nowIso();
      await db.run("INSERT INTO drivers (id, name, createdAt, updatedAt) VALUES (?, ?, ?, ?);", [id, input.name, ts, ts]);
      return { id, name: input.name };
    },

    async rename(id, name): Promise<void> {
      const db = await migrate(dbName);
      const ts = nowIso();
      await db.run("UPDATE drivers SET name = ?, updatedAt = ? WHERE id = ?;", [name, ts, id]);
    },

    async remove(id): Promise<void> {
      const db = await migrate(dbName);
      await db.run("DELETE FROM drivers WHERE id = ?;", [id]);
    },
  };
}

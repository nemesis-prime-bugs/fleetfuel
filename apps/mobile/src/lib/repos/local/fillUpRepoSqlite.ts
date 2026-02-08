import type { FillUp, FillUpRepo, ListResult, Receipt } from "@fleetfuel/shared";
import { v4 as uuidv4 } from "uuid";

import { migrate } from "../../db/sqlite";

function nowIso() {
  return new Date().toISOString();
}

function fromRow(row: any): FillUp {
  return {
    id: String(row.id),
    vehicleId: String(row.vehicleId),
    occurredAt: String(row.occurredAt),
    odometer: Number(row.odometer),
    fuelAmount: Number(row.fuelAmount),
    totalCost: Number(row.totalCost),
    currency: String(row.currency),
    isFullTank: Number(row.isFullTank) === 1,
    stationName: row.stationName ?? null,
    notes: row.notes ?? null,
  };
}

export function createFillUpRepoSqlite(opts?: { dbName?: string }): FillUpRepo {
  const dbName = opts?.dbName ?? "fleetfuel";

  return {
    async listByVehicle(vehicleId): Promise<ListResult<FillUp & { receipts?: Receipt[] }>> {
      const db = await migrate(dbName);
      const res = await db.query(
        "SELECT id, vehicleId, occurredAt, odometer, fuelAmount, totalCost, currency, isFullTank, stationName, notes FROM fillups WHERE vehicleId = ? ORDER BY occurredAt DESC;",
        [vehicleId]
      );
      const fillups = (res.values ?? []).map(fromRow);

      if (fillups.length === 0) return { items: [] };

      const ids = fillups.map((f) => f.id);
      const placeholders = ids.map(() => "?").join(",");
      const receiptRes = await db.query(
        `SELECT id, fillUpId, contentType, storageKey, sha256, createdAt FROM receipts WHERE fillUpId IN (${placeholders}) ORDER BY createdAt ASC;`,
        ids
      );
      const receipts = (receiptRes.values ?? []) as Receipt[];

      const receiptsByFillUpId = new Map<string, Receipt[]>();
      for (const r of receipts) {
        const list = receiptsByFillUpId.get(r.fillUpId) ?? [];
        list.push(r);
        receiptsByFillUpId.set(r.fillUpId, list);
      }

      const items = fillups.map((f) => ({ ...f, receipts: receiptsByFillUpId.get(f.id) ?? [] }));
      return { items };
    },

    async create(input): Promise<FillUp> {
      const db = await migrate(dbName);
      const id = uuidv4();
      const ts = nowIso();

      await db.run(
        "INSERT INTO fillups (id, vehicleId, occurredAt, odometer, fuelAmount, totalCost, currency, isFullTank, stationName, notes, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);",
        [
          id,
          input.vehicleId,
          input.occurredAt,
          input.odometer,
          input.fuelAmount,
          input.totalCost,
          input.currency,
          input.isFullTank ? 1 : 0,
          input.stationName ?? null,
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
        "SELECT id, vehicleId, occurredAt, odometer, fuelAmount, totalCost, currency, isFullTank, stationName, notes FROM fillups WHERE id = ? LIMIT 1;",
        [id]
      );
      const currentRow = currentRes.values?.[0] ?? null;
      if (!currentRow) return;

      const current = fromRow(currentRow);
      const next: FillUp = {
        ...current,
        ...patch,
        id: current.id,
      };

      await db.run(
        "UPDATE fillups SET vehicleId = ?, occurredAt = ?, odometer = ?, fuelAmount = ?, totalCost = ?, currency = ?, isFullTank = ?, stationName = ?, notes = ?, updatedAt = ? WHERE id = ?;",
        [
          next.vehicleId,
          next.occurredAt,
          next.odometer,
          next.fuelAmount,
          next.totalCost,
          next.currency,
          next.isFullTank ? 1 : 0,
          next.stationName ?? null,
          next.notes ?? null,
          ts,
          id,
        ]
      );
    },

    async remove(id): Promise<void> {
      const db = await migrate(dbName);
      await db.run("DELETE FROM fillups WHERE id = ?;", [id]);
    },
  };
}

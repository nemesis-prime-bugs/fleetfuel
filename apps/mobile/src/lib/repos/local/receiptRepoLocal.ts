import type { Receipt, ReceiptRepo } from "@fleetfuel/shared";
import { v4 as uuidv4 } from "uuid";

import { migrate } from "../../db/sqlite";
import { writeReceiptFile } from "../../receipts/storage";

function nowIso() {
  return new Date().toISOString();
}

export function createReceiptRepoLocal(opts?: { dbName?: string }): ReceiptRepo {
  const dbName = opts?.dbName ?? "fleetfuel";

  return {
    async uploadToFillUp({ fillUpId, file }): Promise<Receipt> {
      const db = await migrate(dbName);
      const id = uuidv4();

      const { storageKey } = await writeReceiptFile({ receiptId: id, filename: file.name, bytes: file.bytes });

      const ts = nowIso();
      await db.run(
        "INSERT INTO receipts (id, fillUpId, contentType, storageKey, sha256, createdAt) VALUES (?, ?, ?, ?, ?, ?);",
        [id, fillUpId, file.type || "application/octet-stream", storageKey, null, ts]
      );

      return {
        id,
        fillUpId,
        contentType: file.type || "application/octet-stream",
        sha256: null,
        createdAt: ts,
        storageKey,
      };
    },
  };
}

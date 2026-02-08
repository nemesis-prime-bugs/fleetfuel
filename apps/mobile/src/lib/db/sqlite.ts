import { Capacitor } from "@capacitor/core";
import { CapacitorSQLite, SQLiteConnection } from "@capacitor-community/sqlite";

let sqlite: SQLiteConnection | null = null;

export function getSqlite(): SQLiteConnection {
  if (!sqlite) sqlite = new SQLiteConnection(CapacitorSQLite);
  return sqlite;
}

export async function ensureDbOpen(dbName = "fleetfuel") {
  const sqliteConn = getSqlite();

  // Web fallback requires the custom element to be registered.
  // On iOS/Android this is ignored.
  if (Capacitor.getPlatform() === "web") {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const w = window as any;
    if (!w?.customElements?.get?.("jeep-sqlite")) {
      // Consumers should call defineCustomElements from jeep-sqlite/loader in main.tsx.
      // We keep this explicit (no side-effects here).
      throw new Error("jeep-sqlite not registered (call defineCustomElements in main.tsx)");
    }
  }

  const db = await sqliteConn.createConnection(dbName, false, "no-encryption", 1, false);
  await db.open();
  return db;
}

export async function migrate(dbName = "fleetfuel") {
  const db = await ensureDbOpen(dbName);

  // v1 schema (minimal): vehicles
  await db.execute(`
    CREATE TABLE IF NOT EXISTS vehicles (
      id TEXT PRIMARY KEY NOT NULL,
      name TEXT NOT NULL,
      fuelType TEXT NOT NULL,
      unitSystem TEXT NOT NULL,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL
    );
    CREATE UNIQUE INDEX IF NOT EXISTS vehicles_name_unique ON vehicles(name);
  `);

  return db;
}

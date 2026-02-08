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

  // v1 schema (minimal): vehicles, drivers, trips, fillups
  await db.execute(`
    PRAGMA foreign_keys = ON;

    CREATE TABLE IF NOT EXISTS vehicles (
      id TEXT PRIMARY KEY NOT NULL,
      name TEXT NOT NULL,
      fuelType TEXT NOT NULL,
      unitSystem TEXT NOT NULL,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL
    );
    CREATE UNIQUE INDEX IF NOT EXISTS vehicles_name_unique ON vehicles(name);

    CREATE TABLE IF NOT EXISTS drivers (
      id TEXT PRIMARY KEY NOT NULL,
      name TEXT NOT NULL,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL
    );
    CREATE UNIQUE INDEX IF NOT EXISTS drivers_name_unique ON drivers(name);

    CREATE TABLE IF NOT EXISTS trips (
      id TEXT PRIMARY KEY NOT NULL,
      vehicleId TEXT NOT NULL,
      driverId TEXT NOT NULL,
      startedAt TEXT NOT NULL,
      endedAt TEXT NOT NULL,
      odometerStart REAL NOT NULL,
      odometerEnd REAL NOT NULL,
      distance REAL NOT NULL,
      notes TEXT,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL,
      FOREIGN KEY(vehicleId) REFERENCES vehicles(id) ON DELETE CASCADE,
      FOREIGN KEY(driverId) REFERENCES drivers(id) ON DELETE RESTRICT
    );
    CREATE INDEX IF NOT EXISTS trips_vehicle_startedAt_idx ON trips(vehicleId, startedAt);
    CREATE INDEX IF NOT EXISTS trips_driver_startedAt_idx ON trips(driverId, startedAt);

    CREATE TABLE IF NOT EXISTS fillups (
      id TEXT PRIMARY KEY NOT NULL,
      vehicleId TEXT NOT NULL,
      occurredAt TEXT NOT NULL,
      odometer REAL NOT NULL,
      fuelAmount REAL NOT NULL,
      totalCost INTEGER NOT NULL,
      currency TEXT NOT NULL,
      isFullTank INTEGER NOT NULL,
      stationName TEXT,
      notes TEXT,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL,
      FOREIGN KEY(vehicleId) REFERENCES vehicles(id) ON DELETE CASCADE
    );
    CREATE INDEX IF NOT EXISTS fillups_vehicle_occurredAt_idx ON fillups(vehicleId, occurredAt);

    CREATE TABLE IF NOT EXISTS receipts (
      id TEXT PRIMARY KEY NOT NULL,
      fillUpId TEXT NOT NULL,
      contentType TEXT NOT NULL,
      storageKey TEXT NOT NULL,
      sha256 TEXT,
      createdAt TEXT NOT NULL,
      FOREIGN KEY(fillUpId) REFERENCES fillups(id) ON DELETE CASCADE
    );
    CREATE INDEX IF NOT EXISTS receipts_fillup_idx ON receipts(fillUpId);
  `);

  return db;
}

export type Id = string;

export type AccountType = "PERSONAL" | "COMPANY";
export type FuelType = "GASOLINE" | "DIESEL" | "ELECTRIC" | "HYBRID" | "OTHER";
export type UnitSystem = "METRIC" | "IMPERIAL";

export type ThemePreference = "LIGHT" | "DARK" | "SYSTEM";
export type Gender = "MALE" | "FEMALE" | "DIVERSE" | "UNKNOWN";

export type Vehicle = {
  id: Id;
  name: string;
  fuelType: FuelType;
  unitSystem: UnitSystem;
  createdAt?: string;
  updatedAt?: string;
};

export type FillUp = {
  id: Id;
  vehicleId: Id;
  occurredAt: string; // ISO
  odometer: number;
  fuelAmount: number;
  totalCost: number; // cents
  currency: string;
  isFullTank: boolean;
  stationName?: string | null;
  notes?: string | null;
};

export type Driver = {
  id: Id;
  name: string;
};

export type Trip = {
  id: Id;
  vehicleId: Id;
  driverId: Id;
  startedAt: string; // ISO
  endedAt: string; // ISO
  odometerStart: number;
  odometerEnd: number;
  distance: number; // derived (km)
  notes?: string | null;
};

export type Receipt = {
  id: Id;
  fillUpId: Id;
  contentType: string;
  sha256?: string | null;
  createdAt?: string;

  // Storage differs by platform:
  // - server mode: storageKey points to server object
  // - mobile local mode: storageKey points to local file path/uri
  storageKey: string;
};

export type Profile = {
  firstName?: string | null;
  lastName?: string | null;
  company?: string | null;
  age?: number | null;
  gender?: Gender | null;
  phone?: string | null;
  themePreference: ThemePreference;
};

export function clampInt(n: unknown, opts: { min: number; max: number }) {
  const v = Math.round(Number(n));
  if (!Number.isFinite(v)) return null;
  if (v < opts.min || v > opts.max) return null;
  return v;
}

export function normalizeTrimmedString(n: unknown, maxLen: number) {
  if (n === null || n === undefined) return null;
  const s = String(n).trim();
  if (!s) return null;
  if (s.length > maxLen) return null;
  return s;
}

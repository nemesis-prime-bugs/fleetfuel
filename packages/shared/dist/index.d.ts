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
    occurredAt: string;
    odometer: number;
    fuelAmount: number;
    totalCost: number;
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
    startedAt: string;
    endedAt: string;
    odometerStart: number;
    odometerEnd: number;
    distance: number;
    notes?: string | null;
};
export type Receipt = {
    id: Id;
    fillUpId: Id;
    contentType: string;
    sha256?: string | null;
    createdAt?: string;
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
export declare function clampInt(n: unknown, opts: {
    min: number;
    max: number;
}): number | null;
export declare function normalizeTrimmedString(n: unknown, maxLen: number): string | null;

import type { Driver, FillUp, Id, Profile, Receipt, Trip, Vehicle } from "./index";

export type StorageMode = "local" | "server";

export type ListResult<T> = { items: T[] };

export type VehicleRepo = {
  list(): Promise<ListResult<Vehicle>>;
  create(input: { name: string; fuelType: Vehicle["fuelType"]; unitSystem: Vehicle["unitSystem"] }): Promise<Vehicle>;
  patch(id: Id, patch: Partial<Pick<Vehicle, "name" | "fuelType" | "unitSystem">>): Promise<void>;
  remove(id: Id): Promise<void>;
};

export type FillUpRepo = {
  listByVehicle(vehicleId: Id): Promise<ListResult<FillUp & { receipts?: Receipt[] }>>;
  create(input: Omit<FillUp, "id">): Promise<FillUp>;
  patch(id: Id, patch: Partial<FillUp>): Promise<void>;
  remove(id: Id): Promise<void>;
};

export type DriverRepo = {
  list(): Promise<ListResult<Driver>>;
  create(input: { name: string }): Promise<Driver>;
  rename(id: Id, name: string): Promise<void>;
  remove(id: Id): Promise<void>;
};

export type TripRepo = {
  listByVehicle(vehicleId: Id): Promise<ListResult<(Trip & { driver?: Pick<Driver, "id" | "name"> })>>;
  create(input: Omit<Trip, "id">): Promise<Trip>;
  patch(id: Id, patch: Partial<Trip>): Promise<void>;
  remove(id: Id): Promise<void>;
};

export type ReceiptUploadFile = {
  name: string;
  type: string;
  bytes: Uint8Array;
};

export type ReceiptRepo = {
  // Cross-platform file upload abstraction.
  uploadToFillUp(input: { fillUpId: Id; file: ReceiptUploadFile }): Promise<Receipt>;
};

export type ProfileRepo = {
  get(): Promise<{ email: string; profile: Profile }>;
  patch(patch: Partial<Profile>): Promise<{ email: string; profile: Profile }>;
};

export type FleetFuelRepos = {
  mode: StorageMode;
  vehicles: VehicleRepo;
  fillups: FillUpRepo;
  drivers: DriverRepo;
  trips: TripRepo;
  receipts: ReceiptRepo;
  profile: ProfileRepo;
};

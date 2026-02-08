import type {
  Driver,
  DriverRepo,
  FillUp,
  FillUpRepo,
  FleetFuelRepos,
  ListResult,
  Profile,
  ProfileRepo,
  Receipt,
  ReceiptRepo,
  ReceiptUploadFile,
  Trip,
  TripRepo,
  Vehicle,
  VehicleRepo,
} from "@fleetfuel/shared";

async function jsonOrThrow<T>(res: Response): Promise<T> {
  const data = (await res.json()) as any;
  if (!res.ok) throw new Error(data?.error ?? "Request failed");
  return data as T;
}

const vehicles: VehicleRepo = {
  async list() {
    const res = await fetch("/api/vehicles");
    const data = await jsonOrThrow<{ vehicles: Vehicle[] }>(res);
    return { items: data.vehicles };
  },
  async create(input) {
    const res = await fetch("/api/vehicles", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    const data = await jsonOrThrow<{ vehicle: Vehicle }>(res);
    return data.vehicle;
  },
  async patch(id, patch) {
    const res = await fetch(`/api/vehicles/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
    await jsonOrThrow(res);
  },
  async remove(id) {
    const res = await fetch(`/api/vehicles/${id}`, { method: "DELETE" });
    await jsonOrThrow(res);
  },
};

const fillups: FillUpRepo = {
  async listByVehicle(vehicleId) {
    const res = await fetch(`/api/fillups?vehicleId=${encodeURIComponent(vehicleId)}`);
    const data = await jsonOrThrow<{ fillUps: (FillUp & { receipts?: Receipt[] })[] }>(res);
    return { items: data.fillUps };
  },
  async create(input) {
    const res = await fetch("/api/fillups", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    const data = await jsonOrThrow<{ fillUp: FillUp }>(res);
    return data.fillUp;
  },
  async patch(id, patch) {
    const res = await fetch(`/api/fillups/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
    await jsonOrThrow(res);
  },
  async remove(id) {
    const res = await fetch(`/api/fillups/${id}`, { method: "DELETE" });
    await jsonOrThrow(res);
  },
};

const drivers: DriverRepo = {
  async list() {
    const res = await fetch("/api/drivers");
    const data = await jsonOrThrow<{ drivers: Driver[] }>(res);
    return { items: data.drivers };
  },
  async create(input) {
    const res = await fetch("/api/drivers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    const data = await jsonOrThrow<{ driver: Driver }>(res);
    return data.driver;
  },
  async rename(id, name) {
    const res = await fetch(`/api/drivers/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    await jsonOrThrow(res);
  },
  async remove(id) {
    const res = await fetch(`/api/drivers/${id}`, { method: "DELETE" });
    await jsonOrThrow(res);
  },
};

const trips: TripRepo = {
  async listByVehicle(vehicleId) {
    const res = await fetch(`/api/trips?vehicleId=${encodeURIComponent(vehicleId)}`);
    const data = await jsonOrThrow<{ trips: (Trip & { driver?: { id: string; name: string } })[] }>(res);
    return { items: data.trips };
  },
  async create(input) {
    const res = await fetch("/api/trips", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    const data = await jsonOrThrow<{ trip: Trip }>(res);
    return data.trip;
  },
  async patch(id, patch) {
    const res = await fetch(`/api/trips/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
    await jsonOrThrow(res);
  },
  async remove(id) {
    const res = await fetch(`/api/trips/${id}`, { method: "DELETE" });
    await jsonOrThrow(res);
  },
};

const receipts: ReceiptRepo = {
  async uploadToFillUp({ fillUpId, file }) {
    const fd = new FormData();
    fd.set("fillUpId", fillUpId);
    const buf = file.bytes.buffer.slice(file.bytes.byteOffset, file.bytes.byteOffset + file.bytes.byteLength);
    const copy = new Uint8Array(buf as ArrayBuffer);
    fd.set("file", new Blob([copy], { type: file.type }), file.name);
    const res = await fetch("/api/receipts/upload", { method: "POST", body: fd });
    const data = await jsonOrThrow<{ receipt: Receipt }>(res);
    return data.receipt;
  },
};

const profile: ProfileRepo = {
  async get() {
    const res = await fetch("/api/profile");
    const data = await jsonOrThrow<{ email: string; profile: Profile }>(res);
    return data;
  },
  async patch(patch) {
    const res = await fetch("/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
    const data = await jsonOrThrow<{ email: string; profile: Profile }>(res);
    return data;
  },
};

export function createWebRepos(): FleetFuelRepos {
  return {
    mode: "server",
    vehicles,
    fillups,
    drivers,
    trips,
    receipts,
    profile,
  };
}

export async function fileToReceiptUploadFile(file: File): Promise<ReceiptUploadFile> {
  return {
    name: file.name,
    type: file.type || "application/octet-stream",
    bytes: new Uint8Array(await file.arrayBuffer()),
  };
}

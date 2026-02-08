import type {
  Driver,
  DriverRepo,
  FillUp,
  FillUpRepo,
  FleetFuelRepos,
  Profile,
  ProfileRepo,
  Receipt,
  ReceiptRepo,
  StorageMode,
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

function createServerFetch(baseUrl: string) {
  const trimmed = baseUrl.replace(/\/+$/, "");
  return async function serverFetch(path: string, init?: RequestInit) {
    const url = `${trimmed}${path.startsWith("/") ? path : `/${path}`}`;
    return fetch(url, {
      ...init,
      // In Capacitor WebView, cookies typically work when talking to same-origin.
      // For cross-origin during dev, this may require additional CORS + cookie settings.
      credentials: "include",
    });
  };
}

export function createMobileRepos(opts: { mode: StorageMode; baseUrl?: string }): FleetFuelRepos {
  if (opts.mode === "local") {
    const notImplemented = (name: string) => async () => {
      throw new Error(`${name} not implemented for local mode yet (see MOB-4/MOB-5)`);
    };

    const vehicles: VehicleRepo = {
      list: notImplemented("vehicles.list"),
      create: notImplemented("vehicles.create"),
      patch: notImplemented("vehicles.patch"),
      remove: notImplemented("vehicles.remove"),
    };

    const fillups: FillUpRepo = {
      listByVehicle: notImplemented("fillups.listByVehicle"),
      create: notImplemented("fillups.create"),
      patch: notImplemented("fillups.patch"),
      remove: notImplemented("fillups.remove"),
    };

    const drivers: DriverRepo = {
      list: notImplemented("drivers.list"),
      create: notImplemented("drivers.create"),
      rename: notImplemented("drivers.rename"),
      remove: notImplemented("drivers.remove"),
    };

    const trips: TripRepo = {
      listByVehicle: notImplemented("trips.listByVehicle"),
      create: notImplemented("trips.create"),
      patch: notImplemented("trips.patch"),
      remove: notImplemented("trips.remove"),
    };

    const receipts: ReceiptRepo = {
      uploadToFillUp: notImplemented("receipts.uploadToFillUp"),
    };

    const profile: ProfileRepo = {
      get: notImplemented("profile.get"),
      patch: notImplemented("profile.patch"),
    };

    return { mode: "local", vehicles, fillups, drivers, trips, receipts, profile };
  }

  if (!opts.baseUrl) throw new Error("baseUrl is required for server mode");

  const serverFetch = createServerFetch(opts.baseUrl);

  const vehicles: VehicleRepo = {
    async list() {
      const res = await serverFetch("/api/vehicles");
      const data = await jsonOrThrow<{ vehicles: Vehicle[] }>(res);
      return { items: data.vehicles };
    },
    async create(input) {
      const res = await serverFetch("/api/vehicles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      const data = await jsonOrThrow<{ vehicle: Vehicle }>(res);
      return data.vehicle;
    },
    async patch(id, patch) {
      const res = await serverFetch(`/api/vehicles/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });
      await jsonOrThrow(res);
    },
    async remove(id) {
      const res = await serverFetch(`/api/vehicles/${id}`, { method: "DELETE" });
      await jsonOrThrow(res);
    },
  };

  const fillups: FillUpRepo = {
    async listByVehicle(vehicleId) {
      const res = await serverFetch(`/api/fillups?vehicleId=${encodeURIComponent(vehicleId)}`);
      const data = await jsonOrThrow<{ fillUps: FillUp[] }>(res);
      return { items: data.fillUps };
    },
    async create(input) {
      const res = await serverFetch("/api/fillups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      const data = await jsonOrThrow<{ fillUp: FillUp }>(res);
      return data.fillUp;
    },
    async patch(id, patch) {
      const res = await serverFetch(`/api/fillups/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });
      await jsonOrThrow(res);
    },
    async remove(id) {
      const res = await serverFetch(`/api/fillups/${id}`, { method: "DELETE" });
      await jsonOrThrow(res);
    },
  };

  const drivers: DriverRepo = {
    async list() {
      const res = await serverFetch("/api/drivers");
      const data = await jsonOrThrow<{ drivers: Driver[] }>(res);
      return { items: data.drivers };
    },
    async create(input) {
      const res = await serverFetch("/api/drivers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      const data = await jsonOrThrow<{ driver: Driver }>(res);
      return data.driver;
    },
    async rename(id, name) {
      const res = await serverFetch(`/api/drivers/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      await jsonOrThrow(res);
    },
    async remove(id) {
      const res = await serverFetch(`/api/drivers/${id}`, { method: "DELETE" });
      await jsonOrThrow(res);
    },
  };

  const trips: TripRepo = {
    async listByVehicle(vehicleId) {
      const res = await serverFetch(`/api/trips?vehicleId=${encodeURIComponent(vehicleId)}`);
      const data = await jsonOrThrow<{ trips: Trip[] }>(res);
      return { items: data.trips };
    },
    async create(input) {
      const res = await serverFetch("/api/trips", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      const data = await jsonOrThrow<{ trip: Trip }>(res);
      return data.trip;
    },
    async patch(id, patch) {
      const res = await serverFetch(`/api/trips/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });
      await jsonOrThrow(res);
    },
    async remove(id) {
      const res = await serverFetch(`/api/trips/${id}`, { method: "DELETE" });
      await jsonOrThrow(res);
    },
  };

  // Receipts upload for mobile server-mode will be implemented in MOB-6 together with auth + file handling.
  // For now, keep it explicit.
  const receipts: ReceiptRepo = {
    async uploadToFillUp(): Promise<Receipt> {
      throw new Error("receipts.uploadToFillUp not implemented for mobile server mode yet (MOB-6)");
    },
  };

  const profile: ProfileRepo = {
    async get() {
      const res = await serverFetch("/api/profile");
      const data = await jsonOrThrow<{ email: string; profile: Profile }>(res);
      return data;
    },
    async patch(patch) {
      const res = await serverFetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });
      const data = await jsonOrThrow<{ email: string; profile: Profile }>(res);
      return data;
    },
  };

  return { mode: "server", vehicles, fillups, drivers, trips, receipts, profile };
}

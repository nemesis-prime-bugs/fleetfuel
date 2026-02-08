"use client";

import { useEffect, useMemo, useState } from "react";

type Vehicle = {
  id: string;
  name: string;
};

type Driver = {
  id: string;
  name: string;
};

type Trip = {
  id: string;
  vehicleId: string;
  driverId: string;
  startedAt: string;
  endedAt: string;
  odometerStart: number;
  odometerEnd: number;
  distance: number;
  notes: string | null;
  driver?: { id: string; name: string };
};

function toLocalInputValue(iso: string) {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function fromLocalInputValue(localValue: string) {
  // datetime-local has no tz; interpret as local time
  return new Date(localValue).toISOString();
}

export default function TripsPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [vehicleId, setVehicleId] = useState<string>("");

  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [driverId, setDriverId] = useState<string>("");

  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [startedAt, setStartedAt] = useState(() => {
    const now = new Date();
    return toLocalInputValue(now.toISOString());
  });
  const [endedAt, setEndedAt] = useState(() => {
    const later = new Date(Date.now() + 60 * 60 * 1000);
    return toLocalInputValue(later.toISOString());
  });
  const [odometerStart, setOdometerStart] = useState("");
  const [odometerEnd, setOdometerEnd] = useState("");
  const [notes, setNotes] = useState("");

  const distancePreview = useMemo(() => {
    const s = Number(odometerStart);
    const e = Number(odometerEnd);
    if (!Number.isFinite(s) || !Number.isFinite(e)) return null;
    if (s <= 0 || e <= 0) return null;
    if (e <= s) return null;
    return Math.round(e - s);
  }, [odometerStart, odometerEnd]);

  const canSubmit = useMemo(() => {
    return !!vehicleId && !!driverId && !!startedAt && !!endedAt && !!odometerStart && !!odometerEnd;
  }, [vehicleId, driverId, startedAt, endedAt, odometerStart, odometerEnd]);

  async function loadVehicles() {
    const res = await fetch("/api/vehicles");
    if (res.status === 401) {
      window.location.href = "/login";
      return;
    }
    const data = (await res.json()) as { vehicles?: Vehicle[] };
    const vs = data.vehicles ?? [];
    setVehicles(vs);
    if (!vehicleId && vs[0]) setVehicleId(vs[0].id);
  }

  async function loadDrivers() {
    const res = await fetch("/api/drivers");
    if (res.status === 401) {
      window.location.href = "/login";
      return;
    }
    const data = (await res.json()) as { drivers?: Driver[] };
    const ds = data.drivers ?? [];
    setDrivers(ds);
    if (!driverId && ds[0]) setDriverId(ds[0].id);
  }

  async function refreshTrips(vId: string) {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/trips?vehicleId=${encodeURIComponent(vId)}`);
      if (res.status === 401) {
        window.location.href = "/login";
        return;
      }
      const data = (await res.json()) as { trips?: Trip[]; error?: string };
      if (!res.ok) throw new Error(data.error ?? "Failed to load trips");
      setTrips(data.trips ?? []);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadVehicles().catch(() => {
      /* ignore */
    });
    loadDrivers().catch(() => {
      /* ignore */
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (vehicleId) refreshTrips(vehicleId);
  }, [vehicleId]);

  const grouped = useMemo(() => {
    const pad = (n: number) => String(n).padStart(2, "0");
    const dateKey = (iso: string) => {
      const d = new Date(iso);
      return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
    };

    type DayGroup = {
      day: string; // YYYY-MM-DD local
      totalKm: number;
      byDriver: Array<{ driverId: string; driverName: string; totalKm: number; trips: Trip[] }>;
    };

    const days = new Map<string, Map<string, { driverId: string; driverName: string; trips: Trip[]; totalKm: number }>>();

    for (const t of trips) {
      const day = dateKey(t.startedAt);
      if (!days.has(day)) days.set(day, new Map());
      const driverName = t.driver?.name ?? "(driver)";
      const driverKey = t.driverId;
      const dm = days.get(day)!;
      if (!dm.has(driverKey)) dm.set(driverKey, { driverId: driverKey, driverName, trips: [], totalKm: 0 });
      const entry = dm.get(driverKey)!;
      entry.trips.push(t);
      entry.totalKm += t.distance;
    }

    const out: DayGroup[] = [];
    for (const [day, dm] of days.entries()) {
      const byDriver = Array.from(dm.values()).sort((a, b) => a.driverName.localeCompare(b.driverName));
      const totalKm = byDriver.reduce((sum, d) => sum + d.totalKm, 0);
      out.push({ day, totalKm, byDriver });
    }

    out.sort((a, b) => (a.day < b.day ? 1 : -1));
    return out;
  }, [trips]);

  return (
    <main style={{ maxWidth: 1000, margin: "40px auto", padding: 24, fontFamily: "system-ui" }}>
      <h1 style={{ fontSize: 28, fontWeight: 800 }}>Trips (Tagebuch)</h1>

      <section style={{ marginTop: 16, display: "flex", gap: 12, alignItems: "center" }}>
        <a href="/drivers" style={{ opacity: 0.9 }}>
          Manage drivers
        </a>
        <a href="/vehicles" style={{ opacity: 0.9 }}>
          Vehicles
        </a>
        <a href="/fillups" style={{ opacity: 0.9 }}>
          Fill-ups
        </a>
      </section>

      <section style={{ marginTop: 16, display: "flex", gap: 12, alignItems: "center" }}>
        <label>
          Vehicle:&nbsp;
          <select
            value={vehicleId}
            onChange={(e) => setVehicleId(e.target.value)}
            style={{ padding: 8, borderRadius: 8, border: "1px solid #ccc" }}
          >
            {vehicles.map((v) => (
              <option key={v.id} value={v.id}>
                {v.name}
              </option>
            ))}
          </select>
        </label>

        <label>
          Driver:&nbsp;
          <select
            value={driverId}
            onChange={(e) => setDriverId(e.target.value)}
            style={{ padding: 8, borderRadius: 8, border: "1px solid #ccc" }}
          >
            {drivers.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
        </label>

        {drivers.length === 0 ? <span style={{ opacity: 0.8 }}>No drivers yet — add one first.</span> : null}
      </section>

      <section style={{ marginTop: 20, padding: 16, border: "1px solid #eee", borderRadius: 12 }}>
        <h2 style={{ fontSize: 18, fontWeight: 700 }}>Add trip entry</h2>

        <form
          style={{ display: "grid", gap: 12, gridTemplateColumns: "1fr 1fr 1fr 1fr", marginTop: 12 }}
          onSubmit={async (e) => {
            e.preventDefault();
            if (!canSubmit) return;
            setError(null);
            try {
              const res = await fetch("/api/trips", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  vehicleId,
                  driverId,
                  startedAt: fromLocalInputValue(startedAt),
                  endedAt: fromLocalInputValue(endedAt),
                  odometerStart: Number(odometerStart),
                  odometerEnd: Number(odometerEnd),
                  notes,
                }),
              });
              const data = (await res.json()) as { error?: string };
              if (!res.ok) throw new Error(data.error ?? "Create failed");
              setOdometerStart("");
              setOdometerEnd("");
              setNotes("");
              await refreshTrips(vehicleId);
            } catch (e2) {
              setError((e2 as Error).message);
            }
          }}
        >
          <label style={{ display: "grid", gap: 6 }}>
            <span>Start</span>
            <input
              type="datetime-local"
              value={startedAt}
              onChange={(e) => setStartedAt(e.target.value)}
              required
              style={{ padding: 10, borderRadius: 8, border: "1px solid #ccc" }}
            />
          </label>
          <label style={{ display: "grid", gap: 6 }}>
            <span>End</span>
            <input
              type="datetime-local"
              value={endedAt}
              onChange={(e) => setEndedAt(e.target.value)}
              required
              style={{ padding: 10, borderRadius: 8, border: "1px solid #ccc" }}
            />
          </label>
          <label style={{ display: "grid", gap: 6 }}>
            <span>Odometer start</span>
            <input
              value={odometerStart}
              onChange={(e) => setOdometerStart(e.target.value)}
              inputMode="numeric"
              placeholder="e.g. 120000"
              required
              style={{ padding: 10, borderRadius: 8, border: "1px solid #ccc" }}
            />
          </label>
          <label style={{ display: "grid", gap: 6 }}>
            <span>Odometer end</span>
            <input
              value={odometerEnd}
              onChange={(e) => setOdometerEnd(e.target.value)}
              inputMode="numeric"
              placeholder="e.g. 120400"
              required
              style={{ padding: 10, borderRadius: 8, border: "1px solid #ccc" }}
            />
          </label>

          <label style={{ display: "grid", gap: 6, gridColumn: "1 / span 4" }}>
            <span>Notes (optional)</span>
            <input
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. customer visit"
              style={{ padding: 10, borderRadius: 8, border: "1px solid #ccc" }}
            />
          </label>

          <div style={{ gridColumn: "1 / span 4", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ opacity: 0.8, fontSize: 13 }}>
              Distance: {distancePreview === null ? "—" : `${distancePreview} km`}
            </div>
            <button
              type="submit"
              disabled={!canSubmit || drivers.length === 0}
              style={{
                padding: 12,
                borderRadius: 8,
                border: 0,
                background: "#111",
                color: "white",
                opacity: canSubmit && drivers.length ? 1 : 0.6,
              }}
            >
              Add
            </button>
          </div>
        </form>

        {error ? <p style={{ marginTop: 12, color: "#b00020" }}>{error}</p> : null}
      </section>

      <section style={{ marginTop: 20 }}>
        <h2 style={{ fontSize: 18, fontWeight: 700 }}>History (grouped by day)</h2>
        {loading ? <p>Loading…</p> : null}
        {!loading && trips.length === 0 ? <p style={{ opacity: 0.8 }}>No trips yet.</p> : null}

        <div style={{ marginTop: 12, display: "grid", gap: 12 }}>
          {grouped.map((g) => (
            <div key={g.day} style={{ padding: 12, border: "1px solid #eee", borderRadius: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "baseline" }}>
                <div style={{ fontWeight: 800 }}>{new Date(`${g.day}T00:00:00`).toLocaleDateString()}</div>
                <div style={{ opacity: 0.8, fontSize: 13 }}>Total: {g.totalKm} km</div>
              </div>

              <div style={{ marginTop: 10, display: "grid", gap: 10 }}>
                {g.byDriver.map((d) => (
                  <div key={d.driverId} style={{ padding: 10, border: "1px solid #f0f0f0", borderRadius: 10 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                      <div style={{ fontWeight: 700 }}>{d.driverName}</div>
                      <div style={{ opacity: 0.8, fontSize: 13 }}>{d.totalKm} km</div>
                    </div>

                    <div style={{ marginTop: 8, display: "grid", gap: 8 }}>
                      {d.trips.map((t) => (
                        <div key={t.id} style={{ padding: 10, border: "1px solid #eee", borderRadius: 10 }}>
                          <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                            <div>
                              <div style={{ fontWeight: 700 }}>{t.distance} km</div>
                              <div style={{ opacity: 0.8, fontSize: 13 }}>
                                {new Date(t.startedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} → {new Date(t.endedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                                {" "}· Odo {t.odometerStart} → {t.odometerEnd}
                              </div>
                              {t.notes ? <div style={{ marginTop: 6, fontSize: 13 }}>{t.notes}</div> : null}
                            </div>

                            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                              <button
                                type="button"
                                style={{ padding: "6px 10px", borderRadius: 8, border: "1px solid #ddd", background: "white" }}
                                onClick={async () => {
                                  const newStart = window.prompt("New start (YYYY-MM-DDTHH:MM)", toLocalInputValue(t.startedAt));
                                  if (!newStart) return;
                                  const newEnd = window.prompt("New end (YYYY-MM-DDTHH:MM)", toLocalInputValue(t.endedAt));
                                  if (!newEnd) return;
                                  const newOdoStart = window.prompt("New odometer start", String(t.odometerStart));
                                  if (!newOdoStart) return;
                                  const newOdoEnd = window.prompt("New odometer end", String(t.odometerEnd));
                                  if (!newOdoEnd) return;
                                  setError(null);
                                  try {
                                    const res = await fetch(`/api/trips/${t.id}`, {
                                      method: "PATCH",
                                      headers: { "Content-Type": "application/json" },
                                      body: JSON.stringify({
                                        startedAt: fromLocalInputValue(newStart),
                                        endedAt: fromLocalInputValue(newEnd),
                                        odometerStart: Number(newOdoStart),
                                        odometerEnd: Number(newOdoEnd),
                                      }),
                                    });
                                    const data = (await res.json()) as { error?: string };
                                    if (!res.ok) throw new Error(data.error ?? "Update failed");
                                    await refreshTrips(vehicleId);
                                  } catch (e) {
                                    setError((e as Error).message);
                                  }
                                }}
                              >
                                Edit
                              </button>
                              <button
                                type="button"
                                style={{
                                  padding: "6px 10px",
                                  borderRadius: 8,
                                  border: "1px solid #ffb3b3",
                                  background: "#ffe9e9",
                                }}
                                onClick={async () => {
                                  if (!window.confirm("Delete this trip?")) return;
                                  setError(null);
                                  try {
                                    const res = await fetch(`/api/trips/${t.id}`, { method: "DELETE" });
                                    const data = (await res.json()) as { error?: string };
                                    if (!res.ok) throw new Error(data.error ?? "Delete failed");
                                    await refreshTrips(vehicleId);
                                  } catch (e) {
                                    setError((e as Error).message);
                                  }
                                }}
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}

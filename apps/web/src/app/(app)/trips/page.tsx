"use client";

import { useEffect, useMemo, useState } from "react";

import { ErrorSummary, type FieldErrorItem } from "@/components/error-summary";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { ChevronsUpDown } from "lucide-react";

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

  const [startedAt, setStartedAt] = useState(() => toLocalInputValue(new Date().toISOString()));
  const [endedAt, setEndedAt] = useState(() => toLocalInputValue(new Date(Date.now() + 60 * 60 * 1000).toISOString()));
  const [odometerStart, setOdometerStart] = useState("");
  const [odometerEnd, setOdometerEnd] = useState("");
  const [notes, setNotes] = useState("");
  const [showAdvanced, setShowAdvanced] = useState(false);

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
      toast.error((e as Error).message);
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
      day: string;
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
    <div className="mx-auto w-full max-w-6xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Trips (Tagebuch)</h1>
        <p className="text-muted-foreground">Daily logbook entries grouped by day and driver.</p>
      </div>

      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <div className="grid gap-2">
            <Label>Vehicle</Label>
            <Select value={vehicleId} onValueChange={setVehicleId}>
              <SelectTrigger className="w-[260px]">
                <SelectValue placeholder="Select vehicle" />
              </SelectTrigger>
              <SelectContent>
                {vehicles.map((v) => (
                  <SelectItem key={v.id} value={v.id}>
                    {v.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label>Driver</Label>
            <Select value={driverId} onValueChange={setDriverId}>
              <SelectTrigger className="w-[260px]">
                <SelectValue placeholder="Select driver" />
              </SelectTrigger>
              <SelectContent>
                {drivers.map((d) => (
                  <SelectItem key={d.id} value={d.id}>
                    {d.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <Button asChild variant="secondary">
          <a href="/drivers">Manage drivers</a>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Add trip entry</CardTitle>
          <CardDescription>Time-based + odometer start/end. Distance is derived.</CardDescription>
        </CardHeader>
        <CardContent>
          <form
            className="grid gap-4 md:grid-cols-4"
            onSubmit={async (e) => {
              e.preventDefault();
              if (!canSubmit) return;
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
                setShowAdvanced(false);
                toast.success("Trip added");
                await refreshTrips(vehicleId);
              } catch (e2) {
                toast.error((e2 as Error).message);
              }
            }}
          >
            <div className="grid gap-2">
              <Label>Start</Label>
              <Input type="datetime-local" value={startedAt} onChange={(e) => setStartedAt(e.target.value)} required />
            </div>
            <div className="grid gap-2">
              <Label>End</Label>
              <Input type="datetime-local" value={endedAt} onChange={(e) => setEndedAt(e.target.value)} required />
            </div>
            <div className="grid gap-2">
              <Label>Odometer start</Label>
              <Input value={odometerStart} onChange={(e) => setOdometerStart(e.target.value)} inputMode="numeric" required />
            </div>
            <div className="grid gap-2">
              <Label>Odometer end</Label>
              <Input value={odometerEnd} onChange={(e) => setOdometerEnd(e.target.value)} inputMode="numeric" required />
            </div>

            <div className="grid gap-2 md:col-span-4">
              <Label>Odometer end</Label>
              <Input value={odometerEnd} onChange={(e) => setOdometerEnd(e.target.value)} inputMode="numeric" required />
            </div>

            <div className="md:col-span-4">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="flex items-center gap-2 px-0"
              >
                <ChevronsUpDown className="h-4 w-4" />
                {showAdvanced ? "Hide" : "Show"} advanced options
                <span className="text-muted-foreground text-xs">
                  (notes)
                </span>
              </Button>
            </div>

            {showAdvanced ? (
              <div className="grid gap-2 md:col-span-4">
                <Label htmlFor="trip-notes">Notes</Label>
                <Input
                  id="trip-notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. customer visit"
                />
              </div>
            ) : null}

            <div className="md:col-span-4 flex items-center justify-between">
              <div className="text-sm text-muted-foreground">Distance: {distancePreview === null ? "—" : `${distancePreview} km`}</div>
              <Button type="submit" disabled={!canSubmit || drivers.length === 0}>
                Add
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>History (grouped by day)</CardTitle>
          <CardDescription>Totals per day and per driver.</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? <p className="text-sm text-muted-foreground">Loading…</p> : null}
          {!loading && trips.length === 0 ? <p className="text-sm text-muted-foreground">No trips yet.</p> : null}

          <div className="space-y-4">
            {grouped.map((g) => (
              <Card key={g.day}>
                <CardHeader className="pb-3">
                  <div className="flex items-baseline justify-between">
                    <CardTitle className="text-base">{new Date(`${g.day}T00:00:00`).toLocaleDateString()}</CardTitle>
                    <div className="text-sm text-muted-foreground">Total: {g.totalKm} km</div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {g.byDriver.map((d) => (
                    <Card key={d.driverId}>
                      <CardHeader className="pb-3">
                        <div className="flex items-baseline justify-between">
                          <CardTitle className="text-sm">{d.driverName}</CardTitle>
                          <div className="text-sm text-muted-foreground">{d.totalKm} km</div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        {d.trips.map((t) => (
                          <div key={t.id} className="flex flex-col gap-2 rounded-md border p-3 md:flex-row md:items-center md:justify-between">
                            <div>
                              <div className="font-medium">{t.distance} km</div>
                              <div className="text-sm text-muted-foreground">
                                {new Date(t.startedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} → {new Date(t.endedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} · Odo {t.odometerStart} → {t.odometerEnd}
                              </div>
                              {t.notes ? <div className="mt-1 text-sm">{t.notes}</div> : null}
                            </div>

                            <div className="flex gap-2">
                              <Button
                                variant="secondary"
                                size="sm"
                                onClick={async () => {
                                  const newStart = window.prompt("New start (YYYY-MM-DDTHH:MM)", toLocalInputValue(t.startedAt));
                                  if (!newStart) return;
                                  const newEnd = window.prompt("New end (YYYY-MM-DDTHH:MM)", toLocalInputValue(t.endedAt));
                                  if (!newEnd) return;
                                  const newOdoStart = window.prompt("New odometer start", String(t.odometerStart));
                                  if (!newOdoStart) return;
                                  const newOdoEnd = window.prompt("New odometer end", String(t.odometerEnd));
                                  if (!newOdoEnd) return;
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
                                    toast.success("Trip updated");
                                    await refreshTrips(vehicleId);
                                  } catch (e) {
                                    toast.error((e as Error).message);
                                  }
                                }}
                              >
                                Edit
                              </Button>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={async () => {
                                  if (!window.confirm("Delete this trip?")) return;
                                  try {
                                    const res = await fetch(`/api/trips/${t.id}`, { method: "DELETE" });
                                    const data = (await res.json()) as { error?: string };
                                    if (!res.ok) throw new Error(data.error ?? "Delete failed");
                                    toast.success("Trip deleted");
                                    await refreshTrips(vehicleId);
                                  } catch (e) {
                                    toast.error((e as Error).message);
                                  }
                                }}
                              >
                                Delete
                              </Button>
                            </div>
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  ))}
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

"use client";

import { format } from "date-fns";
import { useEffect, useMemo, useState } from "react";

import { ErrorSummary, type FieldErrorItem } from "@/components/error-summary";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";

import { receiptsEnabled } from "@/lib/flags";

type Vehicle = {
  id: string;
  name: string;
};

type Receipt = {
  id: string;
  storageKey: string;
  contentType: string;
  createdAt: string;
};

type FillUp = {
  id: string;
  vehicleId: string;
  occurredAt: string;
  odometer: number;
  fuelAmount: number;
  totalCost: number;
  currency: string;
  isFullTank: boolean;
  stationName: string | null;
  notes: string | null;
  receipts?: Receipt[];
};

export default function FillUpsPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [vehicleId, setVehicleId] = useState<string>("");

  const [fillUps, setFillUps] = useState<FillUp[]>([]);
  const [loading, setLoading] = useState(true);

  const [occurredAt, setOccurredAt] = useState<Date>(() => new Date());
  const [odometer, setOdometer] = useState("");
  const [fuelAmount, setFuelAmount] = useState("");
  const [totalCost, setTotalCost] = useState("");
  const [currency, setCurrency] = useState("EUR");
  const [isFullTank, setIsFullTank] = useState(true);

  async function patchFillUp(id: string, patch: Partial<FillUp>) {
    const res = await fetch(`/api/fillups/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
    const data = (await res.json()) as { error?: string };
    if (!res.ok) throw new Error(data.error ?? "Update failed");
  }

  async function deleteFillUp(id: string) {
    const res = await fetch(`/api/fillups/${id}`, { method: "DELETE" });
    const data = (await res.json()) as { error?: string };
    if (!res.ok) throw new Error(data.error ?? "Delete failed");
  }

  const hasVehicles = vehicles.length > 0;

  const fieldErrors = useMemo<FieldErrorItem[]>(() => {
    const errs: FieldErrorItem[] = [];

    if (!hasVehicles) {
      errs.push({ fieldId: "fillup-vehicle", message: "Create a vehicle first" });
      return errs;
    }

    if (!vehicleId) errs.push({ fieldId: "fillup-vehicle", message: "Vehicle is required" });

    const odo = Number(odometer);
    if (!odometer) errs.push({ fieldId: "fillup-odometer", message: "Odometer is required" });
    else if (!Number.isFinite(odo) || odo <= 0) errs.push({ fieldId: "fillup-odometer", message: "Enter a valid odometer" });

    const fuel = Number(fuelAmount);
    if (!fuelAmount) errs.push({ fieldId: "fillup-fuel", message: "Fuel amount is required" });
    else if (!Number.isFinite(fuel) || fuel <= 0) errs.push({ fieldId: "fillup-fuel", message: "Enter a valid fuel amount" });

    const cost = Number(totalCost);
    if (!totalCost) errs.push({ fieldId: "fillup-cost", message: "Total cost is required" });
    else if (!Number.isFinite(cost) || cost < 0) errs.push({ fieldId: "fillup-cost", message: "Enter a valid total cost" });

    return errs;
  }, [hasVehicles, vehicleId, odometer, fuelAmount, totalCost]);

  const canSubmit = useMemo(() => {
    return fieldErrors.length === 0;
  }, [fieldErrors.length]);

  async function loadVehicles() {
    const res = await fetch("/api/vehicles");
    if (res.status === 401) {
      window.location.href = "/login";
      return;
    }
    const data = (await res.json()) as { vehicles?: { id: string; name: string }[] };
    const vs = data.vehicles ?? [];
    setVehicles(vs);
    if (!vehicleId && vs[0]) setVehicleId(vs[0].id);
  }

  async function refreshFillUps(vId: string) {
    setLoading(true);
    try {
      const res = await fetch(`/api/fillups?vehicleId=${encodeURIComponent(vId)}`);
      if (res.status === 401) {
        window.location.href = "/login";
        return;
      }
      const data = (await res.json()) as { fillUps?: FillUp[]; error?: string };
      if (!res.ok) throw new Error(data.error ?? "Failed to load fill-ups");
      setFillUps(data.fillUps ?? []);
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (vehicleId) refreshFillUps(vehicleId);
    else if (!loading) setFillUps([]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vehicleId]);

  const receiptsOn = receiptsEnabled();

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Fill-ups</h1>
        <p className="text-muted-foreground">Track fuel purchases and receipts.</p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center" id="fillup-vehicle">
          <Label className="text-sm">Vehicle</Label>
          <Select value={vehicleId} onValueChange={setVehicleId} disabled={!hasVehicles}>
            <SelectTrigger className="w-[260px]" aria-invalid={fieldErrors.some((e) => e.fieldId === "fillup-vehicle")}>
              <SelectValue placeholder={hasVehicles ? "Select vehicle" : "No vehicles yet"} />
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

        <Button asChild variant="secondary">
          <a href="/vehicles">Manage vehicles</a>
        </Button>
      </div>

      {!hasVehicles ? (
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">
              You need to create a vehicle before you can add fill-ups.
            </p>
            <div className="mt-3">
              <Button asChild>
                <a href="/vehicles">Create vehicle</a>
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>Add fill-up</CardTitle>
        </CardHeader>
        <CardContent>
          <ErrorSummary errors={fieldErrors} />

          <form
            className="grid gap-4 md:grid-cols-6"
            onSubmit={async (e) => {
              e.preventDefault();
              if (!canSubmit) return;
              try {
                const res = await fetch("/api/fillups", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    vehicleId,
                    occurredAt: new Date(occurredAt).toISOString(),
                    odometer: Number(odometer),
                    fuelAmount: Number(fuelAmount),
                    totalCost: Math.round(Number(totalCost) * 100),
                    currency,
                    isFullTank,
                  }),
                });
                const data = (await res.json()) as { error?: string };
                if (!res.ok) throw new Error(data.error ?? "Create failed");
                setOdometer("");
                setFuelAmount("");
                setTotalCost("");
                toast.success("Fill-up added");
                await refreshFillUps(vehicleId);
              } catch (e2) {
                toast.error((e2 as Error).message);
              }
            }}
          >
            <div className="grid gap-2 md:col-span-2">
              <Label>Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button type="button" variant="outline" className="justify-start">
                    {occurredAt ? format(occurredAt, "yyyy-MM-dd") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar mode="single" selected={occurredAt} onSelect={(d) => d && setOccurredAt(d)} initialFocus />
                </PopoverContent>
              </Popover>
            </div>

            <div className="grid gap-2 md:col-span-2" id="fillup-odometer">
              <Label>Odometer</Label>
              <Input
                value={odometer}
                onChange={(e) => setOdometer(e.target.value)}
                inputMode="numeric"
                placeholder="e.g. 120000"
                aria-invalid={fieldErrors.some((e) => e.fieldId === "fillup-odometer")}
              />
            </div>

            <div className="grid gap-2 md:col-span-1" id="fillup-fuel">
              <Label>Fuel</Label>
              <Input
                value={fuelAmount}
                onChange={(e) => setFuelAmount(e.target.value)}
                inputMode="decimal"
                placeholder="e.g. 45.2"
                aria-invalid={fieldErrors.some((e) => e.fieldId === "fillup-fuel")}
              />
            </div>

            <div className="grid gap-2 md:col-span-1" id="fillup-cost">
              <Label>Total cost ({currency})</Label>
              <Input
                value={totalCost}
                onChange={(e) => setTotalCost(e.target.value)}
                inputMode="decimal"
                placeholder="e.g. 70.40"
                aria-invalid={fieldErrors.some((e) => e.fieldId === "fillup-cost")}
              />
            </div>

            <div className="flex items-center gap-2 md:col-span-6">
              <Checkbox id="fullTank" checked={isFullTank} onCheckedChange={(v) => setIsFullTank(Boolean(v))} />
              <Label htmlFor="fullTank">Full tank</Label>
            </div>

            <div className="md:col-span-6 flex justify-end">
              <Button type="submit" disabled={!canSubmit}>
                Add
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>History</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? <p className="text-sm text-muted-foreground">Loading…</p> : null}
          {!loading && fillUps.length === 0 ? <p className="text-sm text-muted-foreground">No fill-ups yet.</p> : null}

          {fillUps.length ? (
            <div className="space-y-4">
              {fillUps.map((f) => (
                <Card key={f.id}>
                  <CardHeader className="pb-3">
                    <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                      <div>
                        <CardTitle className="text-base">{new Date(f.occurredAt).toLocaleDateString()}</CardTitle>
                        <CardDescription>
                          Odo {f.odometer} · Fuel {f.fuelAmount} · Cost {(f.totalCost / 100).toFixed(2)} {f.currency}
                          {f.isFullTank ? " · Full" : ""}
                        </CardDescription>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {receiptsOn ? (
                          <label className="inline-flex">
                            <Button asChild variant="secondary" size="sm">
                              <span>Attach receipt</span>
                            </Button>
                            <input
                              type="file"
                              accept="image/jpeg,image/png"
                              className="hidden"
                              onChange={async (e) => {
                                const file = e.target.files?.[0];
                                if (!file) return;
                                try {
                                  const fd = new FormData();
                                  fd.set("fillUpId", f.id);
                                  fd.set("file", file);
                                  const res = await fetch("/api/receipts/upload", { method: "POST", body: fd });
                                  const data = (await res.json()) as { error?: string };
                                  if (!res.ok) throw new Error(data.error ?? "Upload failed");
                                  toast.success("Receipt uploaded");
                                  await refreshFillUps(vehicleId);
                                } catch (e2) {
                                  toast.error((e2 as Error).message);
                                } finally {
                                  e.target.value = "";
                                }
                              }}
                            />
                          </label>
                        ) : (
                          <Button variant="secondary" size="sm" disabled>
                            Receipts disabled (cloud)
                          </Button>
                        )}

                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={async () => {
                            const newOdo = window.prompt("New odometer", String(f.odometer));
                            if (!newOdo) return;
                            const newFuel = window.prompt("New fuel amount", String(f.fuelAmount));
                            if (!newFuel) return;
                            const newCost = window.prompt(`New total cost (${f.currency})`, (f.totalCost / 100).toFixed(2));
                            if (!newCost) return;
                            try {
                              await patchFillUp(f.id, {
                                odometer: Number(newOdo),
                                fuelAmount: Number(newFuel),
                                totalCost: Math.round(Number(newCost) * 100),
                              } as any);
                              toast.success("Fill-up updated");
                              await refreshFillUps(vehicleId);
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
                            if (!window.confirm("Delete this fill-up?")) return;
                            try {
                              await deleteFillUp(f.id);
                              toast.success("Fill-up deleted");
                              await refreshFillUps(vehicleId);
                            } catch (e) {
                              toast.error((e as Error).message);
                            }
                          }}
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                  </CardHeader>

                  {f.receipts?.length ? (
                    <CardContent>
                      <div className="text-sm font-semibold mb-2">Receipts</div>
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>File</TableHead>
                              <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {f.receipts.map((r) => {
                              const name = r.storageKey.split("/").pop() ?? r.id;
                              return (
                                <TableRow key={r.id}>
                                  <TableCell className="font-medium">{name}</TableCell>
                                  <TableCell className="text-right">
                                    <div className="inline-flex gap-2">
                                      <Button asChild size="sm" variant="secondary">
                                        <a href={`/api/receipts/${r.id}?inline=1`} target="_blank" rel="noreferrer">
                                          View
                                        </a>
                                      </Button>
                                      <Button asChild size="sm" variant="secondary">
                                        <a href={`/api/receipts/${r.id}`} target="_blank" rel="noreferrer">
                                          Download
                                        </a>
                                      </Button>
                                    </div>
                                  </TableCell>
                                </TableRow>
                              );
                            })}
                          </TableBody>
                        </Table>
                      </div>
                    </CardContent>
                  ) : null}
                </Card>
              ))}
            </div>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}

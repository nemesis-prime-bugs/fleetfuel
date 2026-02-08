"use client";

import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";

type Vehicle = {
  id: string;
  name: string;
  fuelType: "GASOLINE" | "DIESEL" | "ELECTRIC" | "HYBRID" | "OTHER";
  unitSystem: "METRIC" | "IMPERIAL";
  createdAt: string;
};

type VehiclePatch = {
  name?: string;
  fuelType?: Vehicle["fuelType"];
  unitSystem?: Vehicle["unitSystem"];
};

export default function VehiclesPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);

  const [name, setName] = useState("");
  const [fuelType, setFuelType] = useState<Vehicle["fuelType"]>("GASOLINE");
  const [unitSystem, setUnitSystem] = useState<Vehicle["unitSystem"]>("METRIC");
  const [submitting, setSubmitting] = useState(false);

  async function refresh() {
    setLoading(true);
    try {
      const res = await fetch("/api/vehicles");
      if (res.status === 401) {
        window.location.href = "/login";
        return;
      }
      const data = (await res.json()) as { vehicles?: Vehicle[]; error?: string };
      if (!res.ok) throw new Error(data.error ?? "Failed to load vehicles");
      setVehicles(data.vehicles ?? []);
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh().catch(() => {
      /* ignore */
    });
  }, []);

  async function patchVehicle(id: string, patch: VehiclePatch) {
    const res = await fetch(`/api/vehicles/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
    const data = (await res.json()) as { error?: string };
    if (!res.ok) throw new Error(data.error ?? "Update failed");
  }

  async function deleteVehicle(id: string) {
    const res = await fetch(`/api/vehicles/${id}`, { method: "DELETE" });
    const data = (await res.json()) as { error?: string };
    if (!res.ok) throw new Error(data.error ?? "Delete failed");
  }

  return (
    <div className="mx-auto w-full max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Vehicles</h1>
        <p className="text-muted-foreground">Manage your vehicles.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Add vehicle</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            className="grid gap-4 md:grid-cols-4"
            onSubmit={async (e) => {
              e.preventDefault();
              setSubmitting(true);
              try {
                const res = await fetch("/api/vehicles", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ name, fuelType, unitSystem }),
                });
                const data = (await res.json()) as { error?: string };
                if (!res.ok) throw new Error(data.error ?? "Create failed");
                setName("");
                toast.success("Vehicle added");
                await refresh();
              } catch (e2) {
                toast.error((e2 as Error).message);
              } finally {
                setSubmitting(false);
              }
            }}
          >
            <div className="grid gap-2 md:col-span-2">
              <Label>Name</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Golf" required />
            </div>

            <div className="grid gap-2">
              <Label>Fuel type</Label>
              <Select value={fuelType} onValueChange={(v) => setFuelType(v as Vehicle["fuelType"])}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="GASOLINE">Gasoline</SelectItem>
                  <SelectItem value="DIESEL">Diesel</SelectItem>
                  <SelectItem value="ELECTRIC">Electric</SelectItem>
                  <SelectItem value="HYBRID">Hybrid</SelectItem>
                  <SelectItem value="OTHER">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label>Unit system</Label>
              <Select value={unitSystem} onValueChange={(v) => setUnitSystem(v as Vehicle["unitSystem"])}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="METRIC">Metric</SelectItem>
                  <SelectItem value="IMPERIAL">Imperial</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="md:col-span-4 flex justify-end">
              <Button type="submit" disabled={submitting}>
                {submitting ? "Adding…" : "Add"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Your vehicles</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? <p className="text-sm text-muted-foreground">Loading…</p> : null}
          {!loading && vehicles.length === 0 ? <p className="text-sm text-muted-foreground">No vehicles yet.</p> : null}

          {vehicles.length ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Fuel</TableHead>
                    <TableHead>Units</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {vehicles.map((v) => (
                    <TableRow key={v.id}>
                      <TableCell className="font-medium">{v.name}</TableCell>
                      <TableCell>{v.fuelType}</TableCell>
                      <TableCell>{v.unitSystem}</TableCell>
                      <TableCell className="text-right">
                        <div className="inline-flex gap-2">
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={async () => {
                              const newName = window.prompt("New vehicle name", v.name);
                              if (!newName) return;
                              try {
                                await patchVehicle(v.id, { name: newName });
                                toast.success("Vehicle updated");
                                await refresh();
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
                              if (!window.confirm(`Delete vehicle '${v.name}'?`)) return;
                              try {
                                await deleteVehicle(v.id);
                                toast.success("Vehicle deleted");
                                await refresh();
                              } catch (e) {
                                toast.error((e as Error).message);
                              }
                            }}
                          >
                            Delete
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}

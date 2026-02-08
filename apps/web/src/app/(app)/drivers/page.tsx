"use client";

import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

type Driver = {
  id: string;
  name: string;
};

export default function DriversPage() {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(true);

  async function refresh() {
    setLoading(true);
    try {
      const res = await fetch("/api/drivers");
      if (res.status === 401) {
        window.location.href = "/login";
        return;
      }
      const data = (await res.json()) as { drivers?: Driver[]; error?: string };
      if (!res.ok) throw new Error(data.error ?? "Failed to load drivers");
      setDrivers(data.drivers ?? []);
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

  return (
    <div className="mx-auto w-full max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Drivers</h1>
        <p className="text-muted-foreground">Managed list of drivers for trip logging (Tagebuch).</p>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button asChild variant="secondary">
          <a href="/trips">Go to trips</a>
        </Button>
        <Button asChild variant="secondary">
          <a href="/vehicles">Vehicles</a>
        </Button>
        <Button asChild variant="secondary">
          <a href="/fillups">Fill-ups</a>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Add driver</CardTitle>
          <CardDescription>Drivers are used in the Trips (Tagebuch) logbook.</CardDescription>
        </CardHeader>
        <CardContent>
          <form
            className="grid gap-4 md:grid-cols-4"
            onSubmit={async (e) => {
              e.preventDefault();
              try {
                const res = await fetch("/api/drivers", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ name }),
                });
                const data = (await res.json()) as { error?: string };
                if (!res.ok) throw new Error(data.error ?? "Create failed");
                setName("");
                toast.success("Driver added");
                await refresh();
              } catch (e2) {
                toast.error((e2 as Error).message);
              }
            }}
          >
            <div className="grid gap-2 md:col-span-3">
              <Label>Name</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Driver A" />
            </div>
            <div className="md:col-span-1 flex items-end">
              <Button type="submit" className="w-full">
                Add
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>List</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? <p className="text-sm text-muted-foreground">Loading…</p> : null}
          {!loading && drivers.length === 0 ? <p className="text-sm text-muted-foreground">No drivers yet.</p> : null}

          <div className="space-y-2">
            {drivers.map((d) => (
              <div key={d.id} className="flex items-center justify-between gap-3 rounded-md border p-3">
                <div className="font-medium">{d.name}</div>
                <div className="flex gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={async () => {
                      const newName = window.prompt("New driver name", d.name);
                      if (!newName) return;
                      try {
                        const res = await fetch(`/api/drivers/${d.id}`, {
                          method: "PATCH",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ name: newName }),
                        });
                        const data = (await res.json()) as { error?: string };
                        if (!res.ok) throw new Error(data.error ?? "Update failed");
                        toast.success("Driver renamed");
                        await refresh();
                      } catch (e) {
                        toast.error((e as Error).message);
                      }
                    }}
                  >
                    Rename
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={async () => {
                      if (!window.confirm(`Delete driver '${d.name}'? Existing trips will be deleted too.`)) return;
                      try {
                        const res = await fetch(`/api/drivers/${d.id}`, { method: "DELETE" });
                        const data = (await res.json()) as { error?: string };
                        if (!res.ok) throw new Error(data.error ?? "Delete failed");
                        toast.success("Driver deleted");
                        await refresh();
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
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

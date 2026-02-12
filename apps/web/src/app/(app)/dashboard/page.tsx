"use client";

import { useEffect, useMemo, useState } from "react";

import { EmptyState } from "@/components/empty-state";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

type Vehicle = {
  id: string;
  name: string;
};

type MonthRow = {
  month: string; // YYYY-MM
  fuelAmount: number;
  totalCost: number; // cents
  currency: string;
};

type BarDatum = {
  label: string;
  value: number;
};

function Bars({ title, unit, data }: { title: string; unit: string; data: BarDatum[] }) {
  const max = Math.max(0, ...data.map((d) => d.value));

  const width = 920;
  const height = 220;
  const padX = 24;
  const padTop = 18;
  const padBottom = 36;
  const innerW = width - padX * 2;
  const innerH = height - padTop - padBottom;

  const barGap = 8;
  const barW = data.length ? Math.max(6, Math.floor((innerW - barGap * (data.length - 1)) / data.length)) : 0;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">{title}</CardTitle>
        <CardDescription>{unit}</CardDescription>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <p className="text-sm text-muted-foreground">No data.</p>
        ) : (
          <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto">
            <rect x={0} y={0} width={width} height={height} fill="transparent" />

            {/* baseline */}
            <line x1={padX} y1={padTop + innerH} x2={padX + innerW} y2={padTop + innerH} stroke="hsl(var(--border))" />

            {data.map((d, i) => {
              const h = max > 0 ? (d.value / max) * innerH : 0;
              const x = padX + i * (barW + barGap);
              const y = padTop + (innerH - h);
              return (
                <g key={d.label}>
                  <rect x={x} y={y} width={barW} height={h} rx={4} fill="hsl(var(--chart-1))" opacity={0.9} />
                  <text
                    x={x + barW / 2}
                    y={padTop + innerH + 18}
                    textAnchor="middle"
                    fontSize={12}
                    fill="hsl(var(--muted-foreground))"
                  >
                    {d.label}
                  </text>
                </g>
              );
            })}
          </svg>
        )}
      </CardContent>
    </Card>
  );
}

export default function DashboardPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [vehicleId, setVehicleId] = useState<string>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("dashboard_vehicle_id") || "";
    }
    return "";
  });
  const [months, setMonths] = useState<MonthRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Persist vehicle selection to localStorage
  useEffect(() => {
    if (vehicleId) {
      localStorage.setItem("dashboard_vehicle_id", vehicleId);
    }
  }, [vehicleId]);

  const totals = useMemo(() => {
    const fuel = months.reduce((sum, m) => sum + m.fuelAmount, 0);
    const cost = months.reduce((sum, m) => sum + m.totalCost, 0);
    const currency = months[0]?.currency ?? "EUR";
    return { fuel, cost, currency };
  }, [months]);

  const spendBars = useMemo<BarDatum[]>(() => {
    const last = months.slice(-12);
    return last.map((m) => ({
      label: m.month.slice(5),
      value: Math.round(m.totalCost / 100),
    }));
  }, [months]);

  const fuelBars = useMemo<BarDatum[]>(() => {
    const last = months.slice(-12);
    return last.map((m) => ({
      label: m.month.slice(5),
      value: Math.round(m.fuelAmount * 100) / 100,
    }));
  }, [months]);

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

  async function loadMonthly(vId: string) {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/reports/monthly?vehicleId=${encodeURIComponent(vId)}`);
      if (res.status === 401) {
        window.location.href = "/login";
        return;
      }
      const data = (await res.json()) as { months?: MonthRow[]; error?: string };
      if (!res.ok) throw new Error(data.error ?? "Failed to load monthly report");
      setMonths(data.months ?? []);
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (vehicleId) loadMonthly(vehicleId);
  }, [vehicleId]);

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Monthly spend + fuel totals per vehicle.</p>
        </div>

        {vehicles.length > 0 ? (
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <Select value={vehicleId} onValueChange={setVehicleId}>
              <SelectTrigger className="w-[240px]">
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

            <div className="flex gap-2">
              <Button asChild variant="secondary" disabled={!vehicleId}>
                <a href={`/api/export/csv?vehicleId=${encodeURIComponent(vehicleId)}&kind=fillups`} target="_blank" rel="noreferrer">
                  Export fill-ups
                </a>
              </Button>
              <Button asChild variant="secondary" disabled={!vehicleId}>
                <a href={`/api/export/csv?vehicleId=${encodeURIComponent(vehicleId)}&kind=trips`} target="_blank" rel="noreferrer">
                  Export trips
                </a>
              </Button>
            </div>
          </div>
        ) : null}
      </div>

      {vehicles.length === 0 ? (
        <EmptyState
          title="No vehicles yet"
          description="Add your first vehicle to see dashboard metrics."
          action={{ label: "Add vehicle", href: "/vehicles" }}
        />
      ) : vehicles.length > 0 && !vehicleId ? (
        <EmptyState
          title="Select a vehicle"
          description="Choose a vehicle to view its dashboard metrics."
        />
      ) : null}
          </div>
        </div>
      </div>

      {error ? <div className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm">{error}</div> : null}

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Total spend</CardTitle>
            <CardDescription>Sum of all fill-ups</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {(totals.cost / 100).toFixed(2)} {totals.currency}
            </div>
            {loading ? <div className="mt-2 text-sm text-muted-foreground">Loading…</div> : null}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Total fuel</CardTitle>
            <CardDescription>Sum of all liters</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totals.fuel.toFixed(2)} L</div>
            {loading ? <div className="mt-2 text-sm text-muted-foreground">Loading…</div> : null}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Bars title="Spend (last 12 months)" unit={totals.currency} data={spendBars} />
        <Bars title="Fuel (last 12 months)" unit="L" data={fuelBars} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Monthly totals</CardTitle>
          <CardDescription>{months.length ? "Per-month breakdown" : "No data yet"}</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Month</TableHead>
                <TableHead className="text-right">Fuel (L)</TableHead>
                <TableHead className="text-right">Spend</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {months.map((m) => (
                <TableRow key={m.month}>
                  <TableCell className="font-medium">{m.month}</TableCell>
                  <TableCell className="text-right">{m.fuelAmount.toFixed(2)}</TableCell>
                  <TableCell className="text-right">
                    {(m.totalCost / 100).toFixed(2)} {m.currency}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

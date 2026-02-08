"use client";

import { useEffect, useMemo, useState } from "react";

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

export default function DashboardPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [vehicleId, setVehicleId] = useState<string>("");
  const [months, setMonths] = useState<MonthRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const totals = useMemo(() => {
    const fuel = months.reduce((sum, m) => sum + m.fuelAmount, 0);
    const cost = months.reduce((sum, m) => sum + m.totalCost, 0);
    const currency = months[0]?.currency ?? "EUR";
    return { fuel, cost, currency };
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
    <main style={{ maxWidth: 1000, margin: "40px auto", padding: 24, fontFamily: "system-ui" }}>
      <h1 style={{ fontSize: 28, fontWeight: 800 }}>Dashboard</h1>
      <p style={{ opacity: 0.8, marginTop: 8 }}>Monthly totals (spend + volume) per vehicle.</p>

      <section style={{ marginTop: 16, display: "flex", gap: 12, alignItems: "center" }}>
        <a href="/vehicles" style={{ opacity: 0.9 }}>
          Vehicles
        </a>
        <a href="/fillups" style={{ opacity: 0.9 }}>
          Fill-ups
        </a>
        <a href="/trips" style={{ opacity: 0.9 }}>
          Trips
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
      </section>

      <section style={{ marginTop: 20, padding: 16, border: "1px solid #eee", borderRadius: 12 }}>
        <h2 style={{ fontSize: 18, fontWeight: 700 }}>Totals</h2>
        <div style={{ marginTop: 10, display: "flex", gap: 16, flexWrap: "wrap" }}>
          <div style={{ padding: 12, border: "1px solid #f0f0f0", borderRadius: 12 }}>
            <div style={{ opacity: 0.8, fontSize: 13 }}>Total fuel</div>
            <div style={{ fontWeight: 800, fontSize: 18 }}>{totals.fuel.toFixed(2)}</div>
          </div>
          <div style={{ padding: 12, border: "1px solid #f0f0f0", borderRadius: 12 }}>
            <div style={{ opacity: 0.8, fontSize: 13 }}>Total spend</div>
            <div style={{ fontWeight: 800, fontSize: 18 }}>
              {(totals.cost / 100).toFixed(2)} {totals.currency}
            </div>
          </div>
        </div>

        {error ? <p style={{ marginTop: 12, color: "#b00020" }}>{error}</p> : null}
        {loading ? <p style={{ marginTop: 12 }}>Loading…</p> : null}
      </section>

      <section style={{ marginTop: 20 }}>
        <h2 style={{ fontSize: 18, fontWeight: 700 }}>Monthly</h2>
        {!loading && months.length === 0 ? <p style={{ opacity: 0.8 }}>No data yet.</p> : null}

        <div style={{ marginTop: 12, overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th style={{ textAlign: "left", padding: 8, borderBottom: "1px solid #eee" }}>Month</th>
                <th style={{ textAlign: "right", padding: 8, borderBottom: "1px solid #eee" }}>Fuel</th>
                <th style={{ textAlign: "right", padding: 8, borderBottom: "1px solid #eee" }}>Spend</th>
              </tr>
            </thead>
            <tbody>
              {months.map((m) => (
                <tr key={m.month}>
                  <td style={{ padding: 8, borderBottom: "1px solid #f4f4f4" }}>{m.month}</td>
                  <td style={{ padding: 8, borderBottom: "1px solid #f4f4f4", textAlign: "right" }}>{m.fuelAmount.toFixed(2)}</td>
                  <td style={{ padding: 8, borderBottom: "1px solid #f4f4f4", textAlign: "right" }}>
                    {(m.totalCost / 100).toFixed(2)} {m.currency}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}

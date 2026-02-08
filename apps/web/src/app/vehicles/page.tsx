"use client";

import { useEffect, useState } from "react";

type Vehicle = {
  id: string;
  name: string;
  fuelType: "GASOLINE" | "DIESEL" | "ELECTRIC" | "HYBRID" | "OTHER";
  unitSystem: "METRIC" | "IMPERIAL";
  createdAt: string;
};

export default function VehiclesPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [fuelType, setFuelType] = useState<Vehicle["fuelType"]>("GASOLINE");
  const [unitSystem, setUnitSystem] = useState<Vehicle["unitSystem"]>("METRIC");
  const [submitting, setSubmitting] = useState(false);

  async function refresh() {
    setLoading(true);
    setError(null);
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
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
  }, []);

  return (
    <main style={{ maxWidth: 900, margin: "40px auto", padding: 24, fontFamily: "system-ui" }}>
      <h1 style={{ fontSize: 28, fontWeight: 800 }}>Vehicles</h1>

      <section style={{ marginTop: 20, padding: 16, border: "1px solid #eee", borderRadius: 12 }}>
        <h2 style={{ fontSize: 18, fontWeight: 700 }}>Add vehicle</h2>
        <form
          style={{ display: "grid", gap: 12, gridTemplateColumns: "2fr 1fr 1fr auto", marginTop: 12 }}
          onSubmit={async (e) => {
            e.preventDefault();
            setSubmitting(true);
            setError(null);
            try {
              const res = await fetch("/api/vehicles", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, fuelType, unitSystem }),
              });
              const data = (await res.json()) as { error?: string };
              if (!res.ok) throw new Error(data.error ?? "Create failed");
              setName("");
              await refresh();
            } catch (e2) {
              setError((e2 as Error).message);
            } finally {
              setSubmitting(false);
            }
          }}
        >
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Vehicle name (e.g., Golf)"
            required
            style={{ padding: 10, borderRadius: 8, border: "1px solid #ccc" }}
          />
          <select
            value={fuelType}
            onChange={(e) => setFuelType(e.target.value as Vehicle["fuelType"])}
            style={{ padding: 10, borderRadius: 8, border: "1px solid #ccc" }}
          >
            <option value="GASOLINE">Gasoline</option>
            <option value="DIESEL">Diesel</option>
            <option value="ELECTRIC">Electric</option>
            <option value="HYBRID">Hybrid</option>
            <option value="OTHER">Other</option>
          </select>
          <select
            value={unitSystem}
            onChange={(e) => setUnitSystem(e.target.value as Vehicle["unitSystem"])}
            style={{ padding: 10, borderRadius: 8, border: "1px solid #ccc" }}
          >
            <option value="METRIC">Metric</option>
            <option value="IMPERIAL">Imperial</option>
          </select>
          <button
            type="submit"
            disabled={submitting}
            style={{
              padding: "10px 12px",
              borderRadius: 8,
              border: 0,
              background: "#111",
              color: "white",
              cursor: submitting ? "wait" : "pointer",
              opacity: submitting ? 0.7 : 1,
            }}
          >
            {submitting ? "Adding…" : "Add"}
          </button>
        </form>
        {error ? <p style={{ marginTop: 12, color: "#b00020" }}>{error}</p> : null}
      </section>

      <section style={{ marginTop: 20 }}>
        <h2 style={{ fontSize: 18, fontWeight: 700 }}>Your vehicles</h2>
        {loading ? <p>Loading…</p> : null}
        {!loading && vehicles.length === 0 ? <p style={{ opacity: 0.8 }}>No vehicles yet.</p> : null}

        <div style={{ marginTop: 12, display: "grid", gap: 10 }}>
          {vehicles.map((v) => (
            <div key={v.id} style={{ padding: 12, border: "1px solid #eee", borderRadius: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                <div>
                  <div style={{ fontWeight: 700 }}>{v.name}</div>
                  <div style={{ opacity: 0.8, fontSize: 13 }}>
                    {v.fuelType} · {v.unitSystem}
                  </div>
                </div>
                <div style={{ opacity: 0.6, fontSize: 12, alignSelf: "center" }}>{v.id}</div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}

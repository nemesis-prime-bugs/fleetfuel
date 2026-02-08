"use client";

import { useEffect, useMemo, useState } from "react";

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
  const [error, setError] = useState<string | null>(null);

  const [occurredAt, setOccurredAt] = useState(() => new Date().toISOString().slice(0, 10));
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

  const canSubmit = useMemo(() => {
    return !!vehicleId && !!occurredAt && !!odometer && !!fuelAmount && !!totalCost;
  }, [vehicleId, occurredAt, odometer, fuelAmount, totalCost]);

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
    setError(null);
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
    if (vehicleId) refreshFillUps(vehicleId);
  }, [vehicleId]);

  return (
    <main style={{ maxWidth: 1000, margin: "40px auto", padding: 24, fontFamily: "system-ui" }}>
      <h1 style={{ fontSize: 28, fontWeight: 800 }}>Fill-ups</h1>

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
        <a href="/vehicles" style={{ opacity: 0.8 }}>
          Manage vehicles
        </a>
      </section>

      <section style={{ marginTop: 20, padding: 16, border: "1px solid #eee", borderRadius: 12 }}>
        <h2 style={{ fontSize: 18, fontWeight: 700 }}>Add fill-up</h2>
        <form
          style={{ display: "grid", gap: 12, gridTemplateColumns: "1fr 1fr 1fr 1fr 1fr", marginTop: 12 }}
          onSubmit={async (e) => {
            e.preventDefault();
            if (!canSubmit) return;
            setError(null);
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
              await refreshFillUps(vehicleId);
            } catch (e2) {
              setError((e2 as Error).message);
            }
          }}
        >
          <label style={{ display: "grid", gap: 6 }}>
            <span>Date</span>
            <input
              value={occurredAt}
              onChange={(e) => setOccurredAt(e.target.value)}
              type="date"
              required
              style={{ padding: 10, borderRadius: 8, border: "1px solid #ccc" }}
            />
          </label>
          <label style={{ display: "grid", gap: 6 }}>
            <span>Odometer</span>
            <input
              value={odometer}
              onChange={(e) => setOdometer(e.target.value)}
              placeholder="e.g. 120000"
              inputMode="numeric"
              required
              style={{ padding: 10, borderRadius: 8, border: "1px solid #ccc" }}
            />
          </label>
          <label style={{ display: "grid", gap: 6 }}>
            <span>Fuel amount</span>
            <input
              value={fuelAmount}
              onChange={(e) => setFuelAmount(e.target.value)}
              placeholder="e.g. 45.2"
              inputMode="decimal"
              required
              style={{ padding: 10, borderRadius: 8, border: "1px solid #ccc" }}
            />
          </label>
          <label style={{ display: "grid", gap: 6 }}>
            <span>Total cost ({currency})</span>
            <input
              value={totalCost}
              onChange={(e) => setTotalCost(e.target.value)}
              placeholder="e.g. 70.40"
              inputMode="decimal"
              required
              style={{ padding: 10, borderRadius: 8, border: "1px solid #ccc" }}
            />
          </label>
          <label style={{ display: "grid", gap: 6 }}>
            <span>&nbsp;</span>
            <button
              type="submit"
              disabled={!canSubmit}
              style={{
                padding: 12,
                borderRadius: 8,
                border: 0,
                background: "#111",
                color: "white",
                opacity: canSubmit ? 1 : 0.6,
              }}
            >
              Add
            </button>
          </label>

          <label style={{ display: "flex", gap: 8, alignItems: "center", gridColumn: "1 / span 5" }}>
            <input type="checkbox" checked={isFullTank} onChange={(e) => setIsFullTank(e.target.checked)} />
            Full tank
          </label>
        </form>

        {error ? <p style={{ marginTop: 12, color: "#b00020" }}>{error}</p> : null}
      </section>

      <section style={{ marginTop: 20 }}>
        <h2 style={{ fontSize: 18, fontWeight: 700 }}>History</h2>
        {loading ? <p>Loading…</p> : null}
        {!loading && fillUps.length === 0 ? <p style={{ opacity: 0.8 }}>No fill-ups yet.</p> : null}

        <div style={{ marginTop: 12, display: "grid", gap: 10 }}>
          {fillUps.map((f) => (
            <div key={f.id} style={{ padding: 12, border: "1px solid #eee", borderRadius: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                <div>
                  <div style={{ fontWeight: 700 }}>{new Date(f.occurredAt).toLocaleDateString()}</div>
                  <div style={{ opacity: 0.8, fontSize: 13 }}>
                    Odo: {f.odometer} · Fuel: {f.fuelAmount} · Cost: {(f.totalCost / 100).toFixed(2)} {f.currency}
                    {f.isFullTank ? " · Full" : ""}
                  </div>
                </div>

                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <label
                    style={{
                      padding: "6px 10px",
                      borderRadius: 8,
                      border: "1px solid #ddd",
                      background: "white",
                      cursor: "pointer",
                    }}
                    title="Attach receipt"
                  >
                    📎 Receipt
                    <input
                      type="file"
                      accept="image/jpeg,image/png"
                      style={{ display: "none" }}
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        setError(null);
                        try {
                          const fd = new FormData();
                          fd.set("fillUpId", f.id);
                          fd.set("file", file);
                          const res = await fetch("/api/receipts/upload", { method: "POST", body: fd });
                          const data = (await res.json()) as { error?: string };
                          if (!res.ok) throw new Error(data.error ?? "Upload failed");
                          await refreshFillUps(vehicleId);
                        } catch (e2) {
                          setError((e2 as Error).message);
                        } finally {
                          e.target.value = "";
                        }
                      }}
                    />
                  </label>

                  <button
                    type="button"
                    style={{ padding: "6px 10px", borderRadius: 8, border: "1px solid #ddd", background: "white" }}
                    onClick={async () => {
                      const newOdo = window.prompt("New odometer", String(f.odometer));
                      if (!newOdo) return;
                      const newFuel = window.prompt("New fuel amount", String(f.fuelAmount));
                      if (!newFuel) return;
                      const newCost = window.prompt(
                        `New total cost (${f.currency})`,
                        (f.totalCost / 100).toFixed(2)
                      );
                      if (!newCost) return;
                      try {
                        await patchFillUp(f.id, {
                          odometer: Number(newOdo),
                          fuelAmount: Number(newFuel),
                          totalCost: Math.round(Number(newCost) * 100),
                        } as any);
                        await refreshFillUps(vehicleId);
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
                      if (!window.confirm("Delete this fill-up?")) return;
                      try {
                        await deleteFillUp(f.id);
                        await refreshFillUps(vehicleId);
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
      </section>
    </main>
  );
}

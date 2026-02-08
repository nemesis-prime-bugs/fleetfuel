"use client";

import { useEffect, useState } from "react";

type Driver = {
  id: string;
  name: string;
};

export default function DriversPage() {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function refresh() {
    setLoading(true);
    setError(null);
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
      setError((e as Error).message);
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
    <main style={{ maxWidth: 900, margin: "40px auto", padding: 24, fontFamily: "system-ui" }}>
      <h1 style={{ fontSize: 28, fontWeight: 800 }}>Drivers</h1>
      <p style={{ opacity: 0.8, marginTop: 8 }}>Managed list of drivers for trip logging (Tagebuch).</p>

      <section style={{ marginTop: 16, display: "flex", gap: 12, alignItems: "center" }}>
        <a href="/trips" style={{ opacity: 0.9 }}>
          Go to Trips
        </a>
        <a href="/vehicles" style={{ opacity: 0.9 }}>
          Vehicles
        </a>
        <a href="/fillups" style={{ opacity: 0.9 }}>
          Fill-ups
        </a>
      </section>

      <section style={{ marginTop: 20, padding: 16, border: "1px solid #eee", borderRadius: 12 }}>
        <h2 style={{ fontSize: 18, fontWeight: 700 }}>Add driver</h2>
        <form
          style={{ display: "flex", gap: 10, marginTop: 12, alignItems: "center" }}
          onSubmit={async (e) => {
            e.preventDefault();
            setError(null);
            try {
              const res = await fetch("/api/drivers", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name }),
              });
              const data = (await res.json()) as { error?: string };
              if (!res.ok) throw new Error(data.error ?? "Create failed");
              setName("");
              await refresh();
            } catch (e2) {
              setError((e2 as Error).message);
            }
          }}
        >
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Driver A"
            style={{ padding: 10, borderRadius: 8, border: "1px solid #ccc", flex: 1 }}
          />
          <button type="submit" style={{ padding: "10px 14px", borderRadius: 8, border: 0, background: "#111", color: "#fff" }}>
            Add
          </button>
        </form>
        {error ? <p style={{ marginTop: 12, color: "#b00020" }}>{error}</p> : null}
      </section>

      <section style={{ marginTop: 20 }}>
        <h2 style={{ fontSize: 18, fontWeight: 700 }}>List</h2>
        {loading ? <p>Loading…</p> : null}
        {!loading && drivers.length === 0 ? <p style={{ opacity: 0.8 }}>No drivers yet.</p> : null}

        <div style={{ marginTop: 12, display: "grid", gap: 10 }}>
          {drivers.map((d) => (
            <div key={d.id} style={{ padding: 12, border: "1px solid #eee", borderRadius: 12, display: "flex", justifyContent: "space-between", gap: 12 }}>
              <div style={{ fontWeight: 700 }}>{d.name}</div>
              <div style={{ display: "flex", gap: 8 }}>
                <button
                  type="button"
                  style={{ padding: "6px 10px", borderRadius: 8, border: "1px solid #ddd", background: "white" }}
                  onClick={async () => {
                    const newName = window.prompt("New driver name", d.name);
                    if (!newName) return;
                    setError(null);
                    try {
                      const res = await fetch(`/api/drivers/${d.id}`, {
                        method: "PATCH",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ name: newName }),
                      });
                      const data = (await res.json()) as { error?: string };
                      if (!res.ok) throw new Error(data.error ?? "Update failed");
                      await refresh();
                    } catch (e) {
                      setError((e as Error).message);
                    }
                  }}
                >
                  Rename
                </button>
                <button
                  type="button"
                  style={{ padding: "6px 10px", borderRadius: 8, border: "1px solid #ffb3b3", background: "#ffe9e9" }}
                  onClick={async () => {
                    if (!window.confirm(`Delete driver '${d.name}'? Existing trips will be deleted too.`)) return;
                    setError(null);
                    try {
                      const res = await fetch(`/api/drivers/${d.id}`, { method: "DELETE" });
                      const data = (await res.json()) as { error?: string };
                      if (!res.ok) throw new Error(data.error ?? "Delete failed");
                      await refresh();
                    } catch (e) {
                      setError((e as Error).message);
                    }
                  }}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}

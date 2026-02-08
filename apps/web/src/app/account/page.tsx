"use client";

import { useEffect, useMemo, useState } from "react";

type AccountType = "PERSONAL" | "COMPANY";

type Account = {
  id: string;
  type: AccountType;
  name: string | null;
};

export default function AccountPage() {
  const [account, setAccount] = useState<Account | null>(null);
  const [type, setType] = useState<AccountType>("PERSONAL");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSave = useMemo(() => {
    if (!account) return false;
    const nameNorm = name.trim();
    const nameOrNull = nameNorm ? nameNorm : null;
    return type !== account.type || nameOrNull !== account.name;
  }, [account, name, type]);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/account");
      if (res.status === 401) {
        window.location.href = "/login";
        return;
      }
      const data = (await res.json()) as { account?: Account; error?: string };
      if (!res.ok) throw new Error(data.error ?? "Failed to load account");
      const a = data.account!;
      setAccount(a);
      setType(a.type);
      setName(a.name ?? "");
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load().catch(() => {
      /* ignore */
    });
  }, []);

  return (
    <main style={{ maxWidth: 900, margin: "40px auto", padding: 24, fontFamily: "system-ui" }}>
      <h1 style={{ fontSize: 28, fontWeight: 800 }}>Account</h1>
      <p style={{ opacity: 0.8, marginTop: 8 }}>Basic account settings for MVP.</p>

      <section style={{ marginTop: 16, display: "flex", gap: 12, alignItems: "center" }}>
        <a href="/dashboard" style={{ opacity: 0.9 }}>
          Dashboard
        </a>
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

      <section style={{ marginTop: 20, padding: 16, border: "1px solid #eee", borderRadius: 12 }}>
        <h2 style={{ fontSize: 18, fontWeight: 700 }}>Settings</h2>

        {loading ? <p style={{ marginTop: 12 }}>Loading…</p> : null}
        {error ? <p style={{ marginTop: 12, color: "#b00020" }}>{error}</p> : null}

        {!loading && account ? (
          <form
            style={{ marginTop: 12, display: "grid", gap: 12, gridTemplateColumns: "1fr 1fr" }}
            onSubmit={async (e) => {
              e.preventDefault();
              if (!canSave) return;
              setSaving(true);
              setError(null);
              try {
                const res = await fetch("/api/account", {
                  method: "PATCH",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    type,
                    name: name.trim() ? name.trim() : null,
                  }),
                });
                const data = (await res.json()) as { account?: Account; error?: string };
                if (!res.ok) throw new Error(data.error ?? "Save failed");
                const updated = data.account!;
                setAccount(updated);
                setType(updated.type);
                setName(updated.name ?? "");
              } catch (e2) {
                setError((e2 as Error).message);
              } finally {
                setSaving(false);
              }
            }}
          >
            <label style={{ display: "grid", gap: 6 }}>
              <span>Account type</span>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as AccountType)}
                style={{ padding: 10, borderRadius: 8, border: "1px solid #ccc" }}
              >
                <option value="PERSONAL">Personal</option>
                <option value="COMPANY">Company</option>
              </select>
            </label>

            <label style={{ display: "grid", gap: 6 }}>
              <span>Name (optional)</span>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={type === "COMPANY" ? "Company name" : "Your name"}
                style={{ padding: 10, borderRadius: 8, border: "1px solid #ccc" }}
              />
            </label>

            <div style={{ gridColumn: "1 / span 2", display: "flex", justifyContent: "flex-end" }}>
              <button
                type="submit"
                disabled={!canSave || saving}
                style={{
                  padding: "10px 14px",
                  borderRadius: 8,
                  border: 0,
                  background: "#111",
                  color: "#fff",
                  opacity: canSave && !saving ? 1 : 0.6,
                }}
              >
                {saving ? "Saving…" : "Save"}
              </button>
            </div>
          </form>
        ) : null}
      </section>
    </main>
  );
}

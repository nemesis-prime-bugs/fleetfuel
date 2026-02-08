"use client";

import { useState } from "react";

type AccountType = "PERSONAL" | "COMPANY";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [accountType, setAccountType] = useState<AccountType>("PERSONAL");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  return (
    <main style={{ maxWidth: 520, margin: "40px auto", padding: 24, fontFamily: "system-ui" }}>
      <h1 style={{ fontSize: 28, fontWeight: 800 }}>Create your FleetFuel account</h1>
      <p style={{ marginTop: 8, opacity: 0.8 }}>
        MVP signup. Already have an account? <a href="/login">Log in</a>.
      </p>

      <form
        style={{ marginTop: 24, display: "grid", gap: 14 }}
        onSubmit={async (e) => {
          e.preventDefault();
          setError(null);
          setSubmitting(true);
          try {
            const res = await fetch("/api/auth/signup", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ email, password, accountType }),
            });
            const data = (await res.json()) as { error?: string };
            if (!res.ok) {
              setError(data.error ?? "Signup failed");
              return;
            }
            window.location.href = "/app";
          } catch {
            setError("Network error");
          } finally {
            setSubmitting(false);
          }
        }}
      >
        <label style={{ display: "grid", gap: 6 }}>
          <span>Email</span>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            type="email"
            autoComplete="email"
            required
            style={{ padding: 10, borderRadius: 8, border: "1px solid #ccc" }}
          />
        </label>

        <label style={{ display: "grid", gap: 6 }}>
          <span>Password</span>
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="min 12 characters"
            type="password"
            autoComplete="new-password"
            required
            style={{ padding: 10, borderRadius: 8, border: "1px solid #ccc" }}
          />
        </label>

        <fieldset style={{ border: "1px solid #eee", borderRadius: 8, padding: 12 }}>
          <legend style={{ padding: "0 6px" }}>Account type</legend>
          <label style={{ display: "flex", gap: 8, alignItems: "center", marginTop: 8 }}>
            <input
              type="radio"
              name="accountType"
              checked={accountType === "PERSONAL"}
              onChange={() => setAccountType("PERSONAL")}
            />
            Personal
          </label>
          <label style={{ display: "flex", gap: 8, alignItems: "center", marginTop: 8 }}>
            <input
              type="radio"
              name="accountType"
              checked={accountType === "COMPANY"}
              onChange={() => setAccountType("COMPANY")}
            />
            Company
          </label>
        </fieldset>

        {error ? (
          <div style={{ background: "#ffe9e9", border: "1px solid #ffb3b3", padding: 10, borderRadius: 8 }}>
            <b>Signup failed:</b> {error}
          </div>
        ) : null}

        <button
          type="submit"
          disabled={submitting}
          style={{
            padding: 12,
            borderRadius: 8,
            border: 0,
            background: "#111",
            color: "white",
            opacity: submitting ? 0.7 : 1,
            cursor: submitting ? "wait" : "pointer",
          }}
        >
          {submitting ? "Creating…" : "Create account"}
        </button>
      </form>
    </main>
  );
}

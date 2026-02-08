"use client";

import { useState } from "react";

type AccountType = "PERSONAL" | "COMPANY";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [accountType, setAccountType] = useState<AccountType>("PERSONAL");

  return (
    <main style={{ maxWidth: 520, margin: "40px auto", padding: 24, fontFamily: "system-ui" }}>
      <h1 style={{ fontSize: 28, fontWeight: 800 }}>Create your FleetFuel account</h1>
      <p style={{ marginTop: 8, opacity: 0.8 }}>MVP signup (UI skeleton).</p>

      <form style={{ marginTop: 24, display: "grid", gap: 14 }}>
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

        <button
          type="submit"
          disabled
          title="Backend not wired yet"
          style={{
            padding: 12,
            borderRadius: 8,
            border: 0,
            background: "#111",
            color: "white",
            opacity: 0.6,
            cursor: "not-allowed",
          }}
        >
          Create account
        </button>
      </form>

      <pre style={{ marginTop: 18, background: "#f6f6f6", padding: 12, borderRadius: 8, fontSize: 12 }}>
        {JSON.stringify({ email, password: password ? "***" : "", accountType }, null, 2)}
      </pre>
    </main>
  );
}

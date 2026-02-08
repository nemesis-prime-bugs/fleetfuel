"use client";

import { useState } from "react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <main style={{ maxWidth: 520, margin: "40px auto", padding: 24, fontFamily: "system-ui" }}>
      <h1 style={{ fontSize: 28, fontWeight: 800 }}>Log in</h1>
      <p style={{ marginTop: 8, opacity: 0.8 }}>MVP login (UI skeleton).</p>

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
            placeholder="your password"
            type="password"
            autoComplete="current-password"
            required
            style={{ padding: 10, borderRadius: 8, border: "1px solid #ccc" }}
          />
        </label>

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
          Log in
        </button>
      </form>

      <pre style={{ marginTop: 18, background: "#f6f6f6", padding: 12, borderRadius: 8, fontSize: 12 }}>
        {JSON.stringify({ email, password: password ? "***" : "" }, null, 2)}
      </pre>
    </main>
  );
}

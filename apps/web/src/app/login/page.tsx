"use client";

import { useState } from "react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  return (
    <main style={{ maxWidth: 520, margin: "40px auto", padding: 24, fontFamily: "system-ui" }}>
      <h1 style={{ fontSize: 28, fontWeight: 800 }}>Log in</h1>
      <p style={{ marginTop: 8, opacity: 0.8 }}>
        MVP login. No account yet? <a href="/signup">Create one</a>.
      </p>

      <form
        style={{ marginTop: 24, display: "grid", gap: 14 }}
        onSubmit={async (e) => {
          e.preventDefault();
          setError(null);
          setSubmitting(true);
          try {
            const res = await fetch("/api/auth/login", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ email, password }),
            });
            const data = (await res.json()) as { error?: string };
            if (!res.ok) {
              setError(data.error ?? "Login failed");
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
            placeholder="your password"
            type="password"
            autoComplete="current-password"
            required
            style={{ padding: 10, borderRadius: 8, border: "1px solid #ccc" }}
          />
        </label>

        {error ? (
          <div style={{ background: "#ffe9e9", border: "1px solid #ffb3b3", padding: 10, borderRadius: 8 }}>
            <b>Login failed:</b> {error}
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
          {submitting ? "Logging in…" : "Log in"}
        </button>
      </form>
    </main>
  );
}

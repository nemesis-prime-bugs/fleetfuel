import React from "react";

export function ServerLoginCard(props: {
  baseUrl: string;
  isAuthed: boolean;
  onLogin: (email: string, password: string) => Promise<void>;
  onLogout: () => Promise<void>;
  error?: string | null;
}) {
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [busy, setBusy] = React.useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      await props.onLogin(email, password);
      setPassword("");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={{ border: "1px solid #e5e7eb", borderRadius: 12, padding: 12, marginTop: 12 }}>
      <div style={{ fontWeight: 700 }}>Server login</div>
      <div style={{ color: "#6b7280", fontSize: 13, marginTop: 2 }}>
        {props.baseUrl ? `Using ${props.baseUrl}` : "Set a base URL above."}
      </div>

      {props.error && <div style={{ color: "#b91c1c", marginTop: 10, fontSize: 13 }}>{props.error}</div>}

      {props.isAuthed ? (
        <button
          type="button"
          onClick={() => props.onLogout()}
          style={{
            marginTop: 12,
            padding: "10px 12px",
            width: "100%",
            borderRadius: 10,
            border: "1px solid #d1d5db",
            background: "white",
          }}
        >
          Logout
        </button>
      ) : (
        <form onSubmit={handleLogin} style={{ marginTop: 12, display: "grid", gap: 10 }}>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            autoCapitalize="none"
            autoCorrect="off"
            style={{ padding: "10px 12px", borderRadius: 10, border: "1px solid #d1d5db", fontSize: 14 }}
          />
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            type="password"
            style={{ padding: "10px 12px", borderRadius: 10, border: "1px solid #d1d5db", fontSize: 14 }}
          />
          <button
            type="submit"
            disabled={busy || !props.baseUrl}
            style={{
              padding: "10px 12px",
              borderRadius: 10,
              border: "1px solid #111827",
              background: "#111827",
              color: "white",
              opacity: busy || !props.baseUrl ? 0.6 : 1,
            }}
          >
            {busy ? "Logging in…" : "Login"}
          </button>
        </form>
      )}
    </div>
  );
}

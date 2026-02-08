import React from "react";

import { clearServerToken, getServerToken, tokenLogin, tokenLogout } from "./lib/auth/serverAuth";
import { getServerBaseUrl, getStorageMode, setServerBaseUrl, setStorageMode } from "./lib/storageMode";

import { ServerLoginCard } from "./components/ServerLoginCard";
import { StorageModeCard } from "./components/StorageModeCard";

export default function App() {
  const [mode, setMode] = React.useState<"local" | "server">("local");
  const [baseUrl, setBaseUrl] = React.useState<string>("");
  const [token, setToken] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    (async () => {
      const [m, u, t] = await Promise.all([getStorageMode(), getServerBaseUrl(), getServerToken()]);
      setMode(m);
      setBaseUrl(u);
      setToken(t);
    })().catch((e) => setError(String(e?.message ?? e)));
  }, []);

  async function handleModeChange(next: "local" | "server") {
    setError(null);
    setMode(next);
    await setStorageMode(next);
    if (next === "local") {
      // keep token stored, but UI treats it as irrelevant in local mode
      return;
    }
  }

  async function handleBaseUrlChange(v: string) {
    setBaseUrl(v);
    await setServerBaseUrl(v);
  }

  async function handleLogin(email: string, password: string) {
    setError(null);
    if (!baseUrl) throw new Error("Missing baseUrl");
    const res = await tokenLogin({ baseUrl, email, password });
    setToken(res.token);
  }

  async function handleLogout() {
    setError(null);
    if (!baseUrl) {
      await clearServerToken();
      setToken(null);
      return;
    }
    await tokenLogout({ baseUrl });
    setToken(null);
  }

  return (
    <div style={{ maxWidth: 520, margin: "0 auto", padding: 16, fontFamily: "system-ui, -apple-system" }}>
      <h1 style={{ margin: 0, fontSize: 20 }}>FleetFuel Mobile</h1>
      <div style={{ color: "#6b7280", marginTop: 4, fontSize: 13 }}>
        MVP settings: choose Local-first or Server mode.
      </div>

      <div style={{ marginTop: 12 }}>
        <StorageModeCard
          mode={mode}
          onModeChange={(m) => void handleModeChange(m)}
          baseUrl={baseUrl}
          onBaseUrlChange={(v) => void handleBaseUrlChange(v)}
        />

        {mode === "server" && (
          <ServerLoginCard
            baseUrl={baseUrl}
            isAuthed={!!token}
            onLogin={handleLogin}
            onLogout={handleLogout}
            error={error}
          />
        )}

        {mode === "local" && token && (
          <div style={{ marginTop: 12, fontSize: 12, color: "#6b7280" }}>
            Note: you have a saved server token, but you’re currently in local mode.
          </div>
        )}
      </div>
    </div>
  );
}

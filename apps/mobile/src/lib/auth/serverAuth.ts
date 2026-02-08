import { Preferences } from "@capacitor/preferences";

const KEY = "fleetfuel.serverToken";

export async function getServerToken(): Promise<string | null> {
  const res = await Preferences.get({ key: KEY });
  return res.value ?? null;
}

export async function setServerToken(token: string): Promise<void> {
  await Preferences.set({ key: KEY, value: token });
}

export async function clearServerToken(): Promise<void> {
  await Preferences.remove({ key: KEY });
}

export async function tokenLogin(opts: { baseUrl: string; email: string; password: string }) {
  const res = await fetch(`${opts.baseUrl.replace(/\/+$/, "")}/api/auth/token-login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: opts.email, password: opts.password, accountType: "PERSONAL" }),
  });

  const data = (await res.json()) as any;
  if (!res.ok) throw new Error(data?.error ?? "Login failed");

  const token = String(data.token);
  await setServerToken(token);
  return { token, expiresAt: String(data.expiresAt), user: data.user };
}

export async function tokenLogout(opts: { baseUrl: string }) {
  const token = await getServerToken();
  if (!token) return;

  await fetch(`${opts.baseUrl.replace(/\/+$/, "")}/api/auth/token-logout`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  });

  await clearServerToken();
}

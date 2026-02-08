import { Preferences } from "@capacitor/preferences";
import type { StorageMode } from "@fleetfuel/shared";

const KEY_MODE = "fleetfuel.storageMode";
const KEY_BASE_URL = "fleetfuel.serverBaseUrl";

export async function getStorageMode(): Promise<StorageMode> {
  const res = await Preferences.get({ key: KEY_MODE });
  return (res.value === "server" ? "server" : "local") satisfies StorageMode;
}

export async function setStorageMode(mode: StorageMode): Promise<void> {
  await Preferences.set({ key: KEY_MODE, value: mode });
}

export async function getServerBaseUrl(): Promise<string> {
  const res = await Preferences.get({ key: KEY_BASE_URL });
  return res.value ?? "";
}

export async function setServerBaseUrl(baseUrl: string): Promise<void> {
  await Preferences.set({ key: KEY_BASE_URL, value: baseUrl.trim() });
}

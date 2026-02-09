/**
 * Minimal API smoke test (no browser).
 *
 * Usage:
 *   BASE_URL=http://localhost:3000 pnpm tsx scripts/smoke-api.ts
 */

import crypto from "node:crypto";

const BASE_URL = process.env.BASE_URL ?? "http://localhost:3000";

type Json = Record<string, any>;

async function req(path: string, init?: RequestInit & { json?: any; cookie?: string }) {
  const headers = new Headers(init?.headers);
  if (init?.json !== undefined) headers.set("Content-Type", "application/json");
  if (init?.cookie) headers.set("Cookie", init.cookie);

  const res = await fetch(`${BASE_URL}${path}`, {
    ...init,
    headers,
    body: init?.json !== undefined ? JSON.stringify(init.json) : init?.body,
    redirect: "manual",
  });

  const setCookie = res.headers.get("set-cookie") ?? "";
  let data: any = null;
  const ct = res.headers.get("content-type") ?? "";
  if (ct.includes("application/json")) {
    data = (await res.json()) as Json;
  } else {
    data = await res.text();
  }

  return { res, data, setCookie };
}

function pickCookie(setCookie: string): string {
  // naive: take first cookie pair
  const first = setCookie.split(",")[0];
  return first.split(";")[0] ?? "";
}

async function main() {
  const email = `smoke_${crypto.randomBytes(6).toString("hex")}@example.com`;
  const password = `P@ssw0rd_${crypto.randomBytes(12).toString("hex")}`;

  // signup
  const signup = await req("/api/auth/signup", {
    method: "POST",
    json: { email, password, accountType: "PERSONAL" },
  });
  if (!signup.res.ok) throw new Error(`signup failed: ${signup.res.status} ${JSON.stringify(signup.data)}`);
  const cookie = pickCookie(signup.setCookie);
  if (!cookie) throw new Error("no session cookie returned from signup");

  // create vehicle
  const v = await req("/api/vehicles", {
    method: "POST",
    cookie,
    json: { name: "SmokeCar", fuelType: "GASOLINE", unitSystem: "METRIC" },
  });
  if (!v.res.ok) throw new Error(`vehicle create failed: ${v.res.status} ${JSON.stringify(v.data)}`);
  const vehicleId = v.data?.vehicle?.id;
  if (!vehicleId) throw new Error("vehicle id missing");

  // create fillup
  const f = await req("/api/fillups", {
    method: "POST",
    cookie,
    json: {
      vehicleId,
      occurredAt: new Date().toISOString(),
      odometer: 12345,
      fuelAmount: 40.5,
      totalCost: 6543,
      currency: "EUR",
      isFullTank: true,
    },
  });
  if (!f.res.ok) throw new Error(`fillup create failed: ${f.res.status} ${JSON.stringify(f.data)}`);

  // monthly report
  const r = await req(`/api/reports/monthly?vehicleId=${encodeURIComponent(vehicleId)}`, { method: "GET", cookie });
  if (!r.res.ok) throw new Error(`monthly report failed: ${r.res.status} ${JSON.stringify(r.data)}`);

  console.log("SMOKE_OK", { email, vehicleId });
}

main().catch((e) => {
  console.error("SMOKE_FAIL", e);
  process.exit(1);
});

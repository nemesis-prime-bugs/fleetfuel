import { createSessionToken, hashSessionToken } from "@/lib/auth/sessionToken";

function main() {
  const t1 = createSessionToken();
  const t2 = createSessionToken();

  if (t1.raw === t2.raw) throw new Error("tokens should be unique");
  if (t1.raw.length < 20) throw new Error("token too short");

  const h1 = hashSessionToken(t1.raw);
  if (h1 !== t1.hash) throw new Error("hash mismatch");

  // eslint-disable-next-line no-console
  console.log("sessiontoken-selftest: OK");
}

try {
  main();
} catch (err) {
  // eslint-disable-next-line no-console
  console.error("sessiontoken-selftest: FAIL", err);
  process.exit(1);
}

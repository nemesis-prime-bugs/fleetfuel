import { hashPassword, verifyPassword } from "@/lib/auth/password";

async function main() {
  const password = "correct horse battery staple";
  const hash = await hashPassword(password);

  const ok1 = await verifyPassword(hash, password);
  const ok2 = await verifyPassword(hash, "wrong-password");

  if (!ok1) throw new Error("verify failed for correct password");
  if (ok2) throw new Error("verify unexpectedly succeeded for wrong password");

  // eslint-disable-next-line no-console
  console.log("password-selftest: OK");
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error("password-selftest: FAIL", err);
  process.exit(1);
});

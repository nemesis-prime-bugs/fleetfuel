import crypto from "node:crypto";

import { prisma } from "@/lib/db";
import { rateLimitOrThrowDurable, RateLimitError } from "@/lib/auth/rateLimitDurable";

async function main() {
  const key = `selftest:rl:${crypto.randomUUID()}`;

  // Ensure clean
  await prisma.rateLimitWindow.deleteMany({ where: { key } });

  const limit = 2;
  const windowMs = 60_000;

  await rateLimitOrThrowDurable(key, { limit, windowMs });
  await rateLimitOrThrowDurable(key, { limit, windowMs });

  let threw = false;
  try {
    await rateLimitOrThrowDurable(key, { limit, windowMs });
  } catch (e) {
    threw = true;
    if (!(e instanceof RateLimitError)) throw new Error("Expected RateLimitError");
    if (!Number.isFinite(e.retryAfterSec) || e.retryAfterSec <= 0) {
      throw new Error(`Expected retryAfterSec > 0, got ${e.retryAfterSec}`);
    }
  }

  if (!threw) throw new Error("Expected third call to be rate-limited");

  console.log("OK: durable rate limiter selftest");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

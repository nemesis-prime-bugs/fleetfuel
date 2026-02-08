import { prisma } from "@/lib/db";

export class RateLimitError extends Error {
  retryAfterSec: number;

  constructor(message: string, retryAfterSec: number) {
    super(message);
    this.retryAfterSec = retryAfterSec;
  }
}

type Opts = {
  limit: number;
  windowMs: number;
};

function floorToWindowStart(nowMs: number, windowMs: number) {
  return Math.floor(nowMs / windowMs) * windowMs;
}

export async function rateLimitOrThrowDurable(key: string, opts: Opts) {
  const { limit, windowMs } = opts;
  if (!key) throw new Error("rateLimit key required");
  if (!Number.isFinite(limit) || limit <= 0) throw new Error("rateLimit limit invalid");
  if (!Number.isFinite(windowMs) || windowMs <= 0) throw new Error("rateLimit windowMs invalid");

  const nowMs = Date.now();
  const windowStartMs = floorToWindowStart(nowMs, windowMs);
  const windowStart = new Date(windowStartMs);

  const record = await prisma.rateLimitWindow.upsert({
    where: { key_windowStart: { key, windowStart } },
    create: { key, windowStart, count: 1 },
    update: { count: { increment: 1 } },
    select: { count: true },
  });

  if (record.count > limit) {
    const retryAfterMs = Math.max(0, windowMs - (nowMs - windowStartMs));
    const retryAfterSec = Math.max(1, Math.ceil(retryAfterMs / 1000));
    throw new RateLimitError("Too many requests", retryAfterSec);
  }

  // Best-effort cleanup to prevent unbounded growth.
  // Keep last 6 windows.
  const keepAfter = new Date(nowMs - windowMs * 6);
  prisma.rateLimitWindow
    .deleteMany({
      where: {
        key,
        windowStart: { lt: keepAfter },
      },
    })
    .catch(() => {
      /* ignore */
    });
}

type Bucket = {
  count: number;
  resetAtMs: number;
};

const buckets = new Map<string, Bucket>();

export function rateLimitOrThrow(key: string, opts: { limit: number; windowMs: number }) {
  const now = Date.now();
  const b = buckets.get(key);

  if (!b || b.resetAtMs <= now) {
    buckets.set(key, { count: 1, resetAtMs: now + opts.windowMs });
    return;
  }

  b.count += 1;
  if (b.count > opts.limit) {
    const retryAfterSec = Math.ceil((b.resetAtMs - now) / 1000);
    const err = new Error("Too many requests");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (err as any).retryAfterSec = retryAfterSec;
    throw err;
  }
}

export function getClientIp(req: Request): string {
  // Best-effort for local MVP.
  const xff = req.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0]!.trim();
  return "unknown";
}

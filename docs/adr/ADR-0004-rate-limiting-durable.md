# ADR-0004: Durable rate limiting (SQLite-first)

- **Status:** Accepted
- **Date:** 2026-02-08

## Context

FleetFuel MVP currently uses an **in-memory** rate limiter for sensitive endpoints (e.g. signup/login). This is:
- not durable (lost on restart / laptop sleep / SIGKILL)
- not consistent across multiple processes

Constraints:
- **0€/month** ongoing cost
- **Local-first** MVP (single machine, SQLite)
- Prefer minimal new dependencies and operational overhead

## Decision

Implement **durable rate limiting backed by SQLite (Prisma)**.

- Store counter state in a DB table keyed by `(key, windowStart)`.
- Use a **fixed-window** algorithm (simple + predictable).
- Apply limits at minimum to:
  - `POST /api/auth/signup`
  - `POST /api/auth/login`
- Keys to rate limit:
  - per-IP: `signup:ip:<ip>`, `login:ip:<ip>`
  - per-identity: `signup:emailNorm:<emailNorm>`, `login:emailNorm:<emailNorm>`
- Preserve current behavior:
  - respond with **429**
  - include **Retry-After** seconds

Provide a cleanup mechanism (best-effort): delete windows older than N minutes/hours.

## Options considered

### Option A — Redis-based limiter (token bucket / sliding window)
**Pros**
- Best practice for distributed deployments
- Great performance

**Cons**
- Operational overhead + breaks 0€/month constraint for hosted Redis
- Not needed for single-machine local-first MVP

### Option B — SQLite durable limiter (fixed window)
**Pros**
- Zero additional services
- Durable across restarts
- Fits local-first architecture

**Cons**
- Slight DB overhead
- Needs periodic cleanup

### Option C — Keep in-memory
**Pros**
- Simple

**Cons**
- Not durable; weakest security posture

## Consequences

- Adds a small DB table + migration.
- Rate limiting becomes consistent across server restarts.
- We can later migrate to Redis by swapping the store implementation behind a shared interface.

## Implementation sketch

- Add `RateLimitWindow` model (or similar):
  - `key: string`
  - `windowStart: datetime`
  - `count: int`
  - indexes on `(key, windowStart)`
  - unique constraint on `(key, windowStart)`
- API:
  - `rateLimitOrThrow(key, { limit, windowMs })` now uses an upsert in a transaction.
  - calculate `retryAfterSec = windowMs - (now - windowStart)`.

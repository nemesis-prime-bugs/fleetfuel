# FleetFuel — Deployment (outside access)

Stand: 2026-02-09 (UTC)

Goal: make FleetFuel available when you’re outside.

## Reality constraints
- **Vercel serverless cannot reliably use a local SQLite file** (`file:./dev.db`).
- Vercel filesystem is **ephemeral**, so local receipt storage (`./data/receipts`) will not persist.

Therefore, for real “outside access” we need:
1) a hosted DB (free tier), and
2) hosted receipt storage (free tier) *or* temporarily disable receipts in cloud.

---

## Option A (recommended): Vercel + Supabase (Postgres + Storage)
0€/mo on free tiers (with usage limits).

### A1) Create Supabase project
- Create a new Supabase project.
- Get:
  - Postgres connection string → set as `DATABASE_URL` in Vercel.
  - Storage bucket (e.g., `receipts`).

### A2) Vercel setup
- Import GitHub repo into Vercel.
- Root directory: `apps/web`
- Build command: `pnpm build`
- Install command: `pnpm install`
- Output: Next.js default

### A3) Environment variables (Vercel)
Required:
- `DATABASE_URL` (Supabase Postgres)

Rate limit knobs (optional):
- `RATE_LIMIT_SIGNUP_IP_PER_MIN`
- `RATE_LIMIT_SIGNUP_EMAIL_PER_MIN`
- `RATE_LIMIT_LOGIN_IP_PER_MIN`
- `RATE_LIMIT_LOGIN_EMAIL_PER_MIN`

Receipts (when implemented):
- `RECEIPTS_BACKEND=supabase`
- `SUPABASE_URL=...`
- `SUPABASE_SERVICE_ROLE_KEY=...` *(server-only)*
- `SUPABASE_STORAGE_BUCKET=receipts`

### A4) DB migrations
We will run Prisma migrations against Supabase.

Two ways:
- Locally: `cd apps/web && pnpm prisma migrate deploy` (with `DATABASE_URL` pointing to Supabase)
- Or via CI (later)

---

## Option B (fastest today): Tunnel to your local-first instance
Keeps SQLite + local receipt storage.

- Run app on your machine.
- Expose via a secure tunnel (Cloudflare Tunnel or Tailscale).

Pros:
- Zero code changes.
- Receipts remain local.

Cons:
- Requires your machine online.

---

## What I recommend
- **Immediate outside access**: Option B (tunnel) — minimal risk, minutes.
- **Proper cloud MVP**: Option A — requires Postgres + object storage changes, but becomes fully hosted.

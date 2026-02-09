# FleetFuel — Decisions needed to start scaffolding

Stand: 2026-02-09 (UTC)

We can scaffold `apps/web` only after these are decided/approved.

## 1) ORM / migrations
Decision: **Prisma v6** (Accepted, see ADR-0010)
Reason: already implemented in repo; migrating to Drizzle is wasted motion.

## 2) SQLite driver
Decision: use Prisma’s SQLite via `DATABASE_URL="file:./dev.db"` (no separate driver decision needed).

## 3) Password hashing
Decision: `argon2@0.44.0` (native) (Accepted via current repo state).

## 4) Receipt image processing
Decision: `sharp@0.34.5` (native) (Accepted via current repo state).

## 5) Dependency allowlist
Decision: `docs/DEPENDENCY_APPROVAL.md` updated to match current repo state.

---

## Selected stack
- Next.js 16 + TS + Tailwind
- SQLite + Prisma v6
- Argon2
- Sharp

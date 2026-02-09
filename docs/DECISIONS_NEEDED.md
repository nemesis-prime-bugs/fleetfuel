# FleetFuel — Decisions needed to start scaffolding

Stand: 2026-02-09 (UTC)

We can scaffold `apps/web` only after these are decided/approved.

## 1) ORM / migrations
Options:
- **Drizzle** (ADR-0008) — good balance, light.
- Raw SQL — minimal deps, but more manual migrations.
- Prisma — heavier; more moving parts.

Recommendation: **Drizzle**.

## 2) SQLite driver
Options:
- `better-sqlite3` (native, fast, sync)
- `sqlite3` (native)

Recommendation: **prefer `better-sqlite3`** for local-first simplicity, *if native builds are acceptable*.
If we want to avoid native builds: reconsider driver choice or move DB to a pure-TS solution (usually not worth it).

## 3) Password hashing
Options:
- Argon2id (best practice) via `@node-rs/argon2` (native)
- bcrypt (acceptable) (native)

Recommendation: **Argon2id**.

## 4) Receipt image processing
Options:
- Minimal: validate magic bytes + size; JPEG EXIF strip via custom logic; PNG as-is (ADR-0009)
- Use `sharp` for re-encode/strip (native)

Recommendation: start **minimal** (no `sharp`) and add `sharp` only if correctness issues surface.

## 5) Dependency allowlist
Approve: `docs/DEPENDENCY_APPROVAL.md`.

---

## Default “ship-fast but safe” selection (if God approves)
- Next.js + TS + Tailwind
- Zod
- SQLite + Drizzle + `better-sqlite3`
- Argon2id
- Minimal receipt hardening (no `sharp` initially)

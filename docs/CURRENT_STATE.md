# FleetFuel — Current repo state (as implemented)

Stand: 2026-02-09 (UTC)

This document is a **reality snapshot** of what is already in the repository, to prevent drift between ADR/docs and the code.

## apps/web
- Next.js: `next@16.1.6`
- React 18
- TypeScript
- Tailwind CSS + tailwindcss-animate
- UI: Radix UI components + shadcn CLI present

### Auth/security deps
- Password hashing: `argon2@0.44.0` (native addon)
- Cookies: `cookie@1.0.2`

### Images
- `sharp@0.34.5` (native) present (used/planned for receipt EXIF stripping per security log)

### DB
- Prisma ORM: `prisma@6.19.2` + `@prisma/client@6.19.2`
- SQLite datasource (per SECURITY_LOG.md history)

### Test harness
- `tsx@4.21.0`
- Scripts:
  - `test:password`, `test:sessiontoken`, `test:consumption`, `test:ratelimitdurable`

## Workspace packages
- `@fleetfuel/shared` used by `apps/web`

## Security log
Authoritative record of installs and rationale: `SECURITY_LOG.md`

---

## Doc drift to resolve
Some newer docs propose Drizzle/"minimal deps"; those are **proposals** and do not match current repo state.
Action: either (A) accept current stack and update ADRs/docs accordingly, or (B) plan an intentional migration.

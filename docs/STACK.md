# FleetFuel — Stack (MVP proposal)

Stand: 2026-02-09 (UTC)

This document lists the **exact stack + dependencies** proposed for the first working scaffold.
Constraint: 0€/mo, local-first, security-conscious.

## Runtime
- Node.js (already present)
- Package manager: `pnpm` (via corepack)

## App framework
- Next.js (App Router)
- TypeScript

## Styling/UI
- Tailwind CSS
- Minimal component approach (avoid heavy UI libraries until necessary)

## Database
- SQLite (local file)

## DB access / migrations (proposal)
Option A (preferred): **Drizzle ORM** + `drizzle-kit` migrations
- Why: lightweight, TypeScript-first, works well with SQLite, fewer “magic” behaviors than Prisma.

SQLite driver (choose one):
- `better-sqlite3` (sync, fast, simplest for local) 
  - Note: native module build.
- or `sqlite3` (also native)

## Auth
- Custom email+password + DB sessions (see ADR-0006)
- Password hashing: `@node-rs/argon2` or `argon2` (needs confirmation on platform build)

## File uploads (receipts)
- Multipart upload handling in Next route handler
- Validation: allowlist JPEG/PNG; magic-byte check; size limit; EXIF strip

## Charts
- Keep MVP charts simple (server aggregates + minimal client rendering)

---

## Proposed dependency list (for approval)

### Core
- `next`, `react`, `react-dom`
- `typescript`, `@types/node`, `@types/react`, `@types/react-dom`

### Styling
- `tailwindcss`, `postcss`, `autoprefixer`

### DB
- `drizzle-orm`, `drizzle-kit`
- SQLite driver: `better-sqlite3` (or alternative)

### Security utilities
- `zod` (input validation)
- Argon2 library (TBD: `@node-rs/argon2` vs `argon2`)

### Receipt hardening utilities
- EXIF stripping: `exiftool-vendored` (heavy) OR implement JPEG EXIF segment removal ourselves.
  - Recommendation for 0-cost MVP: implement basic EXIF strip for JPEG + re-encode PNG via `sharp` (but `sharp` is native).

---

## Decisions required
1) ORM choice: Drizzle vs Prisma vs raw SQL
2) SQLite driver: better-sqlite3 vs sqlite3
3) Image processing approach: native deps (sharp/exiftool) vs minimal custom EXIF strip + store-as-is for PNG

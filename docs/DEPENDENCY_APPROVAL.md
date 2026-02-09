# FleetFuel — Dependency approval (MVP)

Stand: 2026-02-09 (UTC)

Constraint: no unreviewed downloads/abstractions. This file is the **explicit allowlist proposal** for the first scaffold.

## Approval rules
For each dependency:
- Purpose is clear and necessary for MVP.
- Avoid native modules unless they save significant time and risk is manageable.
- Prefer small, well-maintained packages.

---

## Proposed allowlist (Phase 1 scaffold)

### Framework
- `next` — web framework
- `react`, `react-dom` — UI runtime

### TypeScript
- `typescript`
- `@types/node`, `@types/react`, `@types/react-dom`

### Styling
- `tailwindcss`
- `postcss`
- `autoprefixer`

### Validation
- `zod` — input validation + shared schemas

### Lint/format (optional but recommended)
- `eslint`, `eslint-config-next`
- `prettier`

---

## Deferred (needs explicit decision)

### Database + migrations
Option A: Drizzle
- `drizzle-orm`
- `drizzle-kit`
- SQLite driver: `better-sqlite3` (native) OR alternative

Option B: Raw SQL
- SQLite driver only

### Auth hashing
- Argon2 implementation (likely native): `@node-rs/argon2` OR `argon2`
- Alternative: `bcrypt` (native)

### Receipt EXIF stripping / image processing
- Avoid heavy/native until required.
- If needed:
  - `sharp` (native)
  - `exiftool-vendored` (large)

---

## Notes
- Local-first MVP can accept storing PNG as-is and stripping EXIF for JPEG via minimal custom logic if we want to avoid native deps.
- Once this allowlist is approved, we can scaffold `apps/web` without improvisation.

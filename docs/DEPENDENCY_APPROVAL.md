# FleetFuel — Dependency approval (MVP)

Stand: 2026-02-09 (UTC)

Constraint: no unreviewed downloads/abstractions. This file is the **explicit allowlist** for the MVP scaffold.

Source of truth for what is already installed: `SECURITY_LOG.md` + `docs/CURRENT_STATE.md`.

## Approval rules
For each dependency:
- Purpose is clear and necessary for MVP.
- Native modules are acceptable when they materially reduce security/complexity risk (argon2, sharp).
- Prefer pinned versions and committed lockfile.

---

## Approved (apps/web)

### Framework
- `next@16.1.6`
- `react@18`, `react-dom@18`

### TypeScript
- `typescript`
- `@types/node`, `@types/react`, `@types/react-dom`

### Styling/UI
- `tailwindcss`, `postcss`, `autoprefixer`
- Radix UI packages currently in repo (used for UI primitives)
- `clsx`, `tailwind-merge`, `class-variance-authority`

### Database / ORM
- `prisma@6.19.2`
- `@prisma/client@6.19.2`

### Auth/security
- `argon2@0.44.0` (native) — password hashing
- `cookie@1.0.2` — cookie parsing/serialization

### Receipt processing
- `sharp@0.34.5` (native) — safe re-encode / metadata stripping

### Dev / tooling
- `eslint`, `eslint-config-next`, `@next/eslint-plugin-next`
- `tsx@4.21.0`

---

## Explicitly not approved (for now)
- Additional auth frameworks/suites (NextAuth/Auth.js, Clerk, etc.)
- Additional ORMs/migration systems (Drizzle) unless we intentionally migrate
- Heavy image/OCR tooling

---

## Notes
- Any new dependency must be recorded in `SECURITY_LOG.md` before install.

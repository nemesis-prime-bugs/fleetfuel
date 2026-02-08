# SECURITY_LOG — FleetFuel

Everything that installs/downloads dependencies, runs external scripts, requires elevated privileges, or changes system configuration must be recorded here and approved by **Itachi (Security Lead)**.

Format:
- Date/time (UTC)
- Change description
- Exact commands
- Source/origin (repo/URL/package manager)
- Approval (Itachi + user if needed)
- Notes/rollback

## Entries

### 2026-02-08 (UTC) — Mobile local persistence dependencies (SQLite)
- Operator/machine: nemesis-prime@NemesisPrimeBot
- Repo: FleetFuel (`projects/fleetfuel`)
- Intent: enable mobile local-first persistence (SQLite) for MOB-4.
- Registry: https://registry.npmjs.org/
- Commands:
  - `cd apps/mobile`
  - `corepack pnpm@10.6.1 add @capacitor-community/sqlite@7.0.0 jeep-sqlite@2.8.0`
  - `corepack pnpm@10.6.1 add -D uuid@11.1.0 @types/uuid@10.0.0`
- Notes:
  - Capacitor community plugin; used for on-device storage only.
  - uuid is used for client-side IDs in local mode.

### 2026-02-08 (UTC) — Mobile local receipt filesystem dependency
- Operator/machine: nemesis-prime@NemesisPrimeBot
- Repo: FleetFuel (`projects/fleetfuel`)
- Intent: mobile local receipts storage (filesystem) for MOB-5.
- Registry: https://registry.npmjs.org/
- Commands:
  - `cd apps/mobile`
  - `corepack pnpm@10.6.1 add @capacitor/filesystem@7.1.4`
- Notes:
  - Used to store receipt images locally on-device.


### 2026-02-07 (UTC) — Add Prisma (DB ORM) for local SQLite persistence
- Operator/machine: nemesis-prime@NemesisPrimeBot
- Repo: FleetFuel (`projects/fleetfuel`)
- Intent: add DB persistence for auth + MVP entities (local-first).
- Toolchain:
  - node v22.22.0
  - pnpm 9.15.4 (corepack)
  - registry: https://registry.npmjs.org/
- Commands:
  - `cd apps/web`
  - `corepack pnpm add prisma@7.3.0 @prisma/client@7.3.0`
  - `corepack pnpm dlx prisma init --datasource-provider sqlite`

### 2026-02-07 (UTC) — Add argon2 for password hashing (native addon)
- Operator/machine: nemesis-prime@NemesisPrimeBot
- Intent: password hashing for email+password auth.
- Registry: https://registry.npmjs.org/
- Command:
  - `cd apps/web`
  - `corepack pnpm add argon2@0.44.0`
- Notes:
  - Native addon; install ran `node-gyp-build` (expected for argon2).

### 2026-02-08 (UTC) — Add sharp for receipt EXIF stripping
- Intent: re-encode uploaded JPEG/PNG to strip EXIF metadata (privacy hardening).
- Command:
  - `cd apps/web`
  - `corepack pnpm add sharp@0.34.5`
- Notes: native dependency; install scripts expected.

### 2026-02-07 (UTC) — Downgrade Prisma to v6 for stable local SQLite sessions
- Reason: Prisma v7 client constructor requires adapter/accelerate configuration; Prisma v6 supports classic DATABASE_URL sqlite without adapters.
- Commands:
  - `cd apps/web`
  - `corepack pnpm remove @prisma/adapter-better-sqlite3 better-sqlite3 @types/better-sqlite3`
  - `corepack pnpm add prisma@6.19.2 @prisma/client@6.19.2`
  - Update `prisma/schema.prisma` datasource to include `url = env("DATABASE_URL")`
  - `corepack pnpm exec prisma generate`
- Notes:
  - Removed better-sqlite3 native addon.

### 2026-02-07 (UTC) — Add tsx for TypeScript script execution (test harness)
- Intent: run a minimal password hash/verify self-test without adding a heavy test framework yet.
- Registry: https://registry.npmjs.org/
- Command:
  - `cd apps/web`
  - `corepack pnpm add -D tsx@4.21.0`
- Notes: install ran `esbuild` postinstall (expected dependency of tsx).
- Notes: Prisma install ran lifecycle scripts (`@prisma/engines` postinstall, `prisma` preinstall) as expected.
- Outcome:
  - Prisma initialized (`prisma/`, `prisma.config.ts`, `.env`).
  - Initial migration applied to local SQLite (`dev.db`) using `prisma migrate dev --name init`.
  - `.env` and `*.db` are gitignored.

### 2026-02-06 (UTC) — Scaffold Next.js app (dependency install)
- Operator/machine: nemesis-prime@NemesisPrimeBot
- Repo: FleetFuel (`projects/fleetfuel`)
- Intent: Create Next.js + pnpm toolchain scaffold under `apps/web`.
- Toolchain (pre-run):
  - `node --version`: v22.22.0
  - `corepack --version`: 0.34.0
  - Registry: expected default `https://registry.npmjs.org/`
- Commands (approved by Itachi with pinning):
  - Attempted `corepack enable` but it requires writing to `/usr/bin` (no sudo in this runtime).
  - Using pinned ephemeral runner instead:
    - `npx -y pnpm@9.15.4 create next-app@14.2.19 apps/web --ts --eslint --app --src-dir --import-alias "@/*" --no-tailwind --no-turbopack`
- Policy assertions:
  - Versions pinned (pnpm + next).
  - No migrations/seeders will be executed.
  - Lockfile will be committed.
- Notes: lifecycle scripts may run during install; investigate anomalies.
- Outcome:
  - Scaffold succeeded under `apps/web`.
  - Warnings observed: Next scaffold version flagged as having a security vulnerability → follow-up upgrade required.

### 2026-02-06 (UTC) — Upgrade Next.js to non-vulnerable version
- Reason: scaffold installed `next@14.2.19` which emitted a security advisory warning.
- Compatibility check (Itachi-required): `next@16.1.6` peer deps allow React 18.2+.
- Commands:
  - `cd apps/web`
  - `corepack pnpm add next@16.1.6 eslint-config-next@16.1.6`
  - `corepack pnpm add -D eslint@9.39.2` (to satisfy eslint-config-next peer)
  - `corepack pnpm install`
  - `corepack pnpm audit` (best-effort)
- Notes: Next 16 pulled `sharp` which runs an install script (expected for image optimization). Logged for awareness.


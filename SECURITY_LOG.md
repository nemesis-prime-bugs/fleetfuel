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


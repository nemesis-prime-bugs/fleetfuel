# ADR-0005: Mobile-first architecture (web server-only, mobile local/server modes)

- **Status:** Accepted
- **Date:** 2026-02-08

## Context

FleetFuel started as a local-first Next.js web app with server-side storage (SQLite + local disk receipts). The product endgoal is:

- **Mobile app is primary** (Android/iOS)
- On mobile, user can choose **storage mode**:
  - **Local-first**: data + receipts stored on the device
  - **Server mode**: data stored on backend (and receipts stored on backend if persistent storage is available)
- **Web app is hosted and server-only**
- **0€/month** constraint until revenue

Also:
- Vercel/serverless cannot reliably store receipt files on disk (ephemeral FS)

## Decision

Adopt a split architecture:

### Web
- Keep **apps/web** as a hosted server-backed app (Next.js + Prisma)
- Data stored on server DB
- Receipts for hosted web are **disabled** until we can fund persistent file storage (object storage or VPS)

### Mobile
- Build **apps/mobile** using **Capacitor + React** (single codebase mindset, store-ready)
- Implement two storage modes:
  1) **Local-only (default)**
     - SQLite on device
     - receipts stored in device filesystem
     - offline-first
  2) **Server mode (optional)**
     - uses backend APIs
     - receipts depend on backend persistent storage

### Shared domain
- Create `packages/shared` with types/validators and a repository interface layer.
- UI should depend on repository interfaces, not directly on `/api/*`.

## Options considered

1) **Host everything on web (server-only) + PWA**
- Pros: easiest deployment
- Cons: cannot meet requirement “save on phone storage” reliably (esp. receipts). PWA storage varies.

2) **React Native app + separate web**
- Pros: best native UX
- Cons: large rewrite and two UI stacks

3) **Capacitor app reusing web UI** (chosen)
- Pros: fastest path to stores; reuse React UI; can do true local storage via plugins
- Cons: some platform quirks; must design storage abstraction

## Consequences

- Adds monorepo structure changes (apps/mobile, packages/shared)
- Requires defining and maintaining repository interfaces
- Phase 1 can use a laptop server (with VPN) for server-mode testing at 0€
- Later we can add subscription-funded storage/sync

## Implementation notes

- Local receipts: store stripped/compressed images on device; keep DB records pointing to file paths.
- Server mode auth: decide on token-based auth suitable for mobile (avoid relying on browser cookies).

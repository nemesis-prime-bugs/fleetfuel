# FleetFuel

Fuel and trip logging for private drivers and small fleets.

## MVP (agreed)
- Email + password login
- Account type: personal or company
- Vehicles: add/manage
- Log fill-ups: date, odometer, liters, total cost, full-tank flag, optional station/notes
- Log trips: date/time, distance, optional driver ("someone else drove")
- Monthly charts: fuel consumption + money spent
- Receipts: attach photo(s)
  - **Phase 0:** store locally on the server (no cloud storage yet)

## 0€ / month constraint
We will keep recurring costs at **0€** until revenue.

MVP is **local-first** (runs on the laptop) so receipt photos can be stored on local disk. Later we can move receipts to object storage and deploy on a free tier (e.g., Vercel).

## Key docs (don’t skip these)
- **Projekt Antrag / Auftrag:** `docs/PROJEKT_ANTRAG.md`
- Product brief: `docs/PRODUCT_BRIEF.md`
- ADRs: `docs/adr/`
- Security log: `SECURITY_LOG.md`
- Tasks/backlog: `TASKS.md`

## Repo map (planned)
- `apps/web` — Next.js (UI + API)
- `packages/db` — schema/migrations
- `packages/shared` — shared types/validation
- `docs/adr` — architecture decisions

## Status
Scaffolding + ADRs in progress.

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
We will use free tiers (e.g., Vercel) where possible and keep recurring costs at 0€ until revenue.

## Repo map (planned)
- `apps/web` — Next.js (UI + API)
- `packages/db` — schema/migrations
- `packages/shared` — shared types/validation
- `docs/adr` — architecture decisions

## Status
Scaffolding + ADRs in progress.

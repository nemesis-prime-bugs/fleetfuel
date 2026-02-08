# FleetFuel — MVP Acceptance Checklist

This is a quick manual checklist to validate the MVP end-to-end.

## Setup

- [ ] `cd apps/web && corepack pnpm dev --port 3000`
- [ ] Open http://localhost:3000

## Auth

- [ ] Sign up at `/signup` with a new email + password
- [ ] After signup, you land in `/app` (authenticated)
- [ ] Logout works (button on `/app`) and you end up at `/login`
- [ ] Login at `/login` works and you can access `/app`
- [ ] Unauthenticated access to protected areas is blocked (try visiting `/app` in a private window)

## Vehicles

- [ ] Go to `/vehicles`
- [ ] Create a vehicle
- [ ] Edit vehicle name
- [ ] Delete vehicle

## Fill-ups

- [ ] Go to `/fillups`
- [ ] Select a vehicle
- [ ] Add a fill-up
- [ ] Edit a fill-up
- [ ] Delete a fill-up

## Receipts (local storage)

- [ ] On `/fillups` history: attach a receipt (JPEG/PNG)
- [ ] Receipt appears under the fill-up as a link
- [ ] **View** opens (inline) in a new tab
- [ ] **Download** downloads as attachment
- [ ] Upload rejects invalid files (e.g. non-JPEG/PNG)

## Drivers

- [ ] Go to `/drivers`
- [ ] Add a driver
- [ ] Rename a driver
- [ ] Delete a driver

## Trips (Tagebuch)

- [ ] Go to `/trips`
- [ ] Select a vehicle + driver
- [ ] Add trip entry with:
  - [ ] start time
  - [ ] end time
  - [ ] odometer start
  - [ ] odometer end
- [ ] Distance is derived correctly (`odoEnd - odoStart`)
- [ ] History is grouped by day and driver; per-day totals show correctly
- [ ] Edit a trip entry
- [ ] Delete a trip entry

## Reports (monthly)

- [ ] Call `GET /api/reports/monthly?vehicleId=...` (via browser or curl)
- [ ] Response returns monthly totals for spend/volume for that vehicle

## Notes / Known limitations

- Receipts are stored locally under `apps/web/data/receipts` at runtime (gitignored).
- Rate limiting is in-memory (not durable) for MVP.

# TASKS — FleetFuel

## Now
- [x] ADR-0001: monolith-first Next.js
- [x] ADR-0002: hosting approach under 0€/mo (local-first MVP)
- [x] ADR-0003: receipt storage Phase 0 (local-only)
- [x] Write Projekt Antrag / Auftrag (`docs/PROJEKT_ANTRAG.md`)
- [x] Define data model (users/accounts/vehicles/fillups/trips/receipts/drivers) → `docs/DATA_MODEL.md`
- [ ] Confirm stack details (auth/session strategy; DB; ORM; hashing; upload hardening)
- [ ] Approve dependency allowlist → `docs/DEPENDENCY_APPROVAL.md`
- [ ] Scaffold Next.js repo (`apps/web`) after allowlist approval

## MVP backlog
- [ ] Auth: signup/login/logout (email+password)
- [ ] Account type (personal/company)
- [ ] Vehicles CRUD
- [ ] Fill-ups CRUD + calculations
- [ ] Trips CRUD
- [ ] “Other driver” tracking
- [ ] Receipt upload + preview/download
- [ ] Monthly charts + CSV export
- [ ] QA: acceptance tests + regression checklist

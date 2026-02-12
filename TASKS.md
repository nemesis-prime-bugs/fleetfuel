# TASKS - FleetFuel

## Now
- [x] ADR-0001: monolith-first Next.js
- [x] ADR-0002: hosting approach under 0€/mo (local-first MVP)
- [x] ADR-0003: receipt storage Phase 0 (local-only)
- [x] Write Projekt Antrag / Auftrag (`docs/PROJEKT_ANTRAG.md`)
- [x] Define data model (users/accounts/vehicles/fillups/trips/receipts/drivers) → `docs/DATA_MODEL.md`
- [x] Confirm stack details (auth/session strategy; DB; ORM; hashing; upload hardening)
- [x] Approve dependency allowlist → `docs/DEPENDENCY_APPROVAL.md`
- [x] Scaffold Next.js repo (`apps/web`) after allowlist approval

## MVP backlog
- [x] Auth: signup/login/logout (email+password)
- [x] Account type (personal/company)
- [x] Vehicles CRUD
- [ ] Fill-ups CRUD + calculations
- [ ] Trips CRUD
- [x] "Other driver" tracking
- [ ] Receipt upload + preview/download
- [ ] Monthly charts + CSV export
- [ ] QA: acceptance tests + regression checklist

## In Progress (2026-02-12)
- Fill-ups: need [id] endpoints (GET single, DELETE, PATCH)
- Monthly charts: frontend visualization pending
- Receipts: download endpoint pending
- Export: CSV export route exists, verify completion

## ClawHub Community Strategy
- Create skill documenting Uchiha Dev Team structure
- Publish to attract contributors

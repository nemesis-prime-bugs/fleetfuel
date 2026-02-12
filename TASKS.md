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
- [x] Fill-ups CRUD + calculations (GET single added 2026-02-12)
- [x] Trips CRUD
- [x] "Other driver" tracking
- [x] Receipt upload + preview/download
- [x] Monthly charts + CSV export
- [ ] QA: acceptance tests + regression checklist

## Verification Needed (2026-02-12)
- [ ] Verify trips CRUD endpoints exist and work
- [ ] Verify receipt upload flow (frontend + backend)
- [ ] Run smoke tests
- [ ] Acceptance checklist validation

## Community Strategy
- Use notebook-style content for audience building
- Focus on FleetFuel development + shareable content

# ADR-0002: Hosting approach under 0€/mo constraint

- Status: Proposed
- Date: 2026-02-06

## Context
User wants 0€ per month ongoing cost. Free tiers are acceptable.

## Decision
**MVP runs local-first** (on the laptop) to keep receipt photo storage on local disk (Phase 0) and to ship fastest.

## Notes
- We will still keep a path open for free-tier hosting later (e.g., Vercel), but that requires changing receipt storage away from local disk.
- Default binding stays localhost for local dev.

## Open questions
- Database choice (SQLite local vs hosted DB for multi-user access).
- Future hosting target once receipts move to object storage.

# ADR-0002: Hosting approach under 0€/mo constraint

- Status: Proposed
- Date: 2026-02-06

## Context
User wants 0€ per month ongoing cost. Free tiers are acceptable.

## Decision
Target **Vercel free tier** for hosting the Next.js app.

## Notes
- If free-tier limits become an issue, we can migrate to an alternative host.
- Default binding stays localhost for local dev.

## Open questions
- Database choice (SQLite local vs hosted DB for multi-user access).

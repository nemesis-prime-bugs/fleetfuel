# ADR-0010: ORM + migrations (Prisma)

- Status: Accepted
- Date: 2026-02-09

## Context
The repository already has a working Next.js scaffold plus DB work:
- Prisma is installed and logged in `SECURITY_LOG.md`
- Prisma v7 issues were discovered; Prisma v6 was chosen for classic SQLite usage

Given the 0€/mo, local-first constraint, the highest-leverage path is to **standardize on what is already integrated** rather than migrate toolchains.

## Decision
Use **Prisma v6** for:
- SQLite schema definition
- migrations (`prisma migrate`)
- type-safe DB client

## Rationale
- Already installed and exercised in the repo.
- Minimizes churn and risk.
- Good developer velocity for MVP.

## Consequences
Pros:
- Fast iteration; strong typing.
- Clear migrations.

Cons:
- Heavier dependency set than Drizzle.
- Future Postgres migration requires careful type strategy (money, decimals).

## Notes
- This ADR **supersedes ADR-0008** (Drizzle proposal).

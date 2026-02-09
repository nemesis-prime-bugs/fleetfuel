# ADR-0008: ORM + migrations

- Status: Proposed
- Date: 2026-02-09

## Context
We need a safe and maintainable way to define schema, run migrations, and query SQLite for the local-first MVP.
Constraints:
- 0€/mo
- Minimize dependency risk
- Keep schema evolvable towards Postgres later

## Decision
Use **Drizzle ORM** with **drizzle-kit migrations**.

## Rationale
- Lightweight, TypeScript-first.
- Explicit SQL-like control; fewer hidden runtime behaviors.
- Supports SQLite now; path to Postgres later.

## Consequences
Pros:
- Strong types; clear migration artifacts.
- Works well in monolith Next.js.

Cons:
- Team must be comfortable with SQL-ish patterns.
- Some ergonomics less “batteries included” than Prisma.

## Notes
- SQLite driver still to be chosen (`better-sqlite3` vs `sqlite3`).
- Keep UUID handling consistent across DBs.

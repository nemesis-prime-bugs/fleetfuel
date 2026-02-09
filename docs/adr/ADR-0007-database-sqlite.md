# ADR-0007: Database choice for local-first MVP

- Status: Proposed
- Date: 2026-02-09

## Context
We need persistence for users, vehicles, fill-ups, trips, drivers, and receipts metadata.
Constraints:
- 0€/mo
- Local-first (ADR-0002)
- Keep ops minimal

## Decision
Use **SQLite** as the MVP database.

## Rationale
- Zero-cost, zero-ops.
- Perfect fit for single-machine local-first mode.
- Easy backups (single file).
- Enables fast iteration.

## Consequences
Pros:
- Minimal infrastructure.
- Fast to ship.

Cons:
- Not suitable for serverless hosting with ephemeral filesystem.
- Concurrency limitations vs Postgres.

## Future path
When moving beyond local-first:
- Switch to Postgres (hosted free tier) and move receipts to object storage.
- Keep schema close to Postgres-friendly types (UUIDs, timestamps, numeric strategy).

# ADR-0001: Monolith-first (modular) using a single web app + backend

- Status: Proposed
- Date: 2026-02-06

## Context
We need to ship an MVP quickly under a 0€/mo constraint with a small team and a single laptop dev environment.

## Decision
Build a **monolith-first** application with clear internal modules, using a single web app that also hosts the backend API.

## Rationale
- Minimizes operational overhead and integration complexity.
- Faster iteration for MVP.
- Still allows future extraction of services once domain grows.

## Consequences
- Backend and frontend share deployment lifecycle.
- Must keep code modular to avoid a “big ball of mud”.

## Modules
- Auth/Identity
- Accounts (personal/company)
- Vehicles
- Trips
- Fill-ups
- Receipts
- Reporting/Export

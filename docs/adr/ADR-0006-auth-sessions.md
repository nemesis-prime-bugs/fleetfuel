# ADR-0006: Auth + session strategy (local-first MVP)

- Status: Accepted
- Date: 2026-02-09

## Context
FleetFuel MVP needs email+password signup/login/logout and protected app routes.
Constraints:
- 0€/mo ongoing cost
- Local-first MVP (ADR-0002)
- Minimize dependencies and security risk (no unnecessary auth SaaS)

## Decision
Implement **custom email+password auth** with **DB-backed sessions**:
- Users table stores `email` + `password_hash`.
- Password hashing: **Argon2id** (preferred) or bcrypt if Argon2 tooling becomes problematic.
- Sessions stored in DB (`sessions` table):
  - `id` (random 32+ bytes, base64url)
  - `user_id`
  - `expires_at`
  - `created_at`
- Session conveyed via **HttpOnly, Secure (in prod), SameSite=Lax** cookie.
- Protected routes check session cookie → DB lookup → user.

## Consequences
Pros:
- No external service.
- Simple mental model.
- Works offline/local.

Cons:
- We own security correctness (rate limiting, password policy, session invalidation).
- Future multi-device / OAuth features require extension.

## Implementation notes (MVP)
- Add minimal auth endpoints/actions: `/signup`, `/login`, `/logout`.
- Enforce basic password policy (length >= 10; block common passwords later).
- Rate-limit login attempts (tie into ADR-0004) and log auth events.
- Ensure constant-time compare for tokens and normalize emails to lowercase.

## Out of scope
- Email verification
- Password reset
- OAuth providers

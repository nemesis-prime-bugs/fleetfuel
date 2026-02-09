# FleetFuel — Data model (draft)

Stand: 2026-02-09 (UTC)

Goal: simple MVP schema that supports auth, multi-vehicle tracking, fill-ups (with receipts), trips (with optional driver), and monthly reports.

## Principles
- Multi-tenant by **account** (personal/company). All business data belongs to an account.
- A user can belong to one or more accounts later; MVP can start as 1:1 (user owns a single account) without breaking schema.
- Avoid derived state in DB where easy to compute (e.g., trip distance), but allow caching later.
- Store money as **integer minor units** (e.g., cents) + currency.
- Odometer/distance units must be explicit (km/mi) to avoid silent errors.

---

## Entities

### User
Auth identity.
- `id` (uuid)
- `email` (unique, lowercased)
- `password_hash`
- `created_at`, `updated_at`

Optional later:
- `email_verified_at`
- `last_login_at`

### Account
Business container (personal/company).
- `id` (uuid)
- `type` (`personal` | `company`)
- `name` (display)
- `owner_user_id` (fk → User.id)  *(MVP: single-owner)*
- `created_at`, `updated_at`

Optional later:
- membership table for multi-user accounts.

### Vehicle
A vehicle belonging to an account.
- `id` (uuid)
- `account_id` (fk → Account.id)
- `name` (e.g., “Golf 7”)
- `make` (optional)
- `model` (optional)
- `year` (optional)
- `license_plate` (optional)
- `odometer_unit` (`km` | `mi`) *(default `km`)*
- `distance_unit` (`km` | `mi`) *(usually same as odometer)*
- `fuel_unit` (`l` | `gal`) *(default `l`)*
- `created_at`, `updated_at`

Indexes:
- `(account_id, name)`

### Driver
A named driver under an account (for “other driver” tracking).
- `id` (uuid)
- `account_id` (fk → Account.id)
- `name`
- `created_at`, `updated_at`

Notes:
- MVP can have an implicit driver = account owner; keep entity anyway because acceptance checklist includes `/drivers`.

### FillUp
Fuel purchase entry.
- `id` (uuid)
- `account_id` (fk → Account.id)
- `vehicle_id` (fk → Vehicle.id)
- `at` (timestamp)
- `odometer` (decimal) *(reading at fill time)*
- `fuel_volume` (decimal) *(liters/gallons)*
- `total_cost_minor` (int) *(e.g., cents)*
- `currency` (char(3), e.g. `EUR`)
- `is_full_tank` (bool)
- `station` (optional text)
- `note` (optional text)
- `created_at`, `updated_at`

Indexes:
- `(vehicle_id, at desc)`
- `(account_id, at desc)`

### Receipt
File metadata for an uploaded receipt image.
- `id` (uuid)
- `account_id` (fk → Account.id)
- `fillup_id` (fk → FillUp.id, unique) *(1 receipt per fill-up for MVP; can relax to 1:N later)*
- `storage_key` (text) *(relative path / generated name; not user-controlled)*
- `original_filename` (text)
- `content_type` (`image/jpeg` | `image/png`)
- `size_bytes` (int)
- `sha256` (optional, for dedupe/integrity)
- `created_at`

Security constraints:
- enforce owner-only access via `account_id` checks
- never trust `original_filename` for path

### Trip
Driving log entry.
- `id` (uuid)
- `account_id` (fk → Account.id)
- `vehicle_id` (fk → Vehicle.id)
- `driver_id` (fk → Driver.id, nullable)
- `start_at` (timestamp)
- `end_at` (timestamp)
- `odo_start` (decimal)
- `odo_end` (decimal)
- `note` (optional text)
- `created_at`, `updated_at`

Derived:
- `distance = odo_end - odo_start` (computed in query/UI; optionally persisted later)

Indexes:
- `(vehicle_id, start_at desc)`
- `(driver_id, start_at desc)`

---

## Relationships (ER summary)
- User 1—1 Account (MVP)
- Account 1—N Vehicle
- Account 1—N Driver
- Vehicle 1—N FillUp
- FillUp 1—0..1 Receipt
- Vehicle 1—N Trip
- Driver 1—N Trip (optional)

---

## Reporting queries (MVP)

### Monthly totals for a vehicle
Group `FillUp` by month:
- `SUM(total_cost_minor)`
- `SUM(fuel_volume)`
- (optional) average price per unit = `SUM(cost)/SUM(volume)`

### Consumption over time (per vehicle)
Use consecutive **full-tank** fill-ups:
- sort by `at`
- for each segment between full tanks: distance = `odometer[i] - odometer[i-1]`, fuel = sum(volume between)
- consumption = `fuel / distance` (L/100km or mpg) depending on units

---

## Open questions (need decision)
1) DB: SQLite (file) vs Postgres (free tier) — impacts migrations/ORM.
2) Decimal precision strategy: use `numeric` in Postgres; in SQLite store as text/real + careful formatting.
3) Account membership model (single-user MVP vs `account_members` table now).

# FleetFuel — UI/UX research summary + action plan

Stand: 2026-02-09 (UTC)

This summary distills UI/UX best practices for logging-heavy apps (fuel/expenses/receipts) into concrete, implementable changes for FleetFuel.

## Core jobs-to-be-done
1. Log quickly (often on mobile, at a pump).
2. Verify and correct later (audit trail, missing fields).
3. Search/filter/export (date range, vehicle, driver).
4. See trends and anomalies (monthly spend, consumption, odd odometer jumps).

## Principles that matter for FleetFuel
- **Mobile-first entry**: big tap targets, minimal fields, numeric keyboards.
- **Defaults reduce friction**: remember last vehicle, currency, date=now.
- **Validation should guide, not punish**: show errors clearly; use soft warnings for anomalies.
- **Responsive lists**: cards on mobile, tables on desktop.
- **Accessibility is not optional**: labels, focus management, error text associations.

## Validation pattern (recommended)
Implement a two-layer pattern:
1) error summary at top after submit attempt
2) inline field errors next to inputs

References:
- GOV.UK validation guidance: https://design-system.service.gov.uk/patterns/validation/
- GOV.UK error summary component: https://design-system.service.gov.uk/components/error-summary/
- WCAG error identification: https://www.w3.org/WAI/WCAG22/Understanding/error-identification.html
- WCAG error suggestion: https://www.w3.org/WAI/WCAG22/Understanding/error-suggestion.html

## Tables/lists
- Use table features (sort/filter/search) on desktop.
- Avoid tables on phones; use cards + details page.

Reference (data tables behavior):
- Carbon data table usage: https://carbondesignsystem.com/components/data-table/usage/

## Dashboard (keep it simple)
- 3–5 KPIs (spend, fuel volume, consumption, transactions count, anomalies)
- “Overview first, drill down into filtered transaction list.”

Reference (classic info-vis mantra):
- Shneiderman (overview → zoom/filter → details-on-demand): https://www.cs.umd.edu/~ben/papers/Shneiderman1996eyes.pdf

## FleetFuel-specific UI changes (planned)
1) Add a unified **Transactions** view (filters: vehicle, type, date range).
2) Add an **ErrorSummary** component + inline validation for forms (vehicles, fill-ups, trips, signup/login).
3) Improve fill-up entry UX:
   - optional computed unit price
   - soft warnings for odometer regression / unusual values
4) Make all empty states actionable (“Create vehicle first”).
5) Accessibility pass:
   - labels always visible (no placeholder-only)
   - aria-describedby for hint/error
   - focus behavior for dialogs

Tracked in issue: https://github.com/nemesis-prime-bugs/fleetfuel/issues/143

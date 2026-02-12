# FleetFuel — UI/UX Research & Team Discussion

**Date:** 2026-02-12
**Participants:** Madara (Lead), Itachi (Security), Shisui (Architect), Sasuke (Frontend), Fugaku (Backend), Obito (DevOps), Izuna (QA)

---

## Competitive Analysis

### Reference Apps (studied patterns)

| App | Strengths | Weaknesses |
|-----|-----------|------------|
| **Gasbuddy** | Quick entry flow, location awareness | Cluttered ads, privacy concerns |
| **Fuelly** | Social features, consumption charts | Outdated UI, complex navigation |
| **KeepTrack (carMile)** | Clean form design, recurring reminders | Limited fleet features |
| **Fleetio** | Full fleet management, maintenance tracking | Enterprise complexity, expensive |
| **Drivvo** | Simple expense tracking, good visualizations | Limited reporting |

### Key Patterns Identified

1. **Quick Entry Form (Gasbuddy style)**
   - 3-5 fields max on initial view
   - Expandable advanced options
   - Date/time auto-populated

2. **Dashboard KPIs (Fleetio style)**
   - Spend this month (vs last month %)
   - Total fuel volume
   - Average price per liter
   - Fuel efficiency trend

3. **Consumption Visualization**
   - Bar chart: monthly fuel volume
   - Line chart: price per liter over time
   - Pie chart: fuel type distribution (for mixed fleets)

4. **List vs Card View**
   - Mobile: cards with swipe actions
   - Desktop: table with sorting/filtering

5. **Receipt Handling**
   - Camera capture flow
   - Auto-extraction (future enhancement)
   - Thumbnail preview + full view

---

## Team Discussion Notes

### Madara (Project Lead)
- Focus on **speed of data entry** — core user need
- Keep dashboard **information-dense but scannable**
- Mobile experience is primary (users log at gas stations)

### Itachi (Security)
- Receipt storage must respect privacy (EXIF stripping already done)
- Local-first MVP is acceptable, but future cloud must encrypt at rest
- No analytics/tracking without explicit consent

### Shisui (Architect)
- Web app can wrap to mobile via Capacitor (already in repo)
- Consider PWA for app-like experience without app store
- Responsive breakpoints: mobile (<640px), tablet (640-1024px), desktop (>1024px)

### Sasuke (Frontend)
- Use shadcn/ui components already installed
- Implement **error summary pattern** from GOV.UK (already in docs)
- Add skeleton loading states for better perceived performance
- Dark mode support via next-themes (already present)

### Fugaku (Backend)
- API already structured well (vehicles/:id/fillups pattern)
- Add rate limiting for upload endpoints (exists in schema)
- Consider pagination for large datasets (future)

### Obito (DevOps)
- Vercel deployment straightforward with Next.js
- Receipts storage: Vercel KV/Blob or S3-compatible for production
- Mobile: Capacitor config needs update for production build
- Environment variables for RECEIPTS_MODE control

### Izuna (QA)
- Test cases should cover:
  - Form validation (required, formats, ranges)
  - Edge cases: odometer regression, duplicate entries
  - Empty states (no vehicles, no fill-ups)
  - Accessibility: keyboard nav, screen readers
- Acceptance criteria must be binary (pass/fail)

---

## UI Quality Criteria

### GOOD ✓

| Criterion | Description | Priority |
|-----------|-------------|----------|
| **Quick Entry** | Fill-up logged in <30 seconds | P0 |
| **Clear Feedback** | Success/error messages visible | P0 |
| **Responsive** | Works on mobile + desktop | P0 |
| **Accessible** | Keyboard nav, ARIA labels | P1 |
| **Empty States** | Actionable guidance shown | P1 |
| **Loading States** | Skeletons/spinners during fetches | P2 |
| **Offline Support** | PWA can cache data locally | P2 |

### BAD ✗

| Anti-Pattern | Description | Severity |
|--------------|-------------|----------|
| **Form overwhelm** | >7 visible fields without expansion | High |
| **Silent failures** | Errors without user feedback | Critical |
| **Table overflow** | Tables breaking mobile layout | High |
| **Required fields** | Unnecessary friction (e.g., station name) | Medium |
| **No undo** | Deletions without confirmation | Medium |

---

## Implementation Priorities

### P0 — Must Have (MVP 2.0)
1. Error summary component + inline validation (docs exist)
2. Quick entry form with collapsible advanced fields
3. Vehicle selector in dashboard sidebar
4. Empty state components for all lists
5. Vercel deployment configuration

### P1 — Should Have
1. Pagination for fill-ups/trips lists
2. Loading skeletons
3. Accessibility audit + fixes
4. PWA manifest + service worker
5. Mobile app build via Capacitor

### P2 — Nice to Have
1. Dark mode (next-themes already present)
2. Charts library (recharts or chart.js)
3. Notification reminders
4. Data export (JSON/CSV — CSV already exists)
5. Multi-language support

---

## References

- GOV.UK Design System: https://design-system.service.gov.uk/
- Shadcn/ui components: https://ui.shadcn.com/
- Capacitor mobile wrapper: https://capacitorjs.com/
- PWA checklist: https://web.dev/pwa-checklist/

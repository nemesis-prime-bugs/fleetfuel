# TASKS - FleetFuel

## Research & Planning (Completed 2026-02-12)
- [x] UI/UX research documented in `docs/UI_RESEARCH_2026-02-12.md`
- [x] Team discussion on UI patterns, deployment, mobile
- [x] Quality criteria defined (GOOD/BAD tables)
- [x] Deployment plan documented in `DEPLOYMENT.md`
- [x] Deployment checklist created

---

## MVP Completion (~85%)
- [x] Auth: signup/login/logout
- [x] Account type (personal/company)
- [x] Vehicles CRUD
- [x] Fill-ups CRUD
- [x] Trips CRUD
- [x] Drivers tracking
- [x] Receipt upload/download
- [x] Monthly charts
- [x] CSV export

---

## MVP QA Tasks
- [ ] Run smoke tests: `cd apps/web && pnpm smoke:api`
- [ ] Acceptance checklist validation: `docs/ACCEPTANCE_CHECKLIST.md`
- [ ] Test all CRUD flows manually
- [ ] Document edge cases found

---

## UI Improvements (MVP 2.0)

### P0 — Must Have
- [ ] **Error Summary Component**
  - Create `components/error-summary.tsx`
  - Integrate into: signup, login, vehicles, fill-ups, trips forms
  - Reference: `docs/UX_UI_RESEARCH_SUMMARY.md` validation pattern

- [ ] **Quick Entry Form (Fill-ups)**
  - Collapse advanced fields (station, notes) by default
  - Show 3-5 fields initially
  - Expand button for additional fields
  - Auto-fill date = now

- [ ] **Quick Entry Form (Trips)**
  - Similar collapsible pattern
  - Auto-fill start/end times

- [ ] **Vehicle Selector in Dashboard**
  - Add dropdown to quickly switch vehicles
  - Persist selection in localStorage

- [ ] **Empty State Components**
  - Create reusable empty state for:
    - `/vehicles` (when no vehicles)
    - `/fillups` (when no fill-ups for vehicle)
    - `/trips` (when no trips for vehicle)

### P1 — Should Have
- [ ] **Loading Skeletons**
  - Add to dashboard KPIs
  - Add to lists (fill-ups, trips)
  - Use `components/ui/skeleton.tsx` already present

- [ ] **Pagination**
  - Add cursor-based pagination to fill-ups list
  - Add to trips list

- [ ] **Accessibility Audit**
  - Add `aria-label` to all buttons without text
  - Add `aria-describedby` for hints/errors
  - Test keyboard navigation

- [ ] **Form Validation**
  - Add inline field errors (per GOV.UK pattern)
  - Add odometer regression warning
  - Add unusual price warning

---

## Deployment Tasks (Obito)

### Vercel Web Deployment
- [ ] **Vercel CLI Setup**
  - `npm i -g vercel`
  - `vercel login`

- [ ] **Project Configuration**
  - Import GitHub repo: nemesis-prime-bugs/fleetfuel
  - Set root directory: `apps/web`
  - Set build command: `pnpm prisma:generate:sqlite && next build`
  - Set output directory: `.next`

- [ ] **Environment Variables**
  - `DATABASE_URL`: `file:./prisma/dev.db` (SQLite)
  - `RECEIPTS_MODE`: `disabled`
  - `NEXT_PUBLIC_APP_URL`: production URL

- [ ] **Production Verification**
  - Test signup/login flow
  - Test protected routes
  - Test mobile responsiveness

### Mobile App (Capacitor)
- [ ] **Capacitor Config Update**
  - Update `capacitor.config.ts` webDir to `../web/.next/static/html`

- [ ] **Android Build**
  - `cd apps/mobile && npx cap sync`
  - `npx cap open android`
  - Build and test APK

- [ ] **iOS Build** (macOS only)
  - `cd apps/mobile && npx cap sync`
  - `npx cap open ios`
  - Build and test on simulator

---

## Quality Gates (Izuna)

### Before Any Deploy
- [ ] `pnpm build` succeeds
- [ ] `pnpm tsc --noEmit` passes
- [ ] `pnpm lint` passes
- [ ] No console errors in browser
- [ ] All forms have validation feedback

### Acceptance Criteria
- [ ] User can sign up and login
- [ ] User can create/edit/delete vehicle
- [ ] User can log fill-up in <30 seconds
- [ ] User can attach receipt to fill-up
- [ ] User can view monthly charts
- [ ] User can export data as CSV
- [ ] Mobile layout doesn't break

---

## Community Content (Optional)

### Moltbook Posts
- [ ] **"Building a Local-First Fuel Tracker with Next.js"**
  - Tech stack overview
  - Auth approach (argon2)
  - Local SQLite benefits

- [ ] **"UI Patterns for Fast Data Entry"**
  - Quick entry form design
  - Validation feedback patterns
  - Mobile-first considerations

- [ ] **"Deploying Next.js to Vercel with SQLite"**
  - Configuration steps
  - Environment variables
  - Limitations and workarounds

---

## Long-Term Backlog

- [ ] Charts library integration (recharts or chart.js)
- [ ] Dark mode (next-themes already present)
- [ ] Push notifications for maintenance reminders
- [ ] Multi-language support (i18n)
- [ ] Cloud database (PostgreSQL via Supabase/Neon)
- [ ] Receipt storage (Vercel Blob or S3)
- [ ] Fleet management features (multiple users per account)

---
title: "Building a Local-First Fuel Tracker with Next.js — Zero Cost, Maximum Privacy"
date: "2026-02-12"
tags: ["nextjs", "local-first", "privacy", "sqlite", "fleet-management"]
description: "How we built FleetFuel with zero recurring costs and data that never leaves your device."
---

# Building a Local-First Fuel Tracker with Next.js

*Why cloud dependency is optional, not mandatory.*

---

## The Problem

Most fuel tracking apps demand:
- Monthly subscriptions
- Cloud accounts
- Your driving data on someone else's servers
- Constant internet connection

We needed something different.

## Our Solution: Local-First Architecture

FleetFuel runs entirely on your device. Your data stays yours.

### Stack Decisions

| Component | Choice | Rationale |
|-----------|--------|-----------|
| Database | SQLite | Single file, no server, portable |
| ORM | Prisma v6 | Type-safe, works offline |
| Auth | Custom + Argon2 | Strong hashing, DB sessions |
| UI | Tailwind + shadcn/ui | Fast, accessible, no bloat |
| Deployment | Vercel (free tier) | Zero cost until revenue |

### Key Benefits

1. **Zero Cost**: No database servers, no hosting fees
2. **Privacy First**: Data never leaves your device
3. **Speed**: Instant CRUD operations, no network latency
4. **Portability**: Copy the SQLite file, copy your data

### Privacy Hardening

- Passwords hashed with Argon2
- Receipt EXIF data stripped before storage
- Sessions stored in database
- No analytics or tracking

## Architecture

```
fleetfuel/
├── apps/web/          # Next.js application
│   ├── src/app/      # App Router + API
│   ├── prisma/        # Schema + migrations
│   └── components/   # shadcn/ui components
├── apps/mobile/       # Capacitor wrapper
└── packages/shared/   # Shared types
```

### Database Schema

```prisma
model Vehicle {
  id        String   @id @default(cuid())
  userId    String
  name      String
  fuelType  FuelType
  unitSystem UnitSystem @default(METRIC)
  fillUps   FillUp[]
  trips     Trip[]
}

model FillUp {
  id          String   @id @default(cuid())
  vehicleId   String
  occurredAt  DateTime
  odometer    Int
  fuelAmount  Float
  totalCost   Int      // cents
  receipts    Receipt[]
}
```

## Deployment Options

### Vercel (Free Tier)

```bash
# Environment variables
DATABASE_URL=file:./prisma/dev.db
RECEIPTS_MODE=disabled
```

### Mobile (Capacitor)

```bash
cd apps/mobile
npx cap sync
npx cap open android
```

## Lessons Learned

1. **Prisma v6 vs v7**: v6 has simpler SQLite support
2. **Native dependencies**: Argon2 and Sharp need build tools
3. **Session storage**: Database sessions work for single-instance
4. **Receipts**: Local storage MVP, cloud for production

## What's Next

- Vercel deployment (this week)
- Mobile app beta
- Charts and visualizations
- Export features

---

*FleetFuel: Privacy-first fuel tracking.*

*Built with Next.js, Prisma, and local-first principles.*

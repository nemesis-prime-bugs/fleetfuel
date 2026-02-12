---
title: "Building a Local-First Fuel Tracker with Next.js"
date: "2026-02-12"
tags: ["nextjs", "local-first", "sqlite", "fleet-management"]
description: "How we built FleetFuel with zero recurring costs and privacy-first architecture."
---

# Building a Local-First Fuel Tracker with Next.js

*By Madara Uchiha — Project Lead*

---

## The Problem

Fleet management apps usually come with:
- Subscription fees
- Cloud dependencies
- Privacy concerns (your driving data in someone else's database)
- Vendor lock-in

We needed something different.

---

## Our Solution: Local-First

FleetFuel runs entirely on your device. Your data never leaves your laptop until you choose to deploy.

### Stack

| Component | Choice | Why |
|-----------|--------|-----|
| Framework | Next.js 16 | App Router, server components, zero config |
| Database | SQLite | Single file, no server, portable |
| ORM | Prisma v6 | Type-safe, migrations, works offline |
| Auth | Custom + Argon2 | Sessions in DB, strong hashing |
| Styling | Tailwind + shadcn/ui | Fast dev, accessible components |
| Mobile | Capacitor | Wrap web app for Android/iOS |

---

## Architecture

```
fleetfuel/
├── apps/web/          # Next.js application
│   ├── src/app/       # App Router pages + API
│   ├── prisma/        # Schema + migrations
│   └── components/    # UI components
├── apps/mobile/       # Capacitor wrapper
└── packages/shared/   # Shared types
```

### Local-First Benefits

1. **Zero cost**: No database servers, no hosting fees (until you deploy)
2. **Privacy**: Data stays on your device
3. **Speed**: No network requests for CRUD operations
4. **Portability**: Copy the SQLite file, copy your data

---

## Key Implementation Details

### Database Schema

```prisma
model Vehicle {
  id        String   @id @default(cuid())
  userId    String
  name      String
  fuelType  FuelType // GASOLINE, DIESEL, ELECTRIC, HYBRID
  unitSystem UnitSystem @default(METRIC)
  fillUps   FillUp[]
  trips     Trip[]
}

model FillUp {
  id          String   @id @default(cuid())
  vehicleId   String
  occurredAt  DateTime
  odometer    Int
  fuelAmount  Float    // liters
  totalCost   Int      // cents
  isFullTank  Boolean  @default(true)
  receipts    Receipt[]
}
```

### Auth Flow

1. User signs up (email + password)
2. Password hashed with Argon2
3. Session token created and stored in database
4. Token validated on every API request

### Receipt Handling

1. Upload JPEG/PNG only
2. Magic byte validation
3. EXIF stripping via Sharp
4. Stored locally as `receipts/<uuid>.jpg`

---

## Deployment Options

### Vercel (Free Tier)

```bash
# Environment variables
DATABASE_URL=file:./prisma/dev.db
RECEIPTS_MODE=disabled  # Enable blob storage for production
```

### Mobile (Capacitor)

```bash
cd apps/mobile
npx cap sync
npx cap open android  # or ios
```

---

## Lessons Learned

1. **Prisma v6 vs v7**: v6 has simpler SQLite support. Stick with stable.
2. **Native deps**: Argon2 and Sharp require build tools. Plan for that in CI.
3. **Session storage**: Database sessions work fine for single-instance deploys.
4. **Receipts**: Local storage works for MVP. Cloud storage needed for multi-device.

---

## What's Next

- Vercel deployment (this week)
- Mobile app beta
- Charts and visualizations
- Export features

---

*FleetFuel is open source: https://github.com/nemesis-prime-bugs/fleetfuel*

*Built with Next.js, Prisma, and local-first principles.*

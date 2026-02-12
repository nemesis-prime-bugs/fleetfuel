# FleetFuel — Deployment Plan (Vercel + Mobile)

**Date:** 2026-02-12
**Owner:** Obito Uchiha (DevOps)

---

## Vercel Web Deployment

### Prerequisites

```bash
# Install Vercel CLI (once)
npm i -g vercel

# Login (once)
vercel login
```

### Configuration

**Environment Variables (Vercel Dashboard):**

| Variable | Value | Description |
|----------|-------|-------------|
| `DATABASE_URL` | `file:./prisma/dev.db` | SQLite for local; use Vercel KV for production |
| `RECEIPTS_MODE` | `disabled` | Local receipts only; enable blob storage later |
| `NEXT_PUBLIC_APP_URL` | `https://fleetfuel.vercel.app` | Production URL |

### Deploy Steps

```bash
# From project root
cd fleetfuel/apps/web

# Link to Vercel project
vercel --prod

# Or configure via dashboard:
# 1. Import GitHub repo: nemesis-prime-bugs/fleetfuel
# 2. Root directory: apps/web
# 3. Build command: pnpm prisma:generate:sqlite && next build
# 4. Output directory: .next
```

### Build Command

```bash
pnpm prisma:generate:sqlite && next build
```

### Notes

- **Database:** For Vercel free tier, use SQLite with persistent volume or migrate to Vercel KV (Redis) + PostgreSQL
- **Receipts:** Currently local-only. Future: Vercel Blob or S3-compatible storage
- **Auth:** Sessions stored in database (SQLite); works out of box

---

## Mobile App (Capacitor)

### Current State

```bash
# apps/mobile exists in repo
ls -la apps/mobile/
```

### Build for Android/iOS

```bash
cd apps/mobile

# Install dependencies
npm install

# Build web app first
cd ../web
pnpm build

# Sync to Capacitor
cd ../mobile
npx cap sync

# Open Android Studio
npx cap open android

# Or build for iOS (macOS only)
npx cap open ios
```

### Configuration Updates Needed

**capacitor.config.ts:**

```typescript
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.fleetfuel.app',
  appName: 'FleetFuel',
  webDir: '../web/.next/static/html',
  server: {
    androidScheme: 'https',
  },
};

export default config;
```

**Update `capacitor.config.ts` webDir to point to Next.js output.**

### Platform Requirements

| Platform | Requirement |
|----------|-------------|
| Android | Android Studio + JDK 17+ |
| iOS | macOS + Xcode 15+ |

---

## Deployment Checklist

### Pre-Deploy (Local)

- [x] Build succeeds: `cd apps/web && pnpm build`
- [x] TypeScript passes: `cd apps/web && pnpm tsc --noEmit`
- [x] Linting passes: `cd apps/web && pnpm lint`
- [x] Tests pass (if any)

### Vercel Deploy

- [ ] Create Vercel project
- [ ] Configure environment variables
- [ ] Deploy production
- [ ] Verify `/login` loads
- [ ] Verify signup + login flow works
- [ ] Test protected routes

### Mobile Build

- [ ] Update Capacitor config for Next.js output
- [ ] Build web app
- [ ] Sync to Capacitor
- [ ] Build Android APK (test on device)
- [ ] Build iOS IPA (test on simulator)

---

## Future Enhancements

1. **Cloud Database:** Vercel KV (Redis) for sessions, PostgreSQL via Supabase/Neon for data
2. **Receipt Storage:** Vercel Blob or AWS S3
3. **CDN:** Vercel Edge Network (automatic)
4. **CI/CD:** GitHub Actions for automated deploy on push
5. **App Store:** Submit Android APK / iOS IPA after testing

# Smoke Test — FleetFuel (MVP)

This is a fast manual checklist to confirm the MVP flows still work.

## Prereqs
From repo root:
```bash
cd apps/web
corepack pnpm dev --port 3000
```
Open: http://localhost:3000

## Auth
### Signup
1. Go to `/signup`
2. Fill email + password (>= 12 chars) + account type
3. Submit → should redirect to `/app`

### Logout
1. On `/app` click **Logout**
2. You should land on `/login`
3. Going back to `/app` should redirect to `/login`

### Login
1. Go to `/login`
2. Enter credentials
3. Submit → should redirect to `/app`

## Core UI flows

### Vehicles
1. Go to `/vehicles`
2. Create a vehicle
3. Edit it
4. Delete it

### Fill-ups
1. Go to `/fillups`
2. Select a vehicle
3. Add a fill-up
4. Edit it
5. Delete it

### Receipts
1. On `/fillups` History: click **📎 Receipt** on a fill-up and upload a JPEG/PNG
2. Under that fill-up, click:
   - **View** (opens inline)
   - **Download**

### Drivers
1. Go to `/drivers`
2. Add a driver
3. Rename driver

### Trips (Tagebuch)
1. Go to `/trips`
2. Select vehicle + driver
3. Add entry with start/end + odometer start/end
4. Confirm history is grouped by day + driver and totals look right

## API quick checks (optional)
```bash
# Signup
curl -i -X POST http://127.0.0.1:3000/api/auth/signup \
  -H 'content-type: application/json' \
  -d '{"email":"smoke@example.com","password":"correct horse battery staple","accountType":"PERSONAL"}'

# Login
curl -i -X POST http://127.0.0.1:3000/api/auth/login \
  -H 'content-type: application/json' \
  -d '{"email":"smoke@example.com","password":"correct horse battery staple"}'

# Logout (returns 303 -> /login and clears cookie)
curl -i -X POST http://127.0.0.1:3000/api/auth/logout
```

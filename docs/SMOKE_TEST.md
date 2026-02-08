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

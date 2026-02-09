# FleetFuel — Tunnel runbook (temporary outside access)

Stand: 2026-02-09 (UTC)

This is **not deployment**. It exposes a dev server temporarily.

## Cloudflare quick tunnel (no account)

### Start
1) Start dev server:
```bash
cd projects/fleetfuel/apps/web
pnpm dev --port 3000
```

2) Start quick tunnel (in another terminal):
```bash
cloudflared tunnel --url http://localhost:3000
```

Cloudflared prints a `https://…trycloudflare.com` URL.

### Stop
- Ctrl+C on cloudflared
- Ctrl+C on pnpm dev

## Notes
- URL changes on restart.
- Treat URL as semi-public.
- If running Next dev through a tunnel, set `allowedDevOrigins` (already configured for `*.trycloudflare.com`).

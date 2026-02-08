import { requireUser } from "@/lib/auth/requireUser";

export default async function AppPage() {
  const user = await requireUser();

  return (
    <main style={{ padding: 24, fontFamily: "system-ui" }}>
      <h1 style={{ fontSize: 24, fontWeight: 700 }}>FleetFuel</h1>
      <p style={{ marginTop: 12 }}>
        Logged in as <b>{user.email}</b>
      </p>
      <p style={{ marginTop: 12, opacity: 0.8 }}>
        Next up: vehicles, fill-ups, receipts, charts.
      </p>
    </main>
  );
}

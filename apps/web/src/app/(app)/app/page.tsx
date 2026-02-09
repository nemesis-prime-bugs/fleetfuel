import Link from "next/link";

import { endOfMonth, startOfMonth } from "date-fns";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { requireUser } from "@/lib/auth/requireUser";
import { prisma } from "@/lib/db";

function formatMoney(cents: number, currency: string) {
  return `${(cents / 100).toFixed(2)} ${currency}`;
}

export default async function AppPage() {
  const user = await requireUser();

  const now = new Date();
  const from = startOfMonth(now);
  const to = endOfMonth(now);

  const [vehiclesCount, fillupsThisMonth, tripsThisMonth] = await Promise.all([
    prisma.vehicle.count({ where: { userId: user.id } }),
    prisma.fillUp.findMany({
      where: {
        occurredAt: { gte: from, lte: to },
        vehicle: { userId: user.id },
      },
      select: { totalCost: true, fuelAmount: true, currency: true },
    }) as Promise<Array<{ totalCost: number; fuelAmount: number; currency: string }>>,
    prisma.trip.findMany({
      where: {
        startedAt: { gte: from, lte: to },
        vehicle: { userId: user.id },
      },
      select: { distance: true },
    }) as Promise<Array<{ distance: number }>>,
  ]);

  const currency = fillupsThisMonth[0]?.currency ?? "EUR";
  const spendCents = fillupsThisMonth.reduce((sum: number, f: { totalCost: number }) => sum + f.totalCost, 0);
  const fuel = fillupsThisMonth.reduce((sum: number, f: { fuelAmount: number }) => sum + f.fuelAmount, 0);
  const tripDistance = tripsThisMonth.reduce((sum: number, t: { distance: number }) => sum + t.distance, 0);
  const tripsCount = tripsThisMonth.length;

  const consumptionLPer100 = tripDistance > 0 ? (fuel / tripDistance) * 100 : null;

  const recentFillups = (await prisma.fillUp.findMany({
    where: { vehicle: { userId: user.id } },
    orderBy: { occurredAt: "desc" },
    take: 5,
    select: {
      id: true,
      occurredAt: true,
      totalCost: true,
      currency: true,
      vehicle: { select: { name: true } },
    },
  })) as Array<{
    id: string;
    occurredAt: Date;
    totalCost: number;
    currency: string;
    vehicle: { name: string };
  }>;

  const hasAnyData = vehiclesCount > 0 || recentFillups.length > 0;

  return (
    <div className="mx-auto w-full max-w-6xl space-y-8">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back, {user.email}</p>
      </div>

      {!hasAnyData ? (
        <Card>
          <CardHeader>
            <CardTitle>Start tracking in 60 seconds</CardTitle>
            <CardDescription>Create your first vehicle, then add a fill-up.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-2 sm:flex-row">
            <Button asChild>
              <Link href="/vehicles">Create vehicle</Link>
            </Button>
            <Button asChild variant="secondary">
              <Link href="/fillups">Add fill-up</Link>
            </Button>
          </CardContent>
        </Card>
      ) : null}

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Spend (this month)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{formatMoney(spendCents, currency)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Fuel (this month)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{fuel.toFixed(2)} L</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Trips (this month)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{tripsCount}</div>
            <div className="text-sm text-muted-foreground">{tripDistance} km</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Consumption</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{consumptionLPer100 ? `${consumptionLPer100.toFixed(1)} L/100km` : "—"}</div>
            <div className="text-sm text-muted-foreground">Based on trips this month</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Quick actions</CardTitle>
          <CardDescription>Do the common things fast.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-2 sm:flex-row">
          <Button asChild>
            <Link href="/fillups">Add fill-up</Link>
          </Button>
          <Button asChild variant="secondary">
            <Link href="/trips">Add trip</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/vehicles">Vehicles</Link>
          </Button>
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent fill-ups</CardTitle>
            <CardDescription>Your last 5 fuel entries.</CardDescription>
          </CardHeader>
          <CardContent>
            {recentFillups.length === 0 ? (
              <p className="text-sm text-muted-foreground">No fill-ups yet.</p>
            ) : (
              <div className="space-y-3">
                {recentFillups.map((f: { id: string; occurredAt: Date; totalCost: number; currency: string; vehicle: { name: string } }) => (
                  <div key={f.id} className="flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <div className="text-sm font-medium truncate">{f.vehicle.name}</div>
                      <div className="text-sm text-muted-foreground">{new Date(f.occurredAt).toLocaleDateString()}</div>
                    </div>
                    <div className="text-sm font-semibold whitespace-nowrap">{formatMoney(f.totalCost, f.currency)}</div>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-4">
              <Button asChild variant="secondary" size="sm">
                <Link href="/fillups">Open fill-ups</Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Navigation</CardTitle>
            <CardDescription>Everything else is still here, just quieter.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-2 sm:grid-cols-2">
            <Button asChild variant="ghost" className="justify-start">
              <Link href="/dashboard">Monthly charts</Link>
            </Button>
            <Button asChild variant="ghost" className="justify-start">
              <Link href="/drivers">Drivers</Link>
            </Button>
            <Button asChild variant="ghost" className="justify-start">
              <Link href="/profile">Profile</Link>
            </Button>
            <Button asChild variant="ghost" className="justify-start">
              <Link href="/account">Account</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

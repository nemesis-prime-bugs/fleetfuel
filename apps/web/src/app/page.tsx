import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function Home() {
  return (
    <main className="mx-auto flex min-h-[calc(100vh-2rem)] max-w-3xl items-center px-6 py-12">
      <Card className="w-full">
        <CardHeader>
          <CardTitle>FleetFuel</CardTitle>
          <CardDescription>
            Fuel + trip logging for private drivers and small fleets. (Local-first MVP, tunnel-access)
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 sm:flex-row">
          <Button asChild>
            <Link href="/login">Log in</Link>
          </Button>
          <Button asChild variant="secondary">
            <Link href="/signup">Create account</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/app">Open app</Link>
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}

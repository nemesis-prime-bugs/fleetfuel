import Link from "next/link";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { requireUser } from "@/lib/auth/requireUser";

export default async function AppPage() {
  const user = await requireUser();

  const links = [
    { href: "/dashboard", label: "Dashboard", desc: "Monthly totals + exports" },
    { href: "/vehicles", label: "Vehicles", desc: "Manage your vehicles" },
    { href: "/fillups", label: "Fill-ups", desc: "Add fuel logs and receipts" },
    { href: "/trips", label: "Trips", desc: "Tagebuch: daily driver log" },
    { href: "/drivers", label: "Drivers", desc: "Manage drivers list" },
    { href: "/profile", label: "Profile", desc: "Personal info + theme" },
  ];

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Welcome</h1>
        <p className="text-muted-foreground">Signed in as {user.email}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {links.map((l) => (
          <Link key={l.href} href={l.href} className="block">
            <Card className="h-full transition-colors hover:bg-muted/50">
              <CardHeader>
                <CardTitle className="text-base">{l.label}</CardTitle>
                <CardDescription>{l.desc}</CardDescription>
              </CardHeader>
              <CardContent />
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}

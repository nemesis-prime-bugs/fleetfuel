"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

type AccountType = "PERSONAL" | "COMPANY";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [accountType, setAccountType] = useState<AccountType>("PERSONAL");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    // If already logged in, redirect to /app.
    fetch("/api/auth/me")
      .then((r) => {
        if (r.ok) window.location.href = "/app";
      })
      .catch(() => {
        // ignore
      });
  }, []);

  return (
    <main className="mx-auto flex min-h-[calc(100vh-2rem)] max-w-md items-center px-6 py-12">
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Create your FleetFuel account</CardTitle>
          <CardDescription>
            Already have an account?{" "}
            <Link className="underline" href="/login">
              Log in
            </Link>
            .
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error ? (
            <div className="mb-4 rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm">
              <b>Signup failed:</b> {error}
            </div>
          ) : null}

          <form
            className="grid gap-4"
            onSubmit={async (e) => {
              e.preventDefault();
              setError(null);
              setSubmitting(true);
              try {
                const res = await fetch("/api/auth/signup", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ email, password, accountType }),
                });
                const data = (await res.json()) as { error?: string };
                if (!res.ok) {
                  setError(data.error ?? "Signup failed");
                  return;
                }
                window.location.href = "/app";
              } catch {
                setError("Network error");
              } finally {
                setSubmitting(false);
              }
            }}
          >
            <div className="grid gap-2">
              <Label>Email</Label>
              <Input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                type="email"
                autoComplete="email"
                required
              />
            </div>

            <div className="grid gap-2">
              <Label>Password</Label>
              <Input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="min 12 characters"
                type="password"
                autoComplete="new-password"
                required
              />
            </div>

            <div className="grid gap-2">
              <Label>Account type</Label>
              <RadioGroup value={accountType} onValueChange={(v) => setAccountType(v as AccountType)}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="PERSONAL" id="personal" />
                  <Label htmlFor="personal">Personal</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="COMPANY" id="company" />
                  <Label htmlFor="company">Company</Label>
                </div>
              </RadioGroup>
            </div>

            <Button type="submit" disabled={submitting}>
              {submitting ? "Creating…" : "Create account"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}

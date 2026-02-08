"use client";

import { useEffect, useMemo, useState } from "react";
import { useTheme } from "next-themes";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type ThemePreference = "LIGHT" | "DARK" | "SYSTEM";
type Gender = "MALE" | "FEMALE" | "DIVERSE" | "UNKNOWN";

type Profile = {
  firstName: string | null;
  lastName: string | null;
  company: string | null;
  age: number | null;
  gender: Gender | null;
  phone: string | null;
  themePreference: ThemePreference;
  updatedAt: string;
};

export default function ProfilePage() {
  const { setTheme } = useTheme();

  const [email, setEmail] = useState<string>("");
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [company, setCompany] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState<Gender>("UNKNOWN");
  const [phone, setPhone] = useState("");
  const [themePreference, setThemePreference] = useState<ThemePreference>("SYSTEM");

  const canSave = useMemo(() => {
    if (!profile) return false;

    const norm = (s: string) => (s.trim() ? s.trim() : null);
    const ageNum = age.trim() ? Number(age) : null;

    return (
      norm(firstName) !== profile.firstName ||
      norm(lastName) !== profile.lastName ||
      norm(company) !== profile.company ||
      (Number.isFinite(ageNum as number) ? Math.round(ageNum as number) : null) !== profile.age ||
      (gender === "UNKNOWN" ? null : gender) !== profile.gender ||
      norm(phone) !== profile.phone ||
      themePreference !== profile.themePreference
    );
  }, [age, company, firstName, gender, lastName, phone, profile, themePreference]);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/profile");
      if (res.status === 401) {
        window.location.href = "/login";
        return;
      }
      const data = (await res.json()) as { email?: string; profile?: Profile; error?: string };
      if (!res.ok) throw new Error(data.error ?? "Failed to load profile");

      setEmail(data.email ?? "");
      const p = data.profile!;
      setProfile(p);
      setFirstName(p.firstName ?? "");
      setLastName(p.lastName ?? "");
      setCompany(p.company ?? "");
      setAge(p.age === null ? "" : String(p.age));
      setGender((p.gender ?? "UNKNOWN") as Gender);
      setPhone(p.phone ?? "");
      setThemePreference(p.themePreference);

      // Apply theme immediately
      setTheme(p.themePreference.toLowerCase());
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load().catch(() => {
      /* ignore */
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <main className="mx-auto max-w-4xl p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Profile</h1>
        <p className="text-muted-foreground">Basic profile settings and theme preference.</p>
      </div>

      <div className="flex gap-3 text-sm mb-6">
        <a className="underline" href="/dashboard">
          Dashboard
        </a>
        <a className="underline" href="/vehicles">
          Vehicles
        </a>
        <a className="underline" href="/fillups">
          Fill-ups
        </a>
        <a className="underline" href="/trips">
          Trips
        </a>
      </div>

      {error ? <div className="mb-4 rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm">{error}</div> : null}

      <Card>
        <CardHeader>
          <CardTitle>Personal info</CardTitle>
          <CardDescription>Email is read-only for now.</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-sm text-muted-foreground">Loading…</p>
          ) : (
            <form
              className="grid grid-cols-1 gap-4 md:grid-cols-2"
              onSubmit={async (e) => {
                e.preventDefault();
                if (!canSave) return;
                setSaving(true);
                setError(null);
                try {
                  const payload = {
                    firstName: firstName.trim() ? firstName.trim() : null,
                    lastName: lastName.trim() ? lastName.trim() : null,
                    company: company.trim() ? company.trim() : null,
                    age: age.trim() ? Number(age) : null,
                    gender: gender === "UNKNOWN" ? null : gender,
                    phone: phone.trim() ? phone.trim() : null,
                    themePreference,
                  };

                  const res = await fetch("/api/profile", {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload),
                  });
                  const data = (await res.json()) as { email?: string; profile?: Profile; error?: string };
                  if (!res.ok) throw new Error(data.error ?? "Save failed");

                  setEmail(data.email ?? "");
                  const p = data.profile!;
                  setProfile(p);

                  // Apply theme immediately on save
                  setTheme(p.themePreference.toLowerCase());
                } catch (e2) {
                  setError((e2 as Error).message);
                } finally {
                  setSaving(false);
                }
              }}
            >
              <div className="grid gap-2">
                <Label>Email</Label>
                <Input value={email} readOnly />
              </div>

              <div className="grid gap-2">
                <Label>Phone</Label>
                <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+49..." />
              </div>

              <div className="grid gap-2">
                <Label>First name</Label>
                <Input value={firstName} onChange={(e) => setFirstName(e.target.value)} />
              </div>

              <div className="grid gap-2">
                <Label>Last name</Label>
                <Input value={lastName} onChange={(e) => setLastName(e.target.value)} />
              </div>

              <div className="grid gap-2">
                <Label>Company</Label>
                <Input value={company} onChange={(e) => setCompany(e.target.value)} placeholder="Optional" />
              </div>

              <div className="grid gap-2">
                <Label>Age</Label>
                <Input value={age} onChange={(e) => setAge(e.target.value)} inputMode="numeric" placeholder="Optional" />
              </div>

              <div className="grid gap-2">
                <Label>Gender</Label>
                <Select value={gender} onValueChange={(v) => setGender(v as Gender)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="UNKNOWN">Prefer not to say</SelectItem>
                    <SelectItem value="MALE">Male</SelectItem>
                    <SelectItem value="FEMALE">Female</SelectItem>
                    <SelectItem value="DIVERSE">Diverse</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label>Theme</Label>
                <Select value={themePreference} onValueChange={(v) => setThemePreference(v as ThemePreference)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="SYSTEM">System</SelectItem>
                    <SelectItem value="LIGHT">Light</SelectItem>
                    <SelectItem value="DARK">Dark</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="md:col-span-2 flex justify-end">
                <Button type="submit" disabled={!canSave || saving}>
                  {saving ? "Saving…" : "Save changes"}
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </main>
  );
}

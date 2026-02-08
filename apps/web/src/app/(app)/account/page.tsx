"use client";

import { useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

type AccountType = "PERSONAL" | "COMPANY";

type Account = {
  id: string;
  type: AccountType;
  name: string | null;
};

export default function AccountPage() {
  const [account, setAccount] = useState<Account | null>(null);
  const [type, setType] = useState<AccountType>("PERSONAL");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const canSave = useMemo(() => {
    if (!account) return false;
    const nameNorm = name.trim();
    const nameOrNull = nameNorm ? nameNorm : null;
    return type !== account.type || nameOrNull !== account.name;
  }, [account, name, type]);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch("/api/account");
      if (res.status === 401) {
        window.location.href = "/login";
        return;
      }
      const data = (await res.json()) as { account?: Account; error?: string };
      if (!res.ok) throw new Error(data.error ?? "Failed to load account");
      const a = data.account!;
      setAccount(a);
      setType(a.type);
      setName(a.name ?? "");
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load().catch(() => {
      /* ignore */
    });
  }, []);

  return (
    <div className="mx-auto w-full max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Account</h1>
        <p className="text-muted-foreground">Account type and name (billing identity later).</p>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button asChild variant="secondary">
          <a href="/dashboard">Dashboard</a>
        </Button>
        <Button asChild variant="secondary">
          <a href="/profile">Profile</a>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Settings</CardTitle>
          <CardDescription>Basic account settings for MVP.</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? <p className="text-sm text-muted-foreground">Loading…</p> : null}

          {!loading && account ? (
            <form
              className="mt-4 grid gap-4 md:grid-cols-2"
              onSubmit={async (e) => {
                e.preventDefault();
                if (!canSave) return;
                setSaving(true);
                try {
                  const res = await fetch("/api/account", {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      type,
                      name: name.trim() ? name.trim() : null,
                    }),
                  });
                  const data = (await res.json()) as { account?: Account; error?: string };
                  if (!res.ok) throw new Error(data.error ?? "Save failed");
                  const updated = data.account!;
                  setAccount(updated);
                  setType(updated.type);
                  setName(updated.name ?? "");
                  toast.success("Account updated");
                } catch (e2) {
                  toast.error((e2 as Error).message);
                } finally {
                  setSaving(false);
                }
              }}
            >
              <div className="grid gap-2">
                <Label>Account type</Label>
                <Select value={type} onValueChange={(v) => setType(v as AccountType)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PERSONAL">Personal</SelectItem>
                    <SelectItem value="COMPANY">Company</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label>Name (optional)</Label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={type === "COMPANY" ? "Company name" : "Your name"}
                />
              </div>

              <div className="md:col-span-2 flex justify-end">
                <Button type="submit" disabled={!canSave || saving}>
                  {saving ? "Saving…" : "Save"}
                </Button>
              </div>
            </form>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}

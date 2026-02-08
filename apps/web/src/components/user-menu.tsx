"use client";

import { useMemo, useState } from "react";
import { useTheme } from "next-themes";
import Link from "next/link";
import { LogOut, Monitor, Moon, Sun, User } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type ThemePreference = "LIGHT" | "DARK" | "SYSTEM";

function initialFromEmail(email: string) {
  const s = (email.split("@")[0] ?? "?").trim();
  return (s[0] ?? "?").toUpperCase();
}

export function UserMenu({ email }: { email: string }) {
  const { setTheme } = useTheme();
  const [saving, setSaving] = useState(false);

  const initial = useMemo(() => initialFromEmail(email), [email]);

  async function setPref(pref: ThemePreference) {
    setSaving(true);
    try {
      // Apply immediately
      setTheme(pref.toLowerCase());

      // Persist
      await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ themePreference: pref }),
      });
    } finally {
      setSaving(false);
    }
  }

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/login";
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-9 w-9 rounded-full" aria-label="User menu">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-xs font-semibold">
            {initial}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="space-y-1">
          <div className="text-sm font-medium leading-none">{email}</div>
          <div className="text-xs text-muted-foreground">Settings</div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        <DropdownMenuItem asChild>
          <Link href="/profile">
            <User className="mr-2 h-4 w-4" />
            Profile
          </Link>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuLabel className="text-xs text-muted-foreground">Theme</DropdownMenuLabel>
        <DropdownMenuItem disabled={saving} onClick={() => setPref("SYSTEM")}> 
          <Monitor className="mr-2 h-4 w-4" />
          System
        </DropdownMenuItem>
        <DropdownMenuItem disabled={saving} onClick={() => setPref("LIGHT")}> 
          <Sun className="mr-2 h-4 w-4" />
          Light
        </DropdownMenuItem>
        <DropdownMenuItem disabled={saving} onClick={() => setPref("DARK")}> 
          <Moon className="mr-2 h-4 w-4" />
          Dark
        </DropdownMenuItem>

        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={logout}>
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

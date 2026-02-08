"use client";

import { useEffect } from "react";
import { useTheme } from "next-themes";

type ThemePreference = "LIGHT" | "DARK" | "SYSTEM";

export function ThemeSync() {
  const { setTheme } = useTheme();

  useEffect(() => {
    fetch("/api/profile")
      .then(async (r) => {
        if (!r.ok) return;
        const data = (await r.json()) as { profile?: { themePreference?: ThemePreference } };
        const pref = data.profile?.themePreference ?? "SYSTEM";
        setTheme(pref.toLowerCase());
      })
      .catch(() => {
        /* ignore */
      });
  }, [setTheme]);

  return null;
}

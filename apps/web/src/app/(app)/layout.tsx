import { ReactNode } from "react";

import { requireUser } from "@/lib/auth/requireUser";
import { AppShell } from "@/components/app-shell";

export default async function AppLayout({ children }: { children: ReactNode }) {
  const user = await requireUser();

  return <AppShell userEmail={user.email}>{children}</AppShell>;
}

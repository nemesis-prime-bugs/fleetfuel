"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  Car,
  ClipboardList,
  Fuel,
  LayoutDashboard,
  Users,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

const nav = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/vehicles", label: "Vehicles", icon: Car },
  { href: "/fillups", label: "Fill-ups", icon: Fuel },
  { href: "/trips", label: "Trips", icon: ClipboardList },
  { href: "/drivers", label: "Drivers", icon: Users },
  // Profile is available via the top-right user menu (avoid redundant nav entries).
];

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <div className="px-2 py-1">
          <div className="text-sm font-semibold">FleetFuel</div>
          <div className="text-xs text-muted-foreground">Local-first MVP</div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>App</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {nav.map((n) => {
                const active = pathname === n.href || pathname?.startsWith(`${n.href}/`);
                const Icon = n.icon;
                return (
                  <SidebarMenuItem key={n.href}>
                    <SidebarMenuButton asChild isActive={active} tooltip={n.label}>
                      <Link href={n.href}>
                        <Icon />
                        <span>{n.label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <div className="px-2 py-2 text-xs text-muted-foreground">© FleetFuel</div>
      </SidebarFooter>
    </Sidebar>
  );
}

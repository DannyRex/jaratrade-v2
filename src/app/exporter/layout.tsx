"use client";

import {
  AlertTriangle,
  HelpCircle,
  LayoutDashboard,
  Package,
  Settings,
  Sparkles,
  Store,
  Truck,
  User,
} from "lucide-react";
import { AuthGuard } from "@/components/auth-guard";
import { DashboardShell, type NavItem } from "@/components/dashboard-shell";

const nav: NavItem[] = [
  { label: "Dashboard", href: "/exporter", icon: LayoutDashboard },
  { label: "Products", href: "/exporter/products", icon: Package },
  { label: "Stores", href: "/exporter/stores", icon: Store },
  { label: "Orders", href: "/exporter/orders", icon: Truck },
  { label: "Disputes", href: "/exporter/disputes", icon: AlertTriangle },
  { label: "Subscription", href: "/exporter/subscription", icon: Sparkles },
  { label: "Profile", href: "/exporter/profile", icon: User },
  { label: "Settings", href: "/exporter/settings", icon: Settings },
  { label: "Help", href: "/exporter/help", icon: HelpCircle },
];

export default function ExporterLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard role="exporter">
      <DashboardShell nav={nav} brand="Exporter">
        {children}
      </DashboardShell>
    </AuthGuard>
  );
}

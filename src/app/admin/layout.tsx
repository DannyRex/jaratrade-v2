"use client";

import {
  Banknote,
  FolderTree,
  LayoutDashboard,
  Package,
  Settings,
  ShieldCheck,
  Sparkles,
  Store,
  Truck,
  UserCheck,
  Users,
} from "lucide-react";
import { AuthGuard } from "@/components/auth-guard";
import { DashboardShell, type NavItem } from "@/components/dashboard-shell";

const nav: NavItem[] = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { label: "Users", href: "/admin/users", icon: Users },
  { label: "KYC queue", href: "/admin/kyc", icon: UserCheck },
  { label: "Orders", href: "/admin/orders", icon: Package },
  { label: "Markets", href: "/admin/markets", icon: Store },
  { label: "Categories", href: "/admin/categories", icon: FolderTree },
  { label: "Banks", href: "/admin/banks", icon: Banknote },
  { label: "Plans", href: "/admin/plans", icon: Sparkles },
  { label: "Logistics", href: "/admin/logistics", icon: Truck },
  { label: "Compliance", href: "/admin/compliance", icon: ShieldCheck },
  { label: "Settings", href: "/admin/settings", icon: Settings },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard role="admin">
      <DashboardShell nav={nav} brand="Admin">
        {children}
      </DashboardShell>
    </AuthGuard>
  );
}

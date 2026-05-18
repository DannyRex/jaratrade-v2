"use client";

import { AlertTriangle, Heart, MapPin, Package, ShoppingCart, User, Wallet } from "lucide-react";
import { AuthGuard } from "@/components/auth-guard";
import { DashboardShell, type NavItem } from "@/components/dashboard-shell";

// Importers don't subscribe - buying is free. Only exporters have plans.
const nav: NavItem[] = [
  { label: "Orders", href: "/importer/orders", icon: Package },
  { label: "Cart", href: "/importer/cart", icon: ShoppingCart },
  { label: "Favourites", href: "/importer/favorites", icon: Heart },
  { label: "Shipping", href: "/importer/shipping", icon: MapPin },
  { label: "Transactions", href: "/importer/transactions", icon: Wallet },
  { label: "Disputes", href: "/importer/disputes", icon: AlertTriangle },
  { label: "Account", href: "/importer/account", icon: User },
];

export default function ImporterLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard role="importer">
      <DashboardShell nav={nav} brand="Importer">
        {children}
      </DashboardShell>
    </AuthGuard>
  );
}

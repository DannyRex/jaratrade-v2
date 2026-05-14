import Link from "next/link";
import { Briefcase, ShoppingBag, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Role } from "@/lib/types";

interface RoleTabsProps {
  active: Role;
  hrefBuilder: (role: Role) => string;
  showAdmin?: boolean;
  className?: string;
}

const roles: Array<{ id: Role; label: string; icon: React.ComponentType<{ className?: string }>; description: string }> = [
  {
    id: "importer",
    label: "Importer",
    icon: ShoppingBag,
    description: "Source products from Nigerian exporters",
  },
  {
    id: "exporter",
    label: "Exporter",
    icon: Briefcase,
    description: "Sell to UK importers",
  },
  {
    id: "admin",
    label: "Admin",
    icon: ShieldCheck,
    description: "Platform administration",
  },
];

export function RoleTabs({ active, hrefBuilder, showAdmin = true, className }: RoleTabsProps) {
  const visible = showAdmin ? roles : roles.filter((r) => r.id !== "admin");
  return (
    <div role="tablist" aria-label="Choose your role" className={cn("grid gap-2", className)}>
      <div className="inline-grid grid-cols-2 gap-1 rounded-lg bg-muted p-1 sm:grid-cols-3">
        {visible.map((role) => {
          const Icon = role.icon;
          const isActive = role.id === active;
          return (
            <Link
              key={role.id}
              href={hrefBuilder(role.id)}
              role="tab"
              aria-selected={isActive}
              className={cn(
                "flex items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <Icon className="size-4" />
              {role.label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}

export function getRoleMeta(role: Role) {
  return roles.find((r) => r.id === role)!;
}

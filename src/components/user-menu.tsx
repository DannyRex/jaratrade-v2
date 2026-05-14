"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogOut, Package, Heart, MapPin, Settings, LayoutDashboard, User } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/lib/auth-store";
import { useLogout } from "@/lib/queries";
import { useHydrated } from "@/hooks/use-hydrated";
import { initials } from "@/lib/format";

export function UserMenu() {
  const router = useRouter();
  const user = useAuth((s) => s.user);
  const role = useAuth((s) => s.role);
  const logout = useLogout();
  const hydrated = useHydrated();

  if (!hydrated) {
    return <div className="size-9 rounded-full bg-muted" aria-hidden />;
  }

  if (!user || !role) {
    return (
      <div className="flex items-center gap-2">
        <Button asChild variant="ghost" size="sm">
          <Link href="/auth/login/importer">Log in</Link>
        </Button>
        <Button asChild size="sm">
          <Link href="/auth/register/importer">Sign up</Link>
        </Button>
      </div>
    );
  }

  const dashboardHref =
    role === "admin" ? "/admin" : role === "exporter" ? "/exporter" : "/importer/orders";

  const fullName = `${user.firstname ?? ""} ${user.lastname ?? ""}`.trim() || user.profile_name || "Account";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Account menu" className="rounded-full">
          <Avatar className="size-8">
            <AvatarFallback>{initials(fullName)}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="flex flex-col gap-0.5">
          <span className="text-sm font-medium text-foreground">{fullName}</span>
          <span className="text-xs font-normal capitalize text-muted-foreground">{role}</span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href={dashboardHref}>
            <LayoutDashboard /> Dashboard
          </Link>
        </DropdownMenuItem>
        {role === "importer" ? (
          <>
            <DropdownMenuItem asChild>
              <Link href="/importer/orders">
                <Package /> Orders
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/importer/favorites">
                <Heart /> Favourites
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/importer/shipping">
                <MapPin /> Shipping
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/importer/account">
                <User /> Account
              </Link>
            </DropdownMenuItem>
          </>
        ) : null}
        {role === "exporter" ? (
          <>
            <DropdownMenuItem asChild>
              <Link href="/exporter/products">
                <Package /> Products
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/exporter/profile">
                <User /> Profile
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/exporter/settings">
                <Settings /> Settings
              </Link>
            </DropdownMenuItem>
          </>
        ) : null}
        {role === "admin" ? (
          <DropdownMenuItem asChild>
            <Link href="/admin/settings">
              <Settings /> Settings
            </Link>
          </DropdownMenuItem>
        ) : null}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onSelect={() => {
            logout();
            router.push("/");
          }}
        >
          <LogOut /> Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

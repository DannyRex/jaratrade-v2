"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-store";
import { Spinner } from "@/components/ui/spinner";
import type { Role } from "@/lib/types";

interface AuthGuardProps {
  role: Role;
  children: React.ReactNode;
}

/**
 * Client-side route guard. Renders children only when the user has the
 * required role. Otherwise redirects to the role-specific login page.
 *
 * NOTE: This is a defense-in-depth layer. Real authorization happens
 * server-side via the bearer token attached by the API client.
 *
 * Waits for client mount + zustand persist hydration before deciding,
 * to avoid "Router action dispatched before initialization" in Next 16.
 */
export function AuthGuard({ role, children }: AuthGuardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const token = useAuth((s) => s.token);
  const currentRole = useAuth((s) => s.role);
  const isHydrated = useAuth((s) => s.isHydrated);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || !isHydrated) return;
    if (!token) {
      router.replace(`/auth/login/${role}?next=${encodeURIComponent(pathname)}`);
      return;
    }
    if (currentRole !== role) {
      const fallback =
        currentRole === "admin" ? "/admin" : currentRole === "exporter" ? "/exporter" : "/importer/orders";
      router.replace(fallback);
    }
  }, [mounted, isHydrated, token, currentRole, role, router, pathname]);

  if (!mounted || !isHydrated || !token || currentRole !== role) {
    return (
      <div className="grid min-h-[60vh] place-items-center">
        <Spinner className="size-6 text-muted-foreground" />
      </div>
    );
  }
  return <>{children}</>;
}

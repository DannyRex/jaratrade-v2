"use client";

import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/lib/cart-store";
import { useHydrated } from "@/hooks/use-hydrated";
import { useAuth } from "@/lib/auth-store";

/**
 * CartButton — header chip that opens /importer/cart.
 *
 * Visibility rules (v3.4):
 *  - Logged-out visitors: hidden. They can still add to the local cart from
 *    product pages; once they sign in the items sync to the server and the
 *    header chip appears.
 *  - Logged-in exporters or admins: hidden. Cart is an importer-only motion.
 *  - Logged-in importers: visible, with a count badge.
 *
 * We gate the render on `hydrated` so server and client output match - the
 * auth store reads cookies on mount which aren't available during SSR.
 */
export function CartButton() {
  const role = useAuth((s) => s.role);
  const token = useAuth((s) => s.token);
  const count = useCart((s) => s.items.reduce((acc, i) => acc + i.quantity, 0));
  const hydrated = useHydrated();

  if (!hydrated || !token || role !== "importer") return null;

  return (
    <Button asChild variant="ghost" size="icon" className="relative" aria-label={`Cart, ${count} items`}>
      <Link href="/importer/cart">
        <ShoppingCart className="size-4" />
        {count > 0 ? (
          <span
            className="absolute -right-1 -top-1 grid size-5 place-items-center rounded-full bg-accent text-[10px] font-bold text-accent-foreground"
            aria-hidden
          >
            {count > 99 ? "99+" : count}
          </span>
        ) : null}
      </Link>
    </Button>
  );
}

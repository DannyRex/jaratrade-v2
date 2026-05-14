"use client";

import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/lib/cart-store";
import { useHydrated } from "@/hooks/use-hydrated";

export function CartButton() {
  const count = useCart((s) => s.items.reduce((acc, i) => acc + i.quantity, 0));
  const hydrated = useHydrated();

  return (
    <Button asChild variant="ghost" size="icon" className="relative" aria-label={`Cart, ${count} items`}>
      <Link href="/importer/cart">
        <ShoppingCart className="size-4" />
        {hydrated && count > 0 ? (
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

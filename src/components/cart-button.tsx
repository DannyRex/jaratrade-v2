"use client";

import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/lib/cart-store";
import { useEffect, useState } from "react";

export function CartButton() {
  const count = useCart((s) => s.items.reduce((acc, i) => acc + i.quantity, 0));
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <Button asChild variant="ghost" size="icon" className="relative" aria-label={`Cart, ${count} items`}>
      <Link href="/importer/cart">
        <ShoppingCart className="size-4" />
        {mounted && count > 0 ? (
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

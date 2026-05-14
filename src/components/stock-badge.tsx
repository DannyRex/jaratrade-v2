"use client";

/**
 * Stock badge — shown on product cards + the detail page.
 *
 * Decision tree:
 *  - `undefined`  → no badge (backend hasn't surfaced stock; v2.4 and earlier)
 *  - `0`          → "Out of stock" (destructive)
 *  - 1..threshold → "Only N left" (warning)
 *  - > threshold  → "In stock" (success), suppressed in `compact` mode
 *
 * `compact` is for cards where vertical real estate is tight — we only show the
 * badge when it carries a buy-now-urgency signal (low or out).
 */
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface StockBadgeProps {
  stock?: number | null;
  threshold?: number | null;
  compact?: boolean;
  className?: string;
}

export function StockBadge({ stock, threshold = 10, compact = false, className }: StockBadgeProps) {
  if (stock === undefined || stock === null) return null;
  const lowAt = threshold ?? 10;

  if (stock <= 0) {
    return (
      <Badge variant="destructive" className={cn("font-medium", className)}>
        Out of stock
      </Badge>
    );
  }
  if (stock <= lowAt) {
    return (
      <Badge variant="warning" className={cn("font-medium", className)}>
        Only {stock} left
      </Badge>
    );
  }
  if (compact) return null;
  return (
    <Badge variant="success" className={cn("font-medium", className)}>
      In stock
    </Badge>
  );
}

/** Inline label form (no badge chrome) — for table cells or tight rows. */
export function StockLabel({ stock, threshold = 10 }: StockBadgeProps) {
  if (stock === undefined || stock === null) return <span className="text-muted-foreground">--</span>;
  const lowAt = threshold ?? 10;
  if (stock <= 0) return <span className="text-destructive font-medium">Out of stock</span>;
  if (stock <= lowAt) return <span className="text-warning font-medium">{stock} (low)</span>;
  return <span className="text-foreground">{stock}</span>;
}

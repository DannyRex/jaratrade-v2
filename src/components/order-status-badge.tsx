/**
 * OrderStatusBadge - shared color-coded badge for order status everywhere
 * an order appears (importer list, importer detail, exporter list, admin).
 *
 * Color mapping (tuned against badge variants in `ui/badge.tsx`):
 *   - pending     -> warning (amber)    : awaiting payment
 *   - paid        -> info-ish secondary : payment received, not yet shipped
 *   - confirmed   -> secondary           : exporter has confirmed
 *   - preparing   -> secondary           : being prepared
 *   - shipped     -> accent              : in transit
 *   - delivered   -> success             : arrived at buyer
 *   - confirmed_received -> success      : buyer confirmed (we paint a dot)
 *   - cancelled   -> destructive
 *   - failed      -> destructive
 *   - refunded    -> destructive (muted) : money returned
 */
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type Variant = "default" | "secondary" | "outline" | "success" | "warning" | "destructive" | "accent";

interface MapEntry {
  variant: Variant;
  label: string;
}

const STATUS_MAP: Record<string, MapEntry> = {
  pending: { variant: "warning", label: "Pending payment" },
  paid: { variant: "secondary", label: "Paid" },
  confirmed: { variant: "secondary", label: "Confirmed" },
  preparing: { variant: "secondary", label: "Preparing" },
  shipped: { variant: "accent", label: "Shipped" },
  delivered: { variant: "success", label: "Delivered" },
  cancelled: { variant: "destructive", label: "Cancelled" },
  failed: { variant: "destructive", label: "Failed" },
  refunded: { variant: "destructive", label: "Refunded" },
};

function prettyFallback(status: string): string {
  if (!status) return "Unknown";
  return status.charAt(0).toUpperCase() + status.slice(1);
}

export function OrderStatusBadge({
  status,
  confirmedReceived = false,
  className,
}: {
  status: string;
  /** Set true if the buyer has stamped confirmed_received_at -> adds a "Receipt confirmed" suffix. */
  confirmedReceived?: boolean;
  className?: string;
}) {
  const entry = STATUS_MAP[status] ?? { variant: "secondary" as Variant, label: prettyFallback(status) };
  const label = confirmedReceived && status === "delivered" ? "Receipt confirmed" : entry.label;
  return (
    <Badge variant={entry.variant} className={cn("capitalize", className)}>
      {label}
    </Badge>
  );
}

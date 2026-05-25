"use client";

/**
 * Buyer-facing price renderer that respects the currency preference toggle.
 *
 * Background: every customer-journey surface (cart, checkout, pay page,
 * order detail, order list, transactions) needs to honour the same "show
 * me GBP" toggle that the homepage product cards already do. Rather than
 * repeating the `useCurrencyPreference` + `pickPriceDisplay` + dual-line
 * markup at every site, this component takes the price-like fields the
 * backend now returns (`amount` / `currency` / `secondary_amount` /
 * `secondary_currency`) and renders the primary big + the equivalent muted.
 *
 * If `secondary_amount` is missing (older endpoints or rates unavailable)
 * we just render the primary. Always shape-tolerant.
 */
import { useCurrencyPreference, pickPriceDisplay } from "@/lib/currency-preference";
import { formatMoney } from "@/lib/format";
import { cn } from "@/lib/utils";

export interface DualPriceInput {
  /** Native amount as a string (FastAPI side renders `f"{x:.2f}"`). */
  amount: string | number | null | undefined;
  /** ISO code of `amount`. Defaults to NGN if absent. */
  currency?: string | null;
  /** GBP equivalent. Null/undefined → no secondary line. */
  secondary_amount?: string | null;
  /** ISO code of the secondary (always GBP today). */
  secondary_currency?: string | null;
}

interface Props {
  value: DualPriceInput;
  /** Visual size of the primary number. */
  size?: "sm" | "md" | "lg" | "xl";
  /** When true, show `₦100 (≈ £0.05)` on a single line instead of stacked. */
  inline?: boolean;
  /** Extra classes for the primary line. */
  className?: string;
  /** Extra classes for the secondary line. */
  secondaryClassName?: string;
}

const SIZE_CLASS: Record<NonNullable<Props["size"]>, string> = {
  sm: "text-sm",
  md: "text-base",
  lg: "text-xl",
  xl: "text-3xl font-bold tracking-tight",
};

export function DualPrice({ value, size = "md", inline = false, className, secondaryClassName }: Props) {
  const preference = useCurrencyPreference((s) => s.preference);
  // Normalise to the shape pickPriceDisplay expects (it was written against
  // the product summary shape: { price, currency, secondary_* }).
  const adapted = {
    price: value.amount == null ? "0" : String(value.amount),
    currency: value.currency ?? "NGN",
    secondary_amount: value.secondary_amount ?? null,
    secondary_currency: value.secondary_currency ?? null,
  };
  const { primary, secondary } = pickPriceDisplay(preference, adapted);

  if (inline) {
    return (
      <span className={cn("tabular-nums", SIZE_CLASS[size], className)}>
        {formatMoney(primary.amount, primary.currency)}
        {secondary ? (
          <span className={cn("ml-1 text-muted-foreground", secondaryClassName)}>
            (≈ {formatMoney(secondary.amount, secondary.currency)})
          </span>
        ) : null}
      </span>
    );
  }
  return (
    <span className="inline-flex flex-col tabular-nums">
      <span className={cn(SIZE_CLASS[size], className)}>
        {formatMoney(primary.amount, primary.currency)}
      </span>
      {secondary ? (
        <span className={cn("text-xs text-muted-foreground", secondaryClassName)}>
          ≈ {formatMoney(secondary.amount, secondary.currency)}
        </span>
      ) : null}
    </span>
  );
}

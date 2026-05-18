"use client";

/**
 * CurrencyToggle - lets the buyer flip between native (NGN) and secondary
 * (GBP) price display across the marketplace.
 *
 * Renders as a compact two-segment button in the header. State lives in
 * the `useCurrencyPreference` zustand store and persists to localStorage
 * so the choice carries across sessions.
 */
import { Coins } from "lucide-react";
import { useCurrencyPreference } from "@/lib/currency-preference";
import { useHydrated } from "@/hooks/use-hydrated";
import { cn } from "@/lib/utils";

export function CurrencyToggle({ className }: { className?: string }) {
  const preference = useCurrencyPreference((s) => s.preference);
  const setPreference = useCurrencyPreference((s) => s.setPreference);
  const hydrated = useHydrated();

  // Avoid SSR/CSR markup mismatch on first render
  if (!hydrated) return null;

  return (
    <div
      role="group"
      aria-label="Display currency"
      className={cn(
        "inline-flex items-center gap-0.5 rounded-full border border-border/70 bg-background/60 p-0.5 text-xs font-semibold",
        className,
      )}
    >
      <Coins className="ml-1 size-3 text-muted-foreground" aria-hidden />
      <button
        type="button"
        onClick={() => setPreference("local")}
        aria-pressed={preference === "local"}
        className={cn(
          "rounded-full px-2.5 py-1 transition-colors",
          preference === "local"
            ? "bg-primary text-primary-foreground shadow-sm"
            : "text-muted-foreground hover:text-foreground",
        )}
      >
        ₦
      </button>
      <button
        type="button"
        onClick={() => setPreference("secondary")}
        aria-pressed={preference === "secondary"}
        className={cn(
          "rounded-full px-2.5 py-1 transition-colors",
          preference === "secondary"
            ? "bg-primary text-primary-foreground shadow-sm"
            : "text-muted-foreground hover:text-foreground",
        )}
      >
        £
      </button>
    </div>
  );
}

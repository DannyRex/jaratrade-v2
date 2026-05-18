"use client";

/**
 * Buyer-side currency preference.
 *
 * Stored in a long-lived cookie (`jara_ccy`) so SSR can read it too. Values:
 *   "local"      — show the listing's native currency only (default for NG buyers)
 *   "secondary"  — show the secondary (GBP) figure prominently with native in muted text
 *
 * Backed by a tiny zustand store so any component (product card, detail, cart)
 * can subscribe without a context provider.
 */
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export type CurrencyPreference = "local" | "secondary";

interface CurrencyStore {
  preference: CurrencyPreference;
  setPreference: (p: CurrencyPreference) => void;
}

export const useCurrencyPreference = create<CurrencyStore>()(
  persist(
    (set) => ({
      preference: "local",
      setPreference: (preference) => set({ preference }),
    }),
    {
      name: "jara-ccy",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);

/**
 * Render a product price the way the buyer wants to see it.
 *
 * `local` shows native big + GBP equivalent muted.
 * `secondary` shows GBP big + native muted.
 *
 * If `secondary_amount` is absent we just render the native price.
 */
export function pickPriceDisplay(
  preference: CurrencyPreference,
  product: {
    price: string;
    currency?: string | null;
    secondary_currency?: string | null;
    secondary_amount?: string | null;
  },
): { primary: { amount: string; currency: string }; secondary: { amount: string; currency: string } | null } {
  const localCcy = (product.currency || "NGN").toUpperCase();
  const local = { amount: product.price, currency: localCcy };
  if (!product.secondary_amount || !product.secondary_currency) {
    return { primary: local, secondary: null };
  }
  const secondary = {
    amount: product.secondary_amount,
    currency: product.secondary_currency.toUpperCase(),
  };
  if (preference === "secondary") {
    return { primary: secondary, secondary: local };
  }
  return { primary: local, secondary };
}

"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { auth, importerApi } from "./api";
import type { CartItem, ProductDetail, ProductSummary } from "./types";

interface CartState {
  items: CartItem[];
  /** Server-issued cart ID - set after first sync. */
  remoteCartId: string | null;
  add: (product: ProductDetail | ProductSummary, quantity?: number, unit?: string) => void;
  setQuantity: (productId: string, quantity: number) => void;
  remove: (productId: string) => void;
  clear: () => void;
  setRemoteCartId: (id: string | null) => void;
  /** Sync the local cart to the server. Safe to call as a no-op when not logged in. */
  syncToServer: () => Promise<void>;
  totalQuantity: () => number;
  subtotal: () => number;
}

function asNumber(v: string | number): number {
  return typeof v === "number" ? v : Number(v) || 0;
}

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      remoteCartId: null,
      add: (product, quantity = 1, unit = "cartons") => {
        const productId = product.id;
        const name = "product_name" in product ? product.product_name : "Untitled";
        const category = "category" in product ? (product as ProductSummary).category : (product as ProductDetail).name;
        const price = asNumber(product.price);
        const currency = ("currency" in product ? product.currency : undefined) ?? "NGN";
        // The product's minimum order quantity - a new cart line never starts
        // below it. ProductSummary carries no MOQ, so default to 1.
        const moq =
          "min_order_quantity" in product ? Number(product.min_order_quantity) || 1 : 1;
        const exporterId = "exporter_id" in product ? (product as ProductDetail).exporter_id : undefined;
        const exporterName = "exporter_name" in product ? (product as ProductSummary).exporter_name : undefined;
        const storeId = "store_id" in product ? (product as ProductDetail).store_id : undefined;
        const image = "images" in product
          ? (() => {
              try {
                const arr = JSON.parse(product.images);
                return Array.isArray(arr) ? arr[0] : undefined;
              } catch {
                return undefined;
              }
            })()
          : undefined;
        // Capture the FX rate the buyer sees on the listing/detail page so we
        // can render the same GBP equivalent on cart + checkout without
        // hitting the API again. The rate is per single unit of `price`; it's
        // null when FX rates are unavailable upstream (rare; cron repopulates).
        const secondaryCurrency =
          "secondary_currency" in product
            ? ((product as ProductSummary).secondary_currency ?? null)
            : null;
        const secondaryRate =
          "secondary_rate" in product
            ? ((product as ProductSummary).secondary_rate ?? null)
            : null;
        const secondaryAmount =
          "secondary_amount" in product
            ? ((product as ProductSummary).secondary_amount ?? null)
            : null;

        const existing = get().items.find((i) => i.product_id === productId);
        if (existing) {
          set({
            items: get().items.map((i) =>
              i.product_id === productId
                ? {
                    ...i,
                    quantity: i.quantity + quantity,
                    subtotal: (i.quantity + quantity) * i.price,
                    min_order_quantity: i.min_order_quantity ?? moq,
                    // Refresh FX hints in case the buyer revisited the
                    // product page and rates changed since the first add.
                    secondary_currency: secondaryCurrency ?? i.secondary_currency ?? null,
                    secondary_rate: secondaryRate ?? i.secondary_rate ?? null,
                    secondary_amount: secondaryAmount ?? i.secondary_amount ?? null,
                  }
                : i,
            ),
          });
        } else {
          // Never start a line below the minimum order quantity.
          const startQty = Math.max(quantity, moq);
          set({
            items: [
              ...get().items,
              {
                product_id: productId,
                name,
                category,
                price,
                currency,
                quantity: startQty,
                min_order_quantity: moq,
                unit,
                subtotal: price * startQty,
                exporter_id: exporterId,
                exporter_name: exporterName,
                store_id: storeId,
                image,
                added_at: new Date().toISOString(),
                secondary_currency: secondaryCurrency,
                secondary_rate: secondaryRate,
                secondary_amount: secondaryAmount,
              },
            ],
          });
        }
      },
      setQuantity: (productId, quantity) => {
        if (quantity <= 0) {
          set({ items: get().items.filter((i) => i.product_id !== productId) });
          return;
        }
        set({
          items: get().items.map((i) => {
            if (i.product_id !== productId) return i;
            // A line can never drop below the product's minimum order quantity.
            const qty = Math.max(quantity, i.min_order_quantity || 1);
            return { ...i, quantity: qty, subtotal: i.price * qty };
          }),
        });
      },
      remove: (productId) => set({ items: get().items.filter((i) => i.product_id !== productId) }),
      clear: () => set({ items: [], remoteCartId: null }),
      setRemoteCartId: (id) => set({ remoteCartId: id }),
      totalQuantity: () => get().items.reduce((acc, i) => acc + i.quantity, 0),
      subtotal: () => get().items.reduce((acc, i) => acc + i.subtotal, 0),
      syncToServer: async () => {
        if (!auth.getToken() || auth.getRole() !== "importer") return;
        const items = get().items.map((i) => ({
          product_id: i.product_id,
          quantity: i.quantity,
          unit: i.unit,
        }));
        try {
          const result = await importerApi.syncCart(items, true);
          if (result?.id) set({ remoteCartId: result.id });
        } catch {
          // Silent - local cart is still authoritative for offline-first UX.
        }
      },
    }),
    {
      name: "jara-cart",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);

"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Minus, Plus, ShoppingCart, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { useCart } from "@/lib/cart-store";
import { DualPrice } from "@/components/dual-price";

export default function CartPage() {
  const router = useRouter();
  const items = useCart((s) => s.items);
  const setQuantity = useCart((s) => s.setQuantity);
  const remove = useCart((s) => s.remove);
  const clear = useCart((s) => s.clear);

  const subtotal = items.reduce((acc, i) => acc + i.subtotal, 0);
  const platformFee = subtotal * 0.02;
  const total = subtotal + platformFee;

  // Derive a single FX rate for the cart-level totals. Cart items can in
  // theory have different secondary_rates (different products quoted on
  // different days), so we use a quantity-weighted average — heavily skewed
  // by line value, which is what a buyer would intuitively expect. If no
  // item has a rate we just hide the secondary line entirely.
  const aggregateRate = (() => {
    let rateSum = 0;
    let weight = 0;
    for (const i of items) {
      if (i.secondary_rate && i.subtotal > 0) {
        rateSum += i.secondary_rate * i.subtotal;
        weight += i.subtotal;
      }
    }
    return weight > 0 ? rateSum / weight : null;
  })();
  const secondaryCurrency =
    items.find((i) => i.secondary_currency)?.secondary_currency ?? null;
  const secondaryFor = (amount: number) =>
    aggregateRate != null && secondaryCurrency
      ? (amount * aggregateRate).toFixed(2)
      : null;

  if (items.length === 0) {
    return (
      <>
        <PageHeader title="Your cart" />
        <EmptyState
          icon={<ShoppingCart />}
          title="Your cart is empty"
          description="Browse the marketplace to find products to import."
          action={
            <Button asChild>
              <Link href="/products">Browse marketplace</Link>
            </Button>
          }
        />
      </>
    );
  }

  return (
    <>
      <PageHeader
        title="Your cart"
        description={`${items.length} ${items.length === 1 ? "item" : "items"} ready to order`}
        actions={
          <Button variant="ghost" onClick={clear}>
            <Trash2 className="size-4" /> Clear cart
          </Button>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <ul className="space-y-3">
          {items.map((item) => (
            <li key={item.product_id}>
              <Card>
                <CardContent className="flex gap-4 p-4">
                  <div className="relative size-20 shrink-0 overflow-hidden rounded-md bg-muted sm:size-24">
                    {item.image ? (
                      <Image src={item.image} alt={item.name} fill sizes="96px" className="object-cover" />
                    ) : (
                      <div className="grid h-full place-items-center text-[10px] text-muted-foreground">No image</div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1 space-y-1.5">
                    <Link href={`/products/${encodeURIComponent(item.product_id)}`} className="line-clamp-1 text-sm font-semibold hover:underline">
                      {item.name}
                    </Link>
                    {item.exporter_name ? (
                      <p className="text-xs text-muted-foreground">by {item.exporter_name}</p>
                    ) : null}
                    <p className="text-xs text-muted-foreground capitalize">{item.unit}</p>
                    {(item.min_order_quantity || 1) > 1 ? (
                      <p className="text-xs text-muted-foreground">
                        Minimum order: {item.min_order_quantity} units
                      </p>
                    ) : null}
                    <div className="flex items-center justify-between gap-2 pt-1">
                      <div className="inline-flex items-center rounded-md border">
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          aria-label="Decrease"
                          disabled={item.quantity <= (item.min_order_quantity || 1)}
                          onClick={() => setQuantity(item.product_id, item.quantity - 1)}
                        >
                          <Minus className="size-3.5" />
                        </Button>
                        <span className="min-w-[2.25rem] text-center text-sm tabular-nums">{item.quantity}</span>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          aria-label="Increase"
                          onClick={() => setQuantity(item.product_id, item.quantity + 1)}
                        >
                          <Plus className="size-3.5" />
                        </Button>
                      </div>
                      <DualPrice
                        size="sm"
                        className="font-bold"
                        value={{
                          amount: item.subtotal,
                          currency: item.currency ?? "NGN",
                          secondary_amount:
                            item.secondary_rate != null
                              ? (item.subtotal * item.secondary_rate).toFixed(2)
                              : null,
                          secondary_currency: item.secondary_currency ?? null,
                        }}
                      />
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label={`Remove ${item.name}`}
                    onClick={() => remove(item.product_id)}
                    className="self-start"
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </CardContent>
              </Card>
            </li>
          ))}
        </ul>

        <aside className="lg:sticky lg:top-20 lg:self-start">
          <Card>
            <CardContent className="space-y-4 p-6">
              <h2 className="text-base font-semibold">Order summary</h2>
              <dl className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Subtotal</dt>
                  <dd>
                    <DualPrice
                      size="sm"
                      inline
                      value={{
                        amount: subtotal,
                        currency: "NGN",
                        secondary_amount: secondaryFor(subtotal),
                        secondary_currency: secondaryCurrency,
                      }}
                    />
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Platform fee (2%)</dt>
                  <dd>
                    <DualPrice
                      size="sm"
                      inline
                      value={{
                        amount: platformFee,
                        currency: "NGN",
                        secondary_amount: secondaryFor(platformFee),
                        secondary_currency: secondaryCurrency,
                      }}
                    />
                  </dd>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <dt>Logistics</dt>
                  <dd>Calculated at checkout</dd>
                </div>
              </dl>
              <Separator />
              <div className="flex items-baseline justify-between">
                <span className="text-sm text-muted-foreground">Estimated total</span>
                <DualPrice
                  size="lg"
                  value={{
                    amount: total,
                    currency: "NGN",
                    secondary_amount: secondaryFor(total),
                    secondary_currency: secondaryCurrency,
                  }}
                />
              </div>
              <Button size="lg" className="w-full" onClick={() => router.push("/importer/checkout")}>
                Proceed to checkout
              </Button>
              <p className="text-center text-xs text-muted-foreground">
                Funds held in escrow until shipment confirmed.
              </p>
            </CardContent>
          </Card>
        </aside>
      </div>
    </>
  );
}

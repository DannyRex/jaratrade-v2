"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Truck, Package, ShieldCheck, Plane } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { Badge } from "@/components/ui/badge";
import { useCart } from "@/lib/cart-store";
import { useLogistics } from "@/lib/queries";
import { useAuth } from "@/lib/auth-store";
import { formatMoney } from "@/lib/format";
import { importerApi } from "@/lib/api";
import type { LogisticsCompany } from "@/lib/types";
import { cn } from "@/lib/utils";

type ShippingMode = "self" | "logistics";

export default function CheckoutPage() {
  const router = useRouter();
  const items = useCart((s) => s.items);
  const clearCart = useCart((s) => s.clear);
  const remoteCartId = useCart((s) => s.remoteCartId);
  const user = useAuth((s) => s.user);
  const logistics = useLogistics();

  const [mode, setMode] = useState<ShippingMode>("logistics");
  const [logisticsId, setLogisticsId] = useState<string>("");
  const [delivery, setDelivery] = useState({
    recipient_name: user ? `${user.firstname} ${user.lastname}` : "",
    phone: user?.phone ?? "",
    address: "",
    city: "",
    state: "",
    country: "United Kingdom",
    postal_code: "",
  });

  const subtotal = items.reduce((acc, i) => acc + i.subtotal, 0);
  const platformFee = subtotal * 0.02;
  const logisticsEstimate = mode === "logistics" ? subtotal * 0.05 : 0;
  const total = subtotal + platformFee + logisticsEstimate;

  const placeOrder = useMutation({
    mutationFn: async () => {
      if (!remoteCartId) {
        // Without a server-issued cart ID, we'd need to sync first.
        // For now, surface a clear error so the API team can wire up the missing endpoint.
        throw new Error("Cart sync required - please add at least one item to your live cart.");
      }
      const order = await importerApi.createOrder({
        cart_id: remoteCartId,
        logistic_id: mode === "logistics" ? logisticsId : undefined,
        delivery_info: { ...delivery, mode },
      });
      const session = await importerApi.initPayment(order.order_id);
      return { order, session };
    },
    onSuccess: ({ order }) => {
      toast.success("Order placed", { description: "Redirecting you to payment…" });
      clearCart();
      router.push(`/importer/orders/${encodeURIComponent(order.order_id)}/pay`);
    },
  });

  if (items.length === 0) {
    return (
      <>
        <PageHeader title="Checkout" />
        <EmptyState
          title="Nothing to check out"
          description="Add products to your cart first."
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
      <PageHeader title="Checkout" description="Review your order, shipping and payment." />

      <div className="grid gap-6 lg:grid-cols-[1fr_400px]">
        <div className="space-y-6">
          {/* Shipping mode */}
          <Card>
            <CardContent className="space-y-4 p-6">
              <h2 className="font-semibold">Shipping</h2>
              <RadioGroup value={mode} onValueChange={(v) => setMode(v as ShippingMode)} className="grid gap-3 sm:grid-cols-2">
                <ShippingOption
                  value="logistics"
                  selected={mode === "logistics"}
                  icon={Plane}
                  title="Jaratrade-arranged"
                  description="Pick a vetted logistics partner. We coordinate with the exporter."
                />
                <ShippingOption
                  value="self"
                  selected={mode === "self"}
                  icon={Package}
                  title="Importer-arranged"
                  description="Provide your own destination. The exporter ships to your address."
                />
              </RadioGroup>

              {mode === "logistics" ? (
                <div className="space-y-3 pt-2">
                  <p className="text-sm text-muted-foreground">Choose a logistics partner</p>
                  {logistics.isLoading ? (
                    <div className="space-y-2">
                      {Array.from({ length: 2 }).map((_, i) => (
                        <div key={i} className="h-16 animate-pulse rounded-md border bg-muted" />
                      ))}
                    </div>
                  ) : logistics.isError || (logistics.data?.rows ?? []).length === 0 ? (
                    <Alert>
                      <AlertDescription>
                        Logistics partners aren&apos;t available right now. Switch to &quot;Importer-arranged&quot; or contact support.
                      </AlertDescription>
                    </Alert>
                  ) : (
                    <RadioGroup value={logisticsId} onValueChange={setLogisticsId} className="space-y-2">
                      {(logistics.data?.rows ?? []).map((l: LogisticsCompany) => (
                        <label
                          key={l.id}
                          className={cn(
                            "flex cursor-pointer items-start gap-3 rounded-md border p-3 text-sm transition-colors",
                            logisticsId === l.id ? "border-primary bg-primary/5" : "hover:bg-muted/50",
                          )}
                        >
                          <RadioGroupItem value={l.id} id={`logi-${l.id}`} className="mt-0.5" />
                          <div className="flex-1">
                            <p className="font-medium">{l.name}</p>
                            <p className="text-xs text-muted-foreground">{l.description}</p>
                          </div>
                          <span className="text-sm font-semibold">{formatMoney(logisticsEstimate)}</span>
                        </label>
                      ))}
                    </RadioGroup>
                  )}
                </div>
              ) : null}
            </CardContent>
          </Card>

          {/* Delivery details */}
          <Card>
            <CardContent className="space-y-4 p-6">
              <h2 className="font-semibold">
                {mode === "logistics" ? "Delivery details" : "Your shipping address"}
              </h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Recipient" id="recipient_name" value={delivery.recipient_name} onChange={(v) => setDelivery({ ...delivery, recipient_name: v })} />
                <Field label="Phone" id="phone" type="tel" value={delivery.phone} onChange={(v) => setDelivery({ ...delivery, phone: v })} />
              </div>
              <Field label="Address" id="address" value={delivery.address} onChange={(v) => setDelivery({ ...delivery, address: v })} />
              <div className="grid gap-4 sm:grid-cols-3">
                <Field label="City" id="city" value={delivery.city} onChange={(v) => setDelivery({ ...delivery, city: v })} />
                <Field label="County / State" id="state" value={delivery.state} onChange={(v) => setDelivery({ ...delivery, state: v })} />
                <Field label="Postal code" id="postal_code" value={delivery.postal_code} onChange={(v) => setDelivery({ ...delivery, postal_code: v })} />
              </div>
              <Field label="Country" id="country" value={delivery.country} onChange={(v) => setDelivery({ ...delivery, country: v })} />
            </CardContent>
          </Card>

          <Alert variant="info">
            <ShieldCheck className="size-4" />
            <AlertDescription>
              Payment is held by Jaratrade until shipment is confirmed. You can release or dispute
              from your order page.
            </AlertDescription>
          </Alert>

          {placeOrder.isError ? (
            <Alert variant="destructive">
              <AlertDescription>{(placeOrder.error as Error).message}</AlertDescription>
            </Alert>
          ) : null}
        </div>

        {/* Summary */}
        <aside className="lg:sticky lg:top-20 lg:self-start">
          <Card>
            <CardContent className="space-y-4 p-6">
              <h2 className="font-semibold">Order summary</h2>
              <ul className="space-y-2 text-sm">
                {items.map((item) => (
                  <li key={item.product_id} className="flex justify-between gap-3">
                    <span className="line-clamp-1 text-muted-foreground">
                      {item.quantity}× {item.name}
                    </span>
                    <span className="tabular-nums">{formatMoney(item.subtotal)}</span>
                  </li>
                ))}
              </ul>
              <Separator />
              <dl className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Subtotal</dt>
                  <dd className="tabular-nums">{formatMoney(subtotal)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Platform fee (2%)</dt>
                  <dd className="tabular-nums">{formatMoney(platformFee)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground inline-flex items-center gap-1">
                    <Truck className="size-3" /> Logistics
                  </dt>
                  <dd className="tabular-nums">{mode === "self" ? "-" : formatMoney(logisticsEstimate)}</dd>
                </div>
              </dl>
              <Separator />
              <div className="flex items-baseline justify-between">
                <span className="text-sm text-muted-foreground">Total</span>
                <span className="text-xl font-bold tabular-nums">{formatMoney(total)}</span>
              </div>
              <Button
                size="lg"
                className="w-full"
                loading={placeOrder.isPending}
                onClick={() => placeOrder.mutate()}
                disabled={
                  !delivery.address ||
                  !delivery.recipient_name ||
                  !delivery.phone ||
                  (mode === "logistics" && !logisticsId)
                }
              >
                Place order · {formatMoney(total)}
              </Button>
              <p className="text-center text-xs text-muted-foreground">
                Pay securely via Flutterwave on the next step.
              </p>
            </CardContent>
          </Card>

          <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-xs text-muted-foreground">
            <Badge variant="outline">PCI-DSS compliant</Badge>
            <Badge variant="outline">3DS verified</Badge>
            <Badge variant="outline">Funds held in escrow</Badge>
          </div>
        </aside>
      </div>
    </>
  );
}

function Field({
  label,
  id,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  id: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <Input id={id} type={type} value={value} onChange={(e) => onChange(e.target.value)} required />
    </div>
  );
}

function ShippingOption({
  value,
  selected,
  icon: Icon,
  title,
  description,
}: {
  value: ShippingMode;
  selected: boolean;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
}) {
  return (
    <label
      className={cn(
        "flex cursor-pointer flex-col gap-2 rounded-md border p-4 text-left transition-colors",
        selected ? "border-primary bg-primary/5" : "hover:bg-muted/50",
      )}
    >
      <div className="flex items-center gap-2">
        <RadioGroupItem value={value} id={`mode-${value}`} />
        <Icon className="size-4 text-primary" />
        <span className="font-medium">{title}</span>
      </div>
      <p className="text-xs text-muted-foreground">{description}</p>
    </label>
  );
}

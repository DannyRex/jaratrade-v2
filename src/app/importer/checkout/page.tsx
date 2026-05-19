"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Truck, Package, ShieldCheck, Plane, MapPin, Plus } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
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
import { Checkbox } from "@/components/ui/checkbox";
import { useCart } from "@/lib/cart-store";
import { queryKeys, useLogistics } from "@/lib/queries";
import { useAuth } from "@/lib/auth-store";
import { formatMoney } from "@/lib/format";
import { importerApi } from "@/lib/api";
import type { LogisticsCompany, ShippingAddress } from "@/lib/types";
import { cn } from "@/lib/utils";

type ShippingMode = "self" | "logistics";

const NEW_ADDRESS = "__new__";

export default function CheckoutPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const items = useCart((s) => s.items);
  const clearCart = useCart((s) => s.clear);
  const remoteCartId = useCart((s) => s.remoteCartId);
  const user = useAuth((s) => s.user);
  const logistics = useLogistics();

  // Load saved shipping addresses
  const addresses = useQuery<ShippingAddress[]>({
    queryKey: ["importer-shipping"],
    queryFn: () => importerApi.getShipping(),
    staleTime: 60_000,
  });

  const [mode, setMode] = useState<ShippingMode>("logistics");
  const [logisticsId, setLogisticsId] = useState<string>("");

  // `pickedAddressId` is whatever the user explicitly selected. While it's
  // null we fall back to the default saved address (or "__new__" if there
  // isn't one). Deriving the active selection this way means we never need
  // to setState in an effect.
  const [pickedAddressId, setPickedAddressId] = useState<string | null>(null);
  // `manualDelivery` holds the form values when the user is editing a fresh
  // address. We only consult it when selectedAddressId === NEW_ADDRESS.
  const [manualDelivery, setManualDelivery] = useState({
    recipient_name: user ? `${user.firstname} ${user.lastname}`.trim() : "",
    phone: user?.phone ?? "",
    address: "",
    city: "",
    state: "",
    country: "United Kingdom",
    postal_code: "",
  });
  const [saveAddress, setSaveAddress] = useState(true);
  const [makeDefault, setMakeDefault] = useState(false);

  // Derived: the currently-selected address ID. Prefers user pick, falls
  // back to default-on-file, otherwise "new".
  const selectedAddressId = useMemo(() => {
    if (pickedAddressId) return pickedAddressId;
    const rows = addresses.data ?? [];
    if (rows.length === 0) return NEW_ADDRESS;
    const def = rows.find((a) => a.is_default === 1) ?? rows[0];
    return def.id;
  }, [pickedAddressId, addresses.data]);

  const activeAddress = useMemo(() => {
    if (selectedAddressId === NEW_ADDRESS) return null;
    return (addresses.data ?? []).find((a) => a.id === selectedAddressId) ?? null;
  }, [addresses.data, selectedAddressId]);

  // Derived: the delivery form data sent to the API. When a saved address is
  // selected we use its fields; in "new" mode we use the manual form state.
  const delivery = useMemo(() => {
    if (activeAddress) {
      return {
        recipient_name: activeAddress.recipient_name,
        phone: activeAddress.phone,
        address: activeAddress.address,
        city: activeAddress.city,
        state: activeAddress.state ?? "",
        country: activeAddress.country,
        postal_code: activeAddress.postal_code ?? "",
      };
    }
    return manualDelivery;
  }, [activeAddress, manualDelivery]);

  const isEditing = selectedAddressId === NEW_ADDRESS;

  const onPickAddress = (id: string) => {
    setPickedAddressId(id);
    if (id === NEW_ADDRESS) {
      setSaveAddress(true);
    } else {
      setSaveAddress(false);
    }
  };

  const subtotal = items.reduce((acc, i) => acc + i.subtotal, 0);
  const platformFee = subtotal * 0.02;
  const logisticsEstimate = mode === "logistics" ? subtotal * 0.05 : 0;
  const total = subtotal + platformFee + logisticsEstimate;

  const placeOrder = useMutation({
    mutationFn: async () => {
      if (!remoteCartId) {
        throw new Error("Cart sync required - please add at least one item to your live cart.");
      }
      // If the user typed a new address and asked to save it, persist before
      // we create the order so they can pick it next time.
      if (selectedAddressId === NEW_ADDRESS && saveAddress) {
        try {
          await importerApi.addShipping({
            recipient_name: delivery.recipient_name,
            phone: delivery.phone,
            address: delivery.address,
            city: delivery.city,
            state: delivery.state,
            country: delivery.country,
            postal_code: delivery.postal_code,
            is_default: makeDefault ? 1 : 0,
          });
        } catch (err) {
          // Saving the address is best-effort - never block the actual order.
          console.warn("Save shipping address failed:", err);
        }
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
      toast.success("Order placed", { description: "Redirecting you to payment..." });
      clearCart();
      // If we just saved a new shipping address as part of this checkout,
      // refresh the profile query so /importer/orders' progress bar ticks
      // the "Shipping address" checklist item next time the user lands.
      queryClient.invalidateQueries({ queryKey: queryKeys.importerShipping });
      queryClient.invalidateQueries({ queryKey: queryKeys.importerProfile });
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

  const addressRows = addresses.data ?? [];

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

          {/* Delivery details - saved addresses + new form */}
          <Card>
            <CardContent className="space-y-4 p-6">
              <div className="flex items-baseline justify-between gap-3">
                <h2 className="font-semibold">
                  {mode === "logistics" ? "Delivery details" : "Your shipping address"}
                </h2>
                <Link
                  href="/importer/shipping"
                  className="text-xs font-medium text-primary hover:underline"
                >
                  Manage addresses
                </Link>
              </div>

              {/* Saved addresses picker (if any) */}
              {addresses.isLoading ? (
                <div className="space-y-2">
                  {Array.from({ length: 2 }).map((_, i) => (
                    <div key={i} className="h-16 animate-pulse rounded-md border bg-muted" />
                  ))}
                </div>
              ) : addressRows.length > 0 ? (
                <RadioGroup value={selectedAddressId} onValueChange={onPickAddress} className="space-y-2">
                  {addressRows.map((a) => (
                    <label
                      key={a.id}
                      className={cn(
                        "flex cursor-pointer items-start gap-3 rounded-md border p-3 text-sm transition-colors",
                        selectedAddressId === a.id ? "border-primary bg-primary/5" : "hover:bg-muted/50",
                      )}
                    >
                      <RadioGroupItem value={a.id} id={`addr-${a.id}`} className="mt-0.5" />
                      <div className="flex flex-1 flex-col gap-0.5">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-medium">{a.recipient_name}</span>
                          {a.is_default === 1 ? (
                            <Badge variant="secondary" className="text-[10px]">Default</Badge>
                          ) : null}
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {a.address}, {a.city}{a.state ? `, ${a.state}` : ""} {a.postal_code ?? ""} - {a.country}
                        </span>
                        <span className="text-xs text-muted-foreground">{a.phone}</span>
                      </div>
                      <MapPin className="size-4 shrink-0 text-muted-foreground" aria-hidden />
                    </label>
                  ))}
                  <label
                    className={cn(
                      "flex cursor-pointer items-center gap-3 rounded-md border border-dashed p-3 text-sm transition-colors",
                      selectedAddressId === NEW_ADDRESS ? "border-primary bg-primary/5" : "hover:bg-muted/50",
                    )}
                  >
                    <RadioGroupItem value={NEW_ADDRESS} id="addr-new" />
                    <Plus className="size-4 text-primary" aria-hidden />
                    <span className="font-medium">Use a different address</span>
                  </label>
                </RadioGroup>
              ) : (
                <p className="text-xs text-muted-foreground">
                  No saved addresses yet - your address below will be saved to your profile after you place this order.
                </p>
              )}

              {/* Editable form: shown when no saved address exists OR user picked "new" */}
              {(isEditing || addressRows.length === 0) ? (
                <div className="space-y-4 border-t pt-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Recipient" id="recipient_name" value={delivery.recipient_name} onChange={(v) => setManualDelivery({ ...manualDelivery,recipient_name: v })} />
                    <Field label="Phone" id="phone" type="tel" value={delivery.phone} onChange={(v) => setManualDelivery({ ...manualDelivery,phone: v })} />
                  </div>
                  <Field label="Address" id="address" value={delivery.address} onChange={(v) => setManualDelivery({ ...manualDelivery,address: v })} />
                  <div className="grid gap-4 sm:grid-cols-3">
                    <Field label="City" id="city" value={delivery.city} onChange={(v) => setManualDelivery({ ...manualDelivery,city: v })} />
                    <Field label="County / State" id="state" value={delivery.state} onChange={(v) => setManualDelivery({ ...manualDelivery,state: v })} />
                    <Field label="Postal code" id="postal_code" value={delivery.postal_code} onChange={(v) => setManualDelivery({ ...manualDelivery,postal_code: v })} />
                  </div>
                  <Field label="Country" id="country" value={delivery.country} onChange={(v) => setManualDelivery({ ...manualDelivery,country: v })} />

                  <div className="flex flex-col gap-2 rounded-md bg-muted/40 p-3 text-sm">
                    <label className="flex items-center gap-2">
                      <Checkbox
                        checked={saveAddress}
                        onCheckedChange={(v) => setSaveAddress(Boolean(v))}
                      />
                      <span>Save this address to my profile</span>
                    </label>
                    {saveAddress ? (
                      <label className="ml-6 flex items-center gap-2 text-xs text-muted-foreground">
                        <Checkbox
                          checked={makeDefault}
                          onCheckedChange={(v) => setMakeDefault(Boolean(v))}
                        />
                        <span>Set as my default shipping address</span>
                      </label>
                    ) : null}
                  </div>
                </div>
              ) : activeAddress ? (
                <p className="rounded-md bg-muted/40 p-3 text-xs text-muted-foreground">
                  Shipping to <strong className="text-foreground">{activeAddress.recipient_name}</strong> at{" "}
                  {activeAddress.address}, {activeAddress.city}{activeAddress.state ? `, ${activeAddress.state}` : ""} {activeAddress.postal_code ?? ""}, {activeAddress.country}.
                </p>
              ) : null}
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
                      {item.quantity}x {item.name}
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
                Place order - {formatMoney(total)}
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

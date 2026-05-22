"use client";

import { use } from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { OrderStatusBadge } from "@/components/order-status-badge";
import { importerApi } from "@/lib/api";
import { formatDate, formatMoney, shortId } from "@/lib/format";
import type { Order } from "@/lib/types";
import { ReviewPromptCard } from "@/components/review-prompt-card";
import { RaiseDisputeDialog } from "@/components/raise-dispute-dialog";
import { useImporterDisputes } from "@/lib/queries";

export default function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return <OrderDetail id={decodeURIComponent(id)} />;
}

function OrderDetail({ id }: { id: string }) {
  const queryClient = useQueryClient();
  const { data, isLoading, isError } = useQuery({
    queryKey: ["importer", "orders", id],
    queryFn: () => importerApi.getOrder(id) as Promise<Order>,
    enabled: Boolean(id),
  });
  // Match existing dispute against this order so we can show "View dispute"
  // instead of "Report issue" when one already exists.
  const { data: disputes } = useImporterDisputes();
  const existing = disputes?.rows.find((d) => d.order_id === id) ?? null;

  const confirmReceipt = useMutation({
    mutationFn: () => importerApi.confirmReceipt(id),
    onSuccess: (res) => {
      if (res.already_confirmed) {
        toast.message("Already confirmed", {
          description: "We have your receipt confirmation on file.",
        });
      } else {
        toast.success("Thanks for confirming!", {
          description: "We'll release the seller's payout right away.",
        });
      }
      queryClient.invalidateQueries({ queryKey: ["importer", "orders", id] });
      queryClient.invalidateQueries({ queryKey: ["importer", "orders"] });
    },
    onError: (e: unknown) => {
      toast.error("Couldn't confirm receipt", {
        description: e instanceof Error ? e.message : "Please try again.",
      });
    },
  });

  if (isError) {
    return (
      <>
        <PageHeader title="Order not found" />
        <Button asChild variant="outline">
          <Link href="/importer/orders">
            <ArrowLeft className="size-4" /> Back to orders
          </Link>
        </Button>
      </>
    );
  }

  if (isLoading || !data) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-72" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <>
      <Button asChild variant="ghost" size="sm" className="mb-3 -ml-2">
        <Link href="/importer/orders">
          <ArrowLeft className="size-4" /> All orders
        </Link>
      </Button>

      <PageHeader
        title={`Order ${shortId(data.order_id ?? data.id, 12)}`}
        description={`Placed ${formatDate(data.time_created)}`}
        actions={
          <div className="flex items-center gap-2">
            <OrderStatusBadge
              status={data.status}
              confirmedReceived={Boolean(data.confirmed_received_at)}
            />
            {/* Buyer can dispute only on shipped/delivered orders that aren't
                already disputed. Refunded/cancelled orders skip this. */}
            {existing ? (
              <Button asChild variant="outline" size="sm">
                <Link href={`/importer/disputes/${encodeURIComponent(existing.id)}`}>
                  View dispute
                </Link>
              </Button>
            ) : data.status === "delivered" || data.status === "shipped" ? (
              <RaiseDisputeDialog orderId={data.id} />
            ) : null}
          </div>
        }
      />

      {/* Confirm-receipt nudge: shows only on delivered orders that the buyer
          hasn't confirmed yet. Pressing the button releases escrow immediately
          (otherwise we wait 1 day). */}
      {data.status === "delivered" && !data.confirmed_received_at ? (
        <Alert variant="info" className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="size-5 shrink-0 text-primary" />
            <AlertDescription className="flex-1">
              The exporter marked this order as delivered. Once you confirm receipt
              we&apos;ll release their payout right away - otherwise we hold it for 1
              day in case you need to raise a dispute.
            </AlertDescription>
          </div>
          <Button
            onClick={() => confirmReceipt.mutate()}
            loading={confirmReceipt.isPending}
            className="shrink-0"
          >
            Confirm receipt
          </Button>
        </Alert>
      ) : null}

      {data.confirmed_received_at ? (
        <Alert variant="success" className="mb-6">
          <CheckCircle2 className="size-4" />
          <AlertDescription>
            You confirmed receipt on {formatDate(data.confirmed_received_at)}. The seller&apos;s
            payout has been released.
          </AlertDescription>
        </Alert>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          <Card>
            <CardContent className="space-y-3 p-6">
              <h2 className="font-semibold">Items</h2>
              <ul className="divide-y">
                {(data.items ?? []).map((item) => (
                  <li key={item.id} className="flex justify-between py-3 text-sm">
                    <div className="space-y-0.5">
                      <p className="font-medium">{item.product_name}</p>
                      <p className="text-xs text-muted-foreground">
                        {item.quantity} × {formatMoney(item.unit_price, data.currency)}
                      </p>
                    </div>
                    <p className="font-medium tabular-nums">{formatMoney(item.subtotal, data.currency)}</p>
                  </li>
                ))}
                {(data.items?.length ?? 0) === 0 ? (
                  <li className="py-6 text-center text-sm text-muted-foreground">No item details available.</li>
                ) : null}
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="space-y-3 p-6">
              <h2 className="font-semibold">Shipping</h2>
              <ShippingAddress info={data.delivery_info} />
            </CardContent>
          </Card>

          {/* Reviews are unlocked once the order is delivered */}
          {data.status === "delivered" && data.exporter_id ? (
            <ReviewPromptCard
              orderId={data.id}
              exporterId={data.exporter_id}
            />
          ) : null}
        </div>

        <aside>
          <Card>
            <CardContent className="space-y-3 p-6">
              <h2 className="font-semibold">Summary</h2>
              <dl className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Subtotal</dt>
                  <dd className="tabular-nums">{formatMoney(data.total, data.currency)}</dd>
                </div>
              </dl>
              <Separator />
              <div className="flex justify-between font-bold">
                <span>Total</span>
                <span className="tabular-nums">{formatMoney(data.total, data.currency)}</span>
              </div>
              {data.status === "pending" ? (
                <Button asChild className="w-full">
                  <Link href={`/importer/orders/${encodeURIComponent(data.id)}/pay`}>Pay now</Link>
                </Button>
              ) : null}
            </CardContent>
          </Card>
        </aside>
      </div>
    </>
  );
}

/** Render a delivery address from whatever shape checkout saved. Replaces
 *  the previous raw JSON dump that was both ugly and unusable on mobile. */
function ShippingAddress({ info }: { info: Record<string, unknown> | null | undefined }) {
  const d = (info ?? {}) as Record<string, unknown>;
  const get = (...keys: string[]): string | null => {
    for (const k of keys) {
      const v = d[k];
      if (v != null && v !== "") return String(v);
    }
    return null;
  };
  const name = get("name", "recipient", "full_name");
  const lines = [
    get("address", "address_line1", "line1", "street"),
    get("address_line2", "line2", "apartment"),
    get("city", "town"),
    get("state", "region", "county"),
    get("postcode", "postal_code", "zip", "zipcode"),
    get("country"),
  ].filter((s): s is string => Boolean(s));
  const phone = get("phone", "telephone");
  if (!name && lines.length === 0 && !phone) {
    return <p className="text-sm text-muted-foreground">No delivery details on file.</p>;
  }
  return (
    <address className="not-italic text-sm leading-relaxed">
      {name ? <p className="font-medium text-foreground">{name}</p> : null}
      {lines.map((line, i) => (
        <p key={i} className="text-muted-foreground">
          {line}
        </p>
      ))}
      {phone ? <p className="mt-2 text-xs text-muted-foreground">Tel: {phone}</p> : null}
    </address>
  );
}

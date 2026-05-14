"use client";

import { use } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/ui/page-header";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { importerApi } from "@/lib/api";
import { formatDate, formatMoney, shortId } from "@/lib/format";
import type { Order } from "@/lib/types";
import { ReviewPromptCard } from "@/components/review-prompt-card";

export default function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return <OrderDetail id={decodeURIComponent(id)} />;
}

function OrderDetail({ id }: { id: string }) {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["importer", "orders", id],
    queryFn: () => importerApi.getOrder(id) as Promise<Order>,
    enabled: Boolean(id),
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
        actions={<Badge variant="secondary">{data.status}</Badge>}
      />

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
              <pre className="overflow-x-auto rounded-md bg-muted/50 p-3 text-xs text-muted-foreground">
                {JSON.stringify(data.delivery_info ?? {}, null, 2)}
              </pre>
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

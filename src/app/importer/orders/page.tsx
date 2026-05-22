"use client";

import Link from "next/link";
import { Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/data-table";
import { ProfileProgress } from "@/components/profile-progress";
import { OrderStatusBadge } from "@/components/order-status-badge";
import { useImporterOrders } from "@/lib/queries";
import { formatDate, formatMoney, shortId } from "@/lib/format";
import type { Order } from "@/lib/types";

export default function ImporterOrdersPage() {
  const { data, isLoading, isError, refetch } = useImporterOrders();
  const orders = (data?.data ?? []) as Order[];

  return (
    <>
      <PageHeader
        title="My orders"
        description="Track every order you've placed on Jaratrade."
        actions={
          <Button asChild variant="outline">
            <Link href="/products">Browse marketplace</Link>
          </Button>
        }
      />

      <ProfileProgress role="importer" />

      {isError ? (
        <EmptyState
          title="Couldn't load orders"
          description="Try again in a moment."
          action={<Button onClick={() => refetch()}>Retry</Button>}
        />
      ) : isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <EmptyState
          icon={<Package />}
          title="No orders yet"
          description="When you place an order, it'll show up here."
          action={
            <Button asChild>
              <Link href="/products">Find products</Link>
            </Button>
          }
        />
      ) : (
        <>
          {/* Mobile: card list. Five-column tables are unusable on a phone,
              so each order becomes a tap-target card with the key fields. */}
          <ul className="space-y-3 sm:hidden">
            {orders.map((order) => (
              <li key={order.id}>
                <Link
                  href={`/importer/orders/${encodeURIComponent(order.id)}`}
                  className="block rounded-lg border bg-card p-4 transition-colors hover:bg-muted/40"
                >
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="font-mono text-sm font-semibold">
                      {shortId(order.order_id ?? order.id, 12)}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {formatDate(order.time_created)}
                    </span>
                  </div>
                  <div className="mt-3 flex items-center justify-between gap-2">
                    <OrderStatusBadge
                      status={order.status}
                      confirmedReceived={Boolean(order.confirmed_received_at)}
                    />
                    <span className="text-base font-bold tabular-nums">
                      {formatMoney(order.total, order.currency)}
                    </span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
          {/* Tablet / desktop: table. */}
          <div className="hidden sm:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">{shortId(order.order_id ?? order.id, 12)}</TableCell>
                    <TableCell className="text-muted-foreground">{formatDate(order.time_created)}</TableCell>
                    <TableCell>
                      <OrderStatusBadge
                        status={order.status}
                        confirmedReceived={Boolean(order.confirmed_received_at)}
                      />
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {formatMoney(order.total, order.currency)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button asChild variant="ghost" size="sm">
                        <Link href={`/importer/orders/${encodeURIComponent(order.id)}`}>View →</Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </>
      )}
    </>
  );
}

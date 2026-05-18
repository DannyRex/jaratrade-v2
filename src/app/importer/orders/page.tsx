"use client";

import Link from "next/link";
import { Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/data-table";
import { ProfileProgress } from "@/components/profile-progress";
import { useImporterOrders } from "@/lib/queries";
import { formatDate, formatMoney, shortId } from "@/lib/format";
import type { Order } from "@/lib/types";

const statusVariant: Record<string, "secondary" | "warning" | "success" | "destructive"> = {
  pending: "warning",
  paid: "secondary",
  shipped: "secondary",
  delivered: "success",
  cancelled: "destructive",
  failed: "destructive",
};

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
                  <Badge variant={statusVariant[order.status] ?? "secondary"}>{order.status}</Badge>
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
      )}
    </>
  );
}

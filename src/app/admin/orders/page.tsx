"use client";

import { Package } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/data-table";
import { adminApi } from "@/lib/api";
import { useAuth } from "@/lib/auth-store";
import { formatDate, formatMoney, shortId } from "@/lib/format";
import type { Order } from "@/lib/types";

export default function AdminOrdersPage() {
  const isAdmin = useAuth((s) => Boolean(s.token) && s.role === "admin");
  const { data, isLoading } = useQuery({
    queryKey: ["admin", "orders"],
    queryFn: () => adminApi.viewLogisticsOrders() as Promise<{ rows?: Order[]; orders?: Order[] }>,
    enabled: isAdmin,
  });

  const orders: Order[] = data?.rows ?? data?.orders ?? [];

  return (
    <>
      <PageHeader title="Orders" description="All orders across the platform." />
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <EmptyState icon={<Package />} title="No orders yet" description="Orders will appear here once buyers start checking out." />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((o) => (
              <TableRow key={o.id}>
                <TableCell className="font-mono text-xs">{shortId(o.order_id ?? o.id)}</TableCell>
                <TableCell className="text-muted-foreground">{formatDate(o.time_created)}</TableCell>
                <TableCell>
                  <Badge variant="secondary">{o.status}</Badge>
                </TableCell>
                <TableCell className="text-right tabular-nums">{formatMoney(o.total, o.currency)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </>
  );
}

"use client";

import { useState } from "react";
import { Truck } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/data-table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { exporterApi } from "@/lib/api";
import { useAuth } from "@/lib/auth-store";
import { formatDate, formatMoney, shortId } from "@/lib/format";
import type { Order } from "@/lib/types";

const statuses = [
  { value: "confirmed", label: "Confirmed" },
  { value: "preparing", label: "Preparing" },
  { value: "shipped", label: "Shipped" },
  { value: "delivered", label: "Delivered" },
  { value: "cancelled", label: "Cancelled" },
];

export default function ExporterOrdersPage() {
  const isAuthed = useAuth((s) => Boolean(s.token) && s.role === "exporter");
  const { data, isLoading } = useQuery({
    queryKey: ["exporter", "orders"],
    queryFn: () => exporterApi.profile() as Promise<{ orders?: Order[] }>,
    enabled: isAuthed,
  });
  const orders = data?.orders ?? [];

  const [active, setActive] = useState<Order | null>(null);

  return (
    <>
      <PageHeader title="Orders" description="Confirm payments, dispatch shipments and track deliveries." />

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <EmptyState icon={<Truck />} title="No orders yet" description="Once buyers place orders, they appear here." />
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
                  <Badge variant="secondary">{order.status}</Badge>
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {formatMoney(order.total, order.currency)}
                </TableCell>
                <TableCell className="text-right">
                  <Button size="sm" variant="ghost" onClick={() => setActive(order)}>
                    Update →
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <UpdateStatusDialog order={active} onClose={() => setActive(null)} />
    </>
  );
}

function UpdateStatusDialog({ order, onClose }: { order: Order | null; onClose: () => void }) {
  const qc = useQueryClient();
  const [status, setStatus] = useState(order?.status ?? "confirmed");

  const update = useMutation({
    mutationFn: () => exporterApi.updateOrderStatus({ order_id: order!.id, status }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["exporter", "orders"] });
      toast.success("Order updated");
      onClose();
    },
  });

  return (
    <Dialog open={Boolean(order)} onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Update order status</DialogTitle>
          <DialogDescription>{shortId(order?.id ?? "", 12)}</DialogDescription>
        </DialogHeader>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {statuses.map((s) => (
              <SelectItem key={s.value} value={s.value}>
                {s.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={() => update.mutate()} loading={update.isPending}>
            Update status
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

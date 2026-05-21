"use client";

import { useState } from "react";
import { Truck } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { OrderStatusBadge } from "@/components/order-status-badge";
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

// Orders move strictly forward, one step at a time. The dropdown only ever
// offers the valid next status(es) for an order's current state, so a status
// can't be set out of sequence. Mirrors the backend guard in exporter.py.
const STATUS_TRANSITIONS: Record<string, { value: string; label: string }[]> = {
  paid: [
    { value: "confirmed", label: "Confirmed" },
    { value: "cancelled", label: "Cancelled" },
  ],
  confirmed: [
    { value: "preparing", label: "Preparing" },
    { value: "cancelled", label: "Cancelled" },
  ],
  preparing: [
    { value: "shipped", label: "Shipped" },
    { value: "cancelled", label: "Cancelled" },
  ],
  shipped: [{ value: "delivered", label: "Delivered" }],
};

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
                  <OrderStatusBadge
                    status={order.status}
                    confirmedReceived={Boolean(order.confirmed_received_at)}
                  />
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {formatMoney(order.total, order.currency)}
                </TableCell>
                <TableCell className="text-right">
                  {(STATUS_TRANSITIONS[order.status]?.length ?? 0) > 0 ? (
                    <Button size="sm" variant="ghost" onClick={() => setActive(order)}>
                      Update
                    </Button>
                  ) : (
                    <span className="text-xs text-muted-foreground">No action</span>
                  )}
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
  return (
    <Dialog open={Boolean(order)} onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        {order ? <UpdateStatusForm key={order.id} order={order} onClose={onClose} /> : null}
      </DialogContent>
    </Dialog>
  );
}

function UpdateStatusForm({ order, onClose }: { order: Order; onClose: () => void }) {
  const qc = useQueryClient();
  // Only the valid next status(es) for this order's current state.
  const options = STATUS_TRANSITIONS[order.status] ?? [];
  const [status, setStatus] = useState(options[0]?.value ?? "");

  const update = useMutation({
    mutationFn: () => exporterApi.updateOrderStatus({ order_id: order.id, status }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["exporter", "orders"] });
      toast.success("Order updated");
      onClose();
    },
    onError: (err) =>
      toast.error("Couldn't update order", {
        description: err instanceof Error ? err.message : "Try again.",
      }),
  });

  return (
    <>
      <DialogHeader>
        <DialogTitle>Update order status</DialogTitle>
        <DialogDescription>{shortId(order.id, 12)}</DialogDescription>
      </DialogHeader>
      {options.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          This order is {order.status} and can&apos;t be moved any further.
        </p>
      ) : (
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">
            Orders progress one step at a time. Choose the next status:
          </p>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {options.map((s) => (
                <SelectItem key={s.value} value={s.value}>
                  {s.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
      <DialogFooter>
        <Button variant="outline" onClick={onClose}>
          {options.length === 0 ? "Close" : "Cancel"}
        </Button>
        {options.length > 0 ? (
          <Button onClick={() => update.mutate()} loading={update.isPending}>
            Update status
          </Button>
        ) : null}
      </DialogFooter>
    </>
  );
}

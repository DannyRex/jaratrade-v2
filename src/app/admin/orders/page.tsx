"use client";

/**
 * /admin/orders - platform-wide order overview.
 *
 * What admin needs in one place:
 *   - Headline numbers: total orders, GMV, pending payouts, open disputes
 *   - Filter by status (chips) + free-text search (order #, buyer email, seller business)
 *   - Rich rows: buyer, seller, items, status, payment + payout state
 *   - Click a row -> Sheet drawer with full breakdown + line items + audit trail
 *   - Pagination
 *
 * Behaviour is read-only here on purpose - status transitions belong to the
 * exporter side, payouts to /admin/payouts, disputes to /admin/disputes. We
 * deep-link into those rather than duplicate their controls.
 */
import { useMemo, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  Banknote,
  ChevronLeft,
  ChevronRight,
  Filter,
  Package,
  RefreshCw,
  Search,
  ShieldAlert,
  TrendingUp,
  X,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/data-table";
import { OrderStatusBadge } from "@/components/order-status-badge";
import { adminApi, type AdminOrderDetail } from "@/lib/api";
import { useAuth } from "@/lib/auth-store";
import { formatDate, formatMoney, shortId } from "@/lib/format";
import { cn } from "@/lib/utils";

const STATUS_FILTERS = [
  { value: "", label: "All" },
  { value: "pending", label: "Pending payment" },
  { value: "paid", label: "Paid" },
  { value: "confirmed", label: "Confirmed" },
  { value: "preparing", label: "Preparing" },
  { value: "shipped", label: "Shipped" },
  { value: "delivered", label: "Delivered" },
  { value: "cancelled", label: "Cancelled" },
  { value: "refunded", label: "Refunded" },
] as const;

const PAGE_SIZE = 25;

// Mirror of the backend payout rule (payouts.py): a delivered order is only
// payable once the buyer confirms receipt OR the 1-day dispute window closes.
const DISPUTE_WINDOW_DAYS = 1;

/**
 * When can the seller be paid for this order? Keeps the order drawer honest:
 * a freshly-delivered order reports "waiting", so we don't dangle a "Release
 * payout" button that just lands the admin on an empty payouts queue.
 */
function payoutEligibility(o: AdminOrderDetail): {
  state: "n/a" | "dispatched" | "eligible" | "waiting";
  opensAt: Date | null;
} {
  if (o.payout_status != null) return { state: "dispatched", opensAt: null };
  if (o.status !== "delivered") return { state: "n/a", opensAt: null };
  if (o.confirmed_received_at) return { state: "eligible", opensAt: null };
  const opensAt = new Date(
    new Date(o.time_updated).getTime() + DISPUTE_WINDOW_DAYS * 86_400_000,
  );
  return opensAt.getTime() <= Date.now()
    ? { state: "eligible", opensAt: null }
    : { state: "waiting", opensAt };
}

export default function AdminOrdersPage() {
  const isAdmin = useAuth((s) => Boolean(s.token) && s.role === "admin");
  const [status, setStatus] = useState<string>("");
  const [searchInput, setSearchInput] = useState("");
  // Debounced search - we only commit on Enter / blur / explicit button so we
  // don't fire a request on every keystroke.
  const [q, setQ] = useState("");
  const [page, setPage] = useState(0);
  const [activeId, setActiveId] = useState<string | null>(null);

  const stats = useQuery({
    queryKey: ["admin", "orders", "stats"],
    queryFn: adminApi.orderStats,
    enabled: isAdmin,
  });

  const list = useQuery({
    queryKey: ["admin", "orders", { status, q, page }],
    queryFn: () =>
      adminApi.listOrders({
        status: status || undefined,
        q: q || undefined,
        p: page,
        len: PAGE_SIZE,
      }),
    enabled: isAdmin,
    placeholderData: (prev) => prev,
  });

  const rows = list.data?.rows ?? [];
  const total = list.data?.total_length ?? 0;
  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const onSearch = () => {
    setQ(searchInput.trim());
    setPage(0);
  };

  const clearSearch = () => {
    setSearchInput("");
    setQ("");
    setPage(0);
  };

  const refresh = () => {
    stats.refetch();
    list.refetch();
  };

  const summary = stats.data;

  return (
    <>
      <PageHeader
        title="Orders"
        description="Every order across the platform - buyers, sellers, payments and payouts in one place."
        actions={
          <Button variant="outline" size="sm" onClick={refresh}>
            <RefreshCw className="size-4" /> Refresh
          </Button>
        }
      />

      {/* Stat cards */}
      <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={<Package className="size-4" />}
          label="Total orders"
          value={summary ? summary.total_orders.toLocaleString() : null}
          loading={stats.isLoading}
        />
        <StatCard
          icon={<TrendingUp className="size-4" />}
          label="Gross merchandise"
          value={summary ? formatMoney(summary.gmv, "NGN") : null}
          loading={stats.isLoading}
        />
        <StatCard
          icon={<Banknote className="size-4" />}
          label="Pending payouts"
          value={summary ? summary.pending_payouts.toLocaleString() : null}
          loading={stats.isLoading}
          href="/admin/payouts"
          tone={summary && summary.pending_payouts > 0 ? "warning" : undefined}
        />
        <StatCard
          icon={<ShieldAlert className="size-4" />}
          label="Open disputes"
          value={summary ? summary.open_disputes.toLocaleString() : null}
          loading={stats.isLoading}
          href="/admin/disputes"
          tone={summary && summary.open_disputes > 0 ? "destructive" : undefined}
        />
      </div>

      {/* Filters + search */}
      <Card className="mb-4">
        <CardContent className="space-y-3 p-4">
          <div className="flex flex-wrap items-center gap-2">
            <Filter className="size-4 text-muted-foreground" aria-hidden />
            {STATUS_FILTERS.map((f) => {
              const count = summary?.by_status?.[f.value];
              const active = status === f.value;
              return (
                <button
                  key={f.value || "all"}
                  type="button"
                  onClick={() => {
                    setStatus(f.value);
                    setPage(0);
                  }}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                    active
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-background hover:bg-muted",
                  )}
                  aria-pressed={active}
                >
                  {f.label}
                  {!f.value && summary ? (
                    <Badge variant="outline" className="px-1.5 text-[10px]">
                      {summary.total_orders}
                    </Badge>
                  ) : f.value && count != null ? (
                    <Badge variant="outline" className="px-1.5 text-[10px]">
                      {count}
                    </Badge>
                  ) : null}
                </button>
              );
            })}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative flex-1 min-w-[220px]">
              <Search
                className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden
              />
              <Input
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") onSearch();
                }}
                onBlur={() => {
                  if (searchInput.trim() !== q) onSearch();
                }}
                placeholder="Search order #, buyer email, or seller business..."
                className="pl-9 pr-9"
              />
              {searchInput ? (
                <button
                  type="button"
                  onClick={clearSearch}
                  aria-label="Clear search"
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-muted-foreground hover:bg-muted"
                >
                  <X className="size-3.5" />
                </button>
              ) : null}
            </div>
            <Button onClick={onSearch} size="sm">
              Search
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      {list.isLoading && !list.data ? (
        <div className="space-y-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-14 w-full" />
          ))}
        </div>
      ) : rows.length === 0 ? (
        <EmptyState
          icon={<Package />}
          title={q || status ? "No orders match those filters" : "No orders yet"}
          description={
            q || status
              ? "Try clearing the search or picking a different status."
              : "Orders will appear here once buyers start checking out."
          }
          action={
            q || status ? (
              <Button
                variant="outline"
                onClick={() => {
                  setStatus("");
                  clearSearch();
                }}
              >
                Clear filters
              </Button>
            ) : undefined
          }
        />
      ) : (
        <>
          {/* Mobile: tap-target cards. An 8-col table on a phone is unreadable;
              this surface what admin actually scans for (order #, buyer/seller,
              status pills, total) and opens the same drawer on tap. */}
          <ul className="space-y-3 sm:hidden">
            {rows.map((o) => (
              <li key={o.id}>
                <button
                  type="button"
                  onClick={() => setActiveId(o.id)}
                  className="block w-full rounded-lg border bg-card p-4 text-left transition-colors hover:bg-muted/40"
                >
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="font-mono text-sm font-semibold">
                      {shortId(o.order_id ?? o.id, 12)}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {formatDate(o.time_created)}
                    </span>
                  </div>
                  <dl className="mt-2 space-y-1 text-xs">
                    <div className="flex justify-between gap-2">
                      <dt className="text-muted-foreground">Buyer</dt>
                      <dd className="truncate text-right font-medium">{o.buyer.name ?? o.buyer.email ?? "-"}</dd>
                    </div>
                    <div className="flex justify-between gap-2">
                      <dt className="text-muted-foreground">Seller</dt>
                      <dd className="truncate text-right font-medium">{o.seller.business_name ?? o.seller.email ?? "-"}</dd>
                    </div>
                  </dl>
                  <div className="mt-3 flex flex-wrap items-center gap-1.5">
                    <OrderStatusBadge
                      status={o.status}
                      confirmedReceived={Boolean(o.confirmed_received_at)}
                    />
                    {o.has_dispute ? (
                      <span title="Open dispute" className="inline-flex">
                        <AlertTriangle className="size-3.5 text-destructive" aria-label="Open dispute" />
                      </span>
                    ) : null}
                    <PaymentChip status={o.payment_status} />
                    <PayoutChip status={o.payout_status} />
                  </div>
                  <div className="mt-3 flex items-baseline justify-between">
                    <span className="text-[11px] text-muted-foreground">
                      {o.items_count} {o.items_count === 1 ? "item" : "items"}
                    </span>
                    <span className="text-base font-bold tabular-nums">
                      {formatMoney(o.total, o.currency)}
                    </span>
                  </div>
                </button>
              </li>
            ))}
          </ul>
          {/* Tablet / desktop: full 8-col table. */}
          <div className="hidden sm:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order</TableHead>
                  <TableHead>Buyer</TableHead>
                  <TableHead>Seller</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Payment</TableHead>
                  <TableHead>Payout</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead className="text-right">Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((o) => (
                  <TableRow
                    key={o.id}
                    onClick={() => setActiveId(o.id)}
                    className="cursor-pointer hover:bg-muted/40"
                  >
                    <TableCell>
                      <div className="font-mono text-xs">{shortId(o.order_id ?? o.id, 12)}</div>
                      <div className="text-[10px] text-muted-foreground">
                        {o.items_count} {o.items_count === 1 ? "item" : "items"}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm font-medium">{o.buyer.name ?? "-"}</div>
                      <div className="text-[11px] text-muted-foreground">{o.buyer.email ?? ""}</div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm font-medium">{o.seller.business_name ?? "-"}</div>
                      <div className="text-[11px] text-muted-foreground">{o.seller.email ?? ""}</div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5">
                        <OrderStatusBadge
                          status={o.status}
                          confirmedReceived={Boolean(o.confirmed_received_at)}
                        />
                        {o.has_dispute ? (
                          <span title="Open dispute">
                            <AlertTriangle className="size-3.5 text-destructive" aria-label="Open dispute" />
                          </span>
                        ) : null}
                      </div>
                    </TableCell>
                    <TableCell>
                      <PaymentChip status={o.payment_status} />
                    </TableCell>
                    <TableCell>
                      <PayoutChip status={o.payout_status} />
                    </TableCell>
                    <TableCell className="text-right tabular-nums font-semibold">
                      {formatMoney(o.total, o.currency)}
                    </TableCell>
                    <TableCell className="text-right text-xs text-muted-foreground">
                      {formatDate(o.time_created)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {pageCount > 1 ? (
            <div className="mt-4 flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                Showing {page * PAGE_SIZE + 1}-{Math.min((page + 1) * PAGE_SIZE, total)} of {total}
              </span>
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page === 0}
                  onClick={() => setPage((n) => Math.max(0, n - 1))}
                >
                  <ChevronLeft className="size-4" /> Prev
                </Button>
                <span className="px-2 text-xs text-muted-foreground">
                  Page {page + 1} of {pageCount}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page + 1 >= pageCount}
                  onClick={() => setPage((n) => n + 1)}
                >
                  Next <ChevronRight className="size-4" />
                </Button>
              </div>
            </div>
          ) : null}
        </>
      )}

      <OrderDetailDrawer id={activeId} onClose={() => setActiveId(null)} />
    </>
  );
}

function StatCard({
  icon,
  label,
  value,
  loading,
  href,
  tone,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | null;
  loading?: boolean;
  href?: string;
  tone?: "warning" | "destructive";
}) {
  const inner = (
    <Card
      className={cn(
        "transition-colors",
        href ? "hover:border-primary/30 hover:shadow-sm" : "",
        tone === "warning" ? "border-warning/40 bg-warning/5" : "",
        tone === "destructive" ? "border-destructive/40 bg-destructive/5" : "",
      )}
    >
      <CardContent className="p-4">
        <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {icon}
          <span>{label}</span>
        </div>
        {loading ? (
          <Skeleton className="mt-2 h-7 w-24" />
        ) : (
          <p className="mt-1 font-display text-2xl font-bold tabular-nums tracking-tight">
            {value ?? "-"}
          </p>
        )}
      </CardContent>
    </Card>
  );
  return href ? <Link href={href}>{inner}</Link> : inner;
}

function PaymentChip({ status }: { status: string | null }) {
  if (!status) return <span className="text-xs text-muted-foreground">-</span>;
  const variant: "warning" | "success" | "destructive" | "secondary" =
    status === "successful" ? "success" : status === "failed" ? "destructive" : status === "pending" ? "warning" : "secondary";
  return (
    <Badge variant={variant} className="capitalize">
      {status}
    </Badge>
  );
}

function PayoutChip({ status }: { status: string | null }) {
  if (!status) {
    return <span className="text-xs text-muted-foreground">-</span>;
  }
  const variant: "warning" | "success" | "destructive" | "secondary" =
    status === "completed" ? "success" :
    status === "failed" ? "destructive" :
    status === "pending" ? "warning" : "secondary";
  return (
    <Badge variant={variant} className="capitalize">
      {status}
    </Badge>
  );
}

function OrderDetailDrawer({ id, onClose }: { id: string | null; onClose: () => void }) {
  const open = Boolean(id);
  const { data, isLoading, isError } = useQuery({
    queryKey: ["admin", "orders", "detail", id],
    queryFn: () => (id ? adminApi.getOrder(id) : Promise.reject(new Error("no id"))),
    enabled: Boolean(id),
  });

  const payout = data ? payoutEligibility(data) : null;

  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent side="right" className="flex w-full flex-col gap-0 overflow-y-auto sm:max-w-xl">
        <SheetHeader>
          <SheetTitle>
            {data ? `Order ${data.order_id}` : isLoading ? "Loading..." : "Order"}
          </SheetTitle>
          <SheetDescription>
            {data ? `Placed ${formatDate(data.time_created)}` : ""}
          </SheetDescription>
        </SheetHeader>

        {isError ? (
          <p className="p-6 text-sm text-destructive">Couldn&apos;t load this order.</p>
        ) : isLoading || !data ? (
          <div className="space-y-3 p-6">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-40 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
        ) : (
          <div className="space-y-5 p-6">
            {/* Status header */}
            <div className="flex flex-wrap items-center gap-2">
              <OrderStatusBadge
                status={data.status}
                confirmedReceived={Boolean(data.confirmed_received_at)}
              />
              <PaymentChip status={data.payment_status} />
              <PayoutChip status={data.payout_status} />
              {data.dispute ? (
                <Badge variant="destructive" className="capitalize">
                  Dispute: {data.dispute.status}
                </Badge>
              ) : null}
            </div>

            {/* Parties */}
            <div className="grid gap-3 sm:grid-cols-2">
              <DetailCard title="Buyer">
                <p className="font-medium">{data.buyer.name ?? "-"}</p>
                <p className="text-xs text-muted-foreground">{data.buyer.email}</p>
                {data.buyer.phone ? (
                  <p className="text-xs text-muted-foreground">{data.buyer.phone}</p>
                ) : null}
              </DetailCard>
              <DetailCard title="Seller">
                <p className="font-medium">{data.seller.business_name ?? "-"}</p>
                <p className="text-xs text-muted-foreground">{data.seller.email}</p>
                {data.seller.phone ? (
                  <p className="text-xs text-muted-foreground">{data.seller.phone}</p>
                ) : null}
              </DetailCard>
            </div>

            {/* Items */}
            <DetailCard title="Items">
              <ul className="divide-y text-sm">
                {data.items.map((it) => (
                  <li key={it.id} className="flex justify-between py-2">
                    <div>
                      <p className="font-medium">{it.product_name}</p>
                      <p className="text-xs text-muted-foreground">
                        {it.quantity} x {formatMoney(it.unit_price, data.currency)}
                      </p>
                    </div>
                    <p className="font-medium tabular-nums">
                      {formatMoney(it.subtotal, data.currency)}
                    </p>
                  </li>
                ))}
                {data.items.length === 0 ? (
                  <li className="py-3 text-center text-xs text-muted-foreground">
                    No line items
                  </li>
                ) : null}
              </ul>
            </DetailCard>

            {/* Money breakdown */}
            <DetailCard title="Totals">
              <dl className="space-y-1 text-sm">
                <Row k="Subtotal" v={formatMoney(data.total, data.currency)} />
                <Row k="Platform fee" v={formatMoney(data.platform_fee, data.currency)} />
                <Row k="Logistics fee" v={formatMoney(data.logistics_fee, data.currency)} />
                <Separator className="my-2" />
                <Row
                  k={<span className="font-semibold">Total</span>}
                  v={
                    <span className="font-display text-base font-bold tabular-nums">
                      {formatMoney(data.total, data.currency)}
                    </span>
                  }
                />
              </dl>
            </DetailCard>

            {/* Payments */}
            <DetailCard title="Payments">
              {data.payments.length === 0 ? (
                <p className="text-xs text-muted-foreground">No payment attempts yet.</p>
              ) : (
                <ul className="space-y-2 text-sm">
                  {data.payments.map((p) => (
                    <li key={p.id} className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate font-mono text-xs">{p.tx_ref}</p>
                        <p className="text-[10px] text-muted-foreground">
                          {p.provider} - {formatDate(p.time_created)}
                        </p>
                      </div>
                      <PaymentChip status={p.status} />
                      <p className="tabular-nums font-medium">
                        {formatMoney(p.amount, p.currency)}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </DetailCard>

            {/* Payouts */}
            <DetailCard title="Payouts">
              {data.payouts.length === 0 ? (
                payout?.state === "eligible" ? (
                  <p className="text-xs text-muted-foreground">
                    No payout dispatched yet - this order is eligible for release.{" "}
                    <Link href="/admin/payouts" className="text-primary hover:underline">
                      Go to payouts
                    </Link>
                  </p>
                ) : payout?.state === "waiting" ? (
                  <p className="text-xs text-muted-foreground">
                    No payout yet - eligible for release on{" "}
                    <span className="font-medium text-foreground">
                      {payout.opensAt ? formatDate(payout.opensAt.toISOString()) : ""}
                    </span>
                    , once the {DISPUTE_WINDOW_DAYS}-day dispute window closes.
                  </p>
                ) : (
                  <p className="text-xs text-muted-foreground">
                    No payout dispatched yet.
                  </p>
                )
              ) : (
                <ul className="space-y-2 text-sm">
                  {data.payouts.map((po) => (
                    <li key={po.id} className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate font-mono text-xs">{po.reference}</p>
                        <p className="text-[10px] text-muted-foreground">
                          {formatDate(po.time_created)}
                        </p>
                        {po.failure_reason ? (
                          <p className="line-clamp-1 text-[11px] text-destructive">
                            {po.failure_reason}
                          </p>
                        ) : null}
                      </div>
                      <PayoutChip status={po.status} />
                      <p className="tabular-nums font-medium">
                        {formatMoney(po.amount, po.currency)}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </DetailCard>

            {/* Delivery */}
            <DetailCard title="Delivery">
              <DeliveryBlock info={data.delivery_info} mode={data.shipping_mode} />
            </DetailCard>

            {/* Cross-links */}
            <div className="flex flex-wrap gap-2 pt-2">
              {data.dispute ? (
                <Button asChild variant="outline" size="sm">
                  <Link href={`/admin/disputes`}>
                    <ShieldAlert className="size-4" /> View dispute
                  </Link>
                </Button>
              ) : null}
              {payout?.state === "eligible" ? (
                <Button asChild variant="outline" size="sm">
                  <Link href="/admin/payouts">
                    <Banknote className="size-4" /> Release payout
                  </Link>
                </Button>
              ) : null}
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}

function DetailCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h3 className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
        {title}
      </h3>
      <div className="rounded-lg border bg-card p-3">{children}</div>
    </section>
  );
}

function Row({ k, v }: { k: React.ReactNode; v: React.ReactNode }) {
  return (
    <div className="flex justify-between">
      <dt className="text-muted-foreground">{k}</dt>
      <dd className="tabular-nums">{v}</dd>
    </div>
  );
}

function DeliveryBlock({
  info,
  mode,
}: {
  info: Record<string, unknown>;
  mode: string;
}) {
  const meaningful = useMemo(
    () =>
      Object.entries(info).filter(
        ([, v]) => v != null && v !== "" && typeof v !== "object",
      ),
    [info],
  );
  if (meaningful.length === 0) {
    return <p className="text-xs text-muted-foreground">Mode: {mode || "-"}. No delivery details on file.</p>;
  }
  return (
    <dl className="grid grid-cols-2 gap-x-3 gap-y-1 text-xs">
      <Row k="Mode" v={mode || "-"} />
      {meaningful.map(([k, v]) => (
        <Row key={k} k={k.replace(/_/g, " ")} v={String(v)} />
      ))}
    </dl>
  );
}

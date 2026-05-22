"use client";

/**
 * Buyer-side disputes inbox.
 *
 * Lists every dispute this importer has raised, with status pill + a deep link
 * into the detail page. Empty state nudges back to /orders since you can only
 * dispute existing orders.
 */
import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/data-table";
import { useImporterDisputes } from "@/lib/queries";
import { formatDate, formatMoney, shortId } from "@/lib/format";
import type { DisputeStatus } from "@/lib/types";

const STATUS_VARIANT: Record<DisputeStatus, "warning" | "secondary" | "success" | "destructive"> = {
  open: "warning",
  in_review: "secondary",
  resolved: "success",
  rejected: "destructive",
};

const REASON_LABEL: Record<string, string> = {
  damaged: "Damaged",
  wrong_item: "Wrong item",
  not_received: "Not received",
  quality: "Quality",
  other: "Other",
};

export default function ImporterDisputesPage() {
  const { data, isLoading, isError, refetch } = useImporterDisputes();
  const rows = data?.rows ?? [];

  return (
    <>
      <PageHeader
        title="My disputes"
        description="Issues you've raised against orders. We'll email when each one progresses."
      />

      {isError ? (
        <EmptyState
          title="Couldn't load disputes"
          description="Try again in a moment."
          action={<Button onClick={() => refetch()}>Retry</Button>}
        />
      ) : isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-14 w-full" />
          ))}
        </div>
      ) : rows.length === 0 ? (
        <EmptyState
          icon={<AlertTriangle />}
          title="No disputes filed"
          description="Got an issue with an order? Open it from your order detail page."
          action={
            <Button asChild>
              <Link href="/importer/orders">View orders</Link>
            </Button>
          }
        />
      ) : (
        <>
          {/* Mobile: card list - 6-column tables don't fit on phones. */}
          <ul className="space-y-3 sm:hidden">
            {rows.map((d) => (
              <li key={d.id}>
                <Link
                  href={`/importer/disputes/${encodeURIComponent(d.id)}`}
                  className="block rounded-lg border bg-card p-4 transition-colors hover:bg-muted/40"
                >
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="font-mono text-xs font-semibold">
                      {d.order_number ?? shortId(d.order_id, 10)}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {formatDate(d.time_created)}
                    </span>
                  </div>
                  <p className="mt-2 text-sm">{REASON_LABEL[d.reason] ?? d.reason}</p>
                  <div className="mt-3 flex items-center justify-between gap-2">
                    <Badge variant={STATUS_VARIANT[d.status]}>{d.status.replace("_", " ")}</Badge>
                    <span className="text-sm font-semibold tabular-nums">
                      {d.refund_amount ? formatMoney(d.refund_amount, d.refund_currency) : "-"}
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
                  <TableHead>Filed</TableHead>
                  <TableHead>Order</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Refund</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((d) => (
                  <TableRow key={d.id}>
                    <TableCell className="text-muted-foreground">{formatDate(d.time_created)}</TableCell>
                    <TableCell className="font-mono text-xs">
                      {d.order_number ?? shortId(d.order_id, 10)}
                    </TableCell>
                    <TableCell className="text-sm">{REASON_LABEL[d.reason] ?? d.reason}</TableCell>
                    <TableCell>
                      <Badge variant={STATUS_VARIANT[d.status]}>{d.status.replace("_", " ")}</Badge>
                    </TableCell>
                    <TableCell className="text-right tabular-nums text-sm">
                      {d.refund_amount ? formatMoney(d.refund_amount, d.refund_currency) : "-"}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button asChild variant="ghost" size="sm">
                        <Link href={`/importer/disputes/${encodeURIComponent(d.id)}`}>View →</Link>
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

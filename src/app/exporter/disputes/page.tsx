"use client";

/**
 * Seller-side disputes view.
 *
 * Read-only - sellers don't resolve disputes (admin does), but they need
 * visibility into what's been filed against them so they can prepare a
 * response or flag issues with their listings. Mirrors the importer inbox
 * shape but uses /exp/disputes and shows the dispute reason from the
 * buyer's perspective.
 */
import { useState } from "react";
import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/data-table";
import { useExporterDisputes } from "@/lib/queries";
import { formatDate, shortId } from "@/lib/format";
import type { DisputeStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

const STATUSES: Array<{ value: DisputeStatus | "all"; label: string }> = [
  { value: "all", label: "All" },
  { value: "open", label: "Open" },
  { value: "in_review", label: "In review" },
  { value: "resolved", label: "Resolved" },
  { value: "rejected", label: "Rejected" },
];

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

export default function ExporterDisputesPage() {
  const [filter, setFilter] = useState<DisputeStatus | "all">("all");
  const { data, isLoading, isError, refetch } = useExporterDisputes(filter === "all" ? undefined : filter);
  const rows = data?.rows ?? [];

  return (
    <>
      <PageHeader
        title="Disputes"
        description="Buyer complaints filed against your orders. Admin reviews and decides the outcome - you'll be emailed at each stage."
      />

      <div role="tablist" aria-label="Filter by status" className="mb-6 inline-flex h-10 items-center rounded-md bg-muted p-1">
        {STATUSES.map((s) => (
          <button
            key={s.value}
            type="button"
            role="tab"
            aria-selected={filter === s.value}
            onClick={() => setFilter(s.value)}
            className={cn(
              "inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium transition-colors",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
              filter === s.value ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground",
            )}
          >
            {s.label}
          </button>
        ))}
      </div>

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
          title={filter === "all" ? "No disputes" : `No ${filter.replace("_", " ")} disputes`}
          description="When buyers file complaints against your orders they'll appear here."
        />
      ) : (
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
                <TableCell className="font-mono text-xs">{d.order_number ?? shortId(d.order_id, 10)}</TableCell>
                <TableCell className="text-sm">{REASON_LABEL[d.reason] ?? d.reason}</TableCell>
                <TableCell>
                  <Badge variant={STATUS_VARIANT[d.status]}>{d.status.replace("_", " ")}</Badge>
                </TableCell>
                <TableCell className="text-right tabular-nums text-sm">
                  {d.refund_amount ? `${d.refund_amount} ${d.refund_currency}` : "-"}
                </TableCell>
                <TableCell className="text-right">
                  <Button asChild variant="ghost" size="sm">
                    <Link href={`/exporter/disputes/${encodeURIComponent(d.id)}`}>View →</Link>
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

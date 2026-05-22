"use client";

/**
 * Buyer-facing dispute detail.
 *
 * Read-only - once filed, the buyer can only watch progress until admin
 * resolves or rejects. Future iteration: add a "comment / append evidence"
 * thread, which is why we render description as a stand-alone block.
 */
import { use } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/ui/page-header";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { useImporterDispute } from "@/lib/queries";
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

export default function DisputeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return <DisputeDetail id={decodeURIComponent(id)} />;
}

function DisputeDetail({ id }: { id: string }) {
  const { data, isLoading, isError } = useImporterDispute(id);

  if (isError) {
    return (
      <>
        <PageHeader title="Dispute not found" />
        <Button asChild variant="outline">
          <Link href="/importer/disputes">
            <ArrowLeft className="size-4" /> Back to disputes
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
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  return (
    <>
      <Button asChild variant="ghost" size="sm" className="mb-3 -ml-2">
        <Link href="/importer/disputes">
          <ArrowLeft className="size-4" /> All disputes
        </Link>
      </Button>

      <PageHeader
        title={`Dispute · ${REASON_LABEL[data.reason] ?? data.reason}`}
        description={`Filed ${formatDate(data.time_created)} · Order ${data.order_number ?? shortId(data.order_id, 10)}`}
        actions={<Badge variant={STATUS_VARIANT[data.status]}>{data.status.replace("_", " ")}</Badge>}
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          <Card>
            <CardContent className="space-y-2 p-6">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                What you reported
              </h2>
              <p className="whitespace-pre-line text-sm leading-relaxed">{data.description}</p>
            </CardContent>
          </Card>

          {data.admin_notes ? (
            <Card>
              <CardContent className="space-y-2 p-6">
                <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                  Admin response
                </h2>
                <p className="whitespace-pre-line text-sm leading-relaxed">{data.admin_notes}</p>
              </CardContent>
            </Card>
          ) : null}
        </div>

        <aside>
          <Card>
            <CardContent className="space-y-3 p-6 text-sm">
              <h2 className="font-semibold">Timeline</h2>
              <ul className="space-y-2">
                <li>
                  <div className="text-xs text-muted-foreground">Filed</div>
                  <div>{formatDate(data.time_created)}</div>
                </li>
                {data.reviewed_at ? (
                  <li>
                    <div className="text-xs text-muted-foreground">Reviewed</div>
                    <div>{formatDate(data.reviewed_at)}</div>
                  </li>
                ) : null}
                {data.resolved_at ? (
                  <li>
                    <div className="text-xs text-muted-foreground">Closed</div>
                    <div>{formatDate(data.resolved_at)}</div>
                  </li>
                ) : null}
              </ul>
              {data.resolution ? (
                <>
                  <Separator />
                  <div>
                    <div className="text-xs text-muted-foreground">Resolution</div>
                    <div className="capitalize">{data.resolution}</div>
                  </div>
                  {data.refund_amount ? (
                    <div>
                      <div className="text-xs text-muted-foreground">Refund</div>
                      <div className="tabular-nums">{formatMoney(data.refund_amount, data.refund_currency)}</div>
                    </div>
                  ) : null}
                </>
              ) : null}
              <Separator />
              <Button asChild variant="outline" size="sm" className="w-full">
                <Link href={`/importer/orders/${encodeURIComponent(data.order_id)}`}>
                  View order
                </Link>
              </Button>
            </CardContent>
          </Card>
        </aside>
      </div>
    </>
  );
}

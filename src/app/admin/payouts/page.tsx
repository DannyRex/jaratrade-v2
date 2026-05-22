"use client";

/**
 * /admin/payouts - Manual seller payout queue.
 *
 * Two surfaces:
 *  1. "Eligible" - orders that have been delivered + are past the 7-day
 *     dispute window with a successful payment and no payout yet. Admin
 *     clicks "Pay out" to dispatch via Flutterwave's transfers API.
 *  2. "History" - every payout we've initiated, with status (pending /
 *     sent / completed / failed) and FLW reference.
 */
import { useState } from "react";
import { Banknote, RefreshCw, Send, AlertTriangle, Check, Clock } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { adminApi } from "@/lib/api";
import { useAuth } from "@/lib/auth-store";
import { formatDate, formatMoney, shortId } from "@/lib/format";
import type { PayoutRow } from "@/lib/api";
import { cn } from "@/lib/utils";

const STATUS_VARIANT: Record<PayoutRow["status"], "warning" | "secondary" | "success" | "destructive"> = {
  pending: "warning",
  sent: "secondary",
  completed: "success",
  failed: "destructive",
};

export default function AdminPayoutsPage() {
  const [tab, setTab] = useState<"eligible" | "history">("eligible");
  const isAdmin = useAuth((s) => Boolean(s.token) && s.role === "admin");
  const qc = useQueryClient();

  const eligibleQ = useQuery({
    queryKey: ["admin", "payouts", "eligible"],
    queryFn: adminApi.eligiblePayouts,
    enabled: isAdmin && tab === "eligible",
  });

  const historyQ = useQuery({
    queryKey: ["admin", "payouts", "history"],
    queryFn: () => adminApi.listPayouts(),
    enabled: isAdmin && tab === "history",
  });

  const send = useMutation({
    mutationFn: (orderId: string) => adminApi.sendPayout(orderId),
    onSuccess: (data) => {
      toast.success(`Payout dispatched - ${formatMoney(data.amount, data.currency)}`, {
        description: `Reference ${data.reference}`,
      });
      qc.invalidateQueries({ queryKey: ["admin", "payouts"] });
    },
    onError: (err: Error) =>
      toast.error("Couldn't dispatch payout", { description: err.message }),
  });

  return (
    <>
      <PageHeader
        title="Payouts"
        description="Release seller funds for orders that have delivered and passed the 7-day dispute window."
        actions={
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              qc.invalidateQueries({ queryKey: ["admin", "payouts"] });
            }}
          >
            <RefreshCw className="size-4" /> Refresh
          </Button>
        }
      />

      <div role="tablist" aria-label="Payouts view" className="mb-6 inline-flex h-10 items-center rounded-md bg-muted p-1">
        {(["eligible", "history"] as const).map((value) => (
          <button
            key={value}
            type="button"
            role="tab"
            aria-selected={tab === value}
            onClick={() => setTab(value)}
            className={cn(
              "inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium capitalize transition-colors",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
              tab === value ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground",
            )}
          >
            {value === "eligible" ? "Eligible for payout" : "Payout history"}
          </button>
        ))}
      </div>

      {tab === "eligible" ? (
        eligibleQ.isLoading ? (
          <SkeletonStack />
        ) : (eligibleQ.data?.rows ?? []).length === 0 ? (
          <EmptyState
            icon={<Banknote />}
            title="No payouts eligible right now"
            description="Once an order delivers and the 7-day dispute window closes, it'll appear here for release."
          />
        ) : (
          <div className="grid gap-4">
            {(eligibleQ.data?.rows ?? []).map((row) => (
              <Card key={row.order_id} className="rounded-2xl">
                <CardContent className="space-y-4 p-6">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0 space-y-1">
                      <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
                        {row.order_number}
                      </p>
                      <p className="truncate font-display text-lg font-semibold tracking-tight">
                        {row.seller_name ?? "Unknown seller"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Delivered {formatDate(row.delivered_at)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                        Seller share
                      </p>
                      <p className="font-display text-2xl font-bold tabular-nums">
                        {formatMoney(row.seller_share, row.currency)}
                      </p>
                      <p className="mt-0.5 text-[11px] text-muted-foreground">
                        of {formatMoney(row.gross_total, row.currency)} (− {row.commission_rate_percent}% commission)
                      </p>
                    </div>
                  </div>

                  <dl className="grid grid-cols-2 gap-3 rounded-xl bg-muted/40 p-4 text-xs sm:grid-cols-4">
                    <div>
                      <dt className="text-muted-foreground">Bank</dt>
                      <dd className="mt-0.5 font-semibold">{row.seller_bank ?? "-"}</dd>
                    </div>
                    <div>
                      <dt className="text-muted-foreground">Account</dt>
                      <dd className="mt-0.5 font-mono">{row.seller_account_number ?? "-"}</dd>
                    </div>
                    <div>
                      <dt className="text-muted-foreground">FLW code</dt>
                      <dd className="mt-0.5 font-mono">{row.bank_code ?? "-"}</dd>
                    </div>
                    <div>
                      <dt className="text-muted-foreground">Subaccount</dt>
                      <dd className="mt-0.5 truncate font-mono" title={row.flw_subaccount_id ?? ""}>
                        {row.flw_subaccount_id ? shortId(row.flw_subaccount_id, 12) : "-"}
                      </dd>
                    </div>
                  </dl>

                  {!row.flw_subaccount_id ? (
                    <div className="flex items-start gap-2 rounded-lg border border-warning/30 bg-warning/5 p-3 text-xs">
                      <AlertTriangle className="mt-0.5 size-4 shrink-0 text-warning" aria-hidden />
                      <span>
                        Seller has no Flutterwave subaccount provisioned. The payout will go via direct
                        bank transfer instead of subaccount settlement.
                      </span>
                    </div>
                  ) : null}

                  <div className="flex justify-end">
                    <Button
                      onClick={() => send.mutate(row.order_id)}
                      loading={send.isPending && send.variables === row.order_id}
                      disabled={!row.seller_account_number || !row.bank_code}
                    >
                      <Send className="size-4" /> Pay out {formatMoney(row.seller_share, row.currency)}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )
      ) : (
        // ── History tab ──
        historyQ.isLoading ? (
          <SkeletonStack />
        ) : (historyQ.data?.rows ?? []).length === 0 ? (
          <EmptyState
            icon={<Clock />}
            title="No payouts yet"
            description="Dispatched payouts will appear here with their Flutterwave reference + status."
          />
        ) : (
          <div className="grid gap-3">
            {(historyQ.data?.rows ?? []).map((p) => (
              <Card key={p.id} className="rounded-2xl">
                <CardContent className="grid grid-cols-2 gap-3 p-5 sm:grid-cols-[1fr_auto_auto_auto]">
                  <div className="min-w-0">
                    <p className="truncate font-display text-sm font-semibold tracking-tight">
                      {p.seller_name ?? "Seller"}
                    </p>
                    <p className="font-mono text-xs text-muted-foreground">{p.order_number ?? p.order_id}</p>
                    {p.failure_reason ? (
                      <p className="mt-1 line-clamp-1 text-xs text-destructive">{p.failure_reason}</p>
                    ) : null}
                  </div>
                  <div className="text-right">
                    <p className="font-display text-base font-bold tabular-nums">
                      {formatMoney(p.amount, p.currency)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-mono text-[11px] text-muted-foreground">{p.reference}</p>
                    <p className="text-[11px] text-muted-foreground">{formatDate(p.time_created)}</p>
                  </div>
                  <Badge variant={STATUS_VARIANT[p.status]} className="self-center justify-self-end">
                    {p.status === "completed" ? <Check className="mr-1 size-3" /> : null}
                    {p.status}
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        )
      )}
    </>
  );
}

function SkeletonStack() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 3 }).map((_, i) => (
        <Skeleton key={i} className="h-32 w-full rounded-2xl" />
      ))}
    </div>
  );
}

"use client";

/**
 * Admin dispute queue.
 *
 * Three lifecycle actions on each open dispute:
 *  1. Acknowledge -> moves "open" -> "in_review" (no other side-effect)
 *  2. Resolve     -> "refund" (calls Flutterwave + restocks),
 *                   "replacement" (no money movement), or "dismissed".
 *  3. Reject      -> closes the dispute without a resolution
 *
 * Status filter tabs scope the view; default tab is "open" since that's
 * the queue ops cares about. Counts are derived from the loaded page only -
 * that's fine for v1; if volumes grow we'll fetch counts separately.
 */
import { useState } from "react";
import { Check, X, AlertTriangle } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { adminApi } from "@/lib/api";
import { queryKeys, useAdminDisputes } from "@/lib/queries";
import { formatDate, formatMoney, shortId } from "@/lib/format";
import type { Dispute, DisputeResolution, DisputeStatus } from "@/lib/types";

const STATUSES: Array<{ value: DisputeStatus; label: string }> = [
  { value: "open", label: "Open" },
  { value: "in_review", label: "In review" },
  { value: "resolved", label: "Resolved" },
  { value: "rejected", label: "Rejected" },
];

const REASON_LABEL: Record<string, string> = {
  damaged: "Damaged",
  wrong_item: "Wrong item",
  not_received: "Not received",
  quality: "Quality",
  other: "Other",
};

const STATUS_VARIANT: Record<DisputeStatus, "warning" | "secondary" | "success" | "destructive"> = {
  open: "warning",
  in_review: "secondary",
  resolved: "success",
  rejected: "destructive",
};

export default function AdminDisputesPage() {
  const [status, setStatus] = useState<DisputeStatus>("open");
  const [resolveTarget, setResolveTarget] = useState<Dispute | null>(null);
  const [rejectTarget, setRejectTarget] = useState<Dispute | null>(null);
  const qc = useQueryClient();

  const { data, isLoading } = useAdminDisputes(status);
  const rows = data?.rows ?? [];

  const acknowledge = useMutation({
    mutationFn: (id: string) => adminApi.acknowledgeDispute(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.adminDisputes("open") });
      qc.invalidateQueries({ queryKey: queryKeys.adminDisputes("in_review") });
      toast.success("Dispute acknowledged - buyer notified.");
    },
    onError: (err) => toast.error("Couldn't acknowledge", { description: String(err) }),
  });

  return (
    <>
      <PageHeader
        title="Disputes"
        description="Resolve buyer disputes - refunds run through Flutterwave; replacements flag the seller."
      />

      {/* Status filter - plain buttons instead of Radix Tabs because the
          dispute cards render outside this component as a query-driven list,
          and Radix Tabs swallows clicks when there's no matching
          TabsContent registered. A button group keeps the click->state path
          dead simple. */}
      {/* `max-w-full overflow-x-auto` lets the 4 tab pills scroll horizontally
          on small phones instead of clipping. Scrollbar hidden because the
          horizontal layout already telegraphs the affordance. */}
      <div role="tablist" aria-label="Dispute status" className="mb-6 inline-flex h-10 max-w-full items-center overflow-x-auto rounded-md bg-muted p-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {STATUSES.map((s) => {
          const count = data?.counts?.[s.value] ?? 0;
          return (
            <button
              key={s.value}
              type="button"
              role="tab"
              aria-selected={status === s.value}
              onClick={() => setStatus(s.value)}
              className={cn(
                "inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium transition-colors",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                status === s.value
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {s.label}
              {count > 0 ? (
                <span className="ml-1.5 rounded-full border px-1.5 text-[10px] font-semibold tabular-nums">
                  {count}
                </span>
              ) : null}
            </button>
          );
        })}
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-44 w-full" />
          ))}
        </div>
      ) : rows.length === 0 ? (
        <EmptyState
          icon={<AlertTriangle />}
          title={`No ${STATUSES.find((s) => s.value === status)?.label.toLowerCase()} disputes`}
          description="When buyers file disputes, they'll appear here."
        />
      ) : (
        <div className="grid gap-4">
          {rows.map((d) => (
            <Card key={d.id}>
              <CardContent className="space-y-4 p-6">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="space-y-1">
                    <p className="font-semibold">
                      {REASON_LABEL[d.reason] ?? d.reason} ·{" "}
                      <span className="font-mono text-xs text-muted-foreground">
                        Order {d.order_number ?? shortId(d.order_id, 10)}
                      </span>
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Filed by{" "}
                      <span className="font-medium text-foreground">
                        {d.importer_name ?? "buyer"}
                      </span>
                      {d.importer_email ? (
                        <>
                          {" "}
                          (<a href={`mailto:${d.importer_email}`} className="hover:underline">{d.importer_email}</a>)
                        </>
                      ) : null}{" "}
                      on {formatDate(d.time_created)}
                    </p>
                  </div>
                  <Badge variant={STATUS_VARIANT[d.status]}>{d.status.replace("_", " ")}</Badge>
                </div>

                <div className="rounded-md bg-muted/40 p-3 text-sm">
                  <p className="whitespace-pre-line">{d.description}</p>
                </div>

                {d.admin_notes ? (
                  <div className="rounded-md border border-dashed p-3 text-sm">
                    <p className="text-xs uppercase tracking-wide text-muted-foreground mb-1">
                      Admin notes
                    </p>
                    <p className="whitespace-pre-line">{d.admin_notes}</p>
                  </div>
                ) : null}

                {d.refund_amount ? (
                  <p className="text-sm">
                    Refund:{" "}
                    <span className="font-medium tabular-nums">
                      {formatMoney(d.refund_amount, d.refund_currency)}
                    </span>
                  </p>
                ) : null}

                {d.status === "open" || d.status === "in_review" ? (
                  <div className="flex flex-wrap gap-2">
                    {d.status === "open" ? (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => acknowledge.mutate(d.id)}
                        loading={acknowledge.isPending && acknowledge.variables === d.id}
                      >
                        <Check className="size-4" /> Acknowledge
                      </Button>
                    ) : null}
                    <Button size="sm" onClick={() => setResolveTarget(d)}>
                      Resolve
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => setRejectTarget(d)}>
                      <X className="size-4" /> Reject
                    </Button>
                  </div>
                ) : null}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <ResolveDialog target={resolveTarget} onClose={() => setResolveTarget(null)} />
      <RejectDialog target={rejectTarget} onClose={() => setRejectTarget(null)} />
    </>
  );
}

function ResolveDialog({ target, onClose }: { target: Dispute | null; onClose: () => void }) {
  const qc = useQueryClient();
  const [resolution, setResolution] = useState<DisputeResolution>("refund");
  const [refundAmount, setRefundAmount] = useState("");
  const [adminNotes, setAdminNotes] = useState("");

  const resolve = useMutation({
    mutationFn: () =>
      adminApi.resolveDispute(target!.id, {
        resolution,
        refund_amount: resolution === "refund" ? refundAmount : undefined,
        admin_notes: adminNotes || undefined,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "disputes"] });
      toast.success("Dispute resolved", {
        description: resolution === "refund" ? "Refund initiated and buyer emailed." : "Buyer notified.",
      });
      onClose();
      setRefundAmount("");
      setAdminNotes("");
      setResolution("refund");
    },
    onError: (err) => toast.error("Couldn't resolve", { description: String(err) }),
  });

  const refundInvalid = resolution === "refund" && (!refundAmount || Number(refundAmount) <= 0);

  return (
    <Dialog open={Boolean(target)} onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Resolve dispute</DialogTitle>
          <DialogDescription>
            Refunds run through Flutterwave immediately. Replacements flag the seller to ship again.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label>Resolution</Label>
            <Select value={resolution} onValueChange={(v) => setResolution(v as DisputeResolution)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="refund">Refund</SelectItem>
                <SelectItem value="replacement">Replacement</SelectItem>
                <SelectItem value="dismissed">Dismiss (no money movement)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {resolution === "refund" ? (
            <div className="space-y-1.5">
              <Label htmlFor="refund-amount">Refund amount</Label>
              <Input
                id="refund-amount"
                type="number"
                min={0}
                step="0.01"
                value={refundAmount}
                onChange={(e) => setRefundAmount(e.target.value)}
                placeholder="0.00"
              />
              <p className="text-xs text-muted-foreground">
                Leave at full order total for a full refund; lower for partial. Stock is restored automatically.
              </p>
            </div>
          ) : null}
          <div className="space-y-1.5">
            <Label htmlFor="admin-notes">Notes to buyer (optional)</Label>
            <Textarea
              id="admin-notes"
              rows={3}
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              placeholder="Shown to the buyer alongside the resolution."
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={() => resolve.mutate()} loading={resolve.isPending} disabled={refundInvalid}>
            Confirm resolution
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function RejectDialog({ target, onClose }: { target: Dispute | null; onClose: () => void }) {
  const qc = useQueryClient();
  const [reason, setReason] = useState("");

  const reject = useMutation({
    mutationFn: () => adminApi.rejectDispute(target!.id, reason),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "disputes"] });
      toast.success("Dispute rejected - buyer notified");
      onClose();
      setReason("");
    },
    onError: (err) => toast.error("Couldn't reject", { description: String(err) }),
  });

  return (
    <Dialog open={Boolean(target)} onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Reject this dispute</DialogTitle>
          <DialogDescription>
            We&apos;ll email the buyer your reason. Use this for disputes that are unfounded or have insufficient evidence.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-1.5">
          <Label htmlFor="reject-reason">Reason</Label>
          <Textarea
            id="reject-reason"
            rows={4}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="e.g. Tracking shows delivered + signed; no evidence of damage attached."
            required
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={() => reject.mutate()} loading={reject.isPending} disabled={reason.length < 3}>
            Reject dispute
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

"use client";

import { useState } from "react";
import { Check, ShieldCheck, X, FileText, ExternalLink } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { adminApi } from "@/lib/api";
import { useBanks } from "@/lib/queries";
import { useAuth } from "@/lib/auth-store";
import { formatDate, initials } from "@/lib/format";
import type { AdminUser } from "@/lib/api";

export default function KycQueuePage() {
  const isAdmin = useAuth((s) => Boolean(s.token) && s.role === "admin");
  const qc = useQueryClient();
  const [rejectTarget, setRejectTarget] = useState<AdminUser | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "kyc", "queue"],
    queryFn: adminApi.kycQueue,
    enabled: isAdmin,
  });

  // Resolve bank_id -> bank name for the detail view.
  const banks = useBanks();
  const bankName = (id: string | null) =>
    id ? banks.data?.rows.find((b) => b.id === id)?.name ?? id : null;

  const approve = useMutation({
    mutationFn: (id: string) => adminApi.kycApprove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "kyc", "queue"] });
      qc.invalidateQueries({ queryKey: ["admin", "users"] });
      toast.success("Exporter approved");
    },
    onError: (err: Error) => toast.error("Couldn't approve", { description: err.message }),
  });

  const pending = data?.rows ?? [];

  return (
    <>
      <PageHeader
        title="KYC verification queue"
        description="Review submitted exporter applications. Approving activates the account and emails the applicant."
        actions={<Badge variant="warning">{pending.length} to review</Badge>}
      />

      {isLoading ? (
        <div className="grid gap-3 lg:grid-cols-2">
          {Array.from({ length: 2 }).map((_, i) => <Skeleton key={i} className="h-80 w-full" />)}
        </div>
      ) : pending.length === 0 ? (
        <EmptyState
          icon={<ShieldCheck />}
          title="Queue is empty"
          description="No exporter applications are waiting for review."
        />
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {pending.map((user) => (
            <Card key={user.id}>
              <CardContent className="space-y-4 p-6">
                {/* Header */}
                <div className="flex items-start gap-4">
                  <Avatar className="size-12 shrink-0">
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {initials(user.business_name || user.fullname)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <p className="line-clamp-1 font-semibold">{user.business_name || user.fullname}</p>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                    <p className="text-xs text-muted-foreground">
                      Submitted {user.kyc_submitted_at ? formatDate(user.kyc_submitted_at) : "-"}
                    </p>
                  </div>
                </div>

                {/* Full business detail */}
                <div>
                  <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Business details
                  </p>
                  <dl className="grid grid-cols-2 gap-x-4 gap-y-2 rounded-md bg-muted/40 p-3 text-xs">
                    <Detail label="Business name" value={user.business_name} />
                    <Detail label="Type" value={user.business_type} />
                    <Detail label="Registration (CAC)" value={user.business_reg_number} mono />
                    <Detail label="Tax ID (TIN)" value={user.tin} mono />
                    <Detail label="Country" value={user.business_country || user.country} />
                    <Detail
                      label="Years in business"
                      value={user.duration_in_business != null ? String(user.duration_in_business) : null}
                    />
                    <Detail label="Annual turnover" value={user.annual_turnover} />
                    <Detail label="Contact phone" value={user.phone} />
                    <Detail label="Business email" value={user.business_email} span2 />
                    <Detail label="Business address" value={user.business_address} span2 />
                  </dl>
                </div>

                {/* Bank account */}
                <div>
                  <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Payout account
                  </p>
                  <dl className="grid grid-cols-2 gap-x-4 gap-y-2 rounded-md bg-muted/40 p-3 text-xs">
                    <Detail label="Bank" value={bankName(user.bank_id)} />
                    <Detail label="Account name" value={user.account_name} />
                    <Detail label="Account number" value={user.account_number} mono span2 />
                  </dl>
                </div>

                {/* Documents */}
                <div>
                  <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Documents
                  </p>
                  <div className="space-y-1.5">
                    <DocLink label="Means of ID" url={user.documents?.id} />
                    <DocLink label="CAC certificate" url={user.documents?.cac} />
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-1">
                  <Button onClick={() => approve.mutate(user.id)} loading={approve.isPending && approve.variables === user.id} className="flex-1">
                    <Check className="size-4" /> Approve
                  </Button>
                  <Button variant="outline" onClick={() => setRejectTarget(user)} className="flex-1">
                    <X className="size-4" /> Reject
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <RejectDialog target={rejectTarget} onClose={() => setRejectTarget(null)} />
    </>
  );
}

function Detail({
  label,
  value,
  mono,
  span2,
}: {
  label: string;
  value: string | null | undefined;
  mono?: boolean;
  span2?: boolean;
}) {
  return (
    <div className={span2 ? "col-span-2" : undefined}>
      <dt className="text-muted-foreground">{label}</dt>
      <dd className={`font-medium ${mono ? "font-mono" : ""} ${!value ? "text-muted-foreground/60" : ""}`}>
        {value || "-"}
      </dd>
    </div>
  );
}

function DocLink({ label, url }: { label: string; url?: string }) {
  if (!url) {
    return (
      <div className="flex items-center gap-2 rounded-md border border-dashed px-3 py-2 text-xs text-muted-foreground">
        <FileText className="size-3.5" />
        <span>{label}</span>
        <span className="ml-auto">Not uploaded</span>
      </div>
    );
  }
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-2 rounded-md border px-3 py-2 text-xs transition-colors hover:bg-muted/50"
    >
      <FileText className="size-3.5 text-primary" />
      <span className="font-medium">{label}</span>
      <span className="ml-auto inline-flex items-center gap-1 text-primary">
        View <ExternalLink className="size-3" />
      </span>
    </a>
  );
}

function RejectDialog({ target, onClose }: { target: AdminUser | null; onClose: () => void }) {
  const qc = useQueryClient();
  const [reason, setReason] = useState("");

  const reject = useMutation({
    mutationFn: () => adminApi.kycReject(target!.id, reason),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "kyc", "queue"] });
      qc.invalidateQueries({ queryKey: ["admin", "users"] });
      toast.success("Application rejected");
      onClose();
      setReason("");
    },
  });

  return (
    <Dialog open={Boolean(target)} onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Reject application</DialogTitle>
          <DialogDescription>
            We&apos;ll email {target?.email} with the reason. Be specific so they can fix it and resubmit.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2">
          <Label htmlFor="reason">Reason</Label>
          <Textarea
            id="reason"
            rows={4}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="e.g. The means-of-ID document is blurry - please re-upload a clear scan."
            required
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button variant="destructive" onClick={() => reject.mutate()} loading={reject.isPending} disabled={reason.length < 3}>
            Reject application
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

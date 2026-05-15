"use client";

import { useState } from "react";
import { Check, ShieldCheck, X } from "lucide-react";
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

  const approve = useMutation({
    mutationFn: (id: string) => adminApi.kycApprove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "kyc", "queue"] });
      qc.invalidateQueries({ queryKey: ["admin", "users"] });
      toast.success("Exporter approved");
    },
  });

  const pending = data?.rows ?? [];

  return (
    <>
      <PageHeader
        title="KYC verification queue"
        description="Review pending exporter applications. Approving activates the account and emails the applicant."
        actions={<Badge variant="warning">{pending.length} pending</Badge>}
      />

      {isLoading ? (
        <div className="grid gap-3 sm:grid-cols-2">
          {Array.from({ length: 2 }).map((_, i) => <Skeleton key={i} className="h-44 w-full" />)}
        </div>
      ) : pending.length === 0 ? (
        <EmptyState
          icon={<ShieldCheck />}
          title="Queue is empty"
          description="All exporter applications have been reviewed."
        />
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {pending.map((user) => (
            <Card key={user.id}>
              <CardContent className="space-y-4 p-6">
                <div className="flex items-start gap-4">
                  <Avatar className="size-12 shrink-0">
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {initials(user.business_name || user.fullname)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <p className="line-clamp-1 font-semibold">{user.business_name || user.fullname}</p>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                    <p className="text-xs text-muted-foreground">Applied {formatDate(user.time_created)}</p>
                  </div>
                </div>

                <dl className="grid grid-cols-2 gap-2 rounded-md bg-muted/40 p-3 text-xs">
                  <div>
                    <dt className="text-muted-foreground">Country</dt>
                    <dd className="font-medium">{user.business_country || user.country || "-"}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Business reg</dt>
                    <dd className="font-medium font-mono">{user.business_reg_number || "-"}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Phone</dt>
                    <dd className="font-medium">{user.phone || "-"}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Profile</dt>
                    <dd className="font-medium">{user.profile_name || "-"}</dd>
                  </div>
                </dl>

                <div className="flex gap-2">
                  <Button onClick={() => approve.mutate(user.id)} loading={approve.isPending} className="flex-1">
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
            We&apos;ll email {target?.email} with the reason. Be specific so they can reapply if appropriate.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2">
          <Label htmlFor="reason">Reason</Label>
          <Textarea
            id="reason"
            rows={4}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="e.g. Business registration number could not be verified."
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

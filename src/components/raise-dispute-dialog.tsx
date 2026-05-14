"use client";

/**
 * Modal for buyers to file a dispute on a delivered order.
 *
 * Why a dedicated component:
 *  - The dispute form has stricter validation than typical mutations (reason
 *    enum + 10..2000-char description). Keeping it in one place avoids
 *    drift between the order detail and the orders list.
 *  - The post-resolution invalidation hits both `importerOrder` (status may
 *    change to "refunded") and `importerDisputes` (the new row appears).
 */
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { importerApi } from "@/lib/api";
import { queryKeys } from "@/lib/queries";
import type { DisputeReason } from "@/lib/types";

const REASONS: Array<{ value: DisputeReason; label: string }> = [
  { value: "damaged", label: "Goods arrived damaged" },
  { value: "wrong_item", label: "Wrong item delivered" },
  { value: "not_received", label: "Not received" },
  { value: "quality", label: "Quality below promised" },
  { value: "other", label: "Other" },
];

interface RaiseDisputeDialogProps {
  orderId: string;
  /** If the order is already disputed, the parent can pass disabled=true to
   * show the trigger as a non-actionable badge. */
  disabled?: boolean;
}

export function RaiseDisputeDialog({ orderId, disabled }: RaiseDisputeDialogProps) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState<DisputeReason>("damaged");
  const [description, setDescription] = useState("");
  const qc = useQueryClient();

  const mut = useMutation({
    mutationFn: () => importerApi.raiseDispute(orderId, { reason, description }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["importer", "orders", orderId] });
      qc.invalidateQueries({ queryKey: queryKeys.importerOrders });
      qc.invalidateQueries({ queryKey: queryKeys.importerDisputes });
      toast.success("Dispute submitted", {
        description: "We'll review and email you within 1 business day.",
      });
      setOpen(false);
      setDescription("");
      setReason("damaged");
    },
    onError: (err: Error) => toast.error("Couldn't file dispute", { description: err.message }),
  });

  const tooShort = description.trim().length < 10;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" disabled={disabled}>
          <AlertTriangle className="size-4" /> Report issue
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Report an issue with this order</DialogTitle>
          <DialogDescription>
            Disputes can be raised up to 7 days after delivery. We&apos;ll review and respond within 1 business day.
          </DialogDescription>
        </DialogHeader>
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            if (!tooShort) mut.mutate();
          }}
        >
          <div className="space-y-1.5">
            <label className="text-sm font-medium" htmlFor="dispute-reason">
              What went wrong?
            </label>
            <Select value={reason} onValueChange={(v) => setReason(v as DisputeReason)}>
              <SelectTrigger id="dispute-reason">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {REASONS.map((r) => (
                  <SelectItem key={r.value} value={r.value}>
                    {r.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium" htmlFor="dispute-desc">
              Describe the issue
            </label>
            <textarea
              id="dispute-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={5}
              maxLength={2000}
              placeholder="Be specific: order details, photos available, what resolution you'd like..."
              className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span className={tooShort ? "text-warning" : ""}>
                {tooShort ? `${10 - description.trim().length} more character${description.trim().length === 9 ? "" : "s"} needed` : `${description.length}/2000`}
              </span>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={mut.isPending} disabled={tooShort}>
              File dispute
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// (Input kept imported in case we later add a "preferred resolution" amount
// field for refund-amount estimates; tree-shaken until then.)
void Input;

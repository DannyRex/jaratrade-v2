"use client";

/**
 * /admin/settings - Platform settings.
 *
 * Currently surfaces the commission account that Jaratrade displays to
 * sellers as the destination of platform fees. Loads the saved value
 * on mount so admins can see what was set last (previously the form
 * always rendered blank, which read as "save didn't work").
 *
 * NOTE on the data model:
 *   This form writes the three strings (bank/name/number) to a Setting
 *   row. It does NOT provision a Flutterwave subaccount or change where
 *   commission money is actually routed - the real payment split uses
 *   the FLW_COMMISSION_SUBACCOUNT_ID env var. Treat these fields as a
 *   reference record of what we should provision in Flutterwave's
 *   dashboard, not as the source of truth for payment routing.
 */
import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PageHeader } from "@/components/ui/page-header";
import { Skeleton } from "@/components/ui/skeleton";
import { adminApi } from "@/lib/api";
import { useAuth } from "@/lib/auth-store";

interface CommissionAccount {
  bank_name: string;
  account_name: string;
  account_number: string;
}

export default function AdminSettingsPage() {
  const isAdmin = useAuth((s) => Boolean(s.token) && s.role === "admin");

  const accountQ = useQuery({
    queryKey: ["admin", "commission-account"],
    queryFn: adminApi.getCommissionAccount,
    enabled: isAdmin,
  });

  return (
    <>
      <PageHeader
        title="Platform settings"
        description="Reference record of the bank account that should receive Jaratrade commission."
      />

      <div className="max-w-2xl space-y-5">
        {accountQ.isLoading ? (
          <Skeleton className="h-72 w-full rounded-2xl" />
        ) : (
          /* Keyed so the child remounts and useState picks up fresh defaults
             whenever the underlying record changes — keeps the form a pure
             local-state component without any setState-in-effect dance. */
          (() => {
            const initial = (accountQ.data as CommissionAccount | undefined) ?? null;
            const key = `${initial?.bank_name ?? ""}|${initial?.account_name ?? ""}|${initial?.account_number ?? ""}`;
            return <CommissionAccountCard key={key} initial={initial} />;
          })()
        )}

        {/* Honest disclosure of what this surface actually does */}
        <div className="rounded-2xl border border-warning/30 bg-warning/5 p-5">
          <div className="flex items-start gap-3">
            <AlertCircle className="mt-0.5 size-5 shrink-0 text-warning" aria-hidden />
            <div className="space-y-2 text-sm">
              <p className="font-semibold text-foreground">
                This form is a reference record, not live payment routing.
              </p>
              <p className="text-muted-foreground">
                The Flutterwave payment split that routes commission to Jaratrade is
                configured via the{" "}
                <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">FLW_COMMISSION_SUBACCOUNT_ID</code>{" "}
                environment variable. To change where commission actually lands you must
                (a) provision a Flutterwave subaccount with the bank details below,
                (b) set the resulting subaccount ID on the API service, and (c) redeploy.
              </p>
              <p className="text-muted-foreground">
                Seller payouts are not yet automated. When an order delivers and the
                7-day dispute window closes, funds must be transferred from the
                Jaratrade Flutterwave wallet to the seller&apos;s bank account manually
                via the Flutterwave dashboard.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function CommissionAccountCard({ initial }: { initial: CommissionAccount | null }) {
  // Initial values come from the loaded server record. If the record changes
  // (e.g. another admin saves from another tab) the parent re-keys us and we
  // remount with fresh defaults — no setState-in-effect required.
  const [form, setForm] = useState<CommissionAccount>({
    bank_name: initial?.bank_name ?? "",
    account_name: initial?.account_name ?? "",
    account_number: initial?.account_number ?? "",
  });

  const save = useMutation({
    mutationFn: () => adminApi.updateCommissionAccount(form as unknown as Record<string, unknown>),
    onSuccess: () => toast.success("Commission account saved"),
    onError: (err: Error) =>
      toast.error("Couldn't save commission account", {
        description: err.message,
      }),
  });

  return (
    <Card className="rounded-2xl">
      <CardContent className="p-6 sm:p-7">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            save.mutate();
          }}
          className="space-y-5"
        >
          <div>
            <h2 className="font-display text-lg font-semibold tracking-tight">
              Commission account (reference)
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              The bank account that should receive Jaratrade commission. Stored for
              record-keeping and shown to the internal team.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="bank_name">Bank name</Label>
            <Input
              id="bank_name"
              required
              value={form.bank_name}
              onChange={(e) => setForm({ ...form, bank_name: e.target.value })}
              placeholder="e.g. Access Bank PLC"
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="account_name">Account name</Label>
              <Input
                id="account_name"
                required
                value={form.account_name}
                onChange={(e) => setForm({ ...form, account_name: e.target.value })}
                placeholder="Jaratrade Ltd"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="account_number">Account number</Label>
              <Input
                id="account_number"
                required
                inputMode="numeric"
                pattern="[0-9]*"
                value={form.account_number}
                onChange={(e) => setForm({ ...form, account_number: e.target.value.replace(/\D/g, "") })}
                placeholder="10-digit NUBAN"
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-end gap-3">
            {initial?.bank_name ? (
              <span className="text-xs text-muted-foreground">
                Last saved: {initial.bank_name} · {initial.account_number}
              </span>
            ) : null}
            <Button type="submit" loading={save.isPending}>
              Save commission account
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

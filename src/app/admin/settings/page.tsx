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
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { AlertCircle, Percent } from "lucide-react";
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

interface CommissionRate {
  percent: number;
  decimal_rate: number;
  default: number;
  min: number;
  max: number;
}

export default function AdminSettingsPage() {
  const isAdmin = useAuth((s) => Boolean(s.token) && s.role === "admin");

  const rateQ = useQuery({
    queryKey: ["admin", "commission-rate"],
    queryFn: adminApi.getCommissionRate,
    enabled: isAdmin,
  });

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
        {/* Commission rate — actually drives the FLW split */}
        {rateQ.isLoading ? (
          <Skeleton className="h-48 w-full rounded-2xl" />
        ) : (
          (() => {
            const rate = (rateQ.data as CommissionRate | undefined) ?? null;
            const key = `rate:${rate?.percent ?? "default"}`;
            return <CommissionRateCard key={key} initial={rate} />;
          })()
        )}

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

        {/* Honest disclosure of what's live + what's still manual */}
        <div className="rounded-2xl border border-warning/30 bg-warning/5 p-5">
          <div className="flex items-start gap-3">
            <AlertCircle className="mt-0.5 size-5 shrink-0 text-warning" aria-hidden />
            <div className="space-y-2 text-sm">
              <p className="font-semibold text-foreground">
                What&apos;s live + what isn&apos;t
              </p>
              <p className="text-muted-foreground">
                <span className="font-semibold text-foreground">Commission rate</span>{" "}
                above is live - changes apply to the next order&apos;s Flutterwave
                split immediately. No redeploy required.
              </p>
              <p className="text-muted-foreground">
                <span className="font-semibold text-foreground">Commission account</span>{" "}
                below is a reference record. The actual destination subaccount is
                configured via the{" "}
                <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">
                  FLW_COMMISSION_SUBACCOUNT_ID
                </code>{" "}
                environment variable - to change where money actually lands you must
                (a) provision a Flutterwave subaccount with the bank details below,
                (b) set that ID on the API service, and (c) redeploy.
              </p>
              <p className="text-muted-foreground">
                <span className="font-semibold text-foreground">Seller payouts</span>{" "}
                are not yet automated. When an order delivers and the 7-day dispute
                window closes, funds must be transferred from the Jaratrade Flutterwave
                wallet to the seller&apos;s bank account manually via the Flutterwave
                dashboard.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function CommissionRateCard({ initial }: { initial: CommissionRate | null }) {
  const qc = useQueryClient();
  const [percent, setPercent] = useState<string>(
    initial?.percent !== undefined ? String(initial.percent) : "2",
  );
  const min = initial?.min ?? 0;
  const max = initial?.max ?? 25;
  const parsed = parseFloat(percent);
  const invalid = Number.isNaN(parsed) || parsed < min || parsed > max;

  const save = useMutation({
    mutationFn: () => adminApi.updateCommissionRate(parsed),
    onSuccess: (data) => {
      toast.success(`Commission rate updated to ${data.percent}%`);
      qc.invalidateQueries({ queryKey: ["admin", "commission-rate"] });
    },
    onError: (err: Error) =>
      toast.error("Couldn't update commission rate", { description: err.message }),
  });

  return (
    <Card className="rounded-2xl">
      <CardContent className="p-6 sm:p-7">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!invalid) save.mutate();
          }}
          className="space-y-5"
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="font-display text-lg font-semibold tracking-tight">
                Commission rate
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                The percentage of every order paid out to Jaratrade via the Flutterwave
                split. Default {initial?.default ?? 2}%; max {max}%.
              </p>
            </div>
            <div className="grid size-11 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/15">
              <Percent className="size-5" aria-hidden />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="commission_percent">Platform commission</Label>
            <div className="relative max-w-[14rem]">
              <Input
                id="commission_percent"
                type="number"
                inputMode="decimal"
                step="0.1"
                min={min}
                max={max}
                value={percent}
                onChange={(e) => setPercent(e.target.value)}
                className="pr-8 text-base tabular-nums"
                aria-invalid={invalid}
              />
              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm font-medium text-muted-foreground">
                %
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              Equivalent decimal split:{" "}
              <span className="font-mono tabular-nums">
                {invalid ? "—" : (parsed / 100).toFixed(4)}
              </span>
            </p>
            {invalid ? (
              <p className="text-xs font-medium text-destructive">
                Enter a number between {min}% and {max}%.
              </p>
            ) : null}
          </div>

          <div className="flex flex-wrap items-center justify-end gap-3">
            {initial?.percent !== undefined ? (
              <span className="text-xs text-muted-foreground">
                Currently active: <span className="font-semibold text-foreground">{initial.percent}%</span>
              </span>
            ) : null}
            <Button type="submit" loading={save.isPending} disabled={invalid || parsed === initial?.percent}>
              Save commission rate
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
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

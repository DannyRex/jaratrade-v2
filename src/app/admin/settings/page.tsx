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
import { AlertCircle, ArrowRightLeft, Percent } from "lucide-react";
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

interface FxRate {
  from: string;
  to: string;
  effective_rate: number | null;
  override_rate: number | null;
  live_rate: number | null;
  fallback_rate: number | null;
  example_1000: number | null;
}

export default function AdminSettingsPage() {
  const isAdmin = useAuth((s) => Boolean(s.token) && s.role === "admin");

  const rateQ = useQuery({
    queryKey: ["admin", "commission-rate"],
    queryFn: adminApi.getCommissionRate,
    enabled: isAdmin,
  });

  const fxQ = useQuery({
    queryKey: ["admin", "fx-rate", "NGN", "GBP"],
    queryFn: () => adminApi.getFxRate("NGN", "GBP"),
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
        {/* Commission rate - actually drives the FLW split */}
        {rateQ.isLoading ? (
          <Skeleton className="h-48 w-full rounded-2xl" />
        ) : (
          (() => {
            const rate = (rateQ.data as CommissionRate | undefined) ?? null;
            const key = `rate:${rate?.percent ?? "default"}`;
            return <CommissionRateCard key={key} initial={rate} />;
          })()
        )}

        {/* FX rate - drives buyer-side dual-currency display */}
        {fxQ.isLoading ? (
          <Skeleton className="h-48 w-full rounded-2xl" />
        ) : (
          (() => {
            const fx = (fxQ.data as FxRate | undefined) ?? null;
            const key = `fx:${fx?.override_rate ?? "auto"}`;
            return <FxRateCard key={key} initial={fx} />;
          })()
        )}

        {accountQ.isLoading ? (
          <Skeleton className="h-72 w-full rounded-2xl" />
        ) : (
          /* Keyed so the child remounts and useState picks up fresh defaults
             whenever the underlying record changes - keeps the form a pure
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
                are managed via{" "}
                <a href="/admin/payouts" className="font-medium text-primary underline-offset-4 hover:underline">
                  /admin/payouts
                </a>
                . Orders that have delivered + cleared the 1-day dispute window appear in
                the &quot;Eligible&quot; tab; one click dispatches the seller&apos;s
                share via Flutterwave&apos;s transfers API. Subaccounts are provisioned
                automatically when an exporter clears KYC; the &quot;Reprovision&quot;
                action on the users page retries if Flutterwave was unavailable.
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
                {invalid ? "-" : (parsed / 100).toFixed(4)}
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
  // remount with fresh defaults - no setState-in-effect required.
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

function FxRateCard({ initial }: { initial: FxRate | null }) {
  const qc = useQueryClient();
  // We display the rate as "1 GBP = N NGN" because that's how people think
  // about it day-to-day; persist as NGN->GBP because that matches the
  // backend's internal direction.
  const ngnPerGbp = initial?.effective_rate ? (1 / initial.effective_rate) : 0;
  const [perGbp, setPerGbp] = useState<string>(ngnPerGbp ? ngnPerGbp.toFixed(2) : "1700");
  const overridden = initial?.override_rate != null;
  const parsed = parseFloat(perGbp);
  const invalid = Number.isNaN(parsed) || parsed <= 0;

  const save = useMutation({
    mutationFn: () => {
      const ngnToGbp = 1 / parsed;
      return adminApi.updateFxRate("NGN", "GBP", ngnToGbp);
    },
    onSuccess: () => {
      toast.success(`FX rate set to £1 = ₦${parsed.toFixed(2)}`);
      qc.invalidateQueries({ queryKey: ["admin", "fx-rate"] });
    },
    onError: (err: Error) =>
      toast.error("Couldn't save FX rate", { description: err.message }),
  });

  const clear = useMutation({
    mutationFn: () => adminApi.clearFxRate("NGN", "GBP"),
    onSuccess: () => {
      toast.success("FX override cleared - using live rate");
      qc.invalidateQueries({ queryKey: ["admin", "fx-rate"] });
    },
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
                FX rate (NGN ↔ GBP)
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Powers the &quot;₦18,000 / ~£10.40&quot; display next to every product
                price. Override locks the rate; clearing it falls back to the
                live FX feed.
              </p>
            </div>
            <div className="grid size-11 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/15">
              <ArrowRightLeft className="size-5" aria-hidden />
            </div>
          </div>

          {/* Context strip - what's live + what's the fallback */}
          <dl className="grid grid-cols-3 gap-3 rounded-xl bg-muted/40 p-4 text-xs">
            <div>
              <dt className="text-muted-foreground">Live</dt>
              <dd className="mt-0.5 font-mono tabular-nums">
                {initial?.live_rate ? (1 / initial.live_rate).toFixed(2) : "-"}
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Override</dt>
              <dd className="mt-0.5 font-mono tabular-nums">
                {initial?.override_rate ? (1 / initial.override_rate).toFixed(2) : "-"}
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Fallback</dt>
              <dd className="mt-0.5 font-mono tabular-nums">
                {initial?.fallback_rate ? (1 / initial.fallback_rate).toFixed(2) : "-"}
              </dd>
            </div>
          </dl>

          <div className="space-y-2">
            <Label htmlFor="ngn_per_gbp">£1 GBP = how many ₦ NGN?</Label>
            <div className="relative max-w-[14rem]">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-muted-foreground">
                ₦
              </span>
              <Input
                id="ngn_per_gbp"
                type="number"
                inputMode="decimal"
                step="0.01"
                min={0.01}
                value={perGbp}
                onChange={(e) => setPerGbp(e.target.value)}
                className="pl-7 text-base tabular-nums"
                aria-invalid={invalid}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Decimal stored as NGN&nbsp;→&nbsp;GBP:{" "}
              <span className="font-mono tabular-nums">
                {invalid ? "-" : (1 / parsed).toFixed(8)}
              </span>
            </p>
            {invalid ? (
              <p className="text-xs font-medium text-destructive">
                Enter a positive number.
              </p>
            ) : null}
          </div>

          <div className="flex flex-wrap items-center justify-end gap-3">
            {overridden ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => clear.mutate()}
                loading={clear.isPending}
              >
                Clear override
              </Button>
            ) : null}
            <Button type="submit" loading={save.isPending} disabled={invalid}>
              Save FX rate
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

"use client";

/**
 * Generic subscription page used by both importer and exporter dashboards.
 * Renders the user's current plan + auto-renew status, lists available plans
 * from the public catalog, and handles upgrade -> Flutterwave inline -> verify.
 */
import { useEffect } from "react";
import { Crown, Sparkles, ShieldCheck, Zap, X, CreditCard, AlertTriangle } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/ui/page-header";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  exporterApi,
  importerApi,
  type SubscriptionUpgradeResponse,
} from "@/lib/api";
import { useExporterPlans, useImporterPlans } from "@/lib/queries";
import { formatDate, formatMoney } from "@/lib/format";
import type { ExporterPlan, ImporterPlan, Role } from "@/lib/types";
import { openFlutterwaveInline, prewarmFlutterwave } from "@/lib/flw-inline";

interface PlanForUI {
  id: string;
  title: string;
  description: string;
  monthly_subscription_fee: string;
  currency: string;
  is_default: number;
  features: string[];
}

function importerPlanToUI(p: ImporterPlan): PlanForUI {
  const txCap = Number(p.transaction_limit);
  return {
    id: p.id,
    title: p.title,
    description: p.description ?? "",
    monthly_subscription_fee: p.monthly_subscription_fee,
    currency: p.currency,
    is_default: p.is_default,
    features: [
      `${p.commission_percent}% per-transaction commission`,
      txCap < 0 ? "Unlimited transaction volume" : `Up to ${formatMoney(p.transaction_limit, p.currency)} / month`,
      Number(p.monthly_subscription_fee) > 0 ? "Priority support (12-hour response)" : "Standard support (48-hour response)",
      Number(p.monthly_subscription_fee) > 0 ? "Early access to new listings" : "Standard access",
    ],
  };
}

function exporterPlanToUI(p: ExporterPlan): PlanForUI {
  // "Store" and "market location" are the same concept to a Nigerian
  // seller - one shop in one marketplace - so we surface only the store
  // line. max_market still exists as a defensive backend guard but
  // listing it as a separate feature was confusing ("2 stores in 1 market
  // location" reads like two contradictory caps).
  const limit = (n: number, singular: string, plural: string) =>
    n < 0 ? `Unlimited ${plural}` : `${n} ${n === 1 ? singular : plural}`;
  return {
    id: p.id,
    title: p.title,
    description: p.description ?? "",
    monthly_subscription_fee: p.monthly_subscription_fee,
    currency: p.currency,
    is_default: p.is_default,
    features: [
      `${p.commission_percent}% per-transaction commission`,
      limit(p.max_store, "store", "stores"),
      limit(p.max_product, "product listing", "product listings"),
      ...(p.product_promotion
        ? [
            p.max_product_promotion < 0
              ? "Unlimited sponsored listings"
              : `Sponsored listings (up to ${p.max_product_promotion})`,
          ]
        : []),
    ],
  };
}

export function SubscriptionPage({ role }: { role: Role }) {
  const isImporter = role === "importer";
  const api = isImporter ? importerApi : exporterApi;
  const qc = useQueryClient();

  const subQ = useQuery({
    queryKey: [role, "subscription"],
    queryFn: api.getSubscription,
  });
  const importerPlans = useImporterPlans();
  const exporterPlans = useExporterPlans();
  const planRows: PlanForUI[] = isImporter
    ? (importerPlans.data?.rows ?? []).map(importerPlanToUI)
    : (exporterPlans.data?.rows ?? []).map(exporterPlanToUI);

  // Pre-warm the Flutterwave script on mount so clicks land on a ready
  // checkout. The upgrade handler also awaits this if it raced ahead.
  useEffect(() => {
    prewarmFlutterwave().catch(() => {
      /* failure surfaces lazily in the click handler */
    });
  }, []);

  const verify = useMutation({
    mutationFn: (txRef: string) => api.verifySubscription(txRef),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [role, "subscription"] });
      toast.success("Subscription activated");
    },
    onError: (err: Error) => {
      toast.error("Payment verification failed", {
        description: err.message || "Contact support if you were charged.",
      });
    },
  });

  const upgrade = useMutation({
    mutationFn: (planId: string) => api.upgradeSubscription(planId),
    // QA reported a silent-failure scenario where clicking Upgrade fired no
    // visible feedback. Without an onError, a 401/500/network error from
    // upgradeSubscription disappears into mutation state and the user sees
    // nothing. Surface every failure as a toast.
    onError: (err: Error) => {
      toast.error("Couldn't start checkout", {
        description: err.message || "Please refresh and try again.",
      });
    },
    onSuccess: async (data: SubscriptionUpgradeResponse) => {
      if (!("requires_payment" in data) || data.requires_payment === false) {
        qc.invalidateQueries({ queryKey: [role, "subscription"] });
        toast.success(`Switched to ${(data as { plan_title: string }).plan_title}`);
        return;
      }
      try {
        await openFlutterwaveInline({
          session: {
            public_key: data.public_key,
            tx_ref: data.tx_ref,
            amount: data.amount,
            currency: data.currency,
            payment_options: data.payment_options,
            customer: data.customer,
            customizations: data.customizations,
            split: data.split,
            meta: data.meta,
          },
          onSuccess: (txRef) => verify.mutate(txRef),
          onCancel: () => {
            // No charge made; subscription endpoint already handles the
            // pending Payment row, which the cron sweeps. No toast - the
            // user dismissed the modal intentionally.
          },
        });
      } catch (err) {
        toast.error("Payment system unavailable", {
          description: err instanceof Error ? err.message : "Please refresh and try again.",
        });
      }
    },
  });

  const cancel = useMutation({
    mutationFn: () => api.cancelSubscription(),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [role, "subscription"] });
      toast.success("Auto-renewal cancelled");
    },
    onError: (err: Error) => {
      toast.error("Couldn't cancel auto-renewal", {
        description: err.message || "Please try again.",
      });
    },
  });

  const currentPlanId = subQ.data?.current_plan?.id;
  const renewalDate = subQ.data?.plan_renewal_date;
  const sub = subQ.data?.subscription;
  const isPremiumActive = sub?.status === "active" || sub?.status === "cancelled";

  return (
    <>
      <PageHeader
        title="Subscription"
        description="Pick the plan that fits how you trade. Upgrade or downgrade any time."
      />

      {/* Current plan summary */}
      <Card className="mb-6">
        <CardContent className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
          {subQ.isLoading ? (
            <Skeleton className="h-16 w-full" />
          ) : (
            <>
              <div className="space-y-1">
                <p className="text-xs uppercase tracking-wider text-muted-foreground">Current plan</p>
                <div className="flex items-center gap-2">
                  <h2 className="text-2xl font-bold tracking-tight">
                    {subQ.data?.current_plan?.title ?? "-"}
                  </h2>
                  {isPremiumActive ? (
                    <Badge variant="accent">
                      <Crown className="size-3" /> Premium
                    </Badge>
                  ) : (
                    <Badge variant="secondary">Free</Badge>
                  )}
                  {sub?.status === "cancelled" ? <Badge variant="warning">Cancels at period end</Badge> : null}
                </div>
                {renewalDate ? (
                  <p className="text-sm text-muted-foreground">
                    {sub?.status === "cancelled" ? "Access until " : "Renews on "}
                    <span className="font-medium text-foreground">{formatDate(renewalDate)}</span>
                  </p>
                ) : (
                  <p className="text-sm text-muted-foreground">No renewal scheduled.</p>
                )}
                {/* Stored card row - only show when there's one AND we're auto-renewing */}
                {sub?.has_payment_token && sub.status === "active" ? (
                  <p className="flex items-center gap-1.5 text-sm text-muted-foreground pt-1">
                    <CreditCard className="size-4" aria-hidden />
                    Auto-renew with{" "}
                    <span className="font-medium text-foreground capitalize">
                      {sub.card_brand ?? "card"}
                    </span>{" "}
                    {sub.card_last4 ? (
                      <>
                        ending in <span className="font-mono">{sub.card_last4}</span>
                      </>
                    ) : null}
                  </p>
                ) : null}
                {/* Failure banner - surfaces silently-retried failures so the
                    buyer knows to update their card before access lapses. */}
                {sub && sub.renewal_failure_count > 0 && sub.status === "active" ? (
                  <p className="flex items-start gap-1.5 text-sm text-warning pt-1">
                    <AlertTriangle className="size-4 shrink-0 mt-0.5" aria-hidden />
                    <span>
                      Last renewal attempt failed ({sub.renewal_failure_count} of 3). We&apos;ll try again before {renewalDate ? formatDate(renewalDate) : "your renewal date"}.
                    </span>
                  </p>
                ) : null}
              </div>
              {sub && sub.status === "active" ? (
                <Button variant="outline" loading={cancel.isPending} onClick={() => cancel.mutate()}>
                  <X className="size-4" /> Cancel auto-renewal
                </Button>
              ) : null}
            </>
          )}
        </CardContent>
      </Card>

      {upgrade.isError ? (
        <Alert variant="destructive" className="mb-6">
          <AlertDescription>{(upgrade.error as Error).message}</AlertDescription>
        </Alert>
      ) : verify.isError ? (
        <Alert variant="destructive" className="mb-6">
          <AlertDescription>{(verify.error as Error).message}</AlertDescription>
        </Alert>
      ) : null}

      {/* Plan picker */}
      <div className="grid gap-4 sm:grid-cols-2">
        {(importerPlans.isLoading || exporterPlans.isLoading) && planRows.length === 0
          ? Array.from({ length: 2 }).map((_, i) => <Skeleton key={i} className="h-72 w-full" />)
          : planRows.map((plan) => {
              const fee = Number(plan.monthly_subscription_fee);
              const isPaid = fee > 0;
              const isCurrent = currentPlanId === plan.id;
              return (
                <Card key={plan.id} className={isPaid ? "border-accent" : ""}>
                  <CardContent className="space-y-4 p-6">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-xs uppercase tracking-wider text-muted-foreground">{plan.title}</p>
                        <h3 className="mt-1 text-2xl font-bold">
                          {formatMoney(plan.monthly_subscription_fee, plan.currency)}
                          <span className="text-sm font-normal text-muted-foreground">/month</span>
                        </h3>
                      </div>
                      {isPaid ? (
                        <Badge variant="accent">
                          <Sparkles className="size-3" /> Premium
                        </Badge>
                      ) : (
                        <Badge variant="secondary">Free</Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{plan.description}</p>
                    <ul className="space-y-1.5 text-sm">
                      {plan.features.map((f) => (
                        <li key={f} className="flex items-start gap-2">
                          <ShieldCheck className="mt-0.5 size-4 shrink-0 text-success" />
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>
                    <Button
                      className="w-full"
                      variant={isPaid && !isCurrent ? "default" : "outline"}
                      disabled={isCurrent || upgrade.isPending}
                      loading={upgrade.isPending && upgrade.variables === plan.id}
                      onClick={() => upgrade.mutate(plan.id)}
                    >
                      {isCurrent ? (
                        "Current plan"
                      ) : isPaid ? (
                        <>
                          <Zap className="size-4" /> Upgrade to {plan.title}
                        </>
                      ) : (
                        "Switch to free"
                      )}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
      </div>
    </>
  );
}

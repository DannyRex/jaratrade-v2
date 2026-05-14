"use client";

/**
 * Generic subscription page used by both importer and exporter dashboards.
 * Renders the user's current plan + auto-renew status, lists available plans
 * from the public catalog, and handles upgrade -> Flutterwave inline -> verify.
 */
import { useEffect, useState } from "react";
import { Crown, Sparkles, ShieldCheck, Zap, X } from "lucide-react";
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

declare global {
  interface Window {
    FlutterwaveCheckout?: (config: Record<string, unknown>) => void;
  }
}

const FLW_INLINE_SCRIPT = "https://checkout.flutterwave.com/v3.js";

function loadFlutterwave(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined") return reject(new Error("not in browser"));
    if (window.FlutterwaveCheckout) return resolve();
    const existing = document.querySelector(`script[src="${FLW_INLINE_SCRIPT}"]`);
    if (existing) {
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", () => reject(new Error("script failed to load")));
      return;
    }
    const s = document.createElement("script");
    s.src = FLW_INLINE_SCRIPT;
    s.async = true;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error("script failed to load"));
    document.head.appendChild(s);
  });
}

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
  const unlim = (n: number, suffix = "") => (n < 0 ? "Unlimited" : `${n}${suffix}`);
  return {
    id: p.id,
    title: p.title,
    description: p.description ?? "",
    monthly_subscription_fee: p.monthly_subscription_fee,
    currency: p.currency,
    is_default: p.is_default,
    features: [
      `${p.commission_percent}% per-transaction commission`,
      `${unlim(p.max_store, " stores")}`,
      `${unlim(p.max_market, " market locations")}`,
      `${unlim(p.max_product, " product listings")}`,
      ...(p.product_promotion ? [`Sponsored listings (up to ${unlim(p.max_product_promotion)})`] : []),
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

  const [scriptReady, setScriptReady] = useState(false);
  useEffect(() => {
    loadFlutterwave().then(() => setScriptReady(true)).catch(() => setScriptReady(false));
  }, []);

  const verify = useMutation({
    mutationFn: (txRef: string) => api.verifySubscription(txRef),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [role, "subscription"] });
      toast.success("Subscription activated");
    },
  });

  const upgrade = useMutation({
    mutationFn: (planId: string) => api.upgradeSubscription(planId),
    onSuccess: (data: SubscriptionUpgradeResponse) => {
      if (!("requires_payment" in data) || data.requires_payment === false) {
        qc.invalidateQueries({ queryKey: [role, "subscription"] });
        toast.success(`Switched to ${(data as { plan_title: string }).plan_title}`);
        return;
      }
      if (!scriptReady || !window.FlutterwaveCheckout) {
        toast.error("Payment system unavailable", { description: "Please refresh and try again." });
        return;
      }
      window.FlutterwaveCheckout({
        public_key: data.public_key,
        tx_ref: data.tx_ref,
        amount: data.amount,
        currency: data.currency,
        payment_options: data.payment_options,
        customer: data.customer,
        customizations: data.customizations,
        meta: data.meta,
        callback: (resp: { status: string; tx_ref: string }) => {
          if (resp.status === "successful") {
            verify.mutate(resp.tx_ref);
          } else {
            toast.error("Payment was not completed");
          }
        },
        onclose: () => {},
      });
    },
  });

  const cancel = useMutation({
    mutationFn: () => api.cancelSubscription(),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [role, "subscription"] });
      toast.success("Auto-renewal cancelled");
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
                    {subQ.data?.current_plan?.title ?? "—"}
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

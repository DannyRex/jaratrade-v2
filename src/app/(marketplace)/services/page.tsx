"use client";

import Link from "next/link";
import { Check, Crown, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/ui/page-header";
import { useExporterPlans, useImporterPlans } from "@/lib/queries";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatMoney } from "@/lib/format";
import type { ExporterPlan, ImporterPlan } from "@/lib/types";

function unlimitedOr(value: number | string, suffix = "") {
  const v = typeof value === "string" ? Number(value) : value;
  if (v < 0) return "Unlimited";
  return `${v}${suffix}`;
}

export default function ServicesPage() {
  const importerPlans = useImporterPlans();
  const exporterPlans = useExporterPlans();

  return (
    <div className="container mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <PageHeader
        eyebrow="Subscription plans"
        title="Pick a plan that grows with you"
        description="Free to start. Upgrade when you outgrow the limits - every plan covers full marketplace access."
      />

      <Tabs defaultValue="importer" className="mt-6">
        <TabsList>
          <TabsTrigger value="importer">For importers</TabsTrigger>
          <TabsTrigger value="exporter">For exporters</TabsTrigger>
        </TabsList>

        <TabsContent value="importer" className="mt-6">
          <div className="grid gap-4 md:grid-cols-2">
            {importerPlans.isLoading
              ? Array.from({ length: 2 }).map((_, i) => (
                  <div key={i} className="h-[400px] animate-pulse rounded-lg border bg-muted" />
                ))
              : (importerPlans.data?.rows ?? []).map((plan) => (
                  <ImporterPlanCard key={plan.id} plan={plan} />
                ))}
          </div>
        </TabsContent>

        <TabsContent value="exporter" className="mt-6">
          <div className="grid gap-4 md:grid-cols-2">
            {exporterPlans.isLoading
              ? Array.from({ length: 2 }).map((_, i) => (
                  <div key={i} className="h-[400px] animate-pulse rounded-lg border bg-muted" />
                ))
              : (exporterPlans.data?.rows ?? []).map((plan) => (
                  <ExporterPlanCard key={plan.id} plan={plan} />
                ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function ImporterPlanCard({ plan }: { plan: ImporterPlan }) {
  const isPremium = Number(plan.monthly_subscription_fee) > 0;
  return (
    <Card className={isPremium ? "border-accent shadow-md" : ""}>
      <CardContent className="space-y-4 p-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs uppercase tracking-wider text-muted-foreground">{plan.title}</p>
            <h3 className="mt-1 text-2xl font-bold">
              {formatMoney(plan.monthly_subscription_fee, plan.currency)}
              <span className="text-sm font-normal text-muted-foreground">/month</span>
            </h3>
          </div>
          {isPremium ? (
            <Badge variant="accent">
              <Crown className="size-3" /> Premium
            </Badge>
          ) : (
            <Badge variant="secondary">Free</Badge>
          )}
        </div>
        <p className="text-sm text-muted-foreground">{plan.description}</p>
        <ul className="space-y-2 pt-2 text-sm">
          <Feature label={`${plan.commission_percent}% per-transaction commission`} />
          <Feature
            label={
              Number(plan.transaction_limit) < 0
                ? "Unlimited transaction volume"
                : `Up to ${formatMoney(plan.transaction_limit, plan.currency)} / month`
            }
          />
          <Feature label={`${unlimitedOr(plan.product_limit, " products to favourite")}`} />
          {isPremium ? <Feature label="Priority support (12-hour response)" /> : <Feature label="Standard support (48-hour response)" />}
        </ul>
        <Button asChild className="w-full" variant={isPremium ? "default" : "outline"}>
          <Link href={`/auth/register/importer?plan=${plan.id}`}>
            {isPremium ? "Start Premium" : "Start free"}
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}

function ExporterPlanCard({ plan }: { plan: ExporterPlan }) {
  const isPremium = Number(plan.monthly_subscription_fee) > 0;
  return (
    <Card className={isPremium ? "border-accent shadow-md" : ""}>
      <CardContent className="space-y-4 p-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs uppercase tracking-wider text-muted-foreground">{plan.title}</p>
            <h3 className="mt-1 text-2xl font-bold">
              {formatMoney(plan.monthly_subscription_fee, plan.currency)}
              <span className="text-sm font-normal text-muted-foreground">/month</span>
            </h3>
          </div>
          {isPremium ? (
            <Badge variant="accent">
              <Sparkles className="size-3" /> Premium
            </Badge>
          ) : (
            <Badge variant="secondary">Free</Badge>
          )}
        </div>
        <p className="text-sm text-muted-foreground">{plan.description}</p>
        <ul className="space-y-2 pt-2 text-sm">
          <Feature label={`${plan.commission_percent}% per-transaction commission`} />
          <Feature label={`${unlimitedOr(plan.max_store, " stores")}`} />
          <Feature label={`${unlimitedOr(plan.max_market, " market locations")}`} />
          <Feature label={`${unlimitedOr(plan.max_product, " product listings")}`} />
          {plan.product_promotion ? (
            <Feature label={`Sponsored listings (up to ${unlimitedOr(plan.max_product_promotion)} promoted)`} />
          ) : null}
        </ul>
        <Button asChild className="w-full" variant={isPremium ? "default" : "outline"}>
          <Link href={`/auth/register/exporter?plan=${plan.id}`}>
            {isPremium ? "Start Premium" : "Start free"}
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}

function Feature({ label }: { label: string }) {
  return (
    <li className="flex items-start gap-2">
      <Check className="mt-0.5 size-4 shrink-0 text-success" aria-hidden />
      <span>{label}</span>
    </li>
  );
}

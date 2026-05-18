"use client";

/**
 * /services — Plans & pricing (exporter-only).
 *
 * v3.4 change: importers don't subscribe anymore - buying is free across
 * the board. This page now only presents exporter plans, with a small
 * callout up top explaining the model to anyone arriving from a buyer
 * context.
 */
import Link from "next/link";
import { ArrowRight, Check, Sparkles, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PageHero } from "@/components/marketing/page-hero";
import { useExporterPlans } from "@/lib/queries";
import { formatMoney } from "@/lib/format";
import type { ExporterPlan } from "@/lib/types";

function unlimitedOr(value: number | string, suffix = "") {
  const v = typeof value === "string" ? Number(value) : value;
  if (v < 0) return "Unlimited";
  return `${v}${suffix}`;
}

export default function ServicesPage() {
  const exporterPlans = useExporterPlans();
  const plans = exporterPlans.data?.rows ?? [];

  return (
    <>
      <PageHero
        eyebrow="Plans & pricing"
        title={
          <>
            Free to start.{" "}
            <span className="text-gradient-brand">Pay when you sell.</span>
          </>
        }
        description="One plan keeps you live, listed and verified. Premium adds reach when you're ready to scale."
      />

      <section className="container mx-auto max-w-6xl px-4 pb-12 sm:px-6 lg:px-8">
        {/* Importer note */}
        <div className="mb-12 flex flex-col items-start gap-3 rounded-2xl border border-success/20 bg-success/5 p-5 sm:flex-row sm:items-center sm:gap-5">
          <div className="grid size-11 shrink-0 place-items-center rounded-xl bg-success/10 text-success ring-1 ring-success/20">
            <Wallet className="size-5" aria-hidden />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-display text-base font-semibold tracking-tight sm:text-lg">
              Buying on Jaratrade is free
            </p>
            <p className="mt-0.5 text-sm text-muted-foreground">
              Importers pay only for goods and shipping - no subscription, no membership. The plans below are for sellers.
            </p>
          </div>
          <Button asChild variant="outline" size="sm" className="shrink-0 rounded-full">
            <Link href="/auth/register/importer">
              Sign up as buyer <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>

        {/* Exporter plans */}
        <div className="mb-10 max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
            For sellers
          </p>
          <h2 className="mt-2 font-display text-3xl font-bold tracking-tight md:text-4xl">
            Two plans. No contracts.
          </h2>
          <p className="mt-3 text-muted-foreground">
            Start on the Free tier and switch to Premium when the commission savings outpace the
            monthly fee. Both come with full marketplace access, dispute support, and Flutterwave-secured
            payouts.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          {exporterPlans.isLoading
            ? Array.from({ length: 2 }).map((_, i) => (
                <div key={i} className="h-[420px] animate-pulse rounded-2xl border border-border/70 bg-muted" />
              ))
            : plans
                .slice()
                .sort((a, b) => Number(a.monthly_subscription_fee) - Number(b.monthly_subscription_fee))
                .map((plan) => <ExporterPlanCard key={plan.id} plan={plan} />)}
        </div>

        {/* Subtle deep link */}
        <p className="mt-10 text-center text-sm text-muted-foreground">
          Already a seller?{" "}
          <Link href="/exporter/subscription" className="font-semibold text-primary hover:underline">
            Manage your subscription
          </Link>
        </p>
      </section>
    </>
  );
}

function ExporterPlanCard({ plan }: { plan: ExporterPlan }) {
  const isPremium = Number(plan.monthly_subscription_fee) > 0;
  return (
    <Card
      className={
        "relative overflow-hidden rounded-2xl border border-border/70 transition-all hover:-translate-y-0.5 hover:shadow-[var(--shadow-brand)] " +
        (isPremium ? "border-primary/30 shadow-[var(--shadow-brand)]" : "")
      }
    >
      {isPremium ? (
        <span className="absolute right-4 top-4 rounded-full bg-accent/15 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-accent">
          ★ Best for active sellers
        </span>
      ) : null}
      <CardContent className="space-y-5 p-7">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-muted-foreground">
            {plan.title}
          </p>
          <div className="mt-2 flex items-baseline gap-1.5">
            <h3 className="font-display text-3xl font-bold tracking-tight tabular-nums sm:text-4xl">
              {formatMoney(plan.monthly_subscription_fee, plan.currency)}
            </h3>
            <span className="text-sm text-muted-foreground">/month</span>
          </div>
          <p className="mt-1.5 text-sm text-muted-foreground">
            {plan.commission_percent}% commission per transaction
          </p>
          {isPremium ? (
            <Badge variant="accent" className="mt-3 inline-flex">
              <Sparkles className="size-3" /> Premium
            </Badge>
          ) : (
            <Badge variant="secondary" className="mt-3 inline-flex">Free</Badge>
          )}
        </div>

        <p className="text-sm leading-relaxed text-muted-foreground">{plan.description}</p>

        <ul className="space-y-2.5 text-sm">
          <Feature label={`${unlimitedOr(plan.max_store, " stores")}`} />
          <Feature label={`${unlimitedOr(plan.max_market, " market locations")}`} />
          <Feature label={`${unlimitedOr(plan.max_product, " product listings")}`} />
          {plan.product_promotion ? (
            <Feature label={`Sponsored listings (up to ${unlimitedOr(plan.max_product_promotion)} promoted)`} />
          ) : null}
          <Feature
            label={
              isPremium
                ? "12-hour priority support"
                : "Standard support (48-hour response)"
            }
          />
          {isPremium ? <Feature label="Early access to new UK buyers" /> : null}
        </ul>

        <Button
          asChild
          size="lg"
          className="w-full rounded-full"
          variant={isPremium ? "default" : "outline"}
        >
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
    <li className="flex items-start gap-2.5">
      <Check className="mt-0.5 size-4 shrink-0 text-success" aria-hidden />
      <span>{label}</span>
    </li>
  );
}

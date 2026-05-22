/**
 * /trust - Trust & Safety as a marketing page.
 *
 * Sections:
 *  1. KYC standards (with the verification checklist)
 *  2. Secured payments (Flutterwave escrow explainer)
 *  3. Dispute resolution (3-stage process card)
 *  4. Inventory accuracy
 *  5. Reporting fraud + what to expect in 48 hours
 *  6. CTA
 */
import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  ShieldCheck,
  Lock,
  Scale,
  PackageSearch,
  AlertTriangle,
  Clock4,
} from "lucide-react";
import { PageHero } from "@/components/marketing/page-hero";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Trust & safety",
  description:
    "How Jaratrade protects buyers and sellers - KYC verification, Flutterwave-secured escrow, a 1-day dispute window. We review every claim.",
};

const disputeStages = [
  {
    n: "01",
    title: "Open",
    detail:
      "You file a dispute with a description and (ideally) photos. The seller is notified immediately.",
  },
  {
    n: "02",
    title: "In review",
    detail:
      "A Jaratrade admin reads the complaint and any evidence. Usually within 1 business day.",
  },
  {
    n: "03",
    title: "Resolved",
    detail:
      "One of three outcomes: refund (full or partial via Flutterwave), replacement (we re-ship at the seller's cost), or dismissed (with a written explanation).",
  },
];

const slas = [
  { window: "Within 1 hour", action: "Automated receipt of your report" },
  { window: "Within 4 business hours", action: "Initial review" },
  { window: "Within 48 hours", action: "Resolution path communicated" },
];

export default function TrustPage() {
  return (
    <>
      <PageHero
        eyebrow="Trust &amp; safety"
        title={
          <>
            Trade with{" "}
            <span className="text-primary">confidence.</span>
          </>
        }
        description="Every order on Jaratrade is backed by KYC verification, funds held in escrow, and a 1-day dispute window. We review every claim."
      />

      {/* KYC standards */}
      <section className="container mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
        <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
              KYC standards
            </p>
            <h2 className="mt-2 font-display text-3xl font-bold tracking-tight md:text-4xl">
              Every seller verified before they list
            </h2>
            <p className="mt-4 max-w-xl text-muted-foreground">
              About 25% of applicants don&apos;t get through. We&apos;d rather lose the
              seller than lose a buyer&apos;s trust.
            </p>
          </div>
          <ul className="grid gap-4 sm:grid-cols-2 lg:gap-5">
            {[
              { label: "Corporate Affairs Commission", note: "CAC business registration verified" },
              { label: "Director-level ID", note: "NIN, passport, or driver's licence" },
              { label: "Address verification", note: "Third-party reference + spot inspection" },
              { label: "Bank account verification", note: "Confirmed in the business name" },
            ].map((c) => (
              <li
                key={c.label}
                className="rounded-2xl border border-border/70 bg-card p-4 transition-colors hover:border-primary/30"
              >
                <div className="flex items-start gap-3">
                  <ShieldCheck className="mt-0.5 size-5 shrink-0 text-success" aria-hidden />
                  <div>
                    <p className="text-sm font-semibold">{c.label}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">{c.note}</p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Secured payments */}
      <section className="border-y border-border/60 bg-muted/30">
        <div className="container mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
          <div className="grid gap-8 lg:grid-cols-[1fr_1.4fr] lg:items-stretch lg:gap-14">
            {/* Flutterwave card - no aspect ratio, natural height. On lg+ a
                min-height makes the card look intentional next to the wider
                text column. */}
            <div className="flex">
              <div className="flex w-full flex-col gap-6 rounded-3xl border border-border/70 bg-card p-6 shadow-[var(--shadow-pop)] sm:p-8 lg:min-h-[320px] lg:justify-between">
                <div className="flex items-start justify-between gap-4">
                  <div className="grid size-11 place-items-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/15">
                    <Lock className="size-5" aria-hidden />
                  </div>
                  <span className="self-center text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
                    Powered by
                  </span>
                </div>
                <div className="min-w-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/brand/partners/flutterwave.svg"
                    alt="Flutterwave"
                    className="block h-8 w-auto max-w-full sm:h-10"
                  />
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                    PCI DSS Level 1 certified. Licensed payments across Nigeria, the UK and US.
                  </p>
                </div>
              </div>
            </div>
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
                Secured payments
              </p>
              <h2 className="mt-2 font-display text-3xl font-bold tracking-tight md:text-4xl">
                Funds held until you confirm delivery
              </h2>
              <p className="mt-4 max-w-xl text-muted-foreground">
                Every transaction runs through Flutterwave. Buyer funds are held in
                escrow from payment until you confirm receipt - only then do we
                release to the seller. If the order goes wrong, we can refund
                without involving the seller&apos;s bank.
              </p>
              <ul className="mt-6 space-y-3 text-sm">
                {[
                  "Card, bank transfer, or USSD accepted",
                  "Funds held in regulated escrow until delivery confirmed",
                  "PCI DSS Level 1 compliant payment processing",
                  "Refunds processed to the original payment method",
                ].map((c) => (
                  <li key={c} className="flex items-start gap-2.5">
                    <ShieldCheck className="mt-0.5 size-4 shrink-0 text-success" aria-hidden />
                    <span>{c}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Dispute resolution */}
      <section className="container mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
            Dispute resolution
          </p>
          <h2 className="mt-2 font-display text-3xl font-bold tracking-tight md:text-4xl">
            1 day to raise it. We review every case.
          </h2>
          <p className="mt-4 text-muted-foreground">
            You can resolve disputes from the importer dashboard. We email the
            seller and the admin team at every stage.
          </p>
        </div>
        <ol className="grid gap-5 sm:grid-cols-3 lg:gap-6">
          {disputeStages.map((s) => (
            <li
              key={s.n}
              className="group relative overflow-hidden rounded-2xl border border-border/70 bg-card p-7 transition-all hover:-translate-y-1 hover:border-primary/30 hover:shadow-[var(--shadow-brand)]"
            >
              <span
                className="pointer-events-none absolute -right-2 -top-6 font-display text-[7rem] font-bold leading-none text-primary/[0.08] select-none"
                aria-hidden
              >
                {s.n}
              </span>
              <div className="relative">
                <div className="mb-4 grid size-11 place-items-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/15">
                  <Scale className="size-5" aria-hidden />
                </div>
                <h3 className="font-display text-xl font-semibold tracking-tight">
                  {s.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {s.detail}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      {/* Inventory accuracy */}
      <section className="border-y border-border/60 bg-muted/30">
        <div className="container mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
          <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
                Inventory accuracy
              </p>
              <h2 className="mt-2 font-display text-3xl font-bold tracking-tight md:text-4xl">
                If it&apos;s listed, it ships
              </h2>
              <p className="mt-4 max-w-xl text-muted-foreground">
                Sellers confirm stock weekly. If a product is listed and turns out
                to be out of stock when you order, we&apos;ll either refund within
                24 hours or help you find a substitute from another verified seller.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-border/70 bg-card p-5">
                <div className="mb-3 grid size-10 place-items-center rounded-lg bg-primary/10 text-primary">
                  <PackageSearch className="size-5" aria-hidden />
                </div>
                <p className="text-sm font-semibold">Weekly stock confirmation</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Sellers are prompted every Monday to confirm their listed counts.
                </p>
              </div>
              <div className="rounded-2xl border border-border/70 bg-card p-5">
                <div className="mb-3 grid size-10 place-items-center rounded-lg bg-primary/10 text-primary">
                  <Clock4 className="size-5" aria-hidden />
                </div>
                <p className="text-sm font-semibold">24-hour refund SLA</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  If we can&apos;t fulfil, the refund is in your account inside a day.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Reporting + SLA */}
      <section className="container mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
        <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
              Report fraud
            </p>
            <h2 className="mt-2 font-display text-3xl font-bold tracking-tight md:text-4xl">
              See something? Tell us.
            </h2>
            <p className="mt-4 max-w-xl text-muted-foreground">
              Suspect something&apos;s off? Email{" "}
              <a href="mailto:admin@jaratrade.com" className="font-medium text-primary underline-offset-4 hover:underline">
                admin@jaratrade.com
              </a>
              . We act on every report within 24 hours and never share the
              reporter&apos;s identity with the subject of the report.
            </p>
            <div className="mt-6 rounded-2xl border border-warning/30 bg-warning/5 p-5">
              <div className="flex items-start gap-3">
                <AlertTriangle className="mt-0.5 size-5 shrink-0 text-warning" aria-hidden />
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    If it&apos;s urgent (safety, ongoing fraud)
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Call our 24/7 line at the bottom of any importer / exporter dashboard.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
              What to expect from us
            </p>
            <h2 className="mt-2 font-display text-3xl font-bold tracking-tight md:text-4xl">
              48 hours, three milestones
            </h2>
            <ul className="mt-6 space-y-3">
              {slas.map((s) => (
                <li
                  key={s.window}
                  className="flex items-center justify-between gap-4 rounded-xl border border-border/70 bg-card p-4"
                >
                  <span className="text-sm font-semibold">{s.window}</span>
                  <span className="text-right text-sm text-muted-foreground">{s.action}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="container mx-auto max-w-3xl px-4 py-20 text-center sm:px-6 lg:px-8 lg:py-24">
        <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
          Questions about trust &amp; safety?
        </h2>
        <p className="mt-4 text-muted-foreground">
          Talk to our trust team or read the full terms.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button asChild size="lg" className="rounded-full px-6 shadow-[var(--shadow-brand)]">
            <Link href="/contact">
              Contact trust &amp; safety <ArrowRight className="size-4" />
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="rounded-full px-6">
            <Link href="/legal/terms">Read the full terms</Link>
          </Button>
        </div>
      </section>
    </>
  );
}

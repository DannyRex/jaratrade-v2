/**
 * /help/exporter - How to sell on Jaratrade.
 *
 * Practical onboarding guide. Six sections:
 *  1. 4-step start (numbered cards)
 *  2. What we look for
 *  3. Support cadence
 *  4. Fees (transparent table)
 *  5. FAQ
 *  6. CTA
 */
import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  ClipboardCheck,
  Upload,
  Banknote,
  Building2,
  MessageCircle,
  Phone,
  CalendarCheck,
} from "lucide-react";
import { PageHero } from "@/components/marketing/page-hero";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Sell on Jaratrade · Exporter resources",
  description:
    "How to sell to UK importers on Jaratrade. KYC, listing, fulfilment, payouts - all the steps and what to expect.",
};

const steps = [
  {
    icon: ClipboardCheck,
    title: "Apply",
    detail:
      "Create an exporter account in two minutes. Submit your CAC details, director ID, and bank account.",
  },
  {
    icon: Building2,
    title: "Verify",
    detail:
      "Our team checks your details. Clean applications go live within 48 hours. If we need more, we&apos;ll email you the specifics.",
  },
  {
    icon: Upload,
    title: "List your products",
    detail:
      "Upload product photos, weights, MOQs and prices. We help with packaging and listing optimisation if you need it.",
  },
  {
    icon: Banknote,
    title: "Get paid",
    detail:
      "Your share is held in a dedicated Flutterwave subaccount from the moment the buyer pays. It's released to your Nigerian bank account once the buyer confirms receipt, or 1 day after you mark the order delivered - whichever comes first.",
  },
];

const supportCadence = [
  {
    icon: MessageCircle,
    label: "Day-to-day",
    detail: "WhatsApp support, weekdays 8am-7pm WAT",
  },
  {
    icon: Phone,
    label: "Critical issues",
    detail: "Direct line to exporter ops, 24/7",
  },
  {
    icon: CalendarCheck,
    label: "Monthly office hours",
    detail: "Open to every active seller",
  },
  {
    icon: ClipboardCheck,
    label: "Quarterly check-ins",
    detail: "Listings, photography, pricing review",
  },
];

const faqs = [
  {
    q: "How long does verification take?",
    a: "24-48 hours for clean applications. If we need additional documents, we'll email you with specifics and the same SLA restarts once you respond.",
  },
  {
    q: "When exactly do I get paid?",
    a: "We split each payment at the moment the buyer pays - your share lands in a dedicated Flutterwave subaccount in your name (not Jaratrade's bank). It's released to your nominated Nigerian bank account when either (a) the buyer presses 'Confirm receipt' on their order page, or (b) 1 day passes after you mark the order delivered, whichever happens first. Payouts go out on a nightly schedule via Flutterwave's Transfers API, so most sellers see funds T+0 or T+1.",
  },
  {
    q: "What happens if a buyer disputes an order?",
    a: "If a dispute is raised before payout, your share stays in escrow until our trust & safety team resolves the case (typically within 1 business day). Outcomes are refund, replacement, or dismissed with reasons. If the dispute is dismissed, the payout proceeds on the normal schedule.",
  },
  {
    q: "How will I know what's happening with my orders?",
    a: "You'll get an email the moment a buyer's payment clears (so you can start preparing the shipment), and another every time the buyer confirms receipt. The orders page in your dashboard always shows the live status of each order plus its payment + payout state.",
  },
  {
    q: "Who pays for shipping?",
    a: "The buyer, always. You can offer your own logistics or hand it to a Jaratrade-vetted partner so the buyer gets a single price at checkout.",
  },
  {
    q: "Can I bulk-upload products?",
    a: "Yes - we have a CSV importer for sellers with 50+ SKUs. Email admin@jaratrade.com for the template.",
  },
  {
    q: "Can I sell from multiple markets?",
    a: "Yes. On the Premium tier you can add a store per market with unlimited listings across them.",
  },
];

export default function ExporterHelpPage() {
  return (
    <>
      <PageHero
        eyebrow="For exporters"
        title={
          <>
            Sell to the UK,{" "}
            <span className="text-primary">from your market stall.</span>
          </>
        }
        description="Jaratrade brings UK buyers to you. Apply once, list your catalogue, and we'll handle the matching, payments, and dispute layer."
        ctaPrimary={{ label: "Create exporter account", href: "/auth/register/exporter" }}
        ctaSecondary={{ label: "Contact sales", href: "/contact" }}
      />

      {/* 4-step onboarding */}
      <section className="container mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
            Get started
          </p>
          <h2 className="mt-2 font-display text-3xl font-bold tracking-tight md:text-4xl">
            Four steps to your first order
          </h2>
        </div>
        <ol className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, i) => (
            <li
              key={step.title}
              className="group relative overflow-hidden rounded-2xl border border-border/70 bg-card p-6 transition-all hover:-translate-y-1 hover:border-primary/30 hover:shadow-[var(--shadow-brand)]"
            >
              <span
                className="pointer-events-none absolute -right-2 -top-6 font-display text-[7rem] font-bold leading-none text-primary/[0.08] select-none"
                aria-hidden
              >
                {String(i + 1).padStart(2, "0")}
              </span>
              <div className="relative">
                <div className="mb-4 grid size-11 place-items-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/15">
                  <step.icon className="size-5" aria-hidden />
                </div>
                <h3 className="font-display text-lg font-semibold tracking-tight">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground" dangerouslySetInnerHTML={{ __html: step.detail }} />
              </div>
            </li>
          ))}
        </ol>
      </section>

      {/* What we look for */}
      <section className="border-y border-border/60 bg-muted/30">
        <div className="container mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
          <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
                Eligibility
              </p>
              <h2 className="mt-2 font-display text-3xl font-bold tracking-tight md:text-4xl">
                What we look for
              </h2>
              <p className="mt-4 max-w-xl text-muted-foreground">
                We&apos;re picky about who we let in - that&apos;s how we keep
                buyer trust. A strong application has these things in place.
              </p>
            </div>
            <ul className="space-y-3">
              {[
                "A registered business (sole prop or limited liability - both accepted)",
                "A bank account in the business name",
                "A working address you can prove",
                "A product range that&apos;s export-ready - consistent stock, decent photos, fair pricing",
              ].map((c) => (
                <li
                  key={c}
                  className="flex gap-3 rounded-xl border border-border/70 bg-card p-4 text-sm"
                  dangerouslySetInnerHTML={{
                    __html: `<svg viewBox="0 0 20 20" class="mt-0.5 size-5 shrink-0 fill-success" aria-hidden><path d="M16.7 5.3a1 1 0 0 1 0 1.4l-7 7a1 1 0 0 1-1.4 0l-3-3a1 1 0 1 1 1.4-1.4L9 11.6l6.3-6.3a1 1 0 0 1 1.4 0Z"/></svg><span>${c}</span>`,
                  }}
                />
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Support cadence */}
      <section className="container mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
        <div className="mb-12 max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
            Support that shows up
          </p>
          <h2 className="mt-2 font-display text-3xl font-bold tracking-tight md:text-4xl">
            We&apos;re there when it matters
          </h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {supportCadence.map((c) => (
            <div key={c.label} className="rounded-2xl border border-border/70 bg-card p-5">
              <div className="mb-3 grid size-10 place-items-center rounded-lg bg-primary/10 text-primary">
                <c.icon className="size-5" aria-hidden />
              </div>
              <p className="text-sm font-semibold">{c.label}</p>
              <p className="mt-1 text-xs text-muted-foreground">{c.detail}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Fees */}
      <section className="border-y border-border/60 bg-muted/30">
        <div className="container mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
          <div className="mb-10 text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
              Pricing
            </p>
            <h2 className="mt-2 font-display text-3xl font-bold tracking-tight md:text-4xl">
              You only pay when you sell
            </h2>
            <p className="mt-3 text-muted-foreground">
              List for free. Pay a small commission per transaction - no listing
              fees, no setup fees, no monthly minimums.
            </p>
          </div>
          <div className="grid gap-5 md:grid-cols-2">
            <div className="rounded-2xl border border-border/70 bg-card p-7">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-muted-foreground">
                Free tier
              </p>
              <p className="mt-2 font-display text-3xl font-bold tracking-tight">
                ₦0<span className="text-base font-medium text-muted-foreground"> /month</span>
              </p>
              <p className="mt-1 text-sm text-muted-foreground">2% commission per transaction</p>
              <ul className="mt-5 space-y-2 text-sm text-foreground/85">
                <li>• 1 store and up to 5 product listings</li>
                <li>• 48-hour support response</li>
                <li>• Standard search ranking</li>
              </ul>
            </div>
            <div className="relative overflow-hidden rounded-2xl border-2 border-primary/30 bg-card p-7 shadow-[var(--shadow-brand)]">
              <span className="absolute right-4 top-4 rounded-full bg-accent/15 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-accent">
                ★ Best for active sellers
              </span>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">
                Premium tier
              </p>
              <p className="mt-2 font-display text-3xl font-bold tracking-tight">
                ₦150,000<span className="text-base font-medium text-muted-foreground"> /month</span>
              </p>
              <p className="mt-1 text-sm text-muted-foreground">1.5% commission per transaction</p>
              <ul className="mt-5 space-y-2 text-sm text-foreground/85">
                <li>• Unlimited stores and listings</li>
                <li>• Sponsored placements in search</li>
                <li>• 12-hour priority support</li>
                <li>• Early access to new buyers</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="container mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
        <div className="mb-10 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
            Common questions
          </p>
          <h2 className="mt-2 font-display text-3xl font-bold tracking-tight md:text-4xl">
            Asked &amp; answered
          </h2>
        </div>
        <dl className="space-y-4">
          {faqs.map((f) => (
            <div
              key={f.q}
              className="rounded-2xl border border-border/70 bg-card p-6 transition-colors hover:border-primary/30"
            >
              <dt className="font-display text-base font-semibold tracking-tight">{f.q}</dt>
              <dd className="mt-2 text-sm leading-relaxed text-muted-foreground">{f.a}</dd>
            </div>
          ))}
        </dl>
      </section>

      {/* Final CTA */}
      <section className="container mx-auto max-w-3xl px-4 pb-20 text-center sm:px-6 lg:px-8 lg:pb-24">
        <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
          Ready to ship to the UK?
        </h2>
        <p className="mt-4 text-muted-foreground">
          Apply now. We&apos;ll get back within 48 hours.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button asChild size="lg" className="rounded-full px-6 shadow-[var(--shadow-brand)]">
            <Link href="/auth/register/exporter">
              Create exporter account <ArrowRight className="size-4" />
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="rounded-full px-6">
            <Link href="/contact">Talk to sales</Link>
          </Button>
        </div>
      </section>
    </>
  );
}

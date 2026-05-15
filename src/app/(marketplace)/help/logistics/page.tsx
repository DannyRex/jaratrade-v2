/**
 * /help/logistics — How shipping works.
 *
 * Sections:
 *   1. Two paths (self-ship vs Jaratrade partners)
 *   2. What our partners do (4-up grid)
 *   3. Incoterms primer (plain English)
 *   4. FAQ
 *   5. CTA
 */
import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  Anchor,
  Truck,
  ShieldCheck,
  FileCheck2,
  Navigation,
  PackageCheck,
} from "lucide-react";
import { PageHero } from "@/components/marketing/page-hero";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Shipping & logistics · How it works",
  description:
    "Two ways to ship on Jaratrade — your own freight or a Jaratrade-vetted partner. Quotes at checkout, customs handled, full tracking.",
};

const partnerDuties = [
  {
    icon: ShieldCheck,
    title: "Vetting",
    detail:
      "Documented operating licences, port-clearing agents, and customs brokers on staff. We check each year.",
  },
  {
    icon: FileCheck2,
    title: "Quotes at checkout",
    detail:
      "Live quotes from each partner before the buyer pays. No \"we'll get back to you\" — they see the price and decide.",
  },
  {
    icon: Navigation,
    title: "End-to-end tracking",
    detail:
      "Every leg from Lagos, Kano or Onitsha to the UK destination, tracked via a single Jaratrade link.",
  },
  {
    icon: PackageCheck,
    title: "Customs handled",
    detail:
      "Partners file Nigerian export declarations and UK import declarations. Buyers never deal with HMRC.",
  },
];

const incoterms = [
  {
    code: "EXW",
    label: "Ex Works",
    description:
      "You hand over the goods at your warehouse. Buyer arranges everything else.",
  },
  {
    code: "FOB",
    label: "Free On Board",
    description:
      "You load the goods onto the ship at a Nigerian port (usually Apapa or Tin Can). Buyer takes over from there.",
  },
  {
    code: "CIF",
    label: "Cost, Insurance, Freight",
    description:
      "You pay to get the goods to the UK port. Buyer handles import duties and last-mile.",
  },
  {
    code: "DDP",
    label: "Delivered Duty Paid",
    description:
      "Door-to-door. You pay for everything. Jaratrade partners default to this — the buyer's quoted price is the final price.",
  },
];

const faqs = [
  {
    q: "How long does shipping take?",
    a: "7–14 days door-to-door for sea freight; 3–5 days for air. Quotes at checkout show the partner's specific SLA.",
  },
  {
    q: "What if my goods are seized at customs?",
    a: "Your partner files the appeal. Buyer funds stay in escrow until the dispute resolves — at which point we refund or release as the outcome dictates.",
  },
  {
    q: "Can I see partner ratings?",
    a: "Yes. Every partner has a public rating built from past shipments. You see it on the quote screen before you choose.",
  },
  {
    q: "What if I already have a freight forwarder?",
    a: "Use them. Mark the order \"shipped\" with your tracking number and we surface it to the buyer. Self-ship is fully supported.",
  },
];

export default function LogisticsHelpPage() {
  return (
    <>
      <PageHero
        eyebrow="Logistics"
        title={
          <>
            Two ways to ship.{" "}
            <span className="text-gradient-brand">Both work.</span>
          </>
        }
        description="You can use your own freight company or hand the leg to a Jaratrade-vetted partner. Whatever fits your operation."
      />

      {/* Two paths */}
      <section className="container mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
        <div className="grid gap-6 md:grid-cols-2 lg:gap-8">
          <article className="rounded-2xl border border-border/70 bg-card p-7">
            <div className="mb-4 grid size-12 place-items-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/15">
              <Anchor className="size-6" aria-hidden />
            </div>
            <h2 className="font-display text-2xl font-bold tracking-tight">Self-ship</h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              Already work with a freight company you trust? Keep using them.
              Mark the order as &quot;shipped&quot; with a tracking number and
              we surface it to your buyer. Funds stay in escrow until delivery
              is confirmed.
            </p>
            <ul className="mt-5 space-y-2 text-sm">
              <li>• Use any freight company</li>
              <li>• No additional fee from Jaratrade</li>
              <li>• You handle customs paperwork</li>
            </ul>
          </article>
          <article className="relative overflow-hidden rounded-2xl border-2 border-primary/30 bg-card p-7 shadow-[var(--shadow-brand)]">
            <span className="absolute right-4 top-4 rounded-full bg-accent/15 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-accent">
              ★ Easiest path
            </span>
            <div className="mb-4 grid size-12 place-items-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/15">
              <Truck className="size-6" aria-hidden />
            </div>
            <h2 className="font-display text-2xl font-bold tracking-tight">Jaratrade Logistics Partners</h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              Pick a vetted shipper at checkout and get a single price covering
              customs, freight, and last-mile UK delivery. The buyer pays the
              quoted price. You print a label and hand over the carton.
            </p>
            <ul className="mt-5 space-y-2 text-sm">
              <li>• Pre-vetted partners</li>
              <li>• Quotes shown to the buyer at checkout</li>
              <li>• Full door-to-door tracking</li>
              <li>• Customs handled both sides</li>
            </ul>
          </article>
        </div>
      </section>

      {/* What partners do */}
      <section className="border-y border-border/60 bg-muted/30">
        <div className="container mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
          <div className="mb-12 max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
              Partner duties
            </p>
            <h2 className="mt-2 font-display text-3xl font-bold tracking-tight md:text-4xl">
              What our partners do for you
            </h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
            {partnerDuties.map((d) => (
              <article
                key={d.title}
                className="rounded-2xl border border-border/70 bg-card p-6 transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-[var(--shadow-brand)]"
              >
                <div className="mb-4 grid size-11 place-items-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/15">
                  <d.icon className="size-5" aria-hidden />
                </div>
                <h3 className="font-display text-lg font-semibold tracking-tight">{d.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{d.detail}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Incoterms primer */}
      <section className="container mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
        <div className="mb-12 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
            Incoterms in plain English
          </p>
          <h2 className="mt-2 font-display text-3xl font-bold tracking-tight md:text-4xl">
            Who pays for what, and when
          </h2>
          <p className="mt-4 text-muted-foreground">
            Most Jaratrade flows are DDP — UK buyers prefer a single price, and our partners are set up to deliver that.
          </p>
        </div>
        <ol className="space-y-3">
          {incoterms.map((t) => (
            <li
              key={t.code}
              className="grid grid-cols-[auto_1fr] gap-4 rounded-2xl border border-border/70 bg-card p-5 sm:gap-6"
            >
              <div className="grid size-14 place-items-center rounded-xl bg-primary/10 font-display text-base font-bold tracking-tight text-primary ring-1 ring-primary/15 sm:size-16">
                {t.code}
              </div>
              <div className="min-w-0">
                <h3 className="font-display text-lg font-semibold tracking-tight">{t.label}</h3>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{t.description}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      {/* FAQ */}
      <section className="border-t border-border/60 bg-muted/30">
        <div className="container mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
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
              <div key={f.q} className="rounded-2xl border border-border/70 bg-card p-6">
                <dt className="font-display text-base font-semibold tracking-tight">{f.q}</dt>
                <dd className="mt-2 text-sm leading-relaxed text-muted-foreground">{f.a}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* CTA */}
      <section className="container mx-auto max-w-3xl px-4 py-20 text-center sm:px-6 lg:px-8 lg:py-24">
        <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
          Get a shipping quote
        </h2>
        <p className="mt-4 text-muted-foreground">
          Start an order — partner quotes appear at checkout. No commitment until you tap pay.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button asChild size="lg" className="rounded-full px-6 shadow-[var(--shadow-brand)]">
            <Link href="/products">
              Browse the catalogue <ArrowRight className="size-4" />
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="rounded-full px-6">
            <Link href="/contact">Talk to logistics ops</Link>
          </Button>
        </div>
      </section>
    </>
  );
}

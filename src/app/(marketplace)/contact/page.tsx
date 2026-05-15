/**
 * /contact — Get in touch.
 *
 * Three clearly-named contact lanes with email + SLA, two office addresses,
 * a brief founder note. Designed for "trust signal first, form second" —
 * we surface direct emails before asking for any input.
 */
import type { Metadata } from "next";
import Link from "next/link";
import { Mail, Building, Clock, ArrowRight } from "lucide-react";
import { PageHero } from "@/components/marketing/page-hero";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Contact us",
  description:
    "Three ways to reach Jaratrade: general inquiries, exporter support, importer support. Offices in Lagos and London.",
};

const lanes = [
  {
    badge: "General",
    email: "hello@jaratrade.com",
    sla: "Typically same-day, weekdays",
    description:
      "Press, partnerships, anything that doesn't fit a support lane. Founders read this inbox.",
  },
  {
    badge: "For sellers",
    email: "sellers@jaratrade.com",
    sla: "4 business hours",
    description:
      "Verification questions, listing help, payouts, disputes from your end. Critical issues escalate immediately.",
  },
  {
    badge: "For buyers",
    email: "buyers@jaratrade.com",
    sla: "4 business hours",
    description:
      "Order issues, shipping questions, dispute filings, account access. Importer support reads this lane.",
  },
];

const offices = [
  {
    city: "Lagos",
    address: "7B Adeola Hopewell Street, Victoria Island",
    hours: "Mon–Fri · 8am–7pm WAT · Sat 10am–4pm",
  },
  {
    city: "London",
    address: "167–169 Great Portland Street, W1W 5PF",
    hours: "Mon–Fri · 9am–6pm GMT",
  },
];

export default function ContactPage() {
  return (
    <>
      <PageHero
        eyebrow="Contact us"
        title={
          <>
            Talk to us.{" "}
            <span className="text-gradient-brand">We&apos;re listening.</span>
          </>
        }
        description="Whether you're shipping containers from Onitsha or sourcing your first carton of garri, we want to hear from you."
      />

      {/* Lanes */}
      <section className="container mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
        <div className="grid gap-5 md:grid-cols-3 lg:gap-6">
          {lanes.map((lane) => (
            <article
              key={lane.badge}
              className="group flex flex-col rounded-2xl border border-border/70 bg-card p-7 transition-all hover:-translate-y-1 hover:border-primary/30 hover:shadow-[var(--shadow-brand)]"
            >
              <span className="self-start rounded-full bg-primary/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-primary">
                {lane.badge}
              </span>
              <div className="mt-5 flex items-start gap-3">
                <Mail className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden />
                <a
                  href={`mailto:${lane.email}`}
                  className="font-display text-lg font-bold tracking-tight text-foreground transition-colors hover:text-primary"
                >
                  {lane.email}
                </a>
              </div>
              <p className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
                <Clock className="size-3.5" aria-hidden /> {lane.sla}
              </p>
              <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                {lane.description}
              </p>
            </article>
          ))}
        </div>
      </section>

      {/* Offices */}
      <section className="border-y border-border/60 bg-muted/30">
        <div className="container mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
          <div className="mb-12 max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
              Where we are
            </p>
            <h2 className="mt-2 font-display text-3xl font-bold tracking-tight md:text-4xl">
              Lagos &amp; London
            </h2>
            <p className="mt-3 text-muted-foreground">
              Two offices, one team. Visits by appointment.
            </p>
          </div>
          <div className="grid gap-5 md:grid-cols-2 lg:gap-7">
            {offices.map((o) => (
              <article
                key={o.city}
                className="overflow-hidden rounded-2xl border border-border/70 bg-card"
              >
                {/* Decorative tinted "map" panel */}
                <div className="relative h-40 overflow-hidden bg-brand-gradient">
                  <div className="absolute inset-0 bg-grid-soft opacity-20" aria-hidden />
                  <div className="absolute bottom-3 left-3 inline-flex items-center gap-2 rounded-full bg-white/95 px-3 py-1.5 text-xs font-bold text-primary shadow-sm">
                    <Building className="size-3.5" aria-hidden />
                    {o.city}
                  </div>
                </div>
                <div className="p-6">
                  <p className="font-display text-lg font-semibold tracking-tight">
                    {o.address}
                  </p>
                  <p className="mt-2 flex items-center gap-1.5 text-sm text-muted-foreground">
                    <Clock className="size-3.5" aria-hidden /> {o.hours}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Founder note */}
      <section className="container mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
        <div className="overflow-hidden rounded-2xl border border-border/70 bg-card p-7 sm:p-10">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
            A note from the founder
          </p>
          <p className="mt-4 font-display text-xl font-medium leading-relaxed tracking-tight text-foreground/90 sm:text-2xl">
            &ldquo;Jaratrade is a small team building something that didn&apos;t exist
            when we needed it ourselves. If you&apos;ve got feedback, an idea, or
            a complaint — write to me directly. I read everything.&rdquo;
          </p>
          <p className="mt-6 text-sm">
            <a href="mailto:daniel@jaratrade.com" className="font-semibold text-primary underline-offset-4 hover:underline">
              daniel@jaratrade.com
            </a>{" "}
            <span className="text-muted-foreground">· Daniel, founder</span>
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="container mx-auto max-w-3xl px-4 pb-20 text-center sm:px-6 lg:px-8 lg:pb-24">
        <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
          Ready to start?
        </h2>
        <p className="mt-4 text-muted-foreground">
          Create an account in two minutes — or just browse the catalogue.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button asChild size="lg" className="rounded-full px-6 shadow-[var(--shadow-brand)]">
            <Link href="/auth/register/importer">
              I want to import <ArrowRight className="size-4" />
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="rounded-full px-6">
            <Link href="/auth/register/exporter">I want to export</Link>
          </Button>
        </div>
      </section>
    </>
  );
}

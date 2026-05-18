/**
 * /contact - Get in touch.
 *
 * Single-lane contact surface: one email (admin@), clear response
 * expectations, and a final CTA back to the marketplace. We deliberately
 * keep the surface narrow at launch and expand only when we have dedicated
 * inboxes + an ops team to answer them.
 */
import type { Metadata } from "next";
import Link from "next/link";
import { Mail, Clock, ArrowRight, ShieldCheck, MessageSquare, AlertTriangle } from "lucide-react";
import { PageHero } from "@/components/marketing/page-hero";
import { Button } from "@/components/ui/button";

const CONTACT_EMAIL = "admin@jaratrade.com";

export const metadata: Metadata = {
  title: "Contact us",
  description:
    "Get in touch with the Jaratrade team. One email, one promise: we read every message and respond within one business day.",
};

const topics = [
  {
    icon: MessageSquare,
    badge: "General",
    title: "Questions about Jaratrade",
    detail:
      "Press, partnerships, product questions, anything that doesn't fit a support lane. We read every message.",
  },
  {
    icon: ShieldCheck,
    badge: "Verification &amp; KYC",
    title: "Applying as an exporter or importer",
    detail:
      "Issues with your application, document uploads, or KYC review. Include your registered email so we can find your case quickly.",
  },
  {
    icon: AlertTriangle,
    badge: "Orders &amp; disputes",
    title: "Something went wrong with an order",
    detail:
      "Stuck payments, missing shipments, dispute escalations. Most order issues are handled inside the importer or exporter dashboard - email us if you're blocked.",
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

      {/* Primary contact card */}
      <section className="container mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <div className="relative overflow-hidden rounded-3xl border border-primary/20 bg-card p-8 shadow-[var(--shadow-brand)] sm:p-10">
          <div
            className="pointer-events-none absolute -right-16 -top-16 size-56 rounded-full blur-3xl opacity-50"
            style={{ background: "radial-gradient(circle, oklch(0.49 0.2186 264 / 0.45), transparent 70%)" }}
            aria-hidden
          />
          <div className="relative">
            <div className="mb-5 grid size-12 place-items-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/15">
              <Mail className="size-6" aria-hidden />
            </div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">
              The fastest way to reach us
            </p>
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="mt-3 inline-block font-display text-3xl font-bold tracking-tight text-foreground transition-colors hover:text-primary sm:text-4xl"
            >
              {CONTACT_EMAIL}
            </a>
            <p className="mt-4 inline-flex items-center gap-2 rounded-full bg-success/10 px-3 py-1.5 text-xs font-semibold text-success">
              <Clock className="size-3.5" aria-hidden />
              We respond within 1 business day
            </p>
            <p className="mt-5 text-sm leading-relaxed text-muted-foreground">
              Whatever brings you to this page - a question about your account,
              a stuck order, a partnership idea, or just feedback - this inbox
              is the right place. Include as much context as you can and a real
              human will reply.
            </p>
          </div>
        </div>
      </section>

      {/* Common topics */}
      <section className="border-y border-border/60 bg-muted/30">
        <div className="container mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
          <div className="mb-12 max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
              What we hear about
            </p>
            <h2 className="mt-2 font-display text-3xl font-bold tracking-tight md:text-4xl">
              Common reasons to write in
            </h2>
            <p className="mt-3 text-muted-foreground">
              We&apos;ve grouped the questions that come up most so you can frame yours
              the same way. It helps us route faster.
            </p>
          </div>
          <div className="grid gap-5 md:grid-cols-3 lg:gap-6">
            {topics.map((topic) => (
              <article
                key={topic.title}
                className="group flex flex-col rounded-2xl border border-border/70 bg-card p-7 transition-all hover:-translate-y-1 hover:border-primary/30 hover:shadow-[var(--shadow-brand)]"
              >
                <div className="mb-4 grid size-11 place-items-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/15">
                  <topic.icon className="size-5" aria-hidden />
                </div>
                <span
                  className="self-start rounded-full bg-primary/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-primary"
                  dangerouslySetInnerHTML={{ __html: topic.badge }}
                />
                <h3 className="mt-3 font-display text-lg font-semibold tracking-tight">
                  {topic.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {topic.detail}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="container mx-auto max-w-3xl px-4 py-20 text-center sm:px-6 lg:px-8 lg:py-24">
        <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
          Ready to start?
        </h2>
        <p className="mt-4 text-muted-foreground">
          Create an account in two minutes - or just browse the catalogue.
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

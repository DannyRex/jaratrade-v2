/**
 * Final CTA — large gradient banner with paired role-specific actions.
 *
 * Visual:
 *  - Full-bleed `bg-brand-gradient` panel with a radial overlay for depth.
 *  - Two primary actions (importer + exporter) on light buttons so they pop
 *    against the deep blue surface.
 *  - Faint logo glyph in the background for brand pattern.
 */
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function FinalCTA() {
  return (
    <section className="container mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-24">
      <div className="relative isolate overflow-hidden rounded-3xl bg-brand-gradient p-10 text-white shadow-[var(--shadow-pop)] sm:p-14 lg:p-16">
        {/* Decorative layers */}
        <div
          className="pointer-events-none absolute -right-24 -top-24 size-96 rounded-full blur-3xl opacity-50"
          style={{ background: "radial-gradient(circle, oklch(0.70 0.1593 245 / 0.55), transparent 70%)" }}
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -left-32 -bottom-32 size-[28rem] rounded-full blur-3xl opacity-40"
          style={{ background: "radial-gradient(circle, oklch(0.73 0.1730 55 / 0.45), transparent 70%)" }}
          aria-hidden
        />
        {/* Faint logo glyph */}
        <div className="pointer-events-none absolute -bottom-12 -right-12 opacity-[0.06]" aria-hidden>
          <Image src="/brand/logo.png" alt="" width={420} height={517} className="h-72 w-auto sm:h-96" />
        </div>

        <div className="relative grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
          <div className="max-w-2xl space-y-4">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-white/75">
              Ready to scale?
            </p>
            <h2 className="font-display text-3xl font-bold leading-tight tracking-tight sm:text-4xl lg:text-5xl">
              The marketplace built for cross-border trade
            </h2>
            <p className="max-w-xl text-base text-white/85 sm:text-lg">
              Whether you&apos;re sourcing Nigerian FMCGs for the UK market or
              looking for buyers abroad, Jaratrade gets you trading in days,
              not months.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
            <Button
              asChild
              size="lg"
              className="h-12 rounded-full bg-white px-6 text-base font-semibold text-primary shadow-lg hover:bg-white/95"
            >
              <Link href="/auth/register/importer">
                I want to import <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="h-12 rounded-full border-white/30 bg-white/10 px-6 text-base text-white backdrop-blur hover:bg-white/20"
            >
              <Link href="/auth/register/exporter">
                I want to export <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

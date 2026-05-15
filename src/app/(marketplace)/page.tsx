"use client";

/**
 * Marketing homepage - v3 craft pass.
 *
 * Section flow (top → bottom):
 *  1. Hero            (editorial split, gradient mesh, floating product chips, stats)
 *  2. TrustMarquee    (infinite-scroll trust signals)
 *  3. Categories      (premium pills, 4-col on lg)
 *  4. Top picks       (premium product grid)
 *  5. Verified sellers
 *  6. HowItWorks      (3-step narrative)
 *  7. FinalCTA        (gradient banner, paired role actions)
 *
 * Each section composes a SectionHeading where it makes sense - section
 * titles are mid-bold + grouped with their description and a "view all"
 * affordance.
 */
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ProductCard, ProductCardSkeleton } from "@/components/product-card";
import { ExporterCard } from "@/components/exporter-card";
import { CategoryPill } from "@/components/category-pill";
import { Hero } from "@/components/marketing/hero";
import { TrustMarquee } from "@/components/marketing/trust-marquee";
import { HowItWorks } from "@/components/marketing/how-it-works";
import { FinalCTA } from "@/components/marketing/final-cta";
import { useHome, useCategories } from "@/lib/queries";

export default function HomePage() {
  const home = useHome();
  const categories = useCategories();

  return (
    <>
      <Hero />
      <TrustMarquee />

      <section className="container mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-24">
        <SectionHeading
          eyebrow="Shop by category"
          title="Curated for cross-border trade"
          description="Hand-picked categories spanning food, personal care and more."
          href="/categories"
          ctaLabel="View all categories"
        />
        <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {categories.isLoading
            ? Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="h-[82px] animate-pulse rounded-2xl border border-border/60 bg-muted" />
              ))
            : (categories.data?.rows ?? []).slice(0, 8).map((c, i) => (
                <CategoryPill key={c.id} category={c} index={i} />
              ))}
        </div>
        {!categories.isLoading && (categories.data?.rows.length ?? 0) === 0 ? (
          <p className="mt-8 rounded-xl border border-dashed bg-muted/40 p-6 text-center text-sm text-muted-foreground">
            Categories will appear here once admin adds them.
          </p>
        ) : null}
      </section>

      <section className="container mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8 lg:pb-24">
        <SectionHeading
          eyebrow="Top picks this week"
          title="Most-loved products"
          description="The catalogue every UK buyer reaches for first."
          href="/products"
          ctaLabel="Browse the full catalogue"
        />
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {home.isLoading
            ? Array.from({ length: 8 }).map((_, i) => <ProductCardSkeleton key={i} />)
            : (home.data?.top_products ?? []).slice(0, 8).map((p, i) => (
                <ProductCard key={p.id} product={p} priority={i < 4} />
              ))}
        </div>
      </section>

      <section className="container mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8 lg:pb-24">
        <SectionHeading
          eyebrow="Verified exporters"
          title="Trusted Nigerian businesses"
          description="Every account is KYC-verified - IDs, business registration, and bank details are checked before activation."
          href="/sellers"
          ctaLabel="See all exporters"
        />
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {home.isLoading
            ? Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-[120px] animate-pulse rounded-2xl border border-border/60 bg-muted" />
              ))
            : (home.data?.top_exporter ?? []).slice(0, 6).map((e) => <ExporterCard key={e.id} exporter={e} />)}
        </div>
      </section>

      <HowItWorks />
      <FinalCTA />
    </>
  );
}

function SectionHeading({
  eyebrow,
  title,
  description,
  href,
  ctaLabel,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  href?: string;
  ctaLabel?: string;
}) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="max-w-2xl space-y-2">
        {eyebrow ? (
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
            {eyebrow}
          </p>
        ) : null}
        <h2 className="font-display text-3xl font-bold tracking-tight md:text-4xl">
          {title}
        </h2>
        {description ? (
          <p className="text-base text-muted-foreground">{description}</p>
        ) : null}
      </div>
      {href ? (
        <Link
          href={href}
          className="group inline-flex items-center gap-1.5 text-sm font-semibold text-primary transition-colors hover:text-primary/80"
        >
          {ctaLabel ?? "View all"}
          <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
        </Link>
      ) : null}
    </div>
  );
}

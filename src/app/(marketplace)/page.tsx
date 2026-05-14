"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Globe, ShieldCheck, Truck, Sparkles, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ProductCard, ProductCardSkeleton } from "@/components/product-card";
import { ExporterCard } from "@/components/exporter-card";
import { CategoryPill } from "@/components/category-pill";
import { useHome, useCategories } from "@/lib/queries";

export default function HomePage() {
  const home = useHome();
  const categories = useCategories();

  return (
    <>
      {/* ───────── Hero ───────── */}
      <section className="border-b bg-background">
        <div className="container mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
          <div className="grid items-center gap-10 lg:grid-cols-2">
            <div className="space-y-6">
              <Badge variant="accent" className="bg-accent/15 text-accent">
                <Sparkles className="mr-1 size-3" /> Nigeria 🇳🇬 ↔ United Kingdom 🇬🇧
              </Badge>
              <h1 className="text-4xl font-bold tracking-tight md:text-5xl lg:text-6xl">
                Source authentic Nigerian goods.{" "}
                <span className="text-primary">Ship them to the UK.</span>
              </h1>
              <p className="max-w-xl text-lg text-muted-foreground">
                Jaratrade connects verified Nigerian exporters with UK importers. Browse FMCGs from
                Alaba, Aba, Mushin, Dawanau and more - order, pay, and ship with confidence.
              </p>
              <div className="flex flex-wrap gap-3">
                <Button asChild size="lg">
                  <Link href="/products">
                    Start sourcing <ArrowRight className="size-4" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline">
                  <Link href="/auth/register/exporter">Sell on Jaratrade</Link>
                </Button>
              </div>
              <ul className="flex flex-wrap items-center gap-x-6 gap-y-2 pt-4 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <ShieldCheck className="size-4 text-success" /> Verified exporters
                </li>
                <li className="flex items-center gap-2">
                  <Truck className="size-4 text-success" /> Logistics included
                </li>
                <li className="flex items-center gap-2">
                  <Globe className="size-4 text-success" /> Global payments via Flutterwave
                </li>
              </ul>
            </div>

            {/* Hero image - visible on tablet+ for layout balance, hidden on mobile */}
            <div className="relative hidden aspect-[3/4] w-full max-w-md justify-self-end overflow-hidden rounded-2xl border bg-muted shadow-sm md:block">
              <Image
                src="/images/hero-image.jpg"
                alt="Jaratrade logistics partner delivering exported goods"
                fill
                priority
                sizes="(min-width: 1024px) 480px, (min-width: 768px) 50vw, 100vw"
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ───────── Categories ───────── */}
      <section className="container mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <SectionHeading
          title="Shop by category"
          description="Hand-picked categories spanning food, personal care and more."
          href="/categories"
          ctaLabel="View all"
        />
        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {categories.isLoading
            ? Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="h-[78px] animate-pulse rounded-xl border bg-muted" />
              ))
            : (categories.data?.rows ?? []).slice(0, 8).map((c, i) => (
                <CategoryPill key={c.id} category={c} index={i} />
              ))}
        </div>
        {!categories.isLoading && (categories.data?.rows.length ?? 0) === 0 ? (
          <p className="mt-6 rounded-md bg-muted p-4 text-sm text-muted-foreground">
            Categories will appear here once admin adds them.
          </p>
        ) : null}
      </section>

      {/* ───────── Top products ───────── */}
      <section className="container mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
        <SectionHeading
          title="Top picks this week"
          description="Most-viewed products from our top exporters."
          href="/products"
          ctaLabel="Browse all products"
        />
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {home.isLoading
            ? Array.from({ length: 8 }).map((_, i) => <ProductCardSkeleton key={i} />)
            : (home.data?.top_products ?? []).slice(0, 8).map((p, i) => (
                <ProductCard key={p.id} product={p} priority={i < 4} />
              ))}
        </div>
      </section>

      {/* ───────── Top exporters ───────── */}
      <section className="container mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
        <SectionHeading
          title="Verified exporters"
          description="Established Nigerian businesses ready to fulfil your orders."
          href="/sellers"
          ctaLabel="See more"
        />
        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {home.isLoading
            ? Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-[110px] animate-pulse rounded-lg border bg-muted" />
              ))
            : (home.data?.top_exporter ?? []).slice(0, 6).map((e) => <ExporterCard key={e.id} exporter={e} />)}
        </div>
      </section>

      {/* ───────── Value props ───────── */}
      <section className="border-t bg-muted/30">
        <div className="container mx-auto grid max-w-7xl gap-8 px-4 py-16 sm:grid-cols-2 sm:px-6 lg:grid-cols-3 lg:px-8">
          {[
            {
              icon: ShieldCheck,
              title: "Verified businesses",
              description:
                "Every exporter is KYC-verified. Means of ID, business registration and bank details are checked before activation.",
            },
            {
              icon: Truck,
              title: "Logistics, sorted",
              description:
                "Choose your own shipper or pick a vetted Jaratrade logistics partner with a single quote at checkout.",
            },
            {
              icon: Globe,
              title: "Secure payments",
              description:
                "Pay via card, bank transfer or USSD. Flutterwave splits the funds - your money is held safely until shipment.",
            },
          ].map((feat) => (
            <div key={feat.title} className="space-y-3">
              <div className="grid size-10 place-items-center rounded-lg bg-primary/10 text-primary">
                <feat.icon className="size-5" />
              </div>
              <h3 className="text-lg font-semibold">{feat.title}</h3>
              <p className="text-sm text-muted-foreground">{feat.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ───────── Final CTA ───────── */}
      <section className="container mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="overflow-hidden rounded-2xl bg-primary p-8 text-primary-foreground shadow-sm sm:p-12">
          <div className="flex flex-col items-start gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-xl space-y-2">
              <h2 className="text-3xl font-bold tracking-tight">Ready to scale your trade?</h2>
              <p className="text-sm text-primary-foreground/85">
                Whether you&apos;re sourcing Nigerian FMCGs for the UK market or looking for buyers
                abroad, Jaratrade gets you trading in days.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button asChild size="lg" variant="secondary" className="bg-white text-primary hover:bg-white/90">
                <Link href="/auth/register/importer">
                  I want to import <ChevronRight className="size-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-white/40 text-white hover:bg-white/10">
                <Link href="/auth/register/exporter">I want to export</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

function SectionHeading({
  title,
  description,
  href,
  ctaLabel,
}: {
  title: string;
  description?: string;
  href?: string;
  ctaLabel?: string;
}) {
  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
      <div className="space-y-1">
        <h2 className="text-2xl font-bold tracking-tight md:text-3xl">{title}</h2>
        {description ? <p className="max-w-2xl text-sm text-muted-foreground">{description}</p> : null}
      </div>
      {href ? (
        <Link
          href={href}
          className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
        >
          {ctaLabel ?? "View all"} <ArrowRight className="size-3.5" />
        </Link>
      ) : null}
    </div>
  );
}

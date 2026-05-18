"use client";

/**
 * Marketing hero - the front door.
 *
 * Layout: editorial 6/6 split on lg+, single column on mobile.
 *   Left (lg:col-span-7)  : eyebrow chip, headline, subhead, two CTAs,
 *                            three trust pills, four live stat counters.
 *   Right (lg:col-span-5) : visual stack - floating product chip cards
 *                            arranged over a brand gradient panel with a
 *                            radial glow. Hidden on mobile to keep the
 *                            primary message above the fold.
 *
 * Stats: pulled live from /public/metrics. Skeleton renders until the
 * count arrives so we never display invented figures.
 */
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ShieldCheck, Truck, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useMetrics } from "@/lib/queries";

const STAT_LABELS = [
  { key: "verified_exporters" as const, label: "Verified exporters" },
  { key: "active_skus" as const, label: "Active SKUs" },
  { key: "markets" as const, label: "Markets" },
  { key: "categories" as const, label: "Categories" },
];

function formatStat(n: number | undefined): string {
  if (n === undefined) return "--";
  if (n >= 1000) return new Intl.NumberFormat("en-GB").format(n);
  return String(n);
}

// Sample products mirroring the seeded catalogue - photos sourced from
// Unsplash (royalty-free, commercial use). Replace with photographer-shot
// product imagery once we have it.
const heroProducts = [
  {
    name: "Plantain Chips",
    market: "Alaba Intl. Market",
    price: "₦18,000",
    img: "/brand/products/plantain-chips.jpg",
    rotate: "-rotate-3",
    delay: "0s",
  },
  {
    name: "Premium Garri (50kg)",
    market: "Mushin Market",
    price: "₦35,000",
    img: "/brand/products/premium-garri.jpg",
    rotate: "rotate-2",
    delay: "0.4s",
  },
  {
    name: "Suya Spice Mix",
    market: "Onitsha Main",
    price: "₦8,500",
    img: "/brand/products/suya-spice.jpg",
    rotate: "-rotate-2",
    delay: "0.8s",
  },
];

export function Hero() {
  return (
    <section
      className="relative isolate overflow-hidden bg-aurora"
      aria-labelledby="hero-headline"
    >
      {/* Decorative grid - sits behind content */}
      <div className="bg-grid-soft absolute inset-0 opacity-50 [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_75%)]" aria-hidden />

      <div className="container relative mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8 lg:py-28">
        <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-16">
          {/* Left - message */}
          <div className="lg:col-span-7">
            <div className="animate-rise [animation-delay:0ms]">
              <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-medium text-primary backdrop-blur-sm">
                <span className="relative flex size-1.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
                  <span className="relative inline-flex size-1.5 rounded-full bg-primary" />
                </span>
                B2B marketplace · Nigeria 🇳🇬 ↔ United Kingdom 🇬🇧
              </span>
            </div>

            <h1
              id="hero-headline"
              className="mt-6 max-w-3xl font-display text-[clamp(2.25rem,5.4vw,4.5rem)] font-bold leading-[1.02] tracking-tight animate-rise [animation-delay:80ms]"
            >
              Source Nigeria.{" "}
              <span className="text-gradient-brand sm:whitespace-nowrap">Sell to the world.</span>
            </h1>

            <p className="mt-5 max-w-xl text-lg leading-relaxed text-muted-foreground animate-rise [animation-delay:160ms]">
              Jaratrade connects verified Nigerian exporters with UK importers.
              Browse FMCGs from Alaba, Aba, Mushin, Dawanau and more - order,
              pay and ship with confidence.
            </p>

            <div className="mt-8 flex flex-wrap gap-3 animate-rise [animation-delay:240ms]">
              <Button asChild size="lg" className="h-12 rounded-full px-6 text-base shadow-[var(--shadow-brand)] hover:shadow-[0_12px_36px_-8px_oklch(0.49_0.2186_264_/_0.50)]">
                <Link href="/products">
                  Start sourcing <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="h-12 rounded-full border-border/70 bg-background/60 px-6 text-base backdrop-blur-sm hover:bg-background"
              >
                <Link href="/auth/register/exporter">Sell on Jaratrade</Link>
              </Button>
            </div>

            <ul className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-muted-foreground animate-rise [animation-delay:320ms]">
              <li className="flex items-center gap-2">
                <ShieldCheck className="size-4 text-success" aria-hidden /> Verified exporters
              </li>
              <li className="flex items-center gap-2">
                <Truck className="size-4 text-success" aria-hidden /> Logistics included
              </li>
              <li className="flex items-center gap-2">
                <Globe className="size-4 text-success" aria-hidden /> Flutterwave-secured
              </li>
            </ul>

            <LiveStats />
          </div>

          {/* Right - visual stack (hidden on mobile to keep CTA above fold) */}
          <div className="relative hidden lg:col-span-5 lg:block">
            <HeroVisual />
          </div>
        </div>
      </div>
    </section>
  );
}

function LiveStats() {
  const { data, isLoading } = useMetrics();
  return (
    <dl className="mt-12 grid grid-cols-2 gap-x-8 gap-y-6 sm:grid-cols-4 animate-rise [animation-delay:400ms]">
      {STAT_LABELS.map((s) => {
        const value = data?.[s.key];
        return (
          <div key={s.key}>
            <dt className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              {s.label}
            </dt>
            <dd className="mt-1 font-display text-2xl font-bold tracking-tight tabular-nums sm:text-3xl">
              {isLoading ? (
                <span className="inline-block h-7 w-12 animate-pulse rounded bg-muted align-middle" aria-hidden />
              ) : (
                formatStat(value)
              )}
            </dd>
          </div>
        );
      })}
    </dl>
  );
}

function HeroVisual() {
  return (
    <div className="relative aspect-square w-full max-w-md animate-rise [animation-delay:200ms]">
      {/* Brand gradient panel - the canvas that floats the chips */}
      <div className="absolute inset-0 rounded-[2rem] bg-brand-gradient shadow-[var(--shadow-pop)]" aria-hidden />
      {/* Top-right radial highlight */}
      <div
        className="absolute -right-4 -top-4 size-48 rounded-full blur-3xl opacity-60"
        style={{ background: "radial-gradient(circle, oklch(0.70 0.1593 245 / 0.55), transparent 70%)" }}
        aria-hidden
      />
      {/* Bottom-left warm accent */}
      <div
        className="absolute -bottom-6 -left-6 size-40 rounded-full blur-3xl opacity-50"
        style={{ background: "radial-gradient(circle, oklch(0.73 0.1730 55 / 0.45), transparent 70%)" }}
        aria-hidden
      />

      {/* Floating product chips */}
      {heroProducts.map((p, i) => (
        <ProductChip key={p.name} {...p} index={i} />
      ))}

      {/* Logo glyph faintly in the back */}
      <div
        className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-15"
        aria-hidden
      >
        <Image
          src="/brand/logo.png"
          alt=""
          width={250}
          height={308}
          className="h-2/3 w-auto"
        />
      </div>

      {/* Trust ribbon at bottom - real signal, not fake "live" counter */}
      <LiveTrustRibbon />
    </div>
  );
}

function LiveTrustRibbon() {
  const { data } = useMetrics();
  const exporters = data?.verified_exporters;
  return (
    <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 rounded-2xl border border-border/70 bg-card px-5 py-4 shadow-[var(--shadow-pop)] backdrop-blur">
      <div className="flex items-center gap-3">
        <ShieldCheck className="size-6 text-success" aria-hidden />
        <div>
          <p className="text-xs font-medium text-muted-foreground">KYC-verified sellers</p>
          <p className="text-sm font-bold tabular-nums">
            {exporters === undefined ? (
              <span className="inline-block h-4 w-8 animate-pulse rounded bg-muted align-middle" aria-hidden />
            ) : (
              `${formatStat(exporters)} active`
            )}
          </p>
        </div>
      </div>
    </div>
  );
}

function ProductChip({
  name,
  market,
  price,
  img,
  rotate,
  delay,
  index,
}: {
  name: string;
  market: string;
  price: string;
  img: string;
  rotate: string;
  delay: string;
  index: number;
}) {
  // Each chip is positioned absolutely so the visual stack reads as casual
  // overlapping cards rather than a neat row.
  const positions = [
    "left-2 top-8 sm:left-4 sm:top-10",
    "right-2 top-1/3 sm:-right-2",
    "left-12 bottom-14 sm:left-16",
  ];
  return (
    <figure
      className={`absolute ${positions[index]} ${rotate} flex w-48 animate-float items-center gap-3 rounded-2xl border border-white/30 bg-white/95 p-2.5 shadow-[var(--shadow-pop)] backdrop-blur dark:bg-card/95`}
      style={{ animationDelay: delay }}
    >
      <Image
        src={img}
        alt=""
        width={56}
        height={56}
        sizes="56px"
        className="size-12 shrink-0 rounded-lg object-cover"
      />
      <figcaption className="min-w-0 flex-1">
        <p className="truncate text-xs font-semibold leading-tight text-foreground">{name}</p>
        <p className="truncate text-[10px] text-muted-foreground">{market}</p>
        <p className="mt-0.5 text-xs font-bold tabular-nums text-primary">{price}</p>
      </figcaption>
    </figure>
  );
}

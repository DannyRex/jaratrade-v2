"use client";

/**
 * /sellers - Exporter discovery page.
 *
 * Live data feed of verified exporters (via the homeData API). Three sections
 * after the hero: what verification means, how curation works, and types of
 * sellers - each a short, sensory block. Closes with paired CTAs.
 */
import Link from "next/link";
import { ShieldCheck, Award, Factory, ShoppingBasket, Leaf, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHero } from "@/components/marketing/page-hero";
import { ExporterCard } from "@/components/exporter-card";
import { useHome } from "@/lib/queries";

const sellerTypes = [
  {
    icon: Factory,
    title: "FMCG manufacturers",
    description:
      "Packaged-goods producers - plantain chips, garri, palm oil, suya spice, snacks - with consistent supply and export-grade packaging.",
  },
  {
    icon: ShoppingBasket,
    title: "Market wholesalers",
    description:
      "Established traders in Alaba, Aba, Onitsha, Mushin and Balogun moving truckload volumes weekly.",
  },
  {
    icon: Leaf,
    title: "Food producers",
    description:
      "Yam farmers in Benue, grain mills in Kano, spice processors in Dawanau - supply chain straight from the source.",
  },
  {
    icon: Sparkles,
    title: "Cosmetics & personal care",
    description:
      "Natural shea, black soap, hair products, and beauty brands designed for export. Compliance-ready packaging and labelling.",
  },
];

export default function SellersPage() {
  const home = useHome();
  const exporters = home.data?.top_exporter ?? [];

  return (
    <>
      <PageHero
        eyebrow="Verified exporters"
        title={
          <>
            Verified Nigerian businesses,{" "}
            <span className="text-primary">ready to ship.</span>
          </>
        }
        description="Every exporter on Jaratrade has been through our KYC checks - business registration, IDs, bank details, and inventory practices verified before they list a single SKU."
        ctaPrimary={{ label: "Browse the catalogue", href: "/products" }}
        ctaSecondary={{ label: "Become an exporter", href: "/auth/register/exporter" }}
      />

      {/* Featured exporters grid */}
      <section className="container mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
        <div className="mb-10 flex items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
              Featured sellers
            </p>
            <h2 className="mt-2 font-display text-3xl font-bold tracking-tight md:text-4xl">
              Trusted by UK buyers
            </h2>
          </div>
          <Button asChild variant="outline" className="hidden rounded-full sm:inline-flex">
            <Link href="/products">View all products</Link>
          </Button>
        </div>
        {home.isLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-[120px] animate-pulse rounded-2xl border border-border/60 bg-muted" />
            ))}
          </div>
        ) : exporters.length === 0 ? (
          <p className="rounded-xl border border-dashed bg-muted/40 p-6 text-center text-sm text-muted-foreground">
            Featured exporters appear here once we&apos;ve verified your first batch.
          </p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {exporters.map((e) => (
              <ExporterCard key={e.id} exporter={e} />
            ))}
          </div>
        )}
      </section>

      {/* What verification means */}
      <section className="border-y border-border/60 bg-muted/30">
        <div className="container mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
          <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
                What we check
              </p>
              <h2 className="mt-2 font-display text-3xl font-bold tracking-tight md:text-4xl">
                Verification isn&apos;t a checkbox.
              </h2>
              <p className="mt-4 max-w-xl text-muted-foreground">
                Before any exporter goes live on Jaratrade, we check the
                fundamentals. About 1 in 4 applications doesn&apos;t make it
                through - which is exactly the point.
              </p>
            </div>
            <ul className="grid gap-4 sm:grid-cols-2 lg:gap-5">
              {[
                { label: "Corporate Affairs Commission (CAC)", note: "Business registration verified directly" },
                { label: "Director-level ID", note: "NIN, passport, or driver's licence" },
                { label: "Operational bank account", note: "Confirmed in the business name" },
                { label: "Physical address", note: "Cross-referenced + spot-checked" },
                { label: "Trade body reference", note: "Market association or guild" },
                { label: "Inventory practice", note: "Stock confirmed weekly to stay listed" },
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
        </div>
      </section>

      {/* How we curate */}
      <section className="container mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
            How we curate
          </p>
          <h2 className="mt-2 font-display text-3xl font-bold tracking-tight md:text-4xl">
            Every seller is checked. The best ones rise to the top.
          </h2>
          <p className="mt-4 text-muted-foreground">
            The exporters you see at the top of the marketplace have done the work to get there.
          </p>
        </div>
        <div className="mx-auto mt-12 grid max-w-4xl gap-4 sm:grid-cols-3">
          {[
            { metric: "25+", label: "Orders shipped without a dispute" },
            { metric: "95%+", label: "On-time fulfilment rate" },
            { metric: "Weekly", label: "Inventory confirmation cadence" },
          ].map((c) => (
            <div
              key={c.label}
              className="rounded-2xl border border-border/70 bg-card p-6 text-center"
            >
              <Award className="mx-auto mb-3 size-6 text-accent" aria-hidden />
              <p className="font-display text-3xl font-bold tracking-tight tabular-nums">
                {c.metric}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">{c.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Types of sellers */}
      <section className="bg-muted/30 border-y border-border/60">
        <div className="container mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
          <div className="mb-12 max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
              Who you&apos;ll find
            </p>
            <h2 className="mt-2 font-display text-3xl font-bold tracking-tight md:text-4xl">
              Four kinds of sellers
            </h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:gap-6">
            {sellerTypes.map((t) => (
              <article
                key={t.title}
                className="group rounded-2xl border border-border/70 bg-card p-6 transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-[var(--shadow-brand)]"
              >
                <div className="mb-4 grid size-11 place-items-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/15">
                  <t.icon className="size-5" aria-hidden />
                </div>
                <h3 className="font-display text-xl font-semibold tracking-tight">
                  {t.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {t.description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="container mx-auto max-w-3xl px-4 py-20 text-center sm:px-6 lg:px-8 lg:py-24">
        <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
          Ready to source - or ready to sell?
        </h2>
        <p className="mt-4 text-muted-foreground">
          Browse catalogued products from verified Nigerian exporters, or apply to list your own.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button asChild size="lg" className="rounded-full px-6 shadow-[var(--shadow-brand)]">
            <Link href="/products">Browse the catalogue</Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="rounded-full px-6">
            <Link href="/auth/register/exporter">Become an exporter</Link>
          </Button>
        </div>
      </section>
    </>
  );
}

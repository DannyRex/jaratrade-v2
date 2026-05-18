/**
 * /markets - Nigerian wholesale markets directory.
 *
 * Static content page. Each market is presented as a card with a colored
 * marker, location, specialties, and a "browse products from this market"
 * affordance once we wire market-scoped filtering.
 */
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, MapPin } from "lucide-react";
import { PageHero } from "@/components/marketing/page-hero";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Nigerian wholesale markets",
  description:
    "Every major Nigerian wholesale market - Alaba, Aba, Onitsha, Mushin, Balogun, Dawanau, Kano Kurmi, Zaki Biam - onboarded into one catalogue.",
};

interface Market {
  name: string;
  location: string;
  state: string;
  specialty: string;
  description: string;
  tags: string[];
  /** Tailwind class fragment for the marker colour. Hue picked per market to keep cards visually distinct. */
  hue: string;
}

const markets: Market[] = [
  {
    name: "Alaba International Market",
    location: "Ojo",
    state: "Lagos",
    specialty: "Electronics & FMCG",
    description:
      "West Africa's largest electronics market - and increasingly the FMCG distribution hub for Lagos. Strong export-grade packaging on snacks, packaged drinks, and household goods.",
    tags: ["Snacks", "Beverages", "Household goods"],
    hue: "from-blue-500/20 to-cyan-500/10",
  },
  {
    name: "Aba Main Market",
    location: "Aba",
    state: "Abia",
    specialty: "Textiles & leather",
    description:
      "The textile and leather capital of Nigeria. Garments, shoes, school uniforms - manufactured locally and priced for export. Several Jaratrade exporters operate from here.",
    tags: ["Garments", "Leather", "Shoes"],
    hue: "from-amber-500/20 to-orange-500/10",
  },
  {
    name: "Onitsha Main Market",
    location: "Onitsha",
    state: "Anambra",
    specialty: "Food & FMCG",
    description:
      "The most concentrated food and FMCG market in the East. Anything that moves by truck across Nigeria passes through Onitsha. Strong on dried foods, palm oil, and packaged staples.",
    tags: ["Dried foods", "Palm oil", "Staples"],
    hue: "from-emerald-500/20 to-green-500/10",
  },
  {
    name: "Mushin Market",
    location: "Mushin",
    state: "Lagos",
    specialty: "Grain & food",
    description:
      "The grain and food market for Lagos. Yam flour, garri, beans, rice, dried fish, dried meats. UK importers source restocks here when their Onitsha supplier is short.",
    tags: ["Grains", "Garri", "Dried fish"],
    hue: "from-violet-500/20 to-purple-500/10",
  },
  {
    name: "Balogun Market",
    location: "Lagos Island",
    state: "Lagos",
    specialty: "Textiles & fabrics",
    description:
      "Textiles, fabrics, ankara, lace. The go-to for UK-based African fashion brands and tailors. Bulk fabric sold in 5-yard, 10-yard and 50-yard rolls.",
    tags: ["Ankara", "Lace", "Bulk fabric"],
    hue: "from-pink-500/20 to-fuchsia-500/10",
  },
  {
    name: "Dawanau International Market",
    location: "Kano",
    state: "Kano",
    specialty: "Grains & spices",
    description:
      "The largest grain and spice market in West Africa. Sesame, sorghum, hibiscus (zobo), groundnuts, dried chillies, ginger, fonio. Most exports to North America come through here.",
    tags: ["Sesame", "Hibiscus", "Ginger"],
    hue: "from-rose-500/20 to-red-500/10",
  },
  {
    name: "Kano Kurmi Market",
    location: "Kano",
    state: "Kano",
    specialty: "Leather & crafts",
    description:
      "One of Africa's oldest markets - 500+ years old. Leather goods, traditional crafts, dyed fabrics. Best for hand-finished leather and artisanal craft.",
    tags: ["Leather", "Crafts", "Dyed fabrics"],
    hue: "from-yellow-500/20 to-amber-500/10",
  },
  {
    name: "Zaki Biam Yam Market",
    location: "Ukum",
    state: "Benue",
    specialty: "Yams & tubers",
    description:
      "The yam capital of Nigeria. Tubers in sizes from \"tray\" to \"container\". Best shipping window is October to February when fresh harvest is in.",
    tags: ["Yams", "Tubers", "Seasonal"],
    hue: "from-teal-500/20 to-cyan-500/10",
  },
];

export default function MarketsPage() {
  return (
    <>
      <PageHero
        eyebrow="Markets directory"
        title={
          <>
            Every major Nigerian market,{" "}
            <span className="text-gradient-brand">in one catalogue.</span>
          </>
        }
        description="The wholesale markets that move Nigeria. Jaratrade brings them online so UK buyers can source from each one without ever needing a buying trip."
      />

      {/* Intro paragraph */}
      <section className="container mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
        <p className="text-base leading-relaxed text-muted-foreground sm:text-lg">
          Nigerian wholesale markets are some of the largest in West Africa -
          but most of them have lived offline. We onboard verified sellers from
          each one so you can browse listings the same way you&apos;d
          browse a supermarket aisle. Each market specialises in different goods.
          Here&apos;s where to look for what.
        </p>
      </section>

      {/* Market grid */}
      <section className="container mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8 lg:pb-20">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-7">
          {markets.map((m) => (
            <article
              key={m.name}
              className="group relative flex flex-col overflow-hidden rounded-2xl border border-border/70 bg-card transition-all hover:-translate-y-1 hover:border-primary/30 hover:shadow-[var(--shadow-brand)]"
            >
              {/* Tinted "map" area at top */}
              <div className={`relative h-32 overflow-hidden bg-gradient-to-br ${m.hue}`}>
                <div className="absolute inset-0 bg-grid-soft opacity-50" aria-hidden />
                <div className="absolute bottom-3 right-3 grid size-10 place-items-center rounded-full bg-background/90 text-primary shadow-sm">
                  <MapPin className="size-5" aria-hidden />
                </div>
                <div className="absolute left-4 top-4">
                  <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-foreground/60">
                    {m.specialty}
                  </p>
                </div>
              </div>

              <div className="flex flex-1 flex-col gap-3 p-6">
                <div>
                  <h2 className="font-display text-xl font-bold tracking-tight">
                    {m.name}
                  </h2>
                  <p className="mt-0.5 text-sm text-muted-foreground">
                    {m.location}, {m.state}
                  </p>
                </div>
                <p className="text-sm leading-relaxed text-foreground/80">
                  {m.description}
                </p>
                <div className="mt-auto flex flex-wrap gap-1.5 pt-2">
                  {m.tags.map((t) => (
                    <span
                      key={t}
                      className="inline-flex items-center rounded-full bg-muted px-2.5 py-0.5 text-[11px] font-medium text-foreground/80"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="container mx-auto max-w-3xl px-4 py-16 text-center sm:px-6 lg:px-8 lg:py-20">
        <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
          Source from any market. Or all of them.
        </h2>
        <p className="mt-4 text-muted-foreground">
          Browse catalogued products from across Nigeria - or apply to
          add your market stall.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button asChild size="lg" className="rounded-full px-6 shadow-[var(--shadow-brand)]">
            <Link href="/products">
              Browse all products <ArrowRight className="size-4" />
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="rounded-full px-6">
            <Link href="/auth/register/exporter">Sell from your market</Link>
          </Button>
        </div>
      </section>
    </>
  );
}

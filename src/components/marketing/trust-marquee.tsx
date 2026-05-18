"use client";

/**
 * Trust marquee - infinite scroll of trust signals.
 *
 * Static labels (markets, partners, payment networks) cycle horizontally so
 * the eye keeps moving and the band reads as "many things going on" without
 * dominating the layout. Paused on hover for accessibility; respects
 * prefers-reduced-motion via the global utility.
 */
import { Building2, ShieldCheck, Truck, Globe2, CreditCard, Sparkles } from "lucide-react";

const items = [
  { icon: ShieldCheck, label: "KYC-verified exporters" },
  { icon: Truck, label: "Integrated logistics partners" },
  { icon: CreditCard, label: "Flutterwave-secured payments" },
  { icon: Building2, label: "Alaba · Aba · Onitsha · Mushin" },
  { icon: Globe2, label: "Trade between Nigeria & the UK" },
  { icon: Sparkles, label: "Premium curated catalog" },
];

export function TrustMarquee() {
  // Duplicate so the marquee loop is seamless.
  const loop = [...items, ...items];
  return (
    <section
      aria-label="Trust signals"
      className="relative overflow-hidden border-y border-border/60 bg-muted/30 py-4"
    >
      {/* Fade edges so the marquee feels infinite, not cut off */}
      <div className="flex w-max animate-marquee gap-12 pl-12 [&:hover]:[animation-play-state:paused]">
        {loop.map(({ icon: Icon, label }, i) => (
          <div
            key={`${label}-${i}`}
            className="flex shrink-0 items-center gap-2.5 text-sm font-medium text-muted-foreground"
          >
            <Icon className="size-4 text-primary/80" aria-hidden />
            <span className="whitespace-nowrap">{label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

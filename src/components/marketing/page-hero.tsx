/**
 * PageHero — reusable top-of-page hero for marketing & content pages.
 *
 * Establishes a consistent rhythm across /sellers, /markets, /help/*,
 * /contact, /trust and the legal pages: aurora backdrop + dot grid,
 * eyebrow chip, display headline (with optional gradient sweep),
 * sub-paragraph, optional inline CTAs.
 */
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface PageHeroProps {
  eyebrow?: string;
  title: React.ReactNode;
  description?: React.ReactNode;
  ctaPrimary?: { label: string; href: string };
  ctaSecondary?: { label: string; href: string };
  align?: "center" | "left";
  className?: string;
}

export function PageHero({
  eyebrow,
  title,
  description,
  ctaPrimary,
  ctaSecondary,
  align = "center",
  className,
}: PageHeroProps) {
  return (
    <section
      className={cn(
        "relative isolate overflow-hidden bg-aurora",
        className,
      )}
    >
      <div
        className="bg-grid-soft absolute inset-0 opacity-40 [mask-image:radial-gradient(ellipse_at_center,black_35%,transparent_75%)]"
        aria-hidden
      />
      <div
        className={cn(
          "container relative mx-auto max-w-4xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24",
          align === "center" ? "text-center" : "text-left",
        )}
      >
        {eyebrow ? (
          <p
            className={cn(
              "text-sm font-semibold uppercase tracking-[0.18em] text-primary animate-rise",
              align === "center" && "mx-auto",
            )}
          >
            {eyebrow}
          </p>
        ) : null}
        <h1
          className={cn(
            "mt-4 font-display text-4xl font-bold leading-[1.05] tracking-tight sm:text-5xl lg:text-[3.75rem] animate-rise [animation-delay:80ms]",
            align === "center" && "mx-auto max-w-3xl",
          )}
        >
          {title}
        </h1>
        {description ? (
          <p
            className={cn(
              "mt-5 text-base leading-relaxed text-muted-foreground sm:text-lg animate-rise [animation-delay:160ms]",
              align === "center" && "mx-auto max-w-2xl",
            )}
          >
            {description}
          </p>
        ) : null}
        {(ctaPrimary || ctaSecondary) ? (
          <div
            className={cn(
              "mt-8 flex flex-wrap gap-3 animate-rise [animation-delay:240ms]",
              align === "center" && "justify-center",
            )}
          >
            {ctaPrimary ? (
              <Button asChild size="lg" className="h-11 rounded-full px-6 shadow-[var(--shadow-brand)]">
                <Link href={ctaPrimary.href}>
                  {ctaPrimary.label} <ArrowRight className="size-4" />
                </Link>
              </Button>
            ) : null}
            {ctaSecondary ? (
              <Button asChild size="lg" variant="outline" className="h-11 rounded-full border-border/70 bg-background/60 px-6 backdrop-blur-sm">
                <Link href={ctaSecondary.href}>{ctaSecondary.label}</Link>
              </Button>
            ) : null}
          </div>
        ) : null}
      </div>
    </section>
  );
}

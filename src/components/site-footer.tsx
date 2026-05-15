import Link from "next/link";
import { Globe2, MapPin } from "lucide-react";
import { Logo } from "./logo";

const sections = [
  {
    title: "Marketplace",
    links: [
      { label: "Browse all products", href: "/products" },
      { label: "Categories", href: "/categories" },
      { label: "Top exporters", href: "/sellers" },
      { label: "Markets", href: "/markets" },
    ],
  },
  {
    title: "Sell on Jaratrade",
    links: [
      { label: "Become an exporter", href: "/auth/register/exporter" },
      { label: "Subscription plans", href: "/services" },
      { label: "Exporter resources", href: "/help/exporter" },
    ],
  },
  {
    title: "Buy on Jaratrade",
    links: [
      { label: "How importing works", href: "/services" },
      { label: "Logistics partners", href: "/help/logistics" },
      { label: "Sign up as importer", href: "/auth/register/importer" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "/about" },
      { label: "FAQ", href: "/faq" },
      { label: "Contact us", href: "/contact" },
      { label: "Trust & safety", href: "/trust" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="relative mt-24 overflow-hidden border-t border-border/60 bg-muted/30">
      {/* Soft brand-tinted backdrop */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px"
        style={{
          background:
            "linear-gradient(90deg, transparent, oklch(0.49 0.2186 264 / 0.40), transparent)",
        }}
        aria-hidden
      />

      <div className="container mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-12 md:grid-cols-12">
          <div className="space-y-4 md:col-span-4">
            <Logo size="lg" />
            <p className="max-w-xs text-sm leading-relaxed text-muted-foreground">
              The trusted B2B marketplace connecting verified Nigerian exporters
              with UK importers. Source, ship and scale — all in one place.
            </p>
            <div className="flex flex-wrap gap-3 pt-2 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-border/70 bg-background/60 px-3 py-1.5">
                <Globe2 className="size-3.5" aria-hidden /> en-GB
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-border/70 bg-background/60 px-3 py-1.5">
                <MapPin className="size-3.5" aria-hidden /> Lagos &amp; London
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 md:col-span-8 md:grid-cols-4">
            {sections.map((section) => (
              <nav key={section.title} aria-label={section.title}>
                <h3 className="text-xs font-bold uppercase tracking-[0.16em] text-foreground/85">
                  {section.title}
                </h3>
                <ul className="mt-4 space-y-2.5">
                  {section.links.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            ))}
          </div>
        </div>

        <div className="mt-14 flex flex-col items-start justify-between gap-4 border-t border-border/70 pt-8 text-sm text-muted-foreground md:flex-row md:items-center">
          <p>© {new Date().getFullYear()} Jaratrade Ltd. All rights reserved.</p>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
            <Link href="/legal/terms" className="transition-colors hover:text-foreground">
              Terms
            </Link>
            <Link href="/legal/privacy" className="transition-colors hover:text-foreground">
              Privacy
            </Link>
            <Link href="/legal/cookies" className="transition-colors hover:text-foreground">
              Cookies
            </Link>
            <span aria-hidden className="text-muted-foreground/40">·</span>
            <span>Made in Lagos &amp; London</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

import Link from "next/link";
import { Logo } from "./logo";
import { Separator } from "./ui/separator";

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
    <footer className="mt-24 border-t bg-muted/20">
      <div className="container mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-5">
          <div className="space-y-3 md:col-span-1">
            <Logo />
            <p className="max-w-xs text-sm text-muted-foreground">
              The trusted marketplace connecting Nigerian exporters with UK importers.
            </p>
          </div>
          {sections.map((section) => (
            <nav key={section.title} aria-label={section.title}>
              <h3 className="text-sm font-semibold">{section.title}</h3>
              <ul className="mt-3 space-y-2">
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
        <Separator className="my-8" />
        <div className="flex flex-col items-start justify-between gap-4 text-sm text-muted-foreground md:flex-row md:items-center">
          <p>© {new Date().getFullYear()} Jaratrade Ltd. All rights reserved.</p>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
            <Link href="/legal/terms" className="hover:text-foreground">
              Terms
            </Link>
            <Link href="/legal/privacy" className="hover:text-foreground">
              Privacy
            </Link>
            <Link href="/legal/cookies" className="hover:text-foreground">
              Cookies
            </Link>
            <span aria-hidden>·</span>
            <span>Made in Lagos & London</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

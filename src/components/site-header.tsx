"use client";

/**
 * Site header - premium glass-floating bar.
 *
 * Behaviour:
 *  - Transparent on top-of-page; once the user has scrolled past 8px we apply
 *    the glass surface + a hairline bottom border. Eliminates the heavy fixed
 *    bar feel while keeping a clear separation from content during scroll.
 *  - Search input expands inline on `md+`; collapses behind an icon on mobile.
 *  - Logo, primary nav, search, theme toggle, cart, user menu - exactly four
 *    discrete visual zones (left/center/right with the search as the spacer).
 */
import Link from "next/link";
import { useEffect, useState } from "react";
import { Menu, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Logo } from "./logo";
import { CartButton } from "./cart-button";
import { UserMenu } from "./user-menu";
import { ThemeToggle } from "./theme-toggle";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

const navItems = [
  { label: "Marketplace", href: "/products" },
  { label: "Categories", href: "/categories" },
  { label: "How it works", href: "/services" },
  { label: "About", href: "/about" },
];

export function SiteHeader() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) {
      router.push(`/search?q=${encodeURIComponent(search.trim())}`);
      setMobileSearchOpen(false);
    }
  };

  return (
    <header
      className={cn(
        "sticky top-0 z-40 w-full transition-[backdrop-filter,background-color,border-color,box-shadow] duration-200",
        scrolled
          ? "surface-glass border-b border-border/60 shadow-soft"
          : "bg-transparent border-b border-transparent",
      )}
    >
      <div className="container mx-auto flex h-16 max-w-7xl items-center gap-3 px-4 sm:px-6 lg:gap-6 lg:px-8">
        {/* Mobile nav trigger */}
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden" aria-label="Open menu">
              <Menu className="size-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[88vw] max-w-sm overflow-y-auto p-0 sm:max-w-sm">
            <SheetHeader className="border-b border-border/60 p-6 pr-16">
              <SheetTitle asChild>
                <div>
                  <Logo size="md" />
                </div>
              </SheetTitle>
              <SheetDescription className="sr-only">Site navigation</SheetDescription>
            </SheetHeader>
            <nav aria-label="Primary" className="flex flex-col gap-0.5 px-3 py-4">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="rounded-lg px-3 py-3 text-base font-medium text-foreground/85 transition-colors hover:bg-muted hover:text-foreground"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
            <div className="mt-auto border-t border-border/60 p-6">
              <p className="mb-3 text-xs font-bold uppercase tracking-[0.16em] text-muted-foreground">
                Get started
              </p>
              <div className="space-y-2.5">
                <Button asChild className="w-full rounded-full" size="lg">
                  <Link href="/auth/login/importer">Sign in</Link>
                </Button>
                <Button asChild className="w-full rounded-full" variant="outline" size="lg">
                  <Link href="/auth/register/importer">Create account</Link>
                </Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>

        <Logo size="md" />

        <nav aria-label="Primary" className="ml-2 hidden items-center gap-1 md:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <form
          role="search"
          onSubmit={handleSearch}
          className="ml-auto hidden flex-1 max-w-md items-center md:flex"
        >
          <label className="sr-only" htmlFor="site-search">Search products</label>
          <div className="relative w-full">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
            <Input
              id="site-search"
              type="search"
              placeholder="Search products, exporters, markets…"
              className="h-10 rounded-full border-border/70 bg-background/70 pl-10 pr-4 shadow-sm transition-shadow focus-visible:bg-background focus-visible:shadow-md"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </form>

        <Button
          variant="ghost"
          size="icon"
          aria-label="Search"
          className="ml-auto md:hidden"
          onClick={() => setMobileSearchOpen((v) => !v)}
        >
          {mobileSearchOpen ? <X className="size-5" /> : <Search className="size-5" />}
        </Button>

        <div className="flex items-center gap-1 md:ml-2">
          <ThemeToggle />
          <CartButton />
          <UserMenu />
        </div>
      </div>

      {/* Mobile search reveal */}
      {mobileSearchOpen ? (
        <div className="border-t border-border/60 md:hidden">
          <form role="search" onSubmit={handleSearch} className="container mx-auto max-w-7xl px-4 py-3 sm:px-6">
            <label className="sr-only" htmlFor="mobile-search">Search products</label>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
              <Input
                id="mobile-search"
                type="search"
                placeholder="Search products, exporters, markets…"
                className="h-11 rounded-full pl-10"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                autoFocus
              />
            </div>
          </form>
        </div>
      ) : null}
    </header>
  );
}

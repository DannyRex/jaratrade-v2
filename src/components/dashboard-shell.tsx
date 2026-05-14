"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetDescription } from "@/components/ui/sheet";
import { ThemeToggle } from "@/components/theme-toggle";
import { UserMenu } from "@/components/user-menu";
import { cn } from "@/lib/utils";

export interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}

interface DashboardShellProps {
  nav: NavItem[];
  brand: string;
  children: React.ReactNode;
}

export function DashboardShell({ nav, brand, children }: DashboardShellProps) {
  return (
    <div className="grid min-h-svh lg:grid-cols-[260px_1fr] bg-muted/20">
      {/* Sidebar (desktop) */}
      <aside className="sticky top-0 hidden h-svh flex-col border-r bg-sidebar px-3 py-4 lg:flex">
        <div className="px-2 pb-4">
          <Logo />
          <p className="mt-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            {brand}
          </p>
        </div>
        <SidebarNav nav={nav} className="flex-1" />
        <div className="border-t pt-3 px-2 text-xs text-muted-foreground">
          Need help? <Link className="text-primary underline-offset-4 hover:underline" href="/help">Contact us</Link>
        </div>
      </aside>

      <div className="flex flex-col">
        <header className="sticky top-0 z-30 flex h-14 items-center gap-2 border-b bg-background/85 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60 sm:px-6">
          {/* Mobile sidebar */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Open menu">
                <Menu className="size-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72 p-0">
              <SheetHeader className="border-b p-4 text-left">
                <SheetTitle>
                  <Logo />
                </SheetTitle>
                <SheetDescription className="sr-only">{brand} navigation</SheetDescription>
              </SheetHeader>
              <SidebarNav nav={nav} className="p-3" />
            </SheetContent>
          </Sheet>

          <div className="lg:hidden">
            <Logo variant="mark" href="/" />
          </div>

          <div className="ml-auto flex items-center gap-1">
            <ThemeToggle />
            <UserMenu />
          </div>
        </header>

        <main className="flex-1">
          <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">{children}</div>
        </main>
      </div>
    </div>
  );
}

function SidebarNav({ nav, className }: { nav: NavItem[]; className?: string }) {
  const pathname = usePathname();

  return (
    <nav aria-label="Sidebar" className={cn("flex flex-col gap-0.5 overflow-y-auto", className)}>
      {nav.map((item) => {
        const Icon = item.icon;
        const active = pathname === item.href || pathname.startsWith(item.href + "/");
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
              active
                ? "bg-sidebar-accent text-sidebar-accent-foreground"
                : "text-muted-foreground hover:bg-sidebar-accent/60 hover:text-foreground",
            )}
          >
            <Icon className="size-4" />
            <span className="flex-1">{item.label}</span>
            {item.badge ? (
              <span className="rounded-full bg-accent/15 px-2 py-0.5 text-[10px] font-bold text-accent">
                {item.badge}
              </span>
            ) : null}
          </Link>
        );
      })}
    </nav>
  );
}

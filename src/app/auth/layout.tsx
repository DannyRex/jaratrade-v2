import Link from "next/link";
import Image from "next/image";
import { ShieldCheck, Truck, CreditCard } from "lucide-react";
import { Logo } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";

/**
 * Auth shell - split layout.
 *
 * Left panel (lg+ only): brand mark, value-prop headline, three trust pills,
 * sits over a brand gradient with the logo glyph faintly in the back. The
 * form column is capped at 480px so input lines stay readable. On mobile
 * the brand panel collapses; we keep a tiny header strip with the logo +
 * theme toggle so users always know where they are.
 */
const trustPills = [
  { icon: ShieldCheck, label: "KYC-verified sellers" },
  { icon: Truck, label: "Integrated logistics" },
  { icon: CreditCard, label: "Secured by Flutterwave" },
];

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-svh bg-background lg:grid-cols-[minmax(0,1fr)_minmax(0,560px)]">
      {/* Brand panel - hidden on mobile */}
      <aside className="relative hidden flex-col justify-between overflow-hidden bg-brand-gradient p-10 text-white lg:flex xl:p-14">
        <div className="absolute inset-0 bg-grid-soft opacity-20" aria-hidden />
        <div
          className="pointer-events-none absolute -right-24 -top-24 size-96 rounded-full blur-3xl opacity-50"
          style={{ background: "radial-gradient(circle, oklch(0.70 0.1593 245 / 0.55), transparent 70%)" }}
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -bottom-28 -left-20 size-[28rem] rounded-full blur-3xl opacity-40"
          style={{ background: "radial-gradient(circle, oklch(0.73 0.1730 55 / 0.45), transparent 70%)" }}
          aria-hidden
        />
        {/* Faint logo glyph */}
        <div className="pointer-events-none absolute -right-12 bottom-0 opacity-[0.07]" aria-hidden>
          <Image src="/brand/logo.png" alt="" width={420} height={517} className="h-[24rem] w-auto xl:h-[28rem]" />
        </div>

        <div className="relative">
          <Logo tone="inverted" href="/" size="lg" />
        </div>

        <div className="relative space-y-6">
          <h2 className="max-w-md font-display text-4xl font-bold leading-tight tracking-tight xl:text-5xl">
            The marketplace built for{" "}
            <span className="bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent">
              cross-border trade.
            </span>
          </h2>
          <p className="max-w-md text-base leading-relaxed text-white/85">
            Source verified FMCGs from Nigerian markets. Sell to UK importers
            without losing margin to middlemen. One platform handles
            verification, payments, and shipping.
          </p>
          <ul className="space-y-2.5">
            {trustPills.map((pill) => (
              <li key={pill.label} className="flex items-center gap-2.5 text-sm text-white/90">
                <pill.icon className="size-4 text-white" aria-hidden />
                {pill.label}
              </li>
            ))}
          </ul>
        </div>

        <p className="relative text-xs text-white/65">
          © {new Date().getFullYear()} Jaratrade Ltd.
        </p>
      </aside>

      {/* Form column */}
      <div className="flex flex-col">
        <header className="flex items-center justify-between border-b border-border/40 px-4 py-4 sm:px-6 lg:hidden">
          <Logo size="md" />
          <ThemeToggle />
        </header>
        <header className="hidden items-center justify-end px-6 py-5 lg:flex">
          <ThemeToggle />
        </header>

        <div className="flex flex-1 items-center justify-center px-4 py-10 sm:px-8 sm:py-12">
          <div className="w-full max-w-[420px]">{children}</div>
        </div>

        <footer className="border-t border-border/40 px-6 py-5 text-center text-xs text-muted-foreground">
          By continuing you agree to Jaratrade&apos;s{" "}
          <Link href="/legal/terms" className="font-medium text-foreground/80 underline-offset-4 hover:underline">
            terms
          </Link>{" "}
          and{" "}
          <Link href="/legal/privacy" className="font-medium text-foreground/80 underline-offset-4 hover:underline">
            privacy policy
          </Link>
          .
        </footer>
      </div>
    </div>
  );
}

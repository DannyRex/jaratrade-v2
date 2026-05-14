import Link from "next/link";
import { Logo } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-svh lg:grid-cols-[1fr_minmax(0,520px)] bg-background">
      {/* Brand panel - hidden on mobile */}
      <aside
        aria-hidden
        className="relative hidden flex-col justify-between overflow-hidden bg-gradient-to-br from-primary via-[oklch(0.45_0.22_270)] to-[oklch(0.40_0.20_290)] p-12 text-primary-foreground lg:flex"
      >
        <div
          aria-hidden
          className="absolute inset-0 -z-10 bg-[radial-gradient(50%_50%_at_30%_30%,oklch(1_0_0/0.15),transparent),radial-gradient(40%_40%_at_70%_70%,oklch(0.75_0.16_47/0.20),transparent)]"
        />
        <Logo className="text-white" href="/" />
        <div className="space-y-4">
          <h2 className="text-3xl font-bold tracking-tight">
            The marketplace built for Nigeria-UK trade.
          </h2>
          <p className="max-w-md text-base text-primary-foreground/85">
            Source FMCGs from verified Nigerian markets. Sell to UK importers without losing margin
            to middlemen. Pay and ship on one platform.
          </p>
        </div>
        <p className="text-sm text-primary-foreground/70">© {new Date().getFullYear()} Jaratrade Ltd.</p>
      </aside>

      <div className="flex flex-col">
        <header className="flex items-center justify-between p-4 sm:p-6 lg:hidden">
          <Logo />
          <ThemeToggle />
        </header>
        <header className="hidden items-center justify-end p-6 lg:flex">
          <ThemeToggle />
        </header>

        <div className="flex flex-1 items-center justify-center px-4 py-8 sm:px-8">
          <div className="w-full max-w-md">{children}</div>
        </div>

        <footer className="px-6 py-4 text-center text-xs text-muted-foreground">
          By continuing you agree to Jaratrade&apos;s{" "}
          <Link href="/legal/terms" className="underline-offset-4 hover:underline">
            terms
          </Link>{" "}
          and{" "}
          <Link href="/legal/privacy" className="underline-offset-4 hover:underline">
            privacy policy
          </Link>
          .
        </footer>
      </div>
    </div>
  );
}

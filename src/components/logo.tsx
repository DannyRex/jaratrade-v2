import Link from "next/link";
import { cn } from "@/lib/utils";

interface LogoProps {
  variant?: "full" | "mark";
  className?: string;
  href?: string | null;
}

export function Logo({ variant = "full", className, href = "/" }: LogoProps) {
  const content = (
    <span className={cn("inline-flex items-center gap-2 font-semibold tracking-tight", className)}>
      <span
        aria-hidden
        className="grid size-8 shrink-0 place-items-center rounded-lg bg-gradient-to-br from-primary to-[oklch(0.45_0.22_280)] text-primary-foreground shadow-sm"
      >
        <svg viewBox="0 0 24 24" fill="none" className="size-5" aria-hidden="true">
          <path
            d="M5 7C5 5.34315 6.34315 4 8 4H16C17.6569 4 19 5.34315 19 7V14C19 17.866 15.866 21 12 21V21C8.13401 21 5 17.866 5 14V7Z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinejoin="round"
          />
          <path d="M9 8L12 11L15 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
      {variant === "full" ? <span className="text-lg">Jaratrade</span> : null}
    </span>
  );

  if (!href) return content;
  return (
    <Link href={href} aria-label="Jaratrade home">
      {content}
    </Link>
  );
}

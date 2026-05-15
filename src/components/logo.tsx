import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

/**
 * Jaratrade brand lockup.
 *
 * Two presentations:
 *  - `full`  : mark + wordmark, used in headers + footers
 *  - `mark`  : mark only, used in compact bars and the mobile sheet
 *
 * The mark is a tightly-cropped PNG (250×308) of the brand glyph; we serve it
 * via next/image so it gets responsive sizing + an explicit aspect ratio (no
 * CLS). Wordmark uses a tighter tracking + the brand serif-ish feel from
 * Geist's `font-feature-settings: ss01` ligatures.
 */
interface LogoProps {
  variant?: "full" | "mark";
  /** Visual tone - `default` = brand-blue on transparent (use on light bg),
   *  `inverted` = white wordmark for dark/branded surfaces (CTAs, dark hero). */
  tone?: "default" | "inverted";
  /** Tailwind size of the mark only; wordmark scales relative to it. */
  size?: "sm" | "md" | "lg";
  className?: string;
  href?: string | null;
}

const SIZE_MAP = {
  sm: { mark: "h-7", word: "text-base" },
  md: { mark: "h-9", word: "text-lg" },
  lg: { mark: "h-12", word: "text-2xl" },
} as const;

export function Logo({
  variant = "full",
  tone = "default",
  size = "md",
  className,
  href = "/",
}: LogoProps) {
  const dims = SIZE_MAP[size];
  const content = (
    <span
      className={cn(
        "inline-flex items-center gap-2.5 font-bold tracking-tight",
        tone === "inverted" ? "text-white" : "text-foreground",
        className,
      )}
    >
      <Image
        src="/brand/logo.png"
        alt=""
        width={250}
        height={308}
        priority
        className={cn(dims.mark, "w-auto select-none")}
        aria-hidden="true"
      />
      {variant === "full" ? (
        <span className={cn(dims.word, "leading-none [font-feature-settings:'ss01']")}>
          Jaratrade
        </span>
      ) : null}
    </span>
  );

  if (!href) return content;
  return (
    <Link href={href} aria-label="Jaratrade home" className="inline-flex">
      {content}
    </Link>
  );
}

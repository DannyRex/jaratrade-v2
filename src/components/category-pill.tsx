import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Category } from "@/lib/types";

// Five tonal pairings keyed on hue so adjacent pills don't collide.
// All ratios pass WCAG AA at 4.5:1 against the foreground swatch.
const palette = [
  {
    bg: "bg-[oklch(0.96_0.04_261)] dark:bg-[oklch(0.28_0.10_261)]",
    fg: "text-[oklch(0.40_0.18_261)] dark:text-[oklch(0.88_0.06_261)]",
    ring: "ring-[oklch(0.40_0.18_261)/0.10]",
  },
  {
    bg: "bg-[oklch(0.96_0.04_47)] dark:bg-[oklch(0.28_0.10_47)]",
    fg: "text-[oklch(0.40_0.18_47)] dark:text-[oklch(0.88_0.06_47)]",
    ring: "ring-[oklch(0.40_0.18_47)/0.10]",
  },
  {
    bg: "bg-[oklch(0.96_0.04_145)] dark:bg-[oklch(0.28_0.10_145)]",
    fg: "text-[oklch(0.35_0.16_145)] dark:text-[oklch(0.88_0.06_145)]",
    ring: "ring-[oklch(0.35_0.16_145)/0.10]",
  },
  {
    bg: "bg-[oklch(0.96_0.04_318)] dark:bg-[oklch(0.28_0.10_318)]",
    fg: "text-[oklch(0.40_0.18_318)] dark:text-[oklch(0.88_0.06_318)]",
    ring: "ring-[oklch(0.40_0.18_318)/0.10]",
  },
  {
    bg: "bg-[oklch(0.96_0.04_225)] dark:bg-[oklch(0.28_0.10_225)]",
    fg: "text-[oklch(0.40_0.18_225)] dark:text-[oklch(0.88_0.06_225)]",
    ring: "ring-[oklch(0.40_0.18_225)/0.10]",
  },
] as const;

export function CategoryPill({ category, index = 0 }: { category: Category; index?: number }) {
  const tone = palette[index % palette.length];
  return (
    <Link
      href={`/products?category=${encodeURIComponent(category.name)}`}
      className={cn(
        "group flex items-center justify-between gap-3 rounded-2xl border border-border/40 p-5 ring-1 ring-transparent transition-all duration-300",
        "hover:-translate-y-0.5 hover:shadow-card",
        tone.bg,
        tone.fg,
        tone.ring,
      )}
    >
      <div className="min-w-0 space-y-1">
        <p className="truncate text-base font-semibold tracking-tight">{category.name}</p>
        {typeof category.cat_count === "number" ? (
          <p className="text-xs font-medium opacity-75">
            {category.cat_count} {category.cat_count === 1 ? "product" : "products"}
          </p>
        ) : (
          <p className="line-clamp-1 text-xs opacity-75">{category.description}</p>
        )}
      </div>
      <span
        aria-hidden
        className="grid size-9 shrink-0 place-items-center rounded-full bg-card/80 backdrop-blur transition-transform duration-300 group-hover:translate-x-0.5 group-hover:rotate-12"
      >
        <ArrowUpRight className="size-4" />
      </span>
    </Link>
  );
}

import Link from "next/link";
import { cn } from "@/lib/utils";
import type { Category } from "@/lib/types";

const palette = [
  "bg-[oklch(0.95_0.05_261)] text-[oklch(0.45_0.18_261)] dark:bg-[oklch(0.30_0.08_261)] dark:text-[oklch(0.85_0.08_261)]",
  "bg-[oklch(0.95_0.05_47)] text-[oklch(0.45_0.18_47)] dark:bg-[oklch(0.30_0.08_47)] dark:text-[oklch(0.85_0.08_47)]",
  "bg-[oklch(0.95_0.05_145)] text-[oklch(0.40_0.15_145)] dark:bg-[oklch(0.30_0.08_145)] dark:text-[oklch(0.85_0.08_145)]",
  "bg-[oklch(0.95_0.05_318)] text-[oklch(0.45_0.18_318)] dark:bg-[oklch(0.30_0.08_318)] dark:text-[oklch(0.85_0.08_318)]",
  "bg-[oklch(0.95_0.05_225)] text-[oklch(0.45_0.18_225)] dark:bg-[oklch(0.30_0.08_225)] dark:text-[oklch(0.85_0.08_225)]",
];

export function CategoryPill({ category, index = 0 }: { category: Category; index?: number }) {
  const colorClass = palette[index % palette.length];
  return (
    <Link
      href={`/products?category=${encodeURIComponent(category.name)}`}
      className={cn(
        "group flex items-center justify-between gap-3 rounded-xl border p-4 transition-shadow hover:shadow-sm",
        colorClass,
      )}
    >
      <div className="space-y-0.5">
        <p className="text-sm font-semibold tracking-tight">{category.name}</p>
        {typeof category.cat_count === "number" ? (
          <p className="text-xs opacity-75">
            {category.cat_count} {category.cat_count === 1 ? "product" : "products"}
          </p>
        ) : (
          <p className="text-xs opacity-75 line-clamp-1">{category.description}</p>
        )}
      </div>
      <span aria-hidden className="text-base transition-transform duration-200 group-hover:translate-x-0.5">
        →
      </span>
    </Link>
  );
}

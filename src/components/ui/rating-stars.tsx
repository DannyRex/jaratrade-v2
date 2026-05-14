"use client";

import * as React from "react";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

export interface RatingStarsProps {
  /** Read-only display rating (0-5). Use this OR `value`+`onChange` for interactive. */
  rating?: number;
  /** Interactive selected value (0-5). */
  value?: number;
  /** Callback for interactive use. Omit to render read-only. */
  onChange?: (rating: number) => void;
  size?: "sm" | "md" | "lg";
  className?: string;
  /** Render N total stars (default 5). */
  count?: number;
  /** Visible label (e.g. "(124 reviews)") rendered after the stars. */
  label?: React.ReactNode;
}

const sizeClass = {
  sm: "size-3.5",
  md: "size-4",
  lg: "size-6",
};

export function RatingStars({
  rating,
  value,
  onChange,
  size = "md",
  className,
  count = 5,
  label,
}: RatingStarsProps) {
  const interactive = typeof onChange === "function";
  const [hover, setHover] = React.useState<number | null>(null);
  const display = hover ?? value ?? rating ?? 0;
  const sz = sizeClass[size];

  return (
    <div className={cn("inline-flex items-center gap-1", className)}>
      <div role={interactive ? "radiogroup" : undefined} aria-label="Rating" className="inline-flex items-center gap-0.5">
        {Array.from({ length: count }).map((_, i) => {
          const idx = i + 1;
          const filled = idx <= display;
          if (interactive) {
            return (
              <button
                key={idx}
                type="button"
                aria-label={`${idx} of ${count} stars`}
                aria-pressed={(value ?? 0) === idx}
                onMouseEnter={() => setHover(idx)}
                onMouseLeave={() => setHover(null)}
                onFocus={() => setHover(idx)}
                onBlur={() => setHover(null)}
                onClick={() => onChange?.(idx)}
                className="rounded p-0.5 transition-transform hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <Star
                  className={cn(sz, filled ? "fill-amber-400 text-amber-400" : "text-muted-foreground")}
                  aria-hidden
                />
              </button>
            );
          }
          return (
            <Star
              key={idx}
              className={cn(sz, filled ? "fill-amber-400 text-amber-400" : "text-muted-foreground")}
              aria-hidden
            />
          );
        })}
      </div>
      {label ? <span className="text-xs text-muted-foreground">{label}</span> : null}
    </div>
  );
}

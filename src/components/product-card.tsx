"use client";

/**
 * ProductCard - marketplace listing card.
 *
 * Visual rules (v3 craft pass):
 *  - Aspect-3/4 image with a soft brand-tinted gradient overlay (only at the
 *    very bottom) so price + name on the image are always legible if we ever
 *    overlay them. Currently we don't - the price sits below the image - but
 *    the gradient adds depth and signals premium curation.
 *  - Hover: card lifts (-translate-y-1) + brand glow shadow. Image zooms
 *    subtly (scale-105) inside its overflow-hidden frame.
 *  - Badges live in the corners so they don't compete with the product photo
 *    centerpiece.
 *  - Stock badge (low/out) is the strongest signal - sits bottom-left with
 *    a backdrop-blur pill to remain readable on busy photos.
 */
import Image from "next/image";
import Link from "next/link";
import { MapPin, Store as StoreIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { StockBadge } from "@/components/stock-badge";
import { parseProductImages, type ProductSummary } from "@/lib/types";
import { formatMoney } from "@/lib/format";
import { cn } from "@/lib/utils";

interface ProductCardProps {
  product: ProductSummary;
  className?: string;
  priority?: boolean;
}

export function ProductCard({ product, className, priority = false }: ProductCardProps) {
  const images = parseProductImages(product.images);
  const cover = images.find((u) => /\.(jpg|jpeg|png|webp|gif|avif)(\?|$)/i.test(u));
  const sellerLabel = product.business_name?.trim() || product.exporter_name;

  return (
    <article
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-2xl border border-border/70 bg-card transition-all duration-300",
        "hover:-translate-y-1 hover:border-primary/30 hover:shadow-[var(--shadow-brand)]",
        className,
      )}
    >
      {/* Whole-card link - sits beneath badges so the badges remain visually layered on top */}
      <Link
        href={`/products/${encodeURIComponent(product.id)}`}
        className="absolute inset-0 z-10 rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        aria-label={`View ${product.product_name}`}
      >
        <span className="sr-only">View {product.product_name}</span>
      </Link>

      <div className="relative aspect-[4/3] w-full overflow-hidden bg-gradient-to-br from-muted to-secondary/40">
        {cover ? (
          <Image
            src={cover}
            alt=""
            fill
            sizes="(min-width:1280px) 20vw, (min-width:1024px) 25vw, (min-width:640px) 33vw, 50vw"
            className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.05]"
            priority={priority}
          />
        ) : (
          <div className="absolute inset-0 grid place-items-center text-xs text-muted-foreground">
            No image
          </div>
        )}
        {/* Bottom edge fade - adds dimension + reserves space for any future overlay text */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/30 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

        {/* Top-left: category */}
        <div className="absolute left-3 top-3 z-[1]">
          <Badge
            variant="secondary"
            className="rounded-full bg-background/90 px-2.5 py-1 text-[11px] font-medium uppercase tracking-wide text-foreground/80 backdrop-blur-sm"
          >
            {product.category}
          </Badge>
        </div>

        {/* Top-right: sponsored */}
        {product.promote ? (
          <div className="absolute right-3 top-3 z-[1]">
            <Badge
              variant="accent"
              className="rounded-full bg-accent/95 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-accent-foreground shadow-sm"
            >
              ★ Sponsored
            </Badge>
          </div>
        ) : null}

        {/* Bottom-left: stock signal (low/out only via StockBadge's compact mode) */}
        <div className="absolute bottom-3 left-3 z-[1]">
          <StockBadge
            stock={product.stock_quantity}
            threshold={product.low_stock_threshold}
            compact
            className="rounded-full bg-background/95 px-2.5 py-1 text-[11px] font-semibold shadow-sm backdrop-blur-sm"
          />
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-3 p-4 sm:p-5">
        <div className="space-y-1">
          <h3 className="line-clamp-2 text-[15px] font-semibold leading-snug tracking-tight text-foreground">
            {product.product_name}
          </h3>
          <p className="line-clamp-1 text-xs text-muted-foreground">by {sellerLabel}</p>
        </div>

        {/* Price row */}
        <div className="mt-auto flex items-baseline gap-1.5">
          <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground/80">
            From
          </p>
          <p className="text-lg font-bold tracking-tight tabular-nums">
            {formatMoney(product.price, product.currency || "NGN")}
          </p>
        </div>

        {/* Provenance row - one line, truncates with ellipses if it overflows */}
        <div className="flex items-center gap-3 border-t border-border/50 pt-2.5 text-[11px] text-muted-foreground">
          <span className="inline-flex min-w-0 items-center gap-1">
            <StoreIcon className="size-3 shrink-0" aria-hidden />
            <span className="truncate">{product.store}</span>
          </span>
          <span className="text-muted-foreground/40" aria-hidden>·</span>
          <span className="inline-flex min-w-0 items-center gap-1">
            <MapPin className="size-3 shrink-0" aria-hidden />
            <span className="truncate">{product.market_name}</span>
          </span>
        </div>
      </div>
    </article>
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border border-border/60 bg-card">
      <div className="aspect-[4/3] w-full bg-gradient-to-br from-muted to-secondary/40 animate-pulse" />
      <div className="space-y-3 p-4 sm:p-5">
        <div className="space-y-2">
          <div className="h-4 w-3/4 animate-pulse rounded bg-muted" />
          <div className="h-3 w-1/2 animate-pulse rounded bg-muted/70" />
        </div>
        <div className="flex items-end justify-between pt-3">
          <div className="space-y-1.5">
            <div className="h-2 w-8 animate-pulse rounded bg-muted" />
            <div className="h-5 w-20 animate-pulse rounded bg-muted" />
          </div>
        </div>
      </div>
    </div>
  );
}

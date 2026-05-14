"use client";

import Image from "next/image";
import Link from "next/link";
import { MapPin, Store as StoreIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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

  return (
    <Card
      className={cn(
        "group relative flex flex-col overflow-hidden p-0 transition-shadow duration-200 hover:shadow-md",
        className,
      )}
    >
      <Link href={`/products/${encodeURIComponent(product.id)}`} className="absolute inset-0 z-10" aria-label={product.product_name}>
        <span className="sr-only">View {product.product_name}</span>
      </Link>
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-muted">
        {cover ? (
          <Image
            src={cover}
            alt={product.product_name}
            fill
            sizes="(min-width:1024px) 25vw, (min-width:640px) 33vw, 50vw"
            className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
            priority={priority}
          />
        ) : (
          <div className="absolute inset-0 grid place-items-center text-xs text-muted-foreground">
            No image
          </div>
        )}
        <div className="absolute left-3 top-3 flex flex-col gap-1.5">
          <Badge variant="secondary" className="bg-background/90 text-xs">
            {product.category}
          </Badge>
        </div>
        {product.promote ? (
          <div className="absolute right-3 top-3">
            <Badge variant="accent" className="bg-accent text-accent-foreground text-[10px] uppercase tracking-wide">
              Sponsored
            </Badge>
          </div>
        ) : null}
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-foreground">
          {product.product_name}
        </h3>
        <p className="line-clamp-1 text-xs text-muted-foreground">
          by {product.business_name?.trim() || product.exporter_name}
        </p>
        <div className="mt-auto flex items-end justify-between gap-2">
          <div>
            <p className="text-xs text-muted-foreground">From</p>
            <p className="text-base font-bold tracking-tight">{formatMoney(product.price, "NGN")}</p>
          </div>
          <div className="flex flex-col items-end gap-1 text-[11px] text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <StoreIcon className="size-3" aria-hidden /> {product.store}
            </span>
            <span className="inline-flex items-center gap-1">
              <MapPin className="size-3" aria-hidden /> {product.market_name}
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="flex animate-pulse flex-col overflow-hidden rounded-lg border bg-card">
      <div className="aspect-[4/3] w-full bg-muted" />
      <div className="space-y-2 p-4">
        <div className="h-4 w-3/4 rounded bg-muted" />
        <div className="h-3 w-1/2 rounded bg-muted" />
        <div className="flex items-end justify-between pt-3">
          <div className="space-y-1">
            <div className="h-2 w-8 rounded bg-muted" />
            <div className="h-5 w-20 rounded bg-muted" />
          </div>
        </div>
      </div>
    </div>
  );
}

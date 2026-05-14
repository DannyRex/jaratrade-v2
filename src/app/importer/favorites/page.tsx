"use client";

import Link from "next/link";
import { Heart } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ProductCard } from "@/components/product-card";
import { useImporterFavourites } from "@/lib/queries";
import type { ProductSummary } from "@/lib/types";

export default function FavouritesPage() {
  const { data, isLoading } = useImporterFavourites();

  // Backend returns favourites in a flexible shape - coerce safely
  const favourites: ProductSummary[] = Array.isArray(data)
    ? (data as ProductSummary[])
    : ((data as { rows?: ProductSummary[] })?.rows ?? []);

  return (
    <>
      <PageHeader title="Favourites" description="Products you've saved for later." />
      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-72 w-full" />
          ))}
        </div>
      ) : favourites.length === 0 ? (
        <EmptyState
          icon={<Heart />}
          title="Nothing saved yet"
          description="Tap the heart on any product to save it for later."
          action={
            <Button asChild>
              <Link href="/products">Browse products</Link>
            </Button>
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {favourites.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </>
  );
}

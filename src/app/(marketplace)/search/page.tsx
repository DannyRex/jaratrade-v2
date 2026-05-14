"use client";

import { Suspense, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { PageHeader } from "@/components/ui/page-header";
import { ProductCard, ProductCardSkeleton } from "@/components/product-card";
import { useProducts } from "@/lib/queries";
import { EmptyState } from "@/components/ui/empty-state";
import { Search } from "lucide-react";

export default function SearchPage() {
  return (
    <Suspense fallback={null}>
      <SearchContent />
    </Suspense>
  );
}

function SearchContent() {
  const params = useSearchParams();
  const q = params.get("q") ?? "";
  const products = useProducts({ len: 50 });

  const filtered = useMemo(() => {
    if (!q) return [];
    const items = products.data?.data ?? [];
    const term = q.toLowerCase();
    return items.filter(
      (p) =>
        p.product_name?.toLowerCase().includes(term) ||
        p.business_name?.toLowerCase().includes(term) ||
        p.category?.toLowerCase().includes(term) ||
        p.market_name?.toLowerCase().includes(term),
    );
  }, [products.data, q]);

  return (
    <div className="container mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <PageHeader
        title={q ? `Results for "${q}"` : "Search the marketplace"}
        description={
          q
            ? `${filtered.length} ${filtered.length === 1 ? "product" : "products"} found`
            : "Use the search bar above to find products."
        }
      />

      {!q ? null : products.isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <ProductCardSkeleton key={i} />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<Search />}
          title="No products match"
          description="Try a different search term or browse categories."
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}

"use client";

import { Suspense, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Filter, Search } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ProductCard, ProductCardSkeleton } from "@/components/product-card";
import { EmptyState } from "@/components/ui/empty-state";
import { useCategories, useProducts } from "@/lib/queries";
import { useDebounce } from "@/hooks/use-debounce";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

export default function ProductsPage() {
  return (
    <Suspense fallback={null}>
      <ProductsPageContent />
    </Suspense>
  );
}

function ProductsPageContent() {
  const params = useSearchParams();
  const initialCategory = params.get("category") ?? undefined;

  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 250);
  const [category, setCategory] = useState<string | undefined>(initialCategory);
  const [sort, setSort] = useState<string>("newest");
  const [page, setPage] = useState(1);

  const filters = useMemo(
    () => ({
      category,
      p: page - 1,
      len: 24,
      sort_by: sort,
    }),
    [category, page, sort],
  );

  const products = useProducts(filters);
  const categories = useCategories();

  const filtered = useMemo(() => {
    const items = products.data?.data ?? [];
    if (!debouncedSearch.trim()) return items;
    const q = debouncedSearch.toLowerCase();
    return items.filter(
      (p) =>
        p.product_name?.toLowerCase().includes(q) ||
        p.business_name?.toLowerCase().includes(q) ||
        p.category?.toLowerCase().includes(q) ||
        p.market_name?.toLowerCase().includes(q),
    );
  }, [products.data, debouncedSearch]);

  return (
    <div className="container mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <PageHeader
        title="Marketplace"
        description="Browse FMCGs from verified Nigerian exporters across all major markets."
      />

      <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
          <Input
            placeholder="Search by product, exporter, or market…"
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Search products"
          />
        </div>

        <div className="flex items-center gap-2">
          <Select value={category ?? "all"} onValueChange={(v) => setCategory(v === "all" ? undefined : v)}>
            <SelectTrigger className="w-44" aria-label="Filter by category">
              <SelectValue placeholder="All categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All categories</SelectItem>
              {(categories.data?.rows ?? []).map((c) => (
                <SelectItem key={c.id} value={c.name}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={sort} onValueChange={setSort}>
            <SelectTrigger className="w-40" aria-label="Sort">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest</SelectItem>
              <SelectItem value="price_asc">Price: low to high</SelectItem>
              <SelectItem value="price_desc">Price: high to low</SelectItem>
              <SelectItem value="popular">Most popular</SelectItem>
            </SelectContent>
          </Select>

          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="md:hidden" aria-label="Open filters">
                <Filter className="size-4" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <SheetHeader>
                <SheetTitle>Filters</SheetTitle>
              </SheetHeader>
              <div className="mt-6 space-y-4">
                <p className="text-sm text-muted-foreground">More filters coming soon.</p>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {category ? (
        <div className="mb-4 flex items-center gap-2 text-sm">
          <span className="text-muted-foreground">Filtered by:</span>
          <Badge variant="secondary" className="cursor-pointer" onClick={() => setCategory(undefined)}>
            {category} ✕
          </Badge>
        </div>
      ) : null}

      {products.isError ? (
        <EmptyState
          title="Couldn't load products"
          description="The marketplace is having a hiccup. Try refreshing."
          action={<Button onClick={() => products.refetch()}>Retry</Button>}
        />
      ) : products.isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <ProductCardSkeleton key={i} />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<Search />}
          title="No products match your filters"
          description="Try a different search term or clear your filters."
          action={
            <Button
              variant="outline"
              onClick={() => {
                setSearch("");
                setCategory(undefined);
              }}
            >
              Clear filters
            </Button>
          }
        />
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filtered.map((p, i) => (
              <ProductCard key={p.id} product={p} priority={i < 4} />
            ))}
          </div>

          {/* Pagination */}
          {(products.data?.meta.paging.total ?? 0) > 24 ? (
            <div className="mt-10 flex items-center justify-between gap-2">
              <p className="text-sm text-muted-foreground">
                Showing {filtered.length} of {products.data?.meta.paging.total ?? 0} products
              </p>
              <div className="flex items-center gap-2">
                <Button variant="outline" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
                  Previous
                </Button>
                <span className="text-sm text-muted-foreground">Page {page}</span>
                <Button
                  variant="outline"
                  disabled={(filtered.length ?? 0) < 24}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          ) : null}
        </>
      )}
    </div>
  );
}

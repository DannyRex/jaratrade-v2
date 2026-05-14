"use client";

import { PageHeader } from "@/components/ui/page-header";
import { CategoryPill } from "@/components/category-pill";
import { useCategories } from "@/lib/queries";
import { EmptyState } from "@/components/ui/empty-state";

export default function CategoriesPage() {
  const { data, isLoading } = useCategories();

  return (
    <div className="container mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <PageHeader
        title="Browse categories"
        description="Explore the full set of FMCG categories available on Jaratrade."
      />
      {isLoading ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="h-[78px] animate-pulse rounded-xl border bg-muted" />
          ))}
        </div>
      ) : (data?.rows ?? []).length === 0 ? (
        <EmptyState title="No categories yet" description="Categories will appear here once added." />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {data!.rows.map((c, i) => (
            <CategoryPill key={c.id} category={c} index={i} />
          ))}
        </div>
      )}
    </div>
  );
}

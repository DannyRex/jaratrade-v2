"use client";

import { Banknote, FolderTree, Package, Store, Truck, Users } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { Skeleton } from "@/components/ui/skeleton";
import { useAdminBanks, useAdminCategories, useAdminLogistics, useAdminMarkets } from "@/lib/queries";

export default function AdminDashboard() {
  const markets = useAdminMarkets();
  const banks = useAdminBanks();
  const categories = useAdminCategories();
  const logistics = useAdminLogistics();

  return (
    <>
      <PageHeader
        title="Admin overview"
        description="Live counts for the moving parts of the marketplace."
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat icon={Store} label="Markets" value={markets.data?.rows.length} loading={markets.isLoading} />
        <Stat icon={FolderTree} label="Categories" value={categories.data?.rows.length} loading={categories.isLoading} />
        <Stat icon={Banknote} label="Banks" value={banks.data?.rows.length} loading={banks.isLoading} />
        <Stat icon={Truck} label="Logistics partners" value={logistics.data?.rows.length} loading={logistics.isLoading} />
      </div>

      <div className="mt-8 grid gap-4 lg:grid-cols-2">
        <Card>
          <CardContent className="p-6">
            <h2 className="text-sm font-semibold">Recently added markets</h2>
            {markets.isLoading ? (
              <Skeleton className="mt-3 h-32 w-full" />
            ) : (
              <ul className="mt-3 divide-y text-sm">
                {(markets.data?.rows ?? []).slice(0, 5).map((m) => (
                  <li key={m.id} className="flex justify-between py-2">
                    <span className="font-medium">{m.name}</span>
                    <span className="text-muted-foreground">{m.location}</span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <h2 className="text-sm font-semibold">Recently added categories</h2>
            {categories.isLoading ? (
              <Skeleton className="mt-3 h-32 w-full" />
            ) : (
              <ul className="mt-3 divide-y text-sm">
                {(categories.data?.rows ?? []).slice(0, 5).map((c) => (
                  <li key={c.id} className="flex justify-between py-2">
                    <span className="font-medium">{c.name}</span>
                    <span className="text-muted-foreground">{c.cat_count ?? 0} products</span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}

function Stat({
  icon: Icon,
  label,
  value,
  loading,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number | undefined;
  loading: boolean;
}) {
  return (
    <Card>
      <CardContent className="space-y-2 p-5">
        <div className="flex items-center justify-between">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">{label}</p>
          <Icon className="size-4 text-muted-foreground" />
        </div>
        {loading ? <Skeleton className="h-7 w-16" /> : <p className="text-2xl font-bold tabular-nums">{value ?? 0}</p>}
      </CardContent>
    </Card>
  );
}

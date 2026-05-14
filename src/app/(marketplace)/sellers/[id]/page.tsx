"use client";

import { use } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ProductCard, ProductCardSkeleton } from "@/components/product-card";
import { useHome, useProducts } from "@/lib/queries";
import { initials } from "@/lib/format";
import { EmptyState } from "@/components/ui/empty-state";

export default function SellerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return <Seller id={decodeURIComponent(id)} />;
}

function Seller({ id }: { id: string }) {
  const home = useHome();
  const products = useProducts({ exporter: id, len: 24 });
  const exporter = (home.data?.top_exporter ?? []).find((e) => e.id === id);

  return (
    <div className="container mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <Card className="mb-8">
        <CardContent className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center">
          <Avatar className="size-16">
            <AvatarFallback className="bg-primary/10 text-lg text-primary">
              {initials(exporter?.business_name?.trim() || exporter?.profile_name || "?")}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <h1 className="text-2xl font-bold">
              {exporter?.business_name?.trim() || exporter?.profile_name || "Exporter"}
            </h1>
            <p className="text-sm text-muted-foreground">{exporter?.business_address || exporter?.address}</p>
            <div className="mt-2 flex flex-wrap gap-2 text-xs">
              {exporter?.order_count !== undefined ? (
                <Badge variant="secondary">{exporter.order_count} orders fulfilled</Badge>
              ) : null}
              {exporter?.business_country ? <Badge variant="outline">{exporter.business_country}</Badge> : null}
              <Badge variant="success">Verified</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      <PageHeader title="Products from this exporter" />

      {products.isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <ProductCardSkeleton key={i} />
          ))}
        </div>
      ) : (products.data?.data ?? []).length === 0 ? (
        <EmptyState title="No active listings" description="This exporter hasn't published any products yet." />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {products.data!.data.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}

"use client";

import Link from "next/link";
import { ArrowRight, Boxes, DollarSign, ShoppingBag, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { PageHeader } from "@/components/ui/page-header";
import { useExporterProfile, useExporterProducts } from "@/lib/queries";
import { useAuth } from "@/lib/auth-store";
import { formatMoney } from "@/lib/format";

interface ProfileLike {
  business_name?: string;
  total_orders?: number;
  total_revenue?: string | number;
  pending_orders?: number;
  active_products?: number;
}

export default function ExporterDashboard() {
  const user = useAuth((s) => s.user);
  const profile = useExporterProfile();
  const products = useExporterProducts();

  const data: ProfileLike = (profile.data as ProfileLike) ?? {};

  return (
    <>
      <PageHeader
        eyebrow={`Welcome back${user ? `, ${user.firstname}` : ""}`}
        title={data.business_name || user?.profile_name || "Exporter dashboard"}
        description="Snapshot of your store performance over the last 30 days."
        actions={
          <Button asChild>
            <Link href="/exporter/products/new">
              Add product <ArrowRight className="size-4" />
            </Link>
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={DollarSign}
          label="Total revenue"
          value={profile.isLoading ? null : formatMoney(data.total_revenue ?? 0, "NGN")}
        />
        <StatCard
          icon={ShoppingBag}
          label="Orders"
          value={profile.isLoading ? null : String(data.total_orders ?? 0)}
        />
        <StatCard
          icon={TrendingUp}
          label="Pending fulfilment"
          value={profile.isLoading ? null : String(data.pending_orders ?? 0)}
        />
        <StatCard
          icon={Boxes}
          label="Active listings"
          value={
            products.isLoading
              ? null
              : String((products.data?.data ?? []).filter((p) => p.status === 1).length)
          }
        />
      </div>

      <div className="mt-8 grid gap-4 lg:grid-cols-2">
        <Card>
          <CardContent className="space-y-3 p-6">
            <h2 className="font-semibold">Recent products</h2>
            {products.isLoading ? (
              <Skeleton className="h-32 w-full" />
            ) : (products.data?.data ?? []).length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No products yet.{" "}
                <Link href="/exporter/products/new" className="text-primary hover:underline">
                  Add your first product →
                </Link>
              </p>
            ) : (
              <ul className="divide-y">
                {(products.data?.data ?? []).slice(0, 4).map((p) => (
                  <li key={p.id} className="flex items-center justify-between py-3">
                    <div className="min-w-0">
                      <p className="line-clamp-1 text-sm font-medium">{p.product_name}</p>
                      <p className="text-xs text-muted-foreground">{p.category}</p>
                    </div>
                    <p className="text-sm font-semibold tabular-nums">{formatMoney(p.price)}</p>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="space-y-3 p-6">
            <h2 className="font-semibold">Quick actions</h2>
            <div className="flex flex-wrap gap-2">
              <Button asChild variant="outline" size="sm">
                <Link href="/exporter/products/new">Add product</Link>
              </Button>
              <Button asChild variant="outline" size="sm">
                <Link href="/exporter/stores/new">Open new store</Link>
              </Button>
              <Button asChild variant="outline" size="sm">
                <Link href="/exporter/subscription">Upgrade plan</Link>
              </Button>
              <Button asChild variant="outline" size="sm">
                <Link href="/exporter/orders">View orders</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}

function StatCard({ icon: Icon, label, value }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string | null }) {
  return (
    <Card>
      <CardContent className="space-y-2 p-5">
        <div className="flex items-center justify-between">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">{label}</p>
          <Icon className="size-4 text-muted-foreground" />
        </div>
        {value === null ? <Skeleton className="h-7 w-24" /> : <p className="text-2xl font-bold tracking-tight">{value}</p>}
      </CardContent>
    </Card>
  );
}

"use client";

import { use, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PageHeader } from "@/components/ui/page-header";
import { Skeleton } from "@/components/ui/skeleton";
import { useProduct, queryKeys } from "@/lib/queries";
import { exporterApi } from "@/lib/api";
import type { ProductDetail } from "@/lib/types";

export default function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return <EditContent id={decodeURIComponent(id)} />;
}

function EditContent({ id }: { id: string }) {
  const { data, isLoading } = useProduct(id);

  return (
    <>
      <Button asChild variant="ghost" size="sm" className="mb-3 -ml-2">
        <Link href="/exporter/products">
          <ArrowLeft className="size-4" /> Products
        </Link>
      </Button>
      <PageHeader title="Edit product" description={data?.product_name ?? ""} />
      {isLoading || !data ? (
        <Skeleton className="h-96 w-full" />
      ) : (
        <Card>
          <CardContent className="space-y-4 p-6">
            {/* Key on product id so the form initialises once per product */}
            <EditForm key={data.id} productId={id} initial={data} />
          </CardContent>
        </Card>
      )}
    </>
  );
}

function EditForm({ productId, initial }: { productId: string; initial: ProductDetail }) {
  const router = useRouter();
  const qc = useQueryClient();
  const [form, setForm] = useState({
    product_name: initial.product_name,
    description: initial.description,
    price: String(initial.price),
    min_order_quantity: String(initial.min_order_quantity),
    max_order_quantity: String(initial.max_order_quantity || ""),
  });

  const update = useMutation({
    mutationFn: () => exporterApi.updateProduct(productId, form),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.exporterProducts });
      toast.success("Product updated");
      router.push("/exporter/products");
    },
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        update.mutate();
      }}
      className="space-y-4"
    >
      <div className="space-y-2">
        <Label htmlFor="product_name">Name</Label>
        <Input id="product_name" value={form.product_name} onChange={(e) => setForm({ ...form, product_name: e.target.value })} required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea id="description" rows={5} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor="price">Price (NGN)</Label>
          <Input id="price" type="number" step="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="moq">Min order</Label>
          <Input id="moq" type="number" value={form.min_order_quantity} onChange={(e) => setForm({ ...form, min_order_quantity: e.target.value })} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="max">Max order</Label>
          <Input id="max" type="number" value={form.max_order_quantity} onChange={(e) => setForm({ ...form, max_order_quantity: e.target.value })} />
        </div>
      </div>
      <Button type="submit" loading={update.isPending}>
        Save changes
      </Button>
    </form>
  );
}

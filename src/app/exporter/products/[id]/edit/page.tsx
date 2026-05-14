"use client";

import { use, useEffect, useState } from "react";
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

export default function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return <EditContent id={decodeURIComponent(id)} />;
}

function EditContent({ id }: { id: string }) {
  const router = useRouter();
  const qc = useQueryClient();
  const { data, isLoading } = useProduct(id);
  const [form, setForm] = useState({
    product_name: "",
    description: "",
    price: "",
    min_order_quantity: "1",
    max_order_quantity: "",
  });

  useEffect(() => {
    if (data) {
      setForm({
        product_name: data.product_name,
        description: data.description,
        price: String(data.price),
        min_order_quantity: String(data.min_order_quantity),
        max_order_quantity: String(data.max_order_quantity || ""),
      });
    }
  }, [data]);

  const update = useMutation({
    mutationFn: () => exporterApi.updateProduct(id, form),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.exporterProducts });
      toast.success("Product updated");
      router.push("/exporter/products");
    },
  });

  return (
    <>
      <Button asChild variant="ghost" size="sm" className="mb-3 -ml-2">
        <Link href="/exporter/products">
          <ArrowLeft className="size-4" /> Products
        </Link>
      </Button>
      <PageHeader title="Edit product" description={data?.product_name ?? ""} />
      {isLoading ? (
        <Skeleton className="h-96 w-full" />
      ) : (
        <Card>
          <CardContent className="space-y-4 p-6">
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
          </CardContent>
        </Card>
      )}
    </>
  );
}

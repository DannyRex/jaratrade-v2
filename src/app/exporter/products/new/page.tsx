"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PageHeader } from "@/components/ui/page-header";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useCategories, queryKeys, useExporterStores } from "@/lib/queries";
import { exporterApi } from "@/lib/api";

export default function NewProductPage() {
  const router = useRouter();
  const qc = useQueryClient();
  const categories = useCategories();
  const stores = useExporterStores();

  const [form, setForm] = useState({
    product_name: "",
    description: "",
    category_id: "",
    store_id: "",
    price: "",
    currency: "NGN",
    min_order_quantity: "1",
    max_order_quantity: "",
    weight: "",
    short_video_link: "",
  });
  const [images, setImages] = useState<File[]>([]);

  const create = useMutation({
    mutationFn: async () => {
      const created = await exporterApi.addProduct({
        ...form,
        properties: { weight: form.weight },
      });
      // Actually upload the selected images. The file input collects them
      // but the old mutationFn never sent them - products were created with
      // an empty images array and the "saved after creation" hint was a lie.
      const newId = (created as { id?: string } | undefined)?.id;
      let imageError = false;
      if (newId && images.length > 0) {
        try {
          await exporterApi.addProductImages(newId, images);
        } catch {
          // Product creation already succeeded; don't lose it over an image
          // upload hiccup. Surface a warning so the exporter can retry from
          // the product's edit page.
          imageError = true;
        }
      }
      return { imageError };
    },
    onSuccess: ({ imageError }) => {
      qc.invalidateQueries({ queryKey: queryKeys.exporterProducts });
      if (imageError) {
        toast.warning("Product created — but the images didn't upload", {
          description: "Add them from the product's Edit page.",
        });
      } else {
        toast.success("Product created");
      }
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

      <PageHeader title="New product" description="Add a listing for importers to discover." />

      <form
        onSubmit={(e) => {
          e.preventDefault();
          create.mutate();
        }}
        className="grid gap-6 lg:grid-cols-[1fr_360px]"
      >
        <div className="space-y-4">
          <Card>
            <CardContent className="space-y-4 p-6">
              <h2 className="font-semibold">Product details</h2>
              <div className="space-y-2">
                <Label htmlFor="product_name">Product name</Label>
                <Input
                  id="product_name"
                  required
                  value={form.product_name}
                  onChange={(e) => setForm({ ...form, product_name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  required
                  rows={5}
                  placeholder="What it is, what makes it good, packaging, expiry, etc."
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="category_id">Category</Label>
                  <Select value={form.category_id} onValueChange={(v) => setForm({ ...form, category_id: v })}>
                    <SelectTrigger id="category_id">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {(categories.data?.rows ?? []).map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="store_id">Store</Label>
                  <Select value={form.store_id} onValueChange={(v) => setForm({ ...form, store_id: v })}>
                    <SelectTrigger id="store_id">
                      <SelectValue placeholder="Select store" />
                    </SelectTrigger>
                    <SelectContent>
                      {(stores.data?.data ?? []).map((s) => (
                        <SelectItem key={s.id} value={s.id}>
                          {s.market_name} - {s.address}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="space-y-4 p-6">
              <h2 className="font-semibold">Pricing</h2>
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="price">Price</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    required
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="currency">Currency</Label>
                  <Select value={form.currency} onValueChange={(v) => setForm({ ...form, currency: v })}>
                    <SelectTrigger id="currency">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="NGN">NGN</SelectItem>
                      <SelectItem value="GBP">GBP</SelectItem>
                      <SelectItem value="USD">USD</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="min_order_quantity">Min order quantity</Label>
                  <Input
                    id="min_order_quantity"
                    type="number"
                    required
                    value={form.min_order_quantity}
                    onChange={(e) => setForm({ ...form, min_order_quantity: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="max_order_quantity">Max order quantity (optional)</Label>
                  <Input
                    id="max_order_quantity"
                    type="number"
                    value={form.max_order_quantity}
                    onChange={(e) => setForm({ ...form, max_order_quantity: e.target.value })}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="space-y-4 p-6">
              <h2 className="font-semibold">Images</h2>
              <Input
                type="file"
                multiple
                accept="image/*"
                onChange={(e) => setImages(Array.from(e.target.files ?? []))}
              />
              <p className="text-xs text-muted-foreground">
                Upload up to 5 images (max 5MB each). Best size 1200×900.
              </p>
              {images.length > 0 ? (
                <p className="text-sm">{images.length} file(s) selected - saved after creation</p>
              ) : null}
            </CardContent>
          </Card>
        </div>

        <aside className="space-y-4 lg:sticky lg:top-20 lg:self-start">
          <Card>
            <CardContent className="space-y-3 p-6">
              <h2 className="font-semibold">Publishing</h2>
              <p className="text-sm text-muted-foreground">
                Once published, your product appears in the marketplace and category pages
                immediately.
              </p>
              {create.isError ? (
                <Alert variant="destructive">
                  <AlertDescription>{(create.error as Error).message}</AlertDescription>
                </Alert>
              ) : null}
              <Button type="submit" className="w-full" loading={create.isPending}>
                Publish product
              </Button>
              <Button asChild type="button" variant="outline" className="w-full">
                <Link href="/exporter/products">Cancel</Link>
              </Button>
            </CardContent>
          </Card>
        </aside>
      </form>
    </>
  );
}

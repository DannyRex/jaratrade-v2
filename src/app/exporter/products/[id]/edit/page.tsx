"use client";

import { use, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ArrowLeft, Upload } from "lucide-react";
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
import { parseProductImages, type ProductDetail } from "@/lib/types";

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
    <div className="space-y-6">
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

      {/* Images upload separately (immediate, not part of the Save form).
          Reads initial.images as a live prop so an upload reflects after
          the product query refetches. */}
      <div className="border-t pt-6">
        <ProductImages productId={productId} images={initial.images} />
      </div>
    </div>
  );
}

function ProductImages({ productId, images }: { productId: string; images: string }) {
  const qc = useQueryClient();
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const urls = parseProductImages(images);

  const handleFiles = async (fileList: FileList | null) => {
    const files = Array.from(fileList ?? []);
    if (files.length === 0) return;
    setUploading(true);
    try {
      await exporterApi.addProductImages(productId, files);
      toast.success(files.length === 1 ? "Image uploaded" : `${files.length} images uploaded`);
      qc.invalidateQueries({ queryKey: queryKeys.product(productId) });
      qc.invalidateQueries({ queryKey: queryKeys.exporterProducts });
    } catch (err) {
      toast.error("Upload failed", {
        description: err instanceof Error ? err.message : "Try again.",
      });
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-3">
      <div>
        <Label>Product images</Label>
        <p className="text-xs text-muted-foreground">JPG / PNG / WebP, up to 5MB each.</p>
      </div>
      {urls.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {urls.map((url) => (
            <Image
              key={url}
              src={url}
              alt="Product image"
              width={80}
              height={80}
              className="size-20 rounded-md border object-cover"
            />
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">No images yet.</p>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />
      <Button
        type="button"
        variant="outline"
        loading={uploading}
        onClick={() => inputRef.current?.click()}
      >
        <Upload className="size-4" /> Add images
      </Button>
    </div>
  );
}

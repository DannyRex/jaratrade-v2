"use client";

import { use, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Heart, MapPin, Minus, Plus, ShoppingCart, Store as StoreIcon, ShieldCheck, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { useProduct } from "@/lib/queries";
import { parseProductImages, parseProductProperties } from "@/lib/types";
import { formatMoney, formatDate } from "@/lib/format";
import { useCart } from "@/lib/cart-store";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return <ProductDetail id={decodeURIComponent(id)} />;
}

function ProductDetail({ id }: { id: string }) {
  const router = useRouter();
  const { data, isLoading, isError, refetch } = useProduct(id);
  const addToCart = useCart((s) => s.add);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);

  if (isError) {
    return (
      <div className="container mx-auto max-w-3xl px-4 py-20 text-center">
        <h1 className="text-xl font-semibold">Product not found</h1>
        <p className="mt-2 text-muted-foreground">
          We couldn&apos;t fetch that product. It may have been removed.
        </p>
        <div className="mt-4 flex justify-center gap-2">
          <Button variant="outline" onClick={() => refetch()}>
            Try again
          </Button>
          <Button asChild>
            <Link href="/products">Back to marketplace</Link>
          </Button>
        </div>
      </div>
    );
  }

  if (isLoading || !data) {
    return (
      <div className="container mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-2">
          <Skeleton className="aspect-square w-full rounded-lg" />
          <div className="space-y-4">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-12 w-32" />
            <Skeleton className="h-32 w-full" />
          </div>
        </div>
      </div>
    );
  }

  const images = parseProductImages(data.images);
  const imageList = images.filter((u) => /\.(jpg|jpeg|png|webp|gif|avif)(\?|$)/i.test(u));
  const fileAttachments = images.filter((u) => /\.(pdf|doc|docx)(\?|$)/i.test(u));
  const properties = parseProductProperties(data.properties);
  const cover = imageList[selectedImage] ?? imageList[0];

  const handleAddToCart = () => {
    addToCart(data, quantity);
    toast.success("Added to cart", {
      description: `${quantity} × ${data.product_name}`,
      action: {
        label: "View cart",
        onClick: () => router.push("/importer/cart"),
      },
    });
  };

  const moq = data.min_order_quantity || 1;
  const maxOrder = data.max_order_quantity > 0 ? data.max_order_quantity : 9999;

  return (
    <div className="container mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Breadcrumbs */}
      <nav aria-label="Breadcrumb" className="mb-6 flex items-center gap-1 text-sm text-muted-foreground">
        <Link href="/" className="hover:text-foreground">
          Home
        </Link>
        <span aria-hidden>/</span>
        <Link href="/products" className="hover:text-foreground">
          Marketplace
        </Link>
        <span aria-hidden>/</span>
        <span className="line-clamp-1 text-foreground">{data.product_name}</span>
      </nav>

      <div className="grid gap-10 lg:grid-cols-2">
        {/* Image gallery */}
        <div className="space-y-3">
          <div className="relative aspect-square overflow-hidden rounded-lg border bg-muted">
            {cover ? (
              <Image
                src={cover}
                alt={data.product_name}
                fill
                sizes="(min-width:1024px) 50vw, 100vw"
                priority
                className="object-cover"
              />
            ) : (
              <div className="absolute inset-0 grid place-items-center text-sm text-muted-foreground">
                No image available
              </div>
            )}
            {data.is_featured ? (
              <Badge className="absolute left-3 top-3" variant="accent">
                Featured
              </Badge>
            ) : null}
          </div>
          {imageList.length > 1 ? (
            <div className="grid grid-cols-5 gap-2">
              {imageList.map((src, i) => (
                <button
                  key={src}
                  type="button"
                  onClick={() => setSelectedImage(i)}
                  className={cn(
                    "relative aspect-square overflow-hidden rounded-md border-2 transition-colors",
                    selectedImage === i ? "border-primary" : "border-transparent hover:border-muted-foreground",
                  )}
                  aria-label={`View image ${i + 1}`}
                >
                  <Image src={src} alt="" fill sizes="80px" className="object-cover" />
                </button>
              ))}
            </div>
          ) : null}
        </div>

        {/* Details */}
        <div className="space-y-6">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">{data.name}</p>
            <h1 className="text-3xl font-bold tracking-tight md:text-4xl">{data.product_name}</h1>
            <div className="flex flex-wrap items-center gap-3 pt-1">
              <p className="text-3xl font-bold tracking-tight">
                {formatMoney(data.price, data.currency || "NGN")}
              </p>
              {data.has_tax ? <Badge variant="outline">Tax included</Badge> : null}
            </div>
          </div>

          <div className="space-y-2 rounded-lg border p-4">
            <h2 className="text-sm font-semibold">Order requirements</h2>
            <dl className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <dt className="text-muted-foreground">Min order</dt>
                <dd className="font-medium">{moq} units</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Max order</dt>
                <dd className="font-medium">{maxOrder === 9999 ? "-" : `${maxOrder} units`}</dd>
              </div>
              {Object.entries(properties).map(([k, v]) => (
                <div key={k}>
                  <dt className="text-muted-foreground capitalize">{k}</dt>
                  <dd className="font-medium">{String(v)}</dd>
                </div>
              ))}
            </dl>
          </div>

          {/* Quantity + actions */}
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="inline-flex items-center rounded-md border">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setQuantity((q) => Math.max(moq, q - 1))}
                aria-label="Decrease quantity"
              >
                <Minus className="size-4" />
              </Button>
              <input
                type="number"
                min={moq}
                max={maxOrder}
                value={quantity}
                onChange={(e) => {
                  const v = Number(e.target.value);
                  setQuantity(Number.isFinite(v) ? Math.max(moq, Math.min(maxOrder, v)) : moq);
                }}
                aria-label="Quantity"
                className="h-10 w-16 border-x bg-background text-center text-sm focus:outline-none"
              />
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setQuantity((q) => Math.min(maxOrder, q + 1))}
                aria-label="Increase quantity"
              >
                <Plus className="size-4" />
              </Button>
            </div>
            <Button size="lg" onClick={handleAddToCart} className="flex-1">
              <ShoppingCart className="size-4" /> Add to cart · {formatMoney(Number(data.price) * quantity, data.currency || "NGN")}
            </Button>
            <Button size="lg" variant="outline" aria-label="Save to favourites">
              <Heart className="size-4" />
            </Button>
          </div>

          {/* Trust signals */}
          <div className="space-y-3 rounded-lg bg-muted/40 p-4">
            <div className="flex items-start gap-3">
              <ShieldCheck className="mt-0.5 size-5 text-success" aria-hidden />
              <div>
                <p className="text-sm font-medium">Verified exporter</p>
                <p className="text-xs text-muted-foreground">
                  KYC, business registration and ID checks completed.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Truck className="mt-0.5 size-5 text-primary" aria-hidden />
              <div>
                <p className="text-sm font-medium">Logistics included</p>
                <p className="text-xs text-muted-foreground">
                  Pick a Jaratrade-vetted shipper or arrange your own at checkout.
                </p>
              </div>
            </div>
          </div>

          {/* Store info */}
          <Card className="p-4">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                <p className="text-xs uppercase tracking-wider text-muted-foreground">Sold by</p>
                <p className="text-sm font-semibold">{data.store}</p>
                <p className="text-xs text-muted-foreground inline-flex items-center gap-1">
                  <StoreIcon className="size-3" aria-hidden /> {data.market_name}
                  <span aria-hidden>·</span>
                  <MapPin className="size-3" aria-hidden /> {data.market_location}
                </p>
              </div>
              <Button asChild variant="outline" size="sm">
                <Link href={`/sellers/${encodeURIComponent(data.exporter_id)}`}>View shop</Link>
              </Button>
            </div>
          </Card>
        </div>
      </div>

      <Separator className="my-12" />

      <Tabs defaultValue="description">
        <TabsList>
          <TabsTrigger value="description">Description</TabsTrigger>
          <TabsTrigger value="specifications">Specifications</TabsTrigger>
          <TabsTrigger value="documents">Documents ({fileAttachments.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="description">
          <div className="prose prose-sm mt-4 max-w-3xl">
            <p className="whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
              {data.description || "No description provided."}
            </p>
          </div>
        </TabsContent>
        <TabsContent value="specifications">
          <dl className="mt-4 grid gap-3 sm:grid-cols-2">
            <Spec label="Category" value={data.name} />
            <Spec label="Currency" value={data.currency} />
            <Spec label="Featured" value={data.is_featured ? "Yes" : "No"} />
            <Spec label="Min order quantity" value={`${data.min_order_quantity} units`} />
            <Spec label="Max order quantity" value={`${data.max_order_quantity} units`} />
            <Spec label="Listed" value={formatDate(data.time_created)} />
            <Spec label="Last updated" value={formatDate(data.time_updated)} />
            <Spec label="Views" value={String(data.view_counts ?? 0)} />
            {Object.entries(properties).map(([k, v]) => (
              <Spec key={k} label={k} value={String(v)} />
            ))}
          </dl>
        </TabsContent>
        <TabsContent value="documents">
          <div className="mt-4 space-y-2">
            {fileAttachments.length === 0 ? (
              <p className="text-sm text-muted-foreground">No documents attached.</p>
            ) : (
              fileAttachments.map((url) => (
                <a
                  key={url}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between rounded-md border p-3 text-sm hover:bg-muted"
                >
                  <span>{url.split("/").pop()}</span>
                  <span className="text-xs text-muted-foreground">View →</span>
                </a>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function Spec({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3 border-b pb-2 text-sm">
      <dt className="capitalize text-muted-foreground">{label}</dt>
      <dd className="text-right font-medium">{value}</dd>
    </div>
  );
}

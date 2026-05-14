"use client";

import Link from "next/link";
import { useState } from "react";
import { Plus, Search, Edit2, Trash2, Package } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/data-table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useExporterProducts, queryKeys } from "@/lib/queries";
import { exporterApi } from "@/lib/api";
import { formatMoney, shortId } from "@/lib/format";

export default function ExporterProductsPage() {
  const { data, isLoading } = useExporterProducts();
  const [search, setSearch] = useState("");
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const qc = useQueryClient();

  const items = data?.data ?? [];
  const filtered = items.filter((p) =>
    !search ? true : p.product_name?.toLowerCase().includes(search.toLowerCase()),
  );

  const remove = useMutation({
    mutationFn: (id: string) => exporterApi.deleteProduct(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.exporterProducts });
      toast.success("Product deleted");
      setConfirmDelete(null);
    },
  });

  return (
    <>
      <PageHeader
        title="Products"
        description="Manage your listings, prices and stock."
        actions={
          <Button asChild>
            <Link href="/exporter/products/new">
              <Plus className="size-4" /> New product
            </Link>
          </Button>
        }
      />

      <div className="mb-4 max-w-sm">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
          <Input
            placeholder="Search products"
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<Package />}
          title={items.length === 0 ? "No products yet" : "No matches"}
          description={items.length === 0 ? "Add your first product to start selling." : "Try a different search term."}
          action={
            items.length === 0 ? (
              <Button asChild>
                <Link href="/exporter/products/new">Add product</Link>
              </Button>
            ) : null
          }
        />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Store</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Price</TableHead>
              <TableHead className="w-[120px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((p) => (
              <TableRow key={p.id}>
                <TableCell>
                  <p className="line-clamp-1 font-medium">{p.product_name}</p>
                  <p className="text-xs text-muted-foreground font-mono">{shortId(p.id)}</p>
                </TableCell>
                <TableCell className="text-sm">{p.category}</TableCell>
                <TableCell className="text-sm">{p.store}</TableCell>
                <TableCell>
                  <Badge variant={p.status === 1 ? "success" : "secondary"}>
                    {p.status === 1 ? "Live" : "Hidden"}
                  </Badge>
                </TableCell>
                <TableCell className="text-right tabular-nums">{formatMoney(p.price)}</TableCell>
                <TableCell>
                  <div className="flex justify-end gap-1">
                    <Button asChild variant="ghost" size="icon-sm" aria-label="Edit">
                      <Link href={`/exporter/products/${encodeURIComponent(p.id)}/edit`}>
                        <Edit2 className="size-3.5" />
                      </Link>
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      aria-label="Delete"
                      onClick={() => setConfirmDelete(p.id)}
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <Dialog open={Boolean(confirmDelete)} onOpenChange={(open) => !open && setConfirmDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete this product?</DialogTitle>
            <DialogDescription>
              This will remove the listing from the marketplace. Existing orders are not affected.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmDelete(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              loading={remove.isPending}
              onClick={() => confirmDelete && remove.mutate(confirmDelete)}
            >
              Delete product
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

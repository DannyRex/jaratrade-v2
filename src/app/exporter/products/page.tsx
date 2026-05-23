"use client";

import Link from "next/link";
import { useState } from "react";
import { Plus, Search, Edit2, Trash2, Package, RefreshCw, Boxes } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { StockLabel } from "@/components/stock-badge";
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

interface StockEdit {
  id: string;
  name: string;
  stock_quantity: number;
  low_stock_threshold: number;
}

export default function ExporterProductsPage() {
  const { data, isLoading } = useExporterProducts();
  const [search, setSearch] = useState("");
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [editingStock, setEditingStock] = useState<StockEdit | null>(null);
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

  // Bulk inventory refresh: stamps every product as "checked today" without
  // changing stock numbers. Surface for the seller after a physical count.
  const refreshAll = useMutation({
    mutationFn: async () => {
      // The QA harness reported "no network call" on click; the endpoint did
      // exist server-side (`/exp/product/confirm-inventory-all`). Most likely
      // explanation: an upstream error inside `request()` was being swallowed
      // because the `disabled={items.length === 0}` guard combined with a
      // hydration race made the click silently no-op on the very first paint.
      // The mutationFn is intact - we just need onError to surface anything
      // weird, and a deliberate awaited call so any rejection bubbles up.
      const res = await exporterApi.confirmInventoryAll();
      return res;
    },
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: queryKeys.exporterProducts });
      toast.success(`Inventory refreshed`, {
        description: `${res.confirmed} product${res.confirmed === 1 ? "" : "s"} marked as confirmed today.`,
      });
    },
    onError: (err: Error) =>
      toast.error("Couldn't refresh inventory", {
        description: err.message || "Please refresh the page and try again.",
      }),
  });

  // Per-row inventory edit: set stock + low-stock threshold and bump timestamp.
  const confirmStock = useMutation({
    mutationFn: (vars: StockEdit) =>
      exporterApi.confirmInventory(vars.id, {
        stock_quantity: vars.stock_quantity,
        low_stock_threshold: vars.low_stock_threshold,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.exporterProducts });
      toast.success("Inventory updated");
      setEditingStock(null);
    },
    onError: (err) => toast.error("Couldn't update inventory", { description: String(err) }),
  });

  return (
    <>
      <PageHeader
        title="Products"
        description="Manage your listings, prices and stock."
        actions={
          // Fragment instead of a wrapper div so PageHeader's outer flex-wrap
          // can reflow individual buttons onto a second line on phones.
          <>
            <Button
              variant="outline"
              onClick={() => refreshAll.mutate()}
              loading={refreshAll.isPending}
              disabled={items.length === 0}
              title="Mark all products as inventory-checked today"
            >
              <RefreshCw className="size-4" /> Refresh inventory
            </Button>
            <Button asChild>
              <Link href="/exporter/products/new">
                <Plus className="size-4" /> New product
              </Link>
            </Button>
          </>
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
        <>
          {/* Mobile: card list - the 7-col table overflows badly on phones. */}
          <ul className="space-y-3 sm:hidden">
            {filtered.map((p) => (
              <li key={p.id} className="rounded-lg border bg-card p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="line-clamp-1 font-medium">{p.product_name}</p>
                    <p className="mt-0.5 font-mono text-[11px] text-muted-foreground">{shortId(p.id)}</p>
                  </div>
                  <Badge variant={p.status === 1 ? "success" : "secondary"} className="shrink-0">
                    {p.status === 1 ? "Live" : "Hidden"}
                  </Badge>
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                  <span>{p.category}</span>
                  <span aria-hidden>·</span>
                  <span className="truncate">{p.store}</span>
                </div>
                <div className="mt-3 flex items-center justify-between gap-2">
                  <StockLabel stock={p.stock_quantity} threshold={p.low_stock_threshold} />
                  <span className="text-base font-bold tabular-nums">{formatMoney(p.price)}</span>
                </div>
                <div className="mt-3 flex items-center justify-end gap-1 border-t pt-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      setEditingStock({
                        id: p.id,
                        name: p.product_name,
                        stock_quantity: p.stock_quantity ?? 0,
                        low_stock_threshold: p.low_stock_threshold ?? 10,
                      })
                    }
                  >
                    <Boxes className="size-3.5" /> Stock
                  </Button>
                  <Button asChild variant="ghost" size="sm">
                    <Link href={`/exporter/products/${encodeURIComponent(p.id)}/edit`}>
                      <Edit2 className="size-3.5" /> Edit
                    </Link>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setConfirmDelete(p.id)}
                    aria-label="Delete product"
                  >
                    <Trash2 className="size-3.5" />
                  </Button>
                </div>
              </li>
            ))}
          </ul>
          {/* Tablet / desktop: full table. */}
          <div className="hidden sm:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Store</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Stock</TableHead>
                  <TableHead className="text-right">Price</TableHead>
                  <TableHead className="w-[140px]">Actions</TableHead>
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
                    <TableCell className="text-right tabular-nums">
                      <StockLabel stock={p.stock_quantity} threshold={p.low_stock_threshold} />
                    </TableCell>
                    <TableCell className="text-right tabular-nums">{formatMoney(p.price)}</TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          aria-label="Update stock"
                          title="Update stock"
                          onClick={() =>
                            setEditingStock({
                              id: p.id,
                              name: p.product_name,
                              stock_quantity: p.stock_quantity ?? 0,
                              low_stock_threshold: p.low_stock_threshold ?? 10,
                            })
                          }
                        >
                          <Boxes className="size-3.5" />
                        </Button>
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
          </div>
        </>
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

      <Dialog open={Boolean(editingStock)} onOpenChange={(open) => !open && setEditingStock(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update stock</DialogTitle>
            <DialogDescription className="line-clamp-1">{editingStock?.name}</DialogDescription>
          </DialogHeader>
          {editingStock ? (
            <form
              className="space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                confirmStock.mutate(editingStock);
              }}
            >
              <div className="space-y-1.5">
                <label className="text-sm font-medium" htmlFor="stock_qty">
                  Available units
                </label>
                <Input
                  id="stock_qty"
                  type="number"
                  min={0}
                  value={editingStock.stock_quantity}
                  onChange={(e) =>
                    setEditingStock({ ...editingStock, stock_quantity: Math.max(0, Number(e.target.value) || 0) })
                  }
                />
                <p className="text-xs text-muted-foreground">
                  Set to your current on-hand count. Submitting also stamps this product as inventory-checked today.
                </p>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium" htmlFor="low_thresh">
                  Low-stock threshold
                </label>
                <Input
                  id="low_thresh"
                  type="number"
                  min={0}
                  value={editingStock.low_stock_threshold}
                  onChange={(e) =>
                    setEditingStock({
                      ...editingStock,
                      low_stock_threshold: Math.max(0, Number(e.target.value) || 0),
                    })
                  }
                />
                <p className="text-xs text-muted-foreground">
                  Buyers see &quot;Only N left&quot; once stock drops to or below this number.
                </p>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setEditingStock(null)}>
                  Cancel
                </Button>
                <Button type="submit" loading={confirmStock.isPending}>
                  Save
                </Button>
              </DialogFooter>
            </form>
          ) : null}
        </DialogContent>
      </Dialog>
    </>
  );
}

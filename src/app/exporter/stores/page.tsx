"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, Store as StoreIcon, Trash2, MapPin } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useExporterStores, useMarkets, queryKeys } from "@/lib/queries";
import { exporterApi } from "@/lib/api";

export default function StoresPage() {
  const { data, isLoading } = useExporterStores();
  const [open, setOpen] = useState(false);

  const stores = data?.data ?? [];

  return (
    <>
      <PageHeader
        title="Stores"
        description="Each store is tied to a Nigerian market location."
        actions={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="size-4" /> New store
              </Button>
            </DialogTrigger>
            <NewStoreDialog onClose={() => setOpen(false)} />
          </Dialog>
        }
      />

      {isLoading ? (
        <div className="grid gap-3 sm:grid-cols-2">
          {Array.from({ length: 2 }).map((_, i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
      ) : stores.length === 0 ? (
        <EmptyState
          icon={<StoreIcon />}
          title="No stores yet"
          description="Open a store at one of our supported markets to start listing products."
        />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {stores.map((store) => (
            <StoreCard key={store.id} store={store} />
          ))}
        </div>
      )}
    </>
  );
}

function StoreCard({ store }: { store: { id: string; market_name: string; address: string; status: number; is_default?: number } }) {
  const qc = useQueryClient();
  const remove = useMutation({
    mutationFn: () => exporterApi.deleteStore(store.id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.exporterStores });
      toast.success("Store closed");
    },
  });

  return (
    <Card>
      <CardContent className="flex items-start justify-between gap-3 p-5">
        <div className="space-y-1">
          <p className="font-semibold">{store.market_name}</p>
          <p className="inline-flex items-center gap-1 text-sm text-muted-foreground">
            <MapPin className="size-3" /> {store.address}
          </p>
          {store.is_default ? <Badge variant="secondary">Default</Badge> : null}
        </div>
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label="Close store"
          loading={remove.isPending}
          onClick={() => remove.mutate()}
        >
          <Trash2 className="size-4" />
        </Button>
      </CardContent>
    </Card>
  );
}

function NewStoreDialog({ onClose }: { onClose: () => void }) {
  const markets = useMarkets();
  const qc = useQueryClient();
  const [marketId, setMarketId] = useState("");
  const [address, setAddress] = useState("");

  const create = useMutation({
    mutationFn: () => exporterApi.createStore({ market_id: marketId, address }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.exporterStores });
      toast.success("Store created");
      onClose();
    },
  });

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Open a new store</DialogTitle>
        <DialogDescription>Pick a market and your shop address within it.</DialogDescription>
      </DialogHeader>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          create.mutate();
        }}
        className="space-y-4"
      >
        <div className="space-y-2">
          <Label htmlFor="market">Market</Label>
          <Select value={marketId} onValueChange={setMarketId}>
            <SelectTrigger id="market">
              <SelectValue placeholder={markets.isLoading ? "Loading…" : "Select a market"} />
            </SelectTrigger>
            <SelectContent>
              {(markets.data?.rows ?? []).map((m) => (
                <SelectItem key={m.id} value={m.id}>
                  {m.name} - {m.location}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="address">Shop address</Label>
          <Input id="address" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Shop 34, Section B" required />
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" loading={create.isPending}>
            Create store
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
}

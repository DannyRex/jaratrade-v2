"use client";

import { useState } from "react";
import { Store } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { AdminCrud } from "@/components/admin-crud";
import {
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useAdminMarkets, queryKeys } from "@/lib/queries";
import { adminApi } from "@/lib/api";
import type { Market } from "@/lib/types";

export default function AdminMarketsPage() {
  const query = useAdminMarkets();
  return (
    <AdminCrud<Market>
      title="Markets"
      description="Nigerian market locations exporters can open shops in."
      query={query}
      queryKey={queryKeys.adminMarkets}
      emptyTitle="No markets yet"
      icon={<Store />}
      newLabel="Add market"
      columns={[
        { key: "name", label: "Name" },
        { key: "city", label: "City" },
        { key: "state", label: "State" },
        { key: "location", label: "Location" },
      ]}
      newDialog={(close) => <MarketDialog onClose={close} />}
      editDialog={(market, close) => <MarketDialog market={market} onClose={close} />}
      onDelete={(id) => adminApi.deleteMarket(id)}
    />
  );
}

function MarketDialog({ market, onClose }: { market?: Market; onClose: () => void }) {
  const qc = useQueryClient();
  const [form, setForm] = useState({
    name: market?.name ?? "",
    location: market?.location ?? "",
    lga: market?.lga ?? "",
    city: market?.city ?? "",
    state: market?.state ?? "",
    country: market?.country ?? "Nigeria",
  });

  const save = useMutation({
    mutationFn: () =>
      market ? adminApi.updateMarket(market.id, form) : adminApi.createMarket(form),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.adminMarkets });
      toast.success(market ? "Market updated" : "Market added");
      onClose();
    },
  });

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>{market ? "Edit market" : "Add market"}</DialogTitle>
        <DialogDescription>Markets group exporters by physical location.</DialogDescription>
      </DialogHeader>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          save.mutate();
        }}
        className="space-y-3"
      >
        <Field label="Name" id="name" value={form.name} onChange={(v) => setForm({ ...form, name: v })} />
        <Field label="Location" id="location" value={form.location} onChange={(v) => setForm({ ...form, location: v })} />
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="City" id="city" value={form.city} onChange={(v) => setForm({ ...form, city: v })} />
          <Field label="State" id="state" value={form.state} onChange={(v) => setForm({ ...form, state: v })} />
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="LGA" id="lga" value={form.lga} onChange={(v) => setForm({ ...form, lga: v })} />
          <Field label="Country" id="country" value={form.country} onChange={(v) => setForm({ ...form, country: v })} />
        </div>
        <DialogFooter>
          <Button variant="outline" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" loading={save.isPending}>
            {market ? "Save changes" : "Add market"}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
}

function Field({ label, id, value, onChange }: { label: string; id: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <Input id={id} value={value} onChange={(e) => onChange(e.target.value)} required />
    </div>
  );
}

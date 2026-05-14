"use client";

import { useState } from "react";
import { MapPin, Plus } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { importerApi } from "@/lib/api";
import { useImporterShipping, queryKeys } from "@/lib/queries";

export default function ShippingPage() {
  const { data, isLoading } = useImporterShipping();
  const addresses = Array.isArray(data) ? data : [];
  const [open, setOpen] = useState(false);

  return (
    <>
      <PageHeader
        title="Shipping addresses"
        description="Manage where your orders are delivered."
        actions={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="size-4" /> New address
              </Button>
            </DialogTrigger>
            <AddressDialog onClose={() => setOpen(false)} />
          </Dialog>
        }
      />

      {isLoading ? (
        <div className="grid gap-3 sm:grid-cols-2">
          {Array.from({ length: 2 }).map((_, i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
      ) : addresses.length === 0 ? (
        <EmptyState
          icon={<MapPin />}
          title="No shipping addresses"
          description="Add your first shipping address - you can set defaults at checkout."
        />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {addresses.map((addr) => (
            <Card key={addr.id}>
              <CardContent className="space-y-1 p-5">
                <div className="flex items-start justify-between">
                  <p className="font-medium">{addr.recipient_name}</p>
                  {addr.is_default ? <Badge variant="success">Default</Badge> : null}
                </div>
                <p className="text-sm text-muted-foreground">{addr.phone}</p>
                <p className="text-sm">{addr.address}</p>
                <p className="text-sm text-muted-foreground">
                  {[addr.city, addr.state, addr.country, addr.postal_code].filter(Boolean).join(", ")}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </>
  );
}

function AddressDialog({ onClose }: { onClose: () => void }) {
  const qc = useQueryClient();
  const [form, setForm] = useState({
    recipient_name: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    country: "United Kingdom",
    postal_code: "",
  });

  const create = useMutation({
    mutationFn: () => importerApi.addShipping({ ...form, is_default: 0 }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.importerShipping });
      toast.success("Address saved");
      onClose();
    },
  });

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Add shipping address</DialogTitle>
        <DialogDescription>This will be available at checkout.</DialogDescription>
      </DialogHeader>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          create.mutate();
        }}
        className="space-y-4"
      >
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Recipient" id="recipient_name" value={form.recipient_name} onChange={(v) => setForm({ ...form, recipient_name: v })} />
          <Field label="Phone" id="phone" type="tel" value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} />
        </div>
        <Field label="Address" id="address" value={form.address} onChange={(v) => setForm({ ...form, address: v })} />
        <div className="grid gap-3 sm:grid-cols-3">
          <Field label="City" id="city" value={form.city} onChange={(v) => setForm({ ...form, city: v })} />
          <Field label="County / State" id="state" value={form.state} onChange={(v) => setForm({ ...form, state: v })} />
          <Field label="Postal code" id="postal_code" value={form.postal_code} onChange={(v) => setForm({ ...form, postal_code: v })} />
        </div>
        <Field label="Country" id="country" value={form.country} onChange={(v) => setForm({ ...form, country: v })} />
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" loading={create.isPending}>
            Save address
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
}

function Field({
  label,
  id,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  id: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <Input id={id} type={type} value={value} onChange={(e) => onChange(e.target.value)} required />
    </div>
  );
}

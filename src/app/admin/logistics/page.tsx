"use client";

import { useState } from "react";
import { Truck } from "lucide-react";
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
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useAdminLogistics, queryKeys } from "@/lib/queries";
import { adminApi } from "@/lib/api";
import type { LogisticsCompany } from "@/lib/types";

export default function AdminLogisticsPage() {
  const query = useAdminLogistics();
  return (
    <AdminCrud<LogisticsCompany>
      title="Logistics partners"
      description="Companies that can fulfil shipments. They receive a signed link to update delivery status - no account needed."
      query={query}
      queryKey={queryKeys.adminLogistics}
      emptyTitle="No partners yet"
      icon={<Truck />}
      newLabel="Add partner"
      columns={[
        { key: "name", label: "Name" },
        { key: "email", label: "Email" },
        { key: "phone", label: "Phone" },
        { key: "description", label: "Description" },
      ]}
      newDialog={(close) => <LogisticsDialog onClose={close} />}
      editDialog={(c, close) => <LogisticsDialog company={c} onClose={close} />}
      onDelete={(id) => adminApi.deleteLogistics(id)}
    />
  );
}

function LogisticsDialog({ company, onClose }: { company?: LogisticsCompany; onClose: () => void }) {
  const qc = useQueryClient();
  const [form, setForm] = useState({
    name: company?.name ?? "",
    description: company?.description ?? "",
    email: company?.email ?? "",
    phone: company?.phone ?? "",
  });

  const save = useMutation({
    mutationFn: () =>
      company ? adminApi.updateLogistics(company.id, form) : adminApi.createLogistics(form),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.adminLogistics });
      toast.success(company ? "Partner updated" : "Partner added");
      onClose();
    },
  });

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>{company ? "Edit partner" : "Add logistics partner"}</DialogTitle>
        <DialogDescription>They&apos;ll appear at importer checkout when arrange-by-Jaratrade is selected.</DialogDescription>
      </DialogHeader>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          save.mutate();
        }}
        className="space-y-3"
      >
        <div className="space-y-2">
          <Label htmlFor="name">Company name</Label>
          <Input id="name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <Input id="phone" type="tel" required value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea id="description" rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        </div>
        <DialogFooter>
          <Button variant="outline" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" loading={save.isPending}>
            {company ? "Save changes" : "Add partner"}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
}

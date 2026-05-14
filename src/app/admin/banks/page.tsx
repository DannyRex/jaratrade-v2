"use client";

import { useState } from "react";
import { Banknote } from "lucide-react";
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
import { useAdminBanks, queryKeys } from "@/lib/queries";
import { adminApi } from "@/lib/api";
import type { Bank } from "@/lib/types";

export default function AdminBanksPage() {
  const query = useAdminBanks();
  return (
    <AdminCrud<Bank>
      title="Banks"
      description="Banks exporters can use for payouts."
      query={query}
      queryKey={queryKeys.adminBanks}
      emptyTitle="No banks"
      icon={<Banknote />}
      newLabel="Add bank"
      columns={[
        { key: "name", label: "Name" },
        { key: "country", label: "Country" },
        { key: "paystack_code", label: "Paystack code" },
        { key: "flutter_code", label: "Flutter code" },
      ]}
      newDialog={(close) => <BankDialog onClose={close} />}
      editDialog={(bank, close) => <BankDialog bank={bank} onClose={close} />}
      onDelete={(id) => adminApi.deleteBank(id)}
    />
  );
}

function BankDialog({ bank, onClose }: { bank?: Bank; onClose: () => void }) {
  const qc = useQueryClient();
  const [form, setForm] = useState({
    name: bank?.name ?? "",
    description: bank?.description ?? "",
    country: bank?.country ?? "Nigeria",
    paystack_code: bank?.paystack_code ?? "",
    flutter_code: bank?.flutter_code ?? "",
  });

  const save = useMutation({
    mutationFn: () => (bank ? adminApi.updateBank(bank.id, form) : adminApi.addBank(form)),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.adminBanks });
      toast.success(bank ? "Bank updated" : "Bank added");
      onClose();
    },
  });

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>{bank ? "Edit bank" : "Add bank"}</DialogTitle>
        <DialogDescription>Bank list shown to exporters during onboarding.</DialogDescription>
      </DialogHeader>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          save.mutate();
        }}
        className="space-y-3"
      >
        <Field label="Bank name" id="name" value={form.name} onChange={(v) => setForm({ ...form, name: v })} />
        <Field label="Country" id="country" value={form.country} onChange={(v) => setForm({ ...form, country: v })} />
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Paystack code" id="paystack_code" value={form.paystack_code} onChange={(v) => setForm({ ...form, paystack_code: v })} />
          <Field label="Flutterwave code" id="flutter_code" value={form.flutter_code} onChange={(v) => setForm({ ...form, flutter_code: v })} />
        </div>
        <DialogFooter>
          <Button variant="outline" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" loading={save.isPending}>
            {bank ? "Save changes" : "Add bank"}
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

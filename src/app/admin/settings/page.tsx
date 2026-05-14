"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PageHeader } from "@/components/ui/page-header";
import { adminApi } from "@/lib/api";

export default function AdminSettingsPage() {
  const [form, setForm] = useState({
    bank_name: "",
    account_name: "",
    account_number: "",
  });

  const save = useMutation({
    mutationFn: () => adminApi.updateCommissionAccount(form),
    onSuccess: () => toast.success("Commission account updated"),
  });

  return (
    <>
      <PageHeader title="Platform settings" description="The bank account where Jaratrade commissions are deposited." />

      <Card className="max-w-2xl">
        <CardContent className="p-6">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              save.mutate();
            }}
            className="space-y-4"
          >
            <h2 className="font-semibold">Commission account</h2>
            <p className="text-sm text-muted-foreground">
              Used by Flutterwave split-payment to credit the platform&apos;s commission share on
              each transaction.
            </p>
            <div className="space-y-2">
              <Label htmlFor="bank_name">Bank name</Label>
              <Input id="bank_name" required value={form.bank_name} onChange={(e) => setForm({ ...form, bank_name: e.target.value })} />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="account_name">Account name</Label>
                <Input id="account_name" required value={form.account_name} onChange={(e) => setForm({ ...form, account_name: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="account_number">Account number</Label>
                <Input id="account_number" required value={form.account_number} onChange={(e) => setForm({ ...form, account_number: e.target.value })} />
              </div>
            </div>
            <Button type="submit" loading={save.isPending}>
              Save commission account
            </Button>
          </form>
        </CardContent>
      </Card>
    </>
  );
}

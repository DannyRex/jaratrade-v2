"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PageHeader } from "@/components/ui/page-header";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useExporterProfile, queryKeys } from "@/lib/queries";
import { exporterApi } from "@/lib/api";

type Profile = {
  id?: string;
  business_name?: string;
  business_email?: string;
  business_address?: string;
  phone?: string;
  description?: string;
};

export default function ExporterProfilePage() {
  const profile = useExporterProfile();
  const data = (profile.data ?? {}) as Profile;

  return (
    <>
      <PageHeader title="Business profile" description="What buyers see when they visit your shop." />

      {profile.isLoading ? (
        <Card>
          <CardContent className="p-6">
            <Skeleton className="h-64 w-full" />
          </CardContent>
        </Card>
      ) : (
        // Key the editor on data identity so it re-mounts with fresh state
        // once the profile loads - avoids setState-in-effect.
        <ProfileEditor key={data.id ?? "loading"} initial={data} />
      )}
    </>
  );
}

function ProfileEditor({ initial }: { initial: Profile }) {
  const qc = useQueryClient();
  const [form, setForm] = useState({
    business_name: initial.business_name ?? "",
    business_email: initial.business_email ?? "",
    business_address: initial.business_address ?? "",
    phone: initial.phone ?? "",
    description: initial.description ?? "",
  });

  const update = useMutation({
    mutationFn: () => exporterApi.updateProfile(form),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.exporterProfile });
      toast.success("Profile updated");
    },
  });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    update.mutate();
  };

  return (
    <Tabs defaultValue="public">
      <TabsList>
        <TabsTrigger value="public">Public profile</TabsTrigger>
        <TabsTrigger value="contact">Contact info</TabsTrigger>
      </TabsList>

      <TabsContent value="public" className="mt-6">
        <Card>
          <CardContent className="p-6">
            <form onSubmit={submit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="business_name">Business name</Label>
                <Input id="business_name" value={form.business_name} onChange={(e) => setForm({ ...form, business_name: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Bio</Label>
                <Textarea id="description" rows={4} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              </div>
              <Button type="submit" loading={update.isPending}>
                Save profile
              </Button>
            </form>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="contact" className="mt-6">
        <Card>
          <CardContent className="p-6">
            <form onSubmit={submit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="business_email">Business email</Label>
                <Input id="business_email" type="email" value={form.business_email} onChange={(e) => setForm({ ...form, business_email: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="business_address">Business address</Label>
                <Input id="business_address" value={form.business_address} onChange={(e) => setForm({ ...form, business_address: e.target.value })} />
              </div>
              <Button type="submit" loading={update.isPending}>
                Save changes
              </Button>
            </form>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}

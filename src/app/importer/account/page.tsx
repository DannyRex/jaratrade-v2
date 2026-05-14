"use client";

import { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PageHeader } from "@/components/ui/page-header";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useImporterProfile, queryKeys } from "@/lib/queries";
import { useAuth } from "@/lib/auth-store";
import { importerApi } from "@/lib/api";
import { TwoFactorCard } from "@/components/two-factor-card";

export default function AccountPage() {
  const { data, isLoading } = useImporterProfile();
  const updateUser = useAuth((s) => s.updateUser);
  const qc = useQueryClient();

  const [form, setForm] = useState({
    firstname: "",
    lastname: "",
    phone: "",
    address: "",
    profile_name: "",
  });

  useEffect(() => {
    if (data && typeof data === "object") {
      const d = data as Record<string, string>;
      setForm({
        firstname: d.firstname ?? "",
        lastname: d.lastname ?? "",
        phone: d.phone ?? "",
        address: d.address ?? "",
        profile_name: d.profile_name ?? "",
      });
    }
  }, [data]);

  const update = useMutation({
    mutationFn: () => importerApi.updateProfile(form),
    onSuccess: () => {
      updateUser(form);
      qc.invalidateQueries({ queryKey: queryKeys.importerProfile });
      toast.success("Profile updated");
    },
  });

  return (
    <>
      <PageHeader
        title="Account"
        description="Manage your personal information and security."
        actions={<Badge variant="success">Verified</Badge>}
      />

      <Tabs defaultValue="profile">
        <TabsList>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="mt-6">
          <Card>
            <CardContent className="p-6">
              {isLoading ? (
                <div className="space-y-3">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ) : (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    update.mutate();
                  }}
                  className="space-y-4"
                >
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="First name" id="firstname" value={form.firstname} onChange={(v) => setForm({ ...form, firstname: v })} />
                    <Field label="Last name" id="lastname" value={form.lastname} onChange={(v) => setForm({ ...form, lastname: v })} />
                  </div>
                  <Field label="Phone" id="phone" type="tel" value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} />
                  <Field label="Address" id="address" value={form.address} onChange={(v) => setForm({ ...form, address: v })} />
                  <Field label="Profile name" id="profile_name" value={form.profile_name} onChange={(v) => setForm({ ...form, profile_name: v })} />
                  <Button type="submit" loading={update.isPending}>
                    Save changes
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="mt-6 space-y-4">
          <TwoFactorCard enabled={Boolean((data as { totp_enabled?: boolean })?.totp_enabled)} />
          <Card>
            <CardContent className="space-y-4 p-6">
              <h3 className="font-semibold">Password</h3>
              <p className="text-sm text-muted-foreground">
                Use the password reset flow to change your password - we&apos;ll email a secure link.
              </p>
              <Button variant="outline" asChild>
                <a href="/auth/forgot-password?role=importer">Reset password</a>
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="mt-6">
          <Card>
            <CardContent className="space-y-2 p-6">
              <h3 className="font-semibold">Email notifications</h3>
              <p className="text-sm text-muted-foreground">
                Coming soon - granular control over order updates, product alerts and security
                emails.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </>
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
      <Input id={id} type={type} value={value} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}

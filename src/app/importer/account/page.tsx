"use client";

import { useState } from "react";
import Link from "next/link";
import { MapPin } from "lucide-react";
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

type ProfileShape = {
  id?: string;
  firstname?: string;
  lastname?: string;
  phone?: string;
  profile_name?: string;
  totp_enabled?: boolean;
};

export default function AccountPage() {
  const { data, isLoading } = useImporterProfile();
  const profile = (data ?? {}) as ProfileShape;

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
        </TabsList>

        <TabsContent value="profile" className="mt-6 space-y-4">
          <Card>
            <CardContent className="p-6">
              {isLoading ? (
                <div className="space-y-3">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ) : (
                // Key the form on the profile identity so it re-mounts with
                // fresh state once the query resolves. Avoids setState-in-effect.
                <ProfileForm key={profile.id ?? "loading"} initial={profile} />
              )}
            </CardContent>
          </Card>

          {/* Shipping addresses are a separate concern from the profile row -
              they live in their own table with default-flag, recipient name,
              etc. Surface a clear link rather than show a single "Address"
              field that doesn't reflect the actual checkout pickers. */}
          <Card>
            <CardContent className="flex flex-wrap items-start justify-between gap-3 p-6">
              <div className="flex items-start gap-3">
                <MapPin className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden />
                <div>
                  <h3 className="font-semibold">Shipping addresses</h3>
                  <p className="text-sm text-muted-foreground">
                    Add, edit and set a default address for checkout. Saved addresses
                    auto-load on the cart.
                  </p>
                </div>
              </div>
              <Button asChild variant="outline">
                <Link href="/importer/shipping">Manage addresses</Link>
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="mt-6 space-y-4">
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
      </Tabs>
    </>
  );
}

function ProfileForm({ initial }: { initial: ProfileShape }) {
  const updateUser = useAuth((s) => s.updateUser);
  const qc = useQueryClient();
  const [form, setForm] = useState({
    firstname: initial.firstname ?? "",
    lastname: initial.lastname ?? "",
    phone: initial.phone ?? "",
    profile_name: initial.profile_name ?? "",
  });

  const update = useMutation({
    mutationFn: () => importerApi.updateProfile(form),
    onSuccess: () => {
      updateUser(form);
      qc.invalidateQueries({ queryKey: queryKeys.importerProfile });
      toast.success("Profile updated");
    },
  });

  return (
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
      <Field label="Profile name" id="profile_name" value={form.profile_name} onChange={(v) => setForm({ ...form, profile_name: v })} />
      <Button type="submit" loading={update.isPending}>
        Save changes
      </Button>
    </form>
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

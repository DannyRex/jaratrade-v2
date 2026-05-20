"use client";

import { useRef, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ShieldCheck, Clock, AlertTriangle, FileText, Upload, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { PageHeader } from "@/components/ui/page-header";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useExporterProfile, useBanks, queryKeys } from "@/lib/queries";
import { exporterApi } from "@/lib/api";
import { formatDate } from "@/lib/format";
import type { ExporterProfile } from "@/lib/types";

export default function ExporterProfilePage() {
  const profile = useExporterProfile();
  const data = (profile.data ?? {}) as ExporterProfile;

  return (
    <>
      <PageHeader title="Business profile" description="Complete your profile and submit it for verification." />

      {profile.isLoading ? (
        <Card>
          <CardContent className="p-6">
            <Skeleton className="h-64 w-full" />
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          <KycStatusBanner profile={data} />
          {/* The text-field form is keyed on data identity so it re-mounts
              with fresh useState once the profile loads (avoids
              setState-in-effect). `documents` is passed as a live prop
              (not frozen in useState) so uploads reflect immediately. */}
          <ProfileEditor
            key={data.id ?? "loading"}
            initial={data}
            documents={data.documents ?? {}}
          />
        </div>
      )}
    </>
  );
}

function KycStatusBanner({ profile }: { profile: ExporterProfile }) {
  const qc = useQueryClient();
  const kyc = profile.kyc_status ?? "pending";
  const submitted = Boolean(profile.kyc_submitted_at);
  const missing = profile.kyc_missing_fields ?? [];
  const canSubmit = missing.length === 0;

  const submit = useMutation({
    mutationFn: () => exporterApi.submitForReview(),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.exporterProfile });
      toast.success("Submitted for review", {
        description: "We'll email you once an admin has looked it over.",
      });
    },
    onError: (err: Error) =>
      toast.error("Couldn't submit", { description: err.message }),
  });

  // ── Approved ──────────────────────────────────────────────────────────
  if (kyc === "approved") {
    return (
      <Alert variant="success">
        <ShieldCheck className="size-4" />
        <AlertDescription>
          <strong>Verified.</strong> Your account is approved — your listings are live to buyers.
        </AlertDescription>
      </Alert>
    );
  }

  // ── Submitted, awaiting review ────────────────────────────────────────
  if (kyc === "pending" && submitted) {
    return (
      <Alert variant="info">
        <Clock className="size-4" />
        <AlertDescription>
          <strong>Awaiting review.</strong> You submitted on{" "}
          {formatDate(profile.kyc_submitted_at!)}. We&apos;ll email you once an admin
          has reviewed your application — usually within 1-2 business days.
        </AlertDescription>
      </Alert>
    );
  }

  // ── Rejected — can fix + resubmit ─────────────────────────────────────
  if (kyc === "rejected") {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="size-4" />
        <AlertDescription className="space-y-3">
          <div>
            <strong>Application not approved.</strong>
            {profile.kyc_rejection_reason ? (
              <span> Reason: {profile.kyc_rejection_reason}</span>
            ) : null}
          </div>
          <div>Update the details below, then resubmit.</div>
          {!canSubmit ? (
            <p className="text-xs">Still needed: {missing.join(", ")}</p>
          ) : null}
          <Button
            size="sm"
            onClick={() => submit.mutate()}
            loading={submit.isPending}
            disabled={!canSubmit}
          >
            Resubmit for review
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  // ── Incomplete — needs to complete + submit ───────────────────────────
  return (
    <Card className="border-primary/30 bg-primary/5">
      <CardContent className="space-y-3 p-5">
        <div className="flex items-start gap-3">
          <FileText className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden />
          <div className="space-y-1">
            <p className="font-semibold">Get your account verified</p>
            <p className="text-sm text-muted-foreground">
              {canSubmit
                ? "Your profile is complete. Submit it for review to start selling."
                : "Complete the Verification tab below, then submit your profile for admin review."}
            </p>
          </div>
        </div>
        {!canSubmit ? (
          <ul className="ml-8 list-disc space-y-0.5 text-xs text-muted-foreground">
            {missing.map((m) => (
              <li key={m}>{m}</li>
            ))}
          </ul>
        ) : null}
        <div className="ml-8">
          <Button
            size="sm"
            onClick={() => submit.mutate()}
            loading={submit.isPending}
            disabled={!canSubmit}
          >
            Submit for review
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function ProfileEditor({
  initial,
  documents,
}: {
  initial: ExporterProfile;
  documents: Record<string, string>;
}) {
  const qc = useQueryClient();
  const banks = useBanks();
  const [form, setForm] = useState({
    business_name: initial.business_name ?? "",
    business_email: initial.business_email ?? "",
    business_address: initial.business_address ?? "",
    phone: initial.phone ?? "",
    description: initial.description ?? "",
    // KYC fields
    business_reg_num: initial.business_reg_number ?? "",
    business_type: initial.business_type ?? "",
    business_country: initial.business_country ?? "",
    duration_in_business:
      initial.duration_in_business != null ? String(initial.duration_in_business) : "",
    annual_turnover: initial.annual_turnover ?? "",
    tin: initial.tin ?? "",
    bank_id: initial.bank_id ?? "",
    account_name: "",
    account_number: initial.account_number ?? "",
  });

  const set = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) =>
    setForm((prev) => ({ ...prev, [k]: v }));

  const update = useMutation({
    mutationFn: () => exporterApi.updateProfile(form),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.exporterProfile });
      toast.success("Profile saved");
    },
    onError: (err: Error) => toast.error("Couldn't save", { description: err.message }),
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
        <TabsTrigger value="verification">Verification</TabsTrigger>
      </TabsList>

      <TabsContent value="public" className="mt-6">
        <Card>
          <CardContent className="p-6">
            <form onSubmit={submit} className="space-y-4">
              <Field label="Business name" id="business_name" value={form.business_name} onChange={(v) => set("business_name", v)} />
              <div className="space-y-2">
                <Label htmlFor="description">Bio</Label>
                <Textarea id="description" rows={4} value={form.description} onChange={(e) => set("description", e.target.value)} />
              </div>
              <Button type="submit" loading={update.isPending}>Save profile</Button>
            </form>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="contact" className="mt-6">
        <Card>
          <CardContent className="p-6">
            <form onSubmit={submit} className="space-y-4">
              <Field label="Business email" id="business_email" type="email" value={form.business_email} onChange={(v) => set("business_email", v)} />
              <Field label="Phone" id="phone" type="tel" value={form.phone} onChange={(v) => set("phone", v)} />
              <Field label="Business address" id="business_address" value={form.business_address} onChange={(v) => set("business_address", v)} />
              <Button type="submit" loading={update.isPending}>Save changes</Button>
            </form>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="verification" className="mt-6 space-y-6">
        <Card>
          <CardContent className="p-6">
            <p className="mb-4 text-sm text-muted-foreground">
              These details are checked by our team before your account goes live.
              All fields are required to submit for review.
            </p>
            <form onSubmit={submit} className="space-y-4">
              <Field label="Business registration (CAC) number" id="business_reg_num" value={form.business_reg_num} onChange={(v) => set("business_reg_num", v)} />
              <Field label="Business type" id="business_type" value={form.business_type} onChange={(v) => set("business_type", v)} placeholder="e.g. food_beverage" />
              <Field label="Country" id="business_country" value={form.business_country} onChange={(v) => set("business_country", v)} placeholder="e.g. Nigeria" />
              <Field label="Years in business" id="duration_in_business" type="number" value={form.duration_in_business} onChange={(v) => set("duration_in_business", v)} placeholder="e.g. 4" />

              <div className="space-y-2">
                <Label htmlFor="annual_turnover">Annual turnover</Label>
                <Select value={form.annual_turnover} onValueChange={(v) => set("annual_turnover", v)}>
                  <SelectTrigger id="annual_turnover">
                    <SelectValue placeholder="Select a range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Under ₦1M">Under ₦1M</SelectItem>
                    <SelectItem value="₦1M – ₦5M">₦1M – ₦5M</SelectItem>
                    <SelectItem value="₦5M – ₦20M">₦5M – ₦20M</SelectItem>
                    <SelectItem value="₦20M – ₦100M">₦20M – ₦100M</SelectItem>
                    <SelectItem value="Over ₦100M">Over ₦100M</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Field label="Tax ID (TIN)" id="tin" value={form.tin} onChange={(v) => set("tin", v)} />

              <div className="space-y-2">
                <Label htmlFor="bank_id">Bank</Label>
                <Select value={form.bank_id} onValueChange={(v) => set("bank_id", v)}>
                  <SelectTrigger id="bank_id">
                    <SelectValue placeholder="Select your bank" />
                  </SelectTrigger>
                  <SelectContent>
                    {(banks.data?.rows ?? []).map((b) => (
                      <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Field label="Account name" id="account_name" value={form.account_name} onChange={(v) => set("account_name", v)} placeholder="Name on the bank account" />
              <Field label="Account number" id="account_number" value={form.account_number} onChange={(v) => set("account_number", v)} />

              <Button type="submit" loading={update.isPending}>Save verification details</Button>
            </form>
          </CardContent>
        </Card>

        {/* Document uploads - separate card. These upload immediately on
            file select (not on the form Save), and read their current
            state from the live `documents` prop so the upload reflects
            without a remount. */}
        <Card>
          <CardContent className="space-y-4 p-6">
            <div>
              <h3 className="font-semibold">Verification documents</h3>
              <p className="text-sm text-muted-foreground">
                Upload a clear photo or scan. Images (JPG/PNG/WebP) or PDF, up to 10MB.
              </p>
            </div>
            <DocumentUpload
              label="Means of ID"
              hint="Passport, NIN slip, or driver's licence"
              docType="id"
              currentUrl={documents.id}
              onUploaded={() => qc.invalidateQueries({ queryKey: queryKeys.exporterProfile })}
            />
            <DocumentUpload
              label="Business registration (CAC) certificate"
              hint="Optional but speeds up review"
              docType="cac"
              currentUrl={documents.cac}
              onUploaded={() => qc.invalidateQueries({ queryKey: queryKeys.exporterProfile })}
            />
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}

function DocumentUpload({
  label,
  hint,
  docType,
  currentUrl,
  onUploaded,
}: {
  label: string;
  hint: string;
  docType: "id" | "cac";
  currentUrl?: string;
  onUploaded: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const handleFile = async (file: File | undefined) => {
    if (!file) return;
    setUploading(true);
    try {
      await exporterApi.uploadKycDocument(docType, file);
      toast.success(`${label} uploaded`);
      onUploaded();
    } catch (err) {
      toast.error("Upload failed", {
        description: err instanceof Error ? err.message : "Try again.",
      });
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border p-3">
      <div className="min-w-0">
        <p className="flex items-center gap-1.5 text-sm font-medium">
          {label}
          {currentUrl ? <CheckCircle2 className="size-4 text-success" aria-label="Uploaded" /> : null}
        </p>
        {currentUrl ? (
          <a
            href={currentUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-primary hover:underline"
          >
            View uploaded document
          </a>
        ) : (
          <p className="text-xs text-muted-foreground">{hint}</p>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*,application/pdf"
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0])}
      />
      <Button
        type="button"
        variant="outline"
        size="sm"
        loading={uploading}
        onClick={() => inputRef.current?.click()}
      >
        <Upload className="size-4" /> {currentUrl ? "Replace" : "Upload"}
      </Button>
    </div>
  );
}

function Field({
  label,
  id,
  value,
  onChange,
  type = "text",
  placeholder,
}: {
  label: string;
  id: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <Input id={id} type={type} value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}

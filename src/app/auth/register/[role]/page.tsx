"use client";

import { use, useState } from "react";
import Link from "next/link";
import { useRouter, notFound } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { RoleTabs, getRoleMeta } from "@/components/role-tabs";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useMutation } from "@tanstack/react-query";
import { authApi } from "@/lib/api";
import { useBanks, useMarkets } from "@/lib/queries";
import type { Role } from "@/lib/types";

const validRoles: Role[] = ["importer", "exporter", "admin"];

export default function RegisterPage({ params }: { params: Promise<{ role: string }> }) {
  const { role } = use(params);
  if (!validRoles.includes(role as Role)) notFound();
  return <RegisterRouter role={role as Role} />;
}

function RegisterRouter({ role }: { role: Role }) {
  const meta = getRoleMeta(role);
  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-bold tracking-tight">Create your account</h1>
        <p className="text-sm text-muted-foreground">
          Sign up as {meta.label.toLowerCase()} on Jaratrade.
        </p>
      </div>

      <RoleTabs active={role} hrefBuilder={(r) => `/auth/register/${r}`} showAdmin={false} />

      {role === "importer" ? <ImporterRegister /> : null}
      {role === "exporter" ? <ExporterRegister /> : null}
      {role === "admin" ? <p className="text-center text-sm text-muted-foreground">Admin accounts are created internally.</p> : null}

      {role !== "admin" ? (
        <p className="text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link href={`/auth/login/${role}`} className="font-medium text-primary hover:underline">
            Log in
          </Link>
        </p>
      ) : null}
    </div>
  );
}

// ─────────────────────────── Importer registration ───────────────────────────

function ImporterRegister() {
  const router = useRouter();
  const [tab, setTab] = useState<"individual" | "business">("individual");
  const [form, setForm] = useState<Record<string, string>>({
    firstname: "",
    lastname: "",
    phone: "",
    email: "",
    password: "",
    profile_name: "",
    address: "",
    dob: "",
  });
  const [businessForm, setBusinessForm] = useState<Record<string, string>>({
    business_name: "",
    business_reg_num: "",
    business_email: "",
    business_address: "",
    valid_ID: "",
  });
  const [showPassword, setShowPassword] = useState(false);

  const register = useMutation({
    mutationFn: (payload: Record<string, unknown>) => authApi.registerImporter({ ...payload, type: tab }),
    onSuccess: () => {
      toast.success("Account created", {
        description: "Check your email to verify your address.",
      });
      router.push(`/auth/verify-email?email=${encodeURIComponent(form.email)}&role=importer`);
    },
  });

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = { ...form, ...(tab === "business" ? businessForm : {}) };
    register.mutate(payload);
  };

  return (
    <Tabs value={tab} onValueChange={(v) => setTab(v as "individual" | "business")}>
      <TabsList className="w-full">
        <TabsTrigger value="individual" className="flex-1">
          Individual
        </TabsTrigger>
        <TabsTrigger value="business" className="flex-1">
          Business
        </TabsTrigger>
      </TabsList>

      <TabsContent value={tab} forceMount>
        <form onSubmit={onSubmit} className="space-y-4 mt-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <FieldText id="firstname" label="First name" value={form.firstname} onChange={(v) => setForm({ ...form, firstname: v })} required />
            <FieldText id="lastname" label="Last name" value={form.lastname} onChange={(v) => setForm({ ...form, lastname: v })} required />
          </div>
          <FieldText id="email" label="Email" type="email" value={form.email} onChange={(v) => setForm({ ...form, email: v })} required autoComplete="email" />
          <FieldText id="phone" label="Phone" type="tel" value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} required autoComplete="tel" />
          <FieldText id="address" label={tab === "business" ? "Personal address" : "Home address / postcode"} value={form.address} onChange={(v) => setForm({ ...form, address: v })} required />
          <FieldText id="dob" label="Date of birth" type="date" value={form.dob} onChange={(v) => setForm({ ...form, dob: v })} required />
          <FieldText id="profile_name" label="Profile name" value={form.profile_name} onChange={(v) => setForm({ ...form, profile_name: v })} required />

          {tab === "business" ? (
            <>
              <hr className="my-2" />
              <p className="text-sm font-medium">Business details</p>
              <FieldText id="business_name" label="Business name" value={businessForm.business_name} onChange={(v) => setBusinessForm({ ...businessForm, business_name: v })} required />
              <FieldText id="business_reg_num" label="Business registration number" value={businessForm.business_reg_num} onChange={(v) => setBusinessForm({ ...businessForm, business_reg_num: v })} required />
              <FieldText id="business_email" label="Business email" type="email" value={businessForm.business_email} onChange={(v) => setBusinessForm({ ...businessForm, business_email: v })} required />
              <FieldText id="business_address" label="Business address" value={businessForm.business_address} onChange={(v) => setBusinessForm({ ...businessForm, business_address: v })} required />
              <FieldText id="valid_ID" label="Valid means of ID (passport / driving licence / national ID)" value={businessForm.valid_ID} onChange={(v) => setBusinessForm({ ...businessForm, valid_ID: v })} required />
            </>
          ) : null}

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                required
                minLength={8}
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
            <p className="text-xs text-muted-foreground">
              At least 8 characters. Mix letters, numbers and symbols.
            </p>
          </div>

          {register.isError ? (
            <Alert variant="destructive">
              <AlertDescription>{(register.error as Error).message}</AlertDescription>
            </Alert>
          ) : null}

          <Button type="submit" className="w-full" size="lg" loading={register.isPending}>
            Create account
          </Button>
        </form>
      </TabsContent>
    </Tabs>
  );
}

// ─────────────────────────── Exporter registration ───────────────────────────

function ExporterRegister() {
  const router = useRouter();
  const banks = useBanks();
  const markets = useMarkets();

  const [step, setStep] = useState(1);
  const [form, setForm] = useState<Record<string, string>>({
    firstname: "",
    lastname: "",
    phone: "",
    email: "",
    password: "",
    profile_name: "",
    address: "",
    dob: "",
    country: "",
    business_name: "",
    business_reg_num: "",
    business_email: "",
    business_address: "",
    duration_in_business: "",
    annual_turnover: "",
    valid_ID: "",
    business_type: "",
    market_locations: "",
    bank_id: "",
    account_name: "",
    account_number: "",
    TIN: "",
  });
  const [showPassword, setShowPassword] = useState(false);

  const setField = (key: string, value: string) => setForm({ ...form, [key]: value });

  const register = useMutation({
    mutationFn: (payload: Record<string, unknown>) => authApi.registerExporter({ ...payload, type: "business" }),
    onSuccess: () => {
      toast.success("Application submitted", {
        description: "Your account is under review. We'll email you once it's activated.",
      });
      router.push(`/auth/verify-email?email=${encodeURIComponent(form.email)}&role=exporter&review=1`);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (step < 3) {
      setStep(step + 1);
      return;
    }
    register.mutate(form);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <ol className="flex items-center gap-2 text-xs text-muted-foreground" aria-label="Progress">
        {[1, 2, 3].map((i) => (
          <li
            key={i}
            className={`flex flex-1 items-center gap-2 rounded-md border p-2 ${
              i === step ? "border-primary bg-primary/5 text-foreground" : i < step ? "border-success/30 bg-success/5 text-success" : ""
            }`}
          >
            <span className="grid size-5 place-items-center rounded-full bg-muted text-[10px] font-bold">{i}</span>
            <span className="font-medium">
              {i === 1 ? "Personal" : i === 2 ? "Business" : "Banking"}
            </span>
          </li>
        ))}
      </ol>

      {step === 1 ? (
        <>
          <div className="grid gap-4 sm:grid-cols-2">
            <FieldText id="firstname" label="First name" value={form.firstname} onChange={(v) => setField("firstname", v)} required />
            <FieldText id="lastname" label="Last name" value={form.lastname} onChange={(v) => setField("lastname", v)} required />
          </div>
          <FieldText id="email" label="Email" type="email" value={form.email} onChange={(v) => setField("email", v)} required autoComplete="email" />
          <FieldText id="phone" label="Phone" type="tel" value={form.phone} onChange={(v) => setField("phone", v)} required autoComplete="tel" />
          <FieldText id="dob" label="Date of birth" type="date" value={form.dob} onChange={(v) => setField("dob", v)} required />
          <FieldText id="address" label="Personal address" value={form.address} onChange={(v) => setField("address", v)} required />
          <FieldText id="country" label="Country" value={form.country} onChange={(v) => setField("country", v)} required />
          <FieldText id="profile_name" label="Profile name" value={form.profile_name} onChange={(v) => setField("profile_name", v)} required />

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                required
                minLength={8}
                value={form.password}
                onChange={(e) => setField("password", e.target.value)}
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
          </div>
        </>
      ) : null}

      {step === 2 ? (
        <>
          <FieldText id="business_name" label="Business name" value={form.business_name} onChange={(v) => setField("business_name", v)} required />
          <FieldText id="business_reg_num" label="CAC registration number" value={form.business_reg_num} onChange={(v) => setField("business_reg_num", v)} required />
          <FieldText id="business_email" label="Business email" type="email" value={form.business_email} onChange={(v) => setField("business_email", v)} required />
          <FieldText id="business_address" label="Business address" value={form.business_address} onChange={(v) => setField("business_address", v)} required />

          <div className="space-y-2">
            <Label htmlFor="business_type">Business type</Label>
            <Select value={form.business_type} onValueChange={(v) => setField("business_type", v)}>
              <SelectTrigger id="business_type">
                <SelectValue placeholder="Select a type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="food_beverage">Food & Beverage</SelectItem>
                <SelectItem value="personal_care">Personal Care</SelectItem>
                <SelectItem value="textiles">Textiles</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="annual_turnover">Annual turnover</Label>
            <Select value={form.annual_turnover} onValueChange={(v) => setField("annual_turnover", v)}>
              <SelectTrigger id="annual_turnover">
                <SelectValue placeholder="Select range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="100k_1m">₦100k – ₦1m</SelectItem>
                <SelectItem value="1m_5m">₦1m – ₦5m</SelectItem>
                <SelectItem value="5m_50m">₦5m – ₦50m</SelectItem>
                <SelectItem value="50m_plus">₦50m and above</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <FieldText id="duration_in_business" label="Years in business" type="number" value={form.duration_in_business} onChange={(v) => setField("duration_in_business", v)} required />

          <div className="space-y-2">
            <Label htmlFor="market_locations">Primary market</Label>
            <Select value={form.market_locations} onValueChange={(v) => setField("market_locations", v)}>
              <SelectTrigger id="market_locations">
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

          <FieldText id="valid_ID" label="Valid means of ID" value={form.valid_ID} onChange={(v) => setField("valid_ID", v)} required />
        </>
      ) : null}

      {step === 3 ? (
        <>
          <p className="text-sm text-muted-foreground">
            We&apos;ll send sales receipts to this account. Funds clear within 24h of order
            delivery.
          </p>
          <div className="space-y-2">
            <Label htmlFor="bank_id">Bank</Label>
            <Select value={form.bank_id} onValueChange={(v) => setField("bank_id", v)}>
              <SelectTrigger id="bank_id">
                <SelectValue placeholder={banks.isLoading ? "Loading…" : "Select your bank"} />
              </SelectTrigger>
              <SelectContent>
                {(banks.data?.rows ?? []).map((b) => (
                  <SelectItem key={b.id} value={b.id}>
                    {b.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <FieldText id="account_name" label="Account name" value={form.account_name} onChange={(v) => setField("account_name", v)} required />
          <FieldText id="account_number" label="Account number" value={form.account_number} onChange={(v) => setField("account_number", v)} required />
          <FieldText id="TIN" label="TIN (Tax Identification Number)" value={form.TIN} onChange={(v) => setField("TIN", v)} required />
        </>
      ) : null}

      {register.isError ? (
        <Alert variant="destructive">
          <AlertDescription>{(register.error as Error).message}</AlertDescription>
        </Alert>
      ) : null}

      <div className="flex gap-2">
        {step > 1 ? (
          <Button type="button" variant="outline" onClick={() => setStep(step - 1)} className="flex-1">
            Back
          </Button>
        ) : null}
        <Button type="submit" className="flex-1" loading={register.isPending}>
          {step < 3 ? "Continue" : "Submit application"}
        </Button>
      </div>
    </form>
  );
}

// ─────────────────────────── Field helper ───────────────────────────

function FieldText({
  id,
  label,
  value,
  onChange,
  type = "text",
  required,
  autoComplete,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  required?: boolean;
  autoComplete?: string;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        type={type}
        required={required}
        autoComplete={autoComplete}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

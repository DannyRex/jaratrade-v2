"use client";

/**
 * Register page - slimmed for fast signup.
 *
 * Importer + Exporter both collect the same six essentials upfront:
 *   first name, last name, email, phone, password, account type (ind/biz)
 *
 * Everything else (DOB, addresses, business reg, bank details, KYC docs,
 * verification IDs) moves into the post-signup profile flow where we show
 * a progress bar and prompt completion before the user can list a product
 * or be marked verified.
 */
import { use, useState } from "react";
import Link from "next/link";
import { useRouter, notFound } from "next/navigation";
import { Eye, EyeOff, ShieldCheck, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { RoleTabs, getRoleMeta } from "@/components/role-tabs";
import { authApi } from "@/lib/api";
import type { Role } from "@/lib/types";

const validRoles: Role[] = ["importer", "exporter", "admin"];

export default function RegisterPage({ params }: { params: Promise<{ role: string }> }) {
  const { role } = use(params);
  if (!validRoles.includes(role as Role)) notFound();
  return <RegisterRouter role={role as Role} />;
}

function RegisterRouter({ role }: { role: Role }) {
  const meta = getRoleMeta(role);
  if (role === "admin") {
    return (
      <div className="space-y-4 text-center">
        <h1 className="font-display text-3xl font-bold tracking-tight">Create account</h1>
        <p className="text-sm text-muted-foreground">
          Admin accounts are created internally. Talk to your team lead.
        </p>
      </div>
    );
  }
  return (
    <div className="space-y-7">
      <div className="space-y-2 text-center">
        <h1 className="font-display text-3xl font-bold tracking-tight sm:text-[2rem]">
          Create your account
        </h1>
        <p className="text-sm text-muted-foreground">
          Sign up as {meta.label.toLowerCase()} - takes about 60 seconds.
        </p>
      </div>

      <RoleTabs active={role} hrefBuilder={(r) => `/auth/register/${r}`} showAdmin={false} />

      <SignupForm role={role} />

      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link href={`/auth/login/${role}`} className="font-semibold text-primary hover:underline">
          Log in
        </Link>
      </p>
    </div>
  );
}

interface SignupState {
  firstname: string;
  lastname: string;
  email: string;
  phone: string;
  password: string;
}

function SignupForm({ role }: { role: Role }) {
  const router = useRouter();
  const [form, setForm] = useState<SignupState>({
    firstname: "",
    lastname: "",
    email: "",
    phone: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);

  const register = useMutation({
    mutationFn: (payload: SignupState) => {
      // The legacy backend register endpoints accept these essential fields
      // plus a few derived ones. We auto-derive profile_name from the email
      // local part - users can edit it later in profile.
      const profile_name = payload.email.split("@")[0];
      const body: Record<string, unknown> = {
        ...payload,
        profile_name,
        // We still set `type` because the legacy server splits individual /
        // business onboarding paths. Defaulting to "individual" - exporter
        // accounts upgrade to "business" once they complete the business
        // profile section.
        type: "individual",
      };
      return role === "importer"
        ? authApi.registerImporter(body)
        : authApi.registerExporter(body);
    },
    onSuccess: () => {
      toast.success("Account created", {
        description:
          role === "exporter"
            ? "Verify your email, then complete your business profile and submit it for review."
            : "Verify your email to start sourcing.",
      });
      router.push(
        `/auth/verify-email?email=${encodeURIComponent(form.email)}&role=${role}`,
      );
    },
  });

  const update = <K extends keyof SignupState>(key: K, value: SignupState[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    register.mutate(form);
  };

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field
          id="firstname"
          label="First name"
          value={form.firstname}
          onChange={(v) => update("firstname", v)}
          autoComplete="given-name"
          required
        />
        <Field
          id="lastname"
          label="Last name"
          value={form.lastname}
          onChange={(v) => update("lastname", v)}
          autoComplete="family-name"
          required
        />
      </div>
      <Field
        id="email"
        label="Email"
        type="email"
        value={form.email}
        onChange={(v) => update("email", v)}
        autoComplete="email"
        required
      />
      <Field
        id="phone"
        label="Phone"
        type="tel"
        value={form.phone}
        onChange={(v) => update("phone", v)}
        autoComplete="tel"
        required
      />

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
            onChange={(e) => update("password", e.target.value)}
            className="h-11 pr-10"
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            aria-label={showPassword ? "Hide password" : "Show password"}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
          >
            {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </button>
        </div>
        <p className="text-xs text-muted-foreground">8+ characters. Mix letters, numbers, symbols.</p>
      </div>

      {register.isError ? (
        <Alert variant="destructive">
          <AlertDescription>{(register.error as Error).message}</AlertDescription>
        </Alert>
      ) : null}

      <Button type="submit" className="h-11 w-full rounded-full text-base font-semibold shadow-[var(--shadow-brand)]" size="lg" loading={register.isPending}>
        Create account
      </Button>

      {/* What happens next */}
      <div className="rounded-2xl border border-border/70 bg-muted/30 p-4">
        <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-primary">
          <Sparkles className="size-3.5" aria-hidden />
          What happens next
        </p>
        <ol className="mt-3 space-y-2 text-sm text-foreground/85">
          <li className="flex gap-2.5">
            <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-primary/10 text-[10px] font-bold text-primary">1</span>
            <span>Verify your email (we send a link as soon as you submit).</span>
          </li>
          <li className="flex gap-2.5">
            <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-primary/10 text-[10px] font-bold text-primary">2</span>
            <span>
              Complete your profile - add{" "}
              {role === "exporter" ? "business details, KYC docs and bank account" : "shipping address and payment method"}
              {" "}from your dashboard at your own pace.
            </span>
          </li>
          {role === "exporter" ? (
            <li className="flex gap-2.5">
              <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-success/15 text-success">
                <ShieldCheck className="size-3" aria-hidden />
              </span>
              <span>
                Once you submit for review, admin verifies within 48 hours - then your listings go public.
              </span>
            </li>
          ) : null}
        </ol>
      </div>
    </form>
  );
}

function Field({
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
        className="h-11"
      />
    </div>
  );
}

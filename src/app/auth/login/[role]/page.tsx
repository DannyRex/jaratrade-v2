"use client";

import { use, useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams, notFound } from "next/navigation";
import { Eye, EyeOff, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { RoleTabs, getRoleMeta } from "@/components/role-tabs";
import { useLogin, useLoginWith2FA } from "@/lib/queries";
import type { Role } from "@/lib/types";

const validRoles: Role[] = ["importer", "exporter", "admin"];

export default function LoginPage({ params }: { params: Promise<{ role: string }> }) {
  const { role } = use(params);
  if (!validRoles.includes(role as Role)) notFound();
  return (
    <Suspense fallback={null}>
      <LoginForm role={role as Role} />
    </Suspense>
  );
}

function LoginForm({ role }: { role: Role }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next");
  const meta = getRoleMeta(role);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [needsTwoFactor, setNeedsTwoFactor] = useState(false);

  const login = useLogin();
  const login2fa = useLoginWith2FA();

  const successDest =
    next ?? (role === "admin" ? "/admin" : role === "exporter" ? "/exporter" : "/importer/orders");

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (needsTwoFactor) {
      login2fa.mutate(
        { role, email: email.trim(), password, code: code.trim() },
        { onSuccess: () => router.push(successDest) },
      );
      return;
    }
    login.mutate(
      { role, email: email.trim(), password },
      {
        onSuccess: (data) => {
          if ("requires_2fa" in data && data.requires_2fa) {
            setNeedsTwoFactor(true);
            return;
          }
          // The API gates login on email verification. If the account isn't
          // verified, it auto-sends a fresh code and tells us to redirect
          // the user to the verify page instead of issuing a token.
          if ("requires_verification" in data && data.requires_verification) {
            router.push(
              `/auth/verify-email?email=${encodeURIComponent(email.trim())}&role=${role}`,
            );
            return;
          }
          router.push(successDest);
        },
      },
    );
  };

  if (needsTwoFactor) {
    return (
      <div className="space-y-6">
        <div className="space-y-3 text-center">
          <div className="mx-auto grid size-14 place-items-center rounded-full bg-primary/10 text-primary">
            <ShieldCheck className="size-6" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Two-factor required</h1>
          <p className="text-sm text-muted-foreground">
            Open your authenticator app and enter the 6-digit code for{" "}
            <span className="font-medium text-foreground">{email}</span>.
          </p>
        </div>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="code">Authentication code</Label>
            <Input
              id="code"
              autoComplete="one-time-code"
              inputMode="numeric"
              maxLength={6}
              required
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
              autoFocus
            />
          </div>
          {login2fa.isError ? (
            <Alert variant="destructive">
              <AlertDescription>{(login2fa.error as Error).message}</AlertDescription>
            </Alert>
          ) : null}
          <Button type="submit" className="w-full" size="lg" loading={login2fa.isPending} disabled={code.length !== 6}>
            Verify and log in
          </Button>
          <Button type="button" variant="ghost" className="w-full" onClick={() => { setNeedsTwoFactor(false); setCode(""); }}>
            Back
          </Button>
        </form>
      </div>
    );
  }

  return (
    <div className="space-y-7">
      <div className="space-y-2 text-center">
        <h1 className="font-display text-3xl font-bold tracking-tight sm:text-[2rem]">
          Welcome back
        </h1>
        <p className="text-sm text-muted-foreground">
          Log in as {meta.label.toLowerCase()} to continue.
        </p>
      </div>

      <RoleTabs active={role} hrefBuilder={(r) => `/auth/login/${r}`} />

      <form onSubmit={onSubmit} className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            required
            placeholder="you@company.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="h-11"
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
            {role !== "admin" ? (
              <Link
                href={`/auth/forgot-password?role=${role}`}
                className="text-xs font-semibold text-primary hover:underline"
              >
                Forgot password?
              </Link>
            ) : null}
          </div>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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
        </div>

        {login.isError ? (
          <Alert variant="destructive">
            <AlertDescription>{(login.error as Error).message}</AlertDescription>
          </Alert>
        ) : null}

        <Button
          type="submit"
          className="h-11 w-full rounded-full text-base font-semibold shadow-[var(--shadow-brand)]"
          size="lg"
          loading={login.isPending}
        >
          Log in
        </Button>
      </form>

      {role !== "admin" ? (
        <p className="text-center text-sm text-muted-foreground">
          New to Jaratrade?{" "}
          <Link href={`/auth/register/${role}`} className="font-semibold text-primary hover:underline">
            Create an account
          </Link>
        </p>
      ) : null}
    </div>
  );
}

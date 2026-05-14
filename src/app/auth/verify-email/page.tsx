"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Mail } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authApi } from "@/lib/api";
import type { Role } from "@/lib/types";
import { toast } from "sonner";

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={null}>
      <VerifyEmailContent />
    </Suspense>
  );
}

function VerifyEmailContent() {
  const router = useRouter();
  const params = useSearchParams();
  const email = params.get("email") ?? "";
  const role = (params.get("role") as Role) || "importer";
  const reviewMode = params.get("review") === "1";
  const [code, setCode] = useState("");

  const verify = useMutation({
    mutationFn: (c: string) => authApi.verifyAccount(role as "importer" | "exporter", c),
    onSuccess: () => {
      toast.success("Email verified");
      router.push(`/auth/login/${role}`);
    },
  });

  const resend = useMutation({
    mutationFn: () => authApi.requestVerificationEmail(role as "importer" | "exporter", email),
    onSuccess: () => toast.success("Verification email sent - check your inbox."),
  });

  if (reviewMode) {
    return (
      <div className="space-y-6 text-center">
        <div className="mx-auto grid size-14 place-items-center rounded-full bg-warning/15 text-warning">
          <Mail className="size-6" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-bold tracking-tight">Application under review</h1>
          <p className="text-sm text-muted-foreground">
            Thanks for applying - your business details are being verified. We&apos;ll email{" "}
            <span className="font-medium text-foreground">{email}</span> once your account is
            activated. This usually takes 1–2 business days.
          </p>
        </div>
        <Button asChild variant="outline" className="w-full">
          <Link href="/">Back to homepage</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <div className="mx-auto grid size-14 place-items-center rounded-full bg-primary/10 text-primary">
          <Mail className="size-6" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight">Verify your email</h1>
        <p className="text-sm text-muted-foreground">
          We sent a verification link to{" "}
          <span className="font-medium text-foreground">{email || "your inbox"}</span>. Paste the
          code below or click the link in the email.
        </p>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (code.trim()) verify.mutate(code.trim());
        }}
        className="space-y-4"
      >
        <div className="space-y-2">
          <Label htmlFor="code">Verification code</Label>
          <Input
            id="code"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Paste the code from your email"
            required
          />
        </div>
        {verify.isError ? (
          <Alert variant="destructive">
            <AlertDescription>{(verify.error as Error).message}</AlertDescription>
          </Alert>
        ) : null}
        <Button type="submit" className="w-full" loading={verify.isPending}>
          Verify email
        </Button>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        Didn&apos;t get the email?{" "}
        <button
          type="button"
          onClick={() => resend.mutate()}
          disabled={resend.isPending || !email}
          className="font-medium text-primary hover:underline disabled:opacity-50"
        >
          {resend.isPending ? "Sending…" : "Resend"}
        </button>
      </p>
    </div>
  );
}

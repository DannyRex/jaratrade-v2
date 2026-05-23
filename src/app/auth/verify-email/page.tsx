"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
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

// Normalise an OTP input: strip everything that isn't a digit, cap at 6
// chars. Lets a paste of "123 456" or "123-456" still work, and ignores
// stray spaces the email client / clipboard might inject.
function onlyDigits(s: string): string {
  return s.replace(/\D/g, "").slice(0, 6);
}

function VerifyEmailContent() {
  const router = useRouter();
  const params = useSearchParams();
  const email = params.get("email") ?? "";
  const role = (params.get("role") as Role) || "importer";
  const codeFromUrl = onlyDigits(params.get("code") ?? "");
  const [code, setCode] = useState(codeFromUrl);

  const verify = useMutation({
    mutationFn: (c: string) =>
      authApi.verifyAccount(role as "importer" | "exporter", email, c),
    onSuccess: () => {
      toast.success("Email verified");
      router.push(`/auth/login/${role}`);
    },
  });

  // Auto-verify when the user lands here from the email link (URL has
  // ?code=NNNNNN&email=...). Without this they'd see a populated form
  // and have to click "Verify" themselves even though their click came
  // from the email button which is supposed to be one-tap.
  //
  // Guard with a ref + a module-level sentinel so React strict-mode's
  // double-mount can't fire it twice. The backend is also idempotent
  // (re-verifying a verified user returns success rather than "expired")
  // so even if the guard fails we don't regress the UX.
  const autoTried = useRef(false);
  useEffect(() => {
    if (autoTried.current) return;
    if (!codeFromUrl || codeFromUrl.length !== 6 || !email) return;
    autoTried.current = true;
    verify.mutate(codeFromUrl);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [codeFromUrl, email]);

  // Auto-fire when the user types the 6th digit manually. Saves a
  // second click on the "Verify" button - the de-facto modern OTP UX.
  useEffect(() => {
    if (code.length !== 6) return;
    if (verify.isPending || verify.isSuccess) return;
    if (!email) return;
    verify.mutate(code);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code, email]);

  const resend = useMutation({
    mutationFn: () => authApi.requestVerificationEmail(role as "importer" | "exporter", email),
    onSuccess: () => toast.success("Verification email sent - check your inbox."),
  });

  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <div className="mx-auto grid size-14 place-items-center rounded-full bg-primary/10 text-primary">
          <Mail className="size-6" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight">Verify your email</h1>
        <p className="text-sm text-muted-foreground">
          We sent a 6-digit code to{" "}
          <span className="font-medium text-foreground">{email || "your inbox"}</span>. Enter it
          below, or click the link in the email.
        </p>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (code.length === 6) verify.mutate(code);
        }}
        className="space-y-4"
      >
        <div className="space-y-2">
          <Label htmlFor="code" className="sr-only">
            6-digit verification code
          </Label>
          {/* Mobile keyboards open the numeric pad when inputMode="numeric"
              + pattern="\d*". autoComplete="one-time-code" lets iOS surface
              the OTP from the verification email as a keyboard suggestion. */}
          <Input
            id="code"
            value={code}
            onChange={(e) => setCode(onlyDigits(e.target.value))}
            placeholder="••••••"
            inputMode="numeric"
            pattern="\d*"
            autoComplete="one-time-code"
            maxLength={6}
            autoFocus
            className="h-14 text-center font-mono text-3xl tracking-[0.6em] tabular-nums"
            required
          />
        </div>
        {verify.isError ? (
          <Alert variant="destructive">
            <AlertDescription>{(verify.error as Error).message}</AlertDescription>
          </Alert>
        ) : null}
        <Button
          type="submit"
          className="w-full"
          loading={verify.isPending}
          disabled={code.length !== 6}
        >
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

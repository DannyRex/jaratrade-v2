"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { CheckCircle2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { publicApi } from "@/lib/api";
import type { Role } from "@/lib/types";

export default function ForgotPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ForgotPasswordContent />
    </Suspense>
  );
}

function ForgotPasswordContent() {
  const params = useSearchParams();
  const role = (params.get("role") as Role) || "importer";
  const [email, setEmail] = useState("");

  const reset = useMutation({
    mutationFn: () => publicApi.resetPassword(email.trim(), role as "importer" | "exporter"),
  });

  if (reset.isSuccess) {
    return (
      <div className="space-y-6 text-center">
        <div className="mx-auto grid size-14 place-items-center rounded-full bg-success/15 text-success">
          <CheckCircle2 className="size-6" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-bold tracking-tight">Check your email</h1>
          <p className="text-sm text-muted-foreground">
            If an account exists for{" "}
            <span className="font-medium text-foreground">{email}</span>, we&apos;ve sent a link to
            reset your password.
          </p>
        </div>
        <Button asChild variant="outline" className="w-full">
          <Link href={`/auth/login/${role}`}>Back to log in</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-bold tracking-tight">Reset your password</h1>
        <p className="text-sm text-muted-foreground">
          Enter the email associated with your account and we&apos;ll send you a reset link.
        </p>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          reset.mutate();
        }}
        className="space-y-4"
      >
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        {reset.isError ? (
          <Alert variant="destructive">
            <AlertDescription>{(reset.error as Error).message}</AlertDescription>
          </Alert>
        ) : null}
        <Button type="submit" className="w-full" loading={reset.isPending}>
          Send reset link
        </Button>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        Remembered it?{" "}
        <Link href={`/auth/login/${role}`} className="font-medium text-primary hover:underline">
          Back to log in
        </Link>
      </p>
    </div>
  );
}

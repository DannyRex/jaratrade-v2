"use client";

import { useState } from "react";
import { ShieldCheck, KeyRound, Copy, Check } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { authApi } from "@/lib/api";

/**
 * Two-factor authentication management. Drops into any role's account page.
 * Renders the TOTP provisioning URI as a QR via Google's chart API (no extra deps).
 */
export function TwoFactorCard({ enabled }: { enabled: boolean }) {
  const [enrollState, setEnrollState] = useState<{ secret: string; uri: string } | null>(null);
  const [code, setCode] = useState("");
  const [confirmStep, setConfirmStep] = useState(false);
  const [disableOpen, setDisableOpen] = useState(false);
  const [disablePassword, setDisablePassword] = useState("");
  const [copied, setCopied] = useState(false);

  const enroll = useMutation({
    mutationFn: () => authApi.twoFactorEnroll(),
    onSuccess: (data) => {
      setEnrollState({ secret: data.secret, uri: data.uri });
      setConfirmStep(true);
    },
  });

  const confirm = useMutation({
    mutationFn: () => authApi.twoFactorConfirm(code),
    onSuccess: () => {
      toast.success("Two-factor authentication enabled");
      setEnrollState(null);
      setConfirmStep(false);
      setCode("");
      // Hard reload so the auth-store reflects the new totp_enabled state
      window.location.reload();
    },
  });

  const disable = useMutation({
    mutationFn: () => authApi.twoFactorDisable(disablePassword),
    onSuccess: () => {
      toast.success("Two-factor authentication disabled");
      setDisableOpen(false);
      setDisablePassword("");
      window.location.reload();
    },
  });

  const qrUrl = enrollState
    ? `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(enrollState.uri)}`
    : null;

  return (
    <Card>
      <CardContent className="space-y-4 p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="flex items-center gap-2 font-semibold">
              <ShieldCheck className="size-4 text-primary" /> Two-factor authentication
              {enabled ? <Badge variant="success">enabled</Badge> : <Badge variant="outline">off</Badge>}
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Add a 6-digit authenticator code on top of your password. Protects against stolen passwords.
            </p>
          </div>
          {!enabled && !confirmStep ? (
            <Button onClick={() => enroll.mutate()} loading={enroll.isPending}>
              <KeyRound className="size-4" /> Enable
            </Button>
          ) : null}
          {enabled ? (
            <Button variant="outline" onClick={() => setDisableOpen(true)}>
              Disable
            </Button>
          ) : null}
        </div>

        {confirmStep && enrollState ? (
          <div className="space-y-4 rounded-md border p-4">
            <div className="flex flex-col gap-4 sm:flex-row">
              {qrUrl ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img src={qrUrl} alt="2FA QR code" width={200} height={200} className="rounded-md border bg-white p-2" />
              ) : null}
              <div className="flex-1 space-y-2">
                <p className="text-sm">
                  Scan this QR with your authenticator app (1Password, Authy, Google Authenticator),
                  or paste the secret manually:
                </p>
                <div className="flex items-center gap-2">
                  <code className="flex-1 break-all rounded-md bg-muted px-3 py-2 font-mono text-xs">
                    {enrollState.secret}
                  </code>
                  <Button
                    variant="outline"
                    size="icon"
                    aria-label="Copy secret"
                    onClick={async () => {
                      await navigator.clipboard.writeText(enrollState.secret);
                      setCopied(true);
                      setTimeout(() => setCopied(false), 1500);
                    }}
                  >
                    {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
                  </Button>
                </div>
              </div>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                confirm.mutate();
              }}
              className="space-y-3"
            >
              <div className="space-y-2">
                <Label htmlFor="totp-code">Enter the 6-digit code from your app</Label>
                <Input
                  id="totp-code"
                  inputMode="numeric"
                  maxLength={6}
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                  required
                  autoFocus
                />
              </div>
              {confirm.isError ? (
                <Alert variant="destructive">
                  <AlertDescription>{(confirm.error as Error).message}</AlertDescription>
                </Alert>
              ) : null}
              <div className="flex gap-2">
                <Button type="submit" loading={confirm.isPending} disabled={code.length !== 6}>
                  Verify and enable
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => {
                    setConfirmStep(false);
                    setEnrollState(null);
                    setCode("");
                  }}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        ) : null}

        <Dialog open={disableOpen} onOpenChange={setDisableOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Disable two-factor authentication?</DialogTitle>
              <DialogDescription>Confirm with your password to remove the extra protection.</DialogDescription>
            </DialogHeader>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                disable.mutate();
              }}
              className="space-y-3"
            >
              <div className="space-y-2">
                <Label htmlFor="disable-pwd">Current password</Label>
                <Input
                  id="disable-pwd"
                  type="password"
                  required
                  value={disablePassword}
                  onChange={(e) => setDisablePassword(e.target.value)}
                />
              </div>
              {disable.isError ? (
                <Alert variant="destructive">
                  <AlertDescription>{(disable.error as Error).message}</AlertDescription>
                </Alert>
              ) : null}
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setDisableOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="destructive" loading={disable.isPending}>
                  Disable 2FA
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}

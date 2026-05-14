"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PageHeader } from "@/components/ui/page-header";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Switch } from "@/components/ui/switch";
import { exporterApi } from "@/lib/api";

export default function ExporterSettingsPage() {
  const [oldPwd, setOldPwd] = useState("");
  const [newPwd, setNewPwd] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);

  const change = useMutation({
    mutationFn: () => exporterApi.changePassword({ old_password: oldPwd, new_password: newPwd }),
    onSuccess: () => {
      toast.success("Password updated");
      setOldPwd("");
      setNewPwd("");
      setConfirm("");
    },
  });

  return (
    <>
      <PageHeader title="Settings" description="Account security and preferences." />

      <div className="grid max-w-2xl gap-6">
        <Card>
          <CardContent className="space-y-4 p-6">
            <h2 className="font-semibold">Change password</h2>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                setError(null);
                if (newPwd.length < 8) return setError("Password must be at least 8 characters.");
                if (newPwd !== confirm) return setError("Passwords don't match.");
                change.mutate();
              }}
              className="space-y-4"
            >
              <div className="space-y-2">
                <Label htmlFor="old">Current password</Label>
                <Input id="old" type="password" value={oldPwd} onChange={(e) => setOldPwd(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new">New password</Label>
                <Input id="new" type="password" value={newPwd} onChange={(e) => setNewPwd(e.target.value)} required minLength={8} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm">Confirm new password</Label>
                <Input id="confirm" type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} required />
              </div>
              {error ? (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              ) : null}
              {change.isError ? (
                <Alert variant="destructive">
                  <AlertDescription>{(change.error as Error).message}</AlertDescription>
                </Alert>
              ) : null}
              <Button type="submit" loading={change.isPending}>
                Update password
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="space-y-4 p-6">
            <h2 className="font-semibold">Notifications</h2>
            <SettingRow
              title="New order alerts"
              description="Email me when a buyer places an order."
              defaultChecked
            />
            <SettingRow
              title="Weekly digest"
              description="Performance summary every Monday."
              defaultChecked
            />
            <SettingRow
              title="Marketing emails"
              description="Tips, new feature announcements."
              defaultChecked={false}
            />
          </CardContent>
        </Card>
      </div>
    </>
  );
}

function SettingRow({ title, description, defaultChecked }: { title: string; description: string; defaultChecked?: boolean }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div>
        <p className="text-sm font-medium">{title}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      <Switch defaultChecked={defaultChecked} />
    </div>
  );
}

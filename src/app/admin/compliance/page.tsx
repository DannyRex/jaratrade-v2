import { ShieldCheck } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent } from "@/components/ui/card";

export default function CompliancePage() {
  return (
    <>
      <PageHeader title="Compliance" description="GDPR, KYC and audit-trail tooling." />
      <Card>
        <CardContent className="flex items-start gap-4 p-6">
          <ShieldCheck className="mt-0.5 size-6 text-primary" aria-hidden />
          <div className="space-y-2">
            <h2 className="font-semibold">Coming soon</h2>
            <p className="text-sm text-muted-foreground">
              KYC submission queue, GDPR data-export tooling, and account audit logs will live
              here. The current backend persists submissions but doesn&apos;t yet expose them to the
              admin UI - see backend gap notes on the Users page.
            </p>
          </div>
        </CardContent>
      </Card>
    </>
  );
}

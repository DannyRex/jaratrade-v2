"use client";

import { Sparkles } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/ui/page-header";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useExporterPlans, useImporterPlans } from "@/lib/queries";
import { formatMoney } from "@/lib/format";

export default function AdminPlansPage() {
  const importer = useImporterPlans();
  const exporter = useExporterPlans();

  return (
    <>
      <PageHeader
        title="Subscription plans"
        description="View and configure the plans available to importers and exporters."
        actions={
          <Badge variant="secondary">
            <Sparkles className="size-3" /> Read-only for now
          </Badge>
        }
      />

      <Tabs defaultValue="importer">
        <TabsList>
          <TabsTrigger value="importer">Importer plans</TabsTrigger>
          <TabsTrigger value="exporter">Exporter plans</TabsTrigger>
        </TabsList>

        <TabsContent value="importer" className="mt-6">
          {importer.isLoading ? (
            <Skeleton className="h-32 w-full" />
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {(importer.data?.rows ?? []).map((plan) => (
                <Card key={plan.id}>
                  <CardContent className="space-y-2 p-5">
                    <div className="flex items-baseline justify-between">
                      <p className="font-semibold">{plan.title}</p>
                      <p className="font-bold tabular-nums">
                        {formatMoney(plan.monthly_subscription_fee, plan.currency)}/mo
                      </p>
                    </div>
                    <p className="text-sm text-muted-foreground">{plan.description}</p>
                    <p className="text-xs text-muted-foreground">
                      Commission: {plan.commission_percent}% · Cap:{" "}
                      {Number(plan.transaction_limit) < 0
                        ? "Unlimited"
                        : formatMoney(plan.transaction_limit, plan.currency)}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="exporter" className="mt-6">
          {exporter.isLoading ? (
            <Skeleton className="h-32 w-full" />
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {(exporter.data?.rows ?? []).map((plan) => (
                <Card key={plan.id}>
                  <CardContent className="space-y-2 p-5">
                    <div className="flex items-baseline justify-between">
                      <p className="font-semibold">{plan.title}</p>
                      <p className="font-bold tabular-nums">
                        {formatMoney(plan.monthly_subscription_fee, plan.currency)}/mo
                      </p>
                    </div>
                    <p className="text-sm text-muted-foreground">{plan.description}</p>
                    <p className="text-xs text-muted-foreground">
                      Stores: {plan.max_store < 0 ? "Unlimited" : plan.max_store} · Products:{" "}
                      {plan.max_product < 0 ? "Unlimited" : plan.max_product}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </>
  );
}

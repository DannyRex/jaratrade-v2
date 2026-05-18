"use client";

import { SubscriptionPage } from "@/components/subscription-page";
import { ExporterSubscriptionExtras } from "@/components/exporter-subscription-extras";

export default function ExporterSubscriptionPage() {
  return (
    <>
      <SubscriptionPage role="exporter" />
      <ExporterSubscriptionExtras />
    </>
  );
}

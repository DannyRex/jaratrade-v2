"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { PageHeader } from "@/components/ui/page-header";
import { Skeleton } from "@/components/ui/skeleton";
import { importerApi } from "@/lib/api";
import { formatMoney } from "@/lib/format";
import { toast } from "sonner";
import type { FlutterwavePaymentSession, Order } from "@/lib/types";

declare global {
  interface Window {
    FlutterwaveCheckout?: (config: Record<string, unknown>) => void;
  }
}

const FLW_INLINE_SCRIPT = "https://checkout.flutterwave.com/v3.js";

function loadFlutterwave(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined") return reject(new Error("not in browser"));
    if (window.FlutterwaveCheckout) return resolve();
    const existing = document.querySelector(`script[src="${FLW_INLINE_SCRIPT}"]`);
    if (existing) {
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", () => reject(new Error("script failed to load")));
      return;
    }
    const s = document.createElement("script");
    s.src = FLW_INLINE_SCRIPT;
    s.async = true;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error("script failed to load"));
    document.head.appendChild(s);
  });
}

export default function PayPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return <PayContent orderId={decodeURIComponent(id)} />;
}

function PayContent({ orderId }: { orderId: string }) {
  const router = useRouter();
  const [scriptReady, setScriptReady] = useState(false);

  const order = useQuery({
    queryKey: ["importer", "orders", orderId],
    queryFn: () => importerApi.getOrder(orderId) as Promise<Order>,
  });

  const initSession = useQuery({
    queryKey: ["importer", "payment-session", orderId],
    queryFn: () => importerApi.initPayment(orderId),
    enabled: Boolean(order.data),
  });

  useEffect(() => {
    loadFlutterwave().then(() => setScriptReady(true)).catch(() => setScriptReady(false));
  }, []);

  const verify = useMutation({
    mutationFn: (txRef: string) => importerApi.verifyPayment(txRef),
    onSuccess: () => {
      toast.success("Payment confirmed", { description: "We'll notify the exporter to ship your order." });
      router.push(`/importer/orders/${encodeURIComponent(orderId)}`);
    },
  });

  const launch = (session: FlutterwavePaymentSession) => {
    if (!scriptReady || !window.FlutterwaveCheckout) {
      toast.error("Payment unavailable", { description: "Please refresh and try again." });
      return;
    }
    window.FlutterwaveCheckout({
      public_key: session.public_key,
      tx_ref: session.tx_ref,
      amount: session.amount,
      currency: session.currency,
      payment_options: session.payment_options,
      customer: session.customer,
      customizations: session.customizations,
      meta: { order_id: orderId },
      callback: (response: { status: string; tx_ref: string }) => {
        if (response.status === "successful") {
          verify.mutate(response.tx_ref);
        } else {
          toast.error("Payment failed", { description: "No charge was made. Try again." });
        }
      },
      onclose: () => {
        // user cancelled - no-op
      },
    });
  };

  return (
    <>
      <Button asChild variant="ghost" size="sm" className="mb-3 -ml-2">
        <Link href={`/importer/orders/${encodeURIComponent(orderId)}`}>
          <ArrowLeft className="size-4" /> Order
        </Link>
      </Button>

      <PageHeader title="Complete payment" description="Pay securely with card, bank transfer or USSD." />

      <div className="grid max-w-3xl gap-4">
        {order.isLoading ? (
          <Skeleton className="h-32 w-full" />
        ) : order.isError ? (
          <Alert variant="destructive">
            <AlertDescription>Couldn&apos;t load order details.</AlertDescription>
          </Alert>
        ) : (
          <Card>
            <CardContent className="space-y-3 p-6">
              <div className="flex items-baseline justify-between">
                <p className="text-sm text-muted-foreground">Amount due</p>
                <p className="text-2xl font-bold tabular-nums">
                  {formatMoney(order.data?.total, order.data?.currency)}
                </p>
              </div>
              {initSession.isError ? (
                <Alert variant="destructive">
                  <AlertDescription>{(initSession.error as Error).message}</AlertDescription>
                </Alert>
              ) : null}
              <Button
                size="lg"
                className="w-full"
                disabled={!scriptReady || !initSession.data || verify.isPending}
                loading={verify.isPending}
                onClick={() => initSession.data && launch(initSession.data)}
              >
                Pay {formatMoney(order.data?.total, order.data?.currency)}
              </Button>
              <p className="inline-flex items-center justify-center gap-2 text-center text-xs text-muted-foreground">
                <ShieldCheck className="size-3 text-success" /> 256-bit SSL · Funds split via
                Flutterwave
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </>
  );
}

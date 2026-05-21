"use client";

/**
 * Pay page - uses Flutterwave Standard (hosted) checkout.
 *
 * Flow:
 *   1. User lands here from /checkout flow.
 *   2. Page calls /imp/payment/init_standard → API hits FLW and returns
 *      a hosted-checkout URL (https://checkout.flutterwave.com/<hash>).
 *   3. User clicks "Pay" → we redirect to that URL. FLW owns the page,
 *      handles card / bank transfer / USSD itself.
 *   4. After payment (success, failure, or cancel), FLW redirects the
 *      user back to /importer/orders/<id>/pay?from=flw&tx_ref=...&status=...
 *   5. We detect `from=flw` on mount, call /imp/payment/verify with the
 *      tx_ref to confirm with FLW's source of truth, then redirect to
 *      the order detail page.
 *
 * Why Standard instead of Inline:
 * - No `v3.js` script tag to load → no Cloudflare-cached 404s, no
 *   ad-blocker / privacy-extension interference, no race with FLW's
 *   deferred global init.
 * - One less surface to fail. The user redirects to FLW's hosted page;
 *   FLW handles everything until the redirect-back.
 */
import { Suspense, use, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { PageHeader } from "@/components/ui/page-header";
import { Skeleton } from "@/components/ui/skeleton";
import { importerApi } from "@/lib/api";
import { formatMoney } from "@/lib/format";
import type { Order } from "@/lib/types";

export default function PayPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  // useSearchParams requires a Suspense boundary (the inner content reads
  // the FLW redirect-back querystring on mount).
  return (
    <Suspense fallback={<Skeleton className="h-32 w-full max-w-3xl" />}>
      <PayContent orderId={decodeURIComponent(id)} />
    </Suspense>
  );
}

function PayContent({ orderId }: { orderId: string }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const searchParams = useSearchParams();

  const order = useQuery({
    queryKey: ["importer", "orders", orderId],
    queryFn: () => importerApi.getOrder(orderId) as Promise<Order>,
  });

  // Verify mutation - used both for the redirect-back from FLW and for
  // any manual retry button we expose if verification stalls.
  const verify = useMutation({
    mutationFn: (txRef: string) => importerApi.verifyPayment(txRef),
    onSuccess: async (data) => {
      const payload = data as { status?: string; tx_ref?: string };
      if (payload?.status !== "successful") {
        toast.error("Payment couldn't be confirmed", {
          description: "Flutterwave says the charge didn't clear. Try again.",
        });
        return;
      }
      toast.success("Payment confirmed", {
        description: "We'll notify the exporter to ship your order.",
      });
      await queryClient.invalidateQueries({ queryKey: ["importer", "orders", orderId] });
      await queryClient.invalidateQueries({ queryKey: ["importer", "orders"] });
      router.push(`/importer/orders/${encodeURIComponent(orderId)}`);
    },
    onError: (err: Error) => {
      toast.error("Couldn't confirm payment", { description: err.message });
    },
  });

  // Detect the redirect-back from FLW. When the user finishes payment on
  // FLW's hosted page, FLW redirects to:
  //   /importer/orders/<id>/pay?from=flw&tx_ref=...&status=...&transaction_id=...
  // We pick that up, call verify, then route on to the order page.
  // Ref-guarded so React strict-mode's double-mount doesn't fire twice.
  const verifiedOnce = useRef(false);
  useEffect(() => {
    if (verifiedOnce.current) return;
    if (searchParams.get("from") !== "flw") return;
    const txRef = searchParams.get("tx_ref");
    const status = (searchParams.get("status") ?? "").toLowerCase();
    if (!txRef) return;
    verifiedOnce.current = true;
    if (status === "cancelled") {
      toast.message("Payment cancelled", {
        description: "No charge was made. Try again when you're ready.",
      });
      return;
    }
    // FLW reports "successful" / "completed" / "failed". We verify
    // regardless of what they say unless it's an explicit failed/cancelled
    // - the backend re-checks against FLW directly for source-of-truth.
    if (status === "failed") {
      toast.error("Payment failed", { description: "No charge was made. Try again." });
      return;
    }
    verify.mutate(txRef);
    // verify is referentially stable for this purpose. Keeping deps tight
    // since this is meant to run once on mount when the URL has ?from=flw.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const initStandard = useMutation({
    mutationFn: () => importerApi.initPaymentStandard(orderId),
    onSuccess: (data) => {
      // Same window navigation - FLW will redirect the user back here
      // (?from=flw&tx_ref=...&status=...) once payment completes.
      window.location.href = data.link;
    },
    onError: (err: Error) => {
      toast.error("Couldn't initialise payment", { description: err.message });
    },
  });

  // While the redirect-back verify is running, show a clear state instead
  // of letting the user think the page is broken.
  const isVerifying = verify.isPending;
  const isCancelledReturn = searchParams.get("from") === "flw" && searchParams.get("status") === "cancelled";

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

              {isCancelledReturn ? (
                <Alert variant="info">
                  <AlertDescription>
                    Last attempt was cancelled. No charge was made - you can try again below.
                  </AlertDescription>
                </Alert>
              ) : null}

              {initStandard.isError ? (
                <Alert variant="destructive">
                  <AlertDescription>
                    {(initStandard.error as Error).message}
                  </AlertDescription>
                </Alert>
              ) : null}

              <Button
                size="lg"
                className="w-full"
                loading={initStandard.isPending || isVerifying}
                disabled={initStandard.isPending || isVerifying}
                onClick={() => initStandard.mutate()}
              >
                {isVerifying
                  ? "Confirming payment..."
                  : initStandard.isPending
                  ? "Opening Flutterwave..."
                  : `Pay ${formatMoney(order.data?.total, order.data?.currency)}`}
              </Button>
              <p className="inline-flex items-center justify-center gap-2 text-center text-xs text-muted-foreground">
                <ShieldCheck className="size-3 text-success" /> 256-bit SSL · Funds split via
                Flutterwave
              </p>
              <p className="text-center text-[11px] text-muted-foreground">
                You&apos;ll be redirected to Flutterwave&apos;s secure page to complete payment, and brought back here when done.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </>
  );
}

"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
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

const FLW_INLINE_SCRIPT_BASE = "https://checkout.flutterwave.com/v3.js";

/** Build the script URL with a cache-busting param.
 *
 * Flutterwave's CDN (Cloudflare) intermittently serves a 404 for v3.js and
 * caches that 404 for up to 4 hours (`cache-control: public, max-age=14400`,
 * `cf-cache-status: HIT`). When that happens, every user whose POP captured
 * the bad response sees a disabled Pay button until TTL expires. Appending a
 * unique query param forces Cloudflare to MISS, refetch from origin, and
 * serve the working 200. Slightly more origin traffic, but bulletproof
 * against this specific failure mode.
 */
function flwScriptUrl(): string {
  return `${FLW_INLINE_SCRIPT_BASE}?_cb=${Date.now()}`;
}

function loadFlutterwave(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined") return reject(new Error("not in browser"));
    if (window.FlutterwaveCheckout) return resolve();
    // The script's onload event fires the moment its JS finishes parsing,
    // but FLW v3.js defers attaching `window.FlutterwaveCheckout` (likely
    // inside a microtask / DOMContentLoaded handler). A strict check right
    // at onload sees `undefined` and rejects, even though the global lands
    // a few ticks later.
    //
    // Poll for up to 3 seconds after onload (30 x 100ms). Resolves the
    // instant the global appears; rejects if it genuinely never does
    // (real blocker / CDN serving HTML 404 with a 2xx).
    const onLoadCheck = () => {
      if (window.FlutterwaveCheckout) return resolve();
      let attempts = 0;
      const interval = setInterval(() => {
        if (window.FlutterwaveCheckout) {
          clearInterval(interval);
          resolve();
        } else if (++attempts >= 30) {
          clearInterval(interval);
          reject(new Error("Flutterwave script loaded but didn't initialise"));
        }
      }, 100);
    };
    // If a previous attempt left a script tag behind without setting the
    // global, that tag has already fired its load event and re-attaching
    // listeners would never fire again. Yank it so the fresh insert below
    // gets a clean shot (and a freshly cache-busted URL).
    const stale = document.querySelectorAll('script[data-flw-inline="1"]');
    stale.forEach((node) => node.parentNode?.removeChild(node));

    const s = document.createElement("script");
    s.src = flwScriptUrl();
    s.async = true;
    s.dataset.flwInline = "1";
    s.onload = onLoadCheck;
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
  const queryClient = useQueryClient();
  // Bumping this re-keys the script-load query, which is how we retry.
  const [scriptAttempt, setScriptAttempt] = useState(0);

  const order = useQuery({
    queryKey: ["importer", "orders", orderId],
    queryFn: () => importerApi.getOrder(orderId) as Promise<Order>,
  });

  const initSession = useQuery({
    queryKey: ["importer", "payment-session", orderId],
    queryFn: () => importerApi.initPayment(orderId),
    enabled: Boolean(order.data),
  });

  // The Flutterwave inline checkout script. Modelling the load as a
  // useQuery (rather than useState + useEffect) gets us isLoading /
  // isError / isSuccess flags directly, so the UI can show a "Loading
  // payment provider..." spinner or a Retry button when an ad-blocker /
  // network failure swallows the script.
  const flwScript = useQuery({
    queryKey: ["flw-inline-script", scriptAttempt],
    queryFn: loadFlutterwave,
    retry: false,
    staleTime: Infinity,
  });
  const scriptState: "loading" | "ready" | "failed" = flwScript.isSuccess
    ? "ready"
    : flwScript.isError
    ? "failed"
    : "loading";
  const scriptReady = scriptState === "ready";

  const verify = useMutation({
    mutationFn: (txRef: string) => importerApi.verifyPayment(txRef),
    onSuccess: async (data) => {
      // The API returns 200 with payload.status="successful" OR "failed"
      // (i.e. FLW says the charge didn't actually clear). Treat the latter
      // as a real failure - don't redirect, don't claim success.
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
      // The order detail page reads from the same React Query key. If we
      // don't invalidate, the cached pending-status row stays visible and
      // the Pay button persists until the next mount. Invalidate both the
      // single-order query and the orders list so all surfaces refetch.
      await queryClient.invalidateQueries({ queryKey: ["importer", "orders", orderId] });
      await queryClient.invalidateQueries({ queryKey: ["importer", "orders"] });
      router.push(`/importer/orders/${encodeURIComponent(orderId)}`);
    },
    onError: (err: Error) => {
      toast.error("Couldn't confirm payment", { description: err.message });
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
      // FLW inline v3 fires this callback when the user closes the modal
      // after charging. The `status` field is "successful" / "completed" /
      // "failed" / etc depending on the path - we always re-verify with
      // our backend (which goes back to FLW for the source of truth)
      // unless FLW explicitly told us it failed.
      callback: (response: { status?: string; tx_ref?: string; transaction_id?: string }) => {
        const txRef = response.tx_ref ?? session.tx_ref;
        const status = (response.status ?? "").toLowerCase();
        if (status === "failed" || status === "cancelled") {
          toast.error("Payment failed", { description: "No charge was made. Try again." });
          return;
        }
        verify.mutate(txRef);
      },
      onclose: () => {
        // User dismissed the modal without paying. No verify, no error.
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
                  <AlertDescription>
                    Couldn&apos;t initialise payment: {(initSession.error as Error).message}
                  </AlertDescription>
                </Alert>
              ) : null}
              {scriptState === "failed" ? (
                <Alert variant="destructive">
                  <AlertDescription className="flex flex-wrap items-center justify-between gap-2">
                    <span>
                      Couldn&apos;t load the Flutterwave payment script. Check your network
                      (an ad-blocker or strict firewall can block it) and retry.
                    </span>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setScriptAttempt((n) => n + 1)}
                    >
                      Retry
                    </Button>
                  </AlertDescription>
                </Alert>
              ) : null}
              <Button
                size="lg"
                className="w-full"
                disabled={!scriptReady || !initSession.data || verify.isPending}
                loading={verify.isPending}
                onClick={() => initSession.data && launch(initSession.data)}
              >
                {verify.isPending
                  ? "Confirming payment..."
                  : scriptState === "loading"
                  ? "Loading payment provider..."
                  : !initSession.data
                  ? "Preparing your order..."
                  : `Pay ${formatMoney(order.data?.total, order.data?.currency)}`}
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

"use client";

import { MutationCache, QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { ThemeProvider } from "next-themes";
import { Toaster, toast } from "sonner";
import { useState } from "react";
import { CartSyncBridge } from "./cart-sync-bridge";

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        // Global mutation-error fallback: when a mutation fails and the call
        // site didn't supply its own onError (e.g. a 403 from a new
        // plan-tier guard), surface the backend message as a toast instead
        // of swallowing it silently. Mutations that DO define onError keep
        // their behaviour - we skip the global toast so we never double-fire.
        mutationCache: new MutationCache({
          onError: (error, _variables, _context, mutation) => {
            if (mutation.options.onError) return;
            const message =
              error instanceof Error && error.message
                ? error.message
                : "Something went wrong";
            toast.error(message);
          },
        }),
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // 1 min - most catalog data is mostly static
            gcTime: 5 * 60 * 1000,
            retry: (failureCount, error) => {
              // Don't retry 4xx - they're our fault, not transient
              const status = (error as { status?: number })?.status;
              if (status && status >= 400 && status < 500) return false;
              return failureCount < 2;
            },
            refetchOnWindowFocus: false,
          },
          mutations: {
            retry: false,
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
        <CartSyncBridge />
        {children}
        <Toaster
          position="top-right"
          richColors
          closeButton
          toastOptions={{
            classNames: {
              toast: "rounded-lg border-border",
            },
          }}
        />
      </ThemeProvider>
      {process.env.NODE_ENV === "development" && <ReactQueryDevtools initialIsOpen={false} />}
    </QueryClientProvider>
  );
}

"use client";

/**
 * Flutterwave Inline checkout - modal flow.
 *
 * Why this exists: FLW's hosted Standard checkout (used by prod) is served
 * from `checkout-v2.dev-flutterwave.com` in TEST mode, which currently has
 * a Vue runtime error around a `switch` statement that prevents the
 * payment form from rendering. The bug is on FLW's side; they're working
 * on a fix. Until then, dev (`FLWPUBK_TEST-*` keys) uses Inline modal
 * instead, which loads a different bundle and isn't affected.
 *
 * Prod stays on Standard hosted - this module only activates when the
 * NEXT_PUBLIC_FLW_MODE build-time env var is set to "inline" on the
 * `jaratrade-dev` Vercel project.
 */
import type { FlutterwavePaymentSession } from "./types";

interface FlutterwaveCallback {
  status?: string;
  tx_ref?: string;
  transaction_id?: number | string;
  flw_ref?: string;
}

/** Permissive shape so consumers (subscription upgrade vs order pay)
 *  can carry extras like `meta` or `subaccounts` without re-declaring
 *  the runtime config. The fields FLW v3.js actually reads are a subset
 *  of FlutterwavePaymentSession; everything else is forwarded as-is. */
type FlutterwaveInlineSession = FlutterwavePaymentSession & {
  meta?: Record<string, unknown>;
  subaccounts?: unknown[];
};

interface FlutterwaveInlineRuntimeConfig extends FlutterwaveInlineSession {
  callback: (response: FlutterwaveCallback) => void;
  onclose: () => void;
}

declare global {
  interface Window {
    FlutterwaveCheckout?: (config: FlutterwaveInlineRuntimeConfig) => void;
  }
}

const SCRIPT_SRC = "https://checkout.flutterwave.com/v3.js";

let scriptPromise: Promise<void> | null = null;

function loadFlutterwaveScript(): Promise<void> {
  if (scriptPromise) return scriptPromise;
  scriptPromise = new Promise<void>((resolve, reject) => {
    if (typeof window === "undefined") {
      reject(new Error("window unavailable (SSR)"));
      return;
    }
    if (window.FlutterwaveCheckout) {
      resolve();
      return;
    }
    const existing = document.querySelector(
      `script[src="${SCRIPT_SRC}"]`,
    ) as HTMLScriptElement | null;
    if (existing) {
      existing.addEventListener("load", () => resolve(), { once: true });
      existing.addEventListener(
        "error",
        () => reject(new Error("Flutterwave v3.js failed to load")),
        { once: true },
      );
      return;
    }
    const tag = document.createElement("script");
    tag.src = SCRIPT_SRC;
    tag.async = true;
    tag.onload = () => resolve();
    tag.onerror = () => reject(new Error("Flutterwave v3.js failed to load"));
    document.head.appendChild(tag);
  });
  return scriptPromise;
}

/**
 * Pre-load FLW v3.js without opening the modal. Call this on mount of
 * any page that's likely to trigger a payment so the script is ready
 * by the time the user clicks.
 */
export function prewarmFlutterwave(): Promise<void> {
  return loadFlutterwaveScript();
}

interface OpenInlineArgs {
  session: FlutterwaveInlineSession;
  /** Called when FLW reports status === "successful". */
  onSuccess: (txRef: string) => void;
  /** Called for any other terminal outcome - failed, cancelled, modal-closed. */
  onCancel: () => void;
}

/**
 * Open the FLW Inline modal. Resolves once the modal is up; the actual
 * success/cancel happens via the callbacks.
 *
 * FLW's v3.js `callback` fires for terminal events with `status` set to
 * "successful" / "failed" / "cancelled"; `onclose` fires when the user
 * dismisses the modal without paying. We treat anything that isn't an
 * explicit success as a cancel so callers only need two paths.
 */
export async function openFlutterwaveInline({
  session,
  onSuccess,
  onCancel,
}: OpenInlineArgs): Promise<void> {
  await loadFlutterwaveScript();
  if (!window.FlutterwaveCheckout) {
    throw new Error("FlutterwaveCheckout is unavailable after v3.js load");
  }
  // Guard against double-fire: FLW can occasionally call both callback
  // and onclose in some browsers when the user closes the modal mid-flow.
  // We resolve exactly one path.
  let resolved = false;
  window.FlutterwaveCheckout({
    ...session,
    callback: (response) => {
      if (resolved) return;
      resolved = true;
      if (response.status === "successful") {
        onSuccess(response.tx_ref ?? session.tx_ref);
      } else {
        onCancel();
      }
    },
    onclose: () => {
      if (resolved) return;
      resolved = true;
      onCancel();
    },
  });
}

/**
 * Build-time flag - the dev Vercel project sets this to "inline";
 * prod leaves it unset so the Standard hosted flow remains the default.
 */
export const FLW_INLINE_MODE = process.env.NEXT_PUBLIC_FLW_MODE === "inline";

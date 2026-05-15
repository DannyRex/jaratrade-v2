/**
 * Next.js instrumentation hook - runs before the server boots.
 * https://nextjs.org/docs/app/building-your-application/optimizing/instrumentation
 *
 * We use it to load the appropriate Sentry config based on runtime.
 */
export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    await import("../sentry.server.config");
  }
  if (process.env.NEXT_RUNTIME === "edge") {
    await import("../sentry.edge.config");
  }
}

export { captureRequestError as onRequestError } from "@sentry/nextjs";

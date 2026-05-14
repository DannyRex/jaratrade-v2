/**
 * Client-side instrumentation hook (loaded by Next.js for browser bundle).
 */
import "../sentry.client.config";

export { captureRouterTransitionStart as onRouterTransitionStart } from "@sentry/nextjs";

/**
 * Sentry config for the browser bundle.
 *
 * Initialised on first paint via Next.js's instrumentation hook. No-ops when
 * NEXT_PUBLIC_SENTRY_DSN is unset (local dev / open-source clones).
 */
import * as Sentry from "@sentry/nextjs";

const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;

if (dsn) {
  Sentry.init({
    dsn,
    environment: process.env.NEXT_PUBLIC_SENTRY_ENVIRONMENT ?? process.env.NODE_ENV,
    tracesSampleRate: Number(process.env.NEXT_PUBLIC_SENTRY_TRACES_SAMPLE_RATE ?? 0.1),
    replaysSessionSampleRate: Number(process.env.NEXT_PUBLIC_SENTRY_REPLAYS_SESSION_SAMPLE_RATE ?? 0),
    replaysOnErrorSampleRate: Number(process.env.NEXT_PUBLIC_SENTRY_REPLAYS_ERROR_SAMPLE_RATE ?? 1),
    integrations: [
      Sentry.replayIntegration({
        // Privacy-first defaults — never expose PII in replays.
        maskAllText: true,
        blockAllMedia: true,
      }),
    ],
    // Tag every event with the deployed version so we can correlate to releases.
    release: process.env.NEXT_PUBLIC_RELEASE_VERSION,
    // Don't ship transactions for the Next.js dev devtools or static asset URLs.
    tracePropagationTargets: [/^https?:\/\/api\.jaratrade\.com/, /^http:\/\/127\.0\.0\.1:8000/],
  });
}

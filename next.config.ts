import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

const nextConfig: NextConfig = {
  experimental: {
    optimizePackageImports: ["lucide-react", "date-fns"],
  },
  images: {
    remotePatterns: [
      // Cloudinary - where backend stores product images
      { protocol: "https", hostname: "res.cloudinary.com" },
      { protocol: "http", hostname: "res.cloudinary.com" },
    ],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
    ];
  },
};

// Sentry build-time integration — uploads source maps + tags release with the
// build's commit SHA. All options here are no-ops when the corresponding env
// vars aren't set, so local dev still works without a Sentry account.
export default withSentryConfig(nextConfig, {
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  authToken: process.env.SENTRY_AUTH_TOKEN,

  // Don't fail builds if source-map upload fails
  silent: !process.env.CI,
  widenClientFileUpload: true,
  sourcemaps: { disable: false },
  disableLogger: true,
  // Tunnel client requests through a Next API route so ad blockers don't drop them
  tunnelRoute: "/monitoring",
  // Auto-instrument Vercel cron monitors (no-op outside Vercel)
  automaticVercelMonitors: true,
});

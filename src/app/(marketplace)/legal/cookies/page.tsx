/**
 * /legal/cookies - Cookie policy.
 * Plain-English breakdown of cookies used.
 */
import type { Metadata } from "next";
import { PageHero } from "@/components/marketing/page-hero";
import { Prose } from "@/components/marketing/prose";

export const metadata: Metadata = {
  title: "Cookie policy",
  description:
    "What cookies Jaratrade uses, why we use them, and how to manage your preferences.",
};

const LAST_UPDATED = "15 May 2026";

export default function CookiePolicyPage() {
  return (
    <>
      <PageHero
        eyebrow="Legal"
        title="Cookie Policy"
        description={`Last updated ${LAST_UPDATED}. What cookies we use and how to opt out.`}
      />
      <section className="container mx-auto max-w-5xl px-4 pb-20 sm:px-6 lg:px-8 lg:pb-24">
        <Prose>
          <h2>What are cookies?</h2>
          <p>
            Cookies are small text files that websites place on your device when you visit.
            They let the site remember things - that you&apos;re signed in, what&apos;s in your
            cart, what currency you prefer. Some cookies are essential; others help us
            understand how people use the site.
          </p>

          <h2>The cookies we use</h2>
          <h3>Strictly necessary</h3>
          <p>These cookies make the site work. We can&apos;t turn them off.</p>
          <ul>
            <li><code>jara_token</code> - your authentication session</li>
            <li><code>jara_role</code> - your account role (importer / exporter / admin)</li>
            <li><code>jara-auth</code> - local persistence of your sign-in state</li>
            <li><code>jara-cart</code> - items in your shopping cart</li>
            <li>Theme preference (light / dark) and language</li>
          </ul>

          <h3>Performance &amp; analytics</h3>
          <p>
            These cookies help us understand which pages are most useful and where to invest
            in improvements. All analytics data is aggregated - we can&apos;t identify
            individuals from it. You can opt out via the cookie banner.
          </p>
          <ul>
            <li>Page view counts, time on page</li>
            <li>Anonymised traffic sources (where you came from)</li>
            <li>Device and browser type (for compatibility)</li>
          </ul>

          <h3>Third-party cookies</h3>
          <p>
            We use a small number of third-party services that may set their own cookies:
          </p>
          <ul>
            <li><strong>Flutterwave</strong> - when you pay, Flutterwave sets cookies on its checkout iframe to handle the payment session</li>
            <li><strong>Cloudinary</strong> - product images are served from Cloudinary&apos;s CDN; no tracking cookies</li>
            <li><strong>Sentry</strong> - error reporting only; no behavioural tracking</li>
          </ul>

          <h2>Managing cookies</h2>
          <p>You can manage cookies in three ways:</p>
          <ul>
            <li><strong>Via the cookie banner</strong> - accept all, reject non-essential, or customise on first visit. You can also re-open the banner from the link at the bottom of every page.</li>
            <li><strong>Via your browser</strong> - every modern browser lets you block or delete cookies. Note that disabling essential cookies will break sign-in and checkout.</li>
            <li><strong>Via Do Not Track</strong> - we respect the DNT browser signal for analytics cookies.</li>
          </ul>

          <h2>Changes to this policy</h2>
          <p>
            We&apos;ll update this page whenever we add or remove cookies. The
            &ldquo;last updated&rdquo; date at the top reflects the most recent change.
          </p>

          <h2>Contact</h2>
          <p>
            Questions about cookies? Email{" "}
            <a href="mailto:privacy@jaratrade.com">privacy@jaratrade.com</a>.
          </p>
        </Prose>
      </section>
    </>
  );
}

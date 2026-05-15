/**
 * /legal/privacy - Privacy policy.
 * Plain-English summary of what we collect and what we do with it.
 * Aligned with UK GDPR / Nigerian NDPR principles.
 */
import type { Metadata } from "next";
import { PageHero } from "@/components/marketing/page-hero";
import { Prose } from "@/components/marketing/prose";

export const metadata: Metadata = {
  title: "Privacy policy",
  description:
    "How Jaratrade collects, uses, and protects your data. UK GDPR and Nigerian NDPR compliant.",
};

const LAST_UPDATED = "15 May 2026";

export default function PrivacyPage() {
  return (
    <>
      <PageHero
        eyebrow="Legal"
        title="Privacy Policy"
        description={`Last updated ${LAST_UPDATED}. What we collect, why we collect it, and what we'll never do with it.`}
      />
      <section className="container mx-auto max-w-5xl px-4 pb-20 sm:px-6 lg:px-8 lg:pb-24">
        <Prose>
          <h2>1. The short version</h2>
          <p>
            We collect the minimum we need to run the marketplace - your contact details,
            business documents for KYC, transaction records, and basic usage analytics. We
            don&apos;t sell your data, ever. We retain records only for as long as we have to.
          </p>

          <h2>2. Who we are</h2>
          <p>
            Jaratrade Ltd (&ldquo;we&rdquo;, &ldquo;us&rdquo;) is the data controller for
            your data when you use jaratrade.com. We&apos;re registered with the UK ICO and
            comply with both UK GDPR and the Nigerian Data Protection Regulation (NDPR).
          </p>

          <h2>3. What we collect</h2>
          <h3>3.1 Account data</h3>
          <ul>
            <li>Name, email, phone number</li>
            <li>For exporters: business name, CAC number, director ID, bank account details, business address</li>
            <li>For importers: shipping addresses, billing details</li>
          </ul>
          <h3>3.2 Transaction data</h3>
          <ul>
            <li>Orders, listings, payments (processed by Flutterwave - we hold transaction metadata, not full card numbers)</li>
            <li>Communications between buyers, sellers, and Jaratrade support</li>
            <li>Dispute records and admin notes</li>
          </ul>
          <h3>3.3 Usage data</h3>
          <ul>
            <li>Pages you visit, products you search and view (cookies - see our <a href="/legal/cookies">cookie policy</a>)</li>
            <li>Device, browser, IP address (truncated for analytics)</li>
            <li>How you navigated to the site (referrer)</li>
          </ul>

          <h2>4. Why we collect it</h2>
          <ul>
            <li>To run your account and process orders (contractual necessity)</li>
            <li>To verify exporter identity and prevent fraud (legitimate interest + legal obligation)</li>
            <li>To send transactional emails (order confirmations, dispute updates) - these aren&apos;t marketing and you can&apos;t unsubscribe</li>
            <li>To improve the product (legitimate interest, aggregated analytics only)</li>
            <li>To send marketing emails when you&apos;ve opted in (you can unsubscribe at any time)</li>
          </ul>

          <h2>5. Who we share it with</h2>
          <p>We share specific data with specific third parties - only as needed to run the service:</p>
          <ul>
            <li><strong>Flutterwave</strong> - payment processing, escrow, refunds</li>
            <li><strong>Cloudinary</strong> - product image hosting</li>
            <li><strong>Resend</strong> - transactional email delivery</li>
            <li><strong>Logistics partners</strong> - when you choose a partner at checkout, we share the shipping address and contact details</li>
            <li><strong>Authorities</strong> - when required by law (court order, sanctions screening)</li>
          </ul>
          <p>We don&apos;t sell, rent, or trade your data to advertisers.</p>

          <h2>6. Where we store it</h2>
          <p>
            Data is stored in EU/UK data centres operated by our cloud providers. Backups are
            encrypted at rest. We use TLS 1.3 in transit for all traffic between you and our
            servers.
          </p>

          <h2>7. How long we keep it</h2>
          <ul>
            <li>Active accounts: as long as the account exists</li>
            <li>Closed accounts: 7 years (for tax and audit purposes), then deleted</li>
            <li>Dispute records: 7 years from resolution</li>
            <li>Analytics: aggregated only; raw events deleted after 90 days</li>
          </ul>

          <h2>8. Your rights</h2>
          <p>Under UK GDPR and NDPR you have the right to:</p>
          <ul>
            <li>Access your data (download a copy)</li>
            <li>Correct inaccurate data</li>
            <li>Delete your data (subject to the retention requirements above)</li>
            <li>Object to processing (opt-out of marketing, restrict certain processing)</li>
            <li>Port your data to another service</li>
          </ul>
          <p>
            To exercise any of these, email{" "}
            <a href="mailto:privacy@jaratrade.com">privacy@jaratrade.com</a>. We&apos;ll
            respond within 30 days.
          </p>

          <h2>9. Children</h2>
          <p>
            Jaratrade isn&apos;t for under-18s. We don&apos;t knowingly collect data from
            anyone under 18. If you believe we have, please email us and we&apos;ll delete it.
          </p>

          <h2>10. Changes</h2>
          <p>
            We&apos;ll let you know about material changes via email and a banner in your
            dashboard at least 14 days before they take effect.
          </p>

          <h2>11. Contact</h2>
          <p>
            Questions or concerns? Email our Data Protection lead at{" "}
            <a href="mailto:privacy@jaratrade.com">privacy@jaratrade.com</a>. You also have
            the right to complain to the UK ICO (ico.org.uk) or the Nigeria NDPB
            (ndpb.gov.ng).
          </p>
        </Prose>
      </section>
    </>
  );
}

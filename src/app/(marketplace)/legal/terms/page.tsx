/**
 * /legal/terms - Terms of Service.
 *
 * Standard skeleton. Real legal text should be reviewed by counsel before
 * launch - placeholder here is plain-English and covers the major
 * marketplace bases.
 */
import type { Metadata } from "next";
import { PageHero } from "@/components/marketing/page-hero";
import { Prose } from "@/components/marketing/prose";

export const metadata: Metadata = {
  title: "Terms of service",
  description: "The terms governing your use of Jaratrade as a buyer, seller, or visitor.",
};

const LAST_UPDATED = "15 May 2026";

export default function TermsPage() {
  return (
    <>
      <PageHero
        eyebrow="Legal"
        title="Terms of Service"
        description={`Last updated ${LAST_UPDATED}. These terms govern your use of Jaratrade.com and the related Jaratrade services.`}
      />
      <section className="container mx-auto max-w-5xl px-4 pb-20 sm:px-6 lg:px-8 lg:pb-24">
        <Prose>
          <h2>1. About these terms</h2>
          <p>
            Jaratrade Ltd (&ldquo;Jaratrade&rdquo;, &ldquo;we&rdquo;, &ldquo;our&rdquo;) operates an online B2B
            marketplace at jaratrade.com that connects verified Nigerian exporters with
            international importers. By using the marketplace - as a buyer, a seller, or
            simply by visiting - you agree to these terms. If you don&apos;t agree, please don&apos;t
            use the service.
          </p>

          <h2>2. Eligibility</h2>
          <p>
            To create an account you must be at least 18 years old and legally capable of
            entering into a binding contract. Exporter accounts additionally require a
            registered Nigerian business with documentation that passes our KYC checks
            (Corporate Affairs Commission registration, director ID, operational bank
            account, and a verifiable physical address).
          </p>

          <h2>3. Your account</h2>
          <p>
            You&apos;re responsible for keeping your password safe and for everything that
            happens under your account. Notify us at{" "}
            <a href="mailto:admin@jaratrade.com">admin@jaratrade.com</a> as soon as you
            suspect unauthorised use. We may suspend or close accounts that violate these
            terms, fail KYC, or pose a risk to other users.
          </p>

          <h2>4. The marketplace</h2>
          <p>
            Jaratrade facilitates transactions between independent buyers and sellers. We are
            not a party to the underlying sale of goods. We verify sellers, process payments
            via Flutterwave, and operate a dispute resolution layer - but the contract for
            goods sits directly between the buyer and the seller listed on the order.
          </p>
          <h3>4.1 Listings</h3>
          <p>
            Sellers are responsible for the accuracy of their listings (product description,
            price, MOQ, weight, photos, stock count). Listings that misrepresent goods may be
            removed and the seller&apos;s account may be suspended.
          </p>
          <h3>4.2 Orders &amp; payment</h3>
          <p>
            When you place an order the buyer pays Jaratrade via Flutterwave. Funds are held
            in escrow and released to the seller once delivery is confirmed. We charge a
            commission (2% on the free tier, 1.5% on Premium) - this is deducted before the
            seller&apos;s share is paid out.
          </p>
          <h3>4.3 Shipping</h3>
          <p>
            Shipping is either arranged by the seller (&ldquo;self-ship&rdquo;) or via a
            Jaratrade-vetted logistics partner. The buyer pays for shipping. Once goods are
            handed to the carrier, risk of loss transfers per the agreed Incoterm. The default
            on Jaratrade-arranged shipping is DDP - door-to-door, duties paid.
          </p>

          <h2>5. Disputes</h2>
          <p>
            Buyers have 7 days from confirmed delivery to raise a dispute. Disputes are
            reviewed by our trust team and resolved as refund, replacement, or dismissed.
            Decisions are final but you can re-open a dispute if material new evidence emerges
            within 30 days of the resolution.
          </p>

          <h2>6. Acceptable use</h2>
          <p>You won&apos;t:</p>
          <ul>
            <li>Use Jaratrade to list goods that are unlawful to import to or export from any jurisdiction we operate in</li>
            <li>Manipulate ratings, listings, or search results</li>
            <li>Probe, scan, or otherwise interfere with the security of the service</li>
            <li>Use the marketplace to launder funds or evade sanctions</li>
            <li>Solicit Jaratrade users off-platform to avoid commission</li>
          </ul>

          <h2>7. Fees and taxes</h2>
          <p>
            Sellers are responsible for collecting and remitting any taxes (VAT, customs duty,
            corporate tax) applicable to their sales in their jurisdiction. Buyers are
            responsible for import duties unless those are quoted as part of a DDP shipment.
            Jaratrade does not provide tax advice; consult a qualified accountant.
          </p>

          <h2>8. Intellectual property</h2>
          <p>
            The Jaratrade name, logo, designs, and software are owned by Jaratrade. Listings
            (photos, copy) submitted by sellers remain the property of those sellers, but you
            grant us a worldwide, royalty-free licence to display them on the marketplace.
          </p>

          <h2>9. Liability</h2>
          <p>
            To the maximum extent permitted by law, Jaratrade&apos;s liability for any loss
            arising from the use of the service is capped at the total fees paid by you to
            Jaratrade in the 12 months preceding the claim. We&apos;re not liable for indirect
            or consequential losses (lost profits, business interruption).
          </p>

          <h2>10. Termination</h2>
          <p>
            You may close your account at any time from your account settings. We may
            suspend or terminate an account if we believe you&apos;ve violated these terms or
            pose a risk to other users. Funds owed to a seller at the time of termination are
            paid out after any open disputes are resolved.
          </p>

          <h2>11. Governing law</h2>
          <p>
            These terms are governed by the laws of England &amp; Wales for buyers based in
            the UK and Nigerian law for sellers based in Nigeria. Disputes between Jaratrade
            and a user will be resolved in the courts of the user&apos;s jurisdiction.
          </p>

          <h2>12. Changes</h2>
          <p>
            We may update these terms from time to time. Material changes will be flagged via
            email and a banner in the dashboard at least 14 days before they take effect.
            Continued use after the change date constitutes acceptance.
          </p>

          <h2>13. Contact</h2>
          <p>
            Questions? Email{" "}
            <a href="mailto:admin@jaratrade.com">admin@jaratrade.com</a> or
            reach us via the <a href="/contact">contact page</a>.
          </p>
        </Prose>
      </section>
    </>
  );
}

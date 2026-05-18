/**
 * /legal/terms - Terms of Service.
 *
 * A detailed marketplace terms-of-service template, structured for clarity.
 * Real-world deployment should still be reviewed by qualified counsel
 * before going live, but the structure and language here mirror what a
 * marketplace operator in England and Wales / Nigeria would expect to see.
 */
import type { Metadata } from "next";
import { PageHero } from "@/components/marketing/page-hero";
import { Prose } from "@/components/marketing/prose";

export const metadata: Metadata = {
  title: "Terms of service",
  description:
    "The terms governing your use of Jaratrade as a buyer, seller, or visitor. Plain English where possible, precise where it has to be.",
};

const LAST_UPDATED = "18 May 2026";
const EFFECTIVE_DATE = "18 May 2026";

export default function TermsPage() {
  return (
    <>
      <PageHero
        eyebrow="Legal"
        title="Terms of Service"
        description={`Last updated ${LAST_UPDATED}. Effective ${EFFECTIVE_DATE}. These terms govern your use of jaratrade.com and the related Jaratrade services.`}
      />
      <section className="container mx-auto max-w-5xl px-4 pb-20 sm:px-6 lg:px-8 lg:pb-24">
        <Prose>
          <h2>1. Parties &amp; acceptance</h2>
          <p>
            These Terms of Service (the &quot;<strong>Terms</strong>&quot;) form a
            binding agreement between Jaratrade Ltd, a company incorporated in
            England &amp; Wales (&quot;<strong>Jaratrade</strong>&quot;, &quot;we&quot;,
            &quot;us&quot;, &quot;our&quot;) and you (&quot;<strong>you</strong>&quot;,
            &quot;your&quot;), being the natural person or legal entity accessing or using
            the Jaratrade marketplace at jaratrade.com (the
            &quot;<strong>Platform</strong>&quot;).
          </p>
          <p>
            By creating an account, posting a listing, placing an order or otherwise
            using the Platform, you confirm that you have read, understood, and agree to
            be bound by these Terms, the <a href="/legal/privacy">Privacy Policy</a>, the{" "}
            <a href="/legal/cookies">Cookie Policy</a>, and any role-specific addenda
            referenced below. If you do not agree, you must not use the Platform.
          </p>
          <p>
            If you accept these Terms on behalf of a company, partnership, or other
            entity, you represent that you have the authority to bind that entity, and
            &quot;you&quot; refers to that entity.
          </p>

          <h2>2. Definitions</h2>
          <ul>
            <li><strong>Buyer / Importer:</strong> a user who places orders to purchase Goods through the Platform.</li>
            <li><strong>Seller / Exporter:</strong> a verified user who lists Goods for sale on the Platform.</li>
            <li><strong>Goods:</strong> the products listed and offered for sale by Sellers on the Platform.</li>
            <li><strong>Listing:</strong> any product description, price, photograph, specification or other content posted by a Seller offering Goods for sale.</li>
            <li><strong>Order:</strong> a binding offer to purchase Goods placed by a Buyer that has been accepted by the Seller.</li>
            <li><strong>Escrow Funds:</strong> Buyer payments held by our payment partner (Flutterwave) pending delivery confirmation.</li>
            <li><strong>Commission:</strong> the percentage fee Jaratrade deducts from each completed transaction (currently 2% on Free Tier, 1.5% on Premium Tier).</li>
            <li><strong>KYC:</strong> &quot;Know Your Customer&quot; - the verification checks performed on Sellers (and high-volume Buyers) before they may transact on the Platform.</li>
          </ul>

          <h2>3. Eligibility &amp; account registration</h2>
          <h3>3.1 Personal eligibility</h3>
          <p>
            To register, you must be at least 18 years old, have the legal capacity to
            enter into a binding contract under the laws of the jurisdiction in which
            you reside, and not be located in, ordinarily resident in, or organised
            under the laws of any country subject to comprehensive UK or UN sanctions.
          </p>
          <h3>3.2 Business eligibility (Sellers)</h3>
          <p>Seller accounts additionally require:</p>
          <ul>
            <li>Active registration with the Corporate Affairs Commission of Nigeria (CAC) (sole proprietorship or limited liability accepted);</li>
            <li>A valid director-level government-issued ID (NIN, Nigerian passport, driver&apos;s licence);</li>
            <li>An operational bank account in the registered business name;</li>
            <li>A verifiable physical operating address; and</li>
            <li>Satisfactory completion of our KYC process (see Section 8).</li>
          </ul>
          <h3>3.3 Account security</h3>
          <p>
            You are responsible for maintaining the confidentiality of your login
            credentials and for all activities that occur under your account. You must
            notify us at <a href="mailto:admin@jaratrade.com">admin@jaratrade.com</a> within
            twenty-four (24) hours of becoming aware of any unauthorised use or
            suspected compromise of your account. We may reset your password, suspend
            your account, or require additional verification (including 2FA) in
            response to a suspected security incident, at our reasonable discretion.
          </p>

          <h2>4. The marketplace</h2>
          <h3>4.1 Nature of the service</h3>
          <p>
            Jaratrade operates an online marketplace that connects independent Buyers
            and Sellers. <strong>Jaratrade is not the seller of the Goods.</strong> The
            contract for the sale of any Goods is concluded directly between the
            Buyer and the Seller listed on the relevant Order. Jaratrade is a party
            to the contract <em>only</em> in respect of its platform, escrow, dispute,
            and payment-facilitation services.
          </p>
          <h3>4.2 Seller representations</h3>
          <p>Sellers represent and warrant that, for each Listing they post:</p>
          <ul>
            <li>They have good title to the Goods, free of liens or third-party claims;</li>
            <li>The Goods conform to the description, photographs, MOQ, weight and specifications stated in the Listing;</li>
            <li>The Goods can be lawfully imported into the United Kingdom (and other jurisdictions where the Listing is visible);</li>
            <li>The Goods comply with applicable food-safety, labelling, cosmetic, and product-safety regulations;</li>
            <li>Stock counts and inventory dates are accurate at time of listing and are confirmed at least weekly.</li>
          </ul>
          <h3>4.3 Buyer obligations</h3>
          <p>Buyers warrant that:</p>
          <ul>
            <li>They have the legal authority and financial capacity to enter into the Order;</li>
            <li>They will provide accurate shipping, billing, and customs information;</li>
            <li>They will pay all duties, taxes, and import charges due in their jurisdiction unless those are explicitly included in a DDP (Delivered Duty Paid) shipment selected at checkout;</li>
            <li>They will inspect the Goods upon receipt and raise any dispute within the seven (7) day window described in Section 9.</li>
          </ul>

          <h2>5. Orders, pricing &amp; payment</h2>
          <h3>5.1 Order formation</h3>
          <p>
            A Listing is an invitation to treat, not an offer. An Order placed by a
            Buyer is a binding offer to purchase. The contract of sale forms when the
            Seller (or, on the Seller&apos;s behalf, Jaratrade) accepts the Order and
            successful payment has cleared into escrow.
          </p>
          <h3>5.2 Pricing &amp; currency</h3>
          <p>
            Prices are displayed in the currency stated on each Listing (typically NGN
            or GBP). Currency conversion (where applicable) is calculated at the
            wholesale interbank rate plus a published margin and is displayed before
            the Buyer confirms payment.
          </p>
          <h3>5.3 Payment processing</h3>
          <p>
            All payments are processed through our payment partner, Flutterwave
            (Flutterwave Payments Technology Solutions Limited and its affiliates),
            which is regulated where applicable and certified as PCI DSS Level 1.
            Jaratrade does not store full payment card numbers; we retain only the
            transaction reference, the last four digits, and (where the Buyer has
            consented) a tokenised card identifier for the purpose of automatic
            subscription renewal.
          </p>
          <h3>5.4 Escrow &amp; release</h3>
          <p>
            Buyer payments are split at the moment of payment by Flutterwave between
            (a) a Seller-specific Flutterwave subaccount that holds the Seller&apos;s
            share in escrow, and (b) Jaratrade&apos;s commission account. The
            Seller&apos;s share remains in escrow until one of the following triggers
            occurs:
          </p>
          <ol>
            <li>
              <strong>Buyer confirmation:</strong> the Buyer presses
              &quot;Confirm receipt&quot; on the Order page. The Seller&apos;s payout
              is released by our next nightly disbursement run, typically within
              twenty-four (24) hours;
            </li>
            <li>
              <strong>Dispute-window expiry:</strong> seven (7) calendar days have
              elapsed since the Seller marked the Order as delivered and no dispute
              has been raised. The Seller&apos;s payout is then released
              automatically by our nightly process;
            </li>
            <li>
              <strong>Dispute resolution:</strong> a dispute is resolved under
              Section 7 and Jaratrade releases funds in accordance with that
              resolution.
            </li>
          </ol>
          <p>
            Payouts are dispatched to the Seller&apos;s nominated Nigerian bank
            account via Flutterwave&apos;s Transfers service. Funds at all times
            remain with our regulated payment partner; they never enter Jaratrade&apos;s
            operating bank balance. The Seller receives a payout reference for each
            disbursement.
          </p>
          <p>
            <strong>Pressing &quot;Confirm receipt&quot; is final.</strong> Once you
            confirm receipt you waive the 7-day dispute window and the Seller is paid
            on the next nightly run. If you have any concern about the Order &mdash;
            damage, missing items, late delivery &mdash; raise a dispute first (see
            Section 7) instead of confirming receipt.
          </p>
          <h3>5.5 Commission &amp; fees</h3>
          <p>
            Jaratrade charges a transaction Commission, currently 2% on the Free Tier
            and 1.5% on the Premium Tier. The prevailing rate is administered by
            Jaratrade and is displayed on every Order at checkout, so you always see
            the exact rate that will apply before you pay. We may from time to time
            vary the Commission on at least thirty (30) days&apos; written notice. We
            reserve the right to introduce additional fees (for example, withdrawal
            fees or expedited-verification fees) on the same notice period. No
            listing fees, no setup fees, and no monthly minimums apply to the Free
            Tier.
          </p>

          <h2>6. Shipping &amp; risk</h2>
          <h3>6.1 Shipping arrangement</h3>
          <p>
            Shipping is either (a) arranged by the Seller using a freight forwarder of
            their choice (&quot;Self-Ship&quot;), or (b) arranged through a
            Jaratrade-vetted logistics partner selected at checkout. In case (b), the
            displayed quoted price covers freight, applicable customs duty and last-
            mile delivery (Incoterm 2020: DDP), unless the Listing specifies a
            different Incoterm.
          </p>
          <h3>6.2 Risk &amp; title</h3>
          <p>
            Risk of loss or damage to the Goods passes to the Buyer in accordance with
            the Incoterm displayed on the Order at checkout. Title to the Goods passes
            to the Buyer when escrow funds are released to the Seller under Section
            5.4.
          </p>
          <h3>6.3 Delivery times</h3>
          <p>
            Delivery times are estimates only. Jaratrade and the Seller will use
            reasonable efforts to meet stated timelines but neither is liable for
            delays caused by customs authorities, force majeure events (Section 14),
            inaccurate Buyer-provided information, or carrier disruption beyond
            reasonable control.
          </p>

          <h2>7. Disputes &amp; refunds</h2>
          <h3>7.1 Dispute window</h3>
          <p>
            A Buyer may raise a dispute within seven (7) calendar days of the Order
            being marked as delivered by the Seller (or, where delivery confirmation
            is unavailable, within seven (7) calendar days of the latest tracking
            event). Disputes raised outside this window will be considered only at
            Jaratrade&apos;s discretion and only on production of new material
            evidence.
          </p>
          <p>
            The Buyer will receive an email notification each time the Seller advances
            the Order status (paid, confirmed, preparing, shipped, delivered) so the
            dispute window is clearly anchored. A Buyer who presses &quot;Confirm
            receipt&quot; on the Order page waives the remainder of the dispute window
            (see Section 5.4); the Buyer should raise any concern <em>before</em>
            confirming receipt.
          </p>
          <h3>7.2 Process</h3>
          <p>The dispute process has three stages:</p>
          <ol>
            <li><strong>Open</strong> - the Buyer submits a description and (where possible) photographic evidence. The Seller is notified immediately and may respond.</li>
            <li><strong>In review</strong> - a Jaratrade trust &amp; safety analyst reviews the case, usually within one (1) business day.</li>
            <li><strong>Resolved</strong> - one of three outcomes: (a) refund (full or partial), (b) replacement at the Seller&apos;s cost, or (c) dismissed with written reasons.</li>
          </ol>
          <h3>7.3 Refunds</h3>
          <p>
            Approved refunds are processed back to the Buyer&apos;s original payment
            method via Flutterwave within five (5) business days. Where Goods are
            being returned, Jaratrade may withhold refund release until the Seller
            confirms receipt of the returned Goods in their original condition.
          </p>
          <h3>7.4 Finality</h3>
          <p>
            Jaratrade&apos;s decision on a dispute is final and binding for the
            purposes of platform escrow release. The parties retain whatever
            statutory or common-law rights of action they may have against each other
            outside the platform.
          </p>

          <h2>8. KYC &amp; verification</h2>
          <h3>8.1 Information required</h3>
          <p>
            Sellers and high-volume Buyers must provide, on request, information and
            documentation necessary for Jaratrade to comply with applicable
            anti-money-laundering, counter-terrorism-financing, sanctions, and
            consumer-protection laws. This may include corporate registration
            documents, beneficial-ownership disclosures, government-issued
            photographic ID, proof of address, bank statements and tax identification
            numbers.
          </p>
          <h3>8.2 Ongoing diligence</h3>
          <p>
            We may from time to time refresh our KYC records on a user. Failure to
            respond to a refresh request within fourteen (14) days may result in
            account restriction (including suspension of Listings) until the request
            is satisfied.
          </p>
          <h3>8.3 Verified badge</h3>
          <p>
            Sellers who have successfully completed KYC and remain in good standing
            are entitled to display the &quot;Verified&quot; badge on their profile
            and listings. The badge is granted by Jaratrade in its sole discretion and
            may be withdrawn (with reasons) at any time.
          </p>

          <h2>9. Acceptable use</h2>
          <p>You agree that you will not, and will not permit any third party to:</p>
          <ul>
            <li>List, offer or sell Goods that are illegal to import to or export from any jurisdiction in which the Platform operates, including (without limitation) narcotic drugs, prescription pharmaceuticals, firearms, wildlife products restricted under CITES, counterfeit goods, or goods subject to applicable sanctions;</li>
            <li>Misrepresent the origin, composition, weight, expiry date or condition of any Goods;</li>
            <li>Manipulate Listings, search rankings, ratings, or reviews (including by creating multiple accounts, paying for reviews, or coordinating with affiliates);</li>
            <li>Probe, scan, penetration-test, scrape (other than by the Platform&apos;s public APIs and within published rate limits), or otherwise interfere with the technical operation of the Platform;</li>
            <li>Use the Platform to launder funds, evade taxes, or facilitate fraud;</li>
            <li>Solicit Jaratrade users off-platform with the purpose of avoiding Commission, or instruct any user to bypass the Platform&apos;s payment or escrow system;</li>
            <li>Reverse-engineer, decompile, or otherwise attempt to derive source code from any Jaratrade software except to the extent that applicable law expressly permits.</li>
          </ul>

          <h2>10. Intellectual property</h2>
          <h3>10.1 Jaratrade IP</h3>
          <p>
            The Jaratrade name, logo, designs, source code, and the Platform
            interface are owned by Jaratrade or its licensors. Nothing in these Terms
            transfers any intellectual property right in the Platform to you. You may
            not use the Jaratrade name or logo in advertising, press releases, or
            marketing materials without our prior written consent.
          </p>
          <h3>10.2 Your content</h3>
          <p>
            You retain all rights in the content you submit to the Platform
            (Listings, photographs, descriptions, reviews, messages). You grant
            Jaratrade a worldwide, royalty-free, non-exclusive, sublicensable licence
            to host, display, reproduce, modify (for the limited purpose of resizing
            or transcoding), and distribute that content on the Platform and in
            marketing materials referring to the Platform, for the duration of your
            account plus a reasonable archival period.
          </p>
          <h3>10.3 Takedown</h3>
          <p>
            We will respond to good-faith allegations of intellectual property
            infringement received at{" "}
            <a href="mailto:admin@jaratrade.com">admin@jaratrade.com</a>. Notices must
            identify the work alleged to be infringed, the allegedly infringing
            content, contact details of the complainant, and a statement made under
            penalty of perjury that the complainant has a good-faith belief that the
            use is not authorised.
          </p>

          <h2>11. Limitation of liability</h2>
          <p>
            To the maximum extent permitted by applicable law:
          </p>
          <ul>
            <li>Jaratrade&apos;s total aggregate liability to you under or in connection with these Terms (whether in contract, tort, including negligence, statutory duty or otherwise) shall not exceed the greater of (i) the total Commission paid by or attributable to you in the twelve (12) months preceding the event giving rise to liability, and (ii) one hundred pounds sterling (£100);</li>
            <li>Neither party is liable to the other for indirect, consequential, incidental, special or punitive damages, including (without limitation) loss of profit, loss of revenue, loss of goodwill, loss of data, or business interruption, even if advised of the possibility of such damages;</li>
            <li>Nothing in these Terms limits or excludes liability for death or personal injury caused by negligence, fraud or fraudulent misrepresentation, or any other liability that cannot be limited or excluded by law.</li>
          </ul>

          <h2>12. Indemnification</h2>
          <p>
            You agree to indemnify, defend and hold harmless Jaratrade, its officers,
            directors, employees and agents from and against any third-party claims,
            damages, liabilities, costs and expenses (including reasonable legal fees)
            arising out of or related to: (a) your breach of these Terms; (b) your
            violation of any applicable law or regulation; (c) any allegation that
            content you submitted, or Goods you sold or purchased, infringe a third
            party&apos;s rights; or (d) any dispute between you and another user that
            we are required to defend or respond to.
          </p>

          <h2>13. Suspension &amp; termination</h2>
          <p>
            You may close your account at any time from your account settings, subject
            to completion of any open Orders or disputes. We may suspend or terminate
            an account, with or without prior notice, where we reasonably believe that
            you have: (a) breached these Terms; (b) failed KYC or refused a reasonable
            KYC refresh; (c) presented a risk to other users, the Platform, or our
            payment partners; or (d) are or have become subject to applicable
            sanctions. On termination, accrued obligations (including payment, refund,
            and confidentiality obligations) survive.
          </p>

          <h2>14. Force majeure</h2>
          <p>
            Neither party is liable for delay or failure in performance caused by
            events beyond its reasonable control, including (without limitation) acts
            of God, fire, flood, civil unrest, war, terrorism, government action,
            currency-control measures, network outages, port or customs disruption,
            pandemic, or labour disputes. The affected party must notify the other in
            writing as soon as reasonably practicable and use commercially reasonable
            efforts to mitigate the impact.
          </p>

          <h2>15. Governing law &amp; jurisdiction</h2>
          <p>
            These Terms are governed by the laws of England &amp; Wales for users
            based in the United Kingdom, the European Economic Area, or any other
            jurisdiction in which Nigerian law does not otherwise apply by virtue of
            the user&apos;s residence or place of business. For users based in
            Nigeria, the laws of the Federal Republic of Nigeria apply. The parties
            submit to the non-exclusive jurisdiction of the courts of England &amp;
            Wales or the High Court of Lagos State (as applicable). Nothing in this
            clause prevents Jaratrade from seeking interim or injunctive relief in any
            court of competent jurisdiction.
          </p>

          <h2>16. Changes to these Terms</h2>
          <p>
            We may amend these Terms from time to time. Material changes will be
            notified to you by email and via a dashboard banner at least fourteen (14)
            days before the change takes effect. Continued use of the Platform after
            the effective date constitutes acceptance of the revised Terms. If you do
            not accept a change, you may close your account at any time before the
            effective date.
          </p>

          <h2>17. Miscellaneous</h2>
          <ul>
            <li><strong>Entire agreement.</strong> These Terms, together with the documents referenced in Section 1, constitute the entire agreement between you and Jaratrade relating to the Platform and supersede any prior agreements or understandings.</li>
            <li><strong>Severability.</strong> If any provision is held to be unenforceable, the remaining provisions shall continue in full force.</li>
            <li><strong>Assignment.</strong> You may not assign your rights or obligations under these Terms without our prior written consent. We may assign these Terms to an affiliate or in connection with a merger, acquisition, or sale of assets.</li>
            <li><strong>No waiver.</strong> Our failure to enforce any provision is not a waiver of our right to do so later.</li>
            <li><strong>Notices.</strong> Notices to Jaratrade must be sent to{" "}
              <a href="mailto:admin@jaratrade.com">admin@jaratrade.com</a>. Notices
              to you will be sent to the email address on your account.</li>
            <li><strong>Language.</strong> These Terms are written in English. Translations are provided for convenience; in case of conflict, the English version controls.</li>
          </ul>

          <h2>18. Contact</h2>
          <p>
            Questions about these Terms? Email{" "}
            <a href="mailto:admin@jaratrade.com">admin@jaratrade.com</a> or visit the{" "}
            <a href="/contact">contact page</a>.
          </p>
        </Prose>
      </section>
    </>
  );
}

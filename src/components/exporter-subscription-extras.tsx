/**
 * ExporterSubscriptionExtras — benefits comparison + FAQ section appended
 * below the SubscriptionPage component on /exporter/subscription.
 *
 * Why a separate component:
 *  - SubscriptionPage is shared with the importer route (well, was until
 *    we gated importers out), so role-specific copy doesn't belong inside
 *    it.
 *  - Keeping benefits + FAQ together makes the upgrade decision easier to
 *    make in one scroll.
 */
import {
  Crown,
  Search,
  Megaphone,
  Headphones,
  Layers,
  TrendingUp,
  ShieldCheck,
  Zap,
} from "lucide-react";

const benefits = [
  {
    icon: TrendingUp,
    title: "Lower commission, more margin",
    detail:
      "Premium drops your per-transaction fee from 2% to 1.5%. On a ₦35,000 sack of garri that's ₦175 back in your pocket every order. At 10 orders/day it pays for the plan inside the first week.",
  },
  {
    icon: Search,
    title: "Top-of-search placement",
    detail:
      "Sponsored listings sit above the regular catalogue ranking on /products. Buyers who filter by your category see you before anyone else.",
  },
  {
    icon: Megaphone,
    title: "Up to 10 promoted listings",
    detail:
      "Pick the 10 SKUs you most want to move and we'll surface them across the homepage and category pages. Rotate as often as you like.",
  },
  {
    icon: Layers,
    title: "Unlimited stores &amp; listings",
    detail:
      "Free tier caps you at 2 stores and 5 SKUs. Premium removes both ceilings - sell from every market you operate in.",
  },
  {
    icon: Headphones,
    title: "12-hour priority support",
    detail:
      "Direct line to the exporter ops team. Critical issues (payment delays, customs holds, dispute escalations) come back to you the same day, not in two.",
  },
  {
    icon: ShieldCheck,
    title: "Early access to new buyers",
    detail:
      "When we onboard a new UK importer, premium sellers are notified first so you can quote before the catalogue fills in for them.",
  },
];

const faqs = [
  {
    q: "Do I have to pay to list on Jaratrade?",
    a: "No. The Free tier costs nothing per month and you can list up to 5 products across 2 stores. You only pay a 2% commission when you make a sale - and even that comes out of the buyer's payment, not your wallet.",
  },
  {
    q: "What's the difference between Free and Premium?",
    a: "Three things: (1) commission - 2% on Free vs 1.5% on Premium, (2) listing ceilings - 5 SKUs / 2 stores on Free vs unlimited on Premium, and (3) visibility - Premium sellers get sponsored search placement plus 12-hour priority support.",
  },
  {
    q: "When is Premium worth it?",
    a: "If you're shipping more than 5 orders a week (or any single order over ~₦300k), the commission savings alone usually cover the ₦150,000 monthly fee. Plus you get the sponsored placement and 10 promoted SKUs included.",
  },
  {
    q: "Can I switch between plans?",
    a: "Yes, any time. Downgrade and you keep Premium benefits until the end of the current billing period, then drop to Free. Upgrade and you're on Premium immediately - we prorate nothing because the value comes from the listings, not the days.",
  },
  {
    q: "How does payment work?",
    a: "Premium is charged monthly via Flutterwave on the same card you signed up with. We retry up to three times if a payment fails, and email you each time. If all three attempts fail, you stay live but drop to the Free tier - no service interruption.",
  },
  {
    q: "What happens if I cancel?",
    a: "You keep Premium until the end of the billing period, then drop to Free automatically. All your listings stay live (up to the Free tier caps); listings above the cap are paused, not deleted. Re-upgrade any time to bring them back.",
  },
  {
    q: "Do I need to be verified to subscribe?",
    a: "Yes. You can sign up for a Free account immediately, but you can't list products or subscribe to Premium until your KYC review clears. We turn this around in 24-48 hours for clean applications.",
  },
  {
    q: "Is there a contract or commitment?",
    a: "No contract, no minimum term. Cancel from your subscription page any time. We bill in 30-day cycles and Premium ends at the end of whichever cycle you're in when you cancel.",
  },
];

export function ExporterSubscriptionExtras() {
  return (
    <>
      {/* Benefits */}
      <section className="container mx-auto max-w-7xl px-4 pb-16 pt-8 sm:px-6 lg:px-8 lg:pb-20">
        <div className="mb-10 max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
            What Premium unlocks
          </p>
          <h2 className="mt-2 font-display text-2xl font-bold tracking-tight sm:text-3xl">
            Six concrete reasons to upgrade
          </h2>
          <p className="mt-3 text-sm text-muted-foreground">
            Every benefit below is something a Free-tier seller can&apos;t do.
            No vague &quot;enhanced&quot; or &quot;advanced&quot; - real changes
            you&apos;ll feel in week one.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {benefits.map((b) => (
            <article
              key={b.title}
              className="rounded-2xl border border-border/70 bg-card p-6 transition-colors hover:border-primary/30"
            >
              <div className="mb-4 grid size-11 place-items-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/15">
                <b.icon className="size-5" aria-hidden />
              </div>
              <h3
                className="font-display text-base font-semibold tracking-tight"
                dangerouslySetInnerHTML={{ __html: b.title }}
              />
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{b.detail}</p>
            </article>
          ))}
        </div>
      </section>

      {/* Pay-back panel - quick maths to make Premium feel obvious */}
      <section className="container mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
        <div className="relative isolate overflow-hidden rounded-3xl border border-primary/20 bg-card p-6 shadow-[var(--shadow-soft)] sm:p-8">
          <div
            className="pointer-events-none absolute -right-16 -top-16 size-56 rounded-full blur-3xl opacity-50"
            style={{ background: "radial-gradient(circle, oklch(0.49 0.2186 264 / 0.35), transparent 70%)" }}
            aria-hidden
          />
          <div className="relative grid gap-5 sm:grid-cols-[auto_1fr] sm:items-center sm:gap-7">
            <div className="grid size-14 place-items-center rounded-2xl bg-primary/10 text-primary ring-1 ring-primary/15">
              <Zap className="size-6" aria-hidden />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">
                Quick maths
              </p>
              <p className="mt-1.5 font-display text-lg font-semibold leading-snug tracking-tight sm:text-xl">
                On ~₦30M of monthly sales, the 0.5% commission saving alone covers your Premium fee.
                Everything else (sponsored placement, unlimited listings, priority support) is upside.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="container mx-auto max-w-3xl px-4 pb-20 sm:px-6 lg:px-8 lg:pb-24">
        <div className="mb-10 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
            FAQ
          </p>
          <h2 className="mt-2 font-display text-2xl font-bold tracking-tight sm:text-3xl">
            Common questions about Premium
          </h2>
        </div>
        <dl className="space-y-3">
          {faqs.map((f) => (
            <details
              key={f.q}
              className="group rounded-2xl border border-border/70 bg-card transition-colors hover:border-primary/30"
            >
              <summary className="flex cursor-pointer items-center justify-between gap-3 px-6 py-4 [&::-webkit-details-marker]:hidden">
                <span className="font-display text-base font-semibold tracking-tight">
                  {f.q}
                </span>
                <span
                  className="grid size-7 shrink-0 place-items-center rounded-full bg-muted text-foreground/70 transition-transform group-open:rotate-45"
                  aria-hidden
                >
                  <svg viewBox="0 0 14 14" fill="none" className="size-3">
                    <path d="M7 2v10M2 7h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                </span>
              </summary>
              <dd className="px-6 pb-5 text-sm leading-relaxed text-muted-foreground">
                {f.a}
              </dd>
            </details>
          ))}
        </dl>
      </section>

      {/* Bottom tag */}
      <div className="container mx-auto max-w-3xl px-4 pb-16 text-center text-xs text-muted-foreground sm:px-6 lg:px-8">
        <p className="inline-flex items-center gap-1.5">
          <Crown className="size-3.5 text-accent" aria-hidden />
          Premium is opt-in. Cancel anytime from this page.
        </p>
      </div>
    </>
  );
}

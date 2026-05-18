/**
 * How it works - numbered three-step process card.
 *
 * Each step is presented as a card with a large brand-tinted numeral, a
 * concise title, and a one-paragraph description. The numerals use the
 * display font with reduced opacity so the title remains the primary read.
 */
import { ShoppingBag, CreditCard, Package } from "lucide-react";

const steps = [
  {
    icon: ShoppingBag,
    title: "Browse & order",
    description:
      "Search catalogued products from verified Nigerian exporters. Filter by market, category, and price.",
  },
  {
    icon: CreditCard,
    title: "Pay securely",
    description:
      "Card, bank transfer or USSD. Funds are held by Flutterwave until your shipment leaves the seller's warehouse.",
  },
  {
    icon: Package,
    title: "Ship & receive",
    description:
      "Pick a Jaratrade-vetted logistics partner at checkout or arrange your own freight. Track every leg.",
  },
];

export function HowItWorks() {
  return (
    <section
      className="container mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28"
      aria-labelledby="how-it-works-title"
    >
      <div className="mx-auto max-w-2xl text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
          How it works
        </p>
        <h2
          id="how-it-works-title"
          className="mt-3 font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl"
        >
          From discovery to delivery in three steps
        </h2>
        <p className="mt-4 text-base text-muted-foreground sm:text-lg">
          Whether you&apos;re sourcing one carton or a full container - the path
          to your shipment is the same.
        </p>
      </div>

      <ol className="mt-14 grid gap-6 sm:gap-8 lg:grid-cols-3">
        {steps.map((step, i) => (
          <li
            key={step.title}
            className="group relative overflow-hidden rounded-2xl border border-border/70 bg-card p-7 transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-[var(--shadow-brand)]"
          >
            {/* Large faded numeral in the back */}
            <span
              className="pointer-events-none absolute -right-2 -top-6 font-display text-[8rem] font-bold leading-none text-primary/[0.08] select-none"
              aria-hidden
            >
              {String(i + 1).padStart(2, "0")}
            </span>

            <div className="relative">
              <div className="mb-5 grid size-12 place-items-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/15">
                <step.icon className="size-6" aria-hidden />
              </div>
              <h3 className="font-display text-xl font-semibold tracking-tight">
                {step.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {step.description}
              </p>
            </div>

            {/* Bottom border accent on hover */}
            <span
              className="absolute inset-x-7 bottom-0 h-0.5 origin-left scale-x-0 bg-primary transition-transform duration-300 group-hover:scale-x-100"
              aria-hidden
            />
          </li>
        ))}
      </ol>
    </section>
  );
}

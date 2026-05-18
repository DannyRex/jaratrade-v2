"use client";

/**
 * /importer/subscription — kept as a route for old bookmarks, but importers
 * don't subscribe. Renders a friendly "this isn't a thing here" message
 * with a link back to the marketplace.
 */
import Link from "next/link";
import { PartyPopper } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ImporterSubscriptionPage() {
  return (
    <div className="mx-auto max-w-2xl py-12 text-center">
      <div className="mx-auto mb-6 grid size-14 place-items-center rounded-2xl bg-success/10 text-success ring-1 ring-success/20">
        <PartyPopper className="size-7" aria-hidden />
      </div>
      <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
        Importing is free
      </h1>
      <p className="mx-auto mt-3 max-w-md text-muted-foreground">
        Browse, order, and ship as much as you like - there&apos;s no
        subscription for buyers. Sellers carry the cost on their side, so you
        only ever pay for the goods plus shipping.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Button asChild size="lg" className="rounded-full px-6 shadow-[var(--shadow-brand)]">
          <Link href="/products">Browse the catalogue</Link>
        </Button>
        <Button asChild size="lg" variant="outline" className="rounded-full px-6">
          <Link href="/importer/orders">My orders</Link>
        </Button>
      </div>
    </div>
  );
}

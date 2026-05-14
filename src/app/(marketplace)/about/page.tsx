import type { Metadata } from "next";
import Link from "next/link";
import { ShieldCheck, Truck, Globe, Users, Building2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";

export const metadata: Metadata = {
  title: "About Jaratrade",
  description:
    "Jaratrade is the trusted B2B marketplace for direct trade between Nigerian exporters and UK importers. Learn how we make Nigeria-UK trade seamless.",
};

export default function AboutPage() {
  return (
    <div className="container mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
      <PageHeader
        eyebrow="About us"
        title="Built to make Nigeria-UK trade seamless"
        description="Jaratrade connects verified Nigerian exporters with UK importers through one trusted, end-to-end marketplace."
      />

      <section className="prose prose-sm mt-6 max-w-none dark:prose-invert">
        <p>
          We started Jaratrade because the tools available for Nigeria-to-UK trade were
          fragmented, opaque, and slow. Importers spent hours chasing exporters on WhatsApp.
          Exporters had no way to reach diaspora buyers without a middleman taking a heavy cut.
          Logistics, payments and verification were three different problems with three different
          tools - none of them designed for the way this trade actually works.
        </p>
        <p>
          Jaratrade brings sourcing, payments, logistics and verification into one place. We
          verify every exporter, hold funds securely until shipment, and partner with logistics
          companies who specialise in Africa-to-UK shipping.
        </p>
      </section>

      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {[
          { icon: ShieldCheck, title: "Verified exporters", body: "KYC, business registration and means of ID checked before activation." },
          { icon: Truck, title: "Integrated logistics", body: "Vetted shipping partners or self-arranged - your choice at checkout." },
          { icon: Globe, title: "Cross-border payments", body: "Pay via Flutterwave with split-funds escrow for buyer protection." },
          { icon: Users, title: "Built with traders", body: "Every feature shaped by real Nigerian exporters and UK importers." },
          { icon: Building2, title: "Markets we cover", body: "Alaba, Aba, Mushin, Balogun, Onitsha, Dawanau and growing." },
          { icon: Sparkles, title: "Premium plans", body: "Unlimited transactions, priority support, sponsored listings." },
        ].map((feat) => (
          <div key={feat.title} className="rounded-lg border p-5">
            <div className="grid size-9 place-items-center rounded-lg bg-primary/10 text-primary">
              <feat.icon className="size-5" />
            </div>
            <h3 className="mt-3 text-sm font-semibold">{feat.title}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{feat.body}</p>
          </div>
        ))}
      </div>

      <div className="mt-12 rounded-2xl bg-primary/5 p-8 text-center">
        <h2 className="text-xl font-semibold">Ready to trade with us?</h2>
        <p className="mt-2 text-sm text-muted-foreground">Sign up in under five minutes.</p>
        <div className="mt-4 flex justify-center gap-2">
          <Button asChild>
            <Link href="/auth/register/importer">Sign up as importer</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/auth/register/exporter">Sign up as exporter</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

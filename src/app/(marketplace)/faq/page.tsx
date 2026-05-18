import type { Metadata } from "next";
import { PageHeader } from "@/components/ui/page-header";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

export const metadata: Metadata = {
  title: "Frequently asked questions",
  description:
    "Common questions about importing, exporting, payments and logistics on Jaratrade.",
};

const faqs = [
  {
    q: "What can I buy on Jaratrade?",
    a: "Right now we focus on Fast-Moving Consumer Goods (FMCGs) sourced from Nigerian markets - food and beverage, personal care, textiles and more. Each exporter sets their own minimum order quantities.",
  },
  {
    q: "How do I know an exporter is legit?",
    a: "Every exporter on Jaratrade goes through KYC. We verify business registration, means of ID, and bank details before their account is activated. Verified exporters carry a green checkmark on their profile.",
  },
  {
    q: "How does payment work?",
    a: "Payments are processed by Flutterwave. Cards, bank transfers and USSD are supported. At checkout your payment is split at the source: the seller's share lands in their Flutterwave subaccount, and Jaratrade's commission lands in our commission account - all in one secure transaction. The seller's share is held in escrow until the order completes (see 'When does the exporter get paid?' below).",
  },
  {
    q: "Can I arrange my own shipping?",
    a: "Yes. At checkout you'll see two options: pick a Jaratrade logistics partner with a unified quote, or use 'Importer arranged' and provide your own shipping address. Either way, the exporter ships to a verified destination.",
  },
  {
    q: "Is my shipping address saved for future orders?",
    a: "Yes. Once you place your first order with a shipping address, it's saved to your profile and auto-loaded at checkout next time. You can manage saved addresses, set a default, or add new ones from /importer/shipping. Picking a saved address skips the form entirely.",
  },
  {
    q: "Will I be notified when my order status changes?",
    a: "Yes. You'll get an email every time the exporter advances your order - paid, confirmed, preparing, shipped, delivered. Each email links straight to your order page. The exporter is notified by email the moment your payment clears so they can start preparing the shipment.",
  },
  {
    q: "When does the exporter get paid?",
    a: "The exporter is paid once the order is genuinely complete. Two paths trigger this: (1) you confirm receipt from the order page by pressing 'Confirm receipt' - the seller's payout is released right away, or (2) seven (7) calendar days pass after the exporter marks the order as delivered with no dispute raised - the payout is released automatically by our nightly process. Either way, funds transfer to the exporter's Nigerian bank account via Flutterwave's Transfers API. We hold the money in escrow throughout - it never enters Jaratrade's bank balance.",
  },
  {
    q: "What does subscription cost?",
    a: "There's a free tier with capped transactions and limited listings. Premium importers pay £150/month for unlimited transactions and priority support; premium exporters pay ₦150,000/month for unlimited stores, unlimited products, and sponsored placements.",
  },
  {
    q: "What's the commission?",
    a: "Free plan users pay 2% per transaction. Premium subscribers pay 1.5%. The rate is administered by Jaratrade and displayed on every order at checkout - the fee is split automatically by Flutterwave at the moment of payment, so there's no manual invoicing and no waiting for us to deduct it later.",
  },
  {
    q: "What if my order is delayed or damaged?",
    a: "Don't confirm receipt - that releases the payout. Instead, raise a dispute from your order page within seven (7) days of delivery. Our trust & safety team reviews the case (usually within one business day) and lands on one of three outcomes: refund, replacement, or dismissed with reasons. The seller is held in escrow throughout, so funds can't be released while a dispute is open.",
  },
  {
    q: "Can I leave a review?",
    a: "Yes - once an order is delivered, you'll be prompted to rate the exporter. Reviews are public and unlock the 'Verified buyer' tag on your profile.",
  },
];

export default function FaqPage() {
  return (
    <div className="container mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <PageHeader title="Frequently asked questions" description="Everything you need to know to get started on Jaratrade." />

      <Accordion type="single" collapsible className="mt-6">
        {faqs.map((item, i) => (
          <AccordionItem key={i} value={`q-${i}`}>
            <AccordionTrigger>{item.q}</AccordionTrigger>
            <AccordionContent className="text-muted-foreground">{item.a}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>

      {/* Structured data for SEO rich-results */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: faqs.map((f) => ({
              "@type": "Question",
              name: f.q,
              acceptedAnswer: { "@type": "Answer", text: f.a },
            })),
          }),
        }}
      />
    </div>
  );
}

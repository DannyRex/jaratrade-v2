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
    a: "Payments are processed by Flutterwave. Cards, bank transfers and USSD are supported. Funds are split - your payment goes to the exporter, the logistics provider, and Jaratrade's commission account in one secure transaction.",
  },
  {
    q: "Can I arrange my own shipping?",
    a: "Yes. At checkout you'll see two options: pick a Jaratrade logistics partner with a unified quote, or use 'Importer arranged' and provide your own shipping address. Either way, the exporter ships to a verified destination.",
  },
  {
    q: "What does subscription cost?",
    a: "There's a free tier with capped transactions and limited listings. Premium importers pay £150/month for unlimited transactions and priority support; premium exporters pay ₦150,000/month for unlimited stores, unlimited products, and sponsored placements.",
  },
  {
    q: "What's the commission?",
    a: "Free plan users pay 2% per transaction. Premium subscribers pay 1.5%. The fee is split automatically at checkout - no manual invoicing.",
  },
  {
    q: "What if my order is delayed or damaged?",
    a: "Funds aren't released to the exporter until you confirm receipt. If an issue arises, raise it from the order page within 7 days and our support team will mediate.",
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

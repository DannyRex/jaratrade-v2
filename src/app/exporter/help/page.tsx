import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const items = [
  {
    q: "How do I get paid?",
    a: "Add your bank details during onboarding. Funds clear to your account within 24 hours of order delivery confirmation.",
  },
  {
    q: "What if a buyer disputes an order?",
    a: "Funds stay in escrow during disputes. Our team mediates and contacts both parties within 24 hours.",
  },
  {
    q: "Can I run sponsored listings?",
    a: "Yes - Premium exporters can promote up to N products (depending on plan). Set up promotions from the Subscription tab.",
  },
  {
    q: "How do I update product images?",
    a: "Edit any product to upload new images. We recommend 1200×900 PNG/JPG. Images are stored on Cloudinary and served with auto-format.",
  },
];

export default function ExporterHelpPage() {
  return (
    <>
      <PageHeader title="Help & resources" description="Everything you need to grow on Jaratrade." />
      <Card>
        <CardContent className="p-6">
          <Accordion type="single" collapsible>
            {items.map((it, i) => (
              <AccordionItem key={i} value={`q-${i}`}>
                <AccordionTrigger>{it.q}</AccordionTrigger>
                <AccordionContent className="text-muted-foreground">{it.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>
    </>
  );
}

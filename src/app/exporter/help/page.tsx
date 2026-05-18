import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const items = [
  {
    q: "How do I get paid?",
    a: "Add your CAC, director ID and bank details during onboarding - we provision a Flutterwave subaccount in your name once you're KYC-approved. Each buyer's payment is split at source: your share lands in your subaccount (in escrow), Jaratrade's commission lands in ours. Your share is paid out to your Nigerian bank account either (a) the moment the buyer presses 'Confirm receipt' on their order, or (b) 7 days after you mark the order as delivered - whichever comes first. Payouts run on a nightly schedule via Flutterwave's Transfers API.",
  },
  {
    q: "What if a buyer disputes an order?",
    a: "Your escrow share stays locked until the dispute resolves. Our trust & safety team mediates within 1 business day. Outcomes are refund, replacement, or dismissed with reasons. A dismissed dispute lets the normal payout schedule resume.",
  },
  {
    q: "How do I update the status of an order?",
    a: "Open the order from your Orders tab and move it along the lifecycle: paid → confirmed → preparing → shipped → delivered. Each transition emails the buyer with a link back to their order page. Important: marking 'delivered' is what starts the 7-day payout clock, so only mark it once the order is actually with the buyer.",
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

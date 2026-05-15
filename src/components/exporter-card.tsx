import Link from "next/link";
import { ShieldCheck, ArrowUpRight } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { initials } from "@/lib/format";
import type { ExporterSummary } from "@/lib/types";

export function ExporterCard({ exporter }: { exporter: ExporterSummary }) {
  const name = exporter.business_name?.trim() || exporter.profile_name;
  return (
    <Card className="group relative overflow-hidden rounded-2xl border-border/70 transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-[var(--shadow-brand)]">
      <Link
        href={`/sellers/${encodeURIComponent(exporter.id)}`}
        className="absolute inset-0 z-10 rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        aria-label={`View ${name}'s shop`}
      >
        <span className="sr-only">View profile</span>
      </Link>
      <CardContent className="flex items-center gap-4 p-5">
        <Avatar className="size-14 ring-2 ring-primary/10">
          <AvatarFallback className="bg-gradient-to-br from-primary/20 to-brand-sky/15 text-base font-bold text-primary">
            {initials(name)}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex items-center gap-1.5">
            <p className="truncate text-sm font-semibold tracking-tight">{name}</p>
            <ShieldCheck className="size-3.5 shrink-0 text-success" aria-label="Verified" />
          </div>
          <p className="line-clamp-1 text-xs text-muted-foreground">
            {exporter.business_address || exporter.address}
          </p>
          <div className="flex items-center gap-1.5 pt-1">
            <Badge variant="secondary" className="rounded-full px-2 py-0.5 text-[10px] font-medium">
              {exporter.order_count} orders
            </Badge>
            {exporter.business_country ? (
              <Badge variant="outline" className="rounded-full px-2 py-0.5 text-[10px] font-medium">
                {exporter.business_country}
              </Badge>
            ) : null}
          </div>
        </div>
        <ArrowUpRight
          className="size-4 shrink-0 text-muted-foreground transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-primary"
          aria-hidden
        />
      </CardContent>
    </Card>
  );
}

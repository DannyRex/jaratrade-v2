import Link from "next/link";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { initials } from "@/lib/format";
import type { ExporterSummary } from "@/lib/types";

export function ExporterCard({ exporter }: { exporter: ExporterSummary }) {
  return (
    <Card className="group relative overflow-hidden transition-shadow hover:shadow-md">
      <Link
        href={`/sellers/${encodeURIComponent(exporter.id)}`}
        className="absolute inset-0 z-10"
        aria-label={exporter.business_name?.trim() || exporter.profile_name}
      >
        <span className="sr-only">View profile</span>
      </Link>
      <CardContent className="flex items-center gap-4 p-5">
        <Avatar className="size-12">
          <AvatarFallback className="bg-primary/10 text-primary">
            {initials(exporter.business_name?.trim() || exporter.profile_name)}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1 space-y-1">
          <p className="truncate text-sm font-semibold">
            {exporter.business_name?.trim() || exporter.profile_name}
          </p>
          <p className="line-clamp-1 text-xs text-muted-foreground">
            {exporter.business_address || exporter.address}
          </p>
          <div className="flex items-center gap-2 pt-0.5">
            <Badge variant="secondary" className="text-[10px]">
              {exporter.order_count} orders
            </Badge>
            {exporter.business_country ? (
              <Badge variant="outline" className="text-[10px]">
                {exporter.business_country}
              </Badge>
            ) : null}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

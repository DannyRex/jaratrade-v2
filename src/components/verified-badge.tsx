/**
 * VerifiedBadge — single source of truth for the "this seller has cleared
 * KYC and is admin-approved" visual.
 *
 * Two sizes:
 *   sm  : 16px shield + nothing else (used inline next to a name)
 *   md  : pill with shield + "Verified" wordmark (used on cards / profiles)
 *
 * We use the success token (a deep brand green) so it reads as a real
 * verification mark rather than decorative chrome.
 */
import { ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

interface VerifiedBadgeProps {
  size?: "sm" | "md" | "lg";
  className?: string;
  /** Show the wordmark next to the shield. Defaults to true on md/lg, false on sm. */
  showLabel?: boolean;
}

export function VerifiedBadge({ size = "md", className, showLabel }: VerifiedBadgeProps) {
  const label = showLabel ?? size !== "sm";

  if (!label) {
    return (
      <span
        className={cn(
          "inline-flex items-center text-success",
          size === "lg" ? "size-5" : "size-4",
          className,
        )}
        title="KYC-verified by Jaratrade"
      >
        <ShieldCheck className={size === "lg" ? "size-5" : "size-4"} aria-label="Verified" />
      </span>
    );
  }

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full bg-success/10 px-2 py-0.5 font-semibold text-success ring-1 ring-success/20",
        size === "lg" ? "text-xs sm:text-sm" : "text-[11px]",
        className,
      )}
      title="KYC-verified by Jaratrade"
    >
      <ShieldCheck className={size === "lg" ? "size-3.5" : "size-3"} aria-hidden />
      Verified
    </span>
  );
}

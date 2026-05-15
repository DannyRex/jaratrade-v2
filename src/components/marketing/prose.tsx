import { cn } from "@/lib/utils";

/**
 * Prose - long-form text wrapper with tuned typography.
 *
 * Replaces @tailwindcss/typography for the few content pages we have so we
 * don't have to ship the prose plugin. Spacing, weights, and link colors
 * match the design system tokens exactly.
 */
export function Prose({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        "max-w-3xl text-[15px] leading-[1.75] text-foreground/85",
        "[&_h2]:mt-12 [&_h2]:mb-3 [&_h2]:font-display [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:tracking-tight [&_h2]:text-foreground sm:[&_h2]:text-3xl",
        "[&_h3]:mt-8 [&_h3]:mb-2 [&_h3]:font-display [&_h3]:text-xl [&_h3]:font-semibold [&_h3]:tracking-tight [&_h3]:text-foreground",
        "[&_p]:mt-4",
        "[&_ul]:mt-4 [&_ul]:space-y-2 [&_ul]:pl-6 [&_ul>li]:list-disc [&_ul>li]:marker:text-primary",
        "[&_ol]:mt-4 [&_ol]:space-y-2 [&_ol]:pl-6 [&_ol>li]:list-decimal [&_ol>li]:marker:font-semibold [&_ol>li]:marker:text-primary",
        "[&_a]:font-medium [&_a]:text-primary [&_a]:underline [&_a]:underline-offset-4 hover:[&_a]:text-primary/80",
        "[&_strong]:font-semibold [&_strong]:text-foreground",
        "[&_code]:rounded [&_code]:bg-muted [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-[0.875em]",
        "[&_hr]:my-10 [&_hr]:border-border/70",
        className,
      )}
    >
      {children}
    </div>
  );
}

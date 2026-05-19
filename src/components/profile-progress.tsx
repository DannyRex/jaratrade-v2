"use client";

/**
 * ProfileProgress — drop-in completion bar shown on importer + exporter
 * dashboards. Computes percentage from the same field list the verification
 * team uses, so what the user sees in the UI matches what gates listing /
 * verification on the backend.
 *
 * Usage:
 *   <ProfileProgress role="exporter" />
 *
 * The component fetches the role-appropriate profile + business + bank
 * fields and renders:
 *   - a progress bar with the percentage complete
 *   - a "next step" CTA (jumps straight to the missing-field section)
 *   - a verified badge once admin has approved KYC
 */
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, ShieldCheck } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { VerifiedBadge } from "@/components/verified-badge";
import { importerApi, exporterApi } from "@/lib/api";
import { useAuth } from "@/lib/auth-store";
import { queryKeys } from "@/lib/queries";

type Role = "importer" | "exporter";

interface CompletionCheck {
  label: string;
  done: boolean;
  /** Anchor / route to jump to when the user wants to complete this item. */
  href?: string;
}

function computeImporterChecks(profile: Record<string, unknown> | undefined): CompletionCheck[] {
  const get = (k: string) => Boolean(profile?.[k]);
  const biz = (profile?.business as Record<string, unknown> | undefined) ?? {};
  // The "Shipping address" item ticks the moment the importer adds at
  // least one address via /importer/shipping. Reading user.address (the
  // home/personal address column on the users row) would be wrong - that
  // never gets touched by the shipping flow.
  const hasShipping = Boolean(profile?.has_shipping_address);
  return [
    { label: "Name & phone", done: get("firstname") && get("lastname") && get("phone"), href: "/importer/account" },
    { label: "Shipping address", done: hasShipping, href: "/importer/shipping" },
    { label: "Profile name", done: get("profile_name"), href: "/importer/account" },
    { label: "Business details (optional)", done: Boolean(biz?.business_name), href: "/importer/account" },
  ];
}

function computeExporterChecks(profile: Record<string, unknown> | undefined): CompletionCheck[] {
  const get = (k: string) => Boolean(profile?.[k]);
  const biz = (profile?.business as Record<string, unknown> | undefined) ?? {};
  return [
    { label: "Name & contact", done: get("firstname") && get("lastname") && get("phone"), href: "/exporter/profile" },
    { label: "Business name & CAC", done: Boolean(biz?.business_name && biz?.business_reg_number), href: "/exporter/profile" },
    { label: "Business address", done: Boolean(biz?.business_address), href: "/exporter/profile" },
    { label: "Valid ID uploaded", done: Boolean(biz?.valid_identification), href: "/exporter/profile" },
    { label: "TIN / tax ID", done: Boolean(biz?.tin), href: "/exporter/profile" },
    { label: "Bank account", done: Boolean((profile as { bank_account_id?: string })?.bank_account_id ?? biz?.bank_id), href: "/exporter/settings" },
  ];
}

export function ProfileProgress({ role }: { role: Role }) {
  const token = useAuth((s) => s.token);
  // Share the same query key the rest of the app uses for /profile so that
  // any mutation that invalidates the profile query (e.g. adding a shipping
  // address, updating business details) instantly refreshes the progress
  // bar without needing its own bespoke invalidation path.
  const profileQ = useQuery({
    queryKey: role === "importer" ? queryKeys.importerProfile : queryKeys.exporterProfile,
    queryFn: () => (role === "importer" ? importerApi.profile() : exporterApi.profile()),
    enabled: Boolean(token),
  });

  const profile = profileQ.data as Record<string, unknown> | undefined;
  const verified = (profile as { kyc_status?: string })?.kyc_status === "approved";

  const checks =
    role === "exporter" ? computeExporterChecks(profile) : computeImporterChecks(profile);
  const done = checks.filter((c) => c.done).length;
  const total = checks.length;
  const pct = total === 0 ? 0 : Math.round((done / total) * 100);
  const nextStep = checks.find((c) => !c.done);

  // Once the exporter is verified AND complete, hide the prompt - it's
  // served its purpose and dashboard space is precious.
  if (verified && pct === 100) return null;

  return (
    <Card className="mb-6 overflow-hidden rounded-2xl border border-primary/20 bg-card shadow-soft">
      <CardContent className="p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="space-y-1">
            <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-primary">
              Profile completion
              {verified ? <VerifiedBadge size="sm" /> : null}
            </p>
            <p className="font-display text-lg font-semibold tracking-tight">
              {pct === 100
                ? role === "exporter"
                  ? "Profile complete - awaiting verification"
                  : "Profile complete"
                : `You're ${pct}% there`}
            </p>
            <p className="text-sm text-muted-foreground">
              {role === "exporter"
                ? verified
                  ? "Your account is verified. Finish your profile to unlock all listing features."
                  : "Complete every section below to submit for KYC review."
                : "A complete profile speeds up checkout and dispute resolution."}
            </p>
          </div>
          {nextStep?.href ? (
            <Button asChild size="sm" className="rounded-full">
              <Link href={nextStep.href}>
                Continue <ArrowRight className="size-4" />
              </Link>
            </Button>
          ) : !verified && role === "exporter" ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-warning/10 px-3 py-1.5 text-xs font-semibold text-warning ring-1 ring-warning/20">
              <ShieldCheck className="size-3.5" aria-hidden />
              Under review
            </span>
          ) : null}
        </div>

        {/* Progress bar */}
        <div
          role="progressbar"
          aria-valuenow={pct}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Profile completion progress"
          className="mt-5 h-2 overflow-hidden rounded-full bg-muted"
        >
          <div
            className="h-full rounded-full bg-primary transition-[width] duration-500"
            style={{ width: `${pct}%` }}
          />
        </div>

        {/* Checklist */}
        <ul className="mt-5 grid gap-2 sm:grid-cols-2">
          {checks.map((c) => (
            <li key={c.label} className="flex items-start gap-2.5 text-sm">
              <span
                className={`mt-0.5 grid size-4 shrink-0 place-items-center rounded-full ${
                  c.done
                    ? "bg-success/15 text-success ring-1 ring-success/30"
                    : "bg-muted text-muted-foreground ring-1 ring-border"
                }`}
                aria-hidden
              >
                {c.done ? (
                  <svg viewBox="0 0 14 14" fill="none" className="size-2.5">
                    <path
                      d="M2 7l3 3 7-7"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                ) : null}
              </span>
              <span className={c.done ? "text-foreground/85" : "text-muted-foreground"}>
                {c.label}
              </span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}

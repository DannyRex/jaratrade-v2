const formatters = new Map<string, Intl.NumberFormat>();

export function formatMoney(
  amount: number | string | null | undefined,
  currency: string | null | undefined = "NGN",
  opts: { compact?: boolean } = {},
): string {
  if (amount === null || amount === undefined || amount === "") return "-";
  const value = typeof amount === "string" ? Number(amount) : amount;
  if (Number.isNaN(value)) return "-";

  // Tolerate a null/empty currency (e.g. an optional refund_currency) so
  // callers don't each have to coalesce - default to NGN.
  const ccy = currency || "NGN";
  const key = `${ccy}|${opts.compact ?? false}`;
  let formatter = formatters.get(key);
  if (!formatter) {
    formatter = new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: ccy,
      maximumFractionDigits: 2,
      notation: opts.compact ? "compact" : "standard",
    });
    formatters.set(key, formatter);
  }
  return formatter.format(value);
}

export function formatNumber(n: number | string | null | undefined): string {
  if (n === null || n === undefined || n === "") return "-";
  const value = typeof n === "string" ? Number(n) : n;
  if (Number.isNaN(value)) return "-";
  return new Intl.NumberFormat("en-NG").format(value);
}

export function formatDate(input: string | Date | null | undefined): string {
  if (!input) return "-";
  const d = typeof input === "string" ? new Date(input) : input;
  if (Number.isNaN(d.getTime())) return "-";
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(d);
}

export function formatDateTime(input: string | Date | null | undefined): string {
  if (!input) return "-";
  const d = typeof input === "string" ? new Date(input) : input;
  if (Number.isNaN(d.getTime())) return "-";
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}

export function relativeTime(input: string | Date | null | undefined): string {
  if (!input) return "-";
  const d = typeof input === "string" ? new Date(input) : input;
  if (Number.isNaN(d.getTime())) return "-";
  const diff = Date.now() - d.getTime();
  const seconds = Math.floor(diff / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return formatDate(d);
}

// Fernet IDs are long encrypted strings - show first 8 chars for human reference
export function shortId(id: string | null | undefined, len = 8): string {
  if (!id) return "-";
  return id.length > len ? `${id.slice(0, len)}…` : id;
}

export function initials(name: string | null | undefined): string {
  if (!name) return "?";
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");
}

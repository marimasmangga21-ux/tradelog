import type { Currency } from "@/lib/types";

export const CURRENCY_SYMBOL: Record<Currency, string> = {
  USD: "$",
  USC: "USC ",
  IDR: "Rp",
  EUR: "€",
  GBP: "£",
};

export const CURRENCY_LOCALE: Record<Currency, string> = {
  USD: "en-US",
  USC: "en-US",
  IDR: "id-ID",
  EUR: "de-DE",
  GBP: "en-GB",
};

/** Tarif ilustratif untuk tampilan harga plan. */
export const FX_TO_IDR: Record<Currency, number> = {
  USD: 16250,
  USC: 162.5,
  IDR: 1,
  EUR: 17600,
  GBP: 20600,
};

export function formatCurrency(
  value: number,
  currency: Currency = "USD",
  opts: { compact?: boolean; hideAmounts?: boolean; decimals?: number } = {},
): string {
  const { compact = false, hideAmounts = false, decimals } = opts;

  if (hideAmounts) {
    return formatSigned(value, currency, { compact, decimals });
  }

  const fractionDigits = decimals ?? (currency === "IDR" ? 0 : 2);

  if (currency === "USC") {
    const numFormatted = new Intl.NumberFormat("en-US", {
      minimumFractionDigits: compact ? 0 : fractionDigits,
      maximumFractionDigits: compact ? 1 : fractionDigits,
      notation: compact ? "compact" : "standard",
    }).format(value);
    return `USC ${numFormatted}`;
  }

  try {
    return new Intl.NumberFormat(CURRENCY_LOCALE[currency], {
      style: "currency",
      currency,
      minimumFractionDigits: compact ? 0 : fractionDigits,
      maximumFractionDigits: compact ? 1 : fractionDigits,
      notation: compact ? "compact" : "standard",
    }).format(value);
  } catch {
    return `${CURRENCY_SYMBOL[currency]}${value.toFixed(fractionDigits)}`;
  }
}

/** Saat nominal disembunyikan: tampilkan dalam satuan R jika memungkinkan. */
function formatSigned(value: number, currency: Currency, opts: { compact?: boolean; decimals?: number }) {
  const abs = Math.abs(value);
  if (abs === 0) return "—";
  const sign = value > 0 ? "+" : "−";
  const formatted = new Intl.NumberFormat(CURRENCY_LOCALE[currency], {
    minimumFractionDigits: 0,
    maximumFractionDigits: opts.compact ? 1 : 2,
    notation: opts.compact ? "compact" : "standard",
  }).format(abs);
  return `${sign}${formatted}`;
}

export function formatSignedCurrency(
  value: number,
  currency: Currency = "USD",
  opts: { compact?: boolean; decimals?: number } = {},
): string {
  const sign = value > 0 ? "+" : value < 0 ? "−" : "";
  const formatted = formatCurrency(Math.abs(value), currency, opts);
  return `${sign}${formatted}`;
}

export function formatNumber(value: number, decimals = 2): string {
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

export function formatPercent(value: number, decimals = 1, withSign = false): string {
  const sign = withSign && value > 0 ? "+" : "";
  return `${sign}${value.toFixed(decimals)}%`;
}

export function formatR(value: number | null | undefined): string {
  if (value === null || value === undefined || Number.isNaN(value)) return "—";
  const sign = value > 0 ? "+" : value < 0 ? "−" : "";
  return `${sign}${Math.abs(value).toFixed(2)}R`;
}

export function formatRatio(value: number | null | undefined): string {
  if (value === null || value === undefined || !Number.isFinite(value)) return "—";
  return `${value.toFixed(2)}`;
}

export function formatCompact(value: number): string {
  return new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 }).format(value);
}

/** Format harga instrumen dengan presisi adaptif. */
export function formatPrice(value: number | null | undefined, instrument = ""): string {
  if (value === null || value === undefined || Number.isNaN(value)) return "—";
  const upper = instrument.toUpperCase();
  let digits = 5;
  if (upper.includes("JPY")) digits = 3;
  else if (upper.includes("XAU") || upper.includes("XAG")) digits = 2;
  else if (upper.includes("BTC") || upper.includes("ETH")) digits = 2;
  else if (upper.includes("US30") || upper.includes("NAS") || upper.includes("SPX")) digits = 1;
  else if (Math.abs(value) >= 1000) digits = 2;
  else if (Math.abs(value) >= 100) digits = 3;
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(value);
}

export function formatDuration(minutes: number | null | undefined, locale = "id"): string {
  if (minutes === null || minutes === undefined || !Number.isFinite(minutes)) return "—";
  const hourUnit = locale === "id" ? "j" : "h";
  const dayUnit = locale === "id" ? "h" : "d";
  if (minutes < 60) return `${Math.round(minutes)}m`;
  const h = Math.floor(minutes / 60);
  const m = Math.round(minutes % 60);
  if (h < 24) return m > 0 ? `${h}${hourUnit} ${m}m` : `${h}${hourUnit}`;
  const d = Math.floor(h / 24);
  return `${d}${dayUnit} ${h % 24}${hourUnit}`;
}

export function pnlColor(value: number): string {
  if (value > 0) return "text-profit";
  if (value < 0) return "text-loss";
  return "text-muted-foreground";
}

export function pnlBg(value: number): string {
  if (value > 0) return "bg-profit/10 text-profit border-profit/25";
  if (value < 0) return "bg-loss/10 text-loss border-loss/25";
  return "bg-muted text-muted-foreground border-border";
}

export function scoreColor(score: number): string {
  if (score >= 80) return "#00dc82";
  if (score >= 65) return "#10b981";
  if (score >= 50) return "#eab308";
  if (score >= 35) return "#f97316";
  return "#ef4444";
}

export function scoreLabelKey(score: number): string {
  if (score >= 80) return "analytics.scoreExcellent";
  if (score >= 65) return "analytics.scoreGood";
  if (score >= 50) return "analytics.scoreAverage";
  return "analytics.scorePoor";
}

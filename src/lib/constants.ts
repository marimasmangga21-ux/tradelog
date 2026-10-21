import type { AccountStatus, Currency, TradeSession } from "@/lib/types";

export const INSTRUMENTS = [
  // Forex majors
  "EURUSD", "GBPUSD", "USDJPY", "USDCHF", "USDCAD", "AUDUSD", "NZDUSD",
  // Forex crosses
  "EURJPY", "GBPJPY", "EURGBP", "AUDJPY", "EURAUD", "GBPCHF", "EURNZD", "CADJPY",
  // Metals
  "XAUUSD", "XAGUSD",
] as const;

export const BROKERS = [
  "Exness",
  "IC Markets",
  "Pepperstone",
  "FTMO",
  "Funding Pips",
  "The5ers",
  "TopStep",
  "Alpha Capital",
  "MyFundedFX",
  "E8 Markets",
  "Lainnya",
] as const;

export const SESSIONS: { value: TradeSession; labelKey: string; short: string; color: string }[] = [
  { value: "asia", labelKey: "analytics.sessionAsia", short: "AS", color: "#38bdf8" },
  { value: "london", labelKey: "analytics.sessionLondon", short: "LDN", color: "#22c55e" },
  { value: "new_york", labelKey: "analytics.sessionNewYork", short: "NY", color: "#8b5cf6" },
  { value: "sydney", labelKey: "analytics.sessionSydney", short: "SYD", color: "#f59e0b" },
  { value: "other", labelKey: "analytics.sessionOther", short: "OTH", color: "#94a3b8" },
];

export const ACCOUNT_STATUSES: { value: AccountStatus; labelKey: string; tone: "profit" | "loss" | "warning" | "muted" }[] = [
  { value: "active", labelKey: "accounts.active", tone: "profit" },
  { value: "passed", labelKey: "accounts.passed", tone: "profit" },
  { value: "breached", labelKey: "accounts.breached", tone: "loss" },
  { value: "archived", labelKey: "accounts.archived", tone: "muted" },
];

export const CURRENCIES: Currency[] = ["USD", "USC", "IDR", "EUR", "GBP"];

export const ACCOUNT_COLORS = [
  "#3b82f6", "#22c55e", "#38bdf8", "#8b5cf6", "#f59e0b", "#ef4444", "#ec4899", "#14b8a6",
];

export const EMOTION_PRESETS = [
  { name: "Tenang", slug: "tenang", sentiment: "positive", color: "#3b82f6" },
  { name: "Disiplin", slug: "disiplin", sentiment: "positive", color: "#22c55e" },
  { name: "Sabar", slug: "sabar", sentiment: "positive", color: "#14b8a6" },
  { name: "Percaya Diri", slug: "percaya-diri", sentiment: "positive", color: "#8b5cf6" },
  { name: "FOMO", slug: "fomo", sentiment: "negative", color: "#f97316" },
  { name: "Ragu", slug: "ragu", sentiment: "neutral", color: "#eab308" },
  { name: "Revenge Trading", slug: "revenge-trading", sentiment: "negative", color: "#ef4444" },
  { name: "Serakah", slug: "serakah", sentiment: "negative", color: "#ec4899" },
  { name: "Takut", slug: "takut", sentiment: "negative", color: "#a855f7" },
] as const;

export const DEFAULT_STRATEGY_COLORS = ["#3b82f6", "#22c55e", "#38bdf8", "#8b5cf6", "#f59e0b", "#ec4899"];

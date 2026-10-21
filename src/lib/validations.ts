import { z } from "zod";

const numberLike = z
  .union([z.number(), z.string()])
  .transform((v) => {
    if (typeof v === "number") return v;
    const cleaned = v.replace(/\s/g, "").replace(/,/g, ".");
    if (cleaned === "") return null;
    const n = Number(cleaned);
    return Number.isFinite(n) ? n : null;
  })
  .nullable()
  .optional();

export const tradeSchema = z.object({
  id: z.string().uuid().optional(),
  account_id: z.string().uuid().nullable().optional(),
  strategy_id: z.string().uuid().nullable().optional(),
  traded_at: z.string().min(1, "Tanggal wajib diisi"),
  closed_at: z.string().nullable().optional(),
  instrument: z.string().min(1, "Pair wajib diisi").max(24).transform((v) => v.toUpperCase().trim()),
  direction: z.enum(["long", "short"]),
  session: z.enum(["asia", "london", "new_york", "sydney", "other"]),
  status: z.enum(["open", "closed"]).default("closed"),
  entry_price: numberLike,
  stop_loss: numberLike,
  take_profit: numberLike,
  exit_price: numberLike,
  position_size: numberLike,
  pnl: z
    .union([z.number(), z.string()])
    .transform((v) => {
      if (typeof v === "number") return v;
      const cleaned = v.replace(/\s/g, "").replace(/,/g, ".");
      if (cleaned === "") return 0;
      const n = Number(cleaned);
      return Number.isFinite(n) ? n : 0;
    })
    .default(0),
  pnl_percent: numberLike,
  fees: numberLike,
  r_multiple: numberLike,
  risk_amount: numberLike,
  result: z.enum(["win", "loss", "breakeven", "open"]).optional(),
  exit_reason: z.string().max(1000).nullable().optional(),
  notes: z.string().max(5000).nullable().optional(),
  tags: z.array(z.string()).default([]),
});

export type TradeInput = z.infer<typeof tradeSchema>;

export const accountSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1, "Nama akun wajib diisi").max(80),
  broker: z.string().max(80).nullable().optional(),
  account_type: z.enum(["prop_firm", "broker", "personal", "demo"]).default("prop_firm"),
  currency: z.enum(["USD", "USC", "IDR", "EUR", "GBP"]).default("USD"),
  initial_balance: numberLike,
  status: z.enum(["active", "breached", "passed", "archived"]).default("active"),
  profit_target: numberLike,
  max_drawdown: numberLike,
  color: z.string().max(20).default("#3b82f6"),
  notes: z.string().max(2000).nullable().optional(),
});

export type AccountInput = z.infer<typeof accountSchema>;

export const checklistItemSchema = z.object({
  id: z.string(),
  text: z.string().min(1),
  done: z.boolean().optional(),
});

export const strategySchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1, "Nama strategi wajib diisi").max(80),
  description: z.string().max(2000).nullable().optional(),
  entry_rules: z.string().max(5000).nullable().optional(),
  exit_rules: z.string().max(5000).nullable().optional(),
  checklist: z.array(checklistItemSchema).default([]),
  image_url: z.string().nullable().optional(),
  color: z.string().max(20).default("#3b82f6"),
});

export type StrategyInput = z.infer<typeof strategySchema>;

export const journalSchema = z.object({
  id: z.string().uuid().optional(),
  trade_id: z.string().uuid().nullable().optional(),
  journal_date: z.string().min(1),
  title: z.string().max(120).nullable().optional(),
  mood_score: z.number().min(1).max(5).nullable().optional(),
  emotion_ids: z.array(z.string().uuid()).default([]),
  lesson_learned: z.string().max(3000).nullable().optional(),
  mistakes: z.string().max(3000).nullable().optional(),
  plan_tomorrow: z.string().max(3000).nullable().optional(),
  content: z.string().max(10000).nullable().optional(),
});

export type JournalInput = z.infer<typeof journalSchema>;

export const emotionSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1, "Nama emosi wajib diisi").max(40),
  slug: z.string().max(50).optional(),
  sentiment: z.enum(["positive", "neutral", "negative"]).default("neutral"),
  color: z.string().max(20).default("#94a3b8"),
});

export const profileSchema = z.object({
  name: z.string().max(80).optional(),
  locale: z.enum(["id", "en"]).optional(),
  timezone: z.string().max(60).optional(),
  default_currency: z.enum(["USD", "USC", "IDR", "EUR", "GBP"]).optional(),
  hide_amounts: z.boolean().optional(),
});

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 50);
}

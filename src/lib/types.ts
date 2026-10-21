export type Locale = "id" | "en";
export type Currency = "USD" | "USC" | "IDR" | "EUR" | "GBP";

export type TradeDirection = "long" | "short";
export type TradeSession = "asia" | "london" | "new_york" | "sydney" | "other";
export type TradeResult = "win" | "loss" | "breakeven" | "open";
export type TradeStatus = "open" | "closed";
export type AccountStatus = "active" | "breached" | "passed" | "archived";
export type ScreenshotTimeframe = "htf" | "mtf" | "ltf";
export type EmotionSentiment = "positive" | "neutral" | "negative";

/** Profil pemilik jurnal. Satu pengguna, tanpa autentikasi. */
export interface Profile {
  name: string;
  email: string | null;
  avatar_url: string | null;
  locale: Locale;
  timezone: string;
  default_currency: Currency;
  hide_amounts: boolean;
  api_secret?: string;
  created_at: string;
  updated_at: string;
}

export interface Account {
  id: string;
  name: string;
  broker: string | null;
  account_type: "prop_firm" | "broker" | "personal" | "demo";
  currency: Currency;
  initial_balance: number;
  total_deposits?: number;
  status: AccountStatus;
  profit_target: number | null;
  max_drawdown: number | null;
  color: string;
  notes: string | null;
  archived: boolean;
  // Metadata integrasi MT5
  mt5_account_number?: number | null;
  mt5_server?: string | null;
  mt5_last_sync_at?: string | null;
  mt5_connected?: boolean;
  created_at: string;
  updated_at: string;
}

export interface Strategy {
  id: string;
  name: string;
  description: string | null;
  entry_rules: string | null;
  exit_rules: string | null;
  checklist: ChecklistItem[];
  image_url: string | null;
  color: string;
  archived: boolean;
  created_at: string;
  updated_at: string;
}

export interface ChecklistItem {
  id: string;
  text: string;
  done?: boolean;
}

export interface Trade {
  id: string;
  account_id: string | null;
  strategy_id: string | null;
  traded_at: string;
  closed_at: string | null;
  instrument: string;
  direction: TradeDirection;
  session: TradeSession;
  status: TradeStatus;
  entry_price: number | null;
  stop_loss: number | null;
  take_profit: number | null;
  exit_price: number | null;
  position_size: number | null;
  pnl: number;
  pnl_percent: number | null;
  fees: number;
  r_multiple: number | null;
  risk_amount: number | null;
  result: TradeResult;
  exit_reason: string | null;
  notes: string | null;
  tags: string[];
  balance_after: number | null;
  // Metadata MT5
  source?: "manual" | "mt5";
  mt5_position_id?: number | null;
  mt5_deal_in?: number | null;
  mt5_deal_out?: number | null;
  commission?: number;
  swap?: number;
  broker_symbol?: string | null;
  created_at: string;
  updated_at: string;
}

export interface TradeWithRelations extends Trade {
  account?: Pick<Account, "id" | "name" | "currency" | "color" | "broker"> | null;
  strategy?: Pick<Strategy, "id" | "name" | "color"> | null;
  trade_screenshots?: TradeScreenshot[];
}

export interface TradeScreenshot {
  id: string;
  trade_id: string;
  timeframe: ScreenshotTimeframe;
  /** Nama file relatif di folder data/screenshots, atau URL absolut. */
  storage_path: string;
  caption: string | null;
  width: number | null;
  height: number | null;
  created_at: string;
}

export interface Journal {
  id: string;
  trade_id: string | null;
  journal_date: string;
  title: string | null;
  mood_score: number | null;
  emotion_ids: string[];
  lesson_learned: string | null;
  mistakes: string | null;
  plan_tomorrow: string | null;
  content: string | null;
  created_at: string;
  updated_at: string;
}

export interface Emotion {
  id: string;
  name: string;
  slug: string;
  sentiment: EmotionSentiment;
  color: string;
  is_default: boolean;
  created_at: string;
}

export interface AnalyticsSummary {
  totalTrades: number;
  netPnl: number;
  winRate: number;
  profitFactor: number | null;
  avgRr: number;
  expectancy: number;
  maxDrawdown: number;
  maxDrawdownPercent: number;
  recoveryFactor: number | null;
  consistency: number;
  grossProfit: number;
  grossLoss: number;
  avgWin: number;
  avgLoss: number;
  wins: number;
  losses: number;
  breakevens: number;
  bestTrade: number;
  worstTrade: number;
  avgHoldMinutes: number | null;
  currentStreak: number;
  longestWinStreak: number;
  longestLossStreak: number;
  tradelogScore: number;
  scoreBreakdown: ScoreComponent[];
}

export interface ScoreComponent {
  key: string;
  label: string;
  value: number;
  weight: number;
  score: number;
  raw: string;
}

export interface Filters {
  accountId: string | null;
  strategyId: string | null;
  from: string | null;
  to: string | null;
  result?: TradeResult | null;
  instrument?: string | null;
  search?: string | null;
}

export interface ActionResult<T = unknown> {
  ok: boolean;
  data?: T;
  error?: string;
  code?: string;
}

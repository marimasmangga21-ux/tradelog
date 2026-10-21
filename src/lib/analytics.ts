import type {
  AnalyticsSummary,
  ScoreComponent,
  Trade,
  TradeSession,
} from "@/lib/types";

export interface EquityPoint {
  index: number;
  date: string;
  equity: number;
  pnl: number;
  drawdown: number;
  label: string;
}

export interface BucketStat {
  key: string;
  label: string;
  trades: number;
  wins: number;
  losses: number;
  netPnl: number;
  winRate: number;
  avgRr: number;
  profitFactor: number | null;
}

/** Rata-rata R:R efektif: pakai r_multiple, fallback hitung dari harga. */
export function effectiveR(trade: Trade): number | null {
  if (trade.r_multiple !== null && trade.r_multiple !== undefined && trade.r_multiple !== 0) {
    return trade.r_multiple;
  }
  const { entry_price: entry, stop_loss: sl, exit_price: exit } = trade;
  if (entry === null || sl === null || exit === null) return null;
  const risk = Math.abs(entry - sl);
  if (risk === 0) return null;
  return (exit - entry) / (trade.direction === "long" ? risk : -risk);
}

export function computeProfitFactor(wins: number, losses: number): number | null {
  if (losses === 0) return wins > 0 ? null : 0;
  return wins / losses;
}

/** Max drawdown dari kurva ekuitas kumulatif. */
export function computeMaxDrawdown(sortedTrades: Trade[]): { amount: number; percent: number; peak: number } {
  let equity = 0;
  let peak = 0;
  let maxDd = 0;
  for (const t of sortedTrades) {
    equity += t.pnl;
    if (equity > peak) peak = equity;
    const dd = peak - equity;
    if (dd > maxDd) maxDd = dd;
  }
  const percent = peak > 0 ? (maxDd / peak) * 100 : 0;
  return { amount: maxDd, percent, peak };
}

/**
 * Consistency: seberapa merata profit tersebar.
 * 100 = setiap trade profit sama besar, 0 = seluruh profit dari satu trade.
 * Menggunakan rasio profit terbesar terhadap total profit bersih.
 */
export function computeConsistency(trades: Trade[]): number {
  const profits = trades.filter((t) => t.pnl > 0).map((t) => t.pnl);
  if (profits.length === 0) return 0;
  const total = profits.reduce((a, b) => a + b, 0);
  if (total <= 0) return 0;
  const largest = Math.max(...profits);
  const ratio = largest / total;
  // Skala: satu trade menyumbang 100% => 0; menyumbang <=10% => ~90+
  const score = Math.max(0, Math.min(100, (1 - ratio) * 111));
  return round(score, 1);
}

export function computeStreaks(sortedTrades: Trade[]): {
  current: number;
  longestWin: number;
  longestLoss: number;
} {
  let current = 0;
  let longestWin = 0;
  let longestLoss = 0;
  let run = 0;
  let lastSign = 0;

  for (const t of sortedTrades) {
    const sign = t.pnl > 0 ? 1 : t.pnl < 0 ? -1 : 0;
    if (sign === 0) continue;
    if (sign === lastSign) {
      run += sign;
    } else {
      run = sign;
      lastSign = sign;
    }
    if (run > longestWin) longestWin = run;
    if (-run > longestLoss) longestLoss = -run;
    current = run;
  }

  return { current, longestWin, longestLoss };
}

export function computeAvgHoldMinutes(trades: Trade[]): number | null {
  const durations = trades
    .filter((t) => t.closed_at && t.traded_at)
    .map((t) => (new Date(t.closed_at!).getTime() - new Date(t.traded_at).getTime()) / 60000)
    .filter((m) => Number.isFinite(m) && m >= 0);
  if (durations.length === 0) return null;
  return round(durations.reduce((a, b) => a + b, 0) / durations.length, 0);
}

/**
 * Skor Tradelog 0–100 dari 6 komponen berbobot:
 * win rate 20, profit factor 25, avg win/loss 15, recovery 15, drawdown 15, consistency 10
 */
export function computeTradelogScore(input: {
  winRate: number;
  profitFactor: number | null;
  avgWin: number;
  avgLoss: number;
  recoveryFactor: number | null;
  maxDrawdownPercent: number;
  consistency: number;
  totalTrades: number;
}): { score: number; breakdown: ScoreComponent[] } {
  const {
    winRate,
    profitFactor,
    avgWin,
    avgLoss,
    recoveryFactor,
    maxDrawdownPercent,
    consistency,
    totalTrades,
  } = input;

  // 1. Win rate: 30% -> 40 poin, 70% -> 100 poin
  const wrScore = clamp(((winRate - 25) / (65 - 25)) * 100, 0, 100);

  // 2. Profit factor: 1.0 -> 40, 2.5 -> 100
  const pf = profitFactor ?? 0;
  const pfScore = clamp(((pf - 0.8) / (2.5 - 0.8)) * 100, 0, 100);

  // 3. Avg win / avg loss: 1.0 -> 40, 3.0 -> 100
  const absLoss = Math.abs(avgLoss);
  const wlRatio = absLoss > 0 ? avgWin / absLoss : avgWin > 0 ? 3 : 0;
  const wlScore = clamp(((wlRatio - 0.8) / (3 - 0.8)) * 100, 0, 100);

  // 4. Recovery factor: 1 -> 40, 5 -> 100
  const rf = recoveryFactor ?? 0;
  const rfScore = clamp(((rf - 0.5) / (5 - 0.5)) * 100, 0, 100);

  // 5. Max drawdown %: 0% -> 100, 25% -> 0
  const ddScore = clamp(100 - (maxDrawdownPercent / 25) * 100, 0, 100);

  // 6. Consistency langsung 0–100
  const csScore = clamp(consistency, 0, 100);

  const components: ScoreComponent[] = [
    { key: "winRate", label: "Win rate", value: round(winRate, 1), weight: 20, score: round(wrScore, 1), raw: `${round(winRate, 1)}%` },
    { key: "profitFactor", label: "Profit factor", value: round(pf, 2), weight: 25, score: round(pfScore, 1), raw: pf > 0 ? pf.toFixed(2) : "—" },
    { key: "avgWinLoss", label: "Avg win / loss", value: round(wlRatio, 2), weight: 15, score: round(wlScore, 1), raw: wlRatio > 0 ? `${wlRatio.toFixed(2)}×` : "—" },
    { key: "recoveryFactor", label: "Recovery factor", value: round(rf, 2), weight: 15, score: round(rfScore, 1), raw: rf > 0 ? rf.toFixed(2) : "—" },
    { key: "maxDrawdown", label: "Max drawdown", value: round(maxDrawdownPercent, 1), weight: 15, score: round(ddScore, 1), raw: `${round(maxDrawdownPercent, 1)}%` },
    { key: "consistency", label: "Consistency", value: round(consistency, 1), weight: 10, score: round(csScore, 1), raw: `${round(consistency, 1)}` },
  ];

  let weighted = 0;
  let totalWeight = 0;
  for (const c of components) {
    weighted += c.score * c.weight;
    totalWeight += c.weight;
  }
  let score = totalWeight > 0 ? weighted / totalWeight : 0;

  // Penalti sample kecil: < 10 trade tidak bisa dapat skor penuh
  if (totalTrades < 10) {
    const factor = 0.55 + (Math.min(totalTrades, 10) / 10) * 0.45;
    score *= factor;
  }

  return { score: round(clamp(score, 0, 100), 0), breakdown: components };
}

export function computeAnalytics(trades: Trade[], startBalance = 0): AnalyticsSummary {
  const closed = trades
    .filter((t) => t.status === "closed")
    .sort((a, b) => new Date(a.traded_at).getTime() - new Date(b.traded_at).getTime());

  const totalTrades = closed.length;
  const wins = closed.filter((t) => t.pnl > 0).length;
  const losses = closed.filter((t) => t.pnl < 0).length;
  const breakevens = closed.filter((t) => t.pnl === 0).length;

  const netPnl = closed.reduce((a, t) => a + t.pnl, 0);
  const grossProfit = closed.filter((t) => t.pnl > 0).reduce((a, t) => a + t.pnl, 0);
  const grossLoss = Math.abs(closed.filter((t) => t.pnl < 0).reduce((a, t) => a + t.pnl, 0));

  const winRate = totalTrades > 0 ? (wins / totalTrades) * 100 : 0;
  const profitFactor = computeProfitFactor(grossProfit, grossLoss);

  const rValues = closed.map(effectiveR).filter((r): r is number => r !== null && Number.isFinite(r));
  const avgRr = rValues.length > 0 ? rValues.reduce((a, b) => a + b, 0) / rValues.length : 0;

  const expectancy = totalTrades > 0 ? netPnl / totalTrades : 0;
  const avgWin = wins > 0 ? grossProfit / wins : 0;
  const avgLoss = losses > 0 ? -grossLoss / losses : 0;

  const dd = computeMaxDrawdown(closed);
  const recoveryFactor = dd.amount > 0 ? netPnl / dd.amount : netPnl > 0 ? 3 : null;
  const consistency = computeConsistency(closed);
  const streaks = computeStreaks(closed);

  const scoreResult = computeTradelogScore({
    winRate,
    profitFactor,
    avgWin,
    avgLoss,
    recoveryFactor,
    maxDrawdownPercent: dd.percent,
    consistency,
    totalTrades,
  });

  return {
    totalTrades,
    netPnl: round(netPnl, 2),
    winRate: round(winRate, 2),
    profitFactor: profitFactor === null ? null : round(profitFactor, 2),
    avgRr: round(avgRr, 2),
    expectancy: round(expectancy, 2),
    maxDrawdown: round(dd.amount, 2),
    maxDrawdownPercent: round(dd.percent, 2),
    recoveryFactor: recoveryFactor === null ? null : round(recoveryFactor, 2),
    consistency: round(consistency, 1),
    grossProfit: round(grossProfit, 2),
    grossLoss: round(grossLoss, 2),
    avgWin: round(avgWin, 2),
    avgLoss: round(avgLoss, 2),
    wins,
    losses,
    breakevens,
    bestTrade: round(closed.reduce((m, t) => Math.max(m, t.pnl), 0), 2),
    worstTrade: round(closed.reduce((m, t) => Math.min(m, t.pnl), 0), 2),
    avgHoldMinutes: computeAvgHoldMinutes(closed),
    currentStreak: streaks.current,
    longestWinStreak: streaks.longestWin,
    longestLossStreak: streaks.longestLoss,
    tradelogScore: scoreResult.score,
    scoreBreakdown: scoreResult.breakdown,
  };
}

export function buildEquityCurve(trades: Trade[], startBalance = 0): EquityPoint[] {
  const closed = trades
    .filter((t) => t.status === "closed")
    .sort((a, b) => new Date(a.traded_at).getTime() - new Date(b.traded_at).getTime());

  let equity = startBalance;
  let peak = startBalance;
  const points: EquityPoint[] = [];

  if (closed.length > 0) {
    points.push({
      index: 0,
      date: closed[0].traded_at,
      equity,
      pnl: 0,
      drawdown: 0,
      label: "Start",
    });
  }

  closed.forEach((t, i) => {
    equity += t.pnl;
    if (equity > peak) peak = equity;
    points.push({
      index: i + 1,
      date: t.traded_at,
      equity: round(equity, 2),
      pnl: t.pnl,
      drawdown: round(equity - peak, 2),
      label: `#${i + 1}`,
    });
  });

  return points;
}

/** Kurva ekuitas dikelompokkan per hari (untuk tampilan lebih halus). */
export function buildDailyEquityCurve(trades: Trade[], startBalance = 0): EquityPoint[] {
  const closed = trades.filter((t) => t.status === "closed");
  const byDay = new Map<string, number>();
  for (const t of closed) {
    const day = t.traded_at.slice(0, 10);
    byDay.set(day, (byDay.get(day) ?? 0) + t.pnl);
  }
  const days = Array.from(byDay.entries()).sort((a, b) => a[0].localeCompare(b[0]));

  let equity = startBalance;
  let peak = startBalance;
  return days.map(([day, pnl], i) => {
    equity += pnl;
    if (equity > peak) peak = equity;
    return {
      index: i + 1,
      date: day,
      equity: round(equity, 2),
      pnl: round(pnl, 2),
      drawdown: round(equity - peak, 2),
      label: day,
    };
  });
}

export function groupByKey(
  trades: Trade[],
  keyFn: (t: Trade) => string,
  labelFn: (key: string) => string = (k) => k,
): BucketStat[] {
  const map = new Map<string, Trade[]>();
  for (const t of trades) {
    const key = keyFn(t);
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(t);
  }

  return Array.from(map.entries())
    .map(([key, list]) => {
      const wins = list.filter((t) => t.pnl > 0).length;
      const losses = list.filter((t) => t.pnl < 0).length;
      const gp = list.filter((t) => t.pnl > 0).reduce((a, t) => a + t.pnl, 0);
      const gl = Math.abs(list.filter((t) => t.pnl < 0).reduce((a, t) => a + t.pnl, 0));
      const rs = list.map(effectiveR).filter((r): r is number => r !== null);
      return {
        key,
        label: labelFn(key),
        trades: list.length,
        wins,
        losses,
        netPnl: round(list.reduce((a, t) => a + t.pnl, 0), 2),
        winRate: list.length > 0 ? round((wins / list.length) * 100, 1) : 0,
        avgRr: rs.length > 0 ? round(rs.reduce((a, b) => a + b, 0) / rs.length, 2) : 0,
        profitFactor: computeProfitFactor(gp, gl),
      };
    })
    .sort((a, b) => b.netPnl - a.netPnl);
}

export function groupBySession(trades: Trade[]): BucketStat[] {
  return groupByKey(trades, (t) => t.session);
}

export function groupByHour(trades: Trade[]): BucketStat[] {
  const stats = groupByKey(trades, (t) => String(new Date(t.traded_at).getHours()));
  return stats.sort((a, b) => Number(a.key) - Number(b.key));
}

export function groupByInstrument(trades: Trade[]): BucketStat[] {
  return groupByKey(trades, (t) => t.instrument.toUpperCase());
}

export function groupByDirection(trades: Trade[]): BucketStat[] {
  return groupByKey(trades, (t) => t.direction);
}

export function groupByStrategy(trades: Trade[]): BucketStat[] {
  return groupByKey(trades, (t) => t.strategy_id ?? "none");
}

export function round(value: number, decimals = 2): number {
  const f = 10 ** decimals;
  return Math.round(value * f) / f;
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export const SESSION_LABEL_KEYS: Record<TradeSession, string> = {
  asia: "analytics.sessionAsia",
  london: "analytics.sessionLondon",
  new_york: "analytics.sessionNewYork",
  sydney: "analytics.sessionSydney",
  other: "analytics.sessionOther",
};

/** Label jam trading dalam format 00:00 */
export function hourLabel(hour: string | number): string {
  return `${String(hour).padStart(2, "0")}:00`;
}

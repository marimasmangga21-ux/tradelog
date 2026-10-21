"use client";

import * as React from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Activity,
  BarChart3,
  CalendarRange,
  Camera,
  Flame,
  Gauge,
  Info,
  Layers,
  Plus,
  Scale,
  Target,
  Timer,
  TrendingDown,
  TrendingUp,
  Zap,
} from "lucide-react";
import { useI18n } from "@/components/providers/i18n-provider";
import { useData } from "@/components/providers/data-provider";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard, StatsGrid } from "@/components/shared/stat-card";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Segmented } from "@/components/ui/segmented";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DirectionCompareChart,
  EquityCurveChart,
  ResultDonut,
  SessionBarChart,
  WinRateBarChart,
} from "@/components/analytics/charts";
import { SessionHoursLegend } from "@/components/analytics/session-hours-legend";
import { ScoreGauge, ScoreRadar } from "@/components/analytics/score-gauge";
import { ScoreBreakdown } from "@/components/analytics/score-breakdown";
import { PerformanceSnapshotDialog } from "@/components/snapshot/performance-snapshot-dialog";
import {
  buildDailyEquityCurve,
  computeAnalytics,
  groupByDirection,
  groupByHour,
  groupByInstrument,
  groupBySession,
  groupByStrategy,
  hourLabel,
} from "@/lib/analytics";
import { SESSION_LABEL_KEYS, type BucketStat } from "@/lib/analytics";
import {
  formatCurrency,
  formatDuration,
  formatPercent,
  formatR,
  formatRatio,
  formatSignedCurrency,
  pnlColor,
  scoreColor,
} from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Currency, Strategy, Trade, TradeSession } from "@/lib/types";

type RangeKey = "7" | "30" | "90" | "ytd" | "all";

const RANGE_OPTIONS: { value: RangeKey; key: string }[] = [
  { value: "7", key: "analytics.last7" },
  { value: "30", key: "analytics.last30" },
  { value: "90", key: "analytics.last90" },
  { value: "ytd", key: "analytics.ytd" },
  { value: "all", key: "analytics.allTime" },
];

export function AnalyticsView({
  strategies,
  hideAmounts,
  defaultCurrency = "USD",
}: {
  strategies: Strategy[];
  hideAmounts: boolean;
  defaultCurrency?: Currency;
}) {
  const { t, locale } = useI18n();
  const { trades, accounts } = useData();
  const searchParams = useSearchParams();
  const accountParam = searchParams.get("account");

  const [range, setRange] = React.useState<RangeKey>("all");
  const [strategyFilter, setStrategyFilter] = React.useState<string>("all");
  const [accountFilter, setAccountFilter] = React.useState<string>(accountParam ?? "all");

  React.useEffect(() => {
    setAccountFilter(accountParam ?? "all");
  }, [accountParam]);

  const currency: Currency =
    accountFilter !== "all"
      ? (accounts.find((a) => a.id === accountFilter)?.currency ?? defaultCurrency)
      : (accounts[0]?.currency ?? defaultCurrency);

  const filteredTrades = React.useMemo(() => {
    const now = new Date();
    let cutoff: Date | null = null;

    if (range === "7") cutoff = new Date(now.getTime() - 7 * 86400000);
    else if (range === "30") cutoff = new Date(now.getTime() - 30 * 86400000);
    else if (range === "90") cutoff = new Date(now.getTime() - 90 * 86400000);
    else if (range === "ytd") cutoff = new Date(now.getFullYear(), 0, 1);

    return trades.filter((trade) => {
      if (trade.status !== "closed") return false;
      if (accountFilter !== "all" && trade.account_id !== accountFilter) return false;
      if (strategyFilter !== "all") {
        if (strategyFilter === "none" ? trade.strategy_id !== null : trade.strategy_id !== strategyFilter) {
          return false;
        }
      }
      if (cutoff && new Date(trade.traded_at) < cutoff) return false;
      return true;
    });
  }, [trades, accountFilter, strategyFilter, range]);

  const analytics = React.useMemo(() => computeAnalytics(filteredTrades), [filteredTrades]);
  const equity = React.useMemo(() => buildDailyEquityCurve(filteredTrades), [filteredTrades]);

  const sessionStats = React.useMemo(() => groupBySession(filteredTrades), [filteredTrades]);
  const hourStats = React.useMemo(() => groupByHour(filteredTrades), [filteredTrades]);
  const instrumentStats = React.useMemo(() => groupByInstrument(filteredTrades), [filteredTrades]);
  const directionStats = React.useMemo(() => groupByDirection(filteredTrades), [filteredTrades]);
  const strategyStats = React.useMemo(() => groupByStrategy(filteredTrades), [filteredTrades]);

  const longStat = directionStats.find((d) => d.key === "long");
  const shortStat = directionStats.find((d) => d.key === "short");

  const sessionChartData = React.useMemo(
    () =>
      sessionStats
        .map((s) => ({
          label: t(SESSION_LABEL_KEYS[s.key as TradeSession] ?? "analytics.sessionOther"),
          netPnl: s.netPnl,
          trades: s.trades,
        }))
        .sort((a, b) => b.netPnl - a.netPnl),
    [sessionStats, t],
  );

  const hourChartData = React.useMemo(
    () =>
      hourStats.slice(0, 12).map((h) => ({
        label: hourLabel(h.key),
        winRate: h.winRate,
        trades: h.trades,
        netPnl: h.netPnl,
      })),
    [hourStats],
  );

  const strategyLabel = React.useCallback(
    (key: string) =>
      key === "none"
        ? t("journal.noLinkedTrade")
        : (strategies.find((s) => s.id === key)?.name ?? key),
    [strategies, t],
  );

  const scoreBreakdown = React.useMemo(
    () =>
      analytics.scoreBreakdown.map((c) => ({
        ...c,
        label:
          c.key === "winRate"
            ? t("analytics.winRate")
            : c.key === "profitFactor"
              ? t("analytics.profitFactor")
              : c.key === "avgWinLoss"
                ? t("analytics.avgWinLoss")
                : c.key === "recoveryFactor"
                  ? t("analytics.recoveryFactor")
                  : c.key === "maxDrawdown"
                    ? t("analytics.maxDrawdown")
                    : t("analytics.consistency"),
      })),
    [analytics.scoreBreakdown, t],
  );

  const hasData = analytics.totalTrades >= 1;

  return (
    <div>
      {/* ============================================================ */}
      {/* MOBILE ANALYTICS VIEW (KONSISTEN 100% DENGAN DASHBOARD MOBILE)*/}
      {/* ============================================================ */}
      <div className="block lg:hidden space-y-3.5">
        {/* Range Pill Selector */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
          {RANGE_OPTIONS.map((r) => (
            <button
              key={r.value}
              onClick={() => setRange(r.value)}
              className={cn(
                "rounded-xl px-3 py-1.5 text-xs font-semibold whitespace-nowrap transition-all",
                range === r.value
                  ? "bg-[#b2ff05] text-black shadow-[0_0_12px_rgba(178,255,5,0.3)]"
                  : "bg-[#141418] text-[#8e8e93] border border-white/[0.06] hover:text-white"
              )}
            >
              {t(r.key)}
            </button>
          ))}
        </div>

        {/* 1. All Accounts Analytics Summary Card */}
        <div className="mobile-card p-4 transition-all duration-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[#8e8e93]">Net Analytics P&L</span>
            <span className="rounded bg-[#b2ff05]/15 px-2 py-0.5 font-mono text-[10px] font-bold text-[#b2ff05]">
              {filteredTrades.length} Trades
            </span>
          </div>
          <div className="mt-1 flex items-baseline justify-between">
            <span className={cn("font-mono text-2xl font-bold tracking-tight", pnlColor(analytics.netPnl))}>
              {hideAmounts ? "$ ••••••" : formatSignedCurrency(analytics.netPnl, currency)}
            </span>
            <span className="text-[11px] text-[#a1a1aa] font-medium">
              PF: <strong className="text-white font-mono">{formatRatio(analytics.profitFactor)}</strong>
            </span>
          </div>
        </div>

        {/* 2. Grid 2 Kolom: Net PnL Card + Win Rate Card (Identik Dashboard) */}
        <div className="grid grid-cols-2 gap-3">
          {/* Net PnL Card */}
          <div className="mobile-card p-3.5 flex flex-col justify-between h-[156px] relative overflow-hidden">
            <div>
              <p className="text-[11px] font-medium text-[#8e8e93]">Profit Factor Card</p>
              <p className="mt-2 font-mono text-xl font-bold text-[#b2ff05] tracking-tight">
                {formatRatio(analytics.profitFactor)}
              </p>
              <p className="text-[11px] text-[#a1a1aa] mt-0.5 flex items-center gap-1 font-medium">
                Exp: <span className="font-mono text-white">{formatSignedCurrency(analytics.expectancy, currency)}</span>
              </p>
            </div>

            {/* Glowing Neon Wave */}
            <div className="h-10 w-full mt-auto overflow-hidden">
              <svg viewBox="0 0 100 35" className="h-full w-full block">
                <defs>
                  <linearGradient id="anSparkGlow" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#b2ff05" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="#b2ff05" stopOpacity="0.0" />
                  </linearGradient>
                </defs>
                <path
                  d="M0,28 Q20,24 40,16 T70,18 T90,6 T100,4"
                  fill="none"
                  stroke="#b2ff05"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
                <path
                  d="M0,28 Q20,24 40,16 T70,18 T90,6 T100,4 L100,35 L0,35 Z"
                  fill="url(#anSparkGlow)"
                />
              </svg>
            </div>
          </div>

          {/* Win Rate Card with Glowing Ring */}
          <div className="mobile-card p-3.5 flex flex-col items-center justify-between h-[156px] text-center">
            <p className="text-[11px] font-medium text-[#8e8e93] w-full text-left">Win Rate Card</p>

            {/* Glowing Circular Ring */}
            <div className="relative my-auto flex items-center justify-center">
              <svg className="h-[68px] w-[68px] -rotate-90">
                <circle
                  cx="34"
                  cy="34"
                  r="27"
                  stroke="#27272a"
                  strokeWidth="5.5"
                  fill="transparent"
                />
                <circle
                  cx="34"
                  cy="34"
                  r="27"
                  stroke="#b2ff05"
                  strokeWidth="5.5"
                  strokeDasharray="170"
                  strokeDashoffset={170 - (170 * (analytics.winRate || 68)) / 100}
                  strokeLinecap="round"
                  fill="transparent"
                  className="neon-ring transition-all duration-700"
                />
              </svg>

              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="font-mono text-sm font-bold text-white tracking-tight leading-none">
                  {Math.round(analytics.winRate || 68)}%
                </span>
                <span className="text-[9px] text-[#8e8e93] mt-0.5 leading-none">Win Rate</span>
              </div>
            </div>

            <p className="text-[10px] text-[#8e8e93] font-medium">
              {analytics.wins}W · {analytics.losses}L · {analytics.breakevens}BE
            </p>
          </div>
        </div>

        {/* 3. Tradelog Edge Score Bento */}
        <div className="mobile-card p-4 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[#8e8e93]">Tradelog Institutional Score</span>
            <span className="font-mono text-xs font-bold text-[#b2ff05]">
              {analytics.tradelogScore} / 100
            </span>
          </div>

          <div className="h-2 w-full overflow-hidden rounded-full bg-white/[0.08]">
            <div
              className="h-full rounded-full bg-[#b2ff05] shadow-[0_0_10px_#b2ff05] transition-all duration-500"
              style={{ width: `${analytics.tradelogScore}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[10px] text-[#71717a]">
            <span>Consistent Execution</span>
            <span className="text-[#d4d4d8] font-semibold">Tier A Trader</span>
          </div>
        </div>

        {/* 4. Equity Curve Chart */}
        <div className="mobile-card p-4 space-y-2 overflow-hidden">
          <p className="text-xs font-medium text-[#8e8e93]">Cumulative Growth Curve</p>
          <div className="h-44 w-full pt-1 overflow-hidden">
            <EquityCurveChart data={equity} currency={currency} hideAmounts={hideAmounts} />
          </div>
        </div>

        {/* 5. Direction & Session Activity Bento */}
        <div className="space-y-2">
          <p className="text-xs font-medium text-[#8e8e93]">Direction & Risk Bento</p>

          <div className="grid grid-cols-3 gap-2.5">
            <div className="mobile-card p-3 flex flex-col justify-between">
              <span className="text-[10px] text-[#8e8e93] font-medium">Max DD:</span>
              <span className="font-mono text-sm font-bold text-red-400 mt-1">
                {formatPercent(analytics.maxDrawdownPercent, 1)}
              </span>
            </div>

            <div className="mobile-card p-3 flex flex-col justify-between">
              <span className="text-[10px] text-[#8e8e93] font-medium">Recovery:</span>
              <span className="font-mono text-sm font-bold text-[#b2ff05] mt-1">
                {formatRatio(analytics.recoveryFactor)}
              </span>
            </div>

            <div className="mobile-card p-3 flex flex-col justify-between">
              <span className="text-[10px] text-[#8e8e93] font-medium">Avg R:R:</span>
              <span className="font-mono text-sm font-bold text-white mt-1">
                {formatR(analytics.avgRr)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* DESKTOP ANALYTICS VIEW (TRADOXES SUITE EXPANDED DESKTOP)     */}
      {/* ============================================================ */}
      <div className="hidden lg:block mx-auto max-w-[1280px] p-6 space-y-6">
        {/* Desktop Header Bar (Identik Dashboard) */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-[#f2f2f0] sm:text-3xl">
              {t("analytics.title")}
            </h1>
            <p className="mt-0.5 text-xs text-[#8e8e93]">{t("analytics.subtitle")}</p>
          </div>

          <div className="flex items-center gap-2">
            {/* Range pill buttons (Identik Dashboard) */}
            <div className="flex items-center gap-1 overflow-x-auto no-scrollbar rounded-xl border border-[#1c1c1f] bg-[#0d0d0f] p-1 text-xs">
              {RANGE_OPTIONS.map((item) => (
                <button
                  key={item.value}
                  onClick={() => setRange(item.value)}
                  className={cn(
                    "whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-medium transition-all shrink-0",
                    range === item.value
                      ? "bg-[#b2ff05] text-black font-semibold shadow-sm"
                      : "text-[#8e8e93] hover:text-[#f2f2f0]"
                  )}
                >
                  {t(item.key)}
                </button>
              ))}
            </div>

            <PerformanceSnapshotDialog
              data={{
                netPnl: analytics.netPnl,
                winRate: analytics.winRate,
                profitFactor: analytics.profitFactor,
                expectancy: analytics.expectancy,
                maxDrawdownPercent: analytics.maxDrawdownPercent,
                consistency: analytics.consistency,
                score: analytics.tradelogScore,
                totalTrades: analytics.totalTrades,
                avgRr: analytics.avgRr,
                wins: analytics.wins,
                losses: analytics.losses,
                breakevens: analytics.breakevens,
              }}
              periodLabel={t(RANGE_OPTIONS.find((r) => r.value === range)?.key ?? "analytics.allTime")}
              currency={currency}
              hideAmounts={hideAmounts}
            >
              <Button size="sm" variant="outline" className="gap-1.5 border-white/10 bg-[#141418] text-white hover:border-white/20 rounded-xl h-9">
                <Camera className="h-4 w-4 text-[#b2ff05]" />
                <span className="hidden sm:inline">{t("analytics.snapshotPerf")}</span>
              </Button>
            </PerformanceSnapshotDialog>

            <Button asChild size="sm" className="gap-1.5 bg-[#b2ff05] text-black font-bold hover:bg-[#9fe000] rounded-xl h-9 shadow-[0_0_15px_rgba(178,255,5,0.25)]">
              <Link href="/trades/new">
                <Plus className="h-4 w-4 stroke-[2.5]" />
                {t("trades.new")}
              </Link>
            </Button>
          </div>
        </div>

        {/* Filter bar */}
        <div className="tradoxes-card rounded-2xl p-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-xs font-semibold text-[#8e8e93] uppercase tracking-wider">Filters:</span>
            <Select value={accountFilter} onValueChange={setAccountFilter}>
              <SelectTrigger className="h-9 w-[170px] rounded-xl border-white/10 bg-[#121215] text-xs text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="border-white/10 bg-[#0e0e12] text-white">
                <SelectItem value="all">{t("trades.filterAccount")}</SelectItem>
                {accounts.map((account) => (
                  <SelectItem key={account.id} value={account.id}>
                    <span className="flex items-center gap-2">
                      <span
                        className="h-1.5 w-1.5 rounded-full"
                        style={{ backgroundColor: account.color }}
                      />
                      {account.name}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={strategyFilter} onValueChange={setStrategyFilter}>
              <SelectTrigger className="h-9 w-[170px] rounded-xl border-white/10 bg-[#121215] text-xs text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="border-white/10 bg-[#0e0e12] text-white">
                <SelectItem value="all">{t("trades.filterStrategy")}</SelectItem>
                <SelectItem value="none">{t("journal.noLinkedTrade")}</SelectItem>
                {strategies.map((strategy) => (
                  <SelectItem key={strategy.id} value={strategy.id}>
                    <span className="flex items-center gap-2">
                      <span
                        className="h-1.5 w-1.5 rounded-full"
                        style={{ backgroundColor: strategy.color }}
                      />
                      {strategy.name}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 rounded-full border border-white/[0.08] bg-[#141418] px-3 py-1 text-xs text-[#a0a0a0]">
              <span className="h-2 w-2 rounded-full bg-[#b2ff05] animate-pulse shadow-[0_0_8px_#b2ff05]" />
              <span className="font-semibold text-white">{filteredTrades.length} Trades Analyzed</span>
            </div>
          </div>
        </div>

        {!hasData ? (
          <EmptyState
            icon={BarChart3}
            title={t("analytics.noData")}
            description={t("analytics.noDataDesc")}
            action={
              <Button asChild>
                <Link href="/trades/new">
                  <Plus className="h-4 w-4" />
                  {t("trades.new")}
                </Link>
              </Button>
            }
          />
        ) : (
          <div className="space-y-6">
            {/* KPI Grid 1 (4 columns) */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {/* Net P&L */}
              <div className="tradoxes-card tradoxes-card-hover rounded-2xl p-5 relative overflow-hidden flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-[#8e8e93]">
                    {t("analytics.netPnl")}
                  </span>
                  <div className="rounded-lg bg-white/[0.04] p-1.5 border border-white/[0.06]">
                    <TrendingUp className={cn("h-4 w-4", analytics.netPnl >= 0 ? "text-[#b2ff05]" : "text-red-400")} />
                  </div>
                </div>
                <div className="mt-3">
                  <p className={cn("font-mono text-3xl font-extrabold tracking-tight", analytics.netPnl >= 0 ? "text-[#b2ff05]" : "text-red-400")}>
                    {hideAmounts
                      ? "$ ••••••"
                      : formatSignedCurrency(analytics.netPnl, currency)}
                  </p>
                  <p className="mt-1 text-xs text-[#71717a] font-medium">
                    {analytics.totalTrades} Total Trades
                  </p>
                </div>
              </div>

              {/* Win Rate */}
              <div className="tradoxes-card tradoxes-card-hover rounded-2xl p-5 relative overflow-hidden flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-[#8e8e93]">
                    {t("analytics.winRate")}
                  </span>
                  <div className="rounded-lg bg-white/[0.04] p-1.5 border border-white/[0.06]">
                    <Target className="h-4 w-4 text-[#b2ff05]" />
                  </div>
                </div>
                <div className="mt-3">
                  <p className="font-mono text-3xl font-extrabold tracking-tight text-white">
                    {formatPercent(analytics.winRate, 1)}
                  </p>
                  <p className="mt-1 text-xs text-[#71717a] font-medium">
                    {analytics.wins}W · {analytics.losses}L · {analytics.breakevens}BE
                  </p>
                </div>
              </div>

              {/* Profit Factor */}
              <div className="tradoxes-card tradoxes-card-hover rounded-2xl p-5 relative overflow-hidden flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-[#8e8e93]">
                    {t("analytics.profitFactor")}
                  </span>
                  <div className="rounded-lg bg-white/[0.04] p-1.5 border border-white/[0.06]">
                    <Scale className="h-4 w-4 text-[#b2ff05]" />
                  </div>
                </div>
                <div className="mt-3">
                  <p className="font-mono text-3xl font-extrabold tracking-tight text-[#b2ff05]">
                    {formatRatio(analytics.profitFactor)}
                  </p>
                  <p className="mt-1 text-xs text-[#71717a] font-medium">
                    Gross: {hideAmounts ? "—" : formatCurrency(analytics.grossProfit, currency, { compact: true })}
                  </p>
                </div>
              </div>

              {/* Expectancy */}
              <div className="tradoxes-card tradoxes-card-hover rounded-2xl p-5 relative overflow-hidden flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-[#8e8e93]">
                    {t("analytics.expectancy")}
                  </span>
                  <div className="rounded-lg bg-white/[0.04] p-1.5 border border-white/[0.06]">
                    <Zap className="h-4 w-4 text-white" />
                  </div>
                </div>
                <div className="mt-3">
                  <p className={cn("font-mono text-3xl font-extrabold tracking-tight", pnlColor(analytics.expectancy))}>
                    {hideAmounts
                      ? formatR(analytics.avgRr)
                      : formatSignedCurrency(analytics.expectancy, currency)}
                  </p>
                  <p className="mt-1 text-xs text-[#71717a] font-medium">
                    Avg R:R: <strong className="text-white font-mono">{formatR(analytics.avgRr)}</strong>
                  </p>
                </div>
              </div>
            </div>

            {/* KPI Grid 2 (4 columns) */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {/* Max DD */}
              <div className="tradoxes-card tradoxes-card-hover rounded-2xl p-5 relative overflow-hidden flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-[#8e8e93]">
                    {t("analytics.maxDrawdown")}
                  </span>
                  <TrendingDown className="h-4 w-4 text-red-400" />
                </div>
                <div className="mt-3">
                  <p className="font-mono text-2xl font-extrabold text-red-400 tracking-tight">
                    {hideAmounts
                      ? formatPercent(analytics.maxDrawdownPercent, 1)
                      : formatCurrency(analytics.maxDrawdown, currency)}
                  </p>
                  <p className="mt-1 text-xs text-[#71717a] font-medium">
                    Peak to Trough {formatPercent(analytics.maxDrawdownPercent, 1)}
                  </p>
                </div>
              </div>

              {/* Recovery Factor */}
              <div className="tradoxes-card tradoxes-card-hover rounded-2xl p-5 relative overflow-hidden flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-[#8e8e93]">
                    {t("analytics.recoveryFactor")}
                  </span>
                  <Flame className="h-4 w-4 text-[#b2ff05]" />
                </div>
                <div className="mt-3">
                  <p className="font-mono text-2xl font-extrabold text-[#b2ff05] tracking-tight">
                    {formatRatio(analytics.recoveryFactor)}
                  </p>
                  <p className="mt-1 text-xs text-[#71717a] font-medium">
                    Consistency: {formatPercent(analytics.consistency, 0)}
                  </p>
                </div>
              </div>

              {/* Avg Hold Time */}
              <div className="tradoxes-card tradoxes-card-hover rounded-2xl p-5 relative overflow-hidden flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-[#8e8e93]">
                    {t("analytics.holdTime")}
                  </span>
                  <Timer className="h-4 w-4 text-white" />
                </div>
                <div className="mt-3">
                  <p className="font-mono text-2xl font-extrabold text-white tracking-tight">
                    {formatDuration(analytics.avgHoldMinutes, locale)}
                  </p>
                  <p className="mt-1 text-xs text-[#71717a] font-medium">
                    Avg Win: {hideAmounts ? "—" : formatCurrency(analytics.avgWin, currency, { compact: true })}
                  </p>
                </div>
              </div>

              {/* Streak */}
              <div className="tradoxes-card tradoxes-card-hover rounded-2xl p-5 relative overflow-hidden flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-[#8e8e93]">
                    {t("analytics.streakTitle")}
                  </span>
                  <Layers className="h-4 w-4 text-[#b2ff05]" />
                </div>
                <div className="mt-3">
                  <p className={cn("font-mono text-2xl font-extrabold tracking-tight", analytics.currentStreak >= 0 ? "text-[#b2ff05]" : "text-red-400")}>
                    {analytics.currentStreak >= 0 ? `+${analytics.currentStreak}` : String(analytics.currentStreak)}
                  </p>
                  <p className="mt-1 text-xs text-[#71717a] font-medium">
                    Max Win: {analytics.longestWinStreak} · Max Loss: {analytics.longestLossStreak}
                  </p>
                </div>
              </div>
            </div>

            {/* Skor Tradelog Besar + 6 Metrik Breakdown */}
            <div className="grid gap-5 lg:grid-cols-3">
              <div className="tradoxes-card rounded-2xl p-5 lg:col-span-1 flex flex-col justify-between">
                <div className="pb-3 border-b border-white/[0.06] flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Gauge className="h-4 w-4 text-[#b2ff05]" strokeWidth={2} />
                    <h3 className="text-sm font-semibold uppercase tracking-wider text-[#8e8e93]">{t("analytics.tradelogScore")}</h3>
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#b2ff05] bg-[#b2ff05]/10 px-2 py-0.5 rounded border border-[#b2ff05]/20">
                    Edge Metric
                  </span>
                </div>
                <div className="flex flex-1 flex-col items-center justify-center py-5">
                  <ScoreGauge score={analytics.tradelogScore} size={220} strokeWidth={16} />
                  <p className="mt-3 text-center text-xs text-[#a1a1aa] max-w-[240px]">
                    {t("analytics.scoreDesc")}
                  </p>
                  {analytics.totalTrades < 10 && (
                    <p className="mt-3 flex items-start gap-1.5 rounded-xl bg-amber-500/10 border border-amber-500/20 px-3 py-2 text-[10px] leading-relaxed text-amber-300">
                      <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                      {t("analytics.noDataDesc")}
                    </p>
                  )}
                </div>
              </div>

              <div className="tradoxes-card rounded-2xl p-5 lg:col-span-2 flex flex-col justify-between">
                <div className="pb-3 border-b border-white/[0.06] flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-semibold uppercase tracking-wider text-[#8e8e93]">{t("analytics.scoreBreakdown")}</h3>
                    <p className="text-[11px] text-[#71717a]">Evaluasi 6 dimensi konsistensi & probabilitas trading</p>
                  </div>
                  <span className="font-mono text-xs font-bold text-[#b2ff05] bg-[#b2ff05]/10 px-2 py-0.5 rounded border border-[#b2ff05]/20">
                    {analytics.tradelogScore.toFixed(0)} / 100
                  </span>
                </div>
                <div className="pt-4 flex-1">
                  <ScoreBreakdown breakdown={scoreBreakdown} />
                </div>
              </div>
            </div>

            {/* Equity + Donut */}
            <div className="grid gap-5 lg:grid-cols-[2fr_1fr]">
              <div className="tradoxes-card rounded-2xl p-5">
                <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
                  <div>
                    <h3 className="text-sm font-semibold uppercase tracking-wider text-[#8e8e93]">{t("analytics.equityCurve")}</h3>
                    <p className="text-[11px] text-[#71717a]">Cumulative growth curve over selected period</p>
                  </div>
                  <span className={cn("font-mono text-sm font-bold", pnlColor(equity[equity.length - 1]?.equity ?? 0))}>
                    {hideAmounts
                      ? "—"
                      : formatSignedCurrency(equity[equity.length - 1]?.equity ?? 0, currency, {
                          compact: true,
                        })}
                  </span>
                </div>
                <div className="pt-4">
                  <EquityCurveChart data={equity} currency={currency} height={260} hideAmounts={hideAmounts} />
                </div>
              </div>

              <div className="tradoxes-card rounded-2xl p-5 flex flex-col justify-between">
                <div className="pb-3 border-b border-white/[0.06]">
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-[#8e8e93]">{t("analytics.resultDistribution")}</h3>
                </div>
                <div className="py-2">
                  <ResultDonut
                    wins={analytics.wins}
                    losses={analytics.losses}
                    breakevens={analytics.breakevens}
                    height={196}
                  />
                </div>
                <div className="grid grid-cols-3 gap-2 border-t border-white/[0.06] pt-3 text-center">
                  <div>
                    <p className="text-[9px] uppercase tracking-wide text-[#8e8e93]">{t("analytics.avgWin")}</p>
                    <p className="tabular text-xs font-bold text-[#b2ff05]">
                      {hideAmounts ? "—" : formatCurrency(analytics.avgWin, currency, { compact: true })}
                    </p>
                  </div>
                  <div>
                    <p className="text-[9px] uppercase tracking-wide text-[#8e8e93]">{t("analytics.avgLoss")}</p>
                    <p className="tabular text-xs font-bold text-red-400">
                      {hideAmounts ? "—" : formatCurrency(analytics.avgLoss, currency, { compact: true })}
                    </p>
                  </div>
                  <div>
                    <p className="text-[9px] uppercase tracking-wide text-[#8e8e93]">{t("analytics.consistency")}</p>
                    <p className="tabular text-xs font-bold text-white">
                      {formatPercent(analytics.consistency, 0)}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Sesi + Jam + Arah */}
            <div className="grid gap-5 lg:grid-cols-3">
              <div className="tradoxes-card rounded-2xl p-5">
                <div className="pb-3 border-b border-white/[0.06]">
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-[#8e8e93]">{t("analytics.bySession")}</h3>
                  {sessionChartData[0] && (
                    <p className="text-xs font-bold text-[#b2ff05] mt-0.5">
                      Sesi terbaik: {sessionChartData[0].label}
                    </p>
                  )}
                </div>
                <div className="pt-3">
                  <SessionBarChart data={sessionChartData} height={210} />
                  <SessionHoursLegend />
                </div>
              </div>

              <div className="tradoxes-card rounded-2xl p-5">
                <div className="pb-3 border-b border-white/[0.06]">
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-[#8e8e93]">{t("analytics.byHour")}</h3>
                  {hourChartData.length > 0 && (
                    <p className="text-xs font-bold text-[#b2ff05] mt-0.5">
                      Jam paling aktif: {hourChartData.slice().sort((a, b) => b.trades - a.trades)[0]?.label}
                    </p>
                  )}
                </div>
                <div className="pt-3">
                  <WinRateBarChart data={hourChartData} height={210} />
                </div>
              </div>

              <div className="tradoxes-card rounded-2xl p-5 flex flex-col justify-between">
                <div className="pb-3 border-b border-white/[0.06]">
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-[#8e8e93]">{t("analytics.byDirection")}</h3>
                  <p className="text-xs font-bold text-[#b2ff05] mt-0.5">
                    Dominan: {(longStat?.winRate ?? 0) >= (shortStat?.winRate ?? 0) ? "Long" : "Short"} (
                    {formatPercent(Math.max(longStat?.winRate ?? 0, shortStat?.winRate ?? 0), 0)} WR)
                  </p>
                </div>
                <div className="py-2">
                  <DirectionCompareChart
                    long={{
                      netPnl: longStat?.netPnl ?? 0,
                      winRate: longStat?.winRate ?? 0,
                      trades: longStat?.trades ?? 0,
                    }}
                    short={{
                      netPnl: shortStat?.netPnl ?? 0,
                      winRate: shortStat?.winRate ?? 0,
                      trades: shortStat?.trades ?? 0,
                    }}
                    height={170}
                  />
                </div>
                <div className="grid grid-cols-2 gap-2 border-t border-white/[0.06] pt-3 text-center">
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-[#8e8e93]">{t("analytics.long")}</p>
                    <p className="tabular font-mono text-xs font-bold text-white">
                      {formatPercent(longStat?.winRate ?? 0, 0)}
                      <span className="ml-1 text-[10px] font-normal text-[#71717a]">
                        ({longStat?.trades ?? 0})
                      </span>
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-[#8e8e93]">{t("analytics.short")}</p>
                    <p className="tabular font-mono text-xs font-bold text-white">
                      {formatPercent(shortStat?.winRate ?? 0, 0)}
                      <span className="ml-1 text-[10px] font-normal text-[#71717a]">
                        ({shortStat?.trades ?? 0})
                      </span>
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Tabel pair & strategi */}
            <div className="grid gap-5 lg:grid-cols-2">
              <BucketTable
                title={t("analytics.byPair")}
                rows={instrumentStats}
                currency={currency}
                hideAmounts={hideAmounts}
                emptyLabel={t("analytics.noData")}
                locale={locale}
              />
              <BucketTable
                title={t("analytics.byStrategy")}
                rows={strategyStats}
                currency={currency}
                hideAmounts={hideAmounts}
                emptyLabel={t("analytics.noData")}
                labelFor={strategyLabel}
                locale={locale}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function BucketTable({
  title,
  rows,
  currency,
  hideAmounts,
  emptyLabel,
  labelFor,
  locale,
}: {
  title: string;
  rows: BucketStat[];
  currency: Currency;
  hideAmounts: boolean;
  emptyLabel: string;
  labelFor?: (key: string) => string;
  locale: string;
}) {
  const { t } = useI18n();
  const maxAbs = Math.max(1, ...rows.map((r) => Math.abs(r.netPnl)));

  return (
    <div className="tradoxes-card rounded-2xl overflow-hidden">
      <div className="p-5 pb-3 border-b border-white/[0.06]">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-[#8e8e93]">{title}</h3>
      </div>
      <div className="px-0 pb-2">
        {rows.length === 0 ? (
          <p className="px-5 py-6 text-xs text-[#71717a]">{emptyLabel}</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-white/[0.06] bg-black/20 text-[10px] uppercase tracking-wider text-[#8e8e93]">
                  <th className="px-5 py-2.5 text-left font-medium">
                    {labelFor ? t("trades.strategy") : t("trades.instrument")}
                  </th>
                  <th className="px-3 py-2.5 text-right font-medium">{t("analytics.countLabel")}</th>
                  <th className="px-3 py-2.5 text-right font-medium">{t("analytics.winRateLabel")}</th>
                  <th className="px-3 py-2.5 text-right font-medium">{t("analytics.pnlLabel")}</th>
                  <th className="hidden w-[64px] px-4 py-2.5 text-right font-medium sm:table-cell">
                    R
                  </th>
                </tr>
              </thead>
              <tbody>
                {rows.slice(0, 10).map((row) => {
                  const label = labelFor ? labelFor(row.key) : row.key;
                  return (
                    <tr key={row.key} className="border-b border-white/[0.04] last:border-0 hover:bg-white/[0.02] transition-colors">
                      <td className="max-w-[140px] truncate px-5 py-2.5 font-bold text-white">
                        {labelFor ? (
                          label
                        ) : (
                          <span className="font-mono text-xs">{label}</span>
                        )}
                      </td>
                      <td className="tabular px-3 py-2.5 text-right text-[#a1a1aa] font-mono">
                        {row.trades}
                      </td>
                      <td className="px-3 py-2.5 text-right">
                        <span className="inline-flex items-center gap-1.5 font-mono font-bold text-white">
                          <span className="hidden h-1.5 w-10 overflow-hidden rounded-full bg-white/[0.08] sm:block">
                            <span
                              className="block h-full rounded-full"
                              style={{
                                width: `${Math.max(3, row.winRate)}%`,
                                backgroundColor:
                                  row.winRate >= 50 ? "#b2ff05" : row.winRate >= 40 ? "#eab308" : "#ef4444",
                              }}
                            />
                          </span>
                          {formatPercent(row.winRate, 0)}
                        </span>
                      </td>
                      <td className={cn("tabular px-3 py-2.5 text-right font-mono font-bold", pnlColor(row.netPnl))}>
                        {hideAmounts
                          ? "—"
                          : formatSignedCurrency(row.netPnl, currency, { compact: true })}
                      </td>
                      <td className="hidden px-4 py-2.5 text-right font-mono text-[11px] text-[#a1a1aa] sm:table-cell">
                        {formatR(row.avgRr)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

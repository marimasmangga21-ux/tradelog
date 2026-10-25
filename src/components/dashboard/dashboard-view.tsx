"use client";

import * as React from "react";
import Link from "next/link";
import {
  ArrowDown,
  ArrowRight,
  ArrowUp,
  ArrowUpRight,
  Bell,
  ChevronRight,
  Eye,
  EyeOff,
  Plus,
  TrendingDown,
  TrendingUp,
  Wallet,
} from "lucide-react";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { cn } from "@/lib/utils";
import { MarketHoursCard } from "@/components/dashboard/market-hours-card";
import { OnboardingGuide } from "@/components/dashboard/onboarding-guide";
import type { Account, Emotion, Journal, Strategy, Trade } from "@/lib/types";

type PeriodKey = "week" | "month" | "3months" | "6months" | "all";

export function DashboardView({
  accounts,
  strategies,
  trades,
  journals,
  emotions,
  userName = "Evan Mita",
  hideAmounts = false,
  isSample = false,
}: {
  accounts: Account[];
  strategies: Strategy[];
  trades: Trade[];
  journals?: Journal[];
  emotions?: Emotion[];
  userName?: string;
  hideAmounts?: boolean;
  isSample?: boolean;
}) {
  const [period, setPeriod] = React.useState<PeriodKey>("month");
  const [privacyMode, setPrivacyMode] = React.useState(hideAmounts);

  // Filter trade berdasarkan status
  const closedTrades = React.useMemo(() => trades.filter((t) => t.status === "closed"), [trades]);
  const wins = closedTrades.filter((t) => t.result === "win");
  const losses = closedTrades.filter((t) => t.result === "loss");
  const breakevens = closedTrades.filter((t) => t.result === "breakeven");

  const totalTrades = closedTrades.length;
  const winRate = closedTrades.length > 0 ? (wins.length / closedTrades.length) * 100 : 0;

  const grossProfit = wins.reduce((sum, t) => sum + (t.pnl || 0), 0);
  const grossLoss = Math.abs(losses.reduce((sum, t) => sum + (t.pnl || 0), 0));
  const profitFactor = grossLoss > 0 ? grossProfit / grossLoss : grossProfit > 0 ? grossProfit : 0;

  // Best pair
  const pairMap = new Map<string, number>();
  closedTrades.forEach((t) => {
    pairMap.set(t.instrument, (pairMap.get(t.instrument) || 0) + (t.pnl || 0));
  });
  let bestPair = "—";
  let maxPnl = -Infinity;
  pairMap.forEach((pnl, pair) => {
    if (pnl > maxPnl && pnl > 0) {
      maxPnl = pnl;
      bestPair = pair;
    }
  });

  // Saldo nyata tanpa dummy fallback
  const totalDeposit = accounts.reduce((acc, a) => acc + (a.total_deposits ?? a.initial_balance ?? 0), 0);
  const netPnl = closedTrades.reduce((sum, t) => sum + (t.pnl || 0), 0);
  const currentBalance = totalDeposit + netPnl;
  const pnlPercent = totalDeposit > 0 ? (netPnl / totalDeposit) * 100 : 0;

  // Win streak
  const winStreak = React.useMemo(() => {
    let streak = 0;
    for (const t of closedTrades) {
      if (t.result === "win") streak++;
      else break;
    }
    return streak;
  }, [closedTrades]);

  // Data kurva saldo (diurutkan kronologis dari trade tertua ke terbaru)
  const chartData = React.useMemo(() => {
    let running = totalDeposit;
    const pts = [{ date: "Start", balance: running }];
    const chronological = [...closedTrades].sort(
      (a, b) => new Date(a.traded_at).getTime() - new Date(b.traded_at).getTime(),
    );
    chronological.slice(-30).forEach((t) => {
      running += t.pnl || 0;
      pts.push({
        date: new Date(t.traded_at).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        balance: Number(running.toFixed(2)),
      });
    });
    if (pts.length <= 1) {
      if (closedTrades.length === 0) {
        return [
          { date: "Start", balance: totalDeposit },
          { date: "Now", balance: totalDeposit },
        ];
      }
      return [
        { date: "Start", balance: totalDeposit },
        { date: "Now", balance: Number(running.toFixed(2)) },
      ];
    }
    return pts;
  }, [closedTrades, totalDeposit]);

  const todayLabel = React.useMemo(() => {
    return new Date().toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }, []);

  return (
    <div className="w-full">
      {/* Onboarding Stepper Guide: Hanya muncul ketika akun baru (belum memiliki akun trading sama sekali) */}
      {accounts.length === 0 && (
        <OnboardingGuide
          hasAccounts={accounts.length > 0}
          hasStrategies={strategies.length > 0}
          hasTrades={trades.length > 0}
          hasJournals={Boolean(journals && journals.length > 0)}
        />
      )}

      {/* ============================================================ */}
      {/* MOBILE UI VIEW (PRESISI GAMBAR 4 DARI DOKUMENTASI)           */}
      {/* Ditampilkan di layar ponsel atau iPhone simulator            */}
      {/* ============================================================ */}
      <div className="block lg:hidden space-y-3.5">
        {/* 1. All Accounts Card (Gambar 4) */}
        <div className="mobile-card p-4 transition-all duration-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[#8e8e93]">All Accounts</span>
            <Wallet className="h-4 w-4 text-[#eab308]/80 stroke-[1.75]" />
          </div>
          <div className="mt-1 flex items-baseline justify-between">
            <span className="font-mono text-2xl font-bold tracking-tight text-white">
              {privacyMode ? "$ ••••••" : `$${currentBalance.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
            </span>
            <button
              type="button"
              onClick={() => setPrivacyMode(!privacyMode)}
              className="text-[#71717a] hover:text-[#b2ff05] p-1"
            >
              {privacyMode ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
            </button>
          </div>
        </div>

        {/* 2. Grid 2 Kolom: Net PnL Card + Win Rate Card (Gambar 4) */}
        <div className="grid grid-cols-2 gap-3">
          {/* Net PnL Card */}
          <div className="mobile-card p-3.5 flex flex-col justify-between h-[156px] relative overflow-hidden">
            <div>
              <p className="text-[11px] font-medium text-[#8e8e93]">Net PnL Card</p>
              <p className="mt-2 font-mono text-lg font-bold text-[#b2ff05] tracking-tight">
                {privacyMode ? "+$ •••" : `+$${Math.abs(netPnl).toFixed(2)}`}
              </p>
              <p className="text-[11px] text-[#a1a1aa] mt-0.5 flex items-center gap-1 font-medium">
                (Today) <ArrowUpRight className="h-3 w-3 text-[#b2ff05]" />
              </p>
            </div>

            {/* Glowing Neon Sparkline Wave */}
            <div className="h-10 w-full mt-auto overflow-hidden">
              <svg viewBox="0 0 100 35" className="h-full w-full block">
                <defs>
                  <linearGradient id="sparkGlow" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#b2ff05" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="#b2ff05" stopOpacity="0.0" />
                  </linearGradient>
                </defs>
                <path
                  d="M0,30 Q15,28 30,18 T60,22 T85,8 T100,4"
                  fill="none"
                  stroke="#b2ff05"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
                <path
                  d="M0,30 Q15,28 30,18 T60,22 T85,8 T100,4 L100,35 L0,35 Z"
                  fill="url(#sparkGlow)"
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
                  strokeDashoffset={170 - (170 * winRate) / 100}
                  strokeLinecap="round"
                  fill="transparent"
                  className="neon-ring transition-all duration-700"
                />
              </svg>

              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="font-mono text-sm font-bold text-white tracking-tight leading-none">
                  {Math.round(winRate)}%
                </span>
                <span className="text-[9px] text-[#8e8e93] mt-0.5 leading-none">Win Rate</span>
              </div>
            </div>

            <p className="text-[10px] text-[#8e8e93] font-medium">{totalTrades} Total Trades</p>
          </div>
        </div>

        {/* 3. Equity Curve Chart Card (Gambar 4) */}
        <div className="mobile-card p-4 space-y-2 overflow-hidden">
          <p className="text-xs font-medium text-[#8e8e93]">Equity Curve Chart</p>

          <div className="relative h-44 w-full pt-1 overflow-hidden">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 8, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="equityNeonGlow" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#b2ff05" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="#b2ff05" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="date"
                  stroke="#1c1c1f"
                  tick={{ fill: "#52525b", fontSize: 9 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  stroke="#1c1c1f"
                  tick={{ fill: "#52525b", fontSize: 9 }}
                  axisLine={false}
                  tickLine={false}
                  domain={["auto", "auto"]}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="rounded-lg border border-white/10 bg-black/90 px-2 py-1 text-[11px] shadow-lg">
                          <span className="font-mono font-bold text-[#b2ff05]">
                            ${Number(payload[0].value).toFixed(2)}
                          </span>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="balance"
                  stroke="#b2ff05"
                  strokeWidth={2.75}
                  fill="url(#equityNeonGlow)"
                  isAnimationActive={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 4. Recent Activity Bento (Gambar 4) */}
        <div className="space-y-2">
          <p className="text-xs font-medium text-[#8e8e93]">Recent Activity Bento</p>

          <div className="grid grid-cols-3 gap-2.5">
            <div className="mobile-card p-3 flex flex-col justify-between">
              <span className="text-[10px] text-[#8e8e93] font-medium">Trades:</span>
              <span className="font-mono text-lg font-bold text-white mt-1">{totalTrades}</span>
            </div>

            <div className="mobile-card p-3 flex flex-col justify-between">
              <span className="text-[10px] text-[#8e8e93] font-medium">Win Streak:</span>
              <span className="font-mono text-lg font-bold text-white mt-1">{winStreak}</span>
            </div>

            <Link
              href="/strategies"
              className="mobile-card p-3 flex items-center justify-center transition-all hover:border-[#b2ff05]/40 active:scale-95 group"
            >
              <span className="text-xs font-semibold text-[#b2ff05] group-hover:underline">
                Strategies
              </span>
            </Link>
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* DESKTOP VIEW (TRADOXES EXPANDED FULL-SCREEN)                 */}
      {/* Tetap mempertahankan seluruh fungsi lengkap desktop          */}
      {/* ============================================================ */}
      <div className="hidden lg:block mx-auto max-w-[1280px] p-6 space-y-6">
        {/* Header Bar */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-[#f2f2f0] sm:text-3xl">
              Welcome back, {userName}
            </h1>
            <p className="mt-0.5 text-xs text-[#8e8e93]">{todayLabel}</p>
          </div>

          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar rounded-xl border border-[#1c1c1f] bg-[#0d0d0f] p-1 text-xs">
            {[
              { id: "week", label: "Week" },
              { id: "month", label: "Month" },
              { id: "3months", label: "3M" },
              { id: "6months", label: "6M" },
              { id: "all", label: "All" },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setPeriod(item.id as PeriodKey)}
                className={cn(
                  "whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-medium transition-all shrink-0",
                  period === item.id
                    ? "bg-[#b2ff05] text-black font-semibold shadow-sm"
                    : "text-[#8e8e93] hover:text-[#f2f2f0]",
                )}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {/* Grid Baris 1: Balance Chart (Col 8) + Performance Summary (Col 4) */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
          {/* Balance Card */}
          <div className="tradoxes-card relative flex flex-col justify-between overflow-hidden rounded-2xl p-5 lg:col-span-8">
            <div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <p className="text-xs font-medium uppercase tracking-wider text-[#8e8e93]">Total Saldo (Ekuitas)</p>
                  <button
                    type="button"
                    onClick={() => setPrivacyMode(!privacyMode)}
                    className="rounded p-1 text-[#71717a] transition-colors hover:bg-white/[0.06] hover:text-[#f4f4f5]"
                    title={privacyMode ? "Tampilkan Saldo" : "Sembunyikan Saldo (Mode Privasi)"}
                  >
                    {privacyMode ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                  </button>
                </div>

                <div className="flex items-center gap-1.5 rounded-full border border-white/[0.06] bg-[#141418] px-2.5 py-0.5 text-[10px] text-[#a0a0a0]">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#b2ff05] animate-pulse shadow-[0_0_8px_#b2ff05]" />
                  <span className="font-medium text-[#d4d4d8]">MT5 Live Sync</span>
                </div>
              </div>

              <div className="mt-2.5 flex items-baseline gap-3">
                <span className="font-mono text-4xl font-extrabold tracking-tight text-[#f4f4f5]">
                  {privacyMode
                    ? "$ ••••••"
                    : `$${currentBalance.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                </span>
                <span
                  className={cn(
                    "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1",
                    netPnl >= 0
                      ? "bg-[#b2ff05]/10 text-[#b2ff05] ring-[#b2ff05]/20"
                      : "bg-red-500/10 text-red-400 ring-red-500/20"
                  )}
                >
                  {netPnl >= 0 ? (
                    <ArrowUp className="h-3 w-3 stroke-[2.5]" />
                  ) : (
                    <ArrowDown className="h-3 w-3 stroke-[2.5]" />
                  )}
                  {Math.abs(pnlPercent).toFixed(1)}%
                </span>
              </div>

              <div className="mt-4 flex items-center gap-4 border-t border-white/[0.06] pt-3.5">
                <div>
                  <span className="text-[11px] font-medium text-[#71717a] block">Saldo Deposit</span>
                  <span className="font-mono text-base font-semibold text-[#f4f4f5]">
                    {privacyMode
                      ? "$ •••"
                      : `$${totalDeposit.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                  </span>
                </div>
                <div className="h-8 w-px bg-white/[0.08]" />
                <div>
                  <span className="text-[11px] font-medium text-[#71717a] block">Saldo Profit (PnL)</span>
                  <span
                    className={cn(
                      "font-mono text-base font-semibold",
                      netPnl >= 0 ? "text-[#b2ff05]" : "text-[#ff4d4d]"
                    )}
                  >
                    {privacyMode
                      ? "$ •••"
                      : `${netPnl >= 0 ? "+" : ""}$${netPnl.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-5 h-[240px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <defs>
                    <linearGradient id="balanceGlow" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#b2ff05" stopOpacity={0.28} />
                      <stop offset="100%" stopColor="#b2ff05" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <XAxis
                    dataKey="date"
                    stroke="#292929"
                    tick={{ fill: "#71717a", fontSize: 10 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    stroke="#292929"
                    tick={{ fill: "#71717a", fontSize: 10 }}
                    axisLine={false}
                    tickLine={false}
                    domain={["auto", "auto"]}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="rounded-xl border border-white/[0.12] bg-[#0c0c0e]/95 px-3 py-2 text-xs shadow-2xl backdrop-blur-xl">
                            <p className="text-[10px] font-medium text-[#a1a1aa]">{payload[0].payload.date}</p>
                            <p className="mt-0.5 font-mono text-sm font-bold text-[#b2ff05]">
                              {privacyMode ? "$ •••" : `$${Number(payload[0].value).toFixed(2)}`}
                            </p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="balance"
                    stroke="#b2ff05"
                    strokeWidth={2.25}
                    fill="url(#balanceGlow)"
                    isAnimationActive={false}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Performance Summary */}
          <div className="tradoxes-card flex flex-col justify-between rounded-2xl p-5 lg:col-span-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
              <p className="text-xs font-semibold text-[#8e8e93] uppercase tracking-wider">Performance summary</p>
              <span className="font-mono text-xs font-bold text-[#b2ff05] bg-[#b2ff05]/10 px-2 py-0.5 rounded-md border border-[#b2ff05]/20">
                {bestPair}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2.5 py-3">
              <div className="rounded-xl border border-white/[0.06] bg-black/30 p-2.5">
                <p className="text-[10px] text-[#71717a]">Total trades</p>
                <p className="mt-0.5 font-mono text-base font-bold text-[#f4f4f5]">{totalTrades}</p>
              </div>
              <div className="rounded-xl border border-white/[0.06] bg-black/30 p-2.5">
                <p className="text-[10px] text-[#71717a]">Trade win rate</p>
                <p className="mt-0.5 font-mono text-base font-bold text-[#b2ff05]">{winRate.toFixed(1)}%</p>
              </div>
              <div className="rounded-xl border border-white/[0.06] bg-black/30 p-2.5">
                <p className="text-[10px] text-[#71717a]">Win trades</p>
                <p className="mt-0.5 font-mono text-base font-bold text-[#b2ff05]">{wins.length}</p>
              </div>
              <div className="rounded-xl border border-white/[0.06] bg-black/30 p-2.5">
                <p className="text-[10px] text-[#71717a]">Loss trades</p>
                <p className="mt-0.5 font-mono text-base font-bold text-[#ff4d4d]">{losses.length}</p>
              </div>
              <div className="rounded-xl border border-white/[0.06] bg-black/30 p-2.5">
                <p className="text-[10px] text-[#71717a]">Breakeven</p>
                <p className="mt-0.5 font-mono text-base font-bold text-[#ffb020]">{breakevens.length}</p>
              </div>
              <div className="rounded-xl border border-white/[0.06] bg-black/30 p-2.5">
                <p className="text-[10px] text-[#71717a]">Profit factor</p>
                <p className="mt-0.5 font-mono text-base font-bold text-[#f4f4f5]">{profitFactor.toFixed(2)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Grid Baris 2: Recent Trades (Col 8) + Market Hours (Col 4) */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
          <div className="tradoxes-card rounded-2xl p-5 lg:col-span-8 flex flex-col justify-between">
            <div className="flex items-center justify-between pb-3.5 border-b border-white/[0.06]">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-[#b2ff05]" />
                <p className="text-xs font-semibold text-[#8e8e93] uppercase tracking-wider">Recent Trades</p>
              </div>
              <Link
                href="/trades"
                className="inline-flex items-center gap-1 text-xs text-[#a1a1aa] transition-colors hover:text-[#b2ff05]"
              >
                <span>View all trades</span>
                <ArrowRight className="h-3 w-3" />
              </Link>
            </div>

            {closedTrades.length === 0 ? (
              <div className="flex h-44 items-center justify-center text-xs text-[#71717a]">
                No trades in this period.
              </div>
            ) : (
              <div className="divide-y divide-white/[0.04]">
                {closedTrades.slice(0, 5).map((t) => (
                  <Link
                    key={t.id}
                    href={`/trades/${t.id}`}
                    className="group flex items-center justify-between py-3 transition-all duration-150 hover:bg-white/[0.03] rounded-lg px-2"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-white/[0.06] bg-black/40 font-mono text-[11px] font-bold text-[#f4f4f5]">
                        {t.instrument.slice(0, 3)}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono text-xs font-bold text-[#f4f4f5]">{t.instrument}</span>
                          <span
                            className={cn(
                              "rounded px-1.5 py-0.2 text-[9px] font-bold uppercase tracking-wide",
                              t.direction === "long" ? "bg-[#b2ff05]/15 text-[#b2ff05]" : "bg-red-500/15 text-red-400",
                            )}
                          >
                            {t.direction}
                          </span>
                        </div>
                        <p className="text-[10px] text-[#71717a] mt-0.5">
                          {new Date(t.traded_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <span
                        className={cn(
                          "font-mono text-xs font-bold block",
                          (t.pnl || 0) > 0 ? "text-[#b2ff05]" : (t.pnl || 0) < 0 ? "text-[#ff4d4d]" : "text-amber-400",
                        )}
                      >
                        {privacyMode ? "$ •••" : `${(t.pnl || 0) > 0 ? "+" : ""}$${(t.pnl || 0).toFixed(2)}`}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          <div className="lg:col-span-4">
            <MarketHoursCard />
          </div>
        </div>
      </div>
    </div>
  );
}

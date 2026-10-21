"use client";

import * as React from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  ArrowRight,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Camera,
  NotebookPen,
  Plus,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { useI18n } from "@/components/providers/i18n-provider";
import { useData } from "@/components/providers/data-provider";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard, StatsGrid } from "@/components/shared/stat-card";
import { EmptyState } from "@/components/shared/empty-state";
import { DirectionBadge, InstrumentBadge } from "@/components/shared/result-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarSnapshotDialog } from "@/components/snapshot/calendar-snapshot-dialog";
import { CalendarAccountSelect } from "@/components/calendar/calendar-account-select";
import { formatCompact, formatPercent, formatR, formatSignedCurrency, pnlColor } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Currency, Trade } from "@/lib/types";

interface DayAggregate {
  key: string;
  day: number;
  pnl: number;
  trades: Trade[];
  wins: number;
  losses: number;
}

const WEEKDAY_KEYS = [1, 2, 3, 4, 5, 6, 0]; // Senin → Minggu

function pad(n: number) {
  return String(n).padStart(2, "0");
}

function dateKey(year: number, month: number, day: number) {
  return `${year}-${pad(month + 1)}-${pad(day)}`;
}

export function CalendarView({
  hideAmounts,
  defaultCurrency = "USD",
  startBalance = 0,
}: {
  hideAmounts: boolean;
  defaultCurrency?: Currency;
  startBalance?: number;
}) {
  const { t, locale } = useI18n();
  const { trades, journals, accounts } = useData();
  const searchParams = useSearchParams();
  const accountId = searchParams.get("account");

  const activeAccount = React.useMemo(
    () => accounts.find((a) => a.id === accountId) ?? null,
    [accounts, accountId],
  );

  /**
   * Kalau semua akun memakai mata uang yang sama, total gabungan tetap valid
   * ditampilkan dengan mata uang itu. Kalau beda, pakai defaultCurrency.
   */
  const sharedCurrency: Currency = React.useMemo(() => {
    const unique = new Set(accounts.map((a) => a.currency));
    return unique.size === 1 ? (accounts[0]?.currency ?? defaultCurrency) : defaultCurrency;
  }, [accounts, defaultCurrency]);

  const currency: Currency = activeAccount?.currency ?? sharedCurrency;

  /** Modal awal mengikuti akun yang dipilih, bukan total semua akun. */
  const scopedStartBalance = activeAccount ? activeAccount.initial_balance : startBalance;

  const [cursor, setCursor] = React.useState(() => {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() };
  });
  const [selected, setSelected] = React.useState<string | null>(null);

  const weekdays = React.useMemo(() => t("calendar.weekdays").split(","), [t]);
  const months = React.useMemo(() => t("calendar.months").split(","), [t]);

  const scopedTrades = React.useMemo(
    () => (accountId ? trades.filter((x) => x.account_id === accountId) : trades),
    [trades, accountId],
  );

  // Arahkan ke bulan terakhir yang punya trade agar kalender tidak kosong.
  // Dijalankan ulang saat akun diganti supaya tidak mendarat di bulan kosong.
  React.useEffect(() => {
    const latest = scopedTrades
      .filter((x) => x.status === "closed")
      .reduce<string | null>((acc, x) => (!acc || x.traded_at > acc ? x.traded_at : acc), null);
    if (latest) {
      const [y, m] = latest.slice(0, 10).split("-").map(Number);
      setCursor({ year: y, month: m - 1 });
      return;
    }
    // Akun ini belum punya trade sama sekali → kembali ke bulan berjalan.
    const now = new Date();
    setCursor({ year: now.getFullYear(), month: now.getMonth() });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accountId]);

  /** Agregasi per hari untuk seluruh data (dipakai saat pindah bulan). */
  const byDay = React.useMemo(() => {
    const map = new Map<string, DayAggregate>();
    for (const trade of scopedTrades) {
      if (trade.status !== "closed") continue;
      const key = trade.traded_at.slice(0, 10);
      const entry = map.get(key) ?? {
        key,
        day: Number(key.slice(8, 10)),
        pnl: 0,
        trades: [],
        wins: 0,
        losses: 0,
      };
      entry.pnl += trade.pnl;
      entry.trades.push(trade);
      if (trade.pnl > 0) entry.wins += 1;
      else if (trade.pnl < 0) entry.losses += 1;
      map.set(key, entry);
    }
    return map;
  }, [scopedTrades]);

  const monthTrades = React.useMemo(() => {
    const prefix = `${cursor.year}-${pad(cursor.month + 1)}`;
    return scopedTrades.filter((x) => x.status === "closed" && x.traded_at.startsWith(prefix));
  }, [scopedTrades, cursor]);

  const monthStats = React.useMemo(() => {
    const netPnl = monthTrades.reduce((a, x) => a + x.pnl, 0);
    const wins = monthTrades.filter((x) => x.pnl > 0).length;
    const losses = monthTrades.filter((x) => x.pnl < 0).length;

    const prefix = `${cursor.year}-${pad(cursor.month + 1)}`;
    const monthDays = Array.from(byDay.values()).filter((d) => d.key.startsWith(prefix));
    const greenDays = monthDays.filter((d) => d.pnl > 0).length;
    const redDays = monthDays.filter((d) => d.pnl < 0).length;

    const bestDay = monthDays.reduce<DayAggregate | null>(
      (best, d) => (d.pnl > 0 && (!best || d.pnl > best.pnl) ? d : best),
      null,
    );
    const worstDay = monthDays.reduce<DayAggregate | null>(
      (worst, d) => (d.pnl < 0 && (!worst || d.pnl < worst.pnl) ? d : worst),
      null,
    );
    const flatDays = monthDays.filter((d) => d.pnl === 0).length;

    return {
      netPnl,
      count: monthTrades.length,
      wins,
      losses,
      winRate: monthTrades.length > 0 ? (wins / monthTrades.length) * 100 : 0,
      greenDays,
      redDays,
      flatDays,
      bestDay,
      worstDay,
      monthDays,
    };
  }, [monthTrades, byDay, cursor]);

  const cells = React.useMemo(() => {
    const firstOfMonth = new Date(cursor.year, cursor.month, 1);
    // getDay(): 0 = Minggu. Konversi agar Senin = 0.
    const leading = (firstOfMonth.getDay() + 6) % 7;
    const daysInMonth = new Date(cursor.year, cursor.month + 1, 0).getDate();

    const list: { key: string | null; day: number | null; offset: number }[] = [];
    for (let i = 0; i < leading; i++) list.push({ key: null, day: null, offset: i });
    for (let d = 1; d <= daysInMonth; d++) {
      list.push({ key: dateKey(cursor.year, cursor.month, d), day: d, offset: (leading + d - 1) % 7 });
    }
    return list;
  }, [cursor]);

  const maxAbsDay = React.useMemo(
    () => Math.max(1, ...monthStats.monthDays.map((d) => Math.abs(d.pnl))),
    [monthStats.monthDays],
  );

  const selectedDay = selected ? byDay.get(selected) ?? null : null;
  const selectedJournals = React.useMemo(
    () => (selected ? journals.filter((j) => j.journal_date.slice(0, 10) === selected) : []),
    [journals, selected],
  );

  const todayKey = React.useMemo(() => {
    const now = new Date();
    return dateKey(now.getFullYear(), now.getMonth(), now.getDate());
  }, []);

  // Pilih hari terakhir yang punya trade saat bulan / akun berubah
  React.useEffect(() => {
    const withTrades = monthStats.monthDays.filter((d) => d.trades.length > 0);
    setSelected(withTrades.length > 0 ? withTrades[withTrades.length - 1].key : null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cursor.year, cursor.month, accountId]);

  function shiftMonth(delta: number) {
    setCursor((prev) => {
      const next = new Date(prev.year, prev.month + delta, 1);
      return { year: next.getFullYear(), month: next.getMonth() };
    });
  }

  function goToday() {
    const now = new Date();
    setCursor({ year: now.getFullYear(), month: now.getMonth() });
    setSelected(todayKey);
  }

  const monthLabel = `${months[cursor.month]} ${cursor.year}`;

  return (
    <div>
      {/* ============================================================ */}
      {/* MOBILE CALENDAR VIEW (MONTHLY P&L HEATMAP)                   */}
      {/* ============================================================ */}
      <div className="lg:hidden space-y-3.5 mb-6">
        {/* Monthly P&L Heatmap Card */}
        <div className="mobile-card p-4 space-y-3">
          {/* Month Selector Bar */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => shiftMonth(-1)}
                className="flex h-7 w-7 items-center justify-center rounded-lg border border-white/10 bg-white/[0.04] text-[#a1a1aa] hover:text-white"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="font-mono text-xs font-bold text-white tracking-wide">{monthLabel}</span>
              <button
                type="button"
                onClick={() => shiftMonth(1)}
                className="flex h-7 w-7 items-center justify-center rounded-lg border border-white/10 bg-white/[0.04] text-[#a1a1aa] hover:text-white"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
            <button
              type="button"
              onClick={goToday}
              className="rounded-lg border border-white/10 bg-[#141418] px-2.5 py-1 text-[10px] font-semibold text-white hover:border-[#b2ff05]/40"
            >
              Today
            </button>
          </div>

          {/* Weekday headers Mon - Sun */}
          <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-semibold text-[#71717a]">
            {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
              <span key={day}>{day}</span>
            ))}
          </div>

          {/* Heatmap Grid dinamis */}
          <div className="grid grid-cols-7 gap-1">
            {cells.map((cell, idx) => {
              if (!cell.day || !cell.key) {
                return <div key={`empty-${idx}`} className="aspect-square rounded-lg bg-white/[0.02]" />;
              }
              const aggregate = byDay.get(cell.key);
              const pnl = aggregate?.pnl ?? 0;
              const count = aggregate?.trades.length ?? 0;
              const isSelected = selected === cell.key;
              const isToday = cell.key === todayKey;

              let bgClass = "bg-white/[0.03] text-[#71717a]";
              let borderClass = "border-transparent";
              let pnlNode = null;

              if (count > 0) {
                if (pnl > 0) {
                  bgClass = "bg-emerald-950/40 text-[#a1a1aa]";
                  borderClass = "border border-emerald-500/30";
                  pnlNode = (
                    <span className="font-mono text-[8px] font-bold text-emerald-400">
                      +{hideAmounts ? "••" : `$${Math.round(pnl)}`}
                    </span>
                  );
                } else if (pnl < 0) {
                  bgClass = "bg-red-950/40 text-[#a1a1aa]";
                  borderClass = "border border-red-500/30";
                  pnlNode = (
                    <span className="font-mono text-[8px] font-bold text-red-400">
                      -{hideAmounts ? "••" : `$${Math.abs(Math.round(pnl))}`}
                    </span>
                  );
                } else {
                  pnlNode = <span className="font-mono text-[8px] text-[#71717a]">$0</span>;
                }
              }

              return (
                <button
                  key={cell.key}
                  type="button"
                  onClick={() => setSelected(cell.key)}
                  className={cn(
                    "aspect-square rounded-lg p-1 flex flex-col justify-between text-left transition-all",
                    bgClass,
                    borderClass,
                    isSelected && "ring-2 ring-[#b2ff05] shadow-[0_0_8px_rgba(178,255,5,0.4)] z-10",
                    isToday && !isSelected && "border border-[#b2ff05]/40",
                  )}
                >
                  <span className={cn("text-[9px] font-bold", isSelected ? "text-[#b2ff05]" : "text-[#d4d4d8]")}>
                    {cell.day}
                  </span>
                  {pnlNode}
                </button>
              );
            })}
          </div>

          {/* Footer Summary Pills */}
          <div className="flex items-center gap-2 pt-1.5">
            <div className="flex-1 rounded-xl border border-[#b2ff05]/40 bg-[#141418] p-2 text-center">
              <span className="text-[10px] text-[#8e8e93] block">Best Day</span>
              <span className="text-xs font-bold text-[#b2ff05] font-mono">
                {monthStats.bestDay
                  ? `+$${Math.round(monthStats.bestDay.pnl)}`
                  : "$0"}
              </span>
            </div>
            <div className="flex-1 rounded-xl border border-emerald-500/30 bg-emerald-950/20 p-2 text-center">
              <span className="text-[10px] text-[#8e8e93] block">Net P&L</span>
              <span
                className={cn(
                  "text-xs font-bold font-mono",
                  monthStats.netPnl >= 0 ? "text-emerald-400" : "text-red-400",
                )}
              >
                {monthStats.netPnl >= 0 ? "+" : ""}${Math.round(monthStats.netPnl).toLocaleString()}
              </span>
            </div>
            <div className="flex-1 rounded-xl border border-white/10 bg-[#141418] p-2 text-center">
              <span className="text-[10px] text-[#8e8e93] block">Win Rate</span>
              <span className="text-xs font-bold text-white font-mono">
                {monthStats.winRate.toFixed(0)}%
              </span>
            </div>
          </div>
        </div>

        {/* Selected Day Trades on Mobile */}
        {selected && (
          <div className="space-y-2">
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-bold text-white tracking-tight">
                Trades on {selected}
              </span>
              <span className="text-[11px] font-mono text-[#8e8e93]">
                {selectedDay?.trades.length ?? 0} trade(s)
              </span>
            </div>

            {(!selectedDay || selectedDay.trades.length === 0) ? (
              <div className="mobile-card p-4 text-center text-xs text-[#71717a]">
                Tidak ada trade yang dieksekusi pada tanggal ini.
              </div>
            ) : (
              selectedDay.trades.map((trade) => {
                const isProfit = (trade.pnl || 0) >= 0;
                return (
                  <Link
                    key={trade.id}
                    href={`/trades/${trade.id}`}
                    className="mobile-card block p-3 hover:border-white/20 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-white">{trade.instrument}</span>
                        <span
                          className={cn(
                            "rounded px-1.5 py-0.5 text-[9px] font-black uppercase",
                            trade.direction === "long" ? "bg-emerald-500/20 text-emerald-400" : "bg-red-500/20 text-red-400",
                          )}
                        >
                          {trade.direction}
                        </span>
                      </div>
                      <span className={cn("font-mono text-xs font-bold", isProfit ? "text-[#b2ff05]" : "text-red-400")}>
                        {isProfit ? "+" : ""}${Math.abs(trade.pnl || 0).toFixed(2)}
                      </span>
                    </div>
                  </Link>
                );
              })
            )}
          </div>
        )}
      </div>

      {/* Desktop Calendar View (Tradoxes Theme) */}
      <div className="hidden lg:block space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-[#f2f2f0] sm:text-3xl">
              {t("calendar.title")}
            </h1>
            <p className="mt-0.5 text-xs text-[#8e8e93]">{t("calendar.subtitle")}</p>
          </div>

          <div className="flex items-center gap-2">
            <CalendarAccountSelect
              monthPrefix={`${cursor.year}-${pad(cursor.month + 1)}`}
              className="h-9 rounded-xl border-white/10 bg-[#141418] text-white"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={goToday}
              className="rounded-xl border-white/10 bg-[#141418] text-white hover:border-white/20 h-9 hidden sm:inline-flex"
            >
              {t("calendar.todayBtn")}
            </Button>
            <CalendarSnapshotDialog
              monthLabel={monthLabel}
              days={Array.from(
                { length: new Date(cursor.year, cursor.month + 1, 0).getDate() },
                (_, i) => {
                  const day = i + 1;
                  const key = dateKey(cursor.year, cursor.month, day);
                  const aggregate = byDay.get(key);
                  return {
                    day,
                    offset: (new Date(cursor.year, cursor.month, day).getDay() + 6) % 7,
                    pnl: aggregate?.pnl ?? 0,
                    trades: aggregate?.trades.length ?? 0,
                  };
                },
              )}
              netPnl={monthStats.netPnl}
              tradeCount={monthStats.count}
              winRate={monthStats.winRate}
              greenDays={monthStats.greenDays}
              redDays={monthStats.redDays}
              currency={currency}
              hideAmounts={hideAmounts}
              startBalance={scopedStartBalance}
              accountLabel={
                activeAccount
                  ? activeAccount.mt5_account_number
                    ? t("calendar.snapshotAccountLabel", {
                        account: `#${activeAccount.mt5_account_number}`,
                        broker: activeAccount.broker ?? "",
                      })
                    : activeAccount.name
                  : t("calendar.allAccounts")
              }
            >
              <Button size="sm" variant="outline" className="gap-1.5 border-white/10 bg-[#141418] text-white hover:border-white/20 rounded-xl h-9">
                <Camera className="h-4 w-4 text-[#b2ff05]" />
                <span className="hidden sm:inline">{t("calendar.snapshot")}</span>
                <span className="sm:hidden">PNG</span>
              </Button>
            </CalendarSnapshotDialog>
          </div>
        </div>

        {/* 4 KPI Cards Desktop */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div className="tradoxes-card tradoxes-card-hover rounded-2xl p-5 relative overflow-hidden flex flex-col justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#8e8e93]">
              {t("calendar.netPnl")}
            </span>
            <div className="mt-3">
              <p className={cn("font-mono text-3xl font-extrabold tracking-tight", pnlColor(monthStats.netPnl))}>
                {hideAmounts
                  ? formatPercent(
                      scopedStartBalance > 0 ? (monthStats.netPnl / scopedStartBalance) * 100 : 0,
                      1,
                      true,
                    )
                  : formatSignedCurrency(monthStats.netPnl, currency)}
              </p>
              <p className="mt-1 text-xs text-[#71717a] font-medium">{monthLabel}</p>
            </div>
          </div>

          <div className="tradoxes-card tradoxes-card-hover rounded-2xl p-5 relative overflow-hidden flex flex-col justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#8e8e93]">
              {t("calendar.tradeCount")}
            </span>
            <div className="mt-3">
              <p className="font-mono text-3xl font-extrabold tracking-tight text-white">
                {monthStats.count}
              </p>
              <p className="mt-1 text-xs text-[#71717a] font-medium">
                {monthStats.wins}W · {monthStats.losses}L
              </p>
            </div>
          </div>

          <div className="tradoxes-card tradoxes-card-hover rounded-2xl p-5 relative overflow-hidden flex flex-col justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#8e8e93]">
              {t("calendar.winRate")}
            </span>
            <div className="mt-3">
              <p className="font-mono text-3xl font-extrabold tracking-tight text-[#b2ff05]">
                {formatPercent(monthStats.winRate, 0)}
              </p>
              <p className="mt-1 text-xs text-[#71717a] font-medium">
                {monthStats.wins}/{monthStats.count} trades
              </p>
            </div>
          </div>

          <div className="tradoxes-card tradoxes-card-hover rounded-2xl p-5 relative overflow-hidden flex flex-col justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#8e8e93]">
              {t("calendar.greenDays")} / {t("calendar.redDays")}
            </span>
            <div className="mt-3">
              <p className="font-mono text-3xl font-extrabold tracking-tight">
                <span className="text-[#b2ff05]">{monthStats.greenDays}</span>
                <span className="text-white/30 font-light mx-1">/</span>
                <span className="text-red-400">{monthStats.redDays}</span>
              </p>
              <p className="mt-1 text-xs text-[#71717a] font-medium">
                {monthStats.bestDay
                  ? `${t("calendar.bestDay")}: ${hideAmounts ? formatR(monthStats.bestDay.pnl / Math.max(1, scopedStartBalance * 0.01)) : formatSignedCurrency(monthStats.bestDay.pnl, currency, { compact: true })}`
                  : `${monthStats.flatDays} flat days`}
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-5 xl:grid-cols-[1.6fr_1fr]">
          {/* Grid kalender */}
          <div className="tradoxes-card rounded-2xl overflow-hidden">
            <div className="flex items-center justify-between border-b border-white/[0.06] p-4">
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon-sm" onClick={() => shiftMonth(-1)} aria-label="prev" className="text-[#71717a] hover:text-white">
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="min-w-[130px] text-center text-sm font-bold text-white tabular">{monthLabel}</span>
                <Button variant="ghost" size="icon-sm" onClick={() => shiftMonth(1)} aria-label="next" className="text-[#71717a] hover:text-white">
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
              <div className="hidden items-center gap-3 text-[10px] text-[#8e8e93] sm:flex">
                <LegendDot color="bg-[#b2ff05]" label={t("calendar.legendProfit")} />
                <LegendDot color="bg-red-500" label={t("calendar.legendLoss")} />
                <LegendDot color="bg-white/20" label={t("calendar.legendFlat")} />
              </div>
            </div>
            <div className="p-3 sm:p-4">
            <div className="grid grid-cols-7 gap-1 pb-1">
              {WEEKDAY_KEYS.map((wd, i) => (
                <div
                  key={wd}
                  className="py-1 text-center text-[10px] font-medium uppercase tracking-wide text-muted-foreground"
                >
                  {weekdays[i]?.slice(0, 3)}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
              {cells.map((cell, index) => {
                if (!cell.key || !cell.day) {
                  return <div key={`empty-${index}`} className="aspect-square rounded-lg" />;
                }

                const aggregate = byDay.get(cell.key);
                const isSelected = selected === cell.key;
                const isToday = cell.key === todayKey;
                const pnl = aggregate?.pnl ?? 0;
                const count = aggregate?.trades.length ?? 0;
                const intensity = count > 0 ? Math.min(1, Math.abs(pnl) / maxAbsDay) : 0;

                return (
                  <button
                    key={cell.key}
                    type="button"
                    onClick={() => setSelected(cell.key)}
                    className={cn(
                      "group relative flex aspect-square flex-col justify-between rounded-xl border p-1 text-left transition-all sm:p-2",
                      isSelected
                        ? "border-primary ring-2 ring-primary/30"
                        : "border-border/60 hover:border-border",
                      count === 0 && "bg-muted/10",
                    )}
                    style={
                      count > 0
                        ? {
                            backgroundColor:
                              pnl > 0
                                ? `rgba(34, 197, 94, ${0.10 + intensity * 0.32})`
                                : pnl < 0
                                  ? `rgba(239, 68, 68, ${0.10 + intensity * 0.32})`
                                  : "rgba(245, 158, 11, 0.12)",
                          }
                        : undefined
                    }
                  >
                    <span
                      className={cn(
                        "text-[10px] font-medium leading-none font-mono",
                        isToday
                          ? "grid h-4 w-4 place-items-center rounded-full bg-primary text-[9px] font-bold text-primary-foreground"
                          : count > 0
                            ? "text-foreground/90 font-semibold"
                            : "text-muted-foreground/60",
                      )}
                    >
                      {cell.day}
                    </span>

                    {count > 0 ? (
                      <div className="my-auto w-full text-center">
                        <span
                          className={cn(
                            "tabular block truncate font-mono text-[10px] font-bold leading-tight sm:hidden",
                            pnlColor(pnl),
                          )}
                        >
                          {hideAmounts
                            ? `${pnl > 0 ? "+" : pnl < 0 ? "−" : ""}${Math.abs(Math.round((pnl / Math.max(1, scopedStartBalance * 0.01)) * 100) / 100)}R`
                            : `${pnl > 0 ? "+" : pnl < 0 ? "−" : ""}${formatCompact(Math.abs(pnl))}`}
                        </span>
                        <span
                          className={cn(
                            "tabular hidden truncate font-mono text-xs font-bold leading-tight sm:block",
                            pnlColor(pnl),
                          )}
                        >
                          {hideAmounts
                            ? `${pnl > 0 ? "+" : pnl < 0 ? "−" : ""}${Math.abs(Math.round((pnl / Math.max(1, scopedStartBalance * 0.01)) * 100) / 100)}R`
                            : formatSignedCurrency(pnl, currency, { compact: true })}
                        </span>
                        <span className="hidden text-[8px] font-mono text-muted-foreground/80 sm:block">
                          {count} {t("common.trades")}
                        </span>
                      </div>
                    ) : (
                      <div className="my-auto w-full text-center text-[10px] text-muted-foreground/30">—</div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Panel detail hari */}
        <div className="tradoxes-card rounded-2xl overflow-hidden xl:sticky xl:top-20 xl:self-start">
          <div className="border-b border-white/[0.06] p-4 flex items-center justify-between">
            <span className="flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-[#b2ff05]" />
              <h3 className="text-sm font-semibold uppercase tracking-wider text-[#8e8e93]">{t("calendar.dayDetail")}</h3>
            </span>
            {selected && (
              <span className="text-xs font-semibold text-white">
                {new Date(`${selected}T12:00:00`).toLocaleDateString(
                  locale === "id" ? "id-ID" : "en-US",
                  { weekday: "short", day: "numeric", month: "short" },
                )}
              </span>
            )}
          </div>
          <div className="p-4">
            {!selectedDay || selectedDay.trades.length === 0 ? (
              <EmptyState
                icon={CalendarDays}
                compact
                title={
                  activeAccount && monthStats.count === 0
                    ? t("calendar.noTradesAccount", {
                        account: activeAccount.mt5_account_number
                          ? `#${activeAccount.mt5_account_number}`
                          : activeAccount.name,
                      })
                    : t("calendar.noTradesDay")
                }
                description={
                  activeAccount && monthStats.count === 0
                    ? t("calendar.noTradesAccountDesc")
                    : t("calendar.noTradesDayDesc")
                }
                action={
                  <Button asChild size="sm" variant="outline">
                    <Link href="/trades/new">
                      <Plus className="h-4 w-4" />
                      {t("trades.new")}
                    </Link>
                  </Button>
                }
              />
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-lg border border-border/60 bg-muted/20 p-2.5">
                    <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
                      {t("calendar.dayPnl")}
                    </p>
                    <p className={cn("tabular mt-0.5 text-base font-semibold", pnlColor(selectedDay.pnl))}>
                      {hideAmounts
                        ? `${selectedDay.trades.reduce((a, x) => a + (x.r_multiple ?? 0), 0).toFixed(2)}R`
                        : formatSignedCurrency(selectedDay.pnl, currency)}
                    </p>
                  </div>
                  <div className="rounded-lg border border-border/60 bg-muted/20 p-2.5">
                    <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
                      {t("calendar.dayWinRate")}
                    </p>
                    <p className="tabular mt-0.5 text-base font-semibold">
                      {formatPercent(
                        (selectedDay.wins / Math.max(1, selectedDay.trades.length)) * 100,
                        0,
                      )}
                    </p>
                  </div>
                </div>

                <div className="space-y-1.5">
                  {selectedDay.trades
                    .slice()
                    .sort((a, b) => new Date(b.traded_at).getTime() - new Date(a.traded_at).getTime())
                    .map((trade) => (
                      <Link
                        key={trade.id}
                        href={`/trades/${trade.id}`}
                        className="flex items-center justify-between gap-2 rounded-lg border border-border/60 bg-card/60 px-2.5 py-2 transition-colors hover:border-border hover:bg-muted/30"
                      >
                        <div className="flex min-w-0 items-center gap-2">
                          <InstrumentBadge instrument={trade.instrument} />
                          <DirectionBadge direction={trade.direction} />
                          {!activeAccount && (
                            <span
                              className="h-1.5 w-1.5 shrink-0 rounded-full"
                              title={accounts.find((a) => a.id === trade.account_id)?.name ?? ""}
                              style={{
                                backgroundColor:
                                  accounts.find((a) => a.id === trade.account_id)?.color ?? "#666",
                              }}
                            />
                          )}
                          <span className="truncate text-[10px] text-muted-foreground">
                            {new Date(trade.traded_at).toLocaleTimeString(
                              locale === "id" ? "id-ID" : "en-US",
                              { hour: "2-digit", minute: "2-digit" },
                            )}
                          </span>
                        </div>
                        <span className={cn("tabular shrink-0 text-[11px] font-semibold", pnlColor(trade.pnl))}>
                          {hideAmounts
                            ? formatR(trade.r_multiple)
                            : formatSignedCurrency(trade.pnl, currency, { compact: true })}
                        </span>
                      </Link>
                    ))}
                </div>

                <div className="border-t border-border/60 pt-3">
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
                      {t("calendar.dayJournal")}
                    </p>
                    <Button asChild variant="ghost" size="sm" className="h-6 gap-1 px-1.5 text-[11px]">
                      <Link href="/journal">
                        {t("common.viewAll")}
                        <ArrowRight className="h-3 w-3" />
                      </Link>
                    </Button>
                  </div>

                  {selectedJournals.length === 0 ? (
                    <div className="mt-2 rounded-lg border border-dashed border-border/70 px-3 py-4 text-center">
                      <p className="text-[11px] text-muted-foreground">{t("calendar.noJournalDay")}</p>
                      <Button asChild size="sm" variant="outline" className="mt-2 gap-1.5">
                        <Link href="/journal/new">
                          <NotebookPen className="h-3.5 w-3.5" />
                          {t("calendar.writeJournal")}
                        </Link>
                      </Button>
                    </div>
                  ) : (
                    <div className="mt-2 space-y-1.5">
                      {selectedJournals.map((journal) => (
                        <Link
                          key={journal.id}
                          href="/journal"
                          className="block rounded-lg border border-border/60 bg-muted/20 px-2.5 py-2 transition-colors hover:border-border"
                        >
                          <p className="truncate text-[11px] font-medium">
                            {journal.title ?? t("journal.title")}
                          </p>
                          {journal.lesson_learned && (
                            <p className="mt-0.5 line-clamp-2 text-[10px] text-muted-foreground">
                              {journal.lesson_learned}
                            </p>
                          )}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Ringkasan hari terbaik/terburuk */}
      {(monthStats.bestDay || monthStats.worstDay) && (
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <BestWorstCard
            tone="profit"
            icon={TrendingUp}
            label={t("calendar.bestDay")}
            aggregate={monthStats.bestDay}
            currency={currency}
            hideAmounts={hideAmounts}
            locale={locale}
            onClick={() => monthStats.bestDay && setSelected(monthStats.bestDay.key)}
          />
          <BestWorstCard
            tone="loss"
            icon={TrendingDown}
            label={t("calendar.worstDay")}
            aggregate={monthStats.worstDay}
            currency={currency}
            hideAmounts={hideAmounts}
            locale={locale}
            onClick={() => monthStats.worstDay && setSelected(monthStats.worstDay.key)}
          />
        </div>
      )}
      </div>
    </div>
  );
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <span className="flex items-center gap-1.5">
      <span className={cn("h-2 w-2 rounded-sm", color)} />
      {label}
    </span>
  );
}

function BestWorstCard({
  tone,
  icon: Icon,
  label,
  aggregate,
  currency,
  hideAmounts,
  locale,
  onClick,
}: {
  tone: "profit" | "loss";
  icon: React.ElementType;
  label: string;
  aggregate: DayAggregate | null;
  currency: Currency;
  hideAmounts: boolean;
  locale: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex items-center justify-between gap-3 rounded-xl border px-4 py-3 text-left transition-colors",
        tone === "profit"
          ? "border-profit/25 bg-profit/[0.05] hover:bg-profit/[0.09]"
          : "border-loss/25 bg-loss/[0.05] hover:bg-loss/[0.09]",
      )}
    >
      <div className="flex items-center gap-3">
        <span
          className={cn(
            "grid h-8 w-8 place-items-center rounded-lg",
            tone === "profit" ? "bg-profit/15 text-profit" : "bg-loss/15 text-loss",
          )}
        >
          <Icon className="h-4 w-4" />
        </span>
        <div>
          <p className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</p>
          <p className="text-xs font-medium">
            {aggregate
              ? new Date(`${aggregate.key}T12:00:00`).toLocaleDateString(
                  locale === "id" ? "id-ID" : "en-US",
                  { weekday: "long", day: "numeric", month: "short" },
                )
              : "—"}
          </p>
        </div>
      </div>
      <div className="text-right">
        <p className={cn("tabular text-sm font-semibold", tone === "profit" ? "text-profit" : "text-loss")}>
          {aggregate
            ? hideAmounts
              ? `${aggregate.trades.reduce((a, x) => a + (x.r_multiple ?? 0), 0).toFixed(2)}R`
              : formatSignedCurrency(aggregate.pnl, currency, { compact: true })
            : "—"}
        </p>
        <p className="text-[10px] text-muted-foreground">
          {aggregate ? `${aggregate.trades.length} trade` : ""}
        </p>
      </div>
    </button>
  );
}

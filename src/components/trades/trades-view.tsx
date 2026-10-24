"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowDownUp,
  ChevronDown,
  Download,
  Filter,
  LineChart,
  Plus,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react";
import { useI18n } from "@/components/providers/i18n-provider";
import { useData } from "@/components/providers/data-provider";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { ResultBadge, DirectionBadge, InstrumentBadge } from "@/components/shared/result-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { formatR, formatSignedCurrency, pnlColor } from "@/lib/format";
import { sessionRangeLabel } from "@/lib/sessions";
import type { TradeResult } from "@/lib/types";

type SortKey = "newest" | "oldest" | "pnlHigh" | "pnlLow" | "rrHigh";

export function TradesView({ hideAmounts }: { hideAmounts: boolean }) {
  const { t, locale } = useI18n();
  const { trades, accounts, strategies, journals, emotions } = useData();
  const searchParams = useSearchParams();
  const router = useRouter();

  const globalAccount = searchParams.get("account");

  const [search, setSearch] = React.useState("");
  const [result, setResult] = React.useState<TradeResult | "all">("all");
  const [strategyId, setStrategyId] = React.useState<string>("all");
  const [instrument, setInstrument] = React.useState<string>("all");
  const [from, setFrom] = React.useState("");
  const [to, setTo] = React.useState("");
  const [sort, setSort] = React.useState<SortKey>("newest");
  const [filtersOpen, setFiltersOpen] = React.useState(false);
  const [page, setPage] = React.useState(0);
  const PAGE_SIZE = 25;

  const accountId = globalAccount;

  const instruments = React.useMemo(
    () => Array.from(new Set(trades.map((t) => t.instrument))).sort(),
    [trades],
  );

  const activeFilterCount = React.useMemo(() => {
    let n = 0;
    if (result !== "all") n++;
    if (strategyId !== "all") n++;
    if (instrument !== "all") n++;
    if (from) n++;
    if (to) n++;
    if (search) n++;
    return n;
  }, [result, strategyId, instrument, from, to, search]);

  const filtered = React.useMemo(() => {
    let list = trades;

    if (accountId) list = list.filter((t) => t.account_id === accountId);
    if (result !== "all") list = list.filter((t) => t.result === result);
    if (strategyId !== "all") {
      list = list.filter((t) =>
        strategyId === "none" ? !t.strategy_id : t.strategy_id === strategyId,
      );
    }
    if (instrument !== "all") list = list.filter((t) => t.instrument === instrument);
    if (from) list = list.filter((t) => t.traded_at.slice(0, 10) >= from);
    if (to) list = list.filter((t) => t.traded_at.slice(0, 10) <= to);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (t) =>
          t.instrument.toLowerCase().includes(q) ||
          t.notes?.toLowerCase().includes(q) ||
          t.exit_reason?.toLowerCase().includes(q) ||
          t.tags.some((tag) => tag.toLowerCase().includes(q)),
      );
    }

    const sorted = [...list];
    switch (sort) {
      case "newest":
        sorted.sort((a, b) => new Date(b.traded_at).getTime() - new Date(a.traded_at).getTime());
        break;
      case "oldest":
        sorted.sort((a, b) => new Date(a.traded_at).getTime() - new Date(b.traded_at).getTime());
        break;
      case "pnlHigh":
        sorted.sort((a, b) => b.pnl - a.pnl);
        break;
      case "pnlLow":
        sorted.sort((a, b) => a.pnl - b.pnl);
        break;
      case "rrHigh":
        sorted.sort((a, b) => (b.r_multiple ?? -99) - (a.r_multiple ?? -99));
        break;
    }
    return sorted;
  }, [trades, accountId, result, strategyId, instrument, from, to, search, sort]);

  const totals = React.useMemo(() => {
    const closed = filtered.filter((t) => t.status === "closed");
    const net = closed.reduce((a, t) => a + t.pnl, 0);
    const wins = closed.filter((t) => t.pnl > 0).length;
    return { net, wins, total: closed.length };
  }, [filtered]);

  const activeAccount = accounts.find((a) => a.id === accountId);
  const currency = activeAccount?.currency ?? accounts[0]?.currency ?? "USD";

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, pageCount - 1);
  const paged = React.useMemo(
    () => filtered.slice(safePage * PAGE_SIZE, safePage * PAGE_SIZE + PAGE_SIZE),
    [filtered, safePage],
  );

  React.useEffect(() => {
    setPage(0);
  }, [result, strategyId, instrument, from, to, search, sort, accountId]);

  function resetFilters() {
    setResult("all");
    setStrategyId("all");
    setInstrument("all");
    setFrom("");
    setTo("");
    setSearch("");
  }

  const sortLabels: Record<SortKey, string> = {
    newest: t("trades.sortNewest"),
    oldest: t("trades.sortOldest"),
    pnlHigh: t("trades.sortPnlHigh"),
    pnlLow: t("trades.sortPnlLow"),
    rrHigh: t("trades.sortRrHigh"),
  };

  const latestJournal = journals && journals.length > 0 ? journals[0] : null;
  const journalEmotions = latestJournal ? emotions.filter((e) => latestJournal.emotion_ids.includes(e.id)) : [];

  return (
    <div>
      {/* Mobile Top Sub-tabs TRADES vs JOURNALS */}
      <div className="flex items-center gap-6 border-b border-[#222228] pb-2 px-1 lg:hidden mb-3.5">
        <button
          type="button"
          className="relative pb-2 font-mono text-xs font-bold uppercase tracking-wider text-white"
        >
          <span>TRADES</span>
          <span className="absolute inset-x-0 bottom-0 h-[2px] bg-[#b2ff05] shadow-[0_0_8px_#b2ff05]" />
        </button>
        <Link
          href="/journal"
          className="pb-2 font-mono text-xs font-semibold uppercase tracking-wider text-[#71717a] hover:text-white transition"
        >
          <span>JOURNALS</span>
        </Link>
      </div>

      <div className="hidden lg:block">
        <PageHeader
          title={t("trades.title")}
          description={t("trades.subtitle")}
          actions={
            <>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="h-9 gap-1.5 border-[#222228] bg-[#0c0c0e] text-[#a1a1aa] hover:border-[#b2ff05]/40 hover:text-white rounded-xl">
                    <Download className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">{t("trades.exportCsv")}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-60 border-[#222228] bg-[#0e0e12] text-white">
                  <DropdownMenuLabel>{t("trades.exportCsv")}</DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-[#222228]" />
                  <DropdownMenuItem onClick={() => { window.location.href = "/api/export/trades"; }} className="cursor-pointer">
                    <Download className="h-4 w-4" />
                    {t("trades.exportCsv")}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Button asChild size="sm" className="h-9 gap-1.5 bg-[#b2ff05] text-black font-bold hover:bg-[#9fe000] rounded-xl shadow-[0_0_15px_rgba(178,255,5,0.25)]">
                <Link href="/trades/new">
                  <Plus className="h-4 w-4 stroke-[2.5]" />
                  {t("trades.new")}
                </Link>
              </Button>
            </>
          }
        />
      </div>

      {/* Toolbar */}
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <div className="relative min-w-0 flex-1 sm:max-w-xs">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#71717a]" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={`${t("common.search")}…`}
            className="h-9 rounded-xl border-[#222228] bg-[#0c0c0e] pl-8 text-xs text-white placeholder-[#71717a] focus:border-[#b2ff05]"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-[#71717a] hover:text-white"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        <Popover open={filtersOpen} onOpenChange={setFiltersOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="h-9 gap-1.5 rounded-xl border-[#222228] bg-[#0c0c0e] text-[#a1a1aa] hover:border-[#b2ff05]/40 hover:text-white">
              <SlidersHorizontal className="h-3.5 w-3.5" />
              {t("common.filter")}
              {activeFilterCount > 0 && (
                <Badge variant="profit" className="ml-0.5 h-4 min-w-4 justify-center px-1 text-[10px]">
                  {activeFilterCount}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent align="start" className="w-80 space-y-3 border-[#222228] bg-[#0c0c0e] text-white">
            <div className="flex items-center justify-between border-b border-[#222228] pb-2">
              <p className="text-sm font-semibold">{t("common.filter")}</p>
              <button
                onClick={resetFilters}
                className="text-[11px] text-[#71717a] hover:text-[#b2ff05]"
              >
                {t("common.reset")}
              </button>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs text-[#a1a1aa]">{t("trades.result")}</Label>
              <Select value={result} onValueChange={(v) => setResult(v as TradeResult | "all")}>
                <SelectTrigger className="h-9 rounded-xl border-[#222228] bg-[#121215] text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="border-[#222228] bg-[#0e0e12] text-white">
                  <SelectItem value="all">{t("trades.filterResult")}</SelectItem>
                  <SelectItem value="win">{t("trades.win")}</SelectItem>
                  <SelectItem value="loss">{t("trades.loss")}</SelectItem>
                  <SelectItem value="breakeven">{t("trades.breakeven")}</SelectItem>
                  <SelectItem value="open">{t("trades.open")}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs text-[#a1a1aa]">{t("trades.strategy")}</Label>
              <Select value={strategyId} onValueChange={setStrategyId}>
                <SelectTrigger className="h-9 rounded-xl border-[#222228] bg-[#121215] text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="border-[#222228] bg-[#0e0e12] text-white">
                  <SelectItem value="all">{t("trades.filterStrategy")}</SelectItem>
                  <SelectItem value="none">{t("common.none")}</SelectItem>
                  {strategies.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs text-[#a1a1aa]">{t("trades.instrument")}</Label>
              <Select value={instrument} onValueChange={setInstrument}>
                <SelectTrigger className="h-9 rounded-xl border-[#222228] bg-[#121215] text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="border-[#222228] bg-[#0e0e12] text-white">
                  <SelectItem value="all">{t("trades.filterPair")}</SelectItem>
                  {instruments.map((i) => (
                    <SelectItem key={i} value={i}>
                      {i}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1.5">
                <Label className="text-xs text-[#a1a1aa]">{t("trades.filterFrom")}</Label>
                <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="h-9 rounded-xl border-[#222228] bg-[#121215] text-xs" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-[#a1a1aa]">{t("trades.filterTo")}</Label>
                <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="h-9 rounded-xl border-[#222228] bg-[#121215] text-xs" />
              </div>
            </div>
          </PopoverContent>
        </Popover>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="h-9 gap-1.5 rounded-xl border-[#222228] bg-[#0c0c0e] text-[#a1a1aa] hover:border-[#b2ff05]/40 hover:text-white">
              <ArrowDownUp className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">{sortLabels[sort]}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48 border-[#222228] bg-[#0e0e12] text-white">
            <DropdownMenuLabel className="text-xs text-[#8e8e93]">{t("common.filter")}</DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-[#222228]" />
            {(Object.keys(sortLabels) as SortKey[]).map((key) => (
              <DropdownMenuItem
                key={key}
                onClick={() => setSort(key)}
                className={cn("cursor-pointer text-xs", sort === key && "bg-[#b2ff05]/15 text-[#b2ff05] font-semibold")}
              >
                {sortLabels[key]}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {activeFilterCount > 0 && (
          <Button variant="ghost" size="sm" onClick={resetFilters} className="h-9 gap-1 text-xs text-[#71717a] hover:text-[#b2ff05]">
            <X className="h-3 w-3" />
            {t("common.reset")}
          </Button>
        )}
      </div>

      {/* Ringkasan hasil filter */}
      <div className="mb-3 flex flex-wrap items-center gap-x-4 gap-y-1 rounded-xl border border-[#222228] bg-[#0c0c0e]/80 px-3.5 py-2 text-[11px] text-[#8e8e93]">
        <span>
          {t("trades.showing", { n: filtered.length, total: trades.length })}
        </span>
        <span>
          {t("analytics.netPnl")}:{" "}
          <span className={cn("tabular font-mono font-bold", pnlColor(totals.net))}>
            {formatSignedCurrency(totals.net, currency)}
          </span>
        </span>
        <span>
          {t("dashboard.winRate")}:{" "}
          <span className="tabular font-mono font-bold text-white">
            {totals.total > 0 ? ((totals.wins / totals.total) * 100).toFixed(1) : "0.0"}%
          </span>
        </span>
        {activeAccount && (
          <Badge variant="outline" className="gap-1 border-[#222228] bg-[#121215] text-[10px]">
            <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: activeAccount.color }} />
            {activeAccount.name}
          </Badge>
        )}
      </div>

      {filtered.length === 0 ? (
        trades.length === 0 ? (
          <EmptyState
            icon={LineChart}
            title={t("trades.empty")}
            description={t("trades.emptyDesc")}
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
          <EmptyState
            icon={Filter}
            title={t("trades.emptyFiltered")}
            description={t("trades.emptyFilteredDesc")}
            action={
              <Button variant="outline" onClick={resetFilters}>
                {t("common.reset")}
              </Button>
            }
          />
        )
      ) : (
        <div className="tradoxes-card overflow-hidden rounded-2xl border border-white/[0.08] shadow-xl">
          {/* Desktop table */}
          <div className="hidden max-h-[72vh] overflow-auto lg:block">
            <table className="w-full border-collapse text-left">
              <thead className="sticky top-0 z-10 border-b border-white/[0.08] bg-[#0c0c0e]/95 backdrop-blur-md">
                <tr className="text-left text-[11px] font-semibold uppercase tracking-wider text-[#8e8e93]">
                  <th className="w-[140px] px-4 py-3.5">{t("trades.date")}</th>
                  <th className="w-[180px] px-3 py-3.5">{t("trades.instrument")}</th>
                  <th className="w-[105px] px-3 py-3.5">{t("trades.session")}</th>
                  <th className="w-[130px] px-3 py-3.5">{t("trades.account")}</th>
                  <th className="w-[130px] px-3 py-3.5">{t("trades.strategy")}</th>
                  <th className="w-[100px] px-3 py-3.5 text-right">{t("trades.entry")}</th>
                  <th className="w-[100px] px-3 py-3.5 text-right">{t("trades.exit")}</th>
                  <th className="w-[85px] px-3 py-3.5 text-right">{t("trades.rr")}</th>
                  <th className="w-[125px] px-3 py-3.5 text-right">{t("trades.pnl")}</th>
                  <th className="w-[110px] px-3 py-3.5 text-center">{t("trades.result")}</th>
                  <th className="w-[40px] py-3.5 pr-4 text-right" />
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {paged.map((trade) => {
                  const account = accounts.find((a) => a.id === trade.account_id);
                  const strategy = strategies.find((s) => s.id === trade.strategy_id);
                  const cur = account?.currency ?? currency;
                  const sessionLabel = {
                    asia: "Asia",
                    london: "London",
                    new_york: "New York",
                    sydney: "Sydney",
                    other: "Other",
                  }[trade.session] ?? trade.session;

                  const isProfit = trade.pnl > 0;
                  const isLoss = trade.pnl < 0;

                  return (
                    <tr
                      key={trade.id}
                      className="group h-[54px] cursor-pointer transition-all duration-150 hover:bg-white/[0.04] active:bg-white/[0.06]"
                      onClick={() => router.push(`/trades/${trade.id}`)}
                    >
                      <td className="w-[140px] whitespace-nowrap px-4 py-2.5">
                        <div className="text-xs font-semibold text-[#f4f4f5]">
                          {new Date(trade.traded_at).toLocaleDateString(locale === "id" ? "id-ID" : "en-US", {
                            day: "2-digit",
                            month: "short",
                            year: "2-digit",
                          })}
                        </div>
                        <div className="font-mono text-[10px] text-[#71717a]">
                          {new Date(trade.traded_at).toLocaleTimeString(locale === "id" ? "id-ID" : "en-US", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </div>
                      </td>
                      <td className="w-[180px] whitespace-nowrap px-3 py-2.5">
                        <div className="flex items-center gap-1.5">
                          <InstrumentBadge instrument={trade.instrument} />
                          <DirectionBadge direction={trade.direction} />
                        </div>
                      </td>
                      <td className="w-[105px] whitespace-nowrap px-3 py-2.5">
                        <span
                          title={`${sessionLabel} · ${sessionRangeLabel(trade.session)}`}
                          className={cn(
                            "inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-[10px] font-semibold",
                            trade.session === "asia" && "border-cyan-500/30 bg-cyan-500/10 text-cyan-400",
                            trade.session === "london" && "border-purple-500/30 bg-purple-500/10 text-purple-400",
                            trade.session === "new_york" && "border-pink-500/30 bg-pink-500/10 text-pink-400",
                            trade.session === "sydney" && "border-amber-500/30 bg-amber-500/10 text-amber-400",
                            (!trade.session || trade.session === "other") && "border-[#27272a] bg-[#121215] text-[#a1a1aa]",
                          )}
                        >
                          <span className="h-1.5 w-1.5 rounded-full shrink-0 bg-current opacity-80" />
                          <span>{sessionLabel}</span>
                        </span>
                      </td>
                      <td className="w-[130px] whitespace-nowrap px-3 py-2.5">
                        <span className="inline-flex items-center gap-1.5 text-xs text-[#d4d4d8]">
                          <span
                            className="h-2 w-2 rounded-full shrink-0"
                            style={{ backgroundColor: account?.color ?? "#64748b" }}
                          />
                          <span className="max-w-[105px] truncate font-medium">{account?.name ?? "—"}</span>
                        </span>
                      </td>
                      <td className="w-[130px] whitespace-nowrap px-3 py-2.5 text-xs text-[#a1a1aa]">
                        <span className="inline-block max-w-[115px] truncate font-medium text-zinc-300">
                          {strategy?.name ?? "—"}
                        </span>
                      </td>
                      <td className="w-[100px] whitespace-nowrap tabular px-3 py-2.5 text-right font-mono text-xs font-medium text-zinc-200">
                        {trade.entry_price != null ? Number(trade.entry_price).toLocaleString("en-US", { maximumFractionDigits: 5 }) : "—"}
                      </td>
                      <td className="w-[100px] whitespace-nowrap tabular px-3 py-2.5 text-right font-mono text-xs font-medium text-zinc-200">
                        {trade.exit_price != null ? Number(trade.exit_price).toLocaleString("en-US", { maximumFractionDigits: 5 }) : <span className="text-zinc-600">—</span>}
                      </td>
                      <td className="w-[85px] whitespace-nowrap tabular px-3 py-2.5 text-right font-mono text-xs font-semibold text-zinc-300">
                        {formatR(trade.r_multiple)}
                      </td>
                      <td className="w-[125px] whitespace-nowrap px-3 py-2.5 text-right">
                        {trade.status === "open" ? (
                          <span className="inline-block rounded-md border border-sky-500/30 bg-sky-500/10 px-2 py-0.5 font-mono text-[10px] font-bold text-sky-400">
                            OPEN
                          </span>
                        ) : (
                          <span
                            className={cn(
                              "tabular font-mono text-xs font-bold",
                              isProfit ? "text-emerald-400" : isLoss ? "text-red-400" : "text-amber-400",
                            )}
                          >
                            {hideAmounts
                              ? formatR(trade.r_multiple)
                              : `${isProfit ? "+" : ""}${formatSignedCurrency(trade.pnl, cur)}`}
                          </span>
                        )}
                      </td>
                      <td className="w-[110px] whitespace-nowrap px-3 py-2.5 text-center">
                        <ResultBadge result={trade.result} showIcon={false} />
                      </td>
                      <td className="w-[40px] py-2.5 pr-4 text-right">
                        <ChevronDown className="h-4 w-4 -rotate-90 text-[#71717a] transition group-hover:translate-x-0.5 group-hover:text-[#b2ff05]" />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile list: Presisi Gambar 3 dari WhatsApp */}
          <div className="space-y-3.5 lg:hidden p-2 sm:p-3">
            {paged.map((trade, idx) => {
              const account = accounts.find((a) => a.id === trade.account_id);
              const strategy = strategies.find((s) => s.id === trade.strategy_id);
              const cur = account?.currency ?? currency;
              const isProfit = trade.pnl > 0;
              const isLoss = trade.pnl < 0;

              return (
                <React.Fragment key={trade.id}>
                  {/* Sisipkan Journal Notes Card di urutan ke-2 jika user memiliki data jurnal */}
                  {idx === 1 && latestJournal && (
                    <Link
                      href={`/journal`}
                      className="mobile-card block p-4 space-y-2 border-[#222228] hover:border-[#b2ff05]/40 transition-colors"
                    >
                      <div className="flex items-center justify-between text-xs text-[#8e8e93]">
                        <div className="flex items-center gap-1.5 font-medium text-[#d4d4d8]">
                          <svg className="h-4 w-4 text-[#a1a1aa]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect width="18" height="18" x="3" y="3" rx="2" />
                            <path d="M7 7h10M7 12h10M7 17h6" />
                          </svg>
                          <span>Journal Notes</span>
                        </div>
                        <span className="text-[10px] text-[#71717a]">
                          {new Date(latestJournal.journal_date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                        </span>
                      </div>

                      <h4 className="text-sm font-bold text-white tracking-tight leading-snug">
                        {latestJournal.title || "Trading Reflection & Rules"}
                      </h4>
                      {(latestJournal.lesson_learned || latestJournal.content) && (
                        <p className="text-xs text-[#a1a1aa] leading-relaxed line-clamp-2">
                          {latestJournal.lesson_learned || latestJournal.content}
                        </p>
                      )}

                      {journalEmotions.length > 0 && (
                        <div className="flex items-center gap-2 pt-1 flex-wrap">
                          {journalEmotions.map((e) => (
                            <span
                              key={e.id}
                              className="rounded-full px-2.5 py-0.5 text-[10px] font-bold"
                              style={{
                                backgroundColor: `${e.color || "#b2ff05"}20`,
                                color: e.color || "#b2ff05",
                                border: `1px solid ${e.color || "#b2ff05"}40`,
                              }}
                            >
                              {e.name}
                            </span>
                          ))}
                        </div>
                      )}
                    </Link>
                  )}

                  <Link
                    href={`/trades/${trade.id}`}
                    className="mobile-card block p-4 transition-all duration-200 border-[#27272a] hover:border-[#b2ff05]/40 active:scale-[0.99] rounded-2xl"
                  >
                    <div className="flex items-start justify-between gap-3">
                      {/* Bagian Kiri: Info Coin, Direction, PnL, Tags */}
                      <div className="min-w-0 flex-1 space-y-2">
                        <div className="flex items-center gap-2">
                          <InstrumentBadge instrument={trade.instrument} />
                          <DirectionBadge direction={trade.direction} />
                          {trade.status === "open" && (
                            <span className="rounded-md border border-sky-500/30 bg-sky-500/15 px-2 py-0.5 font-mono text-[10px] font-bold text-sky-400">
                              OPEN
                            </span>
                          )}
                        </div>

                        {/* Nilai PnL Besar */}
                        <div>
                          <span
                            className={cn(
                              "font-mono text-xl font-extrabold tracking-tight block",
                              trade.status === "open"
                                ? "text-sky-400"
                                : isProfit
                                ? "text-emerald-400"
                                : isLoss
                                ? "text-red-400"
                                : "text-amber-400",
                            )}
                          >
                            {trade.status === "open"
                              ? "OPEN POSITION"
                              : hideAmounts
                              ? formatR(trade.r_multiple)
                              : `${isProfit ? "+" : ""}${formatSignedCurrency(trade.pnl, cur)}`}
                          </span>
                        </div>

                        {/* Sub-badges: R:R & Setup */}
                        <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                          {trade.r_multiple != null && (
                            <span className="rounded-md border border-[#27272a] bg-[#121215] px-2 py-0.5 font-mono text-[10px] font-semibold text-[#a1a1aa]">
                              {formatR(trade.r_multiple)}
                            </span>
                          )}
                          <span className="rounded-md border border-[#27272a] bg-[#121215] px-2 py-0.5 text-[10px] font-medium text-[#d4d4d8]">
                            {strategy?.name || trade.tags[0] || "Trend Following"}
                          </span>
                          <span className="text-[10px] text-[#71717a] font-mono">
                            {new Date(trade.traded_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                          </span>
                        </div>
                      </div>

                      {/* Bagian Kanan: Result Badge & Arrow */}
                      <div className="flex flex-col items-end justify-between h-full gap-2 shrink-0 self-stretch">
                        <ResultBadge result={trade.result} />
                        <div className="mt-auto flex items-center gap-1 text-[11px] font-semibold text-[#b2ff05]">
                          <span>Detail</span>
                          <ChevronDown className="h-3.5 w-3.5 -rotate-90" />
                        </div>
                      </div>
                    </div>
                  </Link>
                </React.Fragment>
              );
            })}
          </div>
        </div>
      )}

      {filtered.length > PAGE_SIZE && (
        <div className="mt-3 flex items-center justify-between gap-2 rounded-lg border border-border/70 bg-card/40 px-3 py-2">
          <span className="text-[11px] text-muted-foreground">
            {safePage * PAGE_SIZE + 1}–{Math.min((safePage + 1) * PAGE_SIZE, filtered.length)}{" "}
            {t("common.of")} {filtered.length}
          </span>
          <div className="flex items-center gap-1.5">
            <Button
              variant="outline"
              size="sm"
              className="h-7 text-xs"
              disabled={safePage === 0}
              onClick={() => setPage((p) => Math.max(0, p - 1))}
            >
              {t("common.prev")}
            </Button>
            <span className="tabular px-1 text-[11px] text-muted-foreground">
              {safePage + 1} / {pageCount}
            </span>
            <Button
              variant="outline"
              size="sm"
              className="h-7 text-xs"
              disabled={safePage >= pageCount - 1}
              onClick={() => setPage((p) => Math.min(pageCount - 1, p + 1))}
            >
              {t("common.next")}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

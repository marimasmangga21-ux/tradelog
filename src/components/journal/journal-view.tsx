"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Brain,
  ChevronRight,
  Lightbulb,
  MoreVertical,
  NotebookPen,
  Pencil,
  Plus,
  BookOpen,
  Trash2,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { toast } from "sonner";
import { useI18n } from "@/components/providers/i18n-provider";
import { useData } from "@/components/providers/data-provider";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { JournalForm } from "@/components/journal/journal-form";
import { deleteJournal } from "@/app/actions/journal";
import { formatPercent, formatR, formatSignedCurrency, pnlColor } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Currency, Trade } from "@/lib/types";

export function JournalView({ hideAmounts }: { hideAmounts: boolean }) {
  const { t, locale } = useI18n();
  const { journals, emotions, trades, accounts } = useData();
  const router = useRouter();
  const searchParams = useSearchParams();
  const accountId = searchParams.get("account");

  const [formOpen, setFormOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = React.useState<string | null>(null);
  const [emotionFilter, setEmotionFilter] = React.useState<string>("all");
  const [visibleCount, setVisibleCount] = React.useState(20);

  const currency = accounts[0]?.currency ?? "USD";

  const visibleTrades = React.useMemo(
    () => (accountId ? trades.filter((t) => t.account_id === accountId) : trades),
    [trades, accountId],
  );

  const filteredJournals = React.useMemo(() => {
    let list = journals;
    if (accountId) {
      const ids = new Set(visibleTrades.map((t) => t.id));
      list = list.filter((j) => j.trade_id && ids.has(j.trade_id));
    }
    if (emotionFilter !== "all") {
      list = list.filter((j) => j.emotion_ids.includes(emotionFilter));
    }
    return [...list].sort(
      (a, b) => new Date(b.journal_date).getTime() - new Date(a.journal_date).getTime(),
    );
  }, [journals, accountId, visibleTrades, emotionFilter]);

  // Statistik emosi vs hasil
  const emotionStats = React.useMemo(() => {
    const map = new Map<string, { total: number; wins: number; netPnl: number; rSum: number; rCount: number }>();

    for (const journal of journals) {
      if (!journal.trade_id) continue;
      const trade = visibleTrades.find((t) => t.id === journal.trade_id);
      if (!trade || trade.status !== "closed") continue;

      for (const emotionId of journal.emotion_ids) {
        const entry = map.get(emotionId) ?? { total: 0, wins: 0, netPnl: 0, rSum: 0, rCount: 0 };
        entry.total += 1;
        if (trade.pnl > 0) entry.wins += 1;
        entry.netPnl += trade.pnl;
        if (trade.r_multiple !== null) {
          entry.rSum += trade.r_multiple;
          entry.rCount += 1;
        }
        map.set(emotionId, entry);
      }
    }

    return Array.from(map.entries())
      .map(([id, v]) => ({
        emotion: emotions.find((e) => e.id === id),
        id,
        total: v.total,
        wins: v.wins,
        winRate: v.total > 0 ? (v.wins / v.total) * 100 : 0,
        netPnl: v.netPnl,
        avgR: v.rCount > 0 ? v.rSum / v.rCount : 0,
      }))
      .filter((row) => row.emotion && row.total > 0)
      .sort((a, b) => b.winRate - a.winRate);
  }, [journals, visibleTrades, emotions]);

  const journaledTradeCount = React.useMemo(
    () => new Set(journals.filter((j) => j.trade_id).map((j) => j.trade_id)).size,
    [journals],
  );

  const insight = React.useMemo(() => {
    const eligible = emotionStats.filter((s) => s.total >= 2);
    if (eligible.length < 2) return null;
    const best = eligible[0];
    const worst = eligible[eligible.length - 1];
    if (best.winRate - worst.winRate < 5) return null;
    return { best, worst };
  }, [emotionStats]);

  const avgMood = React.useMemo(() => {
    const scored = journals.filter((j) => j.mood_score !== null);
    if (scored.length === 0) return null;
    return scored.reduce((a, j) => a + (j.mood_score ?? 0), 0) / scored.length;
  }, [journals]);

  const editingJournal = journals.find((j) => j.id === editing) ?? null;

  async function handleDelete() {
    if (!deleteTarget) return;
    const result = await deleteJournal(deleteTarget);
    setDeleteTarget(null);
    if (!result.ok) {
      toast.error(t("common.error"), { description: result.error });
      return;
    }
    toast.success(t("journal.deleted"));
    router.refresh();
  }

  const openNew = () => {
    setEditing(null);
    setFormOpen(true);
  };

  return (
    <div className="space-y-4">
      {/* Mobile Top Sub-tabs TRADES vs JOURNALS */}
      <div className="flex items-center gap-6 border-b border-[#222228] pb-2 px-1 lg:hidden">
        <Link
          href="/trades"
          className="pb-2 font-mono text-xs font-semibold uppercase tracking-wider text-[#71717a] hover:text-white transition"
        >
          <span>TRADES</span>
        </Link>
        <button
          type="button"
          className="relative pb-2 font-mono text-xs font-bold uppercase tracking-wider text-white"
        >
          <span>JOURNALS</span>
          <span className="absolute inset-x-0 bottom-0 h-[2px] bg-[#b2ff05] shadow-[0_0_8px_#b2ff05]" />
        </button>
      </div>

      {/* Desktop Header */}
      <div className="hidden lg:flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#f2f2f0] sm:text-3xl">
            {t("journal.title")}
          </h1>
          <p className="mt-0.5 text-xs text-[#8e8e93]">{t("journal.subtitle")}</p>
        </div>

        <Button
          size="sm"
          className="gap-1.5 bg-[#b2ff05] text-black font-bold hover:bg-[#9fe000] rounded-xl h-9 shadow-[0_0_15px_rgba(178,255,5,0.25)]"
          onClick={openNew}
        >
          <Plus className="h-4 w-4 stroke-[2.5]" />
          {t("journal.new")}
        </Button>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.5fr_1fr]">
        {/* Daftar jurnal */}
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 flex-1">
              <Select value={emotionFilter} onValueChange={setEmotionFilter}>
                <SelectTrigger className="h-9 w-full max-w-[180px] text-xs border-[#222228] bg-[#0c0c0e] text-[#d4d4d8] hover:border-[#b2ff05]/40 rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="border-[#222228] bg-[#0e0e12] text-white">
                  <SelectItem value="all">{t("journal.allEmotions")}</SelectItem>
                  {emotions.map((e) => (
                    <SelectItem key={e.id} value={e.id} className="cursor-pointer">
                      <span className="flex items-center gap-2">
                        <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: e.color }} />
                        {e.name}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <span className="text-[11px] text-muted-foreground hidden sm:inline">
                {filteredJournals.length} {t("common.of")} {journals.length}
              </span>
            </div>
            <Button
              size="sm"
              className="lg:hidden gap-1 bg-[#b2ff05] text-black font-bold hover:bg-[#9fe000] rounded-xl h-9 text-xs px-3 shadow-[0_0_12px_rgba(178,255,5,0.3)] shrink-0"
              onClick={openNew}
            >
              <Plus className="h-3.5 w-3.5 stroke-[2.5]" />
              <span>{t("journal.new")}</span>
            </Button>
          </div>

          {filteredJournals.length === 0 ? (
            <EmptyState
              icon={NotebookPen}
              title={t("journal.empty")}
              description={t("journal.emptyDesc")}
              action={
                <Button onClick={openNew}>
                  <Plus className="h-4 w-4" />
                  {t("journal.new")}
                </Button>
              }
            />
          ) : (
            <div className="space-y-2.5">
              {filteredJournals.slice(0, visibleCount).map((journal) => {
                const trade = journal.trade_id ? trades.find((t) => t.id === journal.trade_id) : null;
                const journalEmotions = emotions.filter((e) => journal.emotion_ids.includes(e.id));

                return (
                  <div key={journal.id} className="mobile-card p-4 space-y-2 transition-all duration-200 border-[#222228] hover:border-[#b2ff05]/40">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-[11px] font-medium text-[#8e8e93]">
                            {new Date(journal.journal_date).toLocaleDateString(
                              locale === "id" ? "id-ID" : "en-US",
                              { weekday: "short", day: "numeric", month: "short", year: "numeric" },
                            )}
                          </span>
                          {journal.mood_score && (
                            <span className="text-[11px]">
                              {journal.mood_score === 1
                                ? "😖"
                                : journal.mood_score === 2
                                  ? "😕"
                                  : journal.mood_score === 3
                                    ? "😐"
                                    : journal.mood_score === 4
                                      ? "🙂"
                                      : "😄"}
                            </span>
                          )}
                          {trade && (
                            <Link
                              href={`/trades/${trade.id}`}
                              className="flex items-center gap-1 rounded-lg border border-[#222228] bg-[#0c0c0e] px-2 py-0.5 text-[10px] hover:border-[#b2ff05]/40"
                            >
                              <span className="font-mono font-bold text-white">{trade.instrument}</span>
                              <span
                                className={cn("tabular font-mono font-bold", pnlColor(trade.pnl))}
                              >
                                {hideAmounts
                                  ? formatR(trade.r_multiple)
                                  : formatSignedCurrency(trade.pnl, currency, { compact: true })}
                              </span>
                            </Link>
                          )}
                        </div>
                        <h3 className="mt-1.5 text-sm font-bold text-white tracking-tight">
                          {journal.title ?? t("journal.title")}
                        </h3>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon-sm" className="-mr-1 -mt-1 shrink-0 text-[#71717a] hover:text-white">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-40 border-[#222228] bg-[#0e0e12]">
                          <DropdownMenuItem
                            onClick={() => {
                              setEditing(journal.id);
                              setFormOpen(true);
                            }}
                          >
                            <Pencil className="h-4 w-4" />
                            {t("common.edit")}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => setDeleteTarget(journal.id)}
                            className="text-loss focus:text-loss"
                          >
                            <Trash2 className="h-4 w-4" />
                            {t("common.delete")}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    {journalEmotions.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {journalEmotions.map((e) => (
                          <span
                            key={e.id}
                            className="rounded-full px-2.5 py-0.5 text-[10px] font-bold border border-[#222228] bg-[#0c0c0e] text-[#d4d4d8]"
                            style={{
                              color: e.color || "#b2ff05",
                              borderColor: `${e.color || "#b2ff05"}40`,
                              backgroundColor: `${e.color || "#b2ff05"}15`,
                            }}
                          >
                            {e.name}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Trading Evaluation Blocks (Pelajaran & Kesalahan) */}
                    {(journal.lesson_learned || journal.mistakes) && (
                      <div className="mt-3 grid gap-2 sm:grid-cols-2">
                        {journal.lesson_learned && (
                          <div className="rounded-xl border border-emerald-500/25 bg-emerald-500/[0.04] p-3 transition-colors hover:border-emerald-500/40">
                            <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_#10b981]" />
                              <span>Key Takeaway & Setup</span>
                            </div>
                            <p className="mt-1.5 text-xs leading-relaxed text-[#d4d4d8]">
                              {journal.lesson_learned}
                            </p>
                          </div>
                        )}
                        {journal.mistakes && (
                          <div className="rounded-xl border border-red-500/25 bg-red-500/[0.04] p-3 transition-colors hover:border-red-500/40">
                            <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-red-400">
                              <span className="h-1.5 w-1.5 rounded-full bg-red-400 shadow-[0_0_6px_#ef4444]" />
                              <span>Evaluasi & Leak Detected</span>
                            </div>
                            <p className="mt-1.5 text-xs leading-relaxed text-[#d4d4d8]">
                              {journal.mistakes}
                            </p>
                          </div>
                        )}
                      </div>
                    )}

                    {journal.content && (
                      <div className="mt-2.5 rounded-xl border border-[#222228] bg-[#0c0c0e]/80 p-3">
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-[#71717a] block mb-1">
                          Catatan Psikologi / Sesi:
                        </span>
                        <p className="text-xs leading-relaxed text-[#a1a1aa]">
                          {journal.content}
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}

              {filteredJournals.length > visibleCount && (
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => setVisibleCount((n) => n + 20)}
                >
                  {t("common.viewAll")} ({filteredJournals.length - visibleCount})
                </Button>
              )}
            </div>
          )}
        </div>

        {/* Panel statistik emosi */}
        <div className="space-y-4 lg:sticky lg:top-20 lg:self-start">
          <div className="tradoxes-card rounded-2xl p-5 border border-[#222228]">
            <div className="pb-3 border-b border-[#222228]">
              <div className="flex items-center gap-2">
                <Brain className="h-4 w-4 text-[#b2ff05]" />
                <h3 className="text-sm font-semibold uppercase tracking-wider text-[#8e8e93]">{t("journal.statsTitle")}</h3>
              </div>
              <p className="text-[11px] text-[#71717a] mt-0.5">{t("journal.statsSubtitle")}</p>
            </div>
            <div className="pt-3">
              {emotionStats.length === 0 ? (
                <div className="rounded-xl border border-dashed border-[#222228] py-8 text-center bg-[#0c0c0e]">
                  <BookOpen className="mx-auto h-5 w-5 text-[#71717a]" />
                  <p className="mt-2 px-4 text-xs leading-relaxed text-[#71717a]">
                    {t("journal.noStats")}
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {emotionStats.map((stat) => (
                    <div key={stat.id} className="space-y-1.5">
                      <div className="flex items-center justify-between gap-2 text-xs">
                        <span className="flex items-center gap-1.5 font-bold text-white">
                          <span
                            className="h-2 w-2 rounded-full"
                            style={{ backgroundColor: stat.emotion!.color }}
                          />
                          {stat.emotion!.name}
                          <span className="text-[10px] font-normal text-[#71717a]">
                            ({stat.total})
                          </span>
                        </span>
                        <span className="tabular font-mono text-xs font-bold text-[#b2ff05]">
                          {formatPercent(stat.winRate, 0)}
                        </span>
                      </div>
                      <div className="h-1.5 overflow-hidden rounded-full bg-[#1c1c22]">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${Math.max(3, stat.winRate)}%`,
                            backgroundColor: stat.emotion!.color,
                          }}
                        />
                      </div>
                      <div className="flex items-center justify-between text-[10px] text-[#71717a]">
                        <span>
                          {stat.wins}W · {stat.total - stat.wins}L
                        </span>
                        <span className={cn("tabular font-mono font-bold", pnlColor(stat.netPnl))}>
                          {hideAmounts ? formatR(stat.avgR) : formatSignedCurrency(stat.netPnl, currency, { compact: true })}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {insight && (
            <div className="tradoxes-card rounded-2xl p-4 border border-[#b2ff05]/20 bg-[#b2ff05]/[0.02]">
              <div className="flex items-center gap-2">
                <span className="grid h-7 w-7 place-items-center rounded-lg bg-[#b2ff05]/15 border border-[#b2ff05]/30">
                  <Lightbulb className="h-3.5 w-3.5 text-[#b2ff05]" />
                </span>
                <p className="text-xs font-bold text-white">{t("journal.insightTitle")}</p>
              </div>
              <div className="mt-2.5 space-y-2 text-xs leading-relaxed">
                <p className="flex items-start gap-1.5 text-[#a1a1aa]">
                  <TrendingUp className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#b2ff05]" />
                  <span>
                    {t("journal.insightBest", {
                      emotion: insight.best.emotion!.name,
                      n: Math.round(insight.best.winRate),
                    })}
                  </span>
                </p>
                <p className="flex items-start gap-1.5 text-[#a1a1aa]">
                  <TrendingDown className="mt-0.5 h-3.5 w-3.5 shrink-0 text-red-400" />
                  <span>
                    {t("journal.insightWorst", {
                      emotion: insight.worst.emotion!.name,
                      n: Math.round(insight.worst.winRate),
                    })}
                  </span>
                </p>
              </div>
            </div>
          )}

          <div className="tradoxes-card rounded-2xl p-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-[10px] uppercase tracking-wide text-[#8e8e93]">
                  {t("journal.title")}
                </p>
                <p className="tabular font-mono mt-0.5 text-xl font-bold text-white">{journals.length}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wide text-[#8e8e93]">
                  {t("journal.moodAvg")}
                </p>
                <p className="tabular font-mono mt-0.5 text-xl font-bold text-[#b2ff05]">
                  {avgMood !== null ? avgMood.toFixed(1) : "—"}
                  <span className="text-xs text-[#71717a] font-normal"> / 5</span>
                </p>
              </div>
              <div className="col-span-2 border-t border-[#222228] pt-2 flex items-center justify-between">
                <p className="text-[11px] text-[#8e8e93]">
                  {t("journal.linkedTrade")}
                </p>
                <p className="tabular font-mono text-xs font-bold text-white">
                  {journaledTradeCount} {t("common.trades")}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingJournal ? t("journal.edit") : t("journal.new")}</DialogTitle>
            <DialogDescription>{t("journal.subtitle")}</DialogDescription>
          </DialogHeader>
          <JournalForm
            journal={editingJournal ?? undefined}
            emotions={emotions}
            trades={visibleTrades}
            onDone={() => {
              setFormOpen(false);
              setEditing(null);
            }}
          />
        </DialogContent>
      </Dialog>

      <AlertDialog open={Boolean(deleteTarget)} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("journal.deleteTitle")}</AlertDialogTitle>
            <AlertDialogDescription>{t("journal.deleteDesc")}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
            <AlertDialogAction onClick={() => void handleDelete()}>{t("common.delete")}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

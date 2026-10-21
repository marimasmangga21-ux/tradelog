"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  MoreVertical,
  Pencil,
  Plus,
  Target,
  Trash2,
  TrendingUp,
  Zap,
} from "lucide-react";
import { toast } from "sonner";
import { useI18n } from "@/components/providers/i18n-provider";
import { useData } from "@/components/providers/data-provider";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TradingConceptsView } from "@/components/strategies/trading-concepts-view";
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
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { StrategyForm } from "@/components/strategies/strategy-form";
import { deleteStrategy } from "@/app/actions/strategies";
import { computeAnalytics, computeProfitFactor } from "@/lib/analytics";
import { formatPercent, formatR, formatRatio, formatSignedCurrency, pnlColor } from "@/lib/format";
import { cn } from "@/lib/utils";

export function StrategiesView({ hideAmounts }: { hideAmounts: boolean }) {
  const { t } = useI18n();
  const { strategies, trades, accounts } = useData();
  const router = useRouter();

  const [formOpen, setFormOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<string | null>(null);
  const [detail, setDetail] = React.useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = React.useState<string | null>(null);
  const [mainTab, setMainTab] = React.useState<string>("playbook");

  const statsByStrategy = React.useMemo(() => {
    const map = new Map<string, ReturnType<typeof computeAnalytics>>();
    for (const strategy of strategies) {
      const list = trades.filter((t) => t.strategy_id === strategy.id);
      map.set(strategy.id, computeAnalytics(list));
    }
    return map;
  }, [strategies, trades]);

  const editingStrategy = strategies.find((s) => s.id === editing) ?? null;
  const detailStrategy = strategies.find((s) => s.id === detail) ?? null;
  const detailStats = detailStrategy ? statsByStrategy.get(detailStrategy.id) : null;

  const currency = accounts[0]?.currency ?? "USD";

  async function handleDelete() {
    if (!deleteTarget) return;
    const result = await deleteStrategy(deleteTarget);
    setDeleteTarget(null);
    if (!result.ok) {
      toast.error(t("common.error"), { description: result.error });
      return;
    }
    toast.success(t("strategies.deleted"));
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("strategies.title")}
        description={t("strategies.subtitle")}
        actions={
          mainTab === "playbook" ? (
            <Button
              size="sm"
              className="gap-1.5"
              onClick={() => {
                setEditing(null);
                setFormOpen(true);
              }}
            >
              <Plus className="h-4 w-4" />
              {t("strategies.new")}
            </Button>
          ) : undefined
        }
      />

      <Tabs value={mainTab} onValueChange={setMainTab} className="w-full space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#1a1a1a] pb-4">
          <TabsList className="bg-[#090909] border border-[#1a1a1a] p-1 h-auto rounded-lg">
            <TabsTrigger
              value="playbook"
              className="text-xs px-4 py-2 font-semibold data-[state=active]:bg-[#141414] data-[state=active]:text-foreground rounded-md transition-all"
            >
              Playbook Strategi ({strategies.length})
            </TabsTrigger>
            <TabsTrigger
              value="concepts"
              className="text-xs px-4 py-2 font-semibold data-[state=active]:bg-[#141414] data-[state=active]:text-foreground rounded-md transition-all flex items-center gap-2"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-[#b2ff05]" />
              Panduan Konsep (Structure, POI, Liquidity)
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="playbook" className="space-y-6 mt-0">
          {/* Mobile View: Presisi Gambar 2 (Grid 2 Kolom) */}
          <div className="block lg:hidden space-y-3">
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="Search strategies..."
                  className="w-full h-9 rounded-xl border border-white/10 bg-[#121215] px-3 pl-8 text-xs text-white placeholder-[#71717a] focus:outline-none focus:border-[#b2ff05]/50"
                />
                <svg className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#71717a]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8" />
                  <path d="m21 21-4.3-4.3" />
                </svg>
              </div>
              <Button
                onClick={() => {
                  setEditing(null);
                  setFormOpen(true);
                }}
                className="h-9 gap-1 rounded-xl bg-[#b2ff05] px-3 text-xs font-bold text-black hover:bg-[#9fe000] shadow-[0_0_15px_rgba(178,255,5,0.3)] shrink-0"
              >
                <Plus className="h-3.5 w-3.5 stroke-[3]" />
                <span>New Strategy</span>
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-2.5 pt-1">
              {strategies.map((strategy) => {
                const stats = statsByStrategy.get(strategy.id);
                const winRate = stats?.winRate ?? 65;
                const isHighWr = winRate >= 60;

                return (
                  <div
                    key={strategy.id}
                    onClick={() => setDetail(strategy.id)}
                    className="mobile-card p-3 space-y-2 cursor-pointer transition hover:border-[#b2ff05]/40 active:scale-[0.98]"
                  >
                    <div className="flex items-start justify-between gap-1">
                      <span className="text-xs font-bold text-white leading-tight truncate">
                        {strategy.name}
                      </span>
                      <span
                        className={cn(
                          "rounded px-1.5 py-0.5 text-[9px] font-black shrink-0",
                          isHighWr
                            ? "bg-[#b2ff05] text-black shadow-[0_0_8px_rgba(178,255,5,0.4)]"
                            : "bg-red-500/20 text-red-400 border border-red-500/30"
                        )}
                      >
                        {winRate.toFixed(0)}% WR
                      </span>
                    </div>

                    <p className="text-[11px] text-[#a1a1aa]">
                      Profit Factor:{" "}
                      <span className="font-mono font-bold text-[#b2ff05]">
                        {formatRatio(stats?.profitFactor ?? null)}
                      </span>
                    </p>

                    <div className="flex items-center justify-between text-[10px] text-[#71717a]">
                      <div className="flex items-center gap-1">
                        <span className="rounded bg-white/[0.06] px-1 py-0.2 text-[#71717a]">↑ -</span>
                        <span className="rounded bg-emerald-500/20 px-1 py-0.2 text-emerald-400 font-bold">+ -</span>
                      </div>
                      <span>{stats?.totalTrades ?? 0} Trades</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Desktop Grid */}
          <div className="hidden lg:block">
          {strategies.length === 0 ? (
            <EmptyState
              icon={BookOpen}
              title={t("strategies.empty")}
              description={t("strategies.emptyDesc")}
              action={
                <Button onClick={() => setFormOpen(true)}>
                  <Plus className="h-4 w-4" />
                  {t("strategies.new")}
                </Button>
              }
            />
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {strategies.map((strategy) => {
                const stats = statsByStrategy.get(strategy.id);
                const winRate = stats?.winRate ?? 0;
                return (
                  <div
                    key={strategy.id}
                    className="tradoxes-card tradoxes-card-hover rounded-2xl relative overflow-hidden p-5 flex flex-col justify-between space-y-4"
                  >
                    <div className="absolute inset-x-0 top-0 h-[2px]" style={{ backgroundColor: strategy.color || "#b2ff05" }} />
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span
                              className="h-2.5 w-2.5 shrink-0 rounded-full"
                              style={{ backgroundColor: strategy.color || "#b2ff05" }}
                            />
                            <h3 className="truncate text-base font-bold text-white tracking-tight">{strategy.name}</h3>
                          </div>
                          <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-[#8e8e93]">
                            {strategy.description ?? "—"}
                          </p>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon-sm" className="-mr-1 -mt-1 shrink-0 text-[#71717a] hover:text-white">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-44 border-white/10 bg-[#0e0e12] text-white">
                            <DropdownMenuItem onClick={() => setDetail(strategy.id)}>
                              <ArrowRight className="h-4 w-4" />
                              {t("strategies.viewDetail")}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => {
                                setEditing(strategy.id);
                                setFormOpen(true);
                              }}
                            >
                              <Pencil className="h-4 w-4" />
                              {t("common.edit")}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator className="bg-white/10" />
                            <DropdownMenuItem
                              onClick={() => setDeleteTarget(strategy.id)}
                              className="text-loss focus:text-loss"
                            >
                              <Trash2 className="h-4 w-4" />
                              {t("common.delete")}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>

                      {strategy.image_url && (
                        <div
                          onClick={() => setDetail(strategy.id)}
                          className="group/img relative aspect-[16/8] cursor-pointer overflow-hidden rounded-xl border border-white/[0.08] bg-black/40"
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={strategy.image_url}
                            alt={strategy.name}
                            className="h-full w-full object-cover transition-transform duration-300 group-hover/img:scale-105"
                          />
                        </div>
                      )}

                      <div className="grid grid-cols-3 gap-2 rounded-xl border border-white/[0.06] bg-black/30 p-2.5 text-center">
                        <div>
                          <p className="text-[10px] uppercase tracking-wide text-[#71717a]">
                            {t("strategies.winRate")}
                          </p>
                          <p className={cn("tabular font-mono text-sm font-bold", winRate >= 50 ? "text-[#b2ff05]" : "text-red-400")}>
                            {formatPercent(winRate, 1)}
                          </p>
                        </div>
                        <div>
                          <p className="text-[10px] uppercase tracking-wide text-[#71717a]">
                            {t("strategies.profitFactor")}
                          </p>
                          <p className="tabular font-mono text-sm font-bold text-white">{formatRatio(stats?.profitFactor ?? null)}</p>
                        </div>
                        <div>
                          <p className="text-[10px] uppercase tracking-wide text-[#71717a]">
                            {t("strategies.totalTrades")}
                          </p>
                          <p className="tabular font-mono text-sm font-bold text-white">{stats?.totalTrades ?? 0}</p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-xs pt-1">
                        <span className="text-[#8e8e93]">{t("strategies.netPnl")}</span>
                        <span className={cn("tabular font-mono font-bold text-sm", pnlColor(stats?.netPnl ?? 0))}>
                          {hideAmounts ? formatR(stats?.avgRr ?? 0) : formatSignedCurrency(stats?.netPnl ?? 0, currency, { compact: true })}
                        </span>
                      </div>

                      {strategy.checklist.length > 0 && (
                        <div className="flex items-center gap-1.5 text-[11px] text-[#71717a]">
                          <CheckCircle2 className="h-3.5 w-3.5 text-[#b2ff05]" />
                          <span>{strategy.checklist.length} {t("strategies.checklist").toLowerCase()}</span>
                        </div>
                      )}
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full text-xs rounded-xl border-white/10 bg-[#121215] text-white hover:border-[#b2ff05]/40 hover:text-[#b2ff05] transition-all mt-2"
                      onClick={() => setDetail(strategy.id)}
                    >
                      {t("strategies.viewDetail")}
                      <ArrowRight className="h-3 w-3 ml-1" />
                    </Button>
                  </div>
                );
              })}
            </div>
          )}
          </div>
        </TabsContent>

        <TabsContent value="concepts" className="space-y-6 mt-0">
          <TradingConceptsView />
        </TabsContent>
      </Tabs>

      {/* Form */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingStrategy ? t("strategies.edit") : t("strategies.new")}</DialogTitle>
            <DialogDescription>{t("strategies.subtitle")}</DialogDescription>
          </DialogHeader>
          <StrategyForm
            strategy={editingStrategy ?? undefined}
            onDone={() => {
              setFormOpen(false);
              setEditing(null);
            }}
          />
        </DialogContent>
      </Dialog>

      {/* Detail */}
      <Dialog open={Boolean(detail)} onOpenChange={(o) => !o && setDetail(null)}>
        <DialogContent className="max-w-2xl">
          {detailStrategy && detailStats && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: detailStrategy.color }}
                  />
                  {detailStrategy.name}
                </DialogTitle>
                <DialogDescription>{detailStrategy.description}</DialogDescription>
              </DialogHeader>

              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                <Stat label={t("strategies.winRate")} value={formatPercent(detailStats.winRate, 1)} icon={Target} />
                <Stat label={t("strategies.profitFactor")} value={formatRatio(detailStats.profitFactor)} icon={Zap} />
                <Stat
                  label={t("strategies.expectancy")}
                  value={hideAmounts ? formatR(detailStats.avgRr) : formatSignedCurrency(detailStats.expectancy, currency, { compact: true })}
                  icon={TrendingUp}
                />
                <Stat label={t("strategies.totalTrades")} value={String(detailStats.totalTrades)} icon={BookOpen} />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                    {t("strategies.entryRules")}
                  </p>
                  <p className="mt-1.5 whitespace-pre-wrap text-xs leading-relaxed text-foreground/80">
                    {detailStrategy.entry_rules ?? "—"}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                    {t("strategies.exitRules")}
                  </p>
                  <p className="mt-1.5 whitespace-pre-wrap text-xs leading-relaxed text-foreground/80">
                    {detailStrategy.exit_rules ?? "—"}
                  </p>
                </div>
              </div>

              {detailStrategy.checklist.length > 0 && (
                <>
                  <Separator />
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                      {t("strategies.checklist")}
                    </p>
                    <div className="mt-2 space-y-1.5">
                      {detailStrategy.checklist.map((item) => (
                        <div key={item.id} className="flex items-start gap-2 text-xs text-foreground/80">
                          <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                          {item.text}
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {detailStrategy.image_url && (
                <div className="overflow-hidden rounded-lg border border-border">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={detailStrategy.image_url} alt={detailStrategy.name} className="w-full object-cover" />
                </div>
              )}

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setDetail(null)}>
                  {t("common.close")}
                </Button>
                <Button
                  onClick={() => {
                    setDetail(null);
                    setEditing(detailStrategy.id);
                    setFormOpen(true);
                  }}
                >
                  <Pencil className="h-4 w-4" />
                  {t("common.edit")}
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete */}
      <AlertDialog open={Boolean(deleteTarget)} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("strategies.deleteTitle")}</AlertDialogTitle>
            <AlertDialogDescription>{t("strategies.deleteDesc")}</AlertDialogDescription>
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

function Stat({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon: React.ElementType;
}) {
  return (
    <div className="rounded-lg border border-border/60 bg-muted/20 p-2.5">
      <div className="flex items-center gap-1 text-[9px] uppercase tracking-wide text-muted-foreground">
        <Icon className="h-2.5 w-2.5" />
        {label}
      </div>
      <p className="tabular mt-0.5 text-sm font-semibold">{value}</p>
    </div>
  );
}

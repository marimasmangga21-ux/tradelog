"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Calendar,
  Clock,
  Image as ImageIcon,
  Maximize2,
  Pencil,
  Share2,
  Target,
  Trash2,
  TrendingDown,
  TrendingUp,
  Wallet,
  X,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import { toast } from "sonner";
import { useI18n } from "@/components/providers/i18n-provider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { ResultBadge, DirectionBadge, InstrumentBadge } from "@/components/shared/result-badge";
import { TradeSnapshotDialog } from "@/components/snapshot/trade-snapshot-dialog";
import { deleteTrade, assignTradeStrategy } from "@/app/actions/trades";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatDuration, formatPrice, formatR, formatSignedCurrency, pnlColor } from "@/lib/format";
import { sessionRangeLabel } from "@/lib/sessions";
import { cn } from "@/lib/utils";
import type { Account, Emotion, Journal, Strategy, Trade, TradeScreenshot } from "@/lib/types";

const SESSION_KEYS: Record<string, string> = {
  asia: "analytics.sessionAsia",
  london: "analytics.sessionLondon",
  new_york: "analytics.sessionNewYork",
  sydney: "analytics.sessionSydney",
  other: "analytics.sessionOther",
};

export function TradeDetailView({
  trade,
  account,
  strategy,
  strategies = [],
  screenshots,
  journals,
  emotions,
  hideAmounts,
}: {
  trade: Trade;
  account: Account | null;
  strategy: Strategy | null;
  strategies?: Strategy[];
  screenshots: TradeScreenshot[];
  journals: Journal[];
  emotions: Emotion[];
  hideAmounts: boolean;
}) {
  const { t, locale } = useI18n();
  const router = useRouter();
  const [deleting, setDeleting] = React.useState(false);
  const [zoom, setZoom] = React.useState<{ url: string; label: string } | null>(null);
  const [zoomLevel, setZoomLevel] = React.useState(1);
  const [selectedStrategyId, setSelectedStrategyId] = React.useState<string | null>(trade.strategy_id);
  const [isUpdatingStrategy, setIsUpdatingStrategy] = React.useState(false);

  const activeStrategy = strategies.find((s) => s.id === selectedStrategyId) ?? strategy;

  const handleStrategyChange = async (value: string) => {
    const targetId = value === "none" ? null : value;
    setSelectedStrategyId(targetId);
    setIsUpdatingStrategy(true);
    try {
      const res = await assignTradeStrategy(trade.id, targetId);
      if (res.ok) {
        toast.success(targetId ? "Strategi berhasil disimpan" : "Strategi dihapus dari trade");
        router.refresh();
      } else {
        toast.error(res.error || "Gagal menyimpan strategi");
        setSelectedStrategyId(trade.strategy_id);
      }
    } catch {
      toast.error("Terjadi kesalahan saat menyimpan strategi");
      setSelectedStrategyId(trade.strategy_id);
    } finally {
      setIsUpdatingStrategy(false);
    }
  };

  const currency = account?.currency ?? "USD";
  const isOpen = trade.status === "open";

  const duration = React.useMemo(() => {
    if (!trade.closed_at) return null;
    const ms = new Date(trade.closed_at).getTime() - new Date(trade.traded_at).getTime();
    return formatDuration(ms / 60000, locale);
  }, [trade.closed_at, trade.traded_at, locale]);

  const riskReward = React.useMemo(() => {
    if (trade.entry_price === null || trade.stop_loss === null || trade.take_profit === null) return null;
    const risk = Math.abs(trade.entry_price - trade.stop_loss);
    const reward = Math.abs(trade.take_profit - trade.entry_price);
    return risk > 0 ? reward / risk : null;
  }, [trade]);

  async function handleDelete() {
    setDeleting(true);
    const result = await deleteTrade(trade.id);
    setDeleting(false);
    if (!result.ok) {
      toast.error(t("common.error"), { description: result.error });
      return;
    }
    toast.success(t("trades.deleted"));
    router.push("/trades");
    router.refresh();
  }

  const dateLabel = new Date(trade.traded_at).toLocaleDateString(
    locale === "id" ? "id-ID" : "en-US",
    { weekday: "long", day: "numeric", month: "long", year: "numeric" },
  );
  const timeLabel = new Date(trade.traded_at).toLocaleTimeString(
    locale === "id" ? "id-ID" : "en-US",
    { hour: "2-digit", minute: "2-digit" },
  );

  const journalEmotions = React.useMemo(() => {
    const ids = new Set(journals.flatMap((j) => j.emotion_ids));
    return emotions.filter((e) => ids.has(e.id));
  }, [journals, emotions]);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          <Button asChild variant="ghost" size="icon-sm" className="mt-0.5 shrink-0">
            <Link href="/trades">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl font-semibold tracking-tight">{trade.instrument}</h1>
              <DirectionBadge direction={trade.direction} />
              <ResultBadge result={trade.result} />
              {isOpen && (
                <Badge variant="sky" className="text-[10px]">
                  {t("trades.openPosition")}
                </Badge>
              )}
            </div>
            <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {dateLabel}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {timeLabel}
              </span>
              <span>·</span>
              <span className="inline-flex items-center gap-1">
                {t(SESSION_KEYS[trade.session] ?? "analytics.sessionOther")}
                <span className="tabular font-mono text-[10px] text-muted-foreground/70">
                  {sessionRangeLabel(trade.session)}
                </span>
              </span>
              {duration && (
                <>
                  <span>·</span>
                  <span>
                    {t("trades.duration")} {duration}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <TradeSnapshotDialog trade={trade} account={account} hideAmounts={hideAmounts}>
            <Button variant="outline" size="sm" className="gap-1.5">
              <Share2 className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">{t("common.share")}</span>
            </Button>
          </TradeSnapshotDialog>
          <Button asChild variant="outline" size="sm" className="gap-1.5">
            <Link href={`/trades/${trade.id}/edit`}>
              <Pencil className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">{t("common.edit")}</span>
            </Link>
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" size="icon-sm" className="text-loss hover:text-loss">
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>{t("trades.deleteTitle")}</AlertDialogTitle>
                <AlertDialogDescription>{t("trades.deleteDesc")}</AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
                <AlertDialogAction onClick={() => void handleDelete()} disabled={deleting}>
                  {deleting ? t("common.saving") : t("common.delete")}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      {/* PnL hero */}
      <Card
        className={cn(
          "relative overflow-hidden",
          trade.pnl > 0 && "border-profit/25",
          trade.pnl < 0 && "border-loss/25",
        )}
      >
        <div
          className={cn(
            "pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full blur-3xl",
            trade.pnl > 0 ? "bg-profit/15" : trade.pnl < 0 ? "bg-loss/15" : "bg-muted/40",
          )}
        />
        <CardContent className="relative flex flex-wrap items-end justify-between gap-4 p-5">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
              {t("trades.pnl")}
            </p>
            <div className="mt-1 flex items-end gap-3">
              <p className={cn("tabular text-3xl font-semibold tracking-tight lg:text-4xl", pnlColor(trade.pnl))}>
                {isOpen
                  ? "—"
                  : hideAmounts
                    ? formatR(trade.r_multiple)
                    : formatSignedCurrency(trade.pnl, currency)}
              </p>
              {trade.pnl_percent !== null && !isOpen && (
                <span className={cn("mb-1 text-sm tabular", pnlColor(trade.pnl))}>
                  ({trade.pnl_percent > 0 ? "+" : ""}
                  {trade.pnl_percent.toFixed(2)}%)
                </span>
              )}
            </div>
            {!hideAmounts && trade.r_multiple !== null && (
              <p className="mt-1 text-xs text-muted-foreground">
                {formatR(trade.r_multiple)} · {t("trades.riskAmount")}: {formatSignedCurrency(trade.risk_amount ?? 0, currency)}
              </p>
            )}
          </div>

          <div className="flex items-center gap-6">
            <MiniStat label={t("trades.rr")} value={formatR(trade.r_multiple)} />
            <MiniStat
              label={t("trades.riskReward")}
              value={riskReward !== null ? `1:${riskReward.toFixed(2)}` : "—"}
            />
            {trade.balance_after !== null && (
              <MiniStat
                label={t("trades.balanceAfter")}
                value={
                  hideAmounts
                    ? "•••"
                    : formatSignedCurrency(trade.balance_after, currency, { compact: true })
                }
              />
            )}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        {/* Kolom kiri */}
        <div className="space-y-4">
          {/* Screenshots */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm">
                <ImageIcon className="h-3.5 w-3.5 text-muted-foreground" />
                {t("trades.screenshots")}
                <span className="ml-auto text-[10px] font-normal text-muted-foreground">
                  {screenshots.length}/3
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {screenshots.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border/80 py-10 text-center">
                  <ImageIcon className="h-6 w-6 text-muted-foreground/50" />
                  <p className="mt-2 text-xs text-muted-foreground">
                    {t("trades.screenshots")} — HTF / MTF / LTF
                  </p>
                  <Button asChild variant="outline" size="sm" className="mt-3">
                    <Link href={`/trades/${trade.id}/edit`}>
                      {t("common.add")}
                    </Link>
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-2">
                  {(["htf", "mtf", "ltf"] as const).map((tf) => {
                    const shot = screenshots.find((s) => s.timeframe === tf);
                    if (!shot) {
                      return (
                        <div
                          key={tf}
                          className="flex aspect-[16/10] items-center justify-center rounded-lg border border-dashed border-[#1a1a1a] bg-[#090909]"
                        >
                          <span className="text-[10px] font-bold uppercase text-[#5c5c5c]">{tf}</span>
                        </div>
                      );
                    }
                    const url = shot.storage_path.startsWith("http")
                      ? shot.storage_path
                      : `/api/screenshot/${shot.id}`;
                    return (
                      <button
                        key={tf}
                        type="button"
                        onClick={() => {
                          setZoom({ url, label: tf.toUpperCase() });
                          setZoomLevel(1);
                        }}
                        className="group relative aspect-[16/10] overflow-hidden rounded-lg border border-[#1a1a1a] bg-[#090909] text-left focus:outline-none focus:ring-1 focus:ring-[#b2ff05]"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={url}
                          alt={tf}
                          loading="eager"
                          decoding="async"
                          className="h-full w-full object-contain bg-[#090909]"
                        />
                        <span className="absolute left-2 top-2 rounded bg-black/80 px-2 py-0.5 text-[10px] font-bold uppercase text-[#b2ff05] border border-[#1a1a1a]">
                          {tf}
                        </span>
                        <span className="absolute inset-0 grid place-items-center bg-black/40 opacity-0 transition-opacity duration-150 group-hover:opacity-100">
                          <Maximize2 className="h-5 w-5 text-[#f2f2f0]" />
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Detail harga */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm">
                <Target className="h-3.5 w-3.5 text-muted-foreground" />
                {t("trades.detail")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <DetailItem label={t("trades.entry")} value={formatPrice(trade.entry_price, trade.instrument)} />
                <DetailItem label={t("trades.stopLoss")} value={formatPrice(trade.stop_loss, trade.instrument)} tone="loss" />
                <DetailItem label={t("trades.takeProfit")} value={formatPrice(trade.take_profit, trade.instrument)} tone="profit" />
                <DetailItem label={t("trades.exit")} value={formatPrice(trade.exit_price, trade.instrument)} />
              </div>
              <Separator />
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <DetailItem label={t("trades.size")} value={trade.position_size?.toString() ?? "—"} />
                <DetailItem
                  label={t("trades.session")}
                  value={t(SESSION_KEYS[trade.session] ?? "analytics.sessionOther")}
                  hint={sessionRangeLabel(trade.session)}
                />
                <DetailItem label={t("trades.account")} value={account?.name ?? "—"} />
                <DetailItem label={t("trades.strategy")} value={activeStrategy?.name ?? "—"} />
              </div>

              {trade.exit_reason && (
                <>
                  <Separator />
                  <div>
                    <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
                      {t("trades.exitReason")}
                    </p>
                    <p className="mt-1 text-sm">{trade.exit_reason}</p>
                  </div>
                </>
              )}

              {trade.notes && (
                <>
                  <Separator />
                  <div>
                    <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
                      {t("trades.notes")}
                    </p>
                    <p className="mt-1 whitespace-pre-wrap text-sm leading-relaxed text-foreground/90">
                      {trade.notes}
                    </p>
                  </div>
                </>
              )}

              {trade.tags.length > 0 && (
                <>
                  <Separator />
                  <div className="flex flex-wrap gap-1.5">
                    {trade.tags.map((tag) => (
                      <Badge key={tag} variant="muted" className="text-[10px]">
                        #{tag}
                      </Badge>
                    ))}
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Jurnal terkait */}
          <Card>
            <CardHeader className="flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm">{t("trades.relatedJournal")}</CardTitle>
              <Button asChild variant="ghost" size="sm" className="h-7 text-xs">
                <Link href={`/journal/new?trade=${trade.id}`}>
                  {t("trades.addJournal")}
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              {journals.length === 0 ? (
                <p className="py-4 text-center text-xs text-muted-foreground">{t("trades.noJournal")}</p>
              ) : (
                <div className="space-y-3">
                  {journals.map((journal) => (
                    <div key={journal.id} className="rounded-lg border border-border/70 bg-muted/20 p-3">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm font-medium">{journal.title ?? t("journal.title")}</p>
                        <span className="shrink-0 text-[10px] text-muted-foreground">
                          {new Date(journal.journal_date).toLocaleDateString(
                            locale === "id" ? "id-ID" : "en-US",
                            { day: "numeric", month: "short" },
                          )}
                        </span>
                      </div>
                      {journal.lesson_learned && (
                        <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
                          <span className="font-medium text-foreground/80">{t("journal.lesson")}: </span>
                          {journal.lesson_learned}
                        </p>
                      )}
                      {journalEmotions.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {emotions
                            .filter((e) => journal.emotion_ids.includes(e.id))
                            .map((e) => (
                              <span
                                key={e.id}
                                className="rounded border px-1.5 py-0.5 text-[10px] font-medium"
                                style={{
                                  color: e.color,
                                  borderColor: `${e.color}40`,
                                  backgroundColor: `${e.color}15`,
                                }}
                              >
                                {e.name}
                              </span>
                            ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Kolom kanan */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm">
                <Wallet className="h-3.5 w-3.5 text-muted-foreground" />
                {t("trades.account")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {account ? (
                <>
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: account.color }} />
                    <Link href="/accounts" className="text-sm font-medium hover:underline">
                      {account.name}
                    </Link>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <p className="text-[10px] uppercase text-muted-foreground">{t("accounts.broker")}</p>
                      <p className="mt-0.5">{account.broker ?? "—"}</p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase text-muted-foreground">{t("accounts.currency")}</p>
                      <p className="mt-0.5">{account.currency}</p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase text-muted-foreground">{t("accounts.initialBalance")}</p>
                      <p className="mt-0.5 tabular">
                        {hideAmounts ? "•••" : formatSignedCurrency(account.initial_balance, account.currency)}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase text-muted-foreground">{t("accounts.status")}</p>
                      <p className="mt-0.5 capitalize">{account.status}</p>
                    </div>
                  </div>
                </>
              ) : (
                <p className="text-xs text-muted-foreground">{t("common.none")}</p>
              )}
            </CardContent>
          </Card>

          <Card className="border-[#1a1a1a] bg-[#090909]">
            <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-sm font-semibold">{t("trades.strategy")}</CardTitle>
              <Badge variant="outline" className="border-[#262626] bg-[#141414] text-[10px] text-[#8c8c8c]">
                Quick Assign
              </Badge>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-1.5">
                <Select
                  value={selectedStrategyId ?? "none"}
                  onValueChange={handleStrategyChange}
                  disabled={isUpdatingStrategy}
                >
                  <SelectTrigger className="h-9 w-full border-[#262626] bg-[#141414] text-xs focus:ring-1 focus:ring-[#b2ff05]">
                    <SelectValue placeholder="Pilih Strategi..." />
                  </SelectTrigger>
                  <SelectContent className="border-[#262626] bg-[#141414] text-foreground">
                    <SelectItem value="none" className="text-xs text-muted-foreground">
                      — Tanpa Strategi —
                    </SelectItem>
                    {strategies.map((s) => (
                      <SelectItem key={s.id} value={s.id} className="text-xs">
                        <div className="flex items-center gap-2">
                          <span className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: s.color }} />
                          <span className="truncate">{s.name}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {activeStrategy ? (
                <div className="space-y-2 pt-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: activeStrategy.color }} />
                      <Link href="/strategies" className="text-xs font-semibold hover:underline text-[#f2f2f0]">
                        {activeStrategy.name}
                      </Link>
                    </div>
                  </div>
                  {activeStrategy.description && (
                    <p className="text-[11px] leading-relaxed text-[#8c8c8c]">
                      {activeStrategy.description}
                    </p>
                  )}
                  {activeStrategy.checklist && activeStrategy.checklist.length > 0 && (
                    <div className="space-y-1.5 border-t border-[#1a1a1a] pt-2">
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-[#5c5c5c]">
                        {t("strategies.checklist")}
                      </p>
                      {activeStrategy.checklist.slice(0, 4).map((item) => (
                        <p key={item.id} className="flex items-start gap-1.5 text-[11px] text-[#a0a0a0]">
                          <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full" style={{ backgroundColor: activeStrategy.color }} />
                          <span>{item.text}</span>
                        </p>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-[11px] text-[#5c5c5c]">
                  Pilih salah satu strategi di atas untuk mengelompokkan winrate dan statistik trade ini.
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">{t("analytics.overview")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2.5 text-xs">
              <Row label={t("trades.result")} value={<ResultBadge result={trade.result} />} />
              <Row label={t("trades.status")} value={trade.status === "closed" ? t("trades.closed") : t("trades.open")} />
              <Row label={t("trades.duration")} value={duration ?? "—"} />
              <Row
                label={t("trades.entry")}
                value={<span className="tabular font-mono">{formatPrice(trade.entry_price, trade.instrument)}</span>}
              />
              <Row
                label={t("trades.exit")}
                value={<span className="tabular font-mono">{formatPrice(trade.exit_price, trade.instrument)}</span>}
              />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Zoom modal */}
      {zoom && (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center bg-black/90 p-4 backdrop-blur"
          onClick={() => setZoom(null)}
        >
          <div className="absolute right-4 top-4 flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
            <Button variant="secondary" size="icon-sm" onClick={() => setZoomLevel((z) => Math.max(1, z - 0.25))}>
              <ZoomOut className="h-4 w-4" />
            </Button>
            <span className="tabular min-w-12 text-center text-xs text-white/70">{Math.round(zoomLevel * 100)}%</span>
            <Button variant="secondary" size="icon-sm" onClick={() => setZoomLevel((z) => Math.min(4, z + 0.25))}>
              <ZoomIn className="h-4 w-4" />
            </Button>
            <Button variant="secondary" size="icon-sm" onClick={() => setZoom(null)}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={zoom.url}
            alt={zoom.label}
            className="max-h-[88vh] max-w-[92vw] cursor-zoom-in rounded-lg object-contain transition-transform"
            style={{ transform: `scale(${zoomLevel})` }}
            onClick={(e) => {
              e.stopPropagation();
              setZoomLevel((z) => (z >= 4 ? 1 : z + 0.5));
            }}
          />
        </div>
      )}
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="text-right">
      <p className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="tabular mt-0.5 text-sm font-medium">{value}</p>
    </div>
  );
}

function DetailItem({
  label,
  value,
  hint,
  tone,
}: {
  label: string;
  value: string;
  hint?: string;
  tone?: "profit" | "loss";
}) {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</p>
      <p
        className={cn(
          "tabular mt-0.5 font-mono text-sm",
          tone === "profit" && "text-profit",
          tone === "loss" && "text-loss",
        )}
      >
        {value}
      </p>
      {hint && (
        <p className="tabular font-mono text-[10px] text-muted-foreground/60">{hint}</p>
      )}
    </div>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}

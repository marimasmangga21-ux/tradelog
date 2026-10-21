"use client";

import * as React from "react";
import { toPng } from "html-to-image";
import {
  Check,
  Copy,
  Download,
  Eye,
  EyeOff,
  Loader2,
  Share2,
} from "lucide-react";
import { toast } from "sonner";
import { useI18n } from "@/components/providers/i18n-provider";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Logo } from "@/components/brand/logo";
import {
  formatPercent,
  formatR,
  formatRatio,
  formatSignedCurrency,
  scoreColor,
} from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Currency } from "@/lib/types";

export interface PerformanceSnapshotData {
  netPnl: number;
  winRate: number;
  profitFactor: number | null;
  expectancy: number;
  maxDrawdownPercent: number;
  consistency: number;
  score: number;
  totalTrades: number;
  avgRr: number;
  wins: number;
  losses: number;
  breakevens: number;
}

/** Snapshot performa harian/periodik â€” PNG siap posting. */
export function PerformanceSnapshotDialog({
  data,
  periodLabel,
  currency,
  hideAmounts,
  children,
}: {
  data: PerformanceSnapshotData;
  periodLabel: string;
  currency: Currency;
  hideAmounts: boolean;
  children: React.ReactNode;
}) {
  const { t } = useI18n();
  const [open, setOpen] = React.useState(false);
  const [hide, setHide] = React.useState(hideAmounts);
  const [generating, setGenerating] = React.useState(false);
  const [dataUrl, setDataUrl] = React.useState<string | null>(null);
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!open) setDataUrl(null);
  }, [open]);
  React.useEffect(() => setDataUrl(null), [hide]);

  async function generate(): Promise<string | null> {
    if (!ref.current) return null;
    setGenerating(true);
    try {
      const url = await toPng(ref.current, {
        cacheBust: true,
        pixelRatio: 2,
        backgroundColor: "#0B0E14",
      });
      setDataUrl(url);
      return url;
    } catch {
      toast.error(t("snapshot.generatingFailed"));
      return null;
    } finally {
      setGenerating(false);
    }
  }

  async function handleDownload() {
    const url = dataUrl ?? (await generate());
    if (!url) return;
    const a = document.createElement("a");
    a.href = url;
    a.download = `tradelog-performa-${periodLabel.replace(/\s+/g, "-").toLowerCase()}.png`;
    a.click();
    toast.success(t("snapshot.downloadSuccess"));
  }

  async function handleCopy() {
    const url = dataUrl ?? (await generate());
    if (!url) return;
    try {
      const blob = await (await fetch(url)).blob();
      await navigator.clipboard.write([
        new ClipboardItem({ "image/png": blob }),
      ]);
      toast.success(t("snapshot.copiedToast"));
    } catch {
      toast.error(t("snapshot.copyFailed"));
    }
  }

  const pnlLabel = hide
    ? formatPercent(
        data.totalTrades > 0
          ? (data.netPnl / Math.max(1, Math.abs(data.netPnl) + 1000)) * 100
          : 0,
        1,
        true,
      )
    : formatSignedCurrency(data.netPnl, currency);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="h-4 w-4 text-primary" />
            {t("snapshot.performanceSnapshot")}
          </DialogTitle>
          <DialogDescription>{t("snapshot.subtitle")}</DialogDescription>
        </DialogHeader>

        <div className="flex items-center justify-between rounded-lg border border-border/70 bg-muted/20 px-3 py-2">
          <div className="flex items-center gap-2">
            {hide ? (
              <EyeOff className="h-3.5 w-3.5 text-muted-foreground" />
            ) : (
              <Eye className="h-3.5 w-3.5 text-muted-foreground" />
            )}
            <Label htmlFor="perf-hide" className="cursor-pointer text-xs">
              {t("snapshot.hideAmounts")}
            </Label>
          </div>
          <Switch id="perf-hide" checked={hide} onCheckedChange={setHide} />
        </div>

        <div className="overflow-hidden rounded-xl border border-border/70">
          <div ref={ref} className="snapshot-surface relative w-full p-6">
            <div className="pointer-events-none absolute inset-0 bg-grid opacity-[0.25]" />
            <div className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-emerald-500/10 blur-3xl" />

            <div className="relative">
              <div className="flex items-start justify-between">
                <Logo />
                <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[10px] font-medium text-white/60">
                  {periodLabel}
                </span>
              </div>

              <div className="mt-5 flex items-end justify-between gap-4">
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-white/35">
                    {t("analytics.netPnl")}
                  </p>
                  <p
                    className="tabular font-mono mt-1 text-4xl font-bold tracking-tight"
                    style={{
                      color:
                        data.netPnl > 0
                          ? "#22c55e"
                          : data.netPnl < 0
                            ? "#ef4444"
                            : "#94a3b8",
                    }}
                  >
                    {hide ? formatPercent(data.avgRr * 100, 0, true) : pnlLabel}
                  </p>
                  <p className="mt-1 text-[10px] text-white/40">
                    {data.totalTrades} {t("common.trades")} Â· {data.wins}W{" "}
                    {data.losses}L {data.breakevens}BE
                  </p>
                </div>

                <div className="text-right">
                  <p className="text-[10px] uppercase tracking-wider text-white/35">
                    {t("analytics.tradelogScore")}
                  </p>
                  <p
                    className="tabular text-3xl font-semibold leading-none"
                    style={{ color: scoreColor(data.score) }}
                  >
                    {Math.round(data.score)}
                  </p>
                </div>
              </div>

              <div className="mt-5 grid grid-cols-3 gap-2 border-y border-white/10 py-3">
                <SnapMetric
                  label={t("analytics.winRate")}
                  value={formatPercent(data.winRate, 1)}
                />
                <SnapMetric
                  label={t("analytics.profitFactor")}
                  value={formatRatio(data.profitFactor)}
                />
                <SnapMetric
                  label={t("analytics.avgRr")}
                  value={formatR(data.avgRr)}
                />
                <SnapMetric
                  label={t("analytics.expectancy")}
                  value={
                    hide
                      ? formatR(data.avgRr)
                      : formatSignedCurrency(data.expectancy, currency, {
                          compact: true,
                        })
                  }
                />
                <SnapMetric
                  label={t("analytics.maxDrawdown")}
                  value={formatPercent(data.maxDrawdownPercent, 1)}
                />
                <SnapMetric
                  label={t("analytics.consistency")}
                  value={formatPercent(data.consistency, 0)}
                />
              </div>

              {/* Bar distribusi hasil */}
              <div className="mt-4 flex h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                {data.wins > 0 && (
                  <span
                    className="h-full bg-[#22c55e]"
                    style={{
                      width: `${(data.wins / Math.max(1, data.totalTrades)) * 100}%`,
                    }}
                  />
                )}
                {data.losses > 0 && (
                  <span
                    className="h-full bg-[#ef4444]"
                    style={{
                      width: `${(data.losses / Math.max(1, data.totalTrades)) * 100}%`,
                    }}
                  />
                )}
                {data.breakevens > 0 && (
                  <span
                    className="h-full bg-[#64748b]"
                    style={{
                      width: `${(data.breakevens / Math.max(1, data.totalTrades)) * 100}%`,
                    }}
                  />
                )}
              </div>

              <div className="mt-3 flex items-center justify-between text-[10px] text-white/30">
                <span>{t("snapshot.watermark")}</span>
                <span>tradelog.app</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
          <Button
            onClick={() => void generate()}
            disabled={generating}
            variant="outline"
            className="w-full px-2 text-[11px]"
          >
            {generating ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Check className="h-4 w-4" />
            )}
            {generating ? t("snapshot.generating") : t("snapshot.generate")}
          </Button>
          <Button
            onClick={() => void handleDownload()}
            disabled={generating}
            className="w-full px-2 text-[11px]"
          >
            <Download className="h-4 w-4" />
            {t("snapshot.download")}
          </Button>
          <Button
            onClick={() => void handleCopy()}
            disabled={generating}
            variant="secondary"
            className="w-full px-2 text-[11px]"
          >
            <Copy className="h-4 w-4" />
            {t("snapshot.copy")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function SnapMetric({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[9px] uppercase tracking-wide text-white/35">
        {label}
      </p>
      <p className={cn("tabular mt-0.5 text-xs font-semibold text-white/85")}>
        {value}
      </p>
    </div>
  );
}

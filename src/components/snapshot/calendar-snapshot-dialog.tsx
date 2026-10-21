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
import { formatPercent, formatSignedCurrency } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Currency } from "@/lib/types";

export interface CalendarDayCell {
  /** Tanggal 1-31 */
  day: number;
  /** Offset kolom (0 = Senin) */
  offset: number;
  pnl: number;
  trades: number;
}

/**
 * Snapshot kalender bulanan â€” PNG siap posting.
 */
export function CalendarSnapshotDialog({
  monthLabel,
  days,
  netPnl,
  tradeCount,
  winRate,
  greenDays,
  redDays,
  currency,
  hideAmounts,
  startBalance = 0,
  accountLabel,
  children,
}: {
  monthLabel: string;
  days: CalendarDayCell[];
  netPnl: number;
  tradeCount: number;
  winRate: number;
  greenDays: number;
  redDays: number;
  currency: Currency;
  hideAmounts: boolean;
  startBalance?: number;
  /** Nama akun yang sedang difilter; kosong = semua akun. */
  accountLabel?: string;
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
    a.download = `tradelog-kalender-${monthLabel.replace(/\s+/g, "-").toLowerCase()}${
      accountLabel ? `-${accountLabel.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}` : ""
    }.png`;
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

  const maxAbs = Math.max(1, ...days.map((d) => Math.abs(d.pnl)));
  const leadingBlanks = days[0]?.offset ?? 0;

  const pnlLabel =
    hide && startBalance > 0
      ? formatPercent((netPnl / startBalance) * 100, 1, true)
      : hide
        ? "â€¢â€¢â€¢"
        : formatSignedCurrency(netPnl, currency);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="h-4 w-4 text-primary" />
            {t("snapshot.calendarSnapshot")}
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
            <Label htmlFor="cal-hide" className="cursor-pointer text-xs">
              {t("snapshot.hideAmounts")}
            </Label>
          </div>
          <Switch id="cal-hide" checked={hide} onCheckedChange={setHide} />
        </div>

        <div className="overflow-hidden rounded-xl border border-border/70">
          <div ref={ref} className="snapshot-surface relative w-full p-6">
            <div className="pointer-events-none absolute inset-0 bg-grid opacity-[0.25]" />
            <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-emerald-500/10 blur-3xl" />

            <div className="relative">
              <div className="flex items-start justify-between">
                <div>
                  <Logo />
                  <p className="mt-1.5 text-[9px] font-medium uppercase tracking-wider text-white/40">
                    {accountLabel ?? t("calendar.allAccounts")}
                  </p>
                </div>
                <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[10px] font-medium text-white/60">
                  {monthLabel}
                </span>
              </div>

              <div className="mt-5">
                <p className="text-[10px] uppercase tracking-wider text-white/35">
                  {t("calendar.monthTotal")}
                </p>
                <p
                  className="tabular font-mono mt-1 text-4xl font-bold tracking-tight"
                  style={{
                    color:
                      netPnl > 0
                        ? "#22c55e"
                        : netPnl < 0
                          ? "#ef4444"
                          : "#94a3b8",
                  }}
                >
                  {hide ? `${pnlLabel}` : pnlLabel}
                </p>
              </div>

              <div className="mt-4 grid grid-cols-4 gap-2 border-y border-white/10 py-3">
                <SnapStat
                  label={t("calendar.tradeCount")}
                  value={String(tradeCount)}
                />
                <SnapStat
                  label={t("calendar.winRate")}
                  value={formatPercent(winRate, 0)}
                />
                <SnapStat
                  label={t("calendar.greenDays")}
                  value={String(greenDays)}
                  tone="profit"
                />
                <SnapStat
                  label={t("calendar.redDays")}
                  value={String(redDays)}
                  tone="loss"
                />
              </div>

              <div className="mt-4 grid grid-cols-7 gap-1">
                {t("calendar.weekdays")
                  .split(",")
                  .map((w) => (
                    <div
                      key={w}
                      className="pb-1 text-center text-[7px] font-medium uppercase text-white/25"
                    >
                      {w.slice(0, 3)}
                    </div>
                  ))}
                {Array.from({ length: leadingBlanks }).map((_, i) => (
                  <div key={`blank-${i}`} />
                ))}
                {days.map((d) => {
                  const intensity = Math.min(1, Math.abs(d.pnl) / maxAbs);
                  const bg =
                    d.pnl > 0
                      ? `rgba(34,197,94,${0.1 + intensity * 0.55})`
                      : d.pnl < 0
                        ? `rgba(239,68,68,${0.1 + intensity * 0.55})`
                        : "rgba(255,255,255,0.04)";
                  return (
                    <div
                      key={d.day}
                      className="flex h-8 flex-col items-center justify-center rounded-[3px] text-[8px]"
                      style={{ backgroundColor: bg }}
                    >
                      <span className="text-[8px] text-white/40">{d.day}</span>
                      {d.trades > 0 && (
                        <span className="tabular font-mono text-[7px] font-medium text-white/80">
                          {d.trades}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="mt-4 flex items-center justify-between text-[10px] text-white/30">
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

function SnapStat({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: "profit" | "loss";
}) {
  return (
    <div>
      <p className="text-[9px] uppercase tracking-wide text-white/35">
        {label}
      </p>
      <p
        className={cn(
          "tabular mt-0.5 text-sm font-semibold",
          tone === "profit"
            ? "text-[#3fce9c]"
            : tone === "loss"
              ? "text-[#ef4444]"
              : "text-white/85",
        )}
      >
        {value}
      </p>
    </div>
  );
}

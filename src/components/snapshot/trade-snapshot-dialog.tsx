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
import { SESSION_LABEL_KEYS } from "@/lib/analytics";
import {
  formatPercent,
  formatPrice,
  formatR,
  formatSignedCurrency,
} from "@/lib/format";
import type { Account, Trade } from "@/lib/types";

/**
 * Snapshot trade siap posting.
 * Menggunakan html-to-image agar hasil PNG konsisten dengan tampilan.
 */
export function TradeSnapshotDialog({
  trade,
  account,
  hideAmounts,
  children,
}: {
  trade: Trade;
  account: Account | null;
  hideAmounts: boolean;
  children: React.ReactNode;
}) {
  const { t, locale } = useI18n();
  const [open, setOpen] = React.useState(false);
  const [hide, setHide] = React.useState(hideAmounts);
  const [generating, setGenerating] = React.useState(false);
  const [dataUrl, setDataUrl] = React.useState<string | null>(null);
  const ref = React.useRef<HTMLDivElement>(null);
  const currency = account?.currency ?? "USD";

  React.useEffect(() => {
    if (!open) setDataUrl(null);
  }, [open]);

  React.useEffect(() => {
    setDataUrl(null);
  }, [hide]);

  async function generate(): Promise<string | null> {
    if (!ref.current) return null;
    setGenerating(true);
    try {
      const url = await toPng(ref.current, {
        cacheBust: true,
        pixelRatio: 2,
        backgroundColor: "#04100d",
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
    a.download = `tradelog-${trade.instrument}-${trade.traded_at.slice(0, 10)}.png`;
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

  const pnlDisplay = hide
    ? formatR(trade.r_multiple)
    : formatSignedCurrency(trade.pnl, currency);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="h-4 w-4 text-primary" />
            {t("snapshot.tradeSnapshot")}
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
            <Label htmlFor="hide-amounts" className="cursor-pointer text-xs">
              {t("snapshot.hideAmounts")}
            </Label>
          </div>
          <Switch id="hide-amounts" checked={hide} onCheckedChange={setHide} />
        </div>

        {/* Preview kanvas */}
        <div className="overflow-hidden rounded-xl border border-border/70">
          <div
            ref={ref}
            className="snapshot-surface relative w-full p-6"
            style={{ aspectRatio: "4 / 3" }}
          >
            <div className="pointer-events-none absolute inset-0 bg-grid opacity-[0.25]" />
            <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-emerald-500/20 blur-3xl" />

            <div className="relative flex h-full flex-col">
              <div className="flex items-start justify-between">
                <Logo />
                <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[10px] font-medium text-white/60">
                  {new Date(trade.traded_at).toLocaleDateString(
                    locale === "id" ? "id-ID" : "en-US",
                    {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    },
                  )}
                </span>
              </div>

              <div className="mt-6 flex items-center gap-2">
                <span className="font-mono text-lg font-semibold text-white">
                  {trade.instrument}
                </span>
                <span
                  className="rounded px-1.5 py-0.5 text-[10px] font-bold uppercase"
                  style={{
                    color: trade.direction === "long" ? "#22c55e" : "#ef4444",
                    backgroundColor:
                      trade.direction === "long" ? "#22c55e20" : "#ef444420",
                  }}
                >
                  {trade.direction}
                </span>
                <span className="rounded bg-white/5 px-1.5 py-0.5 text-[10px] text-white/50">
                  {t(SESSION_LABEL_KEYS[trade.session])}
                </span>
              </div>

              <div className="mt-4 flex flex-1 flex-col justify-center">
                <p
                  className="tabular text-5xl font-semibold tracking-tight"
                  style={{
                    color:
                      trade.pnl > 0
                        ? "#3fce9c"
                        : trade.pnl < 0
                          ? "#ef4444"
                          : "#94a3b8",
                  }}
                >
                  {pnlDisplay}
                </p>
                <p className="mt-1 text-xs text-white/40">
                  {hide
                    ? `${trade.result.toUpperCase()} Â· ${formatR(trade.r_multiple)}`
                    : `${trade.result.toUpperCase()} Â· ${formatR(trade.r_multiple)} Â· ${trade.pnl_percent?.toFixed(2) ?? "0"}%`}
                </p>
              </div>

              <div className="mt-auto grid grid-cols-4 gap-3 border-t border-white/10 pt-4">
                <SnapMetric
                  label="Entry"
                  value={formatPrice(trade.entry_price, trade.instrument)}
                />
                <SnapMetric
                  label="SL"
                  value={formatPrice(trade.stop_loss, trade.instrument)}
                />
                <SnapMetric
                  label="TP"
                  value={formatPrice(trade.take_profit, trade.instrument)}
                />
                <SnapMetric label="R:R" value={formatR(trade.r_multiple)} />
              </div>

              <div className="mt-3 flex items-center justify-between text-[10px] text-white/30">
                <span>
                  {account?.name ?? "Tradelog"}{" "}
                  {account?.broker ? `Â· ${account.broker}` : ""}
                </span>
                <span>{t("snapshot.watermark")}</span>
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
      <p className="tabular mt-0.5 font-mono text-[11px] text-white/80">
        {value}
      </p>
    </div>
  );
}

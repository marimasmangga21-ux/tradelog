"use client";

import * as React from "react";
import { ArrowDownRight, ArrowUpRight, Minus, Zap } from "lucide-react";
import { useI18n } from "@/components/providers/i18n-provider";
import { cn } from "@/lib/utils";
import type { TradeResult } from "@/lib/types";

const RESULT_STYLES: Record<TradeResult, string> = {
  win: "border-emerald-500/30 bg-emerald-500/15 text-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.15)]",
  loss: "border-red-500/30 bg-red-500/15 text-red-400 shadow-[0_0_8px_rgba(239,68,68,0.15)]",
  breakeven: "border-amber-500/30 bg-amber-500/15 text-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.15)]",
  open: "border-sky-500/30 bg-sky-500/15 text-sky-400 shadow-[0_0_8px_rgba(14,165,233,0.15)]",
};

export function ResultBadge({
  result,
  className,
  showIcon = true,
}: {
  result: TradeResult;
  className?: string;
  showIcon?: boolean;
}) {
  const { t } = useI18n();
  const Icon = result === "win" ? ArrowUpRight : result === "loss" ? ArrowDownRight : result === "breakeven" ? Minus : Zap;

  const label = {
    win: t("trades.win"),
    loss: t("trades.loss"),
    breakeven: t("trades.breakeven"),
    open: t("trades.open"),
  }[result];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[11px] font-bold tracking-tight uppercase",
        RESULT_STYLES[result],
        className,
      )}
    >
      {showIcon && <Icon className="h-3 w-3" strokeWidth={2.5} />}
      <span>{label}</span>
    </span>
  );
}

export function DirectionBadge({
  direction,
  className,
}: {
  direction: "long" | "short";
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wide",
        direction === "long"
          ? "border-emerald-500/35 bg-emerald-500/15 text-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.12)]"
          : "border-red-500/35 bg-red-500/15 text-red-400 shadow-[0_0_8px_rgba(239,68,68,0.12)]",
        className,
      )}
    >
      {direction === "long" ? (
        <ArrowUpRight className="h-3 w-3 stroke-[3]" />
      ) : (
        <ArrowDownRight className="h-3 w-3 stroke-[3]" />
      )}
      <span>{direction.toUpperCase()}</span>
    </span>
  );
}

function getAssetColor(instrument: string): string {
  const upper = instrument.toUpperCase();
  if (upper.includes("BTC")) return "#f7931a";
  if (upper.includes("ETH")) return "#627eea";
  if (upper.includes("SOL")) return "#14f195";
  if (upper.includes("XAU") || upper.includes("GOLD")) return "#eab308";
  if (upper.includes("EUR")) return "#3b82f6";
  if (upper.includes("GBP")) return "#a855f7";
  if (upper.includes("JPY")) return "#ef4444";
  if (upper.includes("NAS") || upper.includes("US100") || upper.includes("NDX")) return "#06b6d4";
  return "#b2ff05";
}

export function InstrumentBadge({ instrument, className }: { instrument: string; className?: string }) {
  const dotColor = getAssetColor(instrument);
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md border border-[#27272a] bg-[#121215] px-2 py-0.5 font-mono text-[11px] font-bold tracking-tight text-[#f4f4f5]",
        className,
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full shrink-0" style={{ backgroundColor: dotColor }} />
      <span>{instrument}</span>
    </span>
  );
}

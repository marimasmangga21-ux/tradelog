"use client";

import * as React from "react";
import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";
import { useI18n } from "@/components/providers/i18n-provider";
import { cn } from "@/lib/utils";
import type { TradeResult } from "@/lib/types";

const RESULT_STYLES: Record<TradeResult, string> = {
  win: "border-profit/30 bg-profit/10 text-profit",
  loss: "border-loss/30 bg-loss/10 text-loss",
  breakeven: "border-warning/30 bg-warning/10 text-warning",
  open: "border-blue-500/30 bg-blue-500/10 text-blue-400",
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
  const Icon = result === "win" ? ArrowUpRight : result === "loss" ? ArrowDownRight : Minus;

  const label = {
    win: t("trades.win"),
    loss: t("trades.loss"),
    breakeven: t("trades.breakeven"),
    open: t("trades.open"),
  }[result];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-[11px] font-medium",
        RESULT_STYLES[result],
        className,
      )}
    >
      {showIcon && <Icon className="h-3 w-3" strokeWidth={2.5} />}
      {label}
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
        "inline-flex items-center gap-1 rounded border px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
        direction === "long"
          ? "border-profit/25 bg-profit/10 text-profit"
          : "border-loss/25 bg-loss/10 text-loss",
        className,
      )}
    >
      {direction === "long" ? (
        <ArrowUpRight className="h-2.5 w-2.5" strokeWidth={3} />
      ) : (
        <ArrowDownRight className="h-2.5 w-2.5" strokeWidth={3} />
      )}
      {direction}
    </span>
  );
}

export function InstrumentBadge({ instrument, className }: { instrument: string; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md border border-[#222228] bg-[#0c0c0e] px-2 py-0.5 font-mono text-[11px] font-bold tracking-tight text-[#f4f4f5]",
        className,
      )}
    >
      {instrument}
    </span>
  );
}

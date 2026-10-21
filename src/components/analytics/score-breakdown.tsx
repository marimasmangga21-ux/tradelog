"use client";

import * as React from "react";
import { useI18n } from "@/components/providers/i18n-provider";
import { cn } from "@/lib/utils";
import { scoreColor } from "@/lib/format";
import { scoreLabel } from "@/lib/analytics-labels";
import type { ScoreComponent } from "@/lib/types";

export function ScoreBreakdown({ breakdown, className }: { breakdown: ScoreComponent[]; className?: string }) {
  const { t } = useI18n();

  return (
    <div className={cn("space-y-3", className)}>
      {breakdown.map((c) => (
        <div key={c.key} className="space-y-1.5">
          <div className="flex items-baseline justify-between gap-2 text-xs">
            <span className="text-muted-foreground">
              {scoreLabel(t, c.key, c.label)}
              <span className="ml-1 text-[10px] opacity-60">· {c.weight}%</span>
            </span>
            <span className="tabular font-medium text-foreground">
              {c.raw}
              <span className="ml-1.5 text-[10px] text-muted-foreground">
                {c.score.toFixed(0)}/100
              </span>
            </span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{
                width: `${Math.max(2, Math.min(100, c.score))}%`,
                backgroundColor: scoreColor(c.score),
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

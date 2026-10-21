"use client";

import * as React from "react";
import { PolarAngleAxis, PolarGrid, Radar, RadarChart, ResponsiveContainer } from "recharts";
import { useI18n } from "@/components/providers/i18n-provider";
import { cn } from "@/lib/utils";
import { scoreColor, scoreLabelKey } from "@/lib/format";
import { scoreLabel } from "@/lib/analytics-labels";
import type { ScoreComponent } from "@/lib/types";

/** Gauge setengah lingkaran SVG untuk Skor Tradelog. */
export function ScoreGauge({
  score,
  size = 180,
  strokeWidth = 12,
  showLabel = true,
  className,
}: {
  score: number;
  size?: number;
  strokeWidth?: number;
  showLabel?: boolean;
  className?: string;
}) {
  const { t } = useI18n();
  const color = scoreColor(score);
  const radius = (size - strokeWidth) / 2;
  const circumference = Math.PI * radius;
  const progress = Math.max(0, Math.min(100, score)) / 100;

  return (
    <div className={cn("relative inline-flex flex-col items-center", className)}>
      <svg width={size} height={size / 2 + strokeWidth} viewBox={`0 0 ${size} ${size / 2 + strokeWidth}`}>
        <defs>
          <linearGradient id={`gauge-${Math.round(score)}`} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#10b981" />
            <stop offset="60%" stopColor={color} />
            <stop offset="100%" stopColor="#06b6d4" />
          </linearGradient>
        </defs>
        <path
          d={`M ${strokeWidth / 2} ${size / 2} A ${radius} ${radius} 0 0 1 ${size - strokeWidth / 2} ${size / 2}`}
          fill="none"
          stroke="hsl(var(--muted))"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />
        <path
          d={`M ${strokeWidth / 2} ${size / 2} A ${radius} ${radius} 0 0 1 ${size - strokeWidth / 2} ${size / 2}`}
          fill="none"
          stroke={`url(#gauge-${Math.round(score)})`}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={`${circumference * progress} ${circumference}`}
          style={{ transition: "stroke-dasharray 900ms cubic-bezier(0.16,1,0.3,1)" }}
        />
      </svg>

      <div className="-mt-1 flex flex-col items-center">
        <span className="tabular font-mono text-4xl font-bold leading-none tracking-tight" style={{ color }}>
          {Math.round(score)}
        </span>
        {showLabel && (
          <span className="mt-1 text-[11px] font-medium text-muted-foreground">
            {t(scoreLabelKey(score))}
          </span>
        )}
      </div>
    </div>
  );
}

/** Radar profil performa dari komponen skor. */
export function ScoreRadar({
  breakdown,
  className,
  height = 240,
}: {
  breakdown: ScoreComponent[];
  className?: string;
  height?: number;
}) {
  const { t } = useI18n();
  const data = breakdown.map((c) => ({
    metric: scoreLabel(t, c.key, c.label),
    score: c.score,
    fullMark: 100,
  }));

  return (
    <div className={cn("w-full", className)} style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={data} outerRadius="72%">
          <PolarGrid stroke="hsl(var(--border))" />
          <PolarAngleAxis
            dataKey="metric"
            tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }}
          />
          <Radar
            name="Score"
            dataKey="score"
            stroke="#10b981"
            fill="#10b981"
            fillOpacity={0.25}
            strokeWidth={1.5}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}

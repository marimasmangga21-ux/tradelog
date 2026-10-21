"use client";

import * as React from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useI18n } from "@/components/providers/i18n-provider";
import { formatCompact, formatCurrency, formatPercent } from "@/lib/format";
import type { Currency } from "@/lib/types";
import type { EquityPoint } from "@/lib/analytics";

const AXIS_STYLE = {
  stroke: "hsl(var(--border))",
  tick: { fill: "hsl(var(--muted-foreground))", fontSize: 10 },
};

function ChartTooltip({
  active,
  payload,
  label,
  currency,
  hideAmounts,
}: {
  active?: boolean;
  payload?: { value: number; name: string; color?: string; payload?: Record<string, unknown> }[];
  label?: string;
  currency: Currency;
  hideAmounts?: boolean;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-border bg-popover px-3 py-2 text-xs shadow-xl">
      {label && <p className="mb-1 font-medium text-foreground">{label}</p>}
      {payload.map((p, i) => (
        <p key={i} className="tabular text-muted-foreground">
          {p.name}:{" "}
          <span className="font-medium text-foreground">
            {hideAmounts
              ? formatCompact(p.value)
              : formatCurrency(p.value, currency, { compact: true })}
          </span>
        </p>
      ))}
    </div>
  );
}

export function EquityCurveChart({
  data,
  currency,
  height = 260,
  hideAmounts,
}: {
  data: EquityPoint[];
  currency: Currency;
  height?: number;
  hideAmounts?: boolean;
}) {
  const { t } = useI18n();
  if (data.length === 0) {
    return (
      <div className="flex h-[220px] items-center justify-center text-xs text-muted-foreground">
        {t("analytics.noData")}
      </div>
    );
  }

  const isPositive = data[data.length - 1].equity >= data[0].equity;
  const stroke = isPositive ? "#22c55e" : "#ef4444";

  return (
    <div style={{ height }} className="w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 6, right: 6, left: -18, bottom: 0 }}>
          <defs>
            <linearGradient id="equity-fill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={stroke} stopOpacity={0.35} />
              <stop offset="100%" stopColor={stroke} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
          <XAxis
            dataKey="label"
            {...AXIS_STYLE}
            axisLine={false}
            tickLine={false}
            minTickGap={28}
            tickFormatter={(v: string) => (v.length > 10 ? v.slice(5) : v)}
          />
          <YAxis
            {...AXIS_STYLE}
            axisLine={false}
            tickLine={false}
            width={56}
            tickFormatter={(v: number) => formatCompact(v)}
          />
          <Tooltip
            content={<ChartTooltip currency={currency} hideAmounts={hideAmounts} />}
            cursor={{ stroke: "hsl(var(--border))", strokeDasharray: "3 3" }}
          />
          <Area
            type="monotone"
            dataKey="equity"
            name={t("analytics.equityCurve")}
            stroke={stroke}
            strokeWidth={1.8}
            fill="url(#equity-fill)"
            dot={false}
            isAnimationActive={false}
            activeDot={{ r: 3, strokeWidth: 0, fill: stroke }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export function ResultDonut({
  wins,
  losses,
  breakevens,
  height = 200,
}: {
  wins: number;
  losses: number;
  breakevens: number;
  height?: number;
}) {
  const { t } = useI18n();
  const total = wins + losses + breakevens;

  const data = [
    { name: t("trades.win"), value: wins, color: "#22c55e" },
    { name: t("trades.loss"), value: losses, color: "#ef4444" },
    { name: t("trades.breakeven"), value: breakevens, color: "#f59e0b" },
  ].filter((d) => d.value > 0);

  if (total === 0) {
    return (
      <div className="flex items-center justify-center text-xs text-muted-foreground" style={{ height }}>
        {t("analytics.noData")}
      </div>
    );
  }

  return (
    <div className="relative" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            innerRadius="62%"
            outerRadius="88%"
            paddingAngle={2}
            strokeWidth={0}
            isAnimationActive={false}
          >
            {data.map((entry) => (
              <Cell key={entry.name} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            content={({ active, payload }) =>
              active && payload?.length ? (
                <div className="rounded-lg border border-border bg-popover px-3 py-2 text-xs shadow-xl">
                  <p className="font-medium text-foreground">{payload[0].name}</p>
                  <p className="tabular text-muted-foreground">
                    {payload[0].value} · {formatPercent(((payload[0].value as number) / total) * 100, 1)}
                  </p>
                </div>
              ) : null
            }
          />
        </PieChart>
      </ResponsiveContainer>
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
        <span className="tabular text-2xl font-semibold">{total}</span>
        <span className="text-[10px] uppercase tracking-wide text-muted-foreground">
          {t("analytics.totalTrades")}
        </span>
      </div>
    </div>
  );
}

export function SessionBarChart({
  data,
  height = 220,
}: {
  data: { label: string; netPnl: number; trades: number }[];
  height?: number;
}) {
  const { t } = useI18n();
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center text-xs text-muted-foreground" style={{ height }}>
        {t("analytics.noData")}
      </div>
    );
  }

  return (
    <div style={{ height }} className="w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 6, right: 6, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
          <XAxis dataKey="label" {...AXIS_STYLE} axisLine={false} tickLine={false} />
          <YAxis
            {...AXIS_STYLE}
            axisLine={false}
            tickLine={false}
            width={52}
            tickFormatter={(v: number) => formatCompact(v)}
          />
          <Tooltip
            cursor={{ fill: "hsl(var(--muted) / 0.4)" }}
            content={({ active, payload, label }) =>
              active && payload?.length ? (
                <div className="rounded-lg border border-border bg-popover px-3 py-2 text-xs shadow-xl">
                  <p className="font-medium text-foreground">{label}</p>
                  <p className="tabular text-muted-foreground">
                    PnL: {formatCompact(payload[0].value as number)}
                  </p>
                </div>
              ) : null
            }
          />
          <Bar dataKey="netPnl" radius={[4, 4, 0, 0]} maxBarSize={44}>
            {data.map((d, i) => (
              <Cell key={i} fill={d.netPnl >= 0 ? "#22c55e" : "#ef4444"} fillOpacity={0.85} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function WinRateBarChart({
  data,
  height = 240,
}: {
  data: { label: string; winRate: number; trades: number; netPnl: number }[];
  height?: number;
}) {
  const { t } = useI18n();
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center text-xs text-muted-foreground" style={{ height }}>
        {t("analytics.noData")}
      </div>
    );
  }

  return (
    <div style={{ height }} className="w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ top: 4, right: 20, left: 4, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
          <XAxis type="number" domain={[0, 100]} {...AXIS_STYLE} axisLine={false} tickLine={false} unit="%" />
          <YAxis
            type="category"
            dataKey="label"
            {...AXIS_STYLE}
            axisLine={false}
            tickLine={false}
            width={78}
          />
          <Tooltip
            cursor={{ fill: "hsl(var(--muted) / 0.4)" }}
            content={({ active, payload, label }) =>
              active && payload?.length ? (
                <div className="rounded-lg border border-border bg-popover px-3 py-2 text-xs shadow-xl">
                  <p className="font-medium text-foreground">{label}</p>
                  <p className="tabular text-muted-foreground">
                    {formatPercent(payload[0].value as number, 1)} · {data.find((d) => d.label === label)?.trades ?? 0}{" "}
                    {t("common.trades")}
                  </p>
                </div>
              ) : null
            }
          />
          <Bar dataKey="winRate" radius={[0, 4, 4, 0]} maxBarSize={20}>
            {data.map((d, i) => (
              <Cell
                key={i}
                fill={d.winRate >= 50 ? "#22c55e" : d.winRate >= 40 ? "#eab308" : "#ef4444"}
                fillOpacity={0.85}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function DirectionCompareChart({
  long,
  short,
  height = 180,
}: {
  long: { netPnl: number; winRate: number; trades: number };
  short: { netPnl: number; winRate: number; trades: number };
  height?: number;
}) {
  const { t } = useI18n();
  const data = [
    { label: t("analytics.long"), ...long },
    { label: t("analytics.short"), ...short },
  ];

  return (
    <div style={{ height }} className="w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 6, right: 6, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
          <XAxis dataKey="label" {...AXIS_STYLE} axisLine={false} tickLine={false} />
          <YAxis {...AXIS_STYLE} axisLine={false} tickLine={false} width={52} tickFormatter={formatCompact} />
          <Tooltip
            cursor={{ fill: "hsl(var(--muted) / 0.4)" }}
            content={({ active, payload, label }) =>
              active && payload?.length ? (
                <div className="rounded-lg border border-border bg-popover px-3 py-2 text-xs shadow-xl">
                  <p className="font-medium text-foreground">{label}</p>
                  <p className="tabular text-muted-foreground">PnL: {formatCompact(payload[0].value as number)}</p>
                </div>
              ) : null
            }
          />
          <Bar dataKey="netPnl" radius={[4, 4, 0, 0]} maxBarSize={56}>
            {data.map((d, i) => (
              <Cell key={i} fill={d.netPnl >= 0 ? "#22c55e" : "#ef4444"} fillOpacity={0.85} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

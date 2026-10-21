import * as React from "react";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function StatCard({
  label,
  value,
  hint,
  delta,
  icon: Icon,
  tone = "default",
  className,
  valueClassName,
  isBig = false,
}: {
  label: string;
  value: React.ReactNode;
  hint?: React.ReactNode;
  delta?: { value: number; label?: string };
  icon?: React.ElementType;
  tone?: "default" | "profit" | "loss" | "warning";
  className?: string;
  valueClassName?: string;
  isBig?: boolean;
}) {
  const toneRing = {
    default: "text-muted-foreground",
    profit: "text-profit",
    loss: "text-loss",
    warning: "text-warning",
  }[tone];

  return (
    <Card className={cn("group relative overflow-hidden p-5 sm:p-6 transition-all hover:border-border", className)}>
      <div className="flex items-start justify-between gap-2">
        <p className="line-clamp-2 min-h-[1.5rem] text-xs font-medium uppercase tracking-wider text-muted-foreground">
          {label}
        </p>
        {Icon && <Icon className={cn("mt-0.5 h-4 w-4 shrink-0", toneRing)} strokeWidth={1.75} />}
      </div>
      <div className="mt-2 flex items-baseline gap-2">
        <p
          className={cn(
            "tabular font-mono tracking-tight",
            isBig ? "text-3xl lg:text-[2.25rem] font-bold" : "text-2xl font-semibold",
            valueClassName,
          )}
        >
          {value}
        </p>
        {delta && (
          <span
            className={cn(
              "text-xs font-medium tabular font-mono",
              delta.value >= 0 ? "text-profit" : "text-loss",
            )}
          >
            {delta.value >= 0 ? "+" : "−"}{Math.abs(delta.value).toFixed(1)}
            {delta.label ?? "%"}
          </span>
        )}
      </div>
      {hint && (
        <p className="mt-1.5 min-h-[1rem] truncate text-xs text-muted-foreground">{hint}</p>
      )}
    </Card>
  );
}

export function StatCardSkeleton() {
  return (
    <Card className="p-4">
      <Skeleton className="h-3 w-20" />
      <Skeleton className="mt-3 h-6 w-28" />
      <Skeleton className="mt-2 h-3 w-16" />
    </Card>
  );
}

export function StatsGrid({
  children,
  columns = 4,
  className,
}: {
  children: React.ReactNode;
  columns?: 2 | 3 | 4 | 5;
  className?: string;
}) {
  const cols = {
    2: "grid-cols-2",
    3: "grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-2 lg:grid-cols-4",
    5: "grid-cols-2 lg:grid-cols-5",
  }[columns];
  return <div className={cn("grid gap-4 lg:gap-5", cols, className)}>{children}</div>;
}

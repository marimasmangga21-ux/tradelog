"use client";

import * as React from "react";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

/** Segmented control aksesibel untuk pilihan cepat (Long/Short, hasil, sesi). */
export function Segmented<T extends string>({
  value,
  onChange,
  options,
  className,
  size = "md",
  columns,
}: {
  value: T;
  onChange: (value: T) => void;
  options: { value: T; label: React.ReactNode; color?: string; icon?: React.ElementType }[];
  className?: string;
  size?: "sm" | "md";
  columns?: number;
}) {
  return (
    <div
      className={cn(
        "grid gap-1 rounded-lg border border-border/70 bg-muted/30 p-1",
        className,
      )}
      style={{ gridTemplateColumns: `repeat(${columns ?? options.length}, minmax(0, 1fr))` }}
      role="radiogroup"
    >
      {options.map((option) => {
        const active = option.value === value;
        const Icon = option.icon;
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(option.value)}
            className={cn(
              "flex items-center justify-center gap-1.5 rounded-md font-medium transition-all",
              size === "sm" ? "px-2 py-1.5 text-[11px]" : "px-2.5 py-2 text-xs",
              active
                ? "bg-card text-foreground shadow-sm ring-1 ring-border"
                : "text-muted-foreground hover:text-foreground",
            )}
            style={active && option.color ? { color: option.color } : undefined}
          >
            {Icon && <Icon className="h-3.5 w-3.5" strokeWidth={2.5} />}
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

export function DirectionPicker({
  value,
  onChange,
  className,
}: {
  value: "long" | "short";
  onChange: (v: "long" | "short") => void;
  className?: string;
}) {
  return (
    <div className={cn("grid grid-cols-2 gap-1 rounded-lg border border-border/70 bg-muted/30 p-1", className)}>
      {(["long", "short"] as const).map((dir) => {
        const active = value === dir;
        const isLong = dir === "long";
        const Icon = isLong ? ArrowUpRight : ArrowDownRight;
        return (
          <button
            key={dir}
            type="button"
            onClick={() => onChange(dir)}
            className={cn(
              "flex items-center justify-center gap-1.5 rounded-md py-2 text-xs font-semibold uppercase tracking-wide transition-all",
              active
                ? isLong
                  ? "bg-profit/15 text-profit ring-1 ring-profit/30"
                  : "bg-loss/15 text-loss ring-1 ring-loss/30"
                : "text-muted-foreground hover:text-foreground",
            )}
            aria-pressed={active}
          >
            <Icon className="h-3.5 w-3.5" strokeWidth={3} />
            {isLong ? "Long" : "Short"}
          </button>
        );
      })}
    </div>
  );
}

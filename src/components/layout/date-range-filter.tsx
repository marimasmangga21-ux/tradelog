"use client";

import * as React from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { CalendarRange, Check } from "lucide-react";
import { useI18n } from "@/components/providers/i18n-provider";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const RANGE_KEYS = [
  { value: "all", labelKey: "analytics.allTime" },
  { value: "30", labelKey: "analytics.last30" },
  { value: "7", labelKey: "analytics.last7" },
  { value: "ytd", labelKey: "analytics.ytd" },
];

export function DateRangeFilter({ className }: { className?: string }) {
  const { t } = useI18n();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentRange = searchParams.get("range") ?? "all";

  function setRange(rangeValue: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (rangeValue === "all") {
      params.delete("range");
    } else {
      params.set("range", rangeValue);
    }
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  }

  const activeOption = RANGE_KEYS.find((r) => r.value === currentRange) ?? RANGE_KEYS[0];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={cn(
          "inline-flex h-9 items-center gap-2 rounded-xl border border-border/70 bg-card/60 px-3 text-xs font-medium text-muted-foreground transition hover:border-border hover:bg-accent/60 hover:text-foreground",
          className,
        )}
      >
        <CalendarRange className="h-3.5 w-3.5 shrink-0 opacity-70" strokeWidth={1.75} />
        <span className="truncate">{t(activeOption.labelKey)}</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-48">
        <DropdownMenuLabel>{t("calendar.title")}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {RANGE_KEYS.map((opt) => (
          <DropdownMenuItem
            key={opt.value}
            onClick={() => setRange(opt.value)}
            className="flex items-center justify-between text-xs"
          >
            <span>{t(opt.labelKey)}</span>
            {currentRange === opt.value && <Check className="h-3.5 w-3.5 text-primary" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

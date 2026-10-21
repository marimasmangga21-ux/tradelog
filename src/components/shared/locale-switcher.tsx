"use client";

import * as React from "react";
import { Languages } from "lucide-react";
import { useI18n } from "@/components/providers/i18n-provider";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { localeLabels, type Locale } from "@/lib/i18n";

export function LocaleSwitcher({
  variant = "outline",
  className,
}: {
  variant?: "outline" | "ghost" | "segmented";
  className?: string;
}) {
  const { locale, setLocale } = useI18n();

  if (variant === "segmented") {
    return (
      <div
        className={cn(
          "inline-flex items-center rounded-lg border border-border/70 bg-muted/40 p-0.5",
          className,
        )}
      >
        {(["id", "en"] as Locale[]).map((code) => (
          <button
            key={code}
            type="button"
            onClick={() => setLocale(code)}
            className={cn(
              "rounded-md px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide transition",
              locale === code
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
            aria-pressed={locale === code}
          >
            {localeLabels[code].short}
          </button>
        ))}
      </div>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={cn(
          "inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition",
          variant === "outline"
            ? "border border-border/70 text-muted-foreground hover:border-border hover:text-foreground"
            : "text-muted-foreground hover:bg-accent hover:text-foreground",
          className,
        )}
      >
        <Languages className="h-3.5 w-3.5" />
        {localeLabels[locale].short}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[10rem]">
        {(["id", "en"] as Locale[]).map((code) => (
          <DropdownMenuItem
            key={code}
            onClick={() => setLocale(code)}
            className={cn(locale === code && "bg-accent/60")}
          >
            <span className="text-sm">{localeLabels[code].flag}</span>
            <span>{localeLabels[code].label}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

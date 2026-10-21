"use client";

import * as React from "react";
import { useI18n } from "@/components/providers/i18n-provider";
import { cn } from "@/lib/utils";
import {
  formatSessionRange,
  isSessionOpen,
  localTimeZoneLabel,
  SESSION_HOURS,
} from "@/lib/sessions";

/**
 * Legenda jam tiap sesi di bawah grafik "Per sesi".
 * Jam mengikuti zona waktu browser; sesi yang sedang buka ditandai titik.
 */
export function SessionHoursLegend() {
  const { t } = useI18n();
  const [tz, setTz] = React.useState<string | undefined>(undefined);
  const [now, setNow] = React.useState<Date | null>(null);

  React.useEffect(() => {
    setTz(Intl.DateTimeFormat().resolvedOptions().timeZone);
    setNow(new Date());
    const id = window.setInterval(() => setNow(new Date()), 30_000);
    return () => window.clearInterval(id);
  }, []);

  const zoneLabel = React.useMemo(() => localTimeZoneLabel(tz), [tz]);

  return (
    <div className="mt-3 border-t border-border/60 pt-2.5">
      <div className="mb-1.5 flex items-center justify-between">
        <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
          Jam sesi
        </p>
        <span className="font-mono text-[10px] text-muted-foreground/70">{zoneLabel}</span>
      </div>
      <div className="grid grid-cols-2 gap-x-3 gap-y-1">
        {SESSION_HOURS.map((session) => {
          const open = now ? isSessionOpen(session, now) : false;
          const range = tz
            ? formatSessionRange(session, tz)
            : { start: "—", end: "—", nextDay: false };
          return (
            <div key={session.value} className="flex items-center gap-1.5">
              <span
                className="h-1.5 w-1.5 shrink-0 rounded-full"
                style={{ backgroundColor: open ? session.color : "#3f3f3f" }}
              />
              <span
                className={cn(
                  "truncate text-[10px]",
                  open ? "font-medium text-foreground" : "text-muted-foreground",
                )}
              >
                {t(session.labelKey)}
              </span>
              <span className="tabular ml-auto shrink-0 font-mono text-[10px] text-muted-foreground">
                {range.start}–{range.end}
                {range.nextDay && (
                  <span className="ml-0.5 align-super text-[8px] opacity-60">+1</span>
                )}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

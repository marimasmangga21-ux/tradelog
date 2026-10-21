"use client";

import * as React from "react";
import type { TradeSession } from "@/lib/types";
import {
  formatSessionRange,
  isSessionOpen,
  localTimeZoneLabel,
  SESSION_HOURS,
} from "@/lib/sessions";

/**
 * Petunjuk jam di bawah pilihan sesi pada form trade.
 * Menampilkan rentang jam sesi yang sedang dipilih, plus penanda kalau
 * sesi itu sedang buka sekarang.
 */
export function SessionTimeHint({ session }: { session: TradeSession }) {
  const [tz, setTz] = React.useState<string | undefined>(undefined);
  const [now, setNow] = React.useState<Date | null>(null);

  React.useEffect(() => {
    setTz(Intl.DateTimeFormat().resolvedOptions().timeZone);
    setNow(new Date());
    const id = window.setInterval(() => setNow(new Date()), 30_000);
    return () => window.clearInterval(id);
  }, []);

  const def = SESSION_HOURS.find((s) => s.value === session);
  if (!def) return null;

  const range = tz
    ? formatSessionRange(def, tz)
    : { start: "—", end: "—", nextDay: false };
  const open = now ? isSessionOpen(def, now) : false;

  return (
    <p className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
      <span
        className="h-1.5 w-1.5 shrink-0 rounded-full"
        style={{ backgroundColor: open ? def.color : "#3f3f3f" }}
      />
      <span className="tabular font-mono">
        {range.start}–{range.end}
        {range.nextDay && <span className="ml-0.5 align-super text-[8px]">+1</span>}
      </span>
      <span className="text-muted-foreground/60">({localTimeZoneLabel(tz)})</span>
      {open && <span className="font-medium" style={{ color: def.color }}>· buka</span>}
    </p>
  );
}

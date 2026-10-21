"use client";

import * as React from "react";
import { Zap } from "lucide-react";
import { useI18n } from "@/components/providers/i18n-provider";
import { cn } from "@/lib/utils";
import {
  formatSessionRange,
  isOverlapOpen,
  isSessionOpen,
  localTimeZoneLabel,
  minutesUntilClose,
  OVERLAP_UTC,
  SESSION_HOURS,
  sessionProgress,
} from "@/lib/sessions";

/**
 * Kartu "Market hours" dengan jam buka/tutup tiap sesi.
 *
 * Semua jam dirender dalam zona waktu browser pengguna, dengan label zona
 * waktu di kanan atas supaya tidak ambigu. Status buka/tutup dihitung ulang
 * tiap 30 detik.
 */
export function MarketHoursCard() {
  const { t } = useI18n();
  const [now, setNow] = React.useState<Date | null>(null);
  const [tz, setTz] = React.useState<string | undefined>(undefined);

  // Render pertama sengaja kosong supaya tidak hydration mismatch
  // (server tidak tahu zona waktu browser).
  React.useEffect(() => {
    setTz(Intl.DateTimeFormat().resolvedOptions().timeZone);
    setNow(new Date());
    const id = window.setInterval(() => setNow(new Date()), 30_000);
    return () => window.clearInterval(id);
  }, []);

  const zoneLabel = React.useMemo(() => localTimeZoneLabel(tz), [tz]);
  const overlap = now ? isOverlapOpen(now) : false;

  const overlapRange = React.useMemo(() => {
    if (!tz) return null;
    const fake = { startUtc: OVERLAP_UTC.start, endUtc: OVERLAP_UTC.end };
    const fmt = (utcHour: number) => {
      const base = new Date();
      const d = new Date(
        Date.UTC(base.getUTCFullYear(), base.getUTCMonth(), base.getUTCDate(), utcHour, 0, 0),
      );
      return d.toLocaleTimeString("en-GB", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
        timeZone: tz,
      });
    };
    return { start: fmt(fake.startUtc), end: fmt(fake.endUtc) };
  }, [tz]);

  return (
    <div className="tradoxes-card relative flex flex-col overflow-hidden rounded-2xl p-4 sm:p-5">
      <div className="flex items-center justify-between pb-2 border-b border-white/[0.06]">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-[#6dd5de]" />
          <p className="text-xs font-semibold uppercase tracking-wider text-[#8e8e93]">Market Hours</p>
        </div>
        <span className="rounded-full border border-white/[0.08] bg-black/40 px-2 py-0.5 font-mono text-[10px] text-[#a1a1aa]">
          {zoneLabel}
        </span>
      </div>

      {/* Dotted world map */}
      <div className="relative my-3 flex h-24 items-center justify-center overflow-hidden opacity-25">
        <img src="/world-map.svg" alt="" className="h-full w-full object-contain" />
      </div>

      {/* Session rows */}
      <div className="space-y-1 border-t border-[#1a1a1a] pt-3">
        {SESSION_HOURS.map((session) => {
          const open = now ? isSessionOpen(session, now) : false;
          const progress = now ? sessionProgress(session, now) : 0;
          const left = now ? minutesUntilClose(session, now) : 0;
          const range = tz
            ? formatSessionRange(session, tz)
            : { start: "—", end: "—", nextDay: false };

          return (
            <div
              key={session.value}
              className={cn(
                "rounded-lg px-2 py-1.5 transition-colors",
                open ? "bg-[#141414]" : "bg-transparent",
              )}
            >
              <div className="flex items-center gap-2">
                <span className="relative flex h-1.5 w-1.5 shrink-0">
                  {open && (
                    <span
                      className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-60"
                      style={{ backgroundColor: session.color }}
                    />
                  )}
                  <span
                    className="relative inline-flex h-1.5 w-1.5 rounded-full"
                    style={{ backgroundColor: open ? session.color : "#2e2e2e" }}
                  />
                </span>

                <span
                  className={cn(
                    "text-[11px] font-medium",
                    open ? "text-[#f2f2f0]" : "text-[#7a7a7a]",
                  )}
                >
                  {t(session.labelKey)}
                </span>

                <span className="tabular ml-auto font-mono text-[11px] text-[#a0a0a0]">
                  {range.start}
                  <span className="mx-0.5 text-[#4a4a4a]">–</span>
                  {range.end}
                  {range.nextDay && (
                    <span className="ml-0.5 align-super text-[8px] text-[#5c5c5c]">+1</span>
                  )}
                </span>
              </div>

              {/* Progress bar hanya saat sesi buka */}
              {open && (
                <div className="mt-1 flex items-center gap-2 pl-3.5">
                  <div className="h-[2px] flex-1 overflow-hidden rounded-full bg-[#242424]">
                    <div
                      className="h-full rounded-full transition-[width] duration-500"
                      style={{ width: `${progress * 100}%`, backgroundColor: session.color }}
                    />
                  </div>
                  <span className="font-mono text-[9px] text-[#5c5c5c]">
                    {Math.floor(left / 60)}j {left % 60}m
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Overlap London × New York — window likuiditas tertinggi */}
      {overlapRange && (
        <div
          className={cn(
            "mt-3 flex items-center gap-2 rounded-xl border px-3 py-2 transition-all duration-300",
            overlap
              ? "border-[#b2ff05]/30 bg-[#b2ff05]/10 shadow-[0_0_15px_rgba(178,255,5,0.15)]"
              : "border-white/[0.06] bg-black/20",
          )}
        >
          <Zap
            className={cn("h-3.5 w-3.5 shrink-0", overlap ? "text-[#b2ff05] animate-pulse" : "text-[#52525b]")}
            strokeWidth={2.5}
          />
          <span
            className={cn(
              "text-[11px] font-medium tracking-tight",
              overlap ? "text-[#b2ff05] font-semibold" : "text-[#71717a]",
            )}
          >
            Overlap London–NY
          </span>
          <span
            className={cn(
              "tabular ml-auto font-mono text-[11px]",
              overlap ? "text-[#b2ff05] font-bold" : "text-[#71717a]",
            )}
          >
            {overlapRange.start}–{overlapRange.end}
          </span>
        </div>
      )}
    </div>
  );
}

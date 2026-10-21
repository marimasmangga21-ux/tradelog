import type { TradeSession } from "@/lib/types";

/**
 * Definisi jam sesi trading forex dalam UTC.
 *
 * Rentang ini sengaja dibuat tumpang-tindih karena memang begitu kenyataannya
 * di pasar: London dan New York sama-sama buka 12:00–16:00 UTC, dan justru
 * di window itulah likuiditas paling tebal.
 *
 * `endUtc` boleh lebih besar dari 24 untuk sesi yang melewati tengah malam
 * (Sydney 21:00 → 06:00 keesokan harinya).
 */
export interface SessionDef {
  value: TradeSession;
  labelKey: string;
  color: string;
  /** Jam mulai dalam UTC (0–23). */
  startUtc: number;
  /** Jam selesai dalam UTC. Bisa > 24 kalau melewati tengah malam. */
  endUtc: number;
}

export const SESSION_HOURS: SessionDef[] = [
  {
    value: "asia",
    labelKey: "analytics.sessionAsia",
    color: "#38bdf8",
    startUtc: 0,
    endUtc: 9,
  },
  {
    value: "london",
    labelKey: "analytics.sessionLondon",
    color: "#22c55e",
    startUtc: 7,
    endUtc: 16,
  },
  {
    value: "new_york",
    labelKey: "analytics.sessionNewYork",
    color: "#8b5cf6",
    startUtc: 12,
    endUtc: 21,
  },
  {
    value: "sydney",
    labelKey: "analytics.sessionSydney",
    color: "#f59e0b",
    startUtc: 21,
    endUtc: 30, // 06:00 UTC hari berikutnya
  },
];

/** Jam UTC dalam bentuk desimal, mis. 13:30 → 13.5 */
function utcHourFloat(date: Date): number {
  return date.getUTCHours() + date.getUTCMinutes() / 60;
}

/**
 * Apakah sesi sedang buka pada waktu tertentu.
 * Menangani sesi yang melewati tengah malam (start > end).
 */
export function isSessionOpen(def: SessionDef, now: Date = new Date()): boolean {
  const h = utcHourFloat(now);
  if (def.endUtc <= 24) {
    return h >= def.startUtc && h < def.endUtc;
  }
  // Lewat tengah malam: 21:00–24:00 atau 00:00–06:00
  return h >= def.startUtc || h < def.endUtc - 24;
}

/** Sisa menit sampai sesi tutup (0 kalau sedang tutup). */
export function minutesUntilClose(def: SessionDef, now: Date = new Date()): number {
  if (!isSessionOpen(def, now)) return 0;
  const h = utcHourFloat(now);
  const end = def.endUtc <= 24 || h >= def.startUtc ? def.endUtc : def.endUtc;
  const diff = end - h;
  return Math.max(0, Math.round((diff > 0 ? diff : diff + 24) * 60));
}

/** Progres sesi 0–1 (0 kalau sedang tutup). */
export function sessionProgress(def: SessionDef, now: Date = new Date()): number {
  if (!isSessionOpen(def, now)) return 0;
  const h = utcHourFloat(now);
  const length = def.endUtc - def.startUtc;
  if (length <= 0) return 0;
  let elapsed = h - def.startUtc;
  if (elapsed < 0) elapsed += 24;
  return Math.min(1, Math.max(0, elapsed / length));
}

/** Sesi mana saja yang sedang buka. */
export function openSessions(now: Date = new Date()): SessionDef[] {
  return SESSION_HOURS.filter((s) => isSessionOpen(s, now));
}

/**
 * Format rentang jam sesi ke zona waktu tertentu.
 * Default mengikuti zona waktu browser pengguna.
 */
export function formatSessionRange(
  def: SessionDef,
  timeZone?: string,
  opts: { withMinutes?: boolean } = {},
): { start: string; end: string; nextDay: boolean } {
  const { withMinutes = false } = opts;

  // Pakai tanggal acuan hari ini supaya offset DST ikut terhitung.
  const base = new Date();
  const makeDate = (utcHour: number) => {
    const d = new Date(
      Date.UTC(base.getUTCFullYear(), base.getUTCMonth(), base.getUTCDate(), 0, 0, 0),
    );
    d.setUTCHours(utcHour);
    return d;
  };

  const fmt = (d: Date) =>
    d.toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: withMinutes ? "2-digit" : "2-digit",
      hour12: false,
      timeZone,
    });

  const startDate = makeDate(def.startUtc);
  const endDate = makeDate(def.endUtc);

  // "+1" harus dinilai di zona waktu pengguna, bukan di UTC.
  // Contoh: New York 12:00–21:00 UTC = 19:00–04:00 WIB → lewat tengah malam
  // di WIB walau di UTC tidak. Sebaliknya Sydney 21:00–06:00 UTC = 04:00–13:00
  // WIB → tidak lewat tengah malam di WIB.
  const dayKey = (d: Date) =>
    new Intl.DateTimeFormat("en-CA", {
      timeZone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(d);

  return {
    start: fmt(startDate),
    end: fmt(endDate),
    nextDay: dayKey(startDate) !== dayKey(endDate),
  };
}

/**
 * Window overlap London × New York (12:00–16:00 UTC).
 * Ini periode likuiditas paling tebal sepanjang hari — penting untuk trader.
 */
export const OVERLAP_UTC = { start: 12, end: 16 };

export function isOverlapOpen(now: Date = new Date()): boolean {
  const h = utcHourFloat(now);
  return h >= OVERLAP_UTC.start && h < OVERLAP_UTC.end;
}

/** Rentang jam sesi dalam zona waktu lokal, mis. "14:00–23:00". */
export function sessionRangeLabel(session: TradeSession, timeZone?: string): string {
  const def = SESSION_HOURS.find((s) => s.value === session);
  if (!def) return "";
  const tz = timeZone ?? Intl.DateTimeFormat().resolvedOptions().timeZone;
  const { start, end, nextDay } = formatSessionRange(def, tz);
  return `${start}–${end}${nextDay ? "+1" : ""}`;
}

/** Nama zona waktu lokal pengguna, mis. "WIB" / "GMT+7". */
export function localTimeZoneLabel(timeZone?: string): string {
  try {
    const tz = timeZone ?? Intl.DateTimeFormat().resolvedOptions().timeZone;
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone: tz,
      timeZoneName: "shortOffset",
    }).formatToParts(new Date());
    const name = parts.find((p) => p.type === "timeZoneName")?.value ?? "";
    return name.replace("GMT", "UTC").replace(/^UTC\+0$/, "UTC");
  } catch {
    return "UTC";
  }
}

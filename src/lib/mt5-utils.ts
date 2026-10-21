import type { TradeSession } from "./types";

/**
 * Normalisasi nama instrumen dari broker Forex/Crypto.
 * Menghilangkan suffix seperti EURUSD.m, XAUUSD.pro, BTCUSD.vx, GBPJPY_i
 */
export function normalizeSymbol(raw: string): string {
  if (!raw) return "";
  let clean = raw.trim().toUpperCase();

  // Pola akhiran umum broker forex/crypto
  // e.g. .m, .raw, .pro, .ecn, .vx, _i, _sb, +
  clean = clean.replace(/(\.M|\.RAW|\.PRO|\.ECN|\.VX|_I|_SB|\+)$/i, "");
  // Hilangkan pemisah strip atau slash jika ada
  clean = clean.replace(/[\/\-_]/g, "");

  return clean;
}

/**
 * Deteksi sesi trading berdasarkan jam UTC.
 *
 * Pembagian ini adalah **partisi bersih** (tidak tumpang-tindih) supaya tiap
 * trade hanya masuk satu sesi. Jam buka/tutup sebenarnya sengaja dibuat
 * tumpang-tindih (lihat `SESSION_HOURS` di `lib/sessions.ts`) karena London &
 * New York memang sama-sama buka 12:00–16:00 UTC.
 *
 * Untuk klasifikasi, trade di window overlap dimasukkan ke sesi yang dibuka
 * paling akhir, karena itu sesi yang menggerakkan harga saat itu:
 *
 * - 00:00 – 07:00 UTC → Asia     (Tokyo buka 00:00, London belum buka)
 * - 07:00 – 12:00 UTC → London   (London buka, New York belum)
 * - 12:00 – 21:00 UTC → New York (New York buka — termasuk overlap dengan London)
 * - 21:00 – 24:00 UTC → Sydney   (New York tutup, Sydney buka)
 */
export function detectSession(isoDateString: string): TradeSession {
  try {
    const date = new Date(isoDateString);
    const utcHour = date.getUTCHours();

    if (utcHour >= 0 && utcHour < 7) return "asia";
    if (utcHour >= 7 && utcHour < 12) return "london";
    if (utcHour >= 12 && utcHour < 21) return "new_york";
    if (utcHour >= 21 && utcHour < 24) return "sydney";
    return "other";
  } catch {
    return "other";
  }
}

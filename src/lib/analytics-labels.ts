import type { Translator } from "@/lib/i18n";

const SCORE_LABEL_PATHS: Record<string, string> = {
  winRate: "analytics.winRate",
  profitFactor: "analytics.profitFactor",
  avgWinLoss: "analytics.avgWinLoss",
  recoveryFactor: "analytics.recoveryFactor",
  maxDrawdown: "analytics.maxDrawdown",
  consistency: "analytics.consistency",
};

/** Label komponen skor yang mengikuti bahasa aktif. */
export function scoreLabel(t: Translator, key: string, fallback: string): string {
  const path = SCORE_LABEL_PATHS[key];
  if (!path) return fallback;
  const value = t(path);
  return value === path ? fallback : value;
}

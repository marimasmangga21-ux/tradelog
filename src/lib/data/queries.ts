import "server-only";

import { readDb } from "@/lib/store/db";
import type { Account, Emotion, Journal, Profile, Strategy, Trade, TradeScreenshot } from "@/lib/types";

export async function loadProfile(): Promise<Profile> {
  return (await readDb()).profile;
}

export async function loadAccounts(): Promise<Account[]> {
  const db = await readDb();
  return db.accounts
    .filter((a) => !a.archived)
    .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
}

export async function loadStrategies(): Promise<Strategy[]> {
  const db = await readDb();
  return db.strategies
    .filter((s) => !s.archived)
    .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
}

export async function loadTrades(): Promise<Trade[]> {
  const db = await readDb();
  return [...db.trades].sort(
    (a, b) => new Date(b.traded_at).getTime() - new Date(a.traded_at).getTime(),
  );
}

export async function loadTrade(id: string): Promise<Trade | null> {
  const db = await readDb();
  return db.trades.find((t) => t.id === id) ?? null;
}

export async function loadJournals(): Promise<Journal[]> {
  const db = await readDb();
  return [...db.journals].sort(
    (a, b) => new Date(b.journal_date).getTime() - new Date(a.journal_date).getTime(),
  );
}

export async function loadEmotions(): Promise<Emotion[]> {
  const db = await readDb();
  return [...db.emotions].sort((a, b) => Number(b.is_default) - Number(a.is_default));
}

export async function loadScreenshots(tradeId: string): Promise<TradeScreenshot[]> {
  const db = await readDb();
  return db.screenshots.filter((s) => s.trade_id === tradeId);
}

export async function loadAll() {
  const db = await readDb();
  return {
    isSample: db.is_sample,
    profile: db.profile,
    accounts: db.accounts
      .filter((a) => !a.archived)
      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()),
    strategies: db.strategies
      .filter((s) => !s.archived)
      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()),
    trades: [...db.trades].sort(
      (a, b) => new Date(b.traded_at).getTime() - new Date(a.traded_at).getTime(),
    ),
    journals: [...db.journals].sort(
      (a, b) => new Date(b.journal_date).getTime() - new Date(a.journal_date).getTime(),
    ),
    emotions: [...db.emotions].sort((a, b) => Number(b.is_default) - Number(a.is_default)),
    screenshots: db.screenshots,
  };
}

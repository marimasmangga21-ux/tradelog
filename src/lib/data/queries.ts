import "server-only";

import { readDb, getUserDataset, getActiveUserEmail } from "@/lib/store/db";
import type { Account, Emotion, Journal, Profile, Strategy, Trade, TradeScreenshot } from "@/lib/types";

async function loadCurrentDataset() {
  const email = await getActiveUserEmail();
  const db = await readDb();
  return getUserDataset(db, email);
}

export async function loadProfile(): Promise<Profile> {
  const ds = await loadCurrentDataset();
  return ds.profile;
}

export async function loadAccounts(): Promise<Account[]> {
  const ds = await loadCurrentDataset();
  return ds.accounts
    .filter((a) => !a.archived)
    .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
}

export async function loadStrategies(): Promise<Strategy[]> {
  const ds = await loadCurrentDataset();
  return ds.strategies
    .filter((s) => !s.archived)
    .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
}

export async function loadTrades(): Promise<Trade[]> {
  const ds = await loadCurrentDataset();
  return [...ds.trades].sort(
    (a, b) => new Date(b.traded_at).getTime() - new Date(a.traded_at).getTime(),
  );
}

export async function loadTrade(id: string): Promise<Trade | null> {
  const ds = await loadCurrentDataset();
  return ds.trades.find((t) => t.id === id) ?? null;
}

export async function loadJournals(): Promise<Journal[]> {
  try {
    const { supabase } = await import("@/lib/supabase");
    const email = await getActiveUserEmail();
    
    console.log("[loadJournals] fetching for email:", email);
    const { data, error } = await supabase
      .from("journals")
      .select("*")
      .eq("user_email", email)
      .order("journal_date", { ascending: false });
    
    if (error) {
      console.error("[loadJournals] supabase error:", error);
    } else if (data) {
      console.log("[loadJournals] supabase returned rows:", data.length);
      return data as Journal[];
    }
  } catch (err) {
    console.error("[loadJournals] catch error:", err);
  }
  
  const ds = await loadCurrentDataset();
  return [...ds.journals].sort(
    (a, b) => new Date(b.journal_date).getTime() - new Date(a.journal_date).getTime(),
  );
}

export async function loadEmotions(): Promise<Emotion[]> {
  const ds = await loadCurrentDataset();
  return [...ds.emotions].sort((a, b) => Number(b.is_default) - Number(a.is_default));
}

export async function loadScreenshots(tradeId: string): Promise<TradeScreenshot[]> {
  const ds = await loadCurrentDataset();
  return ds.screenshots.filter((s) => s.trade_id === tradeId);
}

export async function loadAll(targetEmail?: string) {
  const email = targetEmail || (await getActiveUserEmail());
  const db = await readDb();
  const ds = getUserDataset(db, email);

  return {
    isSample: ds.is_sample,
    profile: ds.profile,
    accounts: ds.accounts
      .filter((a) => !a.archived)
      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()),
    strategies: ds.strategies
      .filter((s) => !s.archived)
      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()),
    trades: [...ds.trades].sort(
      (a, b) => new Date(b.traded_at).getTime() - new Date(a.traded_at).getTime(),
    ),
    journals: (await loadJournals()),
    emotions: [...ds.emotions].sort((a, b) => Number(b.is_default) - Number(a.is_default)),
    screenshots: ds.screenshots,
  };
}

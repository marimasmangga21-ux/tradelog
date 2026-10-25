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
  try {
    const { supabase } = await import("@/lib/supabase");
    const email = await getActiveUserEmail();
    const { data, error } = await supabase
      .from("accounts")
      .select("*")
      .eq("user_email", email)
      .eq("archived", false)
      .order("created_at", { ascending: true });

    if (!error && data && data.length > 0) {
      return data.map((a: any) => ({
        ...a,
        initial_balance: Number(a.initial_balance || 0),
        total_deposits: Number(a.total_deposits || 0),
        profit_target: a.profit_target ? Number(a.profit_target) : null,
        max_drawdown: a.max_drawdown ? Number(a.max_drawdown) : null,
      })) as Account[];
    }
  } catch {}

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
  try {
    const { supabase } = await import("@/lib/supabase");
    const email = await getActiveUserEmail();
    const { data, error } = await supabase
      .from("trades")
      .select("*")
      .eq("user_email", email)
      .order("traded_at", { ascending: false });

    if (!error && data && data.length > 0) {
      return data.map((t: any) => ({
        ...t,
        entry_price: t.entry_price ? Number(t.entry_price) : null,
        exit_price: t.exit_price ? Number(t.exit_price) : null,
        stop_loss: t.stop_loss ? Number(t.stop_loss) : null,
        take_profit: t.take_profit ? Number(t.take_profit) : null,
        position_size: t.position_size ? Number(t.position_size) : null,
        pnl: t.pnl ? Number(t.pnl) : 0,
        pnl_percent: t.pnl_percent ? Number(t.pnl_percent) : null,
        fees: Number(t.fees || 0),
        commission: Number(t.commission || 0),
        swap: Number(t.swap || 0),
        balance_after: t.balance_after ? Number(t.balance_after) : null,
        r_multiple: t.r_multiple ? Number(t.r_multiple) : null,
        risk_amount: t.risk_amount ? Number(t.risk_amount) : null,
      })) as Trade[];
    }
  } catch {}

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
    accounts: await loadAccounts(),
    strategies: ds.strategies
      .filter((s) => !s.archived)
      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()),
    trades: await loadTrades(),
    journals: await loadJournals(),
    emotions: [...ds.emotions].sort((a, b) => Number(b.is_default) - Number(a.is_default)),
    screenshots: ds.screenshots,
  };
}

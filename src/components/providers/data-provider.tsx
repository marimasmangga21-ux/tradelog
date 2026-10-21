"use client";

import * as React from "react";
import type { Account, Emotion, Journal, Profile, Strategy, Trade } from "@/lib/types";

interface DataContextValue {
  profile: Profile | null;
  accounts: Account[];
  strategies: Strategy[];
  trades: Trade[];
  journals: Journal[];
  emotions: Emotion[];
  loading: boolean;
  syncingMt5: boolean;
  refresh: () => Promise<void>;
  syncMt5: (showToast?: boolean) => Promise<boolean>;
  logout: () => Promise<void>;
}

const DataContext = React.createContext<DataContextValue | null>(null);

export function DataProvider({
  initialProfile,
  initialAccounts,
  initialStrategies,
  initialTrades,
  initialJournals,
  initialEmotions,
  children,
}: {
  initialProfile?: Profile;
  initialAccounts: Account[];
  initialStrategies: Strategy[];
  initialTrades: Trade[];
  initialJournals: Journal[];
  initialEmotions: Emotion[];
  children: React.ReactNode;
}) {
  const [profile, setProfile] = React.useState<Profile | null>(initialProfile ?? null);
  const [accounts, setAccounts] = React.useState(initialAccounts);
  const [strategies, setStrategies] = React.useState(initialStrategies);
  const [trades, setTrades] = React.useState(initialTrades);
  const [journals, setJournals] = React.useState(initialJournals);
  const [emotions, setEmotions] = React.useState(initialEmotions);
  const [loading, setLoading] = React.useState(false);
  const [syncingMt5, setSyncingMt5] = React.useState(false);

  React.useEffect(() => {
    if (initialProfile) setProfile(initialProfile);
  }, [initialProfile]);
  React.useEffect(() => setAccounts(initialAccounts), [initialAccounts]);
  React.useEffect(() => setStrategies(initialStrategies), [initialStrategies]);
  React.useEffect(() => setTrades(initialTrades), [initialTrades]);
  React.useEffect(() => setJournals(initialJournals), [initialJournals]);
  React.useEffect(() => setEmotions(initialEmotions), [initialEmotions]);

  const refresh = React.useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/data", { cache: "no-store" });
      if (res.ok) {
        const data = (await res.json()) as {
          profile?: Profile;
          accounts: Account[];
          strategies: Strategy[];
          trades: Trade[];
          journals: Journal[];
          emotions: Emotion[];
        };
        if (data.profile) setProfile(data.profile);
        setAccounts(data.accounts);
        setStrategies(data.strategies);
        setTrades(data.trades);
        setJournals(data.journals);
        setEmotions(data.emotions);
      }
    } catch {
      // diamkan
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = React.useCallback(async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {}
    window.location.href = "/login";
  }, []);

  const syncMt5 = React.useCallback(
    async (): Promise<boolean> => {
      setSyncingMt5(true);
      try {
        const res = await fetch("/api/mt5/sync", { method: "POST" });
        if (!res.ok) {
          return false;
        }
        const data = await res.json();
        if (data.ok) {
          await refresh();
          return true;
        }
        return false;
      } catch {
        return false;
      } finally {
        setSyncingMt5(false);
      }
    },
    [refresh],
  );

  const value = React.useMemo<DataContextValue>(
    () => ({
      profile,
      accounts,
      strategies,
      trades,
      journals,
      emotions,
      loading,
      syncingMt5,
      refresh,
      syncMt5,
      logout,
    }),
    [profile, accounts, strategies, trades, journals, emotions, loading, syncingMt5, refresh, syncMt5, logout],
  );

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData() {
  const ctx = React.useContext(DataContext);
  if (!ctx) throw new Error("useData harus dipakai di dalam DataProvider");
  return ctx;
}

/** Helper: filter trades berdasarkan akun aktif dari query param. */
export function useFilteredTrades(accountId: string | null): Trade[] {
  const { trades } = useData();
  return React.useMemo(
    () => (accountId ? trades.filter((t) => t.account_id === accountId) : trades),
    [trades, accountId],
  );
}

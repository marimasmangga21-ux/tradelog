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
  addOrUpdateAccount: (account: Account) => void;
  deleteAccountFromState: (id: string) => void;
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

  // Load from localStorage on mount & auto-refresh from server
  React.useEffect(() => {
    try {
      const stored = localStorage.getItem("tradelog_accounts");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setAccounts((prev) => {
            if (!prev || prev.length === 0) return parsed;
            const map = new Map<string, Account>();
            for (const a of parsed) map.set(a.id, a);
            for (const a of prev) map.set(a.id, a);
            return Array.from(map.values());
          });
        }
      }
    } catch {}

    // Selalu sinkronkan data terbaru dari server saat buka halaman
    refresh();
  }, [refresh]);

  React.useEffect(() => {
    if (initialProfile) setProfile(initialProfile);
  }, [initialProfile]);
  React.useEffect(() => {
    if (initialAccounts && initialAccounts.length > 0) {
      setAccounts((prev) => {
        const map = new Map<string, Account>();
        for (const a of initialAccounts) map.set(a.id, a);
        for (const a of prev) map.set(a.id, a);
        const merged = Array.from(map.values());
        try {
          localStorage.setItem("tradelog_accounts", JSON.stringify(merged));
        } catch {}
        return merged;
      });
    }
  }, [initialAccounts]);
  React.useEffect(() => {
    if (initialStrategies && initialStrategies.length > 0) {
      setStrategies(initialStrategies);
    }
  }, [initialStrategies]);
  React.useEffect(() => {
    if (initialTrades && initialTrades.length > 0) {
      setTrades(initialTrades);
    }
  }, [initialTrades]);
  React.useEffect(() => {
    if (initialJournals && initialJournals.length > 0) {
      setJournals(initialJournals);
    }
  }, [initialJournals]);
  React.useEffect(() => {
    if (initialEmotions && initialEmotions.length > 0) {
      setEmotions(initialEmotions);
    }
  }, [initialEmotions]);

  const addOrUpdateAccount = React.useCallback((account: Account) => {
    setAccounts((prev) => {
      const filtered = prev.filter((a) => a.id !== account.id);
      const next = [account, ...filtered];
      try {
        localStorage.setItem("tradelog_accounts", JSON.stringify(next));
      } catch {}
      return next;
    });
  }, []);

  const deleteAccountFromState = React.useCallback((id: string) => {
    setAccounts((prev) => {
      const next = prev.filter((a) => a.id !== id);
      try {
        localStorage.setItem("tradelog_accounts", JSON.stringify(next));
      } catch {}
      return next;
    });
  }, []);

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
        
        // Merge accounts safely without wiping local state
        setAccounts((prev) => {
          if (data.accounts && data.accounts.length > 0) {
            const map = new Map<string, Account>();
            for (const a of prev) map.set(a.id, a);
            for (const a of data.accounts) map.set(a.id, a);
            const merged = Array.from(map.values());
            try {
              localStorage.setItem("tradelog_accounts", JSON.stringify(merged));
            } catch {}
            return merged;
          }
          // If server returns empty array but local has accounts, preserve local and sync to server
          if (prev.length > 0) {
            fetch("/api/data", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ accounts: prev }),
            }).catch(() => {});
          }
          return prev;
        });

        if (data.strategies && data.strategies.length > 0) setStrategies(data.strategies);
        if (data.trades && data.trades.length > 0) setTrades(data.trades);
        if (data.journals && data.journals.length > 0) setJournals(data.journals);
        if (data.emotions && data.emotions.length > 0) setEmotions(data.emotions);
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
      addOrUpdateAccount,
      deleteAccountFromState,
    }),
    [
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
      addOrUpdateAccount,
      deleteAccountFromState,
    ],
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

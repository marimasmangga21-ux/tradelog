"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  MoreVertical,
  Pencil,
  Plus,
  RefreshCw,
  Trash2,
  TrendingUp,
  Wallet,
  XCircle,
  Zap,
} from "lucide-react";
import { toast } from "sonner";
import { useI18n } from "@/components/providers/i18n-provider";
import { useData } from "@/components/providers/data-provider";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AccountForm } from "@/components/accounts/account-form";
import { ConnectMt5Dialog } from "@/components/accounts/connect-mt5-dialog";
import { deleteAccount, setAccountArchived, setAccountStatus } from "@/app/actions/accounts";
import { formatPercent, formatSignedCurrency, pnlColor } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Account } from "@/lib/types";

const STATUS_CONFIG = {
  active: {
    icon: TrendingUp,
    badgeClass: "border-profit/30 bg-profit/10 text-profit",
    key: "accounts.active",
  },
  passed: {
    icon: CheckCircle2,
    badgeClass: "border-blue-500/30 bg-blue-500/10 text-blue-400",
    key: "accounts.passed",
  },
  breached: {
    icon: XCircle,
    badgeClass: "border-loss/30 bg-loss/10 text-loss",
    key: "accounts.breached",
  },
  archived: {
    icon: AlertTriangle,
    badgeClass: "border-border bg-muted/60 text-muted-foreground",
    key: "accounts.archived",
  },
};

function MiniSparkline({ values, positive }: { values: number[]; positive: boolean }) {
  if (values.length < 2) {
    return (
      <div className="h-7 w-20 flex items-center justify-center text-[10px] text-muted-foreground">
        —
      </div>
    );
  }
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max === min ? 1 : max - min;
  const width = 80;
  const height = 28;
  const points = values
    .map((v, i) => {
      const x = (i / (values.length - 1)) * (width - 4) + 2;
      const y = height - 2 - ((v - min) / range) * (height - 6);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");

  const color = positive ? "#22c55e" : "#ef4444";

  return (
    <svg width={width} height={height} className="overflow-hidden shrink-0">
      <polyline
        fill="none"
        stroke={color}
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
      />
    </svg>
  );
}

export function AccountsView({
  hideAmounts,
  initialAccounts,
}: {
  hideAmounts: boolean;
  initialAccounts?: Account[];
}) {
  const { t } = useI18n();
  const { accounts: contextAccounts, trades, strategies, syncMt5, syncingMt5 } = useData();
  const router = useRouter();
  const accounts = contextAccounts.length > 0 ? contextAccounts : (initialAccounts ?? contextAccounts);

  const statsByStrategy = React.useMemo(() => {
    const map = new Map<string, { winRate: number; profitFactor: number; totalTrades: number }>();
    for (const strategy of strategies) {
      const list = trades.filter((t) => t.strategy_id === strategy.id);
      const wins = list.filter((t) => (t.pnl || 0) > 0).length;
      const winRate = list.length > 0 ? (wins / list.length) * 100 : 0;
      const grossProfit = list.filter((t) => (t.pnl || 0) > 0).reduce((s, t) => s + (t.pnl || 0), 0);
      const grossLoss = Math.abs(list.filter((t) => (t.pnl || 0) < 0).reduce((s, t) => s + (t.pnl || 0), 0));
      const pf = grossLoss > 0 ? grossProfit / grossLoss : grossProfit > 0 ? 99 : 0;
      map.set(strategy.id, { winRate, profitFactor: pf, totalTrades: list.length });
    }
    return map;
  }, [strategies, trades]);

  async function handleManualSync() {
    toast.info("Sinkronisasi semua akun MT5...", { duration: 2500 });
    const success = await syncMt5();
    if (success) {
      toast.success("Sinkronisasi MT5 Berhasil!", {
        description: "Kedua akun MT5 dan seluruh history trade telah diperbarui.",
      });
      router.refresh();
    } else {
      toast.error("Gagal sinkronisasi MT5", {
        description: "Pastikan MetaTrader 5 sedang aktif di komputer.",
      });
    }
  }

  const [formOpen, setFormOpen] = React.useState(false);
  const [mt5DialogOpen, setMt5DialogOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = React.useState<string | null>(null);

  const statsByAccount = React.useMemo(() => {
    const map = new Map<
      string,
      { netPnl: number; deposit: number; trades: number; wins: number; closed: number; equity: number }
    >();
    for (const account of accounts) {
      const list = trades.filter((tr) => tr.account_id === account.id && tr.status === "closed");
      const netPnl = list.reduce((a, tr) => a + tr.pnl, 0);
      const deposit = account.total_deposits ?? account.initial_balance;
      map.set(account.id, {
        netPnl,
        deposit,
        trades: list.length,
        wins: list.filter((tr) => tr.pnl > 0).length,
        closed: list.length,
        equity: deposit + netPnl,
      });
    }
    return map;
  }, [accounts, trades]);

  const totalSummary = React.useMemo(() => {
    const equities = new Map<string, number>();
    const deposits = new Map<string, number>();
    const profits = new Map<string, number>();

    for (const account of accounts) {
      const stat = statsByAccount.get(account.id);
      const cur = account.currency;
      equities.set(cur, (equities.get(cur) ?? 0) + (stat?.equity ?? 0));
      deposits.set(cur, (deposits.get(cur) ?? 0) + (stat?.deposit ?? 0));
      profits.set(cur, (profits.get(cur) ?? 0) + (stat?.netPnl ?? 0));
    }
    return { equities, deposits, profits };
  }, [accounts, statsByAccount]);

  const editingAccount = accounts.find((a) => a.id === editing) ?? null;

  async function handleDelete() {
    if (!deleteTarget) return;
    const result = await deleteAccount(deleteTarget);
    setDeleteTarget(null);
    if (!result.ok) {
      toast.error(t("common.error"), { description: result.error });
      return;
    }
    toast.success(t("accounts.deleted"));
    router.refresh();
  }

  return (
    <div>
      {/* Mobile-first Bar & Header (Presisi Gambar 2) */}
      <div className="lg:hidden space-y-3.5 mb-5">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search..."
              className="w-full h-9 rounded-xl border border-white/10 bg-[#121215] px-3 pl-8 text-xs text-white placeholder-[#71717a] focus:outline-none focus:border-[#b2ff05]/50"
            />
            <svg className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#71717a]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.3-4.3" />
            </svg>
          </div>
          <Button
            onClick={() => {
              setEditing(null);
              setFormOpen(true);
            }}
            className="h-9 gap-1 rounded-xl bg-[#b2ff05] px-3 text-xs font-bold text-black hover:bg-[#9fe000] shadow-[0_0_15px_rgba(178,255,5,0.3)] shrink-0"
          >
            <Plus className="h-3.5 w-3.5 stroke-[3]" />
            <span>Add Account/Strategy</span>
          </Button>
        </div>

        <div className="pt-1">
          <h2 className="text-base font-bold text-white tracking-tight">Accounts</h2>
        </div>

        {/* Mobile Accounts List (Gambar 2) */}
        <div className="space-y-3">
          {/* Card All Accounts */}
          <div className="mobile-card p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-[#8e8e93]">All Accounts</span>
              <Wallet className="h-4 w-4 text-[#a1a1aa] stroke-[1.5]" />
            </div>
            <p className="mt-1 font-mono text-2xl font-bold text-white tracking-tight">
              {hideAmounts
                ? "$ ••••••"
                : Array.from(totalSummary.equities.entries())
                    .map(([cur, val]) => formatSignedCurrency(val, cur as never))
                    .join(" · ") || "$0.00"}
            </p>
          </div>

          {/* Cards Akun Individual atau Empty State */}
          {accounts.length === 0 ? (
            <div className="mobile-card p-6 text-center space-y-3">
              <div className="mx-auto w-10 h-10 rounded-full bg-[#b2ff05]/10 border border-[#b2ff05]/20 flex items-center justify-center text-[#b2ff05]">
                <Wallet className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Belum Ada Akun Trading</h3>
                <p className="text-xs text-[#8e8e93] mt-1 max-w-xs mx-auto">
                  Tambahkan akun trading pertama Anda (Live, Demo, atau Prop Firm) untuk mulai mencatat posisi.
                </p>
              </div>
              <Button
                className="gap-1.5 bg-[#b2ff05] text-black font-bold hover:bg-[#9fe000] rounded-xl h-9 px-4 text-xs shadow-[0_0_15px_rgba(178,255,5,0.25)] mx-auto"
                onClick={() => {
                  setEditing(null);
                  setFormOpen(true);
                }}
              >
                <Plus className="h-4 w-4 stroke-[2.5]" />
                <span>Tambah Akun Baru</span>
              </Button>
            </div>
          ) : (
            accounts.map((acc) => {
              const stat = statsByAccount.get(acc.id);
              const equity = stat?.equity ?? acc.initial_balance ?? 0;
              const pnl = stat?.netPnl ?? 0;
              const isProfit = pnl >= 0;

              return (
                <div key={acc.id} className="mobile-card p-4 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-[#a1a1aa]">{acc.name}</span>
                    <button
                      type="button"
                      onClick={() => {
                        setEditing(acc.id);
                        setFormOpen(true);
                      }}
                      className="p-1 text-[#71717a] hover:text-[#b2ff05] transition-colors"
                      title="Edit Akun"
                    >
                      <Pencil className="h-3.5 w-3.5 stroke-[1.5]" />
                    </button>
                  </div>

                  <div className="flex items-baseline gap-2">
                    <span className="font-mono text-xl font-bold text-white">
                      {hideAmounts ? "$ •••" : `$${equity.toLocaleString("en-US", { minimumFractionDigits: 2 })}`}
                    </span>
                    <span className={cn("font-mono text-xs font-bold", isProfit ? "text-[#b2ff05]" : "text-[#ef4444]")}>
                      ({isProfit ? "+" : ""}${Math.abs(pnl).toLocaleString("en-US", { minimumFractionDigits: 2 })})
                    </span>
                  </div>

                  {/* Progress bar neon lime */}
                  <div className="space-y-1">
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/[0.08]">
                      <div
                        className="h-full rounded-full bg-[#b2ff05] shadow-[0_0_8px_#b2ff05]"
                        style={{
                          width: `${Math.min(100, Math.max(5, ((equity) / (acc.initial_balance || 1)) * 100))}%`,
                        }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-[#71717a]">
                      <span>Initial: ${(acc.initial_balance ?? 0).toLocaleString()}</span>
                      <span>Equity: ${equity.toLocaleString("en-US", { maximumFractionDigits: 0 })}</span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Section Strategies di Mobile */}
        <div className="pt-3 space-y-2.5">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white tracking-tight">Strategies</h2>
            <Link href="/strategies" className="text-xs text-[#b2ff05] font-semibold hover:underline">
              View all →
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            {strategies.slice(0, 4).map((strat) => {
              const stat = statsByStrategy.get(strat.id);
              const wr = stat?.winRate ?? 0;
              const isHighWr = wr >= 50;

              return (
                <Link
                  key={strat.id}
                  href={`/strategies`}
                  className="mobile-card block p-3 space-y-2 hover:border-white/20 transition-colors"
                >
                  <div className="flex items-start justify-between gap-1">
                    <span className="text-xs font-bold text-white leading-tight truncate">
                      {strat.name}
                    </span>
                    <span
                      className={cn(
                        "rounded px-1.5 py-0.5 text-[9px] font-black shrink-0",
                        isHighWr
                          ? "bg-[#b2ff05] text-black shadow-[0_0_8px_rgba(178,255,5,0.4)]"
                          : "bg-red-500/20 text-red-400 border border-red-500/30"
                      )}
                    >
                      {wr.toFixed(0)}% WR
                    </span>
                  </div>
                  <p className="text-[11px] text-[#a1a1aa]">
                    Profit Factor:{" "}
                    <span className="font-mono font-bold text-white">
                      {(stat?.profitFactor ?? 0) > 0 ? (stat?.profitFactor ?? 0).toFixed(1) : "—"}
                    </span>
                  </p>
                  <p className="text-[10px] text-[#71717a]">{stat?.totalTrades ?? 0} Trades</p>
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      {/* Desktop Views (Utuh untuk layar lebar) */}
      <div className="hidden lg:block">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#f2f2f0] sm:text-3xl">
            {t("accounts.title")}
          </h1>
          <p className="mt-0.5 text-xs text-[#8e8e93]">{t("accounts.subtitle")}</p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            disabled={syncingMt5}
            className="gap-1.5 border-white/10 bg-[#121214] text-[#a0a0a0] hover:border-[#b2ff05]/40 hover:bg-[#b2ff05]/10 hover:text-[#b2ff05] rounded-xl h-9"
            onClick={handleManualSync}
          >
            <RefreshCw className={cn("h-4 w-4", syncingMt5 && "animate-spin text-[#b2ff05]")} />
            <span>{syncingMt5 ? "Syncing..." : "Sync MT5"}</span>
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="gap-1.5 border-[#b2ff05]/30 bg-[#b2ff05]/10 text-[#b2ff05] hover:bg-[#b2ff05]/20 hover:text-[#b2ff05] rounded-xl h-9"
            onClick={() => setMt5DialogOpen(true)}
          >
            <Zap className="h-4 w-4" />
            Connect MT5
          </Button>
          <Button
            size="sm"
            className="gap-1.5 bg-[#b2ff05] text-black font-bold hover:bg-[#9fe000] rounded-xl h-9 shadow-[0_0_15px_rgba(178,255,5,0.25)]"
            onClick={() => {
              setEditing(null);
              setFormOpen(true);
            }}
          >
            <Plus className="h-4 w-4 stroke-[2.5]" />
            {t("accounts.new")}
          </Button>
        </div>
      </div>

      {/* Total summary: Ekuitas, Deposit, Profit */}
      {accounts.length > 0 && (
        <div className="mb-4 grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-3">
          <div className="tradoxes-card rounded-2xl p-3 sm:p-4">
            <p className="text-[10px] uppercase tracking-wider text-[#8e8e93]">
              {t("accounts.totalEquity")}
            </p>
            <p className="tabular font-mono mt-1 text-sm sm:text-base font-bold text-[#f4f4f5]">
              {hideAmounts
                ? "•••"
                : Array.from(totalSummary.equities.entries())
                    .map(([cur, val]) => formatSignedCurrency(val, cur as never, { compact: true }))
                    .join(" · ")}
            </p>
          </div>

          <div className="tradoxes-card rounded-2xl p-3 sm:p-4">
            <p className="text-[10px] uppercase tracking-wider text-[#8e8e93]">
              {t("accounts.depositBalance")}
            </p>
            <p className="tabular font-mono mt-1 text-sm sm:text-base font-semibold text-[#f4f4f5]">
              {hideAmounts
                ? "•••"
                : Array.from(totalSummary.deposits.entries())
                    .map(([cur, val]) => formatSignedCurrency(val, cur as never, { compact: true }))
                    .join(" · ")}
            </p>
          </div>

          <div className="tradoxes-card rounded-2xl p-3 sm:p-4">
            <p className="text-[10px] uppercase tracking-wider text-[#8e8e93]">
              {t("accounts.profitBalance")}
            </p>
            <p className="tabular font-mono mt-1 text-sm sm:text-base font-semibold">
              {hideAmounts
                ? "•••"
                : Array.from(totalSummary.profits.entries())
                    .map(([cur, val]) => (
                      <span key={cur} className={pnlColor(val)}>
                        {val > 0 ? "+" : ""}
                        {formatSignedCurrency(val, cur as never, { compact: true })}
                      </span>
                    ))}
            </p>
          </div>

          <div className="tradoxes-card rounded-2xl p-3 sm:p-4">
            <p className="text-[10px] uppercase tracking-wider text-[#8e8e93]">
              {t("accounts.title")}
            </p>
            <p className="tabular font-mono mt-1 text-sm sm:text-base font-semibold text-[#a1a1aa]">
              {accounts.filter((a) => !a.archived).length} Aktif
            </p>
          </div>
        </div>
      )}

      {accounts.length === 0 ? (
        <EmptyState
          icon={Wallet}
          title={t("accounts.empty")}
          description={t("accounts.emptyDesc")}
          action={
            <Button onClick={() => setFormOpen(true)}>
              <Plus className="h-4 w-4" />
              {t("accounts.new")}
            </Button>
          }
        />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {accounts.map((account) => {
            const stat = statsByAccount.get(account.id);
            const deposit = stat?.deposit ?? (account.total_deposits || account.initial_balance);
            const winRate = stat && stat.closed > 0 ? (stat.wins / stat.closed) * 100 : 0;
            const growth = deposit > 0 && stat ? (stat.netPnl / deposit) * 100 : 0;
            const targetProgress =
              account.profit_target && account.profit_target > 0 && stat
                ? Math.max(0, Math.min(100, (stat.netPnl / account.profit_target) * 100))
                : null;
            const ddUsed =
              account.max_drawdown && account.max_drawdown > 0 && stat && stat.netPnl < 0
                ? Math.min(100, (Math.abs(stat.netPnl) / account.max_drawdown) * 100)
                : 0;
            const status = STATUS_CONFIG[account.status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.active;
            const StatusIcon = status.icon;

            const accountTrades = trades
              .filter((tr) => tr.account_id === account.id && tr.status === "closed")
              .sort((a, b) => new Date(a.traded_at).getTime() - new Date(b.traded_at).getTime());

            let running = deposit;
            const sparkPoints = [running, ...accountTrades.map((t) => (running += t.pnl))];

            return (
              <div
                key={account.id}
                className={cn(
                  "tradoxes-card tradoxes-card-hover group relative overflow-hidden rounded-2xl p-4 sm:p-5",
                  account.archived && "opacity-60",
                )}
              >
                <div
                  className="absolute inset-x-0 top-0 h-[2.5px]"
                  style={{ backgroundColor: account.color }}
                />
                <div className="space-y-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span
                          className="h-2.5 w-2.5 shrink-0 rounded-full"
                          style={{ backgroundColor: account.color }}
                        />
                        <h3 className="truncate text-base font-semibold text-foreground">{account.name}</h3>
                        {account.mt5_connected && (
                          <span className="inline-flex items-center gap-1 rounded bg-[#b2ff05]/15 px-1.5 py-0.5 text-[9px] font-bold text-[#b2ff05]">
                            <span className="h-1.5 w-1.5 rounded-full bg-[#b2ff05] animate-pulse" />
                            MT5
                          </span>
                        )}
                      </div>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {account.broker ?? "—"} · {account.currency}
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span className={cn("inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[10px] font-medium", status.badgeClass)}>
                        <StatusIcon className="h-3 w-3" strokeWidth={2} />
                        {t(status.key)}
                      </span>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon-sm" className="-mr-1.5 h-7 w-7 shrink-0 text-muted-foreground">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuItem
                            onClick={() => {
                              setEditing(account.id);
                              setFormOpen(true);
                            }}
                          >
                            <Pencil className="h-4 w-4" />
                            {t("common.edit")}
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => router.push(`/trades?account=${account.id}`)}>
                            <ArrowRight className="h-4 w-4" />
                            {t("accounts.viewTrades")}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={async () => {
                              await setAccountStatus(account.id, "passed");
                              toast.success(t("accounts.saved"));
                              router.refresh();
                            }}
                          >
                            <CheckCircle2 className="h-4 w-4" />
                            {t("accounts.passed")}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={async () => {
                              await setAccountStatus(account.id, "breached");
                              toast.success(t("accounts.saved"));
                              router.refresh();
                            }}
                          >
                            <XCircle className="h-4 w-4" />
                            {t("accounts.breached")}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={async () => {
                              await setAccountArchived(account.id, !account.archived);
                              router.refresh();
                            }}
                          >
                            {account.archived ? t("accounts.unarchive") : t("accounts.archive")}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => setDeleteTarget(account.id)}
                            className="text-loss focus:text-loss"
                          >
                            <Trash2 className="h-4 w-4" />
                            {t("common.delete")}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>

                  {/* Saldo Besar + Sparkline */}
                  <div className="flex items-end justify-between gap-3 pt-1">
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                        {t("accounts.currentBalance")} (Ekuitas)
                      </p>
                      <p className="tabular font-mono mt-1 text-2xl font-bold tracking-tight text-foreground lg:text-[1.75rem]">
                        {hideAmounts ? "••••••" : formatSignedCurrency(stat?.equity ?? deposit, account.currency)}
                      </p>
                    </div>

                    <MiniSparkline values={sparkPoints} positive={(stat?.netPnl ?? 0) >= 0} />
                  </div>

                  {/* Pemisahan Jelas Saldo Deposit vs Saldo Profit */}
                  <div className="grid grid-cols-2 gap-2 rounded-lg border border-border/50 bg-[#121214]/60 p-2.5">
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                        {t("accounts.depositBalance")}
                      </p>
                      <p className="tabular font-mono mt-0.5 text-xs font-semibold text-[#f2f2f0]">
                        {hideAmounts ? "•••" : formatSignedCurrency(deposit, account.currency)}
                      </p>
                    </div>
                    <div className="border-l border-border/50 pl-2.5">
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                        {t("accounts.profitBalance")}
                      </p>
                      <div className="mt-0.5 flex items-baseline gap-1">
                        <span className={cn("tabular font-mono text-xs font-semibold", pnlColor(stat?.netPnl ?? 0))}>
                          {hideAmounts ? "—" : (
                            <>
                              {(stat?.netPnl ?? 0) > 0 ? "+" : ""}
                              {formatSignedCurrency(stat?.netPnl ?? 0, account.currency, { compact: true })}
                            </>
                          )}
                        </span>
                        <span className={cn("tabular font-mono text-[10px]", pnlColor(growth))}>
                          ({growth > 0 ? "+" : ""}{growth.toFixed(1)}%)
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Mini-stat: total trade & win rate */}
                  <div className="grid grid-cols-2 gap-3 border-t border-border/60 pt-3">
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{t("accounts.totalTrades")}</p>
                      <p className="tabular font-mono mt-0.5 text-sm font-semibold">{stat?.trades ?? 0}</p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{t("accounts.winRate")}</p>
                      <p className="tabular font-mono mt-0.5 text-sm font-semibold">{formatPercent(winRate, 1)}</p>
                    </div>
                  </div>

                  {targetProgress !== null && (
                    <div className="space-y-1">
                      <div className="flex justify-between text-[10px] text-muted-foreground">
                        <span>{t("accounts.progressTarget")}</span>
                        <span className="tabular font-mono">{targetProgress.toFixed(0)}%</span>
                      </div>
                      <Progress value={targetProgress} className="h-1" />
                    </div>
                  )}

                  {ddUsed > 0 && (
                    <div className="space-y-1">
                      <div className="flex justify-between text-[10px] text-muted-foreground">
                        <span>{t("accounts.drawdownUsed")}</span>
                        <span className="tabular font-mono text-loss">{ddUsed.toFixed(0)}%</span>
                      </div>
                      <Progress
                        value={ddUsed}
                        className="h-1"
                        indicatorClassName={ddUsed > 70 ? "bg-loss" : "bg-warning"}
                      />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
      </div>

      {/* Form dialog */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingAccount ? t("accounts.edit") : t("accounts.new")}</DialogTitle>
            <DialogDescription>{t("accounts.subtitle")}</DialogDescription>
          </DialogHeader>
          <AccountForm
            account={editingAccount ?? undefined}
            onDone={() => {
              setFormOpen(false);
              setEditing(null);
            }}
          />
        </DialogContent>
      </Dialog>

      {/* Delete confirm */}
      <AlertDialog open={Boolean(deleteTarget)} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("accounts.deleteTitle")}</AlertDialogTitle>
            <AlertDialogDescription>{t("accounts.deleteDesc")}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
            <AlertDialogAction onClick={() => void handleDelete()}>{t("common.delete")}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Connect MT5 Dialog */}
      <ConnectMt5Dialog
        open={mt5DialogOpen}
        onOpenChange={setMt5DialogOpen}
      />
    </div>
  );
}

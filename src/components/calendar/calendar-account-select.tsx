"use client";

import * as React from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Check, ChevronsUpDown, Layers } from "lucide-react";
import { useData } from "@/components/providers/data-provider";
import { useI18n } from "@/components/providers/i18n-provider";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatCompact, formatSignedCurrency } from "@/lib/format";
import { cn } from "@/lib/utils";

interface MonthStat {
  pnl: number;
  count: number;
}

/**
 * Dropdown pemilih akun untuk kalender.
 * - "Semua akun" → total gabungan seluruh akun
 * - satu akun     → hanya akun tersebut
 * Pilihan disimpan di query `?account=` supaya konsisten dengan halaman lain.
 */
export function CalendarAccountSelect({
  monthPrefix,
  className,
}: {
  /** Format `YYYY-MM` untuk menghitung PnL bulan yang sedang dilihat. */
  monthPrefix: string;
  className?: string;
}) {
  const { accounts, trades } = useData();
  const { t } = useI18n();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const activeId = searchParams.get("account");
  const active = accounts.find((a) => a.id === activeId) ?? null;

  const perAccount = React.useMemo(() => {
    const map = new Map<string, MonthStat>();
    for (const trade of trades) {
      if (trade.status !== "closed") continue;
      if (!trade.traded_at.startsWith(monthPrefix)) continue;
      const key = trade.account_id ?? "__none__";
      const entry = map.get(key) ?? { pnl: 0, count: 0 };
      entry.pnl += trade.pnl;
      entry.count += 1;
      map.set(key, entry);
    }
    return map;
  }, [trades, monthPrefix]);

  const totals = React.useMemo(() => {
    let pnl = 0;
    let count = 0;
    perAccount.forEach((v) => {
      pnl += v.pnl;
      count += v.count;
    });
    return { pnl, count };
  }, [perAccount]);

  /** Angka di trigger mengikuti pilihan aktif, bukan selalu total gabungan. */
  const activeStat: MonthStat | null = activeId
    ? (perAccount.get(activeId) ?? { pnl: 0, count: 0 })
    : totals;

  const currencies = React.useMemo(
    () => new Set(accounts.map((a) => a.currency)),
    [accounts],
  );
  const mixed = currencies.size > 1;

  /** Label pendek: nomor akun MT5 lebih informatif daripada nama broker panjang. */
  function shortName(account: (typeof accounts)[number]) {
    return account.mt5_account_number ? `#${account.mt5_account_number}` : account.name;
  }

  function select(id: string | null) {
    const params = new URLSearchParams(searchParams.toString());
    if (id) params.set("account", id);
    else params.delete("account");
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  }

  function money(value: number) {
    // Kalau akun spesifik dipilih, selalu pakai mata uang akun itu.
    if (active) {
      return formatSignedCurrency(value, active.currency, { compact: true });
    }
    // Mode "semua akun" dengan mata uang campur → jangan klaim simbol apa pun.
    if (mixed) {
      const sign = value > 0 ? "+" : value < 0 ? "−" : "";
      return `${sign}${formatCompact(Math.abs(value))}`;
    }
    return formatSignedCurrency(value, accounts[0]?.currency ?? "USD", { compact: true });
  }

  if (accounts.length === 0) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={cn(
          "inline-flex h-9 max-w-[240px] items-center gap-2 rounded-lg border border-border/70 bg-card/50 px-3 text-xs font-medium transition hover:border-border hover:bg-accent/60",
          className,
        )}
      >
        <span
          className="h-2 w-2 shrink-0 rounded-full"
          style={{ backgroundColor: active?.color ?? "#b2ff05" }}
        />
        <span className="truncate">
          {active
            ? t("calendar.accountPrefix", { account: shortName(active) })
            : t("calendar.allAccounts")}
        </span>
        <span
          className={cn(
            "tabular ml-auto shrink-0 font-mono text-[10px]",
            activeStat.pnl > 0 ? "text-profit" : activeStat.pnl < 0 ? "text-loss" : "text-muted-foreground",
          )}
        >
          {activeStat.count > 0 ? money(activeStat.pnl) : "—"}
        </span>
        <ChevronsUpDown className="h-3 w-3 shrink-0 opacity-50" />
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-72">
        <DropdownMenuLabel>{t("calendar.selectAccount")}</DropdownMenuLabel>

        <DropdownMenuItem onClick={() => select(null)} className="gap-2">
          <Layers className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
          <span className="flex-1 truncate">{t("calendar.allAccounts")}</span>
          <span
            className={cn(
              "tabular shrink-0 font-mono text-[10px]",
              totals.pnl > 0 ? "text-profit" : totals.pnl < 0 ? "text-loss" : "text-muted-foreground",
            )}
          >
            {totals.count > 0 ? money(totals.pnl) : "—"}
          </span>
          {!activeId && <Check className="h-3.5 w-3.5 shrink-0 text-primary" />}
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        {accounts.map((account) => {
          const stat = perAccount.get(account.id);
          return (
            <DropdownMenuItem
              key={account.id}
              onClick={() => select(account.id)}
              className="gap-2"
            >
              <span
                className="h-2 w-2 shrink-0 rounded-full"
                style={{ backgroundColor: account.color }}
              />
              <span className="flex min-w-0 flex-1 flex-col">
                <span className="truncate text-xs">
                  {shortName(account)}
                  {account.mt5_account_number && (
                    <span className="ml-1.5 text-[10px] font-normal text-muted-foreground">
                      {account.broker}
                    </span>
                  )}
                </span>
                <span className="text-[10px] text-muted-foreground">
                  {account.currency}
                  {stat ? ` · ${stat.count} ${t("common.trades")}` : ` · ${t("calendar.noTradesShort")}`}
                </span>
              </span>
              <span
                className={cn(
                  "tabular shrink-0 font-mono text-[10px]",
                  (stat?.pnl ?? 0) > 0
                    ? "text-profit"
                    : (stat?.pnl ?? 0) < 0
                      ? "text-loss"
                      : "text-muted-foreground",
                )}
              >
                {stat ? formatSignedCurrency(stat.pnl, account.currency, { compact: true }) : "—"}
              </span>
              {activeId === account.id && <Check className="h-3.5 w-3.5 shrink-0 text-primary" />}
            </DropdownMenuItem>
          );
        })}

        {mixed && (
          <>
            <DropdownMenuSeparator />
            <p className="px-2 py-1.5 text-[10px] leading-relaxed text-muted-foreground">
              {t("calendar.mixedCurrency")}
            </p>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

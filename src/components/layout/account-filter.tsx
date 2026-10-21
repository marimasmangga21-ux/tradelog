"use client";

import * as React from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Check, ChevronsUpDown, Wallet } from "lucide-react";
import { useI18n } from "@/components/providers/i18n-provider";
import { useData } from "@/components/providers/data-provider";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const FILTERABLE_ROUTES = ["/dashboard", "/trades", "/journal", "/calendar", "/analytics"];

export function AccountFilter({ className }: { className?: string }) {
  const { accounts } = useData();
  const { t } = useI18n();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const activeId = searchParams.get("account");
  const active = accounts.find((a) => a.id === activeId);

  const enabled = FILTERABLE_ROUTES.some(
    (r) => pathname === r || pathname.startsWith(`${r}/`),
  );

  if (!enabled || accounts.length === 0) return null;

  function select(id: string | null) {
    const params = new URLSearchParams(searchParams.toString());
    if (id) params.set("account", id);
    else params.delete("account");
    params.delete("page");
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={cn(
          "inline-flex h-9 max-w-[220px] items-center gap-2 rounded-lg border border-border/70 bg-card/50 px-3 text-xs font-medium transition hover:border-border hover:bg-accent/60",
          className,
        )}
      >
        <span
          className="h-2 w-2 shrink-0 rounded-full"
          style={{ backgroundColor: active?.color ?? "hsl(var(--muted-foreground))" }}
        />
        <span className="truncate">{active?.name ?? t("trades.filterAccount")}</span>
        <ChevronsUpDown className="ml-auto h-3 w-3 shrink-0 opacity-50" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-64">
        <DropdownMenuLabel>{t("nav.accounts")}</DropdownMenuLabel>
        <DropdownMenuItem onClick={() => select(null)} className="gap-2">
          <Wallet className="h-4 w-4" />
          <span className="flex-1">{t("trades.filterAccount")}</span>
          {!activeId && <Check className="h-3.5 w-3.5 text-primary" />}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        {accounts.map((account) => (
          <DropdownMenuItem
            key={account.id}
            onClick={() => select(account.id)}
            className="gap-2"
          >
            <span
              className="h-2 w-2 shrink-0 rounded-full"
              style={{ backgroundColor: account.color }}
            />
            <span className="flex-1 truncate">{account.name}</span>
            <span className="text-[10px] uppercase text-muted-foreground">
              {account.currency}
            </span>
            {activeId === account.id && <Check className="h-3.5 w-3.5 text-primary" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

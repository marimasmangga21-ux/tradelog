"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart2,
  BookOpen,
  Calendar,
  ChevronLeft,
  ChevronRight,
  ChevronsUpDown,
  FileText,
  HelpCircle,
  LayoutGrid,
  LifeBuoy,
  LogOut,
  Plus,
  Settings,
  Smartphone,
  TrendingUp,
  User,
  Wallet,
} from "lucide-react";
import { useI18n } from "@/components/providers/i18n-provider";
import { useData } from "@/components/providers/data-provider";
import { useSidebar } from "@/components/layout/sidebar-context";
import { GoogleIcon } from "@/components/auth/google-icon";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

export interface NavItem {
  href: string;
  label: string;
  icon: React.ElementType;
}

export const NAV_ITEMS: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutGrid },
  { href: "/analytics", label: "Analytics", icon: BarChart2 },
  { href: "/trades", label: "Trades", icon: TrendingUp },
  { href: "/journal", label: "Journals", icon: FileText },
  { href: "/calendar", label: "Calendar", icon: Calendar },
  { href: "/strategies", label: "Strategies", icon: BookOpen },
  { href: "/accounts", label: "Accounts", icon: Wallet },
  { href: "/preview", label: "Mobile Studio", icon: Smartphone },
];

export const BOTTOM_ITEMS: NavItem[] = [
  { href: "/settings", label: "Settings", icon: Settings },
  { href: "/settings#help", label: "Help and Support", icon: LifeBuoy },
];

export function Sidebar() {
  const pathname = usePathname();
  const { collapsed, toggle } = useSidebar();
  const { accounts, profile, logout } = useData();

  const totalBalance = accounts.reduce((acc, a) => acc + (a.initial_balance || 0), 0);
  const userName = profile?.name || "Trader";
  const userEmail = profile?.email || null;
  const userAvatar = profile?.avatar_url || null;

  return (
    <aside
      className={cn(
        "fixed inset-y-0 left-0 z-50 hidden flex-col border-r border-[#1a1a1a] bg-black transition-[width] duration-200 ease-out lg:flex",
        collapsed ? "w-[72px]" : "w-[240px]",
      )}
    >
      {/* Brand Header */}
      <div className={cn("flex h-16 shrink-0 items-center px-4", collapsed ? "justify-center" : "gap-3")}>
        <img
          src="/logo-icon.png"
          alt="Tradelog Logo"
          className="h-8 w-8 shrink-0 rounded-[7px] object-contain"
        />
        {!collapsed && (
          <div className="flex items-center min-w-0">
            <img
              src="/logo-text.png"
              alt="TRADELOG"
              className="h-[15px] w-auto max-w-[130px] object-contain"
            />
          </div>
        )}
      </div>

      {/* Account Selector Card */}
      {!collapsed ? (
        <div className="mx-2 mb-2">
          <button
            type="button"
            className="w-full rounded-md border border-[#1a1a1a] bg-[#090909] px-3 py-2.5 text-left transition-colors hover:border-[#292929]"
          >
            <div className="flex items-center justify-between">
              <div className="min-w-0">
                <p className="truncate text-xs font-medium text-[#f2f2f0]">All Accounts</p>
                <p className="mt-0.5 font-mono text-xs text-[#a0a0a0]">
                  ${totalBalance.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                </p>
              </div>
              <Wallet className="h-4 w-4 text-[#a0a0a0]" strokeWidth={1.5} />
            </div>
          </button>
        </div>
      ) : (
        <div className="mb-2 flex justify-center">
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                className="flex h-10 w-10 items-center justify-center rounded-md border border-[#1a1a1a] bg-[#090909] text-[#a0a0a0] hover:text-[#f2f2f0]"
              >
                <Wallet className="h-4 w-4" strokeWidth={1.5} />
              </button>
            </TooltipTrigger>
            <TooltipContent side="right">All Accounts</TooltipContent>
          </Tooltip>
        </div>
      )}

      {/* Nav List */}
      <nav className="flex-1 space-y-1 overflow-y-auto px-2 py-1">
        {NAV_ITEMS.map((item) => {
          const active =
            pathname === item.href ||
            (item.href !== "/dashboard" && pathname.startsWith(`${item.href}/`));
          const Icon = item.icon;

          if (collapsed) {
            return (
              <Tooltip key={item.href}>
                <TooltipTrigger asChild>
                  <Link
                    href={item.href}
                    className={cn(
                      "flex h-10 w-10 items-center justify-center rounded-md transition-colors",
                      active
                        ? "bg-[#121214] text-[#b2ff05]"
                        : "text-[#a0a0a0] hover:bg-[#121214]/60 hover:text-[#f2f2f0]",
                    )}
                  >
                    <Icon className="h-[18px] w-[18px]" strokeWidth={1.5} />
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="right">{item.label}</TooltipContent>
              </Tooltip>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-[#121214] text-[#b2ff05]"
                  : "text-[#a0a0a0] hover:bg-[#121214]/60 hover:text-[#f2f2f0]",
              )}
            >
              <Icon
                className={cn(
                  "h-[18px] w-[18px] shrink-0 transition-colors",
                  active ? "text-[#b2ff05]" : "text-[#a0a0a0] group-hover:text-[#f2f2f0]",
                )}
                strokeWidth={1.5}
              />
              <span className="truncate">{item.label}</span>
            </Link>
          );
        })}

        <div className="my-2 border-t border-[#1a1a1a]" />

        {BOTTOM_ITEMS.map((item) => {
          const active = pathname === item.href;
          const Icon = item.icon;

          if (collapsed) {
            return (
              <Tooltip key={item.href}>
                <TooltipTrigger asChild>
                  <Link
                    href={item.href}
                    className={cn(
                      "flex h-10 w-10 items-center justify-center rounded-md transition-colors",
                      active
                        ? "bg-[#121214] text-[#b2ff05]"
                        : "text-[#a0a0a0] hover:bg-[#121214]/60 hover:text-[#f2f2f0]",
                    )}
                  >
                    <Icon className="h-[18px] w-[18px]" strokeWidth={1.5} />
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="right">{item.label}</TooltipContent>
              </Tooltip>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-[#121214] text-[#b2ff05]"
                  : "text-[#a0a0a0] hover:bg-[#121214]/60 hover:text-[#f2f2f0]",
              )}
            >
              <Icon
                className={cn(
                  "h-[18px] w-[18px] shrink-0 transition-colors",
                  active ? "text-[#b2ff05]" : "text-[#a0a0a0] group-hover:text-[#f2f2f0]",
                )}
                strokeWidth={1.5}
              />
              <span className="truncate">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Bottom Profile & Collapse */}
      <div className="border-t border-[#1a1a1a] p-2 space-y-1">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className={cn(
                "group flex w-full items-center rounded-lg text-xs font-medium text-[#a0a0a0] transition-colors hover:bg-[#121214] hover:text-[#f2f2f0]",
                collapsed ? "h-10 w-10 justify-center p-0" : "gap-2.5 px-2.5 py-2",
              )}
            >
              {userAvatar ? (
                <img
                  src={userAvatar}
                  alt={userName}
                  className="h-6 w-6 shrink-0 rounded-full object-cover ring-1 ring-white/10"
                />
              ) : (
                <div className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-[#1c1c1c] text-[#a0a0a0] group-hover:text-[#b2ff05]">
                  <User className="h-3.5 w-3.5" />
                </div>
              )}

              {!collapsed && (
                <div className="flex flex-1 items-center justify-between min-w-0 text-left">
                  <div className="min-w-0">
                    <p className="truncate text-xs font-semibold text-[#f2f2f0]">{userName}</p>
                    <p className="truncate text-[10px] text-[#71717a]">
                      {userEmail || "Local Trader"}
                    </p>
                  </div>
                  <ChevronsUpDown className="h-3 w-3 text-[#5c5c5c] shrink-0 ml-1" />
                </div>
              )}
            </button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" side="right" className="w-56 border-[#222228] bg-[#0c0c0e]/95 backdrop-blur-xl">
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <div className="flex items-center gap-1.5">
                  <p className="text-xs font-semibold text-[#f4f4f5]">{userName}</p>
                  {userEmail && <GoogleIcon className="h-3.5 w-3.5" />}
                </div>
                <p className="text-[10px] text-[#71717a] truncate">{userEmail || "Mode Lokal"}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-[#222228]" />

            <DropdownMenuItem asChild>
              <Link href="/settings" className="cursor-pointer gap-2 text-xs">
                <Settings className="h-3.5 w-3.5 text-[#a1a1aa]" />
                <span>Pengaturan Akun</span>
              </Link>
            </DropdownMenuItem>

            <DropdownMenuItem
              onClick={() => void logout()}
              className="cursor-pointer gap-2 text-xs text-red-400 focus:text-red-400 focus:bg-red-500/10"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span>Keluar Akun</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <button
          type="button"
          onClick={toggle}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          className={cn(
            "flex items-center rounded-md text-xs text-[#5c5c5c] hover:bg-[#121214] hover:text-[#a0a0a0]",
            collapsed ? "h-10 w-10 justify-center" : "gap-2 w-full px-3 py-2",
          )}
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <>
              <ChevronLeft className="h-4 w-4" />
              <span>Collapse</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
}

export function MobileNav() {
  const pathname = usePathname();

  // Jangan render bottom nav luar jika sedang berada di halaman studio /preview
  if (pathname === "/preview") return null;

  const mobileTabs = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutGrid },
    { href: "/analytics", label: "Analytics", icon: BarChart2 },
    { href: "/trades/new", label: "Add", icon: Plus, isAction: true },
    { href: "/trades", label: "Trades", icon: TrendingUp },
    { href: "/calendar", label: "Calendar", icon: Calendar },
  ];

  return (
    <nav className="glass-dock fixed inset-x-0 bottom-0 z-40 px-4 pt-2 pb-[max(env(safe-area-inset-bottom),8px)] lg:hidden">
      <div className="mx-auto flex max-w-md items-center justify-between">
        {mobileTabs.map((item) => {
          const isAction = (item as any).isAction;
          const active =
            pathname === item.href ||
            (item.href !== "/dashboard" && !isAction && pathname.startsWith(`${item.href}`));
          const Icon = item.icon;

          if (isAction) {
            return (
              <Link
                key={item.href}
                href={item.href}
                className="group relative -top-3 flex flex-col items-center"
                aria-label="Add Trade / Strategy"
              >
                <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-[#b2ff05] text-black shadow-[0_0_24px_rgba(178,255,5,0.6)] ring-4 ring-[#09090b] transition-all duration-200 group-hover:scale-105 group-active:scale-95">
                  <Plus className="h-6 w-6 stroke-[3] transition-transform duration-200 group-hover:rotate-90" />
                </div>
              </Link>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group flex flex-1 flex-col items-center py-1 transition-all duration-200 active:scale-95",
                active ? "text-[#b2ff05]" : "text-[#71717a] hover:text-[#e4e4e7]"
              )}
            >
              <div className="relative flex items-center justify-center">
                <Icon
                  className={cn(
                    "h-5 w-5 transition-all duration-200",
                    active
                      ? "stroke-[2.5] text-[#b2ff05] drop-shadow-[0_0_8px_rgba(178,255,5,0.6)]"
                      : "stroke-[1.75] text-[#71717a] group-hover:text-[#e4e4e7]"
                  )}
                />
              </div>
              <span
                className={cn(
                  "mt-1 text-[10px] tracking-tight transition-colors",
                  active ? "font-semibold text-[#b2ff05]" : "font-medium text-[#71717a]"
                )}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

export function MobileMenuList({ onSelect }: { onSelect?: () => void }) {
  const pathname = usePathname();
  const { logout } = useData();
  // Hilangkan Mobile Studio dari menu di HP, tambahkan Settings
  const mobileNavItems = [
    ...NAV_ITEMS.filter((item) => item.href !== "/preview"),
    { href: "/settings", label: "Settings", icon: Settings },
  ];

  return (
    <div className="space-y-1">
      {mobileNavItems.map((item) => {
        const active = pathname === item.href;
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onSelect}
            className={cn(
              "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
              active
                ? "bg-[#b2ff05]/15 text-[#b2ff05] font-semibold"
                : "text-[#a0a0a0] hover:bg-white/[0.04] hover:text-white",
            )}
          >
            <Icon className="h-4 w-4" />
            <span>{item.label}</span>
          </Link>
        );
      })}

      <div className="pt-2 border-t border-[#222228] mt-2">
        <button
          type="button"
          onClick={() => {
            onSelect?.();
            void logout();
          }}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-red-400 hover:bg-red-500/10 transition-colors text-left"
        >
          <LogOut className="h-4 w-4" />
          <span>Keluar Akun</span>
        </button>
      </div>
    </div>
  );
}

"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { LogOut, Menu, Plus, RefreshCw, Smartphone, Zap } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { MobileMenuList } from "@/components/layout/sidebar";
import { useData } from "@/components/providers/data-provider";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export function Topbar() {
  const pathname = usePathname();
  const { syncMt5, syncingMt5, profile, logout } = useData();
  const [drawerOpen, setDrawerOpen] = React.useState(false);

  async function handleSync() {
    toast.info("Syncing MT5 accounts...", { duration: 2500 });
    const success = await syncMt5();
    if (success) {
      toast.success("MT5 sync success!", {
        description: "Semua riwayat & open trade akun MT5 berhasil diperbarui.",
      });
    } else {
      toast.error("MT5 sync failed", {
        description: "Pastikan MetaTrader 5 sedang terbuka di komputer.",
      });
    }
  }

  const title = React.useMemo(() => {
    if (pathname.startsWith("/preview")) return "iPhone 17 Pro Max Simulator";
    if (pathname.startsWith("/trades/new")) return "Log Trade";
    if (pathname.startsWith("/trades/")) return "Trade Details";
    if (pathname.startsWith("/trades")) return "Trades";
    if (pathname.startsWith("/journal")) return "Journals";
    if (pathname.startsWith("/calendar")) return "Calendar";
    if (pathname.startsWith("/accounts")) return "Accounts";
    if (pathname.startsWith("/strategies")) return "Strategies";
    if (pathname.startsWith("/analytics")) return "Analytics";
    if (pathname.startsWith("/settings")) return "Settings";
    return "Dashboard";
  }, [pathname]);

  return (
    <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center border-b border-[#1a1a1a] bg-black/90 px-3 backdrop-blur-md sm:px-6">
      {/* Mobile Topbar View: Logo TRADELOG + Profil Pill + Logout + Drawer */}
      <div className="flex w-full items-center justify-between lg:hidden">
        <Link href="/dashboard" className="flex items-center gap-2">
          <img
            src="/logo-icon.png"
            alt="TRADELOG"
            className="h-7 w-7 rounded-lg object-contain shadow-[0_0_12px_rgba(178,255,5,0.4)]"
          />
          <span className="font-mono text-base font-extrabold tracking-wider text-[#b2ff05]">
            TRADELOG
          </span>
        </Link>

        <div className="flex items-center gap-1.5">
          <Link
            href="/settings"
            className="flex items-center gap-1.5 rounded-full bg-[#121215] p-1 pr-2.5 border border-[#222228] hover:border-[#b2ff05]/40 transition-colors"
          >
            <img
              src={profile?.avatar_url || "https://api.dicebear.com/7.x/avataaars/svg?seed=Evan"}
              alt={profile?.name || "Evan Mita"}
              className="h-6 w-6 rounded-full bg-[#27272a] object-cover"
            />
            <span className="text-[11px] font-semibold text-white max-w-[80px] truncate">
              {profile?.name || "Evan Mita"}
            </span>
          </Link>

          <button
            type="button"
            onClick={() => void logout()}
            className="flex h-8 w-8 items-center justify-center rounded-xl border border-[#222228] bg-[#141418] text-[#a1a1aa] hover:border-red-500/40 hover:bg-red-500/10 hover:text-red-400 transition-colors"
            title="Keluar / Logout"
            aria-label="Logout"
          >
            <LogOut className="h-3.5 w-3.5" />
          </button>

          <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
            <SheetTrigger asChild>
              <button
                type="button"
                className="flex h-8 w-8 items-center justify-center rounded-xl border border-[#222228] bg-[#141418] text-[#a1a1aa] hover:border-[#b2ff05]/40 hover:text-white transition-colors"
                aria-label="Open menu"
              >
                <Menu className="h-4 w-4" />
              </button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[280px] border-[#222228] bg-[#09090b] p-5 text-white">
              <SheetHeader className="text-left pb-4 border-b border-[#222228]">
                <SheetTitle className="flex items-center gap-2 text-white">
                  <img src="/logo-icon.png" alt="TRADELOG" className="h-6 w-6 rounded-md" />
                  <span className="font-mono text-sm font-extrabold tracking-wider text-[#b2ff05]">
                    TRADELOG
                  </span>
                </SheetTitle>
              </SheetHeader>
              <div className="mt-5 space-y-4">
                <MobileMenuList onSelect={() => setDrawerOpen(false)} />
                <div className="pt-4 border-t border-[#222228]">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setDrawerOpen(false);
                      handleSync();
                    }}
                    disabled={syncingMt5}
                    className="w-full justify-center gap-2 rounded-xl border-[#222228] bg-[#121215] text-xs text-white hover:border-[#b2ff05]/40 hover:text-[#b2ff05]"
                  >
                    <RefreshCw className={cn("h-3.5 w-3.5", syncingMt5 && "animate-spin text-[#b2ff05]")} />
                    <span>{syncingMt5 ? "Syncing..." : "Sync MT5"}</span>
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* Desktop Topbar View (Expanded Layout) */}
      <div className="mx-auto hidden h-full w-full max-w-[1280px] items-center justify-between lg:flex">
        <h1 className="font-semibold tracking-tight text-[#f2f2f0] text-sm sm:text-base">{title}</h1>

        <div className="flex items-center gap-1.5 sm:gap-2">
          <Link
            href="/preview"
            className={cn(
              "hidden md:flex h-8 items-center gap-1.5 rounded-md border border-[#1a1a1a] bg-[#121214] px-2.5 text-xs font-medium text-[#a0a0a0] transition-colors hover:border-[#b2ff05]/40 hover:bg-[#b2ff05]/10 hover:text-[#b2ff05]",
              pathname === "/preview" && "border-[#b2ff05]/50 bg-[#b2ff05]/15 text-[#b2ff05]"
            )}
            title="iPhone 17 Pro Max Interactive Simulator"
          >
            <Smartphone className="h-3.5 w-3.5" />
            <span>iPhone 17 Pro</span>
          </Link>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleSync}
            disabled={syncingMt5}
            className="h-8 gap-1.5 border-[#1c1c1f] bg-[#121215] px-2 sm:px-2.5 text-xs text-[#a0a0a0] transition-colors hover:border-[#b2ff05]/40 hover:bg-[#b2ff05]/10 hover:text-[#b2ff05]"
          >
            <RefreshCw
              className={cn("h-3.5 w-3.5", syncingMt5 && "animate-spin text-[#b2ff05]")}
            />
            <span className="hidden sm:inline">
              {syncingMt5 ? "Syncing..." : "Sync MT5"}
            </span>
          </Button>

          <Link
            href="/trades/new"
            className="hidden sm:inline-flex items-center gap-1.5 rounded-md bg-[#b2ff05] px-3 py-1.5 text-xs font-semibold text-black transition-colors hover:bg-[#8fcc04]"
          >
            <Plus className="h-3.5 w-3.5" strokeWidth={2.5} />
            <span>Log Trade</span>
          </Link>

          {/* User profile pill */}
          <Link
            href="/settings"
            className="flex h-8 items-center gap-2 rounded-full border border-[#222228] bg-[#121215] p-1 pr-3 transition-colors hover:border-[#b2ff05]/40"
            title={profile?.email ? `Login sebagai ${profile.name} (${profile.email})` : "Pengaturan Akun"}
          >
            {profile?.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt={profile.name || "User"}
                className="h-6 w-6 rounded-full object-cover"
              />
            ) : (
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#27272a] text-[11px] font-bold text-[#b2ff05]">
                {(profile?.name || "T").slice(0, 1).toUpperCase()}
              </span>
            )}
            <span className="text-xs font-semibold text-white max-w-[100px] truncate">
              {profile?.name || "Evan Mita"}
            </span>
          </Link>

          {/* Direct Logout Button */}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => void logout()}
            className="h-8 gap-1.5 border-[#222228] bg-[#121215] px-2.5 text-xs text-[#a0a0a0] transition-colors hover:border-red-500/40 hover:bg-red-500/10 hover:text-red-400"
            title="Keluar dari akun Tradelog"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Keluar</span>
          </Button>
        </div>
      </div>
    </header>
  );
}

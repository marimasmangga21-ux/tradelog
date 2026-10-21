import type { Metadata } from "next";
import { Sidebar, MobileNav } from "@/components/layout/sidebar";
import { SidebarProvider } from "@/components/layout/sidebar-context";
import { AppContent } from "@/components/layout/app-content";
import { DataProvider } from "@/components/providers/data-provider";
import { CommandPalette } from "@/components/layout/command-palette";
import { loadAll } from "@/lib/data/queries";

export const metadata: Metadata = {
  title: "Dashboard",
};

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const { profile, accounts, strategies, trades, journals, emotions } = await loadAll();

  return (
    <DataProvider
      initialProfile={profile}
      initialAccounts={accounts}
      initialStrategies={strategies}
      initialTrades={trades}
      initialJournals={journals}
      initialEmotions={emotions}
    >
      <SidebarProvider>
        <div className="min-h-dvh bg-background text-foreground">
          <Sidebar />
          <AppContent>{children}</AppContent>
          <MobileNav />
          <CommandPalette />
        </div>
      </SidebarProvider>
    </DataProvider>
  );
}

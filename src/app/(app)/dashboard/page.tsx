import type { Metadata } from "next";
import { DashboardView } from "@/components/dashboard/dashboard-view";
import { loadAll } from "@/lib/data/queries";

export const metadata: Metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const { accounts, strategies, trades, journals, emotions, profile, isSample } = await loadAll();

  return (
    <DashboardView
      accounts={accounts}
      strategies={strategies}
      trades={trades}
      journals={journals}
      emotions={emotions}
      userName={profile.name || "Trader"}
      hideAmounts={profile.hide_amounts}
      isSample={isSample}
    />
  );
}

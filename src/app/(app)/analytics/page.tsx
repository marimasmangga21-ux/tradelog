import type { Metadata } from "next";
import { AnalyticsView } from "@/components/analytics/analytics-view";
import { loadAccounts, loadProfile, loadStrategies } from "@/lib/data/queries";
import type { Currency } from "@/lib/types";

export const metadata: Metadata = { title: "Analitik" };

export default async function AnalyticsPage() {
  const [strategies, accounts, profile] = await Promise.all([
    loadStrategies(),
    loadAccounts(),
    loadProfile(),
  ]);

  const currency: Currency = profile.default_currency ?? accounts[0]?.currency ?? "USD";

  return (
    <AnalyticsView
      strategies={strategies}
      hideAmounts={profile.hide_amounts}
      defaultCurrency={currency}
    />
  );
}

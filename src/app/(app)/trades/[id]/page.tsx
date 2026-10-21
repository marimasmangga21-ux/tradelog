import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { TradeDetailView } from "@/components/trades/trade-detail-view";
import {
  loadAccounts,
  loadEmotions,
  loadJournals,
  loadProfile,
  loadScreenshots,
  loadStrategies,
  loadTrade,
} from "@/lib/data/queries";

export const metadata: Metadata = { title: "Detail Trade" };

export default async function TradeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [trade, accounts, strategies, journals, emotions, screenshots, profile] = await Promise.all([
    loadTrade(id),
    loadAccounts(),
    loadStrategies(),
    loadJournals(),
    loadEmotions(),
    loadScreenshots(id),
    loadProfile(),
  ]);

  if (!trade) notFound();

  const account = accounts.find((a) => a.id === trade.account_id) ?? null;
  const strategy = strategies.find((s) => s.id === trade.strategy_id) ?? null;
  const relatedJournals = journals.filter((j) => j.trade_id === trade.id);

  return (
    <TradeDetailView
      trade={trade}
      account={account}
      strategy={strategy}
      strategies={strategies}
      screenshots={screenshots}
      journals={relatedJournals}
      emotions={emotions}
      hideAmounts={profile.hide_amounts}
    />
  );
}

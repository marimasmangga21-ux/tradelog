import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { TradeForm } from "@/components/trades/trade-form";
import { PageHeader } from "@/components/shared/page-header";
import {
  loadAccounts,
  loadEmotions,
  loadJournals,
  loadProfile,
  loadScreenshots,
  loadStrategies,
  loadTrade,
} from "@/lib/data/queries";

export const metadata: Metadata = { title: "Edit Trade" };

export default async function EditTradePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [trade, accounts, strategies, screenshots, profile, emotions, journals] = await Promise.all([
    loadTrade(id),
    loadAccounts(),
    loadStrategies(),
    loadScreenshots(id),
    loadProfile(),
    loadEmotions(),
    loadJournals(),
  ]);

  if (!trade) notFound();

  return (
    <div>
      <PageHeader
        title="Edit Trade & Jurnal"
        description={`${trade.instrument} · ${new Date(trade.traded_at).toLocaleDateString("id-ID")}`}
      />
      <TradeForm
        trade={trade}
        accounts={accounts}
        strategies={strategies}
        screenshots={screenshots}
        emotions={emotions}
        journals={journals}
        canUploadScreenshots
        hideAmounts={profile.hide_amounts}
      />
    </div>
  );
}

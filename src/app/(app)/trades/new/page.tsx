import type { Metadata } from "next";
import { TradeForm } from "@/components/trades/trade-form";
import { PageHeader } from "@/components/shared/page-header";
import {
  loadAccounts,
  loadEmotions,
  loadJournals,
  loadProfile,
  loadStrategies,
} from "@/lib/data/queries";

export const metadata: Metadata = { title: "Catat Trade" };

export default async function NewTradePage() {
  const [accounts, strategies, profile, emotions, journals] = await Promise.all([
    loadAccounts(),
    loadStrategies(),
    loadProfile(),
    loadEmotions(),
    loadJournals(),
  ]);

  return (
    <div>
      <PageHeader
        title="Catat Trade & Jurnal"
        description="Target selesai cepat. Lengkapi eksekusi trade dan 8 alur jurnal evaluasi psikologi trading."
      />
      <TradeForm
        accounts={accounts}
        strategies={strategies}
        emotions={emotions}
        journals={journals}
        canUploadScreenshots
        hideAmounts={profile.hide_amounts}
      />
    </div>
  );
}

import type { Metadata } from "next";
import { TradesView } from "@/components/trades/trades-view";
import { loadProfile } from "@/lib/data/queries";

export const metadata: Metadata = { title: "Log Trade" };

export default async function TradesPage() {
  const profile = await loadProfile();
  return <TradesView hideAmounts={profile.hide_amounts} />;
}

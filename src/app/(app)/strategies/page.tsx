import type { Metadata } from "next";
import { StrategiesView } from "@/components/strategies/strategies-view";
import { loadProfile } from "@/lib/data/queries";

export const metadata: Metadata = { title: "Strategy Playbook" };

export default async function StrategiesPage() {
  const profile = await loadProfile();
  return <StrategiesView hideAmounts={profile.hide_amounts} />;
}

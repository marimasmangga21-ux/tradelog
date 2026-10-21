import type { Metadata } from "next";
import { JournalView } from "@/components/journal/journal-view";
import { loadProfile } from "@/lib/data/queries";

export const metadata: Metadata = { title: "Jurnal Emosi" };

export default async function JournalPage() {
  const profile = await loadProfile();
  return <JournalView hideAmounts={profile.hide_amounts} />;
}

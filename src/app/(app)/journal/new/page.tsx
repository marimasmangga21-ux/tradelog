import type { Metadata } from "next";
import { JournalNewView } from "@/components/journal/journal-new-view";

export const metadata: Metadata = { title: "Tulis Jurnal" };

export default async function NewJournalPage({
  searchParams,
}: {
  searchParams: Promise<{ trade?: string }>;
}) {
  const params = await searchParams;
  return <JournalNewView defaultTradeId={params.trade ?? null} />;
}

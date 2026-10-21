import type { Metadata } from "next";
import { CalendarView } from "@/components/calendar/calendar-view";
import { loadAccounts, loadProfile } from "@/lib/data/queries";
import type { Currency } from "@/lib/types";

export const metadata: Metadata = { title: "Kalender Performa" };

export default async function CalendarPage() {
  const [accounts, profile] = await Promise.all([loadAccounts(), loadProfile()]);

  const currency: Currency = profile.default_currency ?? accounts[0]?.currency ?? "USD";
  const startBalance = accounts.reduce((a, acc) => a + acc.initial_balance, 0);

  return (
    <CalendarView
      hideAmounts={profile.hide_amounts}
      defaultCurrency={currency}
      startBalance={startBalance}
    />
  );
}

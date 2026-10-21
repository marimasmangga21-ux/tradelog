import type { Metadata } from "next";
import { SettingsView, type SettingsProfile } from "@/components/settings/settings-view";
import { loadAll } from "@/lib/data/queries";

export const metadata: Metadata = { title: "Pengaturan" };

export default async function SettingsPage() {
  const { profile, accounts, strategies, trades } = await loadAll();

  const viewProfile: SettingsProfile = {
    name: profile.name || "Trader",
    email: profile.email,
    avatarUrl: profile.avatar_url,
    memberSince: profile.created_at,
    hideAmounts: profile.hide_amounts,
    defaultCurrency: profile.default_currency,
    timezone: profile.timezone,
  };

  return (
    <SettingsView
      profile={viewProfile}
      usage={{ accounts: accounts.length, strategies: strategies.length, trades: trades.length }}
    />
  );
}

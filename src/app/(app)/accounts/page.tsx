import type { Metadata } from "next";
import { AccountsView } from "@/components/accounts/accounts-view";
import { loadProfile } from "@/lib/data/queries";

export const metadata: Metadata = { title: "Akun" };

export default async function AccountsPage() {
  const profile = await loadProfile();
  return <AccountsView hideAmounts={profile.hide_amounts} />;
}

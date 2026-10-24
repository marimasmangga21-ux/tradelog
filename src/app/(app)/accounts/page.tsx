import type { Metadata } from "next";
import { AccountsView } from "@/components/accounts/accounts-view";
import { loadProfile, loadAccounts } from "@/lib/data/queries";

export const metadata: Metadata = { title: "Akun" };

export default async function AccountsPage() {
  const [profile, accounts] = await Promise.all([loadProfile(), loadAccounts()]);
  return <AccountsView hideAmounts={profile.hide_amounts} initialAccounts={accounts} />;
}

"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  Database,
  Download,
  Eye,
  Globe,
  Languages,
  Loader2,
  LogOut,
  Palette,
  RefreshCw,
  Trash2,
  TriangleAlert,
  User,
} from "lucide-react";
import { GoogleIcon } from "@/components/auth/google-icon";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { useI18n } from "@/components/providers/i18n-provider";
import { useTheme } from "next-themes";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Segmented } from "@/components/ui/segmented";
import { CURRENCIES } from "@/lib/constants";
import { localeLabels, type Locale } from "@/lib/i18n";
import type { Currency } from "@/lib/types";

export interface SettingsProfile {
  name: string;
  email: string | null;
  avatarUrl: string | null;
  memberSince: string | null;
  hideAmounts: boolean;
  defaultCurrency: Currency;
  timezone: string;
}

export function SettingsView({
  profile,
  usage,
}: {
  profile: SettingsProfile;
  usage: { accounts: number; strategies: number; trades: number };
}) {
  const { t, locale, setLocale } = useI18n();
  const { theme, setTheme } = useTheme();
  const router = useRouter();

  const [name, setName] = React.useState(profile.name);
  const [currency, setCurrency] = React.useState<Currency>(profile.defaultCurrency);
  const [hideAmounts, setHideAmounts] = React.useState(profile.hideAmounts);
  const [saving, setSaving] = React.useState(false);
  const [resetMode, setResetMode] = React.useState<"empty" | "sample" | null>(null);

  async function savePreferences(payload: Record<string, unknown>) {
    setSaving(true);
    try {
      const res = await fetch("/api/preferences", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = (await res.json()) as { ok: boolean; error?: string };
      if (!data.ok) {
        toast.error(t("common.error"), { description: data.error });
        return;
      }
      toast.success(t("settings.saved"));
      router.refresh();
    } catch {
      toast.error(t("errors.network"));
    } finally {
      setSaving(false);
    }
  }

  async function handleReset(mode: "empty" | "sample") {
    setResetMode(null);
    try {
      const res = await fetch(`/api/data?mode=${mode}`, { method: "DELETE" });
      const data = (await res.json()) as { ok: boolean; error?: string };
      if (!data.ok) {
        toast.error(t("common.error"), { description: data.error });
        return;
      }
      toast.success(mode === "empty" ? t("settings.startEmptyDone") : t("settings.loadSampleDone"));
      router.refresh();
    } catch {
      toast.error(t("errors.network"));
    }
  }

  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader title={t("settings.title")} description={t("settings.subtitle")} />

      <div className="space-y-4">
        {/* Profil */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm">
              <User className="h-3.5 w-3.5 text-primary" />
              {t("settings.profile")}
            </CardTitle>
            <p className="text-[11px] text-muted-foreground">{t("settings.profileDesc")}</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="grid h-12 w-12 shrink-0 place-items-center overflow-hidden rounded-full bg-gradient-to-br from-primary/30 to-primary/10 text-base font-semibold text-primary ring-1 ring-white/10">
                  {profile.avatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={profile.avatarUrl} alt={name} className="h-full w-full object-cover" />
                  ) : (
                    (name || "T").slice(0, 1).toUpperCase()
                  )}
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">{name || "Trader"}</p>
                  <p className="truncate text-[11px] text-muted-foreground">
                    {profile.email ? profile.email : t("settings.localAccount")}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={async () => {
                    await fetch("/api/auth/logout", { method: "POST" });
                    window.location.href = "/login";
                  }}
                  className="h-8 gap-1 text-xs text-red-400 hover:text-red-400 hover:bg-red-500/10"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  <span>Keluar</span>
                </Button>
              </div>
            </div>

            <Separator />

            <form
              onSubmit={(e) => {
                e.preventDefault();
                void savePreferences({ name });
              }}
              className="space-y-4"
            >
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="name">{t("settings.name")}</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={t("settings.namePlaceholder")}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="timezone">{t("settings.timezone")}</Label>
                  <Input id="timezone" value={profile.timezone} readOnly disabled className="opacity-70" />
                </div>
              </div>

              <div className="flex justify-end">
                <Button
                  type="submit"
                  size="sm"
                  disabled={saving || name === profile.name}
                  className="bg-[#b2ff05] text-black hover:bg-[#b2ff05]/90 font-medium px-4 h-8 text-xs"
                >
                  {saving ? (
                    <>
                      <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                      Menyimpan...
                    </>
                  ) : (
                    "Simpan Profil"
                  )}
                </Button>
              </div>
            </form>

            {profile.memberSince && (
              <p className="text-[11px] text-muted-foreground">
                {t("settings.memberSince")}:{" "}
                <span className="text-foreground/80">
                  {new Date(profile.memberSince).toLocaleDateString(
                    locale === "id" ? "id-ID" : "en-US",
                    { month: "long", year: "numeric" },
                  )}
                </span>
              </p>
            )}
          </CardContent>
        </Card>

        {/* Preferensi */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm">
              <Palette className="h-3.5 w-3.5 text-primary" />
              {t("settings.preferences")}
            </CardTitle>
            <p className="text-[11px] text-muted-foreground">{t("settings.preferencesDesc")}</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label className="flex items-center gap-1.5">
                <Languages className="h-3.5 w-3.5 text-muted-foreground" />
                {t("settings.language")}
              </Label>
              <Segmented<Locale>
                value={locale}
                onChange={(next) => setLocale(next)}
                options={(["id", "en"] as Locale[]).map((l) => ({
                  value: l,
                  label: `${localeLabels[l].flag} ${localeLabels[l].label}`,
                }))}
              />
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-2">
                <Label className="flex items-center gap-1.5">
                  <Globe className="h-3.5 w-3.5 text-muted-foreground" />
                  {t("settings.defaultCurrency")}
                </Label>
                <Select
                  value={currency}
                  onValueChange={(v) => {
                    setCurrency(v as Currency);
                    void savePreferences({ default_currency: v });
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CURRENCIES.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>{t("settings.theme")}</Label>
                <Segmented<"dark" | "light">
                  value={(theme as "dark" | "light") ?? "dark"}
                  onChange={(next) => setTheme(next)}
                  options={[
                    { value: "dark", label: t("common.dark") },
                    { value: "light", label: t("common.light") },
                  ]}
                />
              </div>
            </div>

            <div className="flex items-center justify-between rounded-lg border border-border/70 bg-muted/20 px-3 py-2.5">
              <div className="flex items-start gap-2">
                <Eye className="mt-0.5 h-3.5 w-3.5 text-muted-foreground" />
                <div>
                  <p className="text-xs font-medium">{t("settings.hideAmounts")}</p>
                  <p className="text-[10px] text-muted-foreground">{t("settings.hideAmountsDesc")}</p>
                </div>
              </div>
              <Switch
                checked={hideAmounts}
                onCheckedChange={(checked) => {
                  setHideAmounts(checked);
                  void savePreferences({ hide_amounts: checked });
                }}
              />
            </div>
          </CardContent>
        </Card>

        {/* Data */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm">
              <Database className="h-3.5 w-3.5 text-primary" />
              {t("settings.data")}
            </CardTitle>
            <p className="text-[11px] text-muted-foreground">{t("settings.dataDesc")}</p>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid gap-2 sm:grid-cols-3">
              <Stat label={t("nav.trades")} value={usage.trades} />
              <Stat label={t("nav.accounts")} value={usage.accounts} />
              <Stat label={t("nav.strategies")} value={usage.strategies} />
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border/70 px-3 py-2.5">
              <div>
                <p className="text-xs font-medium">{t("settings.exportData")}</p>
                <p className="text-[10px] text-muted-foreground">{t("settings.exportDesc")}</p>
              </div>
              <Button asChild size="sm" variant="outline" className="gap-1.5">
                <a href="/api/export/trades" download>
                  <Download className="h-3.5 w-3.5" />
                  CSV
                </a>
              </Button>
            </div>

            <div className="rounded-lg border border-border/70 bg-muted/20 px-3 py-2.5">
              <p className="text-[11px] leading-relaxed text-muted-foreground">
                {t("settings.storageNote")}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Danger zone */}
        <Card className="border-loss/25">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm text-loss">
              <TriangleAlert className="h-3.5 w-3.5" />
              {t("settings.dangerZone")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border/70 px-3 py-2.5">
              <div>
                <p className="text-xs font-medium">{t("settings.startEmpty")}</p>
                <p className="text-[10px] text-muted-foreground">{t("settings.startEmptyDesc")}</p>
              </div>
              <Button
                size="sm"
                variant="outline"
                className="border-loss/40 text-loss hover:bg-loss/10 hover:text-loss"
                onClick={() => setResetMode("empty")}
              >
                <Trash2 className="h-3.5 w-3.5" />
                {t("settings.startEmpty")}
              </Button>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border/70 px-3 py-2.5">
              <div>
                <p className="text-xs font-medium">{t("settings.loadSample")}</p>
                <p className="text-[10px] text-muted-foreground">{t("settings.loadSampleDesc")}</p>
              </div>
              <Button size="sm" variant="outline" onClick={() => setResetMode("sample")}>
                <RefreshCw className="h-3.5 w-3.5" />
                {t("settings.loadSample")}
              </Button>
            </div>
          </CardContent>
        </Card>

        {saving && (
          <p className="flex items-center justify-center gap-1.5 text-[11px] text-muted-foreground">
            <Loader2 className="h-3 w-3 animate-spin" />
            {t("common.saving")}
          </p>
        )}
      </div>

      <AlertDialog open={resetMode !== null} onOpenChange={(open) => !open && setResetMode(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {resetMode === "sample" ? t("settings.loadSample") : t("settings.startEmpty")}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {resetMode === "sample"
                ? t("settings.loadSampleConfirm")
                : t("settings.startEmptyConfirm")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => void handleReset(resetMode ?? "empty")}
              className="bg-loss text-white hover:bg-loss/90"
            >
              {t("common.confirm")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-border/70 bg-muted/20 px-3 py-2">
      <p className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="tabular mt-0.5 text-lg font-semibold">{value}</p>
    </div>
  );
}

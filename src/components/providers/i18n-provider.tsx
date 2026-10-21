"use client";

import * as React from "react";
import {
  createTranslator,
  getList,
  LOCALE_COOKIE,
  localeLabels,
  type Locale,
  type Translator,
} from "@/lib/i18n";

interface I18nContextValue {
  locale: Locale;
  t: Translator;
  setLocale: (locale: Locale) => void;
  list: <T = unknown>(path: string) => T;
  labels: (typeof localeLabels)[Locale];
}

const I18nContext = React.createContext<I18nContextValue | null>(null);

export function I18nProvider({
  initialLocale,
  children,
}: {
  initialLocale: Locale;
  children: React.ReactNode;
}) {
  const [locale, setLocaleState] = React.useState<Locale>(initialLocale);

  const setLocale = React.useCallback((next: Locale) => {
    setLocaleState(next);
    document.cookie = `${LOCALE_COOKIE}=${next};path=/;max-age=${60 * 60 * 24 * 365};samesite=lax`;
    document.documentElement.lang = next;
    // Simpan ke profil bila user login (best-effort, tidak blocking)
    void fetch("/api/preferences", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ locale: next }),
    }).catch(() => {});
  }, []);

  const t = React.useMemo(() => createTranslator(locale), [locale]);

  const value = React.useMemo<I18nContextValue>(
    () => ({
      locale,
      t,
      setLocale,
      list: <T,>(path: string) => getList<T>(locale, path),
      labels: localeLabels[locale],
    }),
    [locale, t, setLocale],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = React.useContext(I18nContext);
  if (!ctx) {
    throw new Error("useI18n harus dipakai di dalam I18nProvider");
  }
  return ctx;
}

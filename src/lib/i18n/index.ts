import { id, type Dictionary } from "./dictionaries/id";
import { en } from "./dictionaries/en";

export type Locale = "id" | "en";

export const dictionaries: Record<Locale, Dictionary> = { id, en };
export const locales: Locale[] = ["id", "en"];
export const defaultLocale: Locale = "id";

export const localeLabels: Record<Locale, { label: string; flag: string; short: string }> = {
  id: { label: "Bahasa Indonesia", flag: "🇮🇩", short: "ID" },
  en: { label: "English", flag: "🇬🇧", short: "EN" },
};

export const LOCALE_COOKIE = "tradelog_locale";

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale] ?? dictionaries[defaultLocale];
}

/** Ambil nilai nested dengan path "a.b.c" */
export function getNestedValue(obj: unknown, path: string): unknown {
  return path.split(".").reduce<unknown>((acc, key) => {
    if (acc && typeof acc === "object" && key in (acc as Record<string, unknown>)) {
      return (acc as Record<string, unknown>)[key];
    }
    return undefined;
  }, obj);
}

/** Interpolasi {placeholder} */
export function interpolate(template: string, vars?: Record<string, string | number>): string {
  if (!vars) return template;
  return template.replace(/\{(\w+)\}/g, (_, key) =>
    vars[key] !== undefined ? String(vars[key]) : `{${key}}`,
  );
}

export type Translator = (path: string, vars?: Record<string, string | number>) => string;

export function createTranslator(locale: Locale): Translator {
  const dict = getDictionary(locale);
  return (path, vars) => {
    const value = getNestedValue(dict, path);
    if (typeof value === "string") return interpolate(value, vars);
    return path;
  };
}

/** Ambil array/objek mentah (untuk list seperti FAQ) */
export function getList<T = unknown>(locale: Locale, path: string): T {
  return getNestedValue(getDictionary(locale), path) as T;
}

export type { Dictionary };

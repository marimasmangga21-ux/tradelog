import type { Metadata, Viewport } from "next";
import { Manrope, JetBrains_Mono } from "next/font/google";
import { cookies, headers } from "next/headers";
import { AppProviders } from "@/components/providers/app-providers";
import { LOCALE_COOKIE, defaultLocale, type Locale } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import "./globals.css";

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Tradelog — Jurnal Trading Forex",
    template: "%s · Tradelog",
  },
  description:
    "Jurnal trading forex pribadi. Catat setiap eksekusi, emosi, dan strategi — lalu lihat edge kamu lewat data nyata.",
  keywords: ["jurnal trading", "trading journal", "forex", "jurnal forex", "analitik trading"],
  authors: [{ name: "Tradelog" }],
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#050d0b" },
    { media: "(prefers-color-scheme: light)", color: "#f8fafc" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

async function resolveLocale(): Promise<Locale> {
  const cookieStore = await cookies();
  const fromCookie = cookieStore.get(LOCALE_COOKIE)?.value;
  if (fromCookie === "id" || fromCookie === "en") return fromCookie;

  try {
    const headerStore = await headers();
    const fromHeader = headerStore.get("x-tradelog-locale");
    if (fromHeader === "id" || fromHeader === "en") return fromHeader;
  } catch {
    // headers() tidak tersedia di konteks tertentu
  }

  return defaultLocale;
}

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const locale = await resolveLocale();

  return (
    <html lang={locale} className="dark" suppressHydrationWarning>
      <body className={cn(manrope.variable, mono.variable, "font-sans bg-black text-[#f2f2f0]")}>
        <AppProviders locale={locale}>{children}</AppProviders>
      </body>
    </html>
  );
}

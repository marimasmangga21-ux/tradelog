"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider, useTheme } from "next-themes";
import { Toaster } from "sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { I18nProvider } from "@/components/providers/i18n-provider";
import type { Locale } from "@/lib/i18n";

export function AppProviders({
  locale,
  children,
}: {
  locale: Locale;
  children: React.ReactNode;
}) {
  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    const update = () => setIsMobile(window.innerWidth < 1024);
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      storageKey="tradelog-theme"
      value={{ light: "light", dark: "dark" }}
      disableTransitionOnChange={false}
    >
      <I18nProvider initialLocale={locale}>
        <TooltipProvider delayDuration={200}>
          <ThemeDocumentSync />
          {children}
          <ThemedToaster isMobile={isMobile} />
        </TooltipProvider>
      </I18nProvider>
    </NextThemesProvider>
  );
}

function ThemeDocumentSync() {
  const { resolvedTheme } = useTheme();

  React.useEffect(() => {
    const theme = resolvedTheme === "light" ? "light" : "dark";
    document.documentElement.dataset.theme = theme;
  }, [resolvedTheme]);

  return null;
}

function ThemedToaster({ isMobile }: { isMobile: boolean }) {
  const { resolvedTheme } = useTheme();
  return (
    <Toaster
      position={isMobile ? "top-center" : "bottom-right"}
      theme={resolvedTheme === "light" ? "light" : "dark"}
      richColors
      closeButton
      toastOptions={{
        classNames: {
          toast:
            "border border-border/80 bg-card text-card-foreground shadow-card rounded-xl text-sm",
          description: "text-muted-foreground",
        },
      }}
    />
  );
}

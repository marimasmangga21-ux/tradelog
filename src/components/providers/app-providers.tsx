"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
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
      defaultTheme="dark"
      enableSystem={false}
      disableTransitionOnChange
    >
      <I18nProvider initialLocale={locale}>
        <TooltipProvider delayDuration={200}>
          {children}
          <Toaster
            position={isMobile ? "top-center" : "bottom-right"}
            theme="dark"
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
        </TooltipProvider>
      </I18nProvider>
    </NextThemesProvider>
  );
}

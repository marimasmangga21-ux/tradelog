import Link from "next/link";
import { cookies } from "next/headers";
import { LayoutDashboard, Compass } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LOCALE_COOKIE, defaultLocale, getDictionary, type Locale } from "@/lib/i18n";

export default async function NotFound() {
  const store = await cookies();
  const cookie = store.get(LOCALE_COOKIE)?.value;
  const locale: Locale = cookie === "en" || cookie === "id" ? cookie : defaultLocale;
  const t = getDictionary(locale).notFound;

  return (
    <main className="relative grid min-h-dvh place-items-center overflow-hidden px-5 py-16">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.35]"
        style={{
          background:
            "radial-gradient(60% 50% at 50% 0%, rgba(23,180,130,0.18), transparent 70%)",
        }}
      />
      <div className="relative w-full max-w-md text-center">
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl border border-border/70 bg-card/60 backdrop-blur">
          <Compass className="h-6 w-6 text-primary" />
        </div>

        <p className="mt-6 font-mono text-5xl font-semibold tracking-tight text-gradient-brand">
          {t.code}
        </p>
        <h1 className="mt-3 text-xl font-semibold tracking-tight sm:text-2xl">{t.title}</h1>
        <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground">
          {t.desc}
        </p>

        <div className="mt-7 flex flex-col justify-center gap-2 sm:flex-row">
          <Button asChild className="gap-2">
            <Link href="/dashboard">
              <LayoutDashboard className="h-4 w-4" />
              {t.backHome}
            </Link>
          </Button>
        </div>
      </div>
    </main>
  );
}

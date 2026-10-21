"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  BarChart3,
  BookOpen,
  CalendarDays,
  LineChart,
  NotebookPen,
  Plus,
  Search,
  Settings,
  Wallet,
} from "lucide-react";
import { useI18n } from "@/components/providers/i18n-provider";
import { cn } from "@/lib/utils";

interface Command {
  id: string;
  label: string;
  hint?: string;
  href: string;
  icon: React.ElementType;
  keywords?: string;
}

export function CommandPalette() {
  const router = useRouter();
  const { t } = useI18n();
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const [index, setIndex] = React.useState(0);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const commands: Command[] = React.useMemo(
    () => [
      { id: "new-trade", label: t("trades.new"), href: "/trades/new", icon: Plus, hint: "N", keywords: "tambah catat log" },
      { id: "trades", label: t("nav.trades"), href: "/trades", icon: LineChart, keywords: "log daftar" },
      { id: "journal", label: t("nav.journal"), href: "/journal", icon: NotebookPen, keywords: "emosi refleksi" },
      { id: "calendar", label: t("nav.calendar"), href: "/calendar", icon: CalendarDays, keywords: "kalender pnl" },
      { id: "analytics", label: t("nav.analytics"), href: "/analytics", icon: BarChart3, keywords: "statistik metrik" },
      { id: "accounts", label: t("nav.accounts"), href: "/accounts", icon: Wallet, keywords: "akun prop firm" },
      { id: "strategies", label: t("nav.strategies"), href: "/strategies", icon: BookOpen, keywords: "playbook strategi" },
      { id: "settings", label: t("nav.settings"), href: "/settings", icon: Settings, keywords: "profil pengaturan" },
    ],
    [t],
  );

  const filtered = React.useMemo(() => {
    if (!query.trim()) return commands;
    const q = query.toLowerCase();
    return commands.filter(
      (c) => c.label.toLowerCase().includes(q) || c.keywords?.includes(q),
    );
  }, [commands, query]);

  React.useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      const target = e.target as HTMLElement;
      const isTyping =
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable;

      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((v) => !v);
        return;
      }
      if (!isTyping && e.key.toLowerCase() === "n" && !e.metaKey && !e.ctrlKey && !e.altKey) {
        e.preventDefault();
        router.push("/trades/new");
        return;
      }
      if (!isTyping && e.key === "/") {
        e.preventDefault();
        setOpen(true);
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [router]);

  React.useEffect(() => {
    if (open) {
      setQuery("");
      setIndex(0);
      setTimeout(() => inputRef.current?.focus(), 30);
    }
  }, [open]);

  React.useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setIndex((i) => Math.min(i + 1, filtered.length - 1));
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setIndex((i) => Math.max(i - 1, 0));
      }
      if (e.key === "Enter" && filtered[index]) {
        e.preventDefault();
        router.push(filtered[index].href);
        setOpen(false);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, filtered, index, router]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-start justify-center pt-[12vh]">
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={() => setOpen(false)}
      />
      <div className="relative z-10 w-[calc(100%-2rem)] max-w-lg overflow-hidden rounded-2xl border border-border bg-card shadow-2xl">
        <div className="flex items-center gap-2 border-b border-border/70 px-4">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setIndex(0);
            }}
            placeholder={t("common.search") + "…"}
            className="h-12 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
          <kbd className="kbd">ESC</kbd>
        </div>
        <div className="max-h-80 overflow-y-auto p-2">
          {filtered.length === 0 && (
            <p className="px-3 py-8 text-center text-sm text-muted-foreground">
              {t("common.none")}
            </p>
          )}
          {filtered.map((cmd, i) => {
            const Icon = cmd.icon;
            return (
              <button
                key={cmd.id}
                onMouseEnter={() => setIndex(i)}
                onClick={() => {
                  router.push(cmd.href);
                  setOpen(false);
                }}
                className={cn(
                  "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors",
                  i === index ? "bg-accent text-foreground" : "text-muted-foreground",
                )}
              >
                <Icon className="h-4 w-4" />
                <span className="flex-1 text-left">{cmd.label}</span>
                {cmd.hint && <kbd className="kbd">{cmd.hint}</kbd>}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

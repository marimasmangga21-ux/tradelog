"use client";

import * as React from "react";
import Link from "next/link";
import {
  Wallet,
  Target,
  PlusCircle,
  BookOpen,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  LoaderCircle,
  HelpCircle,
} from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export function OnboardingGuide({
  hasAccounts,
  hasStrategies,
  hasTrades,
  hasJournals,
}: {
  hasAccounts: boolean;
  hasStrategies: boolean;
  hasTrades: boolean;
  hasJournals: boolean;
}) {
  const router = useRouter();
  const [loadingDemo, setLoadingDemo] = React.useState(false);

  const handleLoadDemo = async () => {
    if (!confirm("Muat 24 data trade contoh untuk melihat simulasi dashboard dan analitik?")) {
      return;
    }
    setLoadingDemo(true);
    try {
      const res = await fetch("/api/data?mode=sample", { method: "DELETE" });
      if (res.ok) {
        toast.success("Data simulasi contoh berhasil dimuat!");
        router.refresh();
      } else {
        toast.error("Gagal memuat data contoh.");
      }
    } catch {
      toast.error("Terjadi kesalahan jaringan.");
    } finally {
      setLoadingDemo(false);
    }
  };

  const steps = [
    {
      num: "01",
      title: "Buat Akun Trading",
      desc: "Tentukan portofolio trading Anda (mis. Akun Live IC Markets, Prop Firm FTMO, atau Demo), atur saldo awal dan mata uang.",
      icon: Wallet,
      done: hasAccounts,
      href: "/accounts",
      actionText: "1. Buat Akun",
    },
    {
      num: "02",
      title: "Tentukan Strategi (SOP)",
      desc: "Rumuskan rule setup trading Anda (mis. ICT Silver Bullet, Breakout FVG, Scalping) beserta batasan risiko maksimal.",
      icon: Target,
      done: hasStrategies,
      href: "/strategies",
      actionText: "2. Buat Strategi",
    },
    {
      num: "03",
      title: "Catat Eksekusi Posisi",
      desc: "Setiap selesai open posisi, catat detail pair, entry, Stop Loss, Take Profit, dan lampirkan screenshot analisis chart.",
      icon: PlusCircle,
      done: hasTrades,
      href: "/trades/new",
      actionText: "3. Catat Trade",
    },
    {
      num: "04",
      title: "Evaluasi Psikologi & Review",
      desc: "Tulis pelajaran dan evaluasi emosi di Jurnal saat posisi tertutup, lalu pantau kurva ekuitas & Win Rate di Dashboard.",
      icon: BookOpen,
      done: hasJournals,
      href: "/journal",
      actionText: "4. Buka Jurnal",
    },
  ];

  return (
    <section className="relative overflow-hidden rounded-2xl border border-[#222228] bg-gradient-to-b from-[#141418] to-[#0c0c0f] p-5 md:p-6 shadow-xl mb-6">
      {/* Accent glow line */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#b2ff05] to-transparent opacity-80" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-white/[0.05]">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#b2ff05]/10 border border-[#b2ff05]/20 text-[11px] font-bold text-[#b2ff05] uppercase tracking-wider mb-2">
            <HelpCircle className="h-3 w-3" />
            <span>Alur Panduan Penggunaan</span>
          </div>
          <h2 className="text-lg md:text-xl font-bold text-white tracking-tight">
            Selamat Datang di Tradelog Precision Journal
          </h2>
          <p className="text-xs md:text-sm text-zinc-400 mt-1 max-w-2xl">
            Akun Anda siap digunakan. Ikuti 4 urutan langkah di bawah ini untuk memulai pencatatan dan evaluasi trading yang terstruktur:
          </p>
        </div>

        {/* Load demo simulation button */}
        <button
          type="button"
          onClick={handleLoadDemo}
          disabled={loadingDemo}
          className="self-start sm:self-center shrink-0 inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-white/[0.08] bg-[#1a1a22] hover:bg-[#22222c] hover:border-[#b2ff05]/40 text-xs font-semibold text-zinc-200 hover:text-white transition-all shadow-sm"
        >
          {loadingDemo ? (
            <LoaderCircle className="h-3.5 w-3.5 animate-spin text-[#b2ff05]" />
          ) : (
            <Sparkles className="h-3.5 w-3.5 text-[#b2ff05]" />
          )}
          <span>Muat Data Contoh (Simulasi)</span>
        </button>
      </div>

      {/* 4 Steps Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 pt-5">
        {steps.map((step) => {
          const Icon = step.icon;
          return (
            <div
              key={step.num}
              className={`relative flex flex-col justify-between p-4 rounded-xl border transition-all ${
                step.done
                  ? "border-emerald-500/20 bg-emerald-500/[0.02]"
                  : "border-white/[0.06] bg-[#101014] hover:border-white/[0.12]"
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[11px] font-mono font-bold text-zinc-500">
                    LANGKAH {step.num}
                  </span>
                  {step.done ? (
                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-full border border-emerald-400/20">
                      <CheckCircle2 className="h-3 w-3" />
                      <span>Selesai</span>
                    </span>
                  ) : (
                    <span className="text-[10px] font-semibold text-zinc-400 bg-white/[0.04] px-2 py-0.5 rounded-full">
                      Belum
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2.5 mb-2">
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                      step.done
                        ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                        : "bg-[#b2ff05]/10 text-[#b2ff05] border border-[#b2ff05]/20"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                  </div>
                  <h3 className="text-sm font-bold text-zinc-100">{step.title}</h3>
                </div>

                <p className="text-xs text-zinc-400 leading-relaxed mb-4">
                  {step.desc}
                </p>
              </div>

              <Link
                href={step.href}
                className={`w-full inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-bold transition-all ${
                  step.done
                    ? "bg-zinc-800/60 hover:bg-zinc-800 text-zinc-300 hover:text-white"
                    : "bg-[#b2ff05] hover:bg-[#9fe600] text-black shadow-sm shadow-[#b2ff05]/20"
                }`}
              >
                <span>{step.actionText}</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          );
        })}
      </div>
    </section>
  );
}

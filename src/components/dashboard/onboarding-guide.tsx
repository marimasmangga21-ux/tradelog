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
  Database,
  LoaderCircle,
  Compass,
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
      desc: "Tentukan portofolio trading Anda (mis. Live Broker, Prop Firm, atau Demo), atur saldo awal dan mata uang.",
      icon: Wallet,
      done: hasAccounts,
      href: "/accounts",
      actionText: "1. Buat Akun",
    },
    {
      num: "02",
      title: "Tentukan Strategi (SOP)",
      desc: "Rumuskan setup rules trading Anda (mis. ICT Silver Bullet, Breakout FVG) beserta batas risiko.",
      icon: Target,
      done: hasStrategies,
      href: "/strategies",
      actionText: "2. Buat Strategi",
    },
    {
      num: "03",
      title: "Catat Eksekusi Posisi",
      desc: "Setiap open posisi, catat pair, harga entry, Stop Loss, Take Profit, dan lampirkan screenshot chart.",
      icon: PlusCircle,
      done: hasTrades,
      href: "/trades/new",
      actionText: "3. Catat Trade",
    },
    {
      num: "04",
      title: "Evaluasi Psikologi & Review",
      desc: "Tulis pelajaran dan evaluasi emosi di Jurnal saat posisi tertutup, lalu pantau kurva ekuitas di Dashboard.",
      icon: BookOpen,
      done: hasJournals,
      href: "/journal",
      actionText: "4. Buka Jurnal",
    },
  ];

  return (
    <section className="rounded-2xl border border-[#222228] bg-[#0c0c0e] p-5 md:p-6 shadow-xl mb-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-[#222228]">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-[#18181c] border border-[#282830] text-[11px] font-semibold text-zinc-300 uppercase tracking-wider mb-2">
            <Compass className="h-3 w-3 text-zinc-400" />
            <span>Alur Panduan Penggunaan</span>
          </div>
          <h2 className="text-lg md:text-xl font-bold text-white tracking-tight">
            Selamat Datang di Tradelog Precision Journal
          </h2>
          <p className="text-xs md:text-sm text-zinc-400 mt-1 max-w-2xl">
            Akun Anda siap digunakan. Ikuti 4 urutan langkah di bawah ini untuk memulai pencatatan dan evaluasi trading yang terstruktur:
          </p>
        </div>

        {/* Load demo simulation button - Solid, elegant, professional */}
        <button
          type="button"
          onClick={handleLoadDemo}
          disabled={loadingDemo}
          className="self-start sm:self-center shrink-0 inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[#2c2c34] bg-[#16161a] hover:bg-[#202026] text-xs font-semibold text-zinc-200 hover:text-white transition-colors shadow-sm"
        >
          {loadingDemo ? (
            <LoaderCircle className="h-3.5 w-3.5 animate-spin text-zinc-400" />
          ) : (
            <Database className="h-3.5 w-3.5 text-zinc-400" />
          )}
          <span>Muat Data Contoh</span>
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
                  ? "border-emerald-500/20 bg-[#101412]"
                  : "border-[#222228] bg-[#121215] hover:border-[#2e2e36]"
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[11px] font-mono font-bold text-zinc-500">
                    LANGKAH {step.num}
                  </span>
                  {step.done ? (
                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                      <CheckCircle2 className="h-3 w-3" />
                      <span>Selesai</span>
                    </span>
                  ) : (
                    <span className="text-[10px] font-semibold text-zinc-400 bg-[#1c1c22] border border-[#282830] px-2 py-0.5 rounded-md">
                      Belum
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2.5 mb-2">
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border ${
                      step.done
                        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                        : "bg-[#18181c] text-zinc-200 border-[#282832]"
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
                    ? "bg-[#1a1a20] hover:bg-[#22222a] text-zinc-300 hover:text-white border border-[#2a2a34]"
                    : "bg-[#b2ff05] hover:bg-[#9fe000] text-black shadow-sm"
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

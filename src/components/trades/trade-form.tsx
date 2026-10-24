"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  AlertCircle,
  ArrowRight,
  Check,
  ChevronDown,
  Clock,
  Loader2,
  Save,
  Calculator,
} from "lucide-react";
import { z } from "zod";
import { useI18n } from "@/components/providers/i18n-provider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Combobox } from "@/components/ui/combobox";
import { DirectionPicker, Segmented } from "@/components/ui/segmented";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ScreenshotUploader,
  type ScreenshotState,
} from "@/components/trades/screenshot-uploader";
import { createTrade, updateTrade } from "@/app/actions/trades";
import { INSTRUMENTS, SESSIONS } from "@/lib/constants";
import { SessionTimeHint } from "@/components/trades/session-time-hint";
import { formatR } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Account, Emotion, Journal, Strategy, Trade, TradeScreenshot } from "@/lib/types";
import { createJournal, updateJournal } from "@/app/actions/journal";

const formSchema = z.object({
  traded_at: z.string().min(1),
  instrument: z.string().min(1, "Pair wajib diisi"),
  direction: z.enum(["long", "short"]),
  session: z.enum(["asia", "london", "new_york", "sydney", "other"]),
  account_id: z.string().nullable(),
  strategy_id: z.string().nullable(),
  entry_price: z.string(),
  stop_loss: z.string(),
  take_profit: z.string(),
  exit_price: z.string(),
  position_size: z.string(),
  pnl: z.string(),
  r_multiple: z.string(),
  risk_amount: z.string(),
  status: z.enum(["open", "closed"]),
  exit_reason: z.string(),
  notes: z.string(),
  tags: z.string(),
});

type FormValues = z.infer<typeof formSchema>;

function toLocalInputValue(iso?: string | null): string {
  const d = iso ? new Date(iso) : new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function detectSession(date: Date): "asia" | "london" | "new_york" | "sydney" | "other" {
  const hour = date.getUTCHours();
  if (hour >= 0 && hour < 7) return "asia";
  if (hour >= 7 && hour < 12) return "london";
  if (hour >= 12 && hour < 21) return "new_york";
  return "sydney";
}

function num(value: string): number | null {
  const cleaned = value.replace(/\s/g, "").replace(/,/g, ".");
  if (cleaned === "" || cleaned === "-") return null;
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : null;
}

export function TradeForm({
  trade,
  accounts,
  strategies,
  screenshots: initialScreenshots = [],
  canUploadScreenshots,
  screenshotLockReason,
  defaultAccountId,
  hideAmounts,
  emotions = [],
  journals = [],
}: {
  trade?: Trade;
  accounts: Account[];
  strategies: Strategy[];
  screenshots?: TradeScreenshot[];
  canUploadScreenshots: boolean;
  screenshotLockReason?: string;
  defaultAccountId?: string | null;
  hideAmounts?: boolean;
  emotions?: Emotion[];
  journals?: Journal[];
}) {
  const { t } = useI18n();
  const router = useRouter();
  const isEdit = Boolean(trade);

  const [screenshots, setScreenshots] = React.useState<ScreenshotState[]>(() => {
    const map = new Map(initialScreenshots.map((s) => [s.timeframe, s]));
    return (["htf", "mtf", "ltf"] as const).map((tf) => ({
      timeframe: tf,
      url: null,
      path: map.get(tf)?.storage_path ?? null,
    }));
  });
  const [submitting, setSubmitting] = React.useState(false);
  const [createdTradeId, setCreatedTradeId] = React.useState<string | null>(trade?.id ?? null);
  const [showAdvanced, setShowAdvanced] = React.useState(false);
  const [elapsed, setElapsed] = React.useState(0);
  const [started, setStarted] = React.useState(false);

  // Timer ringan untuk gamifikasi < 30 detik
  React.useEffect(() => {
    if (!started) return;
    const id = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(id);
  }, [started]);

  const defaultAccount = defaultAccountId ?? accounts[0]?.id ?? null;

  // Temukan jurnal yang sudah ada jika dalam mode edit trade
  const existingJournal = React.useMemo(() => {
    if (!trade?.id) return null;
    return journals.find((j) => j.trade_id === trade.id) ?? null;
  }, [trade?.id, journals]);

  // State untuk 8 Alur Jurnal Psikologi & Evaluasi
  const [journalFlow, setJournalFlow] = React.useState(() => ({
    enabled: true,
    tradeType: (trade?.direction === "short" ? "JUAL" : "BELI") as "BELI" | "JUAL",
    duration: "SCALP" as "SCALP" | "INTRA" | "SWING",
    confluenceReason: "",
    preEmotion: "Tenang & Disiplin",
    tradeResult: ((trade?.pnl ?? 0) > 0 ? "LABA" : (trade?.pnl ?? 0) < 0 ? "RUGI" : "BREAKEVEN") as "LABA" | "RUGI" | "BREAKEVEN",
    exitReasonType: (trade?.exit_reason || "TP") as "TP" | "SL" | "BE" | "MANUAL",
    postEmotion: "Puas & Belajar",
    improvementType: "TEKNIS" as "TEKNIS" | "MANUSIA" | "LANJUTAN",
    improvementNote: existingJournal?.lesson_learned ?? "",
  }));

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      traded_at: toLocalInputValue(trade?.traded_at),
      instrument: trade?.instrument ?? "",
      direction: trade?.direction ?? "long",
      session: trade?.session ?? detectSession(new Date()),
      account_id: trade?.account_id ?? defaultAccount,
      strategy_id: trade?.strategy_id ?? null,
      entry_price: trade?.entry_price?.toString() ?? "",
      stop_loss: trade?.stop_loss?.toString() ?? "",
      take_profit: trade?.take_profit?.toString() ?? "",
      exit_price: trade?.exit_price?.toString() ?? "",
      position_size: trade?.position_size?.toString() ?? "",
      pnl: trade?.pnl ? String(trade.pnl) : "",
      r_multiple: trade?.r_multiple?.toString() ?? "",
      risk_amount: trade?.risk_amount?.toString() ?? "",
      status: trade?.status ?? "closed",
      exit_reason: trade?.exit_reason ?? "",
      notes: trade?.notes ?? "",
      tags: trade?.tags?.join(", ") ?? "",
    },
  });

  const { watch, setValue, control, handleSubmit, formState } = form;
  const values = watch();

  const watchedAccount = accounts.find((a) => a.id === values.account_id);
  const currency = watchedAccount?.currency ?? "USD";

  // R:R otomatis dari harga
  const computedRr = React.useMemo(() => {
    const entry = num(values.entry_price);
    const sl = num(values.stop_loss);
    const tp = num(values.take_profit);
    if (entry === null || sl === null || tp === null) return null;
    const risk = Math.abs(entry - sl);
    const reward = Math.abs(tp - entry);
    if (risk === 0) return null;
    return reward / risk;
  }, [values.entry_price, values.stop_loss, values.take_profit]);

  // R aktual dari exit
  const actualR = React.useMemo(() => {
    const entry = num(values.entry_price);
    const sl = num(values.stop_loss);
    const exit = num(values.exit_price);
    if (entry === null || sl === null || exit === null) return null;
    const risk = Math.abs(entry - sl);
    if (risk === 0) return null;
    return (exit - entry) / (values.direction === "long" ? risk : -risk);
  }, [values.entry_price, values.stop_loss, values.exit_price, values.direction]);

  // Saran risiko % dari saldo akun
  const suggestedRisk = React.useMemo(() => {
    if (!watchedAccount) return null;
    return watchedAccount.initial_balance * 0.005;
  }, [watchedAccount]);

  // Preview hasil
  const previewResult = React.useMemo(() => {
    const pnl = num(values.pnl) ?? 0;
    if (values.status === "open") return "open" as const;
    if (pnl > 0) return "win" as const;
    if (pnl < 0) return "loss" as const;
    return "breakeven" as const;
  }, [values.pnl, values.status]);

  // Set R multiple otomatis dari exit price jika kosong
  React.useEffect(() => {
    if (actualR !== null && values.r_multiple === "") {
      setValue("r_multiple", actualR.toFixed(2));
    }
  }, [actualR, setValue, values.r_multiple]);

  // Saran PnL dari risk amount × R
  const suggestPnl = React.useCallback(() => {
    const r = num(values.r_multiple);
    const risk = num(values.risk_amount) ?? suggestedRisk;
    if (r === null || risk === null) return;
    setValue("pnl", (r * risk).toFixed(2));
  }, [values.r_multiple, values.risk_amount, suggestedRisk, setValue]);

  async function onSubmit(data: FormValues, andNew = false) {
    setSubmitting(true);
    try {
      const payload = {
        id: trade?.id,
        account_id: data.account_id || null,
        strategy_id: data.strategy_id || null,
        traded_at: new Date(data.traded_at).toISOString(),
        closed_at: data.status === "closed" ? new Date(data.traded_at).toISOString() : null,
        instrument: data.instrument,
        direction: data.direction,
        session: data.session,
        status: data.status,
        entry_price: num(data.entry_price),
        stop_loss: num(data.stop_loss),
        take_profit: num(data.take_profit),
        exit_price: num(data.exit_price),
        position_size: num(data.position_size),
        pnl: num(data.pnl) ?? 0,
        pnl_percent:
          watchedAccount && num(data.pnl) !== null && watchedAccount.initial_balance > 0
            ? ((num(data.pnl)! / watchedAccount.initial_balance) * 100).toFixed(4)
            : null,
        fees: 0,
        r_multiple: num(data.r_multiple),
        risk_amount: num(data.risk_amount),
        result: data.status === "open" ? ("open" as const) : undefined,
        exit_reason: data.exit_reason || null,
        notes: data.notes || null,
        tags: data.tags
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
      };

      const result = isEdit ? await updateTrade(payload) : await createTrade(payload);

      if (!result.ok) {
        toast.error(t("common.error"), { description: result.error });
        return;
      }

      // Simpan juga ke modul Jurnal secara otomatis sesuai 8 Alur Jurnal
      if (journalFlow.enabled) {
        const tradeId = result.data?.id ?? trade?.id;
        if (tradeId) {
          const selectedStrat = strategies.find((s) => s.id === data.strategy_id);
          const journalTitle = `[${journalFlow.duration}] ${data.instrument} (${journalFlow.tradeType}) - ${selectedStrat?.name || "Tanpa Strategi"}`;
          const fullContent = [
            `1. Jenis Transaksi: ${journalFlow.tradeType}`,
            `2. Estimasi Durasi: ${journalFlow.duration}`,
            `3. Alasan/Konfluktuasi: ${journalFlow.confluenceReason || "-"}`,
            `4. Emosi Sebelum: ${journalFlow.preEmotion}`,
            `5. Hasil Trade: ${journalFlow.tradeResult}`,
            `6. Alasan Tutup: ${journalFlow.exitReasonType}`,
            `7. Emosi Sesudah: ${journalFlow.postEmotion}`,
            `8. Cara Peningkatan [${journalFlow.improvementType}]: ${journalFlow.improvementNote || "-"}`,
          ].join("\n");

          const journalPayload = {
            id: existingJournal?.id,
            trade_id: tradeId,
            journal_date: data.traded_at.slice(0, 10),
            title: journalTitle,
            mood_score: journalFlow.tradeResult === "LABA" ? 4 : journalFlow.tradeResult === "BREAKEVEN" ? 3 : 2,
            emotion_ids: existingJournal?.emotion_ids ?? [],
            lesson_learned: `[${journalFlow.improvementType}] ${journalFlow.improvementNote || journalFlow.postEmotion}`,
            mistakes: journalFlow.tradeResult === "RUGI" ? journalFlow.confluenceReason || null : null,
            plan_tomorrow: `Fokus pada evaluasi ${journalFlow.improvementType.toLowerCase()}`,
            content: fullContent,
          };

          if (existingJournal?.id) {
            await updateJournal(journalPayload);
          } else {
            await createJournal(journalPayload);
          }
        }
      }

      toast.success(isEdit ? t("trades.updated") : t("trades.saved"));

      if (andNew && !isEdit) {
        form.reset({
          ...form.getValues(),
          instrument: "",
          entry_price: "",
          stop_loss: "",
          take_profit: "",
          exit_price: "",
          position_size: "",
          pnl: "",
          r_multiple: "",
          risk_amount: "",
          exit_reason: "",
          notes: "",
          tags: "",
          traded_at: toLocalInputValue(),
        });
        setElapsed(0);
        setStarted(false);
        router.refresh();
        return;
      }

      router.push(`/trades/${result.data?.id ?? trade?.id}`);
      router.refresh();
    } catch (error) {
      toast.error(t("common.error"), {
        description: error instanceof Error ? error.message : undefined,
      });
    } finally {
      setSubmitting(false);
    }
  }

  // Cmd/Ctrl+Enter untuk submit
  React.useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
        e.preventDefault();
        void handleSubmit((data) => onSubmit(data))();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  const err = formState.errors;

  return (
    <form
      onSubmit={handleSubmit((data) => onSubmit(data))}
      onChange={() => setStarted(true)}
      className="space-y-4"
    >
      <div className="grid gap-4 lg:grid-cols-[1.55fr_1fr]">
        {/* Kolom utama */}
        <div className="space-y-4">
          {/* Section 1: Setup */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2">
                  <span className="grid h-5 w-5 place-items-center rounded bg-primary/15 font-mono text-[10px] text-primary">
                    1
                  </span>
                  Setup
                </span>
                {started && (
                  <span
                    className={cn(
                      "flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-[10px] font-medium tabular",
                      elapsed <= 30
                        ? "border-profit/25 bg-profit/10 text-profit"
                        : "border-warning/25 bg-warning/10 text-warning",
                    )}
                  >
                    <Clock className="h-2.5 w-2.5" />
                    {elapsed}s
                  </span>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3.5">
              {/* Baris 1: instrument + arah */}
              <div className="grid gap-3 sm:grid-cols-[1.4fr_1fr]">
                <div className="space-y-1.5">
                  <Label htmlFor="instrument">{t("trades.instrument")} *</Label>
                  <Controller
                    control={control}
                    name="instrument"
                    render={({ field }) => (
                      <Combobox
                        id="instrument"
                        value={field.value}
                        onChange={field.onChange}
                        options={INSTRUMENTS}
                        placeholder={t("trades.instrumentPlaceholder")}
                        autoFocus
                      />
                    )}
                  />
                  {err.instrument && (
                    <p className="text-[11px] text-loss">{err.instrument.message}</p>
                  )}
                </div>
                <div className="space-y-1.5">
                  <Label>{t("trades.direction")}</Label>
                  <Controller
                    control={control}
                    name="direction"
                    render={({ field }) => (
                      <DirectionPicker value={field.value} onChange={field.onChange} />
                    )}
                  />
                </div>
              </div>

              {/* Baris 2: tanggal + sesi */}
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="traded_at">{t("trades.date")} *</Label>
                  <Input
                    id="traded_at"
                    type="datetime-local"
                    {...form.register("traded_at")}
                    className="tabular"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>{t("trades.session")}</Label>
                  <Controller
                    control={control}
                    name="session"
                    render={({ field }) => (
                      <Segmented
                        size="sm"
                        value={field.value}
                        onChange={field.onChange}
                        options={SESSIONS.map((s) => ({
                          value: s.value,
                          label: s.short,
                          color: s.color,
                        }))}
                      />
                    )}
                  />
                  <Controller
                    control={control}
                    name="session"
                    render={({ field }) => <SessionTimeHint session={field.value} />}
                  />
                </div>
              </div>

              {/* Baris 3: akun + strategi */}
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label>{t("trades.account")}</Label>
                  <Controller
                    control={control}
                    name="account_id"
                    render={({ field }) => (
                      <Select
                        value={field.value ?? "none"}
                        onValueChange={(v) => field.onChange(v === "none" ? null : v)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder={t("trades.filterAccount")} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">{t("common.none")}</SelectItem>
                          {accounts.map((a) => (
                            <SelectItem key={a.id} value={a.id}>
                              <span className="flex items-center gap-2">
                                <span
                                  className="h-1.5 w-1.5 rounded-full"
                                  style={{ backgroundColor: a.color }}
                                />
                                {a.name}
                              </span>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>{t("trades.strategy")}</Label>
                  <Controller
                    control={control}
                    name="strategy_id"
                    render={({ field }) => (
                      <Select
                        value={field.value ?? "none"}
                        onValueChange={(v) => field.onChange(v === "none" ? null : v)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder={t("trades.filterStrategy")} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">{t("common.none")}</SelectItem>
                          {strategies.map((s) => (
                            <SelectItem key={s.id} value={s.id}>
                              <span className="flex items-center gap-2">
                                <span
                                  className="h-1.5 w-1.5 rounded-full"
                                  style={{ backgroundColor: s.color }}
                                />
                                {s.name}
                              </span>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Section 2: Eksekusi */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm">
                <span className="grid h-5 w-5 place-items-center rounded bg-primary/15 font-mono text-[10px] text-primary">
                  2
                </span>
                Eksekusi
                {computedRr !== null && (
                  <span className="ml-auto rounded-md border border-primary/25 bg-primary/10 px-1.5 py-0.5 text-[10px] font-medium text-primary">
                    {t("trades.computedRr")}: 1:{computedRr.toFixed(2)}
                  </span>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <div className="space-y-1.5">
                  <Label htmlFor="entry_price">{t("trades.entry")}</Label>
                  <Input
                    id="entry_price"
                    inputMode="decimal"
                    placeholder="0.00000"
                    {...form.register("entry_price")}
                    className="tabular font-mono"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="stop_loss" className="text-loss/80">
                    {t("trades.stopLoss")}
                  </Label>
                  <Input
                    id="stop_loss"
                    inputMode="decimal"
                    placeholder="0.00000"
                    {...form.register("stop_loss")}
                    className="tabular font-mono"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="take_profit" className="text-profit/80">
                    {t("trades.takeProfit")}
                  </Label>
                  <Input
                    id="take_profit"
                    inputMode="decimal"
                    placeholder="0.00000"
                    {...form.register("take_profit")}
                    className="tabular font-mono"
                  />
                </div>
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="exit_price">{t("trades.exit")}</Label>
                    <button
                      type="button"
                      onClick={() => {
                        const entry = values.entry_price;
                        if (entry) setValue("exit_price", entry);
                        setValue("pnl", "0.00");
                        setValue("r_multiple", "0.00");
                        setValue("status", "closed");
                        setValue("exit_reason", "BE");
                        setJournalFlow((prev) => ({
                          ...prev,
                          tradeResult: "BREAKEVEN",
                          exitReasonType: "BE",
                        }));
                        toast.info("Posisi ditutup Breakeven (BE)", {
                          description: entry
                            ? `Exit disamakan dengan entry (${entry}) & PnL diatur ke $0.00`
                            : "PnL diatur ke $0.00 (Impas)",
                        });
                      }}
                      className="text-[10px] font-semibold text-amber-400 hover:text-amber-300 hover:underline flex items-center gap-1"
                      title="Set Exit sama dengan Entry (Breakeven / Impas)"
                    >
                      <span>⚡ Set BE</span>
                    </button>
                  </div>
                  <Input
                    id="exit_price"
                    inputMode="decimal"
                    placeholder="0.00000"
                    {...form.register("exit_price")}
                    className="tabular font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                <div className="space-y-1.5">
                  <Label htmlFor="position_size">{t("trades.size")}</Label>
                  <Input
                    id="position_size"
                    inputMode="decimal"
                    placeholder="0.10"
                    {...form.register("position_size")}
                    className="tabular font-mono"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="risk_amount">{t("trades.riskAmount")}</Label>
                  <Input
                    id="risk_amount"
                    inputMode="decimal"
                    placeholder={suggestedRisk ? suggestedRisk.toFixed(0) : "100"}
                    {...form.register("risk_amount")}
                    className="tabular font-mono"
                  />
                </div>
                <div className="space-y-1.5 sm:col-span-1 col-span-2">
                  <Label htmlFor="r_multiple">
                    {t("trades.rr")}
                    {actualR !== null && (
                      <span className="ml-1 text-[10px] text-primary">({formatR(actualR)})</span>
                    )}
                  </Label>
                  <Input
                    id="r_multiple"
                    inputMode="decimal"
                    placeholder="2.00"
                    {...form.register("r_multiple")}
                    className="tabular font-mono"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Section 3: Hasil */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm">
                <span className="grid h-5 w-5 place-items-center rounded bg-primary/15 font-mono text-[10px] text-primary">
                  3
                </span>
                Hasil
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3.5">
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label>{t("trades.status")}</Label>
                  <Controller
                    control={control}
                    name="status"
                    render={({ field }) => (
                      <Segmented
                        value={field.value}
                        onChange={field.onChange}
                        options={[
                          { value: "closed", label: t("trades.closed") },
                          { value: "open", label: t("trades.open") },
                        ]}
                      />
                    )}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label>{t("trades.result")}</Label>
                  <Segmented
                    value={previewResult === "open" ? "breakeven" : previewResult}
                    onChange={(val) => {
                      const risk = num(values.risk_amount) ?? suggestedRisk ?? 100;
                      if (val === "win") {
                        setValue("status", "closed");
                        const current = num(values.pnl);
                        setValue("pnl", String(Math.abs(current && current !== 0 ? current : risk * 2)));
                        setJournalFlow((prev) => ({ ...prev, tradeResult: "LABA" }));
                      } else if (val === "loss") {
                        setValue("status", "closed");
                        const current = num(values.pnl);
                        setValue("pnl", String(-Math.abs(current && current !== 0 ? current : risk)));
                        setJournalFlow((prev) => ({ ...prev, tradeResult: "RUGI" }));
                      } else if (val === "breakeven") {
                        setValue("status", "closed");
                        setValue("pnl", "0.00");
                        setValue("r_multiple", "0.00");
                        if (values.entry_price && !values.exit_price) {
                          setValue("exit_price", values.entry_price);
                        }
                        setValue("exit_reason", "BE");
                        setJournalFlow((prev) => ({ ...prev, tradeResult: "BREAKEVEN", exitReasonType: "BE" }));
                      }
                    }}
                    options={[
                      { value: "win", label: "Win" },
                      { value: "loss", label: "Loss" },
                      { value: "breakeven", label: "BE (Impas)" },
                    ]}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="pnl" className="flex items-center justify-between">
                  {t("trades.pnl")}
                  <button
                    type="button"
                    onClick={suggestPnl}
                    className="inline-flex items-center gap-1 text-[10px] font-medium text-zinc-400 hover:text-white"
                    title={t("trades.quickFill")}
                  >
                    <Calculator className="h-2.5 w-2.5" />
                    <span>{t("trades.quickFill")}</span>
                  </button>
                </Label>
                <Input
                  id="pnl"
                  inputMode="decimal"
                  placeholder="0.00"
                  {...form.register("pnl")}
                  className={cn(
                    "tabular font-mono text-base font-semibold",
                    previewResult === "win" && "border-profit/40 text-profit",
                    previewResult === "loss" && "border-loss/40 text-loss",
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Section 4: Alur Jurnal 8 Langkah Evaluasi Psikologi */}
          <Card className="border-[#222228] bg-[#0d0d0f] shadow-lg">
            <CardHeader className="pb-3 border-b border-[#222228]">
              <CardTitle className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 text-white">
                  <span className="grid h-5 w-5 place-items-center rounded bg-[#b2ff05] font-mono text-[10px] font-bold text-black">
                    4
                  </span>
                  Alur Jurnal Trading (8 Langkah)
                </span>
                <span className="rounded-full bg-[#b2ff05]/10 px-2 py-0.5 text-[10px] font-semibold text-[#b2ff05]">
                  Auto Sync to Journal
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-4">
              {/* Langkah 1 & 2 */}
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label className="text-xs text-[#a1a1aa]">1. Jenis Transaksi</Label>
                  <div className="flex gap-2">
                    {(["BELI", "JUAL"] as const).map((mode) => (
                      <button
                        key={mode}
                        type="button"
                        onClick={() => {
                          setJournalFlow((prev) => ({ ...prev, tradeType: mode }));
                          setValue("direction", mode === "BELI" ? "long" : "short");
                        }}
                        className={cn(
                          "flex-1 rounded-lg py-2 text-xs font-bold transition-all border",
                          journalFlow.tradeType === mode
                            ? mode === "BELI"
                              ? "bg-emerald-500 text-black border-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.4)]"
                              : "bg-red-500 text-white border-red-400 shadow-[0_0_10px_rgba(239,68,68,0.4)]"
                            : "border-[#222228] bg-[#0c0c0e] text-[#71717a] hover:border-[#b2ff05]/40 hover:text-white"
                        )}
                      >
                        {mode === "BELI" ? "BELI (LONG)" : "JUAL (SHORT)"}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs text-[#a1a1aa]">2. Perkiraan Durasi Perdagangan</Label>
                  <div className="flex gap-1.5">
                    {(["SCALP", "INTRA", "SWING"] as const).map((dur) => (
                      <button
                        key={dur}
                        type="button"
                        onClick={() => setJournalFlow((prev) => ({ ...prev, duration: dur }))}
                        className={cn(
                          "flex-1 rounded-lg py-2 text-[11px] font-semibold transition-all border",
                          journalFlow.duration === dur
                            ? "bg-[#b2ff05] text-black border-[#b2ff05] shadow-[0_0_10px_rgba(178,255,5,0.4)]"
                            : "border-[#222228] bg-[#0c0c0e] text-[#71717a] hover:border-[#b2ff05]/40 hover:text-white"
                        )}
                      >
                        {dur}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Langkah 3: Alasan Perdagangan (Konfluktuasi) */}
              <div className="space-y-1.5">
                <Label className="text-xs text-[#a1a1aa]">3. Alasan Perdagangan (Konfluktuasi & Setup)</Label>
                <Textarea
                  rows={2}
                  value={journalFlow.confluenceReason}
                  onChange={(e) => {
                    const val = e.target.value;
                    setJournalFlow((prev) => ({ ...prev, confluenceReason: val }));
                    setValue("notes", val);
                  }}
                  placeholder="Misal: Likuiditas London tersapu, retest Order Block M15 + konfirmasi CHoCH di M1..."
                  className="text-xs bg-[#0c0c0e] border-[#222228] focus:border-[#b2ff05]"
                />
              </div>

              {/* Langkah 4: Perasaan Sebelum Bertransaksi */}
              <div className="space-y-1.5">
                <Label className="text-xs text-[#a1a1aa]">4. Perasaan Sebelum Bertransaksi (Jujur)</Label>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    "Tenang & Disiplin",
                    "Yakin (High Confidence)",
                    "FOMO / Terburu-buru",
                    "Ragu / Cemas",
                    "Balas Dendam (Revenge)",
                  ].map((feel) => (
                    <button
                      key={feel}
                      type="button"
                      onClick={() => setJournalFlow((prev) => ({ ...prev, preEmotion: feel }))}
                      className={cn(
                        "rounded-full px-2.5 py-1 text-[11px] font-medium border transition-all",
                        journalFlow.preEmotion === feel
                          ? "border-[#b2ff05] bg-[#b2ff05]/15 text-[#b2ff05]"
                          : "border-[#222228] bg-[#0c0c0e] text-[#71717a] hover:border-[#b2ff05]/40 hover:text-white"
                      )}
                    >
                      {feel}
                    </button>
                  ))}
                </div>
              </div>

              {/* Langkah 5 & 6 */}
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label className="text-xs text-[#a1a1aa]">5. Hasil Perdagangan</Label>
                  <div className="flex gap-2">
                    {(["LABA", "RUGI", "BREAKEVEN"] as const).map((res) => (
                      <button
                        key={res}
                        type="button"
                        onClick={() => {
                          setJournalFlow((prev) => ({
                            ...prev,
                            tradeResult: res,
                            ...(res === "BREAKEVEN" ? { exitReasonType: "BE" } : {}),
                          }));
                          if (res === "BREAKEVEN") {
                            setValue("status", "closed");
                            setValue("pnl", "0.00");
                            setValue("r_multiple", "0.00");
                            setValue("exit_reason", "BE");
                            if (values.entry_price && !values.exit_price) {
                              setValue("exit_price", values.entry_price);
                            }
                          } else if (res === "LABA") {
                            setValue("status", "closed");
                            const current = num(values.pnl);
                            const risk = num(values.risk_amount) ?? suggestedRisk ?? 100;
                            setValue("pnl", String(Math.abs(current && current !== 0 ? current : risk * 2)));
                          } else if (res === "RUGI") {
                            setValue("status", "closed");
                            const current = num(values.pnl);
                            const risk = num(values.risk_amount) ?? suggestedRisk ?? 100;
                            setValue("pnl", String(-Math.abs(current && current !== 0 ? current : risk)));
                          }
                        }}
                        className={cn(
                          "flex-1 rounded-lg py-2 text-xs font-bold border transition-all",
                          journalFlow.tradeResult === res
                            ? res === "LABA"
                              ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/50"
                              : res === "RUGI"
                              ? "bg-red-500/20 text-red-400 border-red-500/50"
                              : "bg-amber-500/20 text-amber-400 border-amber-500/50 shadow-[0_0_10px_rgba(245,158,11,0.25)]"
                            : "border-[#222228] bg-[#0c0c0e] text-[#71717a] hover:border-[#b2ff05]/40 hover:text-white"
                        )}
                      >
                        {res === "BREAKEVEN" ? "BE (IMPAS)" : res}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs text-[#a1a1aa]">6. Alasan Penutupan Transaksi</Label>
                  <div className="flex gap-1.5">
                    {(["TP", "SL", "BE", "MANUAL"] as const).map((r) => (
                      <button
                        key={r}
                        type="button"
                        onClick={() => {
                          setJournalFlow((prev) => ({
                            ...prev,
                            exitReasonType: r,
                            ...(r === "BE" ? { tradeResult: "BREAKEVEN" } : {}),
                          }));
                          setValue("exit_reason", r);
                          if (r === "BE") {
                            setValue("status", "closed");
                            setValue("pnl", "0.00");
                            setValue("r_multiple", "0.00");
                            if (values.entry_price && !values.exit_price) {
                              setValue("exit_price", values.entry_price);
                            }
                          }
                        }}
                        className={cn(
                          "flex-1 rounded-lg py-2 text-[11px] font-bold border transition-all",
                          journalFlow.exitReasonType === r
                            ? r === "BE"
                              ? "bg-amber-500/20 text-amber-400 border-amber-500/50 shadow-[0_0_8px_rgba(245,158,11,0.2)]"
                              : "bg-[#b2ff05]/20 text-[#b2ff05] border-[#b2ff05]/50"
                            : "border-[#222228] bg-[#0c0c0e] text-[#71717a] hover:border-[#b2ff05]/40 hover:text-white"
                        )}
                      >
                        {r === "BE" ? "BE (Breakeven)" : r}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Langkah 7: Perasaan Setelah Transaksi */}
              <div className="space-y-1.5">
                <Label className="text-xs text-[#a1a1aa]">7. Perasaan Setelah Transaksi (Jujur Saja)</Label>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    "Puas & Belajar",
                    "Senang / Bangga",
                    "Kecewa / Frustasi",
                    "Menyesal Melanggar Rules",
                    "Netral / Tanpa Emosi",
                  ].map((feel) => (
                    <button
                      key={feel}
                      type="button"
                      onClick={() => setJournalFlow((prev) => ({ ...prev, postEmotion: feel }))}
                      className={cn(
                        "rounded-full px-2.5 py-1 text-[11px] font-medium border transition-all",
                        journalFlow.postEmotion === feel
                          ? "border-[#b2ff05] bg-[#b2ff05]/15 text-[#b2ff05]"
                          : "border-[#222228] bg-[#0c0c0e] text-[#71717a] hover:border-[#b2ff05]/40 hover:text-white"
                      )}
                    >
                      {feel}
                    </button>
                  ))}
                </div>
              </div>

              {/* Langkah 8: Bagaimana Cara Meningkatkan */}
              <div className="space-y-2">
                <Label className="text-xs text-[#a1a1aa]">8. Bagaimana Cara Meningkatkan</Label>
                <div className="flex gap-2">
                  {(["TEKNIS", "MANUSIA", "LANJUTAN"] as const).map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setJournalFlow((prev) => ({ ...prev, improvementType: cat }))}
                      className={cn(
                        "flex-1 rounded-lg py-1.5 text-[11px] font-bold border transition-all",
                        journalFlow.improvementType === cat
                          ? "bg-[#b2ff05] text-black border-[#b2ff05] shadow-[0_0_10px_rgba(178,255,5,0.4)]"
                          : "border-[#222228] bg-[#0c0c0e] text-[#71717a] hover:border-[#b2ff05]/40 hover:text-white"
                      )}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
                <Input
                  value={journalFlow.improvementNote}
                  onChange={(e) => setJournalFlow((prev) => ({ ...prev, improvementNote: e.target.value }))}
                  placeholder={
                    journalFlow.improvementType === "TEKNIS"
                      ? "Evaluasi teknis: Tunggu candle closed, pasang SL di atas swing..."
                      : journalFlow.improvementType === "MANUSIA"
                        ? "Evaluasi manusia: Kurangi screen time, jangan overtrade setelah loss..."
                        : "Evaluasi lanjutan: Backtest setup ini di 50 sampel data..."
                  }
                  className="text-xs bg-[#0c0c0e] border-[#222228] focus:border-[#b2ff05]"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Kolom samping */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">{t("trades.screenshots")}</CardTitle>
            </CardHeader>
            <CardContent>
              <ScreenshotUploader
                tradeId={createdTradeId}
                value={screenshots}
                onChange={setScreenshots}
                disabled={!canUploadScreenshots}
                disabledReason={screenshotLockReason}
              />
              <p className="mt-2 text-[10px] leading-relaxed text-muted-foreground">
                {t("trades.uploadLimit")}
              </p>
              {!createdTradeId && (
                <p className="mt-2 rounded-md border border-border/70 bg-muted/30 px-2 py-1.5 text-[10px] text-muted-foreground">
                  {t("trades.screenshotAfterSave")}
                </p>
              )}
            </CardContent>
          </Card>

          <Card className="border-primary/20 bg-primary/[0.03]">
            <CardContent className="space-y-2 p-4">
              <p className="text-[11px] font-medium text-foreground">⌘ + Enter</p>
              <p className="text-[11px] leading-relaxed text-muted-foreground">
                {t("trades.save")} · <span className="kbd">Esc</span> {t("common.cancel")}
              </p>
              <div className="mt-2 space-y-1 border-t border-border/60 pt-2 text-[10px] text-muted-foreground">
                <p>
                  {t("trades.computedRr")}:{" "}
                  {computedRr !== null ? `1:${computedRr.toFixed(2)}` : "—"}
                </p>
                <p>
                  {t("trades.result")}:{" "}
                  {previewResult === "win"
                    ? t("trades.win")
                    : previewResult === "loss"
                      ? t("trades.loss")
                      : previewResult === "breakeven"
                        ? t("trades.breakeven")
                        : t("trades.open")}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Sticky action bar */}
      <div className="sticky bottom-20 z-20 -mx-4 border-t border-border/70 bg-background/95 px-4 py-3 backdrop-blur lg:bottom-0 lg:-mx-7 lg:px-7">
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={submitting}
          >
            {t("common.cancel")}
          </Button>
          {!isEdit && (
            <Button
              type="button"
              variant="subtle"
              onClick={() => void handleSubmit((data) => onSubmit(data, true))()}
              disabled={submitting}
              className="hidden sm:inline-flex"
            >
              <Save className="h-4 w-4" />
              {t("trades.saveAndNew")}
            </Button>
          )}
          <div className="flex-1" />
          <Button type="submit" disabled={submitting} className="min-w-[140px]">
            {submitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Check className="h-4 w-4" />
            )}
            {submitting ? t("common.saving") : isEdit ? t("common.save") : t("trades.new")}
          </Button>
        </div>
      </div>
    </form>
  );
}

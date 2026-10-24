"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Plus, Sparkles, X } from "lucide-react";
import { useI18n } from "@/components/providers/i18n-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { createJournal, createEmotion, updateJournal } from "@/app/actions/journal";
import { cn } from "@/lib/utils";
import type { Emotion, Journal, Trade } from "@/lib/types";

const SENTIMENT_COLORS = {
  positive: "#22c55e",
  neutral: "#eab308",
  negative: "#ef4444",
};

export function JournalForm({
  journal,
  emotions,
  trades,
  onDone,
  defaultTradeId,
}: {
  journal?: Journal;
  emotions: Emotion[];
  trades: Trade[];
  onDone?: () => void;
  defaultTradeId?: string | null;
}) {
  const { t } = useI18n();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [submitting, setSubmitting] = React.useState(false);
  const [emotionDialogOpen, setEmotionDialogOpen] = React.useState(false);
  const isEdit = Boolean(journal);

  const initialTrade = defaultTradeId ?? journal?.trade_id ?? searchParams.get("trade") ?? null;

  const [form, setForm] = React.useState({
    journal_date: journal?.journal_date?.slice(0, 10) ?? new Date().toISOString().slice(0, 10),
    title: journal?.title ?? "",
    trade_id: initialTrade,
    mood_score: journal?.mood_score ?? 3,
    lesson_learned: journal?.lesson_learned ?? "",
    mistakes: journal?.mistakes ?? "",
    plan_tomorrow: journal?.plan_tomorrow ?? "",
    content: journal?.content ?? "",
  });

  const [selectedEmotions, setSelectedEmotions] = React.useState<string[]>(
    journal?.emotion_ids ?? [],
  );

  function toggleEmotion(id: string) {
    setSelectedEmotions((prev) =>
      prev.includes(id) ? prev.filter((e) => e !== id) : [...prev, id],
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        id: journal?.id,
        trade_id: form.trade_id || null,
        journal_date: form.journal_date,
        title: form.title || null,
        mood_score: form.mood_score,
        emotion_ids: selectedEmotions,
        lesson_learned: form.lesson_learned || null,
        mistakes: form.mistakes || null,
        plan_tomorrow: form.plan_tomorrow || null,
        content: form.content || null,
      };

      const result = isEdit ? await updateJournal(payload) : await createJournal(payload);
      if (!result.ok) {
        toast.error(t("common.error"), { description: result.error });
        return;
      }
      toast.success(t("journal.saved"));
      router.refresh();
      onDone?.();
    } finally {
      setSubmitting(false);
    }
  }

  const sortedTrades = React.useMemo(
    () =>
      [...trades]
        .sort((a, b) => new Date(b.traded_at).getTime() - new Date(a.traded_at).getTime())
        .slice(0, 60),
    [trades],
  );

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
          <div className="space-y-1.5">
            <Label htmlFor="title">{t("journal.titleField")}</Label>
            <Input
              id="title"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder={t("journal.titlePlaceholder")}
              autoFocus
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="date">{t("journal.date")}</Label>
            <Input
              id="date"
              type="date"
              value={form.journal_date}
              onChange={(e) => setForm({ ...form, journal_date: e.target.value })}
              className="tabular w-full sm:w-40"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label>{t("journal.linkedTrade")}</Label>
          <Select
            value={form.trade_id ?? "none"}
            onValueChange={(v) => setForm({ ...form, trade_id: v === "none" ? null : v })}
          >
            <SelectTrigger>
              <SelectValue placeholder={t("journal.noLinkedTrade")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">{t("journal.noLinkedTrade")}</SelectItem>
              {sortedTrades.map((trade) => (
                <SelectItem key={trade.id} value={trade.id}>
                  <span className="flex items-center gap-2">
                    <span className="font-mono text-[11px]">{trade.instrument}</span>
                    <span className="text-[10px] uppercase text-muted-foreground">{trade.direction}</span>
                    <span className="text-[10px] text-muted-foreground">
                      {new Date(trade.traded_at).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "short",
                      })}
                    </span>
                    <span
                      className={cn(
                        "tabular ml-auto text-[10px] font-medium",
                        trade.pnl > 0 ? "text-profit" : trade.pnl < 0 ? "text-loss" : "text-muted-foreground",
                      )}
                    >
                      {trade.pnl > 0 ? "+" : ""}
                      {trade.pnl.toFixed(0)}
                    </span>
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Emosi */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>{t("journal.emotions")}</Label>
            <button
              type="button"
              onClick={() => setEmotionDialogOpen(true)}
              className="flex items-center gap-1 text-[11px] text-primary hover:underline"
            >
              <Plus className="h-3 w-3" />
              {t("journal.addEmotion")}
            </button>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {emotions.map((emotion) => {
              const active = selectedEmotions.includes(emotion.id);
              return (
                <button
                  key={emotion.id}
                  type="button"
                  onClick={() => toggleEmotion(emotion.id)}
                  className={cn(
                    "rounded-full border px-2.5 py-1 text-[11px] font-medium transition-all",
                    active ? "scale-[1.02]" : "opacity-60 hover:opacity-100",
                  )}
                  style={{
                    color: emotion.color,
                    borderColor: active ? `${emotion.color}80` : `${emotion.color}30`,
                    backgroundColor: active ? `${emotion.color}20` : "transparent",
                  }}
                >
                  {active && "✓ "}
                  {emotion.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* Mood */}
        <div className="space-y-2">
          <Label>{t("journal.mood")}</Label>
          <div className="flex items-center gap-2">
            {[1, 2, 3, 4, 5].map((score) => (
              <button
                key={score}
                type="button"
                onClick={() => setForm({ ...form, mood_score: score })}
                className={cn(
                  "flex-1 rounded-lg border py-2 text-center transition-all",
                  form.mood_score === score
                    ? "border-primary/50 bg-primary/10"
                    : "border-border/70 hover:border-border",
                )}
              >
                <span className="text-lg">
                  {score === 1 ? "😖" : score === 2 ? "😕" : score === 3 ? "😐" : score === 4 ? "🙂" : "😄"}
                </span>
                <span className="mt-0.5 block text-[9px] text-muted-foreground">
                  {score === 1 ? t("journal.moodLow") : score === 5 ? t("journal.moodHigh") : score}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="lesson" className="text-profit/80">
              {t("journal.lesson")}
            </Label>
            <Textarea
              id="lesson"
              rows={3}
              value={form.lesson_learned}
              onChange={(e) => setForm({ ...form, lesson_learned: e.target.value })}
              placeholder={t("journal.lessonPlaceholder")}
              className="text-xs"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="mistakes" className="text-loss/80">
              {t("journal.mistakes")}
            </Label>
            <Textarea
              id="mistakes"
              rows={3}
              value={form.mistakes}
              onChange={(e) => setForm({ ...form, mistakes: e.target.value })}
              placeholder={t("journal.mistakesPlaceholder")}
              className="text-xs"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="plan">{t("journal.plan")}</Label>
          <Textarea
            id="plan"
            rows={2}
            value={form.plan_tomorrow}
            onChange={(e) => setForm({ ...form, plan_tomorrow: e.target.value })}
            placeholder={t("journal.planPlaceholder")}
            className="text-xs"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="content">{t("journal.content")}</Label>
          <Textarea
            id="content"
            rows={3}
            value={form.content}
            onChange={(e) => setForm({ ...form, content: e.target.value })}
            placeholder={t("journal.contentPlaceholder")}
            className="text-xs"
          />
        </div>

        <div className="flex justify-end gap-2 border-t border-border/60 pt-3">
          {onDone && (
            <Button type="button" variant="outline" onClick={onDone}>
              {t("common.cancel")}
            </Button>
          )}
          <Button type="submit" disabled={submitting}>
            {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
            {submitting ? t("common.saving") : t("common.save")}
          </Button>
        </div>
      </form>

      <EmotionDialog
        open={emotionDialogOpen}
        onOpenChange={setEmotionDialogOpen}
        onCreated={(emotion) => {
          setSelectedEmotions((prev) => [...prev, emotion.id]);
          router.refresh();
        }}
      />
    </>
  );
}

export function EmotionDialog({
  open,
  onOpenChange,
  onCreated,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: (emotion: Emotion) => void;
}) {
  const { t } = useI18n();
  const [name, setName] = React.useState("");
  const [sentiment, setSentiment] = React.useState<"positive" | "neutral" | "negative">("neutral");
  const [submitting, setSubmitting] = React.useState(false);

  async function handleCreate() {
    if (!name.trim()) return;
    setSubmitting(true);
    try {
      const result = await createEmotion({
        name: name.trim(),
        sentiment,
        color: SENTIMENT_COLORS[sentiment],
      });
      if (!result.ok || !result.data) {
        toast.error(t("common.error"), { description: result.error });
        return;
      }
      toast.success(t("journal.saved"));
      onCreated(result.data);
      setName("");
      onOpenChange(false);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>{t("journal.customEmotion")}</DialogTitle>
          <DialogDescription>{t("journal.emotions")}</DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="emotion-name">{t("journal.emotionName")}</Label>
            <Input
              id="emotion-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Overconfident"
              autoFocus
            />
          </div>
          <div className="space-y-1.5">
            <Label>{t("journal.sentiment")}</Label>
            <div className="grid grid-cols-3 gap-1.5">
              {(["positive", "neutral", "negative"] as const).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSentiment(s)}
                  className={cn(
                    "rounded-lg border py-1.5 text-[11px] font-medium capitalize transition",
                    sentiment === s ? "border-primary/50 bg-primary/10 text-foreground" : "border-border/70 text-muted-foreground",
                  )}
                >
                  {t(`journal.${s}`)}
                </button>
              ))}
            </div>
          </div>
          <Button onClick={() => void handleCreate()} disabled={submitting || !name.trim()} className="w-full">
            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            {t("common.save")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

"use client";

import * as React from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { GripVertical, Loader2, Plus, Upload, X } from "lucide-react";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { useI18n } from "@/components/providers/i18n-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { DEFAULT_STRATEGY_COLORS } from "@/lib/constants";
import { createStrategy, updateStrategy, uploadStrategyImage } from "@/app/actions/strategies";
import { cn } from "@/lib/utils";
import type { ChecklistItem, Strategy } from "@/lib/types";

const schema = z.object({
  name: z.string().min(1, "Nama strategi wajib diisi"),
  description: z.string(),
  entry_rules: z.string(),
  exit_rules: z.string(),
  color: z.string(),
  image_url: z.string().nullable(),
});

type FormValues = z.infer<typeof schema>;

export function StrategyForm({
  strategy,
  onDone,
}: {
  strategy?: Strategy;
  onDone?: () => void;
}) {
  const { t } = useI18n();
  const router = useRouter();
  const [submitting, setSubmitting] = React.useState(false);
  const [uploading, setUploading] = React.useState(false);
  const [checklist, setChecklist] = React.useState<ChecklistItem[]>(strategy?.checklist ?? []);
  const [newItem, setNewItem] = React.useState("");
  const isEdit = Boolean(strategy);
  const fileRef = React.useRef<HTMLInputElement>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: strategy?.name ?? "",
      description: strategy?.description ?? "",
      entry_rules: strategy?.entry_rules ?? "",
      exit_rules: strategy?.exit_rules ?? "",
      color: strategy?.color ?? DEFAULT_STRATEGY_COLORS[0],
      image_url: strategy?.image_url ?? null,
    },
  });

  const { control, register, handleSubmit, watch, setValue, formState } = form;
  const color = watch("color");
  const imageUrl = watch("image_url");

  function addChecklistItem() {
    const text = newItem.trim();
    if (!text) return;
    setChecklist((prev) => [...prev, { id: crypto.randomUUID(), text }]);
    setNewItem("");
  }

  async function handleImageUpload(file: File) {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const result = await uploadStrategyImage(formData);
      if (!result.ok || !result.data) {
        toast.error(t("errors.uploadFailed"), { description: result.error });
        return;
      }
      setValue("image_url", result.data);
    } finally {
      setUploading(false);
    }
  }

  async function onSubmit(data: FormValues) {
    setSubmitting(true);
    try {
      const payload = {
        id: strategy?.id,
        name: data.name,
        description: data.description || null,
        entry_rules: data.entry_rules || null,
        exit_rules: data.exit_rules || null,
        checklist,
        image_url: data.image_url,
        color: data.color,
      };

      const result = isEdit ? await updateStrategy(payload) : await createStrategy(payload);
      if (!result.ok) {
        toast.error(t("common.error"), { description: result.error });
        return;
      }
      toast.success(t("strategies.saved"));
      router.refresh();
      onDone?.();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="name">{t("strategies.name")} *</Label>
        <Input id="name" placeholder={t("strategies.namePlaceholder")} {...register("name")} autoFocus />
        {formState.errors.name && (
          <p className="text-[11px] text-loss">{formState.errors.name.message}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="description">{t("strategies.description")}</Label>
        <Textarea
          id="description"
          rows={2}
          placeholder={t("strategies.descriptionPlaceholder")}
          {...register("description")}
        />
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="entry_rules">{t("strategies.entryRules")}</Label>
          <Textarea
            id="entry_rules"
            rows={4}
            placeholder={t("strategies.entryRulesPlaceholder")}
            {...register("entry_rules")}
            className="text-xs"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="exit_rules">{t("strategies.exitRules")}</Label>
          <Textarea
            id="exit_rules"
            rows={4}
            placeholder={t("strategies.exitRulesPlaceholder")}
            {...register("exit_rules")}
            className="text-xs"
          />
        </div>
      </div>

      {/* Checklist */}
      <div className="space-y-2">
        <Label>{t("strategies.checklist")}</Label>
        <div className="space-y-1.5">
          {checklist.map((item, i) => (
            <div
              key={item.id}
              className="flex items-center gap-2 rounded-lg border border-border/70 bg-muted/20 px-2.5 py-1.5"
            >
              <GripVertical className="h-3.5 w-3.5 shrink-0 text-muted-foreground/50" />
              <span className="flex-1 text-xs">{item.text}</span>
              <button
                type="button"
                onClick={() => setChecklist((prev) => prev.filter((c) => c.id !== item.id))}
                className="text-muted-foreground hover:text-loss"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          <Input
            value={newItem}
            onChange={(e) => setNewItem(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addChecklistItem();
              }
            }}
            placeholder={t("strategies.checklistPlaceholder")}
            className="h-9 text-xs"
          />
          <Button type="button" variant="outline" size="sm" onClick={addChecklistItem} className="h-9 shrink-0">
            <Plus className="h-3.5 w-3.5" />
            {t("strategies.addChecklist")}
          </Button>
        </div>
      </div>

      {/* Gambar */}
      <div className="space-y-2">
        <Label>{t("strategies.image")}</Label>
        <input
          ref={fileRef}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) void handleImageUpload(file);
            e.target.value = "";
          }}
        />
        {imageUrl ? (
          <div className="relative overflow-hidden rounded-lg border border-border">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={imageUrl} alt="Setup" className="max-h-40 w-full object-cover" />
            <Button
              type="button"
              variant="destructive"
              size="icon-sm"
              className="absolute right-2 top-2"
              onClick={() => setValue("image_url", null)}
            >
              <X className="h-3.5 w-3.5" />
            </Button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="flex w-full flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-border/80 py-6 text-xs text-muted-foreground transition hover:border-primary/40 hover:bg-primary/[0.03]"
          >
            {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
            {t("strategies.imageHint")}
          </button>
        )}
      </div>

      {/* Warna */}
      <div className="space-y-1.5">
        <Label>Warna</Label>
        <div className="flex flex-wrap gap-2">
          {DEFAULT_STRATEGY_COLORS.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setValue("color", c)}
              className={cn(
                "h-7 w-7 rounded-full border-2 transition-transform hover:scale-110",
                color === c ? "border-foreground" : "border-transparent",
              )}
              style={{ backgroundColor: c }}
              aria-label={c}
            />
          ))}
        </div>
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
  );
}

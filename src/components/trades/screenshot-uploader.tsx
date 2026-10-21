"use client";

import * as React from "react";
import { Image as ImageIcon, Loader2, Maximize2, Trash2, Upload, ZoomIn, ZoomOut, X } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/components/providers/i18n-provider";
import type { ScreenshotTimeframe } from "@/lib/types";

export interface ScreenshotState {
  timeframe: ScreenshotTimeframe;
  url: string | null;
  path?: string | null;
  uploading?: boolean;
}

const TIMEFRAMES: { value: ScreenshotTimeframe; labelKey: string; fullKey: string }[] = [
  { value: "htf", labelKey: "trades.htf", fullKey: "trades.htfFull" },
  { value: "mtf", labelKey: "trades.mtf", fullKey: "trades.mtfFull" },
  { value: "ltf", labelKey: "trades.ltf", fullKey: "trades.ltfFull" },
];

export function ScreenshotUploader({
  tradeId,
  value,
  onChange,
  disabled,
  disabledReason,
}: {
  tradeId?: string | null;
  value: ScreenshotState[];
  onChange: (next: ScreenshotState[]) => void;
  disabled?: boolean;
  disabledReason?: string;
}) {
  const { t } = useI18n();
  const [zoomUrl, setZoomUrl] = React.useState<string | null>(null);
  const [zoomLevel, setZoomLevel] = React.useState(1);

  const upload = React.useCallback(
    async (file: File, timeframe: ScreenshotTimeframe) => {
      if (!tradeId) {
        toast.error(t("errors.generic"), {
          description: "Simpan trade terlebih dahulu untuk mengunggah screenshot.",
        });
        return;
      }
      if (!["image/png", "image/jpeg", "image/webp"].includes(file.type)) {
        toast.error(t("errors.invalidFile"));
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        toast.error(t("errors.fileTooLarge"));
        return;
      }

      onChange(value.map((v) => (v.timeframe === timeframe ? { ...v, uploading: true } : v)));

      const form = new FormData();
      form.append("file", file);
      form.append("tradeId", tradeId);
      form.append("timeframe", timeframe);

      try {
        const res = await fetch("/api/upload", { method: "POST", body: form });
        const data = (await res.json()) as { ok: boolean; url?: string; path?: string; error?: string };
        if (!res.ok || !data.ok) throw new Error(data.error ?? t("errors.uploadFailed"));

        onChange(
          value.map((v) =>
            v.timeframe === timeframe
              ? { ...v, url: data.url ?? URL.createObjectURL(file), path: data.path, uploading: false }
              : v,
          ),
        );
      } catch (error) {
        onChange(value.map((v) => (v.timeframe === timeframe ? { ...v, uploading: false } : v)));
        toast.error(t("errors.uploadFailed"), {
          description: error instanceof Error ? error.message : undefined,
        });
      }
    },
    [tradeId, value, onChange, t],
  );

  return (
    <>
      <div className="grid grid-cols-3 gap-2">
        {TIMEFRAMES.map((tf) => {
          const item = value.find((v) => v.timeframe === tf.value);
          return (
            <ScreenshotSlot
              key={tf.value}
              label={t(tf.labelKey)}
              sublabel={t(tf.fullKey)}
              url={item?.url ?? null}
              uploading={item?.uploading}
              disabled={disabled}
              onFile={(file) => upload(file, tf.value)}
              onRemove={() =>
                onChange(
                  value.map((v) =>
                    v.timeframe === tf.value ? { ...v, url: null, path: null } : v,
                  ),
                )
              }
              onZoom={(url) => {
                setZoomUrl(url);
                setZoomLevel(1);
              }}
            />
          );
        })}
      </div>
      {disabled && disabledReason && (
        <p className="mt-2 text-[11px] text-warning">{disabledReason}</p>
      )}

      {zoomUrl && (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center bg-black/90 p-4 backdrop-blur"
          onClick={() => setZoomUrl(null)}
        >
          <div className="absolute right-4 top-4 flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
            <Button variant="secondary" size="icon-sm" onClick={() => setZoomLevel((z) => Math.max(1, z - 0.25))}>
              <ZoomOut className="h-4 w-4" />
            </Button>
            <span className="tabular min-w-12 text-center text-xs text-white/70">
              {Math.round(zoomLevel * 100)}%
            </span>
            <Button variant="secondary" size="icon-sm" onClick={() => setZoomLevel((z) => Math.min(4, z + 0.25))}>
              <ZoomIn className="h-4 w-4" />
            </Button>
            <Button variant="secondary" size="icon-sm" onClick={() => setZoomUrl(null)}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={zoomUrl}
            alt="Chart"
            className="max-h-[88vh] max-w-[92vw] cursor-zoom-out rounded-lg object-contain transition-transform"
            style={{ transform: `scale(${zoomLevel})` }}
            onClick={(e) => {
              e.stopPropagation();
              setZoomLevel((z) => (z >= 4 ? 1 : z + 0.5));
            }}
          />
        </div>
      )}
    </>
  );
}

function ScreenshotSlot({
  label,
  sublabel,
  url,
  uploading,
  disabled,
  onFile,
  onRemove,
  onZoom,
}: {
  label: string;
  sublabel: string;
  url: string | null;
  uploading?: boolean;
  disabled?: boolean;
  onFile: (file: File) => void;
  onRemove: () => void;
  onZoom: (url: string) => void;
}) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = React.useState(false);

  function handlePaste(e: React.ClipboardEvent) {
    const items = e.clipboardData?.items;
    if (!items) return;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.startsWith("image/")) {
        const file = items[i].getAsFile();
        if (file) {
          e.preventDefault();
          onFile(file);
          return;
        }
      }
    }
  }

  return (
    <div
      tabIndex={0}
      onPaste={handlePaste}
      className={cn(
        "group relative aspect-[4/3] overflow-hidden rounded-xl border border-dashed transition-all outline-none focus:ring-1 focus:ring-primary/50",
        url ? "border-border/80" : "border-border/80 bg-muted/20 hover:border-primary/50 hover:bg-primary/[0.04]",
        dragging && "border-primary bg-primary/10",
        disabled && "pointer-events-none opacity-50",
      )}
      onDragOver={(e) => {
        e.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragging(false);
        const file = e.dataTransfer.files?.[0];
        if (file) onFile(file);
      }}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onFile(file);
          e.target.value = "";
        }}
      />

      {url ? (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={url} alt={label} className="h-full w-full object-cover" />
          <div className="absolute inset-0 flex items-center justify-center gap-1 bg-black/60 opacity-0 transition-opacity group-hover:opacity-100">
            <Button type="button" variant="secondary" size="icon-sm" onClick={() => onZoom(url)}>
              <Maximize2 className="h-3.5 w-3.5" />
            </Button>
            <Button type="button" variant="destructive" size="icon-sm" onClick={onRemove}>
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
          <span className="absolute left-1.5 top-1.5 rounded bg-black/70 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-white backdrop-blur">
            {label}
          </span>
        </>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="flex h-full w-full flex-col items-center justify-center gap-1 px-1 text-center"
        >
          {uploading ? (
            <Loader2 className="h-4 w-4 animate-spin text-primary" />
          ) : (
            <ImageIcon className="h-4 w-4 text-muted-foreground" />
          )}
          <span className="text-[11px] font-semibold text-foreground/80">{label}</span>
          <span className="hidden text-[9px] leading-tight text-muted-foreground sm:block">{sublabel}</span>
          <Upload className="mt-0.5 h-3 w-3 text-muted-foreground/60" />
        </button>
      )}
    </div>
  );
}

import { NextResponse } from "next/server";
import {
  deleteScreenshotFile,
  mutateDb,
  newId,
  nowIso,
  writeScreenshotFile,
} from "@/lib/store/db";
import type { ScreenshotTimeframe, TradeScreenshot } from "@/lib/types";

const MAX_SIZE = 10 * 1024 * 1024;
const ALLOWED: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
};

const TIMEFRAMES: ScreenshotTimeframe[] = ["htf", "mtf", "ltf"];

export async function POST(request: Request) {
  const form = await request.formData();
  const file = form.get("file") as File | null;
  const tradeId = form.get("tradeId") as string | null;
  const timeframe = form.get("timeframe") as string | null;

  if (!file || !tradeId || !timeframe) {
    return NextResponse.json({ ok: false, error: "Parameter tidak lengkap" }, { status: 400 });
  }
  if (!TIMEFRAMES.includes(timeframe as ScreenshotTimeframe)) {
    return NextResponse.json({ ok: false, error: "Timeframe tidak valid" }, { status: 400 });
  }

  const ext = ALLOWED[file.type];
  if (!ext) {
    return NextResponse.json({ ok: false, error: "Format file tidak didukung" }, { status: 400 });
  }
  if (file.size > MAX_SIZE) {
    return NextResponse.json({ ok: false, error: "File terlalu besar (maks 10MB)" }, { status: 400 });
  }

  const bytes = new Uint8Array(await file.arrayBuffer());
  const tf = timeframe as ScreenshotTimeframe;
  const storagePath = `${tradeId}/${tf}.${ext}`;

  try {
    const result = await mutateDb(async (db) => {
      const trade = db.trades.find((t) => t.id === tradeId);
      if (!trade) return null;

      await writeScreenshotFile(storagePath, bytes);

      const existing = db.screenshots.find((s) => s.trade_id === tradeId && s.timeframe === tf);
      // Bila ekstensi berubah (mis. png -> jpg), file lama perlu dibersihkan.
      const stalePath =
        existing && existing.storage_path !== storagePath ? existing.storage_path : null;

      let shot: TradeScreenshot;
      if (existing) {
        existing.storage_path = storagePath;
        existing.created_at = nowIso();
        shot = { ...existing };
      } else {
        shot = {
          id: newId(),
          trade_id: tradeId,
          timeframe: tf,
          storage_path: storagePath,
          caption: null,
          width: null,
          height: null,
          created_at: nowIso(),
        };
        db.screenshots.push(shot);
      }

      return { shot, stalePath };
    });

    if (!result) {
      return NextResponse.json({ ok: false, error: "Trade tidak ditemukan" }, { status: 404 });
    }

    if (result.stalePath) {
      await deleteScreenshotFile(result.stalePath);
    }

    return NextResponse.json({
      ok: true,
      id: result.shot.id,
      path: result.shot.storage_path,
      url: `/api/screenshot/${result.shot.id}`,
    });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "Upload gagal" },
      { status: 500 },
    );
  }
}

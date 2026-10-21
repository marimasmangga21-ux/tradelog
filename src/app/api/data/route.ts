import { NextResponse } from "next/server";
import { loadAll } from "@/lib/data/queries";
import { clearDb, resetDb } from "@/lib/store/db";

export async function GET() {
  const data = await loadAll();
  return NextResponse.json(data, {
    headers: { "Cache-Control": "no-store" },
  });
}

/**
 * Reset data dari halaman Pengaturan.
 * ?mode=sample → muat ulang data contoh
 * ?mode=empty  → kosongkan semua data
 */
export async function DELETE(request: Request) {
  const mode = new URL(request.url).searchParams.get("mode") ?? "empty";

  try {
    if (mode === "sample") await resetDb();
    else await clearDb();
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "Gagal mereset data" },
      { status: 500 },
    );
  }
}

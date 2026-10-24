import { NextResponse } from "next/server";
import { loadAll } from "@/lib/data/queries";
import { clearDb, resetDb, mutateDb } from "@/lib/store/db";
import type { Account } from "@/lib/types";

export async function GET() {
  const data = await loadAll();
  return NextResponse.json(data, {
    headers: { "Cache-Control": "no-store" },
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { accounts } = body as { accounts?: Account[] };
    if (Array.isArray(accounts) && accounts.length > 0) {
      await mutateDb((db) => {
        if (!db.accounts) db.accounts = [];
        for (const acc of accounts) {
          const idx = db.accounts.findIndex((a) => a.id === acc.id);
          if (idx >= 0) {
            db.accounts[idx] = { ...db.accounts[idx], ...acc };
          } else {
            db.accounts.push(acc);
          }
        }
      });
    }
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "Gagal sinkronisasi" },
      { status: 500 },
    );
  }
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

"use server";

import { revalidatePath } from "next/cache";
import { mutateDb, newId, nowIso, recalcBalances, deleteScreenshotFile } from "@/lib/store/db";
import { tradeSchema } from "@/lib/validations";
import type { ActionResult, Trade } from "@/lib/types";

function revalidateTradePaths(id?: string) {
  revalidatePath("/");
  revalidatePath("/trades");
  revalidatePath("/journal");
  revalidatePath("/calendar");
  revalidatePath("/analytics");
  revalidatePath("/accounts");
  if (id) revalidatePath(`/trades/${id}`);
}

export async function assignTradeStrategy(
  tradeId: string,
  strategyId: string | null,
): Promise<ActionResult<Trade>> {
  try {
    const updated = await mutateDb((db) => {
      const trade = db.trades.find((t) => t.id === tradeId);
      if (!trade) return null;

      trade.strategy_id = strategyId;
      trade.updated_at = nowIso();
      return { ...trade };
    });

    if (!updated) return { ok: false, error: "Trade tidak ditemukan" };

    revalidateTradePaths(tradeId);
    return { ok: true, data: updated };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Gagal menyimpan strategi" };
  }
}

export async function createTrade(raw: unknown): Promise<ActionResult<Trade>> {
  try {
    const parsed = tradeSchema.safeParse(raw);
    if (!parsed.success) {
      return {
        ok: false,
        error: parsed.error.issues[0]?.message ?? "Data tidak valid",
        code: "VALIDATION",
      };
    }
    const input = parsed.data;

    const trade = await mutateDb((db) => {
      const timestamp = nowIso();
      const created: Trade = {
        id: newId(),
        account_id: input.account_id ?? null,
        strategy_id: input.strategy_id ?? null,
        traded_at: input.traded_at,
        closed_at: input.closed_at || null,
        instrument: input.instrument,
        direction: input.direction,
        session: input.session,
        status: input.status,
        entry_price: input.entry_price ?? null,
        stop_loss: input.stop_loss ?? null,
        take_profit: input.take_profit ?? null,
        exit_price: input.exit_price ?? null,
        position_size: input.position_size ?? null,
        pnl: input.pnl,
        pnl_percent: input.pnl_percent ?? null,
        fees: input.fees ?? 0,
        r_multiple: input.r_multiple ?? null,
        risk_amount: input.risk_amount ?? null,
        result: input.result ?? "open",
        exit_reason: input.exit_reason || null,
        notes: input.notes || null,
        tags: input.tags ?? [],
        balance_after: null,
        created_at: timestamp,
        updated_at: timestamp,
      };

      db.trades.push(created);
      if (created.account_id) recalcBalances(db, created.account_id);
      return created;
    });

    revalidateTradePaths(trade.id);
    return { ok: true, data: trade };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Gagal menyimpan trade" };
  }
}

export async function updateTrade(raw: unknown): Promise<ActionResult<Trade>> {
  try {
    const parsed = tradeSchema.safeParse(raw);
    if (!parsed.success) {
      return {
        ok: false,
        error: parsed.error.issues[0]?.message ?? "Data tidak valid",
        code: "VALIDATION",
      };
    }
    const input = parsed.data;
    if (!input.id) return { ok: false, error: "ID trade tidak ditemukan" };

    const result = await mutateDb((db) => {
      const trade = db.trades.find((t) => t.id === input.id);
      if (!trade) return null;

      const previousAccount = trade.account_id;

      Object.assign(trade, {
        account_id: input.account_id ?? null,
        strategy_id: input.strategy_id ?? null,
        traded_at: input.traded_at,
        closed_at: input.closed_at || null,
        instrument: input.instrument,
        direction: input.direction,
        session: input.session,
        status: input.status,
        entry_price: input.entry_price ?? null,
        stop_loss: input.stop_loss ?? null,
        take_profit: input.take_profit ?? null,
        exit_price: input.exit_price ?? null,
        position_size: input.position_size ?? null,
        pnl: input.pnl,
        pnl_percent: input.pnl_percent ?? null,
        fees: input.fees ?? 0,
        r_multiple: input.r_multiple ?? null,
        risk_amount: input.risk_amount ?? null,
        result: input.result ?? "open",
        exit_reason: input.exit_reason || null,
        notes: input.notes || null,
        tags: input.tags ?? [],
        updated_at: nowIso(),
      } satisfies Partial<Trade>);

      if (previousAccount) recalcBalances(db, previousAccount);
      if (trade.account_id) recalcBalances(db, trade.account_id);
      return { ...trade };
    });

    if (!result) return { ok: false, error: "Trade tidak ditemukan" };

    revalidateTradePaths(result.id);
    return { ok: true, data: result };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Gagal memperbarui trade" };
  }
}

export async function deleteTrade(id: string): Promise<ActionResult> {
  try {
    const removedFiles = await mutateDb((db) => {
      const index = db.trades.findIndex((t) => t.id === id);
      if (index < 0) return null;

      const [trade] = db.trades.splice(index, 1);
      const shots = db.screenshots.filter((s) => s.trade_id === id);
      db.screenshots = db.screenshots.filter((s) => s.trade_id !== id);
      // Jurnal yang menunjuk trade ini dilepas tautannya, bukan dihapus.
      for (const journal of db.journals) {
        if (journal.trade_id === id) journal.trade_id = null;
      }

      if (trade.account_id) recalcBalances(db, trade.account_id);
      return shots.map((s) => s.storage_path);
    });

    if (removedFiles === null) return { ok: false, error: "Trade tidak ditemukan" };
    await Promise.all(removedFiles.map(deleteScreenshotFile));

    revalidateTradePaths(id);
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Gagal menghapus trade" };
  }
}

export async function closeTrade(
  id: string,
  payload: { exit_price?: number | null; pnl: number; exit_reason?: string | null },
): Promise<ActionResult<Trade>> {
  try {
    const result = await mutateDb((db) => {
      const trade = db.trades.find((t) => t.id === id);
      if (!trade) return null;

      trade.status = "closed";
      trade.closed_at = nowIso();
      trade.exit_price = payload.exit_price ?? null;
      trade.pnl = payload.pnl;
      trade.exit_reason = payload.exit_reason ?? null;
      trade.result = payload.pnl > 0 ? "win" : payload.pnl < 0 ? "loss" : "breakeven";
      trade.updated_at = nowIso();

      if (trade.account_id) recalcBalances(db, trade.account_id);
      return { ...trade };
    });

    if (!result) return { ok: false, error: "Trade tidak ditemukan" };

    revalidateTradePaths(id);
    return { ok: true, data: result };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Gagal menutup trade" };
  }
}

export async function removeScreenshot(id: string): Promise<ActionResult> {
  try {
    const storagePath = await mutateDb((db) => {
      const shot = db.screenshots.find((s) => s.id === id);
      if (!shot) return null;
      db.screenshots = db.screenshots.filter((s) => s.id !== id);
      return shot.storage_path;
    });

    if (!storagePath) return { ok: false, error: "Screenshot tidak ditemukan" };
    await deleteScreenshotFile(storagePath);
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Gagal menghapus screenshot" };
  }
}

"use server";

import { revalidatePath } from "next/cache";
import { mutateDb, newId, nowIso, recalcBalances } from "@/lib/store/db";
import { accountSchema } from "@/lib/validations";
import type { Account, ActionResult } from "@/lib/types";

export async function createAccount(raw: unknown): Promise<ActionResult<Account>> {
  try {
    const parsed = accountSchema.safeParse(raw);
    if (!parsed.success) {
      return {
        ok: false,
        error: parsed.error.issues[0]?.message ?? "Data tidak valid",
        code: "VALIDATION",
      };
    }
    const input = parsed.data;

    const account = await mutateDb((db) => {
      const timestamp = nowIso();
      const created: Account = {
        id: newId(),
        name: input.name,
        broker: input.broker || null,
        account_type: input.account_type,
        currency: input.currency,
        initial_balance: input.initial_balance ?? 0,
        status: input.status,
        profit_target: input.profit_target ?? null,
        max_drawdown: input.max_drawdown ?? null,
        color: input.color,
        notes: input.notes || null,
        archived: false,
        created_at: timestamp,
        updated_at: timestamp,
      };
      db.accounts.push(created);
      return created;
    });

    revalidatePath("/accounts");
    revalidatePath("/");
    revalidatePath("/trades");
    return { ok: true, data: account };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Gagal menyimpan akun" };
  }
}

export async function updateAccount(raw: unknown): Promise<ActionResult<Account>> {
  try {
    const parsed = accountSchema.safeParse(raw);
    if (!parsed.success) {
      return {
        ok: false,
        error: parsed.error.issues[0]?.message ?? "Data tidak valid",
        code: "VALIDATION",
      };
    }
    const input = parsed.data;
    if (!input.id) return { ok: false, error: "ID akun tidak ditemukan" };

    const account = await mutateDb((db) => {
      const target = db.accounts.find((a) => a.id === input.id);
      if (!target) return null;

      Object.assign(target, {
        name: input.name,
        broker: input.broker || null,
        account_type: input.account_type,
        currency: input.currency,
        initial_balance: input.initial_balance ?? 0,
        status: input.status,
        profit_target: input.profit_target ?? null,
        max_drawdown: input.max_drawdown ?? null,
        color: input.color,
        notes: input.notes || null,
        updated_at: nowIso(),
      } satisfies Partial<Account>);

      recalcBalances(db, target.id);
      return { ...target };
    });

    if (!account) return { ok: false, error: "Akun tidak ditemukan" };

    revalidatePath("/accounts");
    revalidatePath("/");
    return { ok: true, data: account };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Gagal memperbarui akun" };
  }
}

export async function deleteAccount(id: string): Promise<ActionResult> {
  try {
    const ok = await mutateDb((db) => {
      const index = db.accounts.findIndex((a) => a.id === id);
      if (index < 0) return false;
      db.accounts.splice(index, 1);
      // Trade tetap disimpan, hanya kehilangan tautan akun.
      for (const trade of db.trades) {
        if (trade.account_id === id) trade.account_id = null;
      }
      return true;
    });

    if (!ok) return { ok: false, error: "Akun tidak ditemukan" };

    revalidatePath("/accounts");
    revalidatePath("/");
    revalidatePath("/trades");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Gagal menghapus akun" };
  }
}

export async function setAccountArchived(id: string, archived: boolean): Promise<ActionResult> {
  try {
    const ok = await mutateDb((db) => {
      const account = db.accounts.find((a) => a.id === id);
      if (!account) return false;
      account.archived = archived;
      account.updated_at = nowIso();
      return true;
    });

    if (!ok) return { ok: false, error: "Akun tidak ditemukan" };

    revalidatePath("/accounts");
    revalidatePath("/");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Gagal mengubah status akun" };
  }
}

export async function setAccountStatus(
  id: string,
  status: Account["status"],
): Promise<ActionResult> {
  try {
    const ok = await mutateDb((db) => {
      const account = db.accounts.find((a) => a.id === id);
      if (!account) return false;
      account.status = status;
      account.updated_at = nowIso();
      return true;
    });

    if (!ok) return { ok: false, error: "Akun tidak ditemukan" };

    revalidatePath("/accounts");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Gagal mengubah status" };
  }
}

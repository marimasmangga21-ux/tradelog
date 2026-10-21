"use server";

import { revalidatePath } from "next/cache";
import { mutateDb, newId, nowIso, writeUploadFile } from "@/lib/store/db";
import { strategySchema } from "@/lib/validations";
import type { ActionResult, Strategy } from "@/lib/types";

const MAX_IMAGE_SIZE = 10 * 1024 * 1024;
const IMAGE_EXT: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
};

/** Simpan gambar contoh strategi ke folder data/uploads dan kembalikan URL-nya. */
export async function uploadStrategyImage(formData: FormData): Promise<ActionResult<string>> {
  try {
    const file = formData.get("file");
    if (!(file instanceof File)) {
      return { ok: false, error: "File tidak ditemukan" };
    }
    const ext = IMAGE_EXT[file.type];
    if (!ext) return { ok: false, error: "Format file tidak didukung" };
    if (file.size > MAX_IMAGE_SIZE) return { ok: false, error: "File terlalu besar (maks 10MB)" };

    const fileName = `${newId()}.${ext}`;
    await writeUploadFile(`strategies/${fileName}`, new Uint8Array(await file.arrayBuffer()));

    return { ok: true, data: `/api/media/strategies/${fileName}` };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Gagal mengunggah gambar" };
  }
}

export async function createStrategy(raw: unknown): Promise<ActionResult<Strategy>> {
  try {
    const parsed = strategySchema.safeParse(raw);
    if (!parsed.success) {
      return {
        ok: false,
        error: parsed.error.issues[0]?.message ?? "Data tidak valid",
        code: "VALIDATION",
      };
    }
    const input = parsed.data;

    const strategy = await mutateDb((db) => {
      const timestamp = nowIso();
      const created: Strategy = {
        id: newId(),
        name: input.name,
        description: input.description || null,
        entry_rules: input.entry_rules || null,
        exit_rules: input.exit_rules || null,
        checklist: input.checklist ?? [],
        image_url: input.image_url || null,
        color: input.color,
        archived: false,
        created_at: timestamp,
        updated_at: timestamp,
      };
      db.strategies.push(created);
      return created;
    });

    revalidatePath("/strategies");
    revalidatePath("/trades");
    return { ok: true, data: strategy };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Gagal menyimpan strategi" };
  }
}

export async function updateStrategy(raw: unknown): Promise<ActionResult<Strategy>> {
  try {
    const parsed = strategySchema.safeParse(raw);
    if (!parsed.success) {
      return {
        ok: false,
        error: parsed.error.issues[0]?.message ?? "Data tidak valid",
        code: "VALIDATION",
      };
    }
    const input = parsed.data;
    if (!input.id) return { ok: false, error: "ID strategi tidak ditemukan" };

    const strategy = await mutateDb((db) => {
      const target = db.strategies.find((s) => s.id === input.id);
      if (!target) return null;

      Object.assign(target, {
        name: input.name,
        description: input.description || null,
        entry_rules: input.entry_rules || null,
        exit_rules: input.exit_rules || null,
        checklist: input.checklist ?? [],
        image_url: input.image_url || null,
        color: input.color,
        updated_at: nowIso(),
      } satisfies Partial<Strategy>);

      return { ...target };
    });

    if (!strategy) return { ok: false, error: "Strategi tidak ditemukan" };

    revalidatePath("/strategies");
    return { ok: true, data: strategy };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Gagal memperbarui strategi" };
  }
}

export async function deleteStrategy(id: string): Promise<ActionResult> {
  try {
    const ok = await mutateDb((db) => {
      const index = db.strategies.findIndex((s) => s.id === id);
      if (index < 0) return false;
      db.strategies.splice(index, 1);
      for (const trade of db.trades) {
        if (trade.strategy_id === id) trade.strategy_id = null;
      }
      return true;
    });

    if (!ok) return { ok: false, error: "Strategi tidak ditemukan" };

    revalidatePath("/strategies");
    revalidatePath("/trades");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Gagal menghapus strategi" };
  }
}

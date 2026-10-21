"use server";

import { revalidatePath } from "next/cache";
import { mutateDb, newId, nowIso } from "@/lib/store/db";
import { journalSchema, emotionSchema, slugify } from "@/lib/validations";
import type { ActionResult, Emotion, Journal } from "@/lib/types";

export async function createJournal(raw: unknown): Promise<ActionResult<Journal>> {
  try {
    const parsed = journalSchema.safeParse(raw);
    if (!parsed.success) {
      return {
        ok: false,
        error: parsed.error.issues[0]?.message ?? "Data tidak valid",
        code: "VALIDATION",
      };
    }
    const input = parsed.data;

    const journal = await mutateDb((db) => {
      const timestamp = nowIso();
      const created: Journal = {
        id: newId(),
        trade_id: input.trade_id ?? null,
        journal_date: input.journal_date,
        title: input.title || null,
        mood_score: input.mood_score ?? null,
        emotion_ids: input.emotion_ids ?? [],
        lesson_learned: input.lesson_learned || null,
        mistakes: input.mistakes || null,
        plan_tomorrow: input.plan_tomorrow || null,
        content: input.content || null,
        created_at: timestamp,
        updated_at: timestamp,
      };
      db.journals.push(created);
      return created;
    });

    revalidatePath("/journal");
    revalidatePath("/calendar");
    revalidatePath("/");
    if (journal.trade_id) revalidatePath(`/trades/${journal.trade_id}`);
    return { ok: true, data: journal };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Gagal menyimpan jurnal" };
  }
}

export async function updateJournal(raw: unknown): Promise<ActionResult<Journal>> {
  try {
    const parsed = journalSchema.safeParse(raw);
    if (!parsed.success) {
      return {
        ok: false,
        error: parsed.error.issues[0]?.message ?? "Data tidak valid",
        code: "VALIDATION",
      };
    }
    const input = parsed.data;
    if (!input.id) return { ok: false, error: "ID jurnal tidak ditemukan" };

    const journal = await mutateDb((db) => {
      const target = db.journals.find((j) => j.id === input.id);
      if (!target) return null;

      Object.assign(target, {
        trade_id: input.trade_id ?? null,
        journal_date: input.journal_date,
        title: input.title || null,
        mood_score: input.mood_score ?? null,
        emotion_ids: input.emotion_ids ?? [],
        lesson_learned: input.lesson_learned || null,
        mistakes: input.mistakes || null,
        plan_tomorrow: input.plan_tomorrow || null,
        content: input.content || null,
        updated_at: nowIso(),
      } satisfies Partial<Journal>);

      return { ...target };
    });

    if (!journal) return { ok: false, error: "Jurnal tidak ditemukan" };

    revalidatePath("/journal");
    revalidatePath("/calendar");
    if (journal.trade_id) revalidatePath(`/trades/${journal.trade_id}`);
    return { ok: true, data: journal };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Gagal memperbarui jurnal" };
  }
}

export async function deleteJournal(id: string): Promise<ActionResult> {
  try {
    const ok = await mutateDb((db) => {
      const index = db.journals.findIndex((j) => j.id === id);
      if (index < 0) return false;
      db.journals.splice(index, 1);
      return true;
    });

    if (!ok) return { ok: false, error: "Jurnal tidak ditemukan" };

    revalidatePath("/journal");
    revalidatePath("/calendar");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Gagal menghapus jurnal" };
  }
}

export async function createEmotion(raw: unknown): Promise<ActionResult<Emotion>> {
  try {
    const parsed = emotionSchema.safeParse(raw);
    if (!parsed.success) {
      return {
        ok: false,
        error: parsed.error.issues[0]?.message ?? "Data tidak valid",
        code: "VALIDATION",
      };
    }
    const input = parsed.data;
    const slug = input.slug ? slugify(input.slug) : slugify(input.name);

    const result = await mutateDb((db) => {
      const exists = db.emotions.some((e) => e.slug === slug);
      if (exists) return { duplicate: true as const };

      const created: Emotion = {
        id: newId(),
        name: input.name,
        slug,
        sentiment: input.sentiment,
        color: input.color,
        is_default: false,
        created_at: nowIso(),
      };
      db.emotions.push(created);
      return { duplicate: false as const, emotion: created };
    });

    if (result.duplicate) {
      return { ok: false, error: "Emosi dengan nama ini sudah ada." };
    }

    revalidatePath("/journal");
    return { ok: true, data: result.emotion };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Gagal menambah emosi" };
  }
}

export async function deleteEmotion(id: string): Promise<ActionResult> {
  try {
    const ok = await mutateDb((db) => {
      const emotion = db.emotions.find((e) => e.id === id);
      if (!emotion || emotion.is_default) return false;

      db.emotions = db.emotions.filter((e) => e.id !== id);
      for (const journal of db.journals) {
        journal.emotion_ids = journal.emotion_ids.filter((eid) => eid !== id);
      }
      return true;
    });

    if (!ok) return { ok: false, error: "Emosi bawaan tidak bisa dihapus." };

    revalidatePath("/journal");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Gagal menghapus emosi" };
  }
}

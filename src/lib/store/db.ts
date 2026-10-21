import "server-only";

import fs from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";

import { demoAccounts, demoEmotions, demoJournals, demoProfile, demoStrategies, demoTrades } from "@/lib/demo/data";
import type { Account, Emotion, Journal, Profile, Strategy, Trade, TradeScreenshot } from "@/lib/types";

export interface Database {
  version: number;
  /** true bila isinya masih data contoh bawaan (belum pernah diubah user). */
  is_sample: boolean;
  profile: Profile;
  accounts: Account[];
  strategies: Strategy[];
  trades: Trade[];
  journals: Journal[];
  emotions: Emotion[];
  screenshots: TradeScreenshot[];
}

export const DATA_DIR = path.join(process.cwd(), "data");
export const DB_FILE = path.join(DATA_DIR, "tradelog.json");
export const SCREENSHOT_DIR = path.join(DATA_DIR, "screenshots");
/** Gambar lain (mis. contoh chart strategi). */
export const UPLOAD_DIR = path.join(DATA_DIR, "uploads");

/** Seed awal: dataset demo dipakai sebagai contoh supaya UI tidak kosong. */
function seed(): Database {
  return {
    version: 1,
    is_sample: true,
    profile: {
      ...demoProfile,
      email: null,
      avatar_url: null,
    },
    accounts: demoAccounts.map((a) => ({ ...a })),
    strategies: demoStrategies.map((s) => ({ ...s })),
    trades: demoTrades.map((t) => ({ ...t })),
    journals: demoJournals.map((j) => ({ ...j })),
    emotions: demoEmotions.map((e) => ({ ...e })),
    screenshots: [],
  };
}

/**
 * Serialisasi akses tulis. Next.js dev bisa menjalankan beberapa request
 * bersamaan; tanpa antrean, dua penulisan bisa saling menimpa.
 */
let writeChain: Promise<unknown> = Promise.resolve();

function withLock<T>(fn: () => Promise<T>): Promise<T> {
  const run = writeChain.then(fn, fn);
  // Jangan biarkan rejection memutus rantai untuk request berikutnya.
  writeChain = run.then(
    () => undefined,
    () => undefined,
  );
  return run;
}

async function ensureDirs() {
  await fs.mkdir(DATA_DIR, { recursive: true });
}

/** Tulis atomik: tulis ke file sementara lalu rename. */
async function persist(db: Database): Promise<void> {
  await ensureDirs();
  const tmp = `${DB_FILE}.${process.pid}.${Date.now()}.tmp`;
  await fs.writeFile(tmp, JSON.stringify(db, null, 2), "utf8");
  await fs.rename(tmp, DB_FILE);
}

function normalize(raw: unknown): Database {
  const base = seed();
  if (!raw || typeof raw !== "object") return base;
  const obj = raw as Partial<Database>;
  return {
    version: obj.version ?? 1,
    is_sample: obj.is_sample ?? false,
    profile: { ...base.profile, ...(obj.profile ?? {}) },
    accounts: Array.isArray(obj.accounts) ? obj.accounts : [],
    strategies: Array.isArray(obj.strategies) ? obj.strategies : [],
    trades: Array.isArray(obj.trades) ? obj.trades : [],
    journals: Array.isArray(obj.journals) ? obj.journals : [],
    emotions: Array.isArray(obj.emotions) ? obj.emotions : base.emotions,
    screenshots: Array.isArray(obj.screenshots) ? obj.screenshots : [],
  };
}

/** Baca database. Jika file belum ada, buat dari seed. */
export async function readDb(): Promise<Database> {
  try {
    const text = await fs.readFile(DB_FILE, "utf8");
    return normalize(JSON.parse(text));
  } catch (error) {
    const code = (error as NodeJS.ErrnoException)?.code;
    if (code === "ENOENT") {
      const fresh = seed();
      await withLock(() => persist(fresh));
      return fresh;
    }
    // File korup: jangan menimpa data user tanpa peringatan.
    throw new Error(
      `Gagal membaca ${DB_FILE}: ${error instanceof Error ? error.message : "unknown"}`,
    );
  }
}

/**
 * Baca-ubah-tulis dalam satu kunci.
 * `keepSample` dipakai untuk perubahan yang tidak menyentuh isi jurnal
 * (mis. ganti mata uang tampilan) agar penanda "data contoh" tetap muncul.
 */
export async function mutateDb<T>(
  fn: (db: Database) => T | Promise<T>,
  options?: { keepSample?: boolean },
): Promise<T> {
  return withLock(async () => {
    const db = await readDb();
    const result = await fn(db);
    db.version = (db.version ?? 1) + 1;
    // Perubahan isi jurnal berarti ini bukan lagi data contoh murni.
    if (!options?.keepSample) db.is_sample = false;
    await persist(db);
    return result;
  });
}

export function newId(): string {
  return randomUUID();
}

export function nowIso(): string {
  return new Date().toISOString();
}

/** Hitung ulang balance_after untuk satu akun berdasarkan urutan trade. */
export function recalcBalances(db: Database, accountId: string): void {
  const account = db.accounts.find((a) => a.id === accountId);
  if (!account) return;

  const list = db.trades
    .filter((t) => t.account_id === accountId)
    .sort((a, b) => new Date(a.traded_at).getTime() - new Date(b.traded_at).getTime());

  let balance = account.initial_balance;
  for (const trade of list) {
    if (trade.status === "closed") {
      balance += trade.pnl - (trade.fees ?? 0);
      trade.balance_after = Number(balance.toFixed(2));
    } else {
      trade.balance_after = Number(balance.toFixed(2));
    }
  }
}

export function screenshotDiskPath(storagePath: string): string {
  return path.join(SCREENSHOT_DIR, storagePath);
}

export async function writeScreenshotFile(storagePath: string, bytes: Uint8Array): Promise<void> {
  const target = screenshotDiskPath(storagePath);
  await fs.mkdir(path.dirname(target), { recursive: true });
  await fs.writeFile(target, bytes);
}

export async function deleteScreenshotFile(storagePath: string): Promise<void> {
  try {
    await fs.unlink(screenshotDiskPath(storagePath));
  } catch {
    // File sudah tidak ada — abaikan.
  }
}

async function clearFiles() {
  for (const dir of [SCREENSHOT_DIR, UPLOAD_DIR]) {
    try {
      await fs.rm(dir, { recursive: true, force: true });
    } catch {
      // Folder belum ada — abaikan.
    }
  }
}

/** Muat ulang data contoh (menghapus semua data saat ini). */
export async function resetDb(): Promise<void> {
  await withLock(async () => {
    await clearFiles();
    await persist(seed());
  });
}

/** Kosongkan jurnal: tidak ada akun, trade, jurnal, atau strategi. */
export async function clearDb(): Promise<void> {
  await withLock(async () => {
    await clearFiles();
    const base = seed();
    await persist({
      ...base,
      is_sample: false,
      accounts: [],
      strategies: [],
      trades: [],
      journals: [],
      screenshots: [],
    });
  });
}

export async function writeUploadFile(relativePath: string, bytes: Uint8Array): Promise<void> {
  const target = path.join(UPLOAD_DIR, relativePath);
  await fs.mkdir(path.dirname(target), { recursive: true });
  await fs.writeFile(target, bytes);
}

export function uploadDiskPath(relativePath: string): string {
  return path.join(UPLOAD_DIR, relativePath);
}

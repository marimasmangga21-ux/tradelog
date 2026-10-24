import "server-only";

import fs from "node:fs/promises";
import path from "node:path";
import os from "node:os";
import { randomUUID } from "node:crypto";

import { demoAccounts, demoEmotions, demoJournals, demoProfile, demoStrategies, demoTrades } from "@/lib/demo/data";
import type { Account, Emotion, Journal, Profile, Strategy, Trade, TradeScreenshot } from "@/lib/types";

export interface RegisteredUser {
  id: string;
  email: string;
  password: string;
  name: string;
  avatar_url?: string;
  created_at: string;
}

export interface UserDataset {
  is_sample: boolean;
  profile: Profile;
  accounts: Account[];
  strategies: Strategy[];
  trades: Trade[];
  journals: Journal[];
  emotions: Emotion[];
  screenshots: TradeScreenshot[];
}

export interface Database {
  version: number;
  users: RegisteredUser[];
  user_datasets: Record<string, UserDataset>;
  // Root fallback properties
  is_sample: boolean;
  profile: Profile;
  accounts: Account[];
  strategies: Strategy[];
  trades: Trade[];
  journals: Journal[];
  emotions: Emotion[];
  screenshots: TradeScreenshot[];
}

const IS_SERVERLESS = Boolean(process.env.VERCEL || process.env.NETLIFY || process.env.AWS_LAMBDA_FUNCTION_NAME);
export const DATA_DIR = IS_SERVERLESS ? path.join(os.tmpdir(), "tradelog-data") : path.join(process.cwd(), "data");
export const DB_FILE = path.join(DATA_DIR, "tradelog.json");
export const SCREENSHOT_DIR = path.join(DATA_DIR, "screenshots");
export const UPLOAD_DIR = path.join(DATA_DIR, "uploads");

let memoryDb: Database | null = null;

function seed(): Database {
  const emptyOwnerDataset: UserDataset = {
    is_sample: false,
    profile: {
      ...demoProfile,
      name: "Evan Mita",
      email: "marimasmangga21@gmail.com",
      avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=Evan",
    },
    accounts: [],
    strategies: [],
    trades: [],
    journals: [],
    emotions: demoEmotions.map((e) => ({ ...e })),
    screenshots: [],
  };

  return {
    version: 1,
    is_sample: false,
    profile: emptyOwnerDataset.profile,
    accounts: [],
    strategies: [],
    trades: [],
    journals: [],
    emotions: emptyOwnerDataset.emotions,
    screenshots: [],
    users: [
      {
        id: "usr_owner_001",
        email: "marimasmangga21@gmail.com",
        password: "trader123456",
        name: "Evan Mita",
        avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=Evan",
        created_at: new Date().toISOString(),
      },
    ],
    user_datasets: {
      "marimasmangga21@gmail.com": emptyOwnerDataset,
    },
  };
}

let writeChain: Promise<unknown> = Promise.resolve();

function withLock<T>(fn: () => Promise<T>): Promise<T> {
  const run = writeChain.then(fn, fn);
  writeChain = run.then(
    () => undefined,
    () => undefined,
  );
  return run;
}

async function ensureDirs() {
  await fs.mkdir(DATA_DIR, { recursive: true });
}

async function persist(db: Database): Promise<void> {
  memoryDb = db;
  try {
    await ensureDirs();
    await fs.writeFile(DB_FILE, JSON.stringify(db, null, 2), "utf8");
  } catch (err) {
    console.warn("Filesystem write warning:", err);
  }
}

function normalize(raw: unknown): Database {
  const base = seed();
  if (!raw || typeof raw !== "object") return base;
  const obj = raw as Partial<Database>;

  const userDatasets = obj.user_datasets && typeof obj.user_datasets === "object" ? obj.user_datasets : {};
  if (!userDatasets["marimasmangga21@gmail.com"]) {
    userDatasets["marimasmangga21@gmail.com"] = base.user_datasets["marimasmangga21@gmail.com"];
  }

  // Jika sebelumnya ada sisa dataset demo sample bawaan, bersihkan agar awal masuk kosong
  for (const email of Object.keys(userDatasets)) {
    const ds = userDatasets[email];
    if (ds && ds.is_sample) {
      ds.accounts = [];
      ds.strategies = [];
      ds.trades = [];
      ds.journals = [];
      ds.is_sample = false;
    }
  }

  return {
    version: obj.version ?? 2,
    is_sample: obj.is_sample ?? false,
    profile: { ...base.profile, ...(obj.profile ?? {}) },
    accounts: Array.isArray(obj.accounts) ? obj.accounts : [],
    strategies: Array.isArray(obj.strategies) ? obj.strategies : [],
    trades: Array.isArray(obj.trades) ? obj.trades : [],
    journals: Array.isArray(obj.journals) ? obj.journals : [],
    emotions: Array.isArray(obj.emotions) ? obj.emotions : base.emotions,
    screenshots: Array.isArray(obj.screenshots) ? obj.screenshots : [],
    users: Array.isArray(obj.users) && obj.users.length > 0 ? obj.users : base.users,
    user_datasets: userDatasets,
  };
}

export async function readDb(): Promise<Database> {
  if (memoryDb) return memoryDb;

  try {
    const text = await fs.readFile(DB_FILE, "utf8");
    const parsed = normalize(JSON.parse(text));
    memoryDb = parsed;
    return parsed;
  } catch {
    const fresh = seed();
    memoryDb = fresh;
    try {
      await persist(fresh);
    } catch {
      // Ignored
    }
    return fresh;
  }
}

/** Dapatkan email user aktif dari cookie session */
export async function getActiveUserEmail(): Promise<string> {
  try {
    const { cookies } = await import("next/headers");
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("tradelog_session")?.value;
    if (sessionCookie) {
      const parsed = JSON.parse(sessionCookie);
      if (parsed?.email) {
        return parsed.email.trim().toLowerCase();
      }
    }
  } catch {
    // Non-request context
  }
  return "marimasmangga21@gmail.com";
}

/** Ambil dataset spesifik milik user tertentu (KOSONG MURNI untuk semua akun baru) */
export function getUserDataset(db: Database, email?: string): UserDataset {
  const normEmail = (email || "").trim().toLowerCase() || "marimasmangga21@gmail.com";

  if (!db.user_datasets) {
    db.user_datasets = {};
  }

  if (db.user_datasets[normEmail]) {
    return db.user_datasets[normEmail];
  }

  // Semua akun baru (termasuk owner saat awal) dimulai dari data KOSONG MURNI
  const newDataset: UserDataset = {
    is_sample: false,
    profile: {
      ...demoProfile,
      name: normEmail === "marimasmangga21@gmail.com" ? "Evan Mita" : normEmail.split("@")[0] || "Trader",
      email: normEmail,
      avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(normEmail)}`,
    },
    accounts: [],
    strategies: [],
    trades: [],
    journals: [],
    emotions: demoEmotions.map((e) => ({ ...e })),
    screenshots: [],
  };
  db.user_datasets[normEmail] = newDataset;
  return newDataset;
}

/**
 * Baca-ubah-tulis scoped ke dataset user aktif
 */
export async function mutateDb<T>(
  fn: (db: Database & UserDataset) => T | Promise<T>,
  options?: { keepSample?: boolean; targetEmail?: string },
): Promise<T> {
  const activeEmail = options?.targetEmail || (await getActiveUserEmail());
  return withLock(async () => {
    const db = await readDb();
    const userDs = getUserDataset(db, activeEmail);

    const scopedDb = new Proxy(db, {
      get(target, prop, receiver) {
        if (prop in userDs) {
          return (userDs as any)[prop];
        }
        return Reflect.get(target, prop, receiver);
      },
      set(target, prop, value, receiver) {
        if (prop in userDs) {
          (userDs as any)[prop] = value;
          return true;
        }
        return Reflect.set(target, prop, value, receiver);
      },
    });

    const result = await fn(scopedDb as any);
    db.version = (db.version ?? 1) + 1;
    if (!options?.keepSample) userDs.is_sample = false;
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

export function recalcBalances(db: Database & Partial<UserDataset>, accountId: string): void {
  const accounts = db.accounts || [];
  const account = accounts.find((a) => a.id === accountId);
  if (!account) return;

  const trades = db.trades || [];
  const list = trades
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
    // Ignored
  }
}

export async function writeUploadFile(relativePath: string, bytes: Uint8Array): Promise<void> {
  const target = path.join(UPLOAD_DIR, relativePath);
  await fs.mkdir(path.dirname(target), { recursive: true });
  await fs.writeFile(target, bytes);
}

export function uploadDiskPath(relativePath: string): string {
  return path.join(UPLOAD_DIR, relativePath);
}

/** Reset database untuk user aktif (sample data atau kosongkan) */
export async function resetUserDb(email: string, mode: "sample" | "empty"): Promise<void> {
  await withLock(async () => {
    const db = await readDb();
    const normEmail = email.trim().toLowerCase();
    if (!db.user_datasets) db.user_datasets = {};

    if (mode === "sample") {
      db.user_datasets[normEmail] = {
        is_sample: true,
        profile: {
          ...demoProfile,
          name: normEmail === "marimasmangga21@gmail.com" ? "Evan Mita" : normEmail.split("@")[0],
          email: normEmail,
          avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(normEmail)}`,
        },
        accounts: demoAccounts.map((a) => ({ ...a, id: newId() })),
        strategies: demoStrategies.map((s) => ({ ...s, id: newId() })),
        trades: demoTrades.map((t) => ({ ...t, id: newId() })),
        journals: demoJournals.map((j) => ({ ...j, id: newId() })),
        emotions: demoEmotions.map((e) => ({ ...e })),
        screenshots: [],
      };
    } else {
      db.user_datasets[normEmail] = {
        is_sample: false,
        profile: {
          ...demoProfile,
          name: normEmail.split("@")[0],
          email: normEmail,
          avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(normEmail)}`,
        },
        accounts: [],
        strategies: [],
        trades: [],
        journals: [],
        emotions: demoEmotions.map((e) => ({ ...e })),
        screenshots: [],
      };
    }
    await persist(db);
  });
}

export async function resetDb(): Promise<void> {
  const email = await getActiveUserEmail();
  await resetUserDb(email, "sample");
}

export async function clearDb(): Promise<void> {
  const email = await getActiveUserEmail();
  await resetUserDb(email, "empty");
}

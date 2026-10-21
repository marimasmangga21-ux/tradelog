/**
 * Data contoh deterministik.
 * Dipakai sebagai isi awal jurnal supaya UI langsung terlihat hidup.
 * Seed tetap -> tidak ada hydration mismatch.
 */

import type { Account, Emotion, Journal, Profile, Strategy, Trade } from "@/lib/types";

function mulberry32(seed: number) {
  return function random() {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const rand = mulberry32(20260214);

function pick<T>(arr: readonly T[]): T {
  return arr[Math.floor(rand() * arr.length)];
}

function range(min: number, max: number) {
  return min + rand() * (max - min);
}

export const demoProfile: Profile = {
  name: "Trader",
  email: null,
  avatar_url: null,
  locale: "id",
  timezone: "Asia/Jakarta",
  default_currency: "USD",
  hide_amounts: false,
  created_at: "2025-11-02T09:00:00.000Z",
  updated_at: "2026-02-01T09:00:00.000Z",
};

export const demoAccounts: Account[] = [
  {
    id: "10000000-0000-4000-8000-000000000001",
    name: "FTMO Challenge 100K",
    broker: "FTMO",
    account_type: "prop_firm",
    currency: "USD",
    initial_balance: 100000,
    status: "active",
    profit_target: 10000,
    max_drawdown: 10000,
    color: "#17b482",
    notes: "Fase 1 challenge, target 10% dalam 30 hari.",
    archived: false,
    created_at: "2025-11-05T00:00:00.000Z",
    updated_at: "2026-02-01T00:00:00.000Z",
  },
  {
    id: "10000000-0000-4000-8000-000000000002",
    name: "Funding Pips 50K",
    broker: "Funding Pips",
    account_type: "prop_firm",
    currency: "USD",
    initial_balance: 50000,
    status: "passed",
    profit_target: 4000,
    max_drawdown: 5000,
    color: "#38bdf8",
    notes: "Sudah passed, menunggu payout pertama.",
    archived: false,
    created_at: "2025-12-01T00:00:00.000Z",
    updated_at: "2026-02-01T00:00:00.000Z",
  },
  {
    id: "10000000-0000-4000-8000-000000000003",
    name: "Exness Real",
    broker: "Exness",
    account_type: "broker",
    currency: "USD",
    initial_balance: 8000,
    status: "active",
    profit_target: null,
    max_drawdown: null,
    color: "#8b5cf6",
    notes: null,
    archived: false,
    created_at: "2026-01-10T00:00:00.000Z",
    updated_at: "2026-02-01T00:00:00.000Z",
  },
];

export const demoStrategies: Strategy[] = [
  {
    id: "20000000-0000-4000-8000-000000000001",
    name: "ICT Silver Bullet",
    description:
      "Entry di window 10–11 AM New York setelah sweep likuiditas Asian range dan konfirmasi CHoCH di M5.",
    entry_rules:
      "1. Tentukan bias H4/D1\n2. Tunggu sweep Asian high/low\n3. Konfirmasi CHoCH di M5\n4. Entry di FVG pertama setelah displacement",
    exit_rules:
      "1. TP di opposing liquidity\n2. SL di swing low/high terakhir\n3. Cut manual bila 15 menit tidak ada follow-through",
    checklist: [
      { id: "c1", text: "HTF bias jelas (H4/D1)" },
      { id: "c2", text: "Liquidity sweep terjadi" },
      { id: "c3", text: "FVG terbentuk setelah displacement" },
      { id: "c4", text: "R:R minimal 1:2" },
      { id: "c5", text: "Tidak ada news high-impact < 30 menit" },
    ],
    image_url: null,
    color: "#8b5cf6",
    archived: false,
    created_at: "2025-11-06T00:00:00.000Z",
    updated_at: "2026-01-20T00:00:00.000Z",
  },
  {
    id: "20000000-0000-4000-8000-000000000002",
    name: "London Breakout",
    description: "Breakout Asian range saat sesi London dibuka, dengan filter ATR dan retest.",
    entry_rules:
      "1. Tandai Asian range 00:00–07:00 GMT\n2. Tunggu candle H1 close di luar range\n3. Entry saat retest range",
    exit_rules: "1. TP 1.5× tinggi range\n2. SL di sisi dalam range",
    checklist: [
      { id: "c1", text: "Range sempit (< 0.6 × ATR 14)" },
      { id: "c2", text: "Tidak ada news London open" },
      { id: "c3", text: "Spread normal" },
    ],
    image_url: null,
    color: "#17b482",
    archived: false,
    created_at: "2025-11-12T00:00:00.000Z",
    updated_at: "2026-01-15T00:00:00.000Z",
  },
  {
    id: "20000000-0000-4000-8000-000000000003",
    name: "Supply & Demand Swing",
    description: "Swing trade di zona supply/demand fresh pada H4 dengan konfirmasi engulfing.",
    entry_rules: "1. Identifikasi zona fresh H4\n2. Tunggu rejection candle\n3. Entry limit di 50% zona",
    exit_rules: "1. TP di zona berlawanan\n2. SL 1.2× ATR di luar zona",
    checklist: [
      { id: "c1", text: "Zona belum pernah di-test" },
      { id: "c2", text: "Ada confluence dengan Fibonacci 0.618" },
    ],
    image_url: null,
    color: "#f59e0b",
    archived: false,
    created_at: "2025-12-02T00:00:00.000Z",
    updated_at: "2026-01-28T00:00:00.000Z",
  },
];

export const demoEmotions: Emotion[] = [
  { id: "30000000-0000-4000-8000-000000000001", name: "Tenang", slug: "tenang", sentiment: "positive", color: "#3b82f6", is_default: true, created_at: "2025-11-02T00:00:00.000Z" },
  { id: "30000000-0000-4000-8000-000000000002", name: "Disiplin", slug: "disiplin", sentiment: "positive", color: "#22c55e", is_default: true, created_at: "2025-11-02T00:00:00.000Z" },
  { id: "30000000-0000-4000-8000-000000000003", name: "Sabar", slug: "sabar", sentiment: "positive", color: "#14b8a6", is_default: true, created_at: "2025-11-02T00:00:00.000Z" },
  { id: "30000000-0000-4000-8000-000000000004", name: "Percaya Diri", slug: "percaya-diri", sentiment: "positive", color: "#8b5cf6", is_default: true, created_at: "2025-11-02T00:00:00.000Z" },
  { id: "30000000-0000-4000-8000-000000000005", name: "FOMO", slug: "fomo", sentiment: "negative", color: "#f97316", is_default: true, created_at: "2025-11-02T00:00:00.000Z" },
  { id: "30000000-0000-4000-8000-000000000006", name: "Ragu", slug: "ragu", sentiment: "neutral", color: "#eab308", is_default: true, created_at: "2025-11-02T00:00:00.000Z" },
  { id: "30000000-0000-4000-8000-000000000007", name: "Revenge Trading", slug: "revenge-trading", sentiment: "negative", color: "#ef4444", is_default: true, created_at: "2025-11-02T00:00:00.000Z" },
  { id: "30000000-0000-4000-8000-000000000008", name: "Serakah", slug: "serakah", sentiment: "negative", color: "#ec4899", is_default: true, created_at: "2025-11-02T00:00:00.000Z" },
  { id: "30000000-0000-4000-8000-000000000009", name: "Takut", slug: "takut", sentiment: "negative", color: "#a855f7", is_default: true, created_at: "2025-11-02T00:00:00.000Z" },
];

/** Hanya pair forex dan emas — sesuai fokus jurnal ini. */
const PAIRS = [
  "EURUSD", "GBPUSD", "USDJPY", "AUDUSD", "USDCAD",
  "EURJPY", "GBPJPY", "EURGBP", "NZDUSD", "XAUUSD",
] as const;

const SESSIONS = ["asia", "london", "new_york"] as const;

const PRICE_BASE: Record<string, number> = {
  EURUSD: 1.085,
  GBPUSD: 1.271,
  USDJPY: 157.2,
  AUDUSD: 0.664,
  USDCAD: 1.368,
  EURJPY: 170.5,
  GBPJPY: 199.8,
  EURGBP: 0.853,
  NZDUSD: 0.612,
  XAUUSD: 2412,
};

const EXIT_REASONS_WIN = [
  "TP kena sesuai plan",
  "Trailing stop kena setelah momentum kuat",
  "Exit manual di opposing liquidity",
  "Partial TP lalu BE, sisa kena TP",
];

const EXIT_REASONS_LOSS = [
  "SL kena, setup invalid",
  "Cut manual karena CHoCH berlawanan",
  "SL kena saat news rilis",
  "Entry terlalu awal, harga balik ke zona",
];

const EXIT_REASONS_BE = [
  "BE karena ragu, harga balik arah",
  "Tutup manual sebelum news",
  "Momentum hilang, keluar di harga entry",
];

function decimalsFor(instrument: string) {
  if (instrument.includes("JPY")) return 3;
  if (instrument.includes("XAU")) return 2;
  return 5;
}

function buildTrades(): Trade[] {
  const trades: Trade[] = [];
  // Ditambatkan ke hari ini supaya kalender langsung menunjukkan bulan berjalan.
  const today = new Date();
  today.setHours(12, 0, 0, 0);

  // 64 trade tersebar di ~85 hari terakhir.
  for (let i = 0; i < 64; i++) {
    const daysAgo = Math.floor(rand() * 84) + 1;
    const date = new Date(today);
    date.setDate(date.getDate() - daysAgo);
    const hour = Math.floor(range(7, 21));
    const minute = Math.floor(range(0, 60));
    date.setHours(hour, minute, 0, 0);

    const instrument = pick(PAIRS);
    const direction = rand() > 0.42 ? "long" : "short";
    const session = pick(SESSIONS);
    const account = pick(demoAccounts);
    const strategy = rand() > 0.15 ? pick(demoStrategies) : null;

    const base = PRICE_BASE[instrument] ?? 1.1;
    const isGold = instrument.includes("XAU");
    const volatility = isGold ? 0.006 : 0.0035;

    const entry = base * (1 + range(-0.012, 0.012));
    const riskDistance = entry * volatility;
    const stopLoss = direction === "long" ? entry - riskDistance : entry + riskDistance;
    const rrTarget = range(1.4, 3.2);
    const takeProfit =
      direction === "long" ? entry + riskDistance * rrTarget : entry - riskDistance * rrTarget;

    // Distribusi hasil: 52% win, 40% loss, 8% BE
    const roll = rand();
    let result: "win" | "loss" | "breakeven";
    let rMultiple: number;
    if (roll < 0.52) {
      result = "win";
      rMultiple = range(0.9, rrTarget * 0.95);
    } else if (roll < 0.92) {
      result = "loss";
      rMultiple = -range(0.55, 1.05);
    } else {
      result = "breakeven";
      rMultiple = 0;
    }

    const riskAmount = account.initial_balance * range(0.004, 0.011);
    const pnl = Math.round(riskAmount * rMultiple * 100) / 100;
    const exitPrice =
      direction === "long"
        ? entry + riskDistance * rMultiple
        : entry - riskDistance * rMultiple;

    const durationHours = range(0.4, 9);
    const closedAt = new Date(date.getTime() + durationHours * 3600 * 1000);
    const dp = decimalsFor(instrument);

    trades.push({
      id: `40000000-0000-4000-8000-${String(i + 1).padStart(12, "0")}`,
      account_id: account.id,
      strategy_id: strategy?.id ?? null,
      traded_at: date.toISOString(),
      closed_at: closedAt.toISOString(),
      instrument,
      direction,
      session,
      status: "closed",
      entry_price: Number(entry.toFixed(dp)),
      stop_loss: Number(stopLoss.toFixed(dp)),
      take_profit: Number(takeProfit.toFixed(dp)),
      exit_price: Number(exitPrice.toFixed(dp)),
      position_size: Number(range(0.05, 1.2).toFixed(2)),
      pnl,
      pnl_percent: Number(((pnl / account.initial_balance) * 100).toFixed(4)),
      fees: 0,
      r_multiple: Number(rMultiple.toFixed(2)),
      risk_amount: Number(riskAmount.toFixed(2)),
      result,
      exit_reason:
        result === "win"
          ? pick(EXIT_REASONS_WIN)
          : result === "loss"
            ? pick(EXIT_REASONS_LOSS)
            : pick(EXIT_REASONS_BE),
      notes:
        rand() > 0.6
          ? "Eksekusi sesuai checklist. Tidak ada penyesuaian SL setelah entry."
          : null,
      tags: rand() > 0.7 ? ["A+ setup"] : [],
      balance_after: null,
      created_at: date.toISOString(),
      updated_at: closedAt.toISOString(),
    });
  }

  // Satu posisi masih terbuka.
  const openDate = new Date(today);
  openDate.setDate(openDate.getDate() - 1);
  trades.push({
    id: "40000000-0000-4000-8000-000000000901",
    account_id: demoAccounts[0].id,
    strategy_id: demoStrategies[0].id,
    traded_at: openDate.toISOString(),
    closed_at: null,
    instrument: "XAUUSD",
    direction: "long",
    session: "new_york",
    status: "open",
    entry_price: 2408.4,
    stop_loss: 2398.2,
    take_profit: 2432.0,
    exit_price: null,
    position_size: 0.3,
    pnl: 0,
    pnl_percent: null,
    fees: 0,
    r_multiple: null,
    risk_amount: 306,
    result: "open",
    exit_reason: null,
    notes: "Menunggu reaksi di zona demand H1.",
    tags: [],
    balance_after: null,
    created_at: openDate.toISOString(),
    updated_at: openDate.toISOString(),
  });

  return trades.sort((a, b) => new Date(b.traded_at).getTime() - new Date(a.traded_at).getTime());
}

export const demoTrades: Trade[] = buildTrades();

const TRADER_JOURNAL_TEMPLATES = [
  {
    title: "London Fix Sweep & MSS di M5",
    lesson: "Konfirmasi breaker block M5 valid setelah liquidity run di Asian high. RR 1:2.8 tercapai tanpa floating drawdown berarti.",
    mistake: "Sempat ragu entry karena ada high-impact news 40 menit lagi, tapi setup clean A+ jadi tetap eksekusi playbook.",
    content: "Disiplin nunggu candle close di atas FVG M5. Execution on-point, partial 70% di liquidity pool terdekat, sisanya runner.",
    plan: "Pantau reaksi DXY di open New York besok. Jangan paksakan entry kalau London sudah ekspansi lebar.",
    mood: 5,
    emotions: ["tenang", "disiplin", "sabar"],
  },
  {
    title: "Chasing Gold Breakout di Pre-NY",
    lesson: "Gold lagi ranging sempit sebelum CPI release. Market cuma sweep equal highs lalu dump instan. Wajib hindari trade 1 jam sebelum red-folder news.",
    mistake: "FOMO liat volume spike di M1 chart. Cut loss manual telat 4 pip dari plan awal gara-gara denial.",
    content: "Mental terpancing ingin cepat pulih drawdown harian. Beruntung langsung sadar dan shutdown laptop sebelum revenge trading.",
    plan: "Besok wajib patuh hard rule: maksimal 2 trade per sesi dan dilarang entry saat red-folder news.",
    mood: 1,
    emotions: ["fomo", "ragu", "revenge-trading"],
  },
  {
    title: "Asia Low Liquidity Grab -> London Expansion",
    lesson: "Market structure shift (MSS) sangat bersih di 15m. Entry limit order di discount equilibrium 50% mitigasi Order Block.",
    mistake: "Trailing stop agak mepet di BE+2 pips, untung tidak tersapu wick sebelum lari ke target final 1:3.1R.",
    content: "Setup London Open Breakout standar. Mood tenang dan tidak ada overthinking karena risk terukur hanya 0.5% dari akun.",
    plan: "Fokus pair GBPJPY dan EURJPY saja di sesi London besok.",
    mood: 4,
    emotions: ["tenang", "disiplin", "percaya-diri"],
  },
  {
    title: "Overtrading di Lunch Sesi New York",
    lesson: "Jam 12.00 - 13.30 NY volume drop drastis. Algoritma cuma bikin liquidity trap di range sempit.",
    mistake: "Paksakan trade padahal setup B-grade hanya karena bosan mantengin monitor. Mental gatal ingin aksi.",
    content: "Screen time tanpa disiplin adalah musuh utama trader. Belajar bahwa 'tidak trading' juga merupakan posisi.",
    plan: "Pasang alarm penutup laptop tepat jam 12 siang NY. Lanjut gym atau review jurnal di luar market.",
    mood: 2,
    emotions: ["serakah", "fomo", "ragu"],
  },
  {
    title: "Silver Bullet NY AM Session on XAUUSD",
    lesson: "Model ICT Silver Bullet jam 10:00 - 11:00 NY bekerja presisi. Fair Value Gap terisi sempurna lalu harga ekspansi ke buy-side liquidity.",
    mistake: "Tidak ada kesalahan eksekusi mayor. Hanya terlambat taking profit 2 menit saat target hit.",
    content: "Trade paling santai minggu ini. Semua checklist A+ terpenuhi sebelum tombol buy ditekan.",
    plan: "Pertahankan konsistensi risk 0.75%. Review chart malam ini untuk dokumentasi playbook.",
    mood: 5,
    emotions: ["tenang", "percaya-diri", "sabar"],
  },
  {
    title: "Counter-Trend Menangkap Pisau Jatuh di DXY Spike",
    lesson: "D1 bearish trend masih sangat dominan. Reversal di higher timeframe butuh akumulasi panjang, bukan V-shape instan.",
    mistake: "Mencoba tebak bottom counter-trend hanya karena indikator RSI sudah oversold di timeframe kecil. Melanggar bias HTF.",
    content: "Kena SL penuh -1R. Mengakui kekeliruan tanpa mencari kambing hitam broker atau berita.",
    plan: "Kembali ke prinsip follow the trend. Hanya cari setup yang searah dengan H4 market structure.",
    mood: 2,
    emotions: ["takut", "ragu", "fomo"],
  },
  {
    title: "FVG Inversion di London-NY Overlap",
    lesson: "Bearish FVG yang ditembus impulsif berganti fungsi jadi support kuat (Inversion FVG). Retest memberi R:R 1:2.4.",
    mistake: "Sedikit ragu pas retest pertama, akhirnya dapat entry 2 pips lebih buruk dari harga optimal.",
    content: "Overlap session selalu kasih volume terbaik. Risk terukur dan stop loss logis di bawah swing low.",
    plan: "Tandai zona FVG inversion di timeframe 1H setiap pergantian sesi.",
    mood: 4,
    emotions: ["sabar", "disiplin", "tenang"],
  },
  {
    title: "Stop Out Breakeven karena Panik Geser SL",
    lesson: "Market butuh ruang bernapas saat retest intermediate high sebelum ekspansi lanjutan.",
    mistake: "Memindahkan stop loss ke BE terlalu dini saat baru running 0.9R. Kena wick lalu harga terbang 70 pips tanpa saya.",
    content: "Fear of losing profit mengalahkan logika probabilitas. Stop micromanaging trade yang sedang berjalan.",
    plan: "Gunakan aturan hard: SL baru boleh ke BE setelah target Partial 1 (minimal 1.5R) tersentuh.",
    mood: 3,
    emotions: ["takut", "ragu", "sabar"],
  },
  {
    title: "Scalp Tokyo Session Boundary Fade",
    lesson: "Range Tokyo sempit 22 pips. Setup fade di batas supply dengan stop ketat 7 pips menghasilkan +1.4R cepat.",
    mistake: "Lot size sedikit under-risk (0.35%) karena ragu dengan likuiditas Asia.",
    content: "Eksekusi rapi tanpa emosi. Ambil profit lalu langsung istirahat pagi.",
    plan: "Catat data range Asia untuk konfirmasi bias ekspansi London nanti sore.",
    mood: 4,
    emotions: ["tenang", "disiplin"],
  },
  {
    title: "Kecerobohan Pending Order Tanpa Konfirmasi M1",
    lesson: "Zona order block H4 bagus tidak menjamin harga langsung memantul. Reaksi price action lokal tetap wajib diverifikasi.",
    mistake: "Pasang limit order buta (blind entry) saat volatilitas rilis suku bunga bank sentral.",
    content: "Kena stop loss dalam 3 menit. Pengingat keras bahwa market tidak berhutang apapun pada analisis kita.",
    plan: "Wajibkan konfirmasi Lower Timeframe Choch sebelum eksekusi di level supply/demand mayor.",
    mood: 2,
    emotions: ["fomo", "ragu", "takut"],
  },
  {
    title: "Reversal Bersih di Key Psychological Level 1.3700",
    lesson: "Round number 1.3700 USDCAD bertindak sebagai magnet likuiditas institusional. Rejection pin bar sangat solid.",
    mistake: "Keluar seluruh posisi di 2R, padahal ada runner potensial sampai 3.5R ke support harian.",
    content: "Sangat puas dengan kedisiplinan entry. Tidak ada kecemasan selama posisi aktif.",
    plan: "Latih scaling out bertahap: 60% di TP1, 25% di TP2, 15% biarkan running sampai structural break.",
    mood: 5,
    emotions: ["percaya-diri", "disiplin", "tenang"],
  },
  {
    title: "Pelanggaran Risk Per Trade Akibat Terbawa Emosi",
    lesson: "Saat akun sedang floating loss atau draw down, menaikkan lot size adalah cara tercepat menghancurkan modal.",
    mistake: "Risk dinaikkan dari standar 1% menjadi 2.2% karena merasa 'yakin 100%' setup ini tidak mungkin gagal.",
    content: "Tamparan keras bagi ego. Tidak ada setup yang 100% di trading. Disiplin position sizing adalah benteng terakhir.",
    plan: "Kunci lot size calculator di kalkulator Tradoxes, tidak boleh rubah max risk 1% apapun yang terjadi.",
    mood: 1,
    emotions: ["revenge-trading", "serakah", "takut"],
  },
];

export const demoJournals: Journal[] = (() => {
  const closed = demoTrades.filter((t) => t.status === "closed").slice(0, 24);
  const emotionMap = new Map(demoEmotions.map((e) => [e.slug, e.id]));

  return closed.map((trade, i) => {
    const positive = trade.pnl > 0;
    const templateIndex = (i * 2 + (positive ? 0 : 1)) % TRADER_JOURNAL_TEMPLATES.length;
    const tpl = TRADER_JOURNAL_TEMPLATES[templateIndex];

    const mappedEmotionIds = tpl.emotions
      .map((slug) => emotionMap.get(slug))
      .filter((id): id is string => Boolean(id));

    return {
      id: `50000000-0000-4000-8000-${String(i + 1).padStart(12, "0")}`,
      trade_id: trade.id,
      journal_date: trade.traded_at.slice(0, 10),
      title: `${tpl.title} (${trade.instrument})`,
      mood_score: positive ? Math.max(3, tpl.mood) : Math.min(3, tpl.mood),
      emotion_ids: mappedEmotionIds.length > 0 ? mappedEmotionIds : [demoEmotions[0].id],
      lesson_learned: tpl.lesson,
      mistakes: tpl.mistake,
      plan_tomorrow: tpl.plan,
      content: tpl.content,
      created_at: trade.closed_at ?? trade.traded_at,
      updated_at: trade.closed_at ?? trade.traded_at,
    };
  });
})();

export const demoAssets = {
  profile: demoProfile,
  accounts: demoAccounts,
  strategies: demoStrategies,
  trades: demoTrades,
  journals: demoJournals,
  emotions: demoEmotions,
};

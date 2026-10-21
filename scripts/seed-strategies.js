const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const dbPath = path.join(__dirname, '..', 'data', 'tradelog.json');
const db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

if (!db.strategies) {
  db.strategies = [];
}

const presets = [
  {
    name: "SMC & Liquidity Sweep",
    color: "#b2ff05",
    description: "Entry pada Order Block / FVG setelah terjadi liquidity sweep (Asia/London high-low) dan market structure shift (MSS).",
    entry_rules: "1. Tunggu sweep liquidity (high/low sebelumnya)\n2. Konfirmasi MSS di timeframe M5/M15\n3. Entry saat retest ke FVG atau Order Block",
    exit_rules: "1. Target TP di area liquidity bertentangan (equal highs/lows)\n2. SL diletakkan di luar wick candle pembentuk sweep",
    checklist: [
      { id: crypto.randomUUID(), text: "Liquidity sudah tersweep?", done: false },
      { id: crypto.randomUUID(), text: "Market Structure Shift (MSS) valid?", done: false },
      { id: crypto.randomUUID(), text: "Entry di zona FVG / Order Block?", done: false },
      { id: crypto.randomUUID(), text: "Risk:Reward minimal 1:2?", done: false }
    ]
  },
  {
    name: "London / NY Breakout",
    color: "#00d2ff",
    description: "Memanfaatkan momentum ekspansi volatilitas saat pembukaan sesi London atau New York setelah fase konsolidasi.",
    entry_rules: "1. Tandai range Asian Session (high/low)\n2. Tunggu breakout candle impulsif dengan volume tinggi\n3. Entry saat retest batas range atau market order pada momentum",
    exit_rules: "1. TP di key level / average daily range (ADR)\n2. SL di mid-point Asian range atau bawah candle breakout",
    checklist: [
      { id: crypto.randomUUID(), text: "Range Asia terkonsolidasi rapi?", done: false },
      { id: crypto.randomUUID(), text: "Breakout candle solid (bukan fakeout)?", done: false },
      { id: crypto.randomUUID(), text: "Bertepatan dengan jam open sesi (London/NY)?", done: false }
    ]
  },
  {
    name: "Trend Following & Pullback",
    color: "#ffaa00",
    description: "Trading searah tren utama (H1/H4) dengan mencari pullback ke area dinamis EMA 20/50 atau support turned resistance.",
    entry_rules: "1. Struktur HTF membuat Higher High & Higher Low (Uptrend) atau Lower High & Lower Low (Downtrend)\n2. Tunggu koreksi ke zona EMA 20/50\n3. Konfirmasi candlestick rejection (Pinbar / Engulfing)",
    exit_rules: "1. TP di swing high / low sebelumnya\n2. Trailing stop mengikuti swing terakhir",
    checklist: [
      { id: crypto.randomUUID(), text: "Tren HTF searah dan jelas?", done: false },
      { id: crypto.randomUUID(), text: "Pullback tepat di key level / EMA?", done: false },
      { id: crypto.randomUUID(), text: "Ada pola candle konfirmasi rejection?", done: false }
    ]
  },
  {
    name: "Gold Scalping (M1/M5)",
    color: "#ff4d4d",
    description: "Scalping cepat pada instrumen XAUUSD memanfaatkan momentum level psikologis bulat (.00 / .50) dan volume spike.",
    entry_rules: "1. Deteksi rejection atau breakout di level bulat (.00 / .50)\n2. Volume tinggi dan spread normal\n3. Eksekusi cepat target 10-30 pips",
    exit_rules: "1. Strict SL 15-20 pips atau pembatalan candle M1\n2. TP cepat di next round level atau trailing 1:1",
    checklist: [
      { id: crypto.randomUUID(), text: "Spread rendah & volatilitas aktif?", done: false },
      { id: crypto.randomUUID(), text: "Tidak ada rilis berita high-impact (CPI/NFP/FOMC)?", done: false },
      { id: crypto.randomUUID(), text: "Disiplin cut loss jika momentum hilang?", done: false }
    ]
  }
];

const now = new Date().toISOString();

for (const p of presets) {
  const exists = db.strategies.some(s => s.name.toLowerCase() === p.name.toLowerCase());
  if (!exists) {
    db.strategies.push({
      id: crypto.randomUUID(),
      name: p.name,
      description: p.description,
      entry_rules: p.entry_rules,
      exit_rules: p.exit_rules,
      checklist: p.checklist,
      image_url: null,
      color: p.color,
      archived: false,
      created_at: now,
      updated_at: now
    });
  }
}

fs.writeFileSync(dbPath, JSON.stringify(db, null, 2), 'utf8');
console.log(`Successfully seeded strategies. Total strategies: ${db.strategies.length}`);

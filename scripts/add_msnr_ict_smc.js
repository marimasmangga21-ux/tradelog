const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const dbPath = path.join(__dirname, '..', 'data', 'tradelog.json');
const db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

if (!db.strategies) {
  db.strategies = [];
}

const newStrategies = [
  {
    name: "MSNR (Malaysian SNR & Quasimodo)",
    color: "#00d2ff",
    description: "Analisis Support & Resistance berbasis level body candle (bukan wick) dikombinasikan dengan pola Quasimodo (QML) dan Fresh Zone untuk zero-float sniper entry.",
    entry_rules: "1. Tentukan HTF Storyline (H4/D1) apakah me-reject key level body candle.\n2. Identifikasi pola Quasimodo: Left Shoulder (High) -> Head (Higher High) -> Lower Low (Breakout).\n3. Tarik garis horizontal tepat pada body Left Shoulder (Fresh Level).\n4. Entry saat retest menyentuh level QML dengan konfirmasi wick rejection di LTF (M5/M15).",
    exit_rules: "1. Stop Loss: 10-15 pips di luar wick tertinggi Head (Higher High).\n2. Take Profit: Minimal R:R 1:3 atau pada level Fresh Body bertentangan berikutnya.",
    checklist: [
      { id: crypto.randomUUID(), text: "HTF Storyline (H4/D1) searah dengan bias posisi?", done: false },
      { id: crypto.randomUUID(), text: "Left Shoulder merupakan Fresh Level (belum pernah disentuh retest)?", done: false },
      { id: crypto.randomUUID(), text: "Head berhasil membuat Higher High (sweep liquidity) lalu dump impulsif?", done: false },
      { id: crypto.randomUUID(), text: "Ada rejection wick yang jelas saat harga menyentuh garis QML?", done: false }
    ],
    image_url: "/strategies/msnr-setup.png"
  },
  {
    name: "ICT (2022 Mentorship & FVG)",
    color: "#b2ff05",
    description: "Model eksekusi institusional algoritmik (IPDA): Menunggu Liquidity Sweep (BSL/SSL) saat Killzone, displacement yang membentuk MSS, dan entry pada Fair Value Gap (FVG).",
    entry_rules: "1. Tunggu waktu sesi Killzone (London Open 02:00-05:00 NY atau NY Open 07:00-10:00 NY).\n2. Deteksi Liquidity Purge (sweep pada high/low sesi Asia atau swing liquidity pool).\n3. Konfirmasi Displacement kuat yang membentuk Market Structure Shift (MSS) dan meninggalkan Fair Value Gap (FVG).\n4. Pasang limit order atau market entry saat harga retrace ke dalam FVG (zona OTE 62% - 79%).",
    exit_rules: "1. Stop Loss: Di balik wick candle pembentuk sweep atau ujung displacement candle.\n2. Take Profit: Di Liquidity Pool lawan (Sell-Side Liquidity / Buy-Side Liquidity).",
    checklist: [
      { id: crypto.randomUUID(), text: "Eksekusi dilakukan di dalam Killzone aktif (London / NY)?", done: false },
      { id: crypto.randomUUID(), text: "Terjadi sweep liquidity yang valid (BSL/SSL terambil)?", done: false },
      { id: crypto.randomUUID(), text: "Displacement candle impulsif dengan gap FVG 3-candle yang bersih?", done: false },
      { id: crypto.randomUUID(), text: "Risk:Reward minimal 1:2 menuju target liquidity lawan?", done: false }
    ],
    image_url: "/strategies/ict-setup.png"
  },
  {
    name: "SMC (CHoCH, Inducement & Order Block)",
    color: "#ffaa00",
    description: "Struktur pasar mekanis: Menangkap awal pembalikan tren melalui Change of Character (CHoCH), sapuan jebakan retail Inducement (IDM), dan entry pada unmitigated Order Block (OB).",
    entry_rules: "1. Mapping Higher High / Lower Low pada timeframe struktur.\n2. Konfirmasi CHoCH (Change of Character) dengan penutupan body candle melintasi swing terakhir.\n3. Identifikasi Inducement (IDM) sebagai titik likuiditas retail pertama.\n4. Tunggu harga menyapu IDM dan tap masuk ke zona Bullish/Bearish Order Block (OB) di area Discount/Premium.",
    exit_rules: "1. Stop Loss: 5-10 pips di luar batas Order Block.\n2. Take Profit: Target swing target berikutnya (Break of Structure / BOS) atau unmitigated OB lawan.",
    checklist: [
      { id: crypto.randomUUID(), text: "CHoCH valid dengan penutupan body candle (bukan wick sweep)?", done: false },
      { id: crypto.randomUUID(), text: "Inducement (IDM) sudah tersapu sebelum harga menyentuh Order Block?", done: false },
      { id: crypto.randomUUID(), text: "Order Block berada di zona Discount (<50%) untuk Buy atau Premium (>50%) untuk Sell?", done: false },
      { id: crypto.randomUUID(), text: "Order Block masih fresh (unmitigated)?", done: false }
    ],
    image_url: "/strategies/smc-setup.png"
  }
];

const now = new Date().toISOString();

// Hapus strategi lama yang bernama serupa atau update
for (const s of newStrategies) {
  const existingIdx = db.strategies.findIndex(item => 
    item.name.toLowerCase().includes(s.name.substring(0, 3).toLowerCase()) ||
    item.name.toLowerCase() === s.name.toLowerCase()
  );

  if (existingIdx !== -1) {
    db.strategies[existingIdx] = {
      ...db.strategies[existingIdx],
      name: s.name,
      color: s.color,
      description: s.description,
      entry_rules: s.entry_rules,
      exit_rules: s.exit_rules,
      checklist: s.checklist,
      image_url: s.image_url,
      updated_at: now
    };
  } else {
    db.strategies.unshift({
      id: crypto.randomUUID(),
      name: s.name,
      description: s.description,
      entry_rules: s.entry_rules,
      exit_rules: s.exit_rules,
      checklist: s.checklist,
      image_url: s.image_url,
      color: s.color,
      archived: false,
      created_at: now,
      updated_at: now
    });
  }
}

fs.writeFileSync(dbPath, JSON.stringify(db, null, 2), 'utf8');
console.log(`Strategies updated. Total strategies in DB: ${db.strategies.length}`);

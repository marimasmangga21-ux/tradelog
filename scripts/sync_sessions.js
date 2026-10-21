/**
 * Selaraskan field `session` pada trade lama dengan batas sesi terbaru
 * di `src/lib/mt5-utils.ts`.
 *
 * Dijalankan sekali setelah jam sesi diubah (London 07:00 UTC, bukan 08:00).
 * Aman dijalankan berulang: hanya menulis kalau ada yang berubah.
 */
const fs = require("fs");
const path = require("path");

const FILE = path.join(__dirname, "..", "data", "tradelog.json");

function detectSession(iso) {
  const h = new Date(iso).getUTCHours();
  if (h >= 0 && h < 7) return "asia";
  if (h >= 7 && h < 12) return "london";
  if (h >= 12 && h < 21) return "new_york";
  if (h >= 21 && h < 24) return "sydney";
  return "other";
}

const db = JSON.parse(fs.readFileSync(FILE, "utf8"));
const trades = db.trades ?? [];

const changes = [];
for (const trade of trades) {
  if (!trade.traded_at) continue;
  const next = detectSession(trade.traded_at);
  if (trade.session !== next) {
    changes.push({
      id: trade.id,
      at: trade.traded_at,
      from: trade.session,
      to: next,
    });
    trade.session = next;
    trade.updated_at = new Date().toISOString();
  }
}

if (changes.length === 0) {
  console.log("Tidak ada perubahan. Semua trade sudah sesuai batas sesi terbaru.");
  process.exit(0);
}

// Backup dulu
const backup = `${FILE}.bak-${Date.now()}`;
fs.copyFileSync(FILE, backup);

fs.writeFileSync(FILE, JSON.stringify(db, null, 2));

console.log(`Backup: ${path.basename(backup)}`);
console.log(`Diperbarui ${changes.length} trade:`);
for (const c of changes) {
  console.log(`  ${c.at.slice(0, 16).replace("T", " ")} UTC  ${c.from} -> ${c.to}`);
}

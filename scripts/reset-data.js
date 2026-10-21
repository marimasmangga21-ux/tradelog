/**
 * Reset jurnal ke data contoh awal.
 * Menghapus data/tradelog.json + screenshot, lalu seed ulang saat app dibuka.
 *
 * Pemakaian: npm run reset:data
 */
const fs = require("node:fs");
const path = require("node:path");

const DATA_DIR = path.join(process.cwd(), "data");
const targets = ["tradelog.json", "screenshots", "uploads"];

let removed = 0;
for (const target of targets) {
  const full = path.join(DATA_DIR, target);
  if (!fs.existsSync(full)) continue;
  fs.rmSync(full, { recursive: true, force: true });
  removed++;
  console.log("removed:", path.relative(process.cwd(), full));
}

if (removed === 0) {
  console.log("Tidak ada data untuk direset.");
} else {
  console.log("\nSelesai. Buka aplikasi untuk membuat ulang data contoh.");
}

# Tradelog

Jurnal trading forex pribadi. Tanpa login, tanpa langganan — semua data tersimpan
di file JSON di folder proyek ini.

## Menjalankan

```bash
npm install
npm run dev
```

Buka <http://localhost:3000> — langsung masuk ke dashboard.

## Penyimpanan data

Semua data (akun, trade, jurnal, strategi, emosi) disimpan di:

```
data/tradelog.json
```

Screenshot chart disimpan di `data/screenshots/`, gambar strategi di `data/uploads/`.

- **Backup**: salin folder `data/`.
- **Reset ke data contoh**: `npm run reset:data`, atau dari halaman Pengaturan.
- File dibuat otomatis saat pertama kali dijalankan, berisi data contoh agar UI
  tidak kosong. Hapus lewat Pengaturan → Reset semua data kalau ingin mulai dari nol.

## Perintah

| Perintah | Fungsi |
| --- | --- |
| `npm run dev` | Jalankan dev server |
| `npm run build` | Build produksi |
| `npm start` | Jalankan hasil build |
| `npm run typecheck` | Cek TypeScript |
| `npm run reset:data` | Hapus data & kembali ke data contoh |
| `npm run smoke` | Cek semua halaman (butuh dev server jalan) |
| `npm run smoke:mobile` | Cek overflow horizontal di 390px |

## Fitur

- **Dashboard** — ringkasan PnL, win rate, profit factor, Skor Tradelog, trade terbuka.
- **Log Trade** — catat eksekusi dengan entry/SL/TP, sesi, R:R otomatis, screenshot
  HTF/MTF/LTF, filter & sorting, detail/edit/hapus.
- **Jurnal Emosi** — refleksi harian, mood, emosi custom, analitik emosi vs hasil.
- **Kalender Performa** — PnL harian per bulan, detail per hari.
- **Multi-Akun** — prop firm, broker, personal, demo; saldo dihitung dari PnL.
- **Strategy Playbook** — aturan entry/exit, checklist, gambar contoh, performa per strategi.
- **Analitik** — equity curve, per sesi/jam/pair/strategi, drawdown, consistency, Skor Tradelog.
- **Snapshot PNG** — bagikan trade, kalender, atau performa sebagai gambar.

## Teknis

- Next.js 15 App Router, React 19, TypeScript, Tailwind CSS.
- Data layer: file JSON dengan penulisan atomik (`src/lib/store/db.ts`).
- Server actions untuk semua mutasi (`src/app/actions/`).
- i18n ID/EN (`src/lib/i18n/dictionaries/`), default Indonesia.
- Tema gelap default, mobile-first.

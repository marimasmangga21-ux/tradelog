/**
 * Uji alur nyata lewat UI: buat trade, tutup trade, hapus trade.
 * Pemakaian: node scripts/flow-trade.js
 */
const { chromium } = require("playwright");

const BASE = "http://localhost:3000";

(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
  const page = await ctx.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push("pageerror: " + e.message));
  page.on("console", (m) => {
    if (m.type() === "error" && !/favicon/i.test(m.text())) errors.push(m.text());
  });

  const before = await (await fetch(BASE + "/api/data")).json();
  console.log("trades sebelum:", before.trades.length);

  // 1. Buat trade baru
  await page.goto(BASE + "/trades/new", { waitUntil: "networkidle" });

  // instrument = input dengan datalist
  await page.fill("#instrument", "EURUSD");
  await page.fill("#entry_price", "1.08500");
  await page.fill("#stop_loss", "1.08200");
  await page.fill("#take_profit", "1.09100");
  await page.fill("#position_size", "0.5");

  await page.getByRole("button", { name: /Simpan|Save/i }).first().click();
  await page.waitForTimeout(4000);

  const afterCreate = await (await fetch(BASE + "/api/data")).json();
  console.log("trades setelah buat:", afterCreate.trades.length);
  const created = afterCreate.trades.find(
    (t) => t.instrument === "EURUSD" && t.status === "open" && t.entry_price === 1.085,
  );
  console.log("trade dibuat:", created ? created.id + " status=" + created.status : "TIDAK ADA");
  console.log("url:", page.url());

  if (created) {
    // 2. Tutup trade
    await page.goto(BASE + "/trades/" + created.id, { waitUntil: "networkidle" });
    await page.waitForTimeout(900);
    const closeBtn = page.getByRole("button", { name: /Tutup trade|Close trade/i }).first();
    console.log("tombol tutup ada:", await closeBtn.count());
    if (await closeBtn.count()) {
      await closeBtn.click();
      await page.waitForTimeout(900);
      const exit = page.locator("#exit_price");
      console.log("field exit ada:", await exit.count());
      if (await exit.count()) {
        await exit.first().fill("1.09000");
        await page.getByRole("button", { name: /Tutup trade|Close trade/i }).last().click();
        await page.waitForTimeout(3500);
      }
    }
    const afterClose = await (await fetch(BASE + "/api/data")).json();
    const closed = afterClose.trades.find((t) => t.id === created.id);
    console.log("setelah tutup:", closed ? "status=" + closed.status + " pnl=" + closed.pnl + " r=" + closed.r_multiple : "HILANG");

    // 3. Hapus trade
    await page.goto(BASE + "/trades/" + created.id, { waitUntil: "networkidle" });
    await page.waitForTimeout(900);
    const delBtn = page.getByRole("button", { name: /^Hapus$|^Delete$/i }).first();
    console.log("tombol hapus ada:", await delBtn.count());
    if (await delBtn.count()) {
      await delBtn.click();
      await page.waitForTimeout(800);
      const confirm = page.getByRole("button", { name: /^Hapus$|^Delete$/i }).last();
      if (await confirm.count()) await confirm.click();
      await page.waitForTimeout(3500);
    }
    const afterDelete = await (await fetch(BASE + "/api/data")).json();
    console.log("trades setelah hapus:", afterDelete.trades.length);
    console.log("masih ada?", afterDelete.trades.some((t) => t.id === created.id));
  }

  console.log("error konsol:", errors.length ? errors.slice(0, 5) : "tidak ada");
  await browser.close();
})();

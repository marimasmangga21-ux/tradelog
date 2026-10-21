const { chromium } = require("playwright");

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 }, deviceScaleFactor: 2 });
  await page.goto("http://localhost:3000/strategies", { waitUntil: "networkidle" });
  await page.locator("button:has-text('Panduan Konsep')").first().click();
  await page.waitForTimeout(500);

  // POI tab
  await page.locator("button:has-text('2. Point of Interest')").first().click();
  await page.waitForTimeout(400);

  // MSNR + Lanjutan -> should be empty (QML is Dasar)
  await page.locator("button:has-text('Lanjutan')").first().click();
  await page.waitForTimeout(250);
  await page.locator("button:has-text('MSNR')").first().click();
  await page.waitForTimeout(350);

  const empty = await page.locator("text=Tidak ada konsep").count();
  console.log("empty state visible:", empty > 0);

  const shot = page.locator("div.space-y-4").first();
  await shot.screenshot({ path: "shots/level-empty-state.png" });

  // reset via button
  await page.locator("button:has-text('Tampilkan semua')").first().click();
  await page.waitForTimeout(300);
  const cards = page.locator("div.grid.sm\\:grid-cols-2.lg\\:grid-cols-3 > div");
  console.log("cards after reset:", await cards.count());

  await browser.close();
  console.log("Done.");
})();

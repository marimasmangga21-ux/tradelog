const { chromium } = require("playwright");

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 1100 }, deviceScaleFactor: 2 });
  await page.goto("http://localhost:3000/strategies", { waitUntil: "networkidle" });

  await page.locator("button:has-text('Panduan Konsep')").first().click();
  await page.waitForTimeout(500);

  const tabs = [
    { tab: "1. Market Structure", file: "ms" },
    { tab: "2. Point of Interest", file: "poi" },
    { tab: "3. Liquidity", file: "liq" },
  ];

  for (const t of tabs) {
    await page.locator(`button:has-text('${t.tab}')`).first().click();
    await page.waitForTimeout(400);

    // all
    await page.locator("button:has-text('Semua')").first().click();
    await page.waitForTimeout(300);
    const cards = page.locator("div.grid.sm\\:grid-cols-2.lg\\:grid-cols-3 > div");
    console.log(t.file, "all cards:", await cards.count());

    // dasar
    await page.locator("button:has-text('Dasar')").first().click();
    await page.waitForTimeout(300);
    console.log(t.file, "dasar cards:", await cards.count());
    await page.screenshot({ path: `shots/level-${t.file}-dasar.png`, fullPage: true });

    // lanjutan
    await page.locator("button:has-text('Lanjutan')").first().click();
    await page.waitForTimeout(300);
    console.log(t.file, "lanjutan cards:", await cards.count());
    await page.screenshot({ path: `shots/level-${t.file}-lanjutan.png`, fullPage: true });

    // reset
    await page.locator("button:has-text('Semua')").first().click();
    await page.waitForTimeout(200);
  }

  await browser.close();
  console.log("Level screenshots captured.");
})();

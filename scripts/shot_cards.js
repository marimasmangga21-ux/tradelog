const { chromium } = require("playwright");

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 1100 }, deviceScaleFactor: 2 });
  await page.goto("http://localhost:3000/strategies", { waitUntil: "networkidle" });

  await page.locator("button:has-text('Panduan Konsep')").first().click();
  await page.waitForTimeout(500);

  const groups = [
    { tab: "1. Market Structure", file: "zoom-ms" },
    { tab: "2. Point of Interest", file: "zoom-poi" },
    { tab: "3. Liquidity", file: "zoom-liq" },
  ];

  for (const g of groups) {
    await page.locator(`button:has-text('${g.tab}')`).first().click();
    await page.waitForTimeout(400);
    const grids = page.locator("div.grid.sm\\:grid-cols-2.lg\\:grid-cols-3");
    const gridCount = await grids.count();
    let n = 0;
    for (let gi = 0; gi < gridCount; gi++) {
      const cards = grids.nth(gi).locator("> div");
      const count = await cards.count();
      for (let i = 0; i < count; i++) {
        n += 1;
        await cards.nth(i).screenshot({ path: `shots/${g.file}-${n}.png` });
      }
    }
    console.log(g.tab, "cards:", n);
  }

  await browser.close();
  console.log("Card zoom screenshots captured.");
})();

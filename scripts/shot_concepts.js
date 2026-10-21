const { chromium } = require("playwright");

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 1100 } });
  await page.goto("http://localhost:3000/strategies", { waitUntil: "networkidle" });

  // Click on "Panduan Konsep" tab
  const tabButton = page.locator("button:has-text('Panduan Konsep')").first();
  await tabButton.click();
  await page.waitForTimeout(600);
  await page.screenshot({ path: "shots/concepts-tab-market-structure.png", fullPage: true });

  // Click on "2. Point of Interest" sub-tab
  const poiTab = page.locator("button:has-text('2. Point of Interest')").first();
  await poiTab.click();
  await page.waitForTimeout(500);
  await page.screenshot({ path: "shots/concepts-tab-poi.png", fullPage: true });

  // Click on "3. Liquidity" sub-tab
  const liqTab = page.locator("button:has-text('3. Liquidity')").first();
  await liqTab.click();
  await page.waitForTimeout(500);
  await page.screenshot({ path: "shots/concepts-tab-liquidity.png", fullPage: true });

  await browser.close();
  console.log("All concept screenshots captured.");
})();

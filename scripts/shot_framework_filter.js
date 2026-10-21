const { chromium } = require("playwright");

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 1100 }, deviceScaleFactor: 2 });
  await page.goto("http://localhost:3000/strategies", { waitUntil: "networkidle" });

  await page.locator("button:has-text('Panduan Konsep')").first().click();
  await page.waitForTimeout(500);

  // Filter: SMC only
  await page.locator("button:has-text('SMC (')").first().click();
  await page.waitForTimeout(400);
  await page.screenshot({ path: "shots/filter-smc.png", fullPage: false });

  // Filter: MSNR only
  await page.locator("button:has-text('MSNR (')").first().click();
  await page.waitForTimeout(400);
  await page.screenshot({ path: "shots/filter-msnr.png", fullPage: false });

  await browser.close();
  console.log("Filter screenshots captured.");
})();

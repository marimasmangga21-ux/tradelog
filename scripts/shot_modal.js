const { chromium } = require("playwright");

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  await page.goto("http://localhost:3000/strategies", { waitUntil: "networkidle" });
  
  // Click on "Lihat detail"
  const button = page.locator("button:has-text('Lihat detail')").first();
  await button.click();
  await page.waitForTimeout(600);

  await page.screenshot({ path: "shots/strategy-modal-detail.png" });
  await browser.close();
  console.log("Modal shot saved.");
})();

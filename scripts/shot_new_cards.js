const { chromium } = require("playwright");

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 1100 }, deviceScaleFactor: 2 });
  await page.goto("http://localhost:3000/strategies", { waitUntil: "networkidle" });
  await page.locator("button:has-text('Panduan Konsep')").first().click();
  await page.waitForTimeout(500);

  const targets = [
    { tab: "1. Market Structure", term: "Swing Failure Pattern" },
    { tab: "1. Market Structure", term: "QML Structure" },
    { tab: "1. Market Structure", term: "Fresh Level" },
    { tab: "2. Point of Interest", term: "SMC Order Block" },
    { tab: "2. Point of Interest", term: "SMC Liquidity Void" },
    { tab: "2. Point of Interest", term: "SMC Premium / Discount" },
    { tab: "2. Point of Interest", term: "SMC Mitigation" },
    { tab: "2. Point of Interest", term: "Body Zone (MSNR)" },
    { tab: "2. Point of Interest", term: "Level Stacking (MSNR)" },
    { tab: "3. Liquidity", term: "SMC Liquidity Sweep" },
    { tab: "3. Liquidity", term: "MSNR Sweep" },
    { tab: "3. Liquidity", term: "SMC Inducement" },
  ];

  let current = "";
  for (const t of targets) {
    if (t.tab !== current) {
      await page.locator(`button:has-text('${t.tab}')`).first().click();
      await page.waitForTimeout(350);
      current = t.tab;
    }
    const card = page
      .locator("div.grid.sm\\:grid-cols-2.lg\\:grid-cols-3 > div")
      .filter({ has: page.locator(`span:text-is("${t.term}")`) })
      .first();
    const safe = t.term.replace(/[^a-z0-9]+/gi, "-").toLowerCase();
    await card.screenshot({ path: `shots/new-${safe}.png` });
    console.log("captured:", t.term);
  }

  await browser.close();
})();

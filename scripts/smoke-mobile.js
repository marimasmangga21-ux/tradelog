const { chromium } = require("playwright");

const ROUTES = ["/", "/dashboard", "/trades", "/calendar", "/analytics", "/journal", "/accounts", "/strategies", "/settings", "/trades/new"];

(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
    deviceScaleFactor: 2,
  });
  const page = await ctx.newPage();
  let bad = 0;
  for (const r of ROUTES) {
    await page.goto("http://localhost:3000" + r, { waitUntil: "domcontentloaded", timeout: 90000 });
    await page.waitForTimeout(1200);
    let o = -1;
    try {
      o = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    } catch {}
    if (o > 1) bad++;
    console.log(`${o > 1 ? "OVERFLOW" : "   ok   "} ${String(o).padStart(3)}px  ${r}`);
  }
  console.log(`\n${ROUTES.length - bad}/${ROUTES.length} no horizontal overflow @390px`);
  await browser.close();
})();

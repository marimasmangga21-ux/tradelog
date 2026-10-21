const { chromium } = require("playwright");

const ROUTES = [
  "/",
  "/dashboard",
  "/trades",
  "/trades/new",
  "/trades/40000000-0000-4000-8000-000000000002",
  "/trades/40000000-0000-4000-8000-000000000002/edit",
  "/journal",
  "/journal/new",
  "/calendar",
  "/accounts",
  "/strategies",
  "/analytics",
  "/settings",
];

(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
  const page = await ctx.newPage();
  let fails = 0;

  for (const route of ROUTES) {
    const errs = [];
    const onErr = (e) => errs.push("pageerror: " + e.message);
    const onCon = (m) => {
      if (m.type() === "error" && !/favicon|404 \(Not Found\)/i.test(m.text())) errs.push(m.text());
    };
    page.on("pageerror", onErr);
    page.on("console", onCon);

    let status = "?";
    try {
      const res = await page.goto("http://localhost:3000" + route, {
        waitUntil: "domcontentloaded",
        timeout: 90000,
      });
      status = res ? res.status() : "?";
      await page.waitForTimeout(1400);
    } catch (e) {
      errs.push("nav: " + e.message);
    }

    page.off("pageerror", onErr);
    page.off("console", onCon);

    // horizontal overflow check
    let overflow = -1;
    try {
      overflow = await page.evaluate(() => {
        const d = document.documentElement;
        return d.scrollWidth - d.clientWidth;
      });
    } catch {
      // context destroyed by a late navigation; not a layout failure
    }

    const bad = status !== 200 || errs.length > 0;
    if (bad) fails++;
    console.log(
      `${bad ? "FAIL" : " OK "} ${String(status).padEnd(4)} overflow=${overflow} ${route}` +
        (errs.length ? `\n       ${errs.slice(0, 3).join("\n       ")}` : ""),
    );
  }

  console.log(`\n${ROUTES.length - fails}/${ROUTES.length} routes clean`);
  await browser.close();
})();

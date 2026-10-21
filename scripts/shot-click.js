const { chromium } = require("playwright");

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 }, deviceScaleFactor: 1 });
  const errors = [];
  page.on("console", (msg) => {
    if (msg.type() === "error") errors.push(msg.text());
  });
  page.on("pageerror", (err) => errors.push("PAGEERROR: " + err.message));

  const url = process.argv[2];
  const out = process.argv[3];
  const clickText = process.argv[4];

  await page.goto(url, { waitUntil: "networkidle", timeout: 60000 });
  await page.waitForTimeout(800);

  if (clickText) {
    await page.getByRole("button", { name: clickText }).first().click();
    await page.waitForTimeout(1200);
  }

  await page.screenshot({ path: out, fullPage: !clickText });
  console.log("ERRORS:", JSON.stringify(errors.slice(0, 10), null, 2));
  await browser.close();
})();

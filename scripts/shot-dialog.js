const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto('http://localhost:3000/accounts', { waitUntil: 'networkidle' });
  
  // Klik tombol Connect MT5
  await page.click('button:has-text("Connect MT5")');
  await page.waitForTimeout(500);
  
  await page.screenshot({ path: 'shots/connect-mt5-dialog.png' });
  await browser.close();
  console.log('DIALOG_SHOT_DONE');
})();

const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto('http://localhost:3000/accounts', { waitUntil: 'networkidle' });
  
  // Klik tombol Tambah Akun
  await page.click('button:has-text("Tambah Akun")');
  await page.waitForTimeout(500);

  // Klik dropdown mata uang di samping initial balance
  // Dropdown currency adalah tombol SelectTrigger w-24 di dalam form
  const triggers = page.locator('button[role="combobox"]');
  const count = await triggers.count();
  for (let i = 0; i < count; i++) {
    const text = await triggers.nth(i).innerText();
    if (text.includes('USD') || text.includes('USC')) {
      await triggers.nth(i).click();
      break;
    }
  }
  await page.waitForTimeout(500);
  
  await page.screenshot({ path: 'shots/account-form-usc.png' });
  await browser.close();
  console.log('FORM_USC_SHOT_DONE');
})();

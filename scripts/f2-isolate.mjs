import { chromium, devices } from '@playwright/test';

const browser = await chromium.launch();
const page = await browser.newPage({ ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } });
await page.goto('http://127.0.0.1:5173/');
await page.waitForSelector('[data-hbl-app="true"]');
await page.locator('.module-list-item').filter({ hasText: 'Circulation' }).click();
await page.waitForSelector('.reference-object-note', { timeout: 20000 });
await page.waitForTimeout(4500);

const region = await page.evaluate(() => {
  const search = document.querySelector('#atlas-search-panel');
  const rect = search.getBoundingClientRect();
  return { x: rect.left - 260, y: rect.top - 40, width: 520, height: 110 };
});

for (const selector of ['.map-coordinates', '.three-hud-top', '.anatomy-search']) {
  await page.evaluate((sel) => { document.querySelectorAll(sel).forEach((el) => { el.style.display = 'none'; }); }, selector);
  await page.waitForTimeout(300);
  await page.screenshot({ path: `docs/screenshots/shot-iso-${selector.replace(/[^a-z]/g, '')}.png`, clip: region });
  await page.evaluate((sel) => { document.querySelectorAll(sel).forEach((el) => { el.style.display = ''; }); }, selector);
  await page.waitForTimeout(300);
}
await browser.close();
console.log('done');

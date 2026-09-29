import { chromium, devices } from '@playwright/test';

const browser = await chromium.launch();
const page = await browser.newPage({ ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } });
await page.goto('http://127.0.0.1:5173/');
await page.waitForSelector('[data-hbl-app="true"]');
await page.locator('.module-list-item').filter({ hasText: 'Circulation' }).click();
await page.waitForSelector('.reference-object-note', { timeout: 20000 });
await page.waitForTimeout(4500);
const region = await page.evaluate(() => {
  document.querySelectorAll('.body-3d-canvas').forEach((canvas) => { canvas.style.visibility = 'hidden'; });
  const search = document.querySelector('#atlas-search-panel');
  const rect = search.getBoundingClientRect();
  return { x: rect.left - 260, y: rect.top - 60, width: 420, height: 140 };
});
await page.waitForTimeout(400);
await page.screenshot({ path: 'docs/screenshots/shot-f2-nocanvas.png', clip: region });
await browser.close();
console.log('done');

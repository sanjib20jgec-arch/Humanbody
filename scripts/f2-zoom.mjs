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
  return { x: rect.left - 260, y: rect.top - 60, width: 420, height: 140 };
});
console.log(JSON.stringify(region));
await page.screenshot({ path: 'docs/screenshots/shot-f2-zoom.png', clip: region });

// which elements sit at the search-label row, left of the panel?
const stack = await page.evaluate(() => {
  const label = document.querySelector('#atlas-search-panel label');
  const rect = label.getBoundingClientRect();
  const points = [[rect.left - 40, rect.top + 5], [rect.left + 30, rect.top + 5]];
  return points.map(([x, y]) => document.elementsFromPoint(x, y).map((el) => `${el.tagName}.${String(el.className).slice(0, 40)}`));
});
console.log(JSON.stringify(stack, null, 2));
await browser.close();

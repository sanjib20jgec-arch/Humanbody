import { chromium, devices } from '@playwright/test';

const browser = await chromium.launch();
const page = await browser.newPage({ ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } });
await page.goto('http://127.0.0.1:5173/');
await page.waitForSelector('[data-hbl-app="true"]');
await page.waitForTimeout(6500);

const boxes = await page.evaluate(() => {
  const pick = (selector) => {
    const element = document.querySelector(selector);
    if (!element) return null;
    const rect = element.getBoundingClientRect();
    return { selector, top: rect.top, bottom: rect.bottom, left: rect.left, right: rect.right };
  };
  return {
    topline: pick('.body-map-column .map-topline'),
    coords: pick('.map-coordinates'),
    search: pick('#atlas-search-panel'),
    searchLabel: pick('#atlas-search-panel label'),
  };
});
console.log(JSON.stringify(boxes, null, 2));

const { topline, search } = boxes;
if (topline && search) {
  const overlap = Math.min(topline.bottom, search.bottom) - Math.max(topline.top, search.top);
  console.log(overlap > 0 ? `OVERLAP ${overlap.toFixed(1)}px` : `CLEAR (gap ${(-overlap).toFixed(1)}px)`);
}

await page.locator('.body-map-column').screenshot({ path: 'docs/screenshots/shot-atlas-topline.png' });
await page.screenshot({ path: 'docs/screenshots/shot-home-r5.png' });
await browser.close();
console.log('done');

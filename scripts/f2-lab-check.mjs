import { chromium, devices } from '@playwright/test';

const measure = (page) => page.evaluate(() => {
  const pick = (selector) => {
    const element = document.querySelector(selector);
    if (!element) return null;
    const rect = element.getBoundingClientRect();
    return { selector, top: rect.top, bottom: rect.bottom, left: rect.left, right: rect.right, visible: rect.width > 0 && rect.height > 0 };
  };
  return {
    topline: pick('.body-map-wrap .map-topline'),
    search: pick('#atlas-search-panel'),
    searchLabel: pick('#atlas-search-panel label'),
    stage: pick('.body-3d-stage'),
  };
});

const browser = await chromium.launch();
const page = await browser.newPage({ ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } });
await page.goto('http://127.0.0.1:5173/');
await page.waitForSelector('[data-hbl-app="true"]');
await page.locator('.module-list-item').filter({ hasText: 'Circulation' }).click();
await page.waitForSelector('.reference-object-note', { timeout: 20000 });
await page.waitForTimeout(4500);
const desktop = await measure(page);
console.log('desktop circulation explore:', JSON.stringify(desktop, null, 2));
if (desktop.topline && desktop.search) {
  const overlap = Math.min(desktop.topline.bottom, desktop.search.bottom) - Math.max(desktop.topline.top, desktop.search.top);
  const hOverlap = Math.min(desktop.topline.right, desktop.search.right) - Math.max(desktop.topline.left, desktop.search.left);
  console.log(overlap > 0 && hOverlap > 0 ? `OVERLAP v=${overlap.toFixed(1)}px h=${hOverlap.toFixed(1)}px` : `CLEAR (v-gap ${(-overlap).toFixed(1)}px)`);
}
await page.locator('.reference-object-panel').screenshot({ path: 'docs/screenshots/shot-circulation-panel.png' });

// Mobile viewport too (F2 was reported on screenshots at desktop, but check narrow).
await page.setViewportSize({ width: 390, height: 844 });
await page.waitForTimeout(2500);
const mobile = await measure(page);
console.log('mobile circulation explore:', JSON.stringify(mobile, null, 2));
if (mobile.topline && mobile.search) {
  const overlap = Math.min(mobile.topline.bottom, mobile.search.bottom) - Math.max(mobile.topline.top, mobile.search.top);
  console.log(overlap > 0 ? `MOBILE OVERLAP ${overlap.toFixed(1)}px` : `MOBILE CLEAR (gap ${(-overlap).toFixed(1)}px)`);
}
await browser.close();
console.log('done');

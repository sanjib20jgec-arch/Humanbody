import assert from 'node:assert/strict';

const baseURL = process.env.BASE_URL || 'http://127.0.0.1:5174/';
let playwright;
try {
  playwright = await import('playwright');
} catch (error) {
  console.error('PWA browser test requires Playwright. Run: npm install');
  console.error(error.message);
  process.exit(2);
}

const browser = await playwright.chromium.launch({ headless: true });
try {
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 }, serviceWorkers: 'allow' });
  const page = await context.newPage();
  await page.goto(baseURL, { waitUntil: 'networkidle' });
  await page.evaluate(async () => { await navigator.serviceWorker.ready; });
  await page.reload({ waitUntil: 'networkidle' });
  await page.locator('#scene-canvas').waitFor({ state: 'attached', timeout: 10000 });
  await page.waitForTimeout(300);
  assert.match(await page.locator('#offline-status').textContent(), /Offline ready|Offline shell partial/);
  await context.setOffline(true);
  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.locator('#scene-canvas').waitFor({ state: 'attached', timeout: 10000 });
  await page.waitForTimeout(500);
  assert.equal(await page.locator('#state-label').textContent(), 'Locomotion');
  assert.ok(await page.locator('#scene-canvas').count());
  console.log('PWA offline browser test passed');
  await context.close();
} finally {
  await browser.close();
}

import { chromium } from '@playwright/test';
const browser = await chromium.launch();
for (const profile of [
  { name: 'ipad-pro-13', viewport: { width: 1024, height: 1366 }, hasTouch: true, deviceScaleFactor: 2, userAgent: 'Mozilla/5.0 (iPad; CPU OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1' },
  { name: 'iphone-15-pro', viewport: { width: 393, height: 852 }, hasTouch: true, isMobile: true, deviceScaleFactor: 3, userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1' }
]) {
  const context = await browser.newContext(profile);
  const page = await context.newPage();
  await page.goto('http://127.0.0.1:5173/');
  await page.waitForSelector('[data-hbl-app="true"]');
  await page.waitForTimeout(5200);
  await page.screenshot({ path: `docs/screenshots/shot-dm-${profile.name}.png` });
  await context.close();
}
await browser.close();
console.log('done');

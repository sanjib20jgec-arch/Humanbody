import { chromium, devices } from '@playwright/test';

const profiles = [
  { name: 'iphone-15-pro', viewport: { width: 393, height: 852 }, hasTouch: true, isMobile: true, deviceScaleFactor: 3, userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1' },
  { name: 'galaxy-s24-ultra', viewport: { width: 412, height: 915 }, hasTouch: true, isMobile: true, deviceScaleFactor: 3, userAgent: 'Mozilla/5.0 (Linux; Android 14; SM-S928B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.6099.43 Mobile Safari/537.36' },
  { name: 'phone-landscape', viewport: { width: 852, height: 393 }, hasTouch: true, isMobile: true, deviceScaleFactor: 3, userAgent: 'Mozilla/5.0 (Linux; Android 14; SM-S928B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.6099.43 Mobile Safari/537.36' },
  { name: 'ipad-pro-13', viewport: { width: 1024, height: 1366 }, hasTouch: true, deviceScaleFactor: 2, userAgent: 'Mozilla/5.0 (iPad; CPU OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1' },
  { name: 'macbook-16', viewport: { width: 1512, height: 982 }, deviceScaleFactor: 2, userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36' },
  { name: 'android-tv-1080p', viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1, userAgent: 'Mozilla/5.0 (Linux; Android 14; Chromecast with Google TV Build/UTT624) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.6099.43 Safari/537.36 Android TV' },
  { name: 'ultrawide-2560', viewport: { width: 2560, height: 1080 }, deviceScaleFactor: 1, userAgent: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36' }
];

const browser = await chromium.launch();
for (const profile of profiles) {
  const context = await browser.newContext({ viewport: profile.viewport, hasTouch: profile.hasTouch || false, isMobile: profile.isMobile || false, deviceScaleFactor: profile.deviceScaleFactor || 1, userAgent: profile.userAgent });
  const page = await context.newPage();
  await page.goto('http://127.0.0.1:5173/');
  await page.waitForSelector('[data-hbl-app="true"]');
  await page.waitForTimeout(5200);
  const bodyClass = await page.evaluate(() => document.body.className);
  console.log(`${profile.name}: body classes = "${bodyClass}"`);
  await page.screenshot({ path: `docs/screenshots/shot-dm-${profile.name}.png` });
  await context.close();
}
await browser.close();
console.log('done');

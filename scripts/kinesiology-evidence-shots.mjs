import { chromium } from '@playwright/test';
const browser = await chromium.launch();
const shots = [
  { name: 'kine-desktop-walk', viewport: { width: 1440, height: 900 }, steps: async (p) => {} },
  { name: 'kine-desktop-jump-posterior', viewport: { width: 1440, height: 900 }, steps: async (p) => { await p.locator('.kine-actions button', { hasText: 'jump' }).first().click(); await p.locator('.kine-cameras button', { hasText: 'Posterior' }).click(); await p.waitForTimeout(1200); } },
  { name: 'kine-phone', viewport: { width: 393, height: 852 }, hasTouch: true, isMobile: true, steps: async (p) => {} },
  { name: 'kine-tv', viewport: { width: 1920, height: 1080 }, userAgent: 'Mozilla/5.0 (Linux; Android 14; Chromecast with Google TV Build/UTT624) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.6099.43 Safari/537.36 Android TV', steps: async (p) => {} }
];
for (const s of shots) {
  const ctx = await browser.newContext({ viewport: s.viewport, hasTouch: s.hasTouch || false, isMobile: s.isMobile || false, userAgent: s.userAgent });
  const page = await ctx.newPage();
  await page.goto('http://127.0.0.1:5173/');
  await page.locator('.module-list-item', { hasText: 'Movement Theater' }).click();
  await page.waitForSelector('.kine-stage canvas', { timeout: 20000 });
  await page.waitForTimeout(3500);
  await s.steps(page);
  await page.screenshot({ path: `docs/screenshots/shot-${s.name}.png` });
  await ctx.close();
}
await browser.close();
console.log('done');

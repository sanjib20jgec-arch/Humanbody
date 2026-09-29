import { chromium, devices } from '@playwright/test';

const browser = await chromium.launch();
const page = await browser.newPage({ ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } });
await page.goto('http://127.0.0.1:5173/');
await page.waitForSelector('[data-hbl-app="true"]');
await page.waitForTimeout(6500);
await page.screenshot({ path: 'docs/screenshots/shot-r7-home-fold.png' });

await page.locator('.module-list-item').filter({ hasText: 'Circulation' }).click();
await page.waitForSelector('.view-switcher', { timeout: 20000 });
await page.getByRole('button', { name: 'SIMULATE' }).first().click();
await page.waitForTimeout(3500);
await page.locator('.cardio-graph-card').first().screenshot({ path: 'docs/screenshots/shot-r7-wiggers.png' });

await page.locator('.back-button').click();
await page.waitForSelector('.module-list-item', { timeout: 20000 });
await page.locator('.module-list-item').filter({ hasText: 'Respiration' }).click();
await page.waitForSelector('.view-switcher', { timeout: 20000 });
await page.getByRole('button', { name: 'SIMULATE' }).first().click();
await page.waitForTimeout(2500);
await page.locator('.cardio-graph-card').first().screenshot({ path: 'docs/screenshots/shot-r7-vent-trace.png' });

await page.locator('.back-button').click();
await page.waitForSelector('.module-list-item', { timeout: 20000 });
await page.locator('.module-list-item').filter({ hasText: 'Brain' }).click();
await page.waitForSelector('.view-switcher', { timeout: 20000 });
await page.getByRole('button', { name: 'SIMULATE' }).first().click();
await page.waitForSelector('.trigger-button', { timeout: 20000 });
await page.getByRole('button', { name: 'Touch hot surface' }).click();
await page.waitForTimeout(1500);
await page.locator('.reflex-callout').screenshot({ path: 'docs/screenshots/shot-r7-reflex.png' });

await browser.close();
console.log('done');

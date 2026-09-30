import { chromium, devices } from 'playwright';
import { resolve } from 'node:path';
const url = 'http://127.0.0.1:5173/#/m/kinesiology';
const browser = await chromium.launch();
const ctx = await browser.newContext({ ...devices['Pixel 7'] });
const page = await ctx.newPage();
await page.goto(url, { waitUntil: 'domcontentloaded' });
await page.waitForSelector('.kine-stage canvas', { timeout: 30000 });
await page.evaluate(() => { const x = document.querySelector('.kine-tour button'); x && x.click(); });
await page.waitForTimeout(1500);
const hint = await page.evaluate(() => getComputedStyle(document.querySelector('.kine-touch-hint')).display);
// drag on the stage: camera should move
const before = await page.evaluate(() => window.__kineDebug ? window.__kineDebug.camera.position.toArray().map(v => +v.toFixed(2)) : 'dev-only');
const stage = page.locator('.kine-stage canvas').first();
const box = await stage.boundingBox();
await page.touchscreen.tap(box.x + box.width / 2, box.y + 10); // ensure pointerdown registered orbit
await page.waitForTimeout(300);
// perform a drag via touchscreen: tap-hold-move using CDP touch
const client = await ctx.newCDPSession(page);
const cx = box.x + box.width / 2, cy = box.y + box.height / 2;
await client.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: cx, y: cy }] });
for (let i = 1; i <= 8; i++) await client.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: cx + i * 15, y: cy }] });
await client.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
await page.waitForTimeout(500);
const after = await page.evaluate(() => window.__kineDebug ? window.__kineDebug.camera.position.toArray().map(v => +v.toFixed(2)) : 'dev-only');
// tap an action chip
await page.locator('.kine-actions button', { hasText: 'bow' }).tap();
await page.waitForTimeout(400);
const active = await page.evaluate(() => document.querySelector('.kine-actions button.active')?.textContent.slice(0, 4));
console.log(JSON.stringify({ hintDisplay: hint, camBefore: before, camAfter: after, orbitMoved: JSON.stringify(before) !== JSON.stringify(after), tappedActive: active }));
await browser.close();

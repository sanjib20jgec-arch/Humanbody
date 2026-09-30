// Android phone diagnostic (Pixel 7-class): layout, touch, rendering, FPS.
import { chromium, devices } from 'playwright';
import { resolve } from 'node:path';

const file = process.argv[2] || 'movement-theater.html';
const url = 'file://' + resolve(file) + '#/m/kinesiology';
const browser = await chromium.launch();
const ctx = await browser.newContext({ ...devices['Pixel 7'] });
const page = await ctx.newPage();
const errors = [];
page.on('pageerror', (e) => errors.push('PAGE: ' + String(e).slice(0, 140)));
page.on('console', (m) => { if (m.type() === 'error') errors.push('CON: ' + m.text().slice(0, 140)); });
await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
await page.waitForSelector('.kine-actions button', { timeout: 30000 });
await page.evaluate(() => { const x = document.querySelector('.kine-tour button'); x && x.click(); });
await page.waitForTimeout(2000);

const layout = await page.evaluate(() => {
  const doc = document.documentElement;
  const stage = document.querySelector('.kine-stage');
  const rail = document.querySelector('.kine-actions');
  const transport = document.querySelector('.kine-transport');
  const tr = transport.getBoundingClientRect();
  return {
    vw: doc.clientWidth, scrollW: doc.scrollWidth, pageH: doc.scrollHeight,
    stageH: Math.round(stage.getBoundingClientRect().height),
    railScrollable: rail.scrollWidth > rail.clientWidth,
    transportBottomGap: Math.round(doc.clientHeight - tr.bottom),
    dpr: devicePixelRatio
  };
});

// tap an action chip via touch
await page.locator('.kine-actions button', { hasText: 'kick' }).tap();
await page.waitForTimeout(600);
const active = await page.evaluate(() => document.querySelector('.kine-actions button.active')?.textContent.slice(0, 10));

// FPS sample
const fps = await page.evaluate(() => new Promise((res) => {
  let n = 0; const t0 = performance.now();
  const loop = () => { n++; if (performance.now() - t0 < 2500) requestAnimationFrame(loop); else res(Math.round(n / 2.5)); };
  requestAnimationFrame(loop);
}));

// canvas actually drawing? sample center pixel variance
const canvasAlive = await page.evaluate(() => {
  const c = document.querySelector('.kine-stage canvas');
  if (!c) return 'no-canvas';
  return `${c.width}x${c.height}`;
});

await page.screenshot({ path: 'evidence/android-top.png' });
await page.locator('.kine-stage').scrollIntoViewIfNeeded();
await page.waitForTimeout(800);
await page.screenshot({ path: 'evidence/android-stage.png' });
console.log(JSON.stringify({ layout, tappedActive: active, fps, canvas: canvasAlive, errors: errors.slice(0, 6) }, null, 1));
await browser.close();

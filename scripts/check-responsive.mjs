// Responsiveness diagnostic: screenshot + measurements at 3 viewports.
import { chromium } from 'playwright';
import { resolve } from 'node:path';

const file = process.argv[2] || 'movement-theater.html';
const url = 'file://' + resolve(file) + '#/m/kinesiology';
const browser = await chromium.launch();
const viewports = [
  { name: 'phone', width: 390, height: 844 },
  { name: 'tablet', width: 820, height: 1180 },
  { name: 'desktop', width: 1440, height: 900 }
];
for (const vp of viewports) {
  const page = await browser.newPage({ viewport: { width: vp.width, height: vp.height }, deviceScaleFactor: 1 });
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForSelector('.kine-actions', { timeout: 30000 });
  await page.waitForTimeout(2500);
  const m = await page.evaluate(() => {
    const doc = document.documentElement;
    const stage = document.querySelector('.kine-stage');
    const firstBtn = document.querySelector('.kine-actions button');
    const overflow = [];
    for (const el of document.querySelectorAll('.kine-layout *')) {
      const r = el.getBoundingClientRect();
      if (r.width > 0 && r.right > doc.clientWidth + 1) overflow.push(el.className.toString().slice(0, 40));
    }
    return {
      scrollWidth: doc.scrollWidth, clientWidth: doc.clientWidth,
      pageHeight: doc.scrollHeight,
      stageH: stage ? Math.round(stage.getBoundingClientRect().height) : 0,
      firstBtnTop: firstBtn ? Math.round(firstBtn.getBoundingClientRect().top + window.scrollY) : -1,
      overflowing: [...new Set(overflow)].slice(0, 8)
    };
  });
  await page.screenshot({ path: `evidence/responsive-${vp.name}.png`, fullPage: false });
  console.log(JSON.stringify({ vp: vp.name, ...m }));
  await page.close();
}
await browser.close();

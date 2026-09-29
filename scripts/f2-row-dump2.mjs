import { chromium, devices } from '@playwright/test';

const browser = await chromium.launch();
const page = await browser.newPage({ ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } });
await page.goto('http://127.0.0.1:5173/');
await page.waitForSelector('[data-hbl-app="true"]');
await page.locator('.module-list-item').filter({ hasText: 'Circulation' }).click();
await page.waitForSelector('.reference-object-note', { timeout: 20000 });
await page.waitForTimeout(4500);

const dump = await page.evaluate(() => {
  const out = [];
  const all = document.querySelectorAll('*');
  for (const node of all) {
    const rect = node.getBoundingClientRect();
    if (rect.height === 0 || rect.width === 0) continue;
    if (rect.top < 816 && rect.bottom > 798) {
      out.push({ tag: node.tagName, cls: String(node.className).slice(0, 46), text: (node.textContent || '').trim().slice(0, 60), top: Math.round(rect.top), left: Math.round(rect.left), right: Math.round(rect.right), pos: getComputedStyle(node).position });
    }
  }
  return out;
});
console.log(JSON.stringify(dump, null, 2));
await browser.close();

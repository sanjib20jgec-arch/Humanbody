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
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_ELEMENT);
  while (walker.nextNode()) {
    const node = walker.currentNode;
    if (node.children.length) continue; // leaf-ish only
    const rect = node.getBoundingClientRect();
    if (rect.height === 0) continue;
    const vertical = rect.top < 815 && rect.bottom > 795;
    const rightish = rect.right > 900;
    if (vertical && rightish) {
      out.push({ tag: node.tagName, cls: String(node.className).slice(0, 50), text: (node.textContent || '').trim().slice(0, 70), top: Math.round(rect.top), left: Math.round(rect.left), right: Math.round(rect.right) });
    }
  }
  return out;
});
console.log(JSON.stringify(dump, null, 2));
await browser.close();

import { chromium, devices } from '@playwright/test';

const browser = await chromium.launch();
const page = await browser.newPage({ ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } });
await page.goto('http://127.0.0.1:5173/');
await page.waitForSelector('[data-hbl-app="true"]');
await page.locator('.module-list-item').filter({ hasText: 'Circulation' }).click();
await page.waitForSelector('.reference-object-note', { timeout: 20000 });
await page.waitForTimeout(4500);

const hits = await page.evaluate(() => {
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_ELEMENT);
  const out = [];
  while (walker.nextNode()) {
    const node = walker.currentNode;
    const text = Array.from(node.childNodes).filter((child) => child.nodeType === 3).map((child) => child.textContent).join('');
    if (text.includes('ADULT MALE REFERENCE') || text.includes('Find structure')) {
      const rect = node.getBoundingClientRect();
      const styles = getComputedStyle(node);
      out.push({ tag: node.tagName, cls: node.className, text: text.trim().slice(0, 80), top: rect.top, left: rect.left, right: rect.right, bottom: rect.bottom, position: styles.position, z: styles.zIndex });
    }
  }
  return out;
});
console.log(JSON.stringify(hits, null, 2));
await browser.close();

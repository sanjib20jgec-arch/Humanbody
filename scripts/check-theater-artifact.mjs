// Ground-truth check: open the offline artifact in a real browser, navigate to
// the Movement Theater, and count the action buttons actually rendered.
import { chromium } from 'playwright';
import { resolve } from 'node:path';

const file = process.argv[2] || 'human-biology-lab-theater-20.html';
const url = 'file://' + resolve(file) + '#/m/kinesiology';
const browser = await chromium.launch();
const page = await browser.newPage();
page.on('pageerror', (e) => console.log('PAGE ERROR:', String(e).slice(0, 200)));
await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
await page.waitForSelector('[data-kinesiology-theater="true"], .kine-actions', { timeout: 30000 }).catch(() => console.log('theater selector not found'));
await page.waitForTimeout(2000);
const buttons = await page.locator('.kine-actions button').allTextContents().catch(() => []);
console.log('URL:', url);
console.log('Button count:', buttons.length);
console.log('Buttons:', buttons.map((b) => b.trim().split('\n')[0]).join(' | '));
console.log('Body text sample:', (await page.locator('body').innerText().catch(() => '')).slice(0, 300).replace(/\n+/g, ' '));
await browser.close();

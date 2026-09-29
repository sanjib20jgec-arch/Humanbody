import { chromium } from '@playwright/test';
import { spawn } from 'node:child_process';
import { mkdirSync } from 'node:fs';
const phase = process.argv[2] || 'vis';
mkdirSync('docs/screenshots', { recursive: true });
const srv = spawn('npm', ['run', 'dev', '--', '--host', '127.0.0.1'], { cwd: process.cwd(), stdio: 'ignore', detached: true });
await new Promise((r) => setTimeout(r, 4000));
const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader'] });
async function shot(name, viewport, actionId) {
  const ctx = await browser.newContext({ viewport });
  const page = await ctx.newPage();
  await page.addInitScript(() => localStorage.setItem('kine-quality', 'cinema'));
  await page.goto('http://127.0.0.1:5173/');
  await page.locator('.module-list-item', { hasText: 'Movement Theater' }).click();
  await page.waitForSelector('.kine-stage canvas[data-engine]', { timeout: 20000 });
  if (actionId) await page.locator('.kine-actions button', { hasText: new RegExp(`^${actionId}$`, 'i') }).first().click().catch(() => {});
  await new Promise((r) => setTimeout(r, 1800));
  await page.locator('.kine-stage canvas[data-engine]').first().screenshot({ path: `docs/screenshots/${phase}-${name}.png` });
  await ctx.close();
}
await shot('desktop-walk', { width: 1440, height: 900 }, 'walk');
await shot('desktop-run', { width: 1440, height: 900 }, 'run');
await shot('phone-walk', { width: 390, height: 844 }, 'walk');
await browser.close();
process.kill(-srv.pid);
process.exit(0);

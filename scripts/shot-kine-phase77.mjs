import { chromium } from '@playwright/test';
import { spawn } from 'node:child_process';
const srv = spawn('npm', ['run', 'dev', '--', '--host', '127.0.0.1'], { cwd: process.cwd(), stdio: 'ignore', detached: true });
await new Promise((r) => setTimeout(r, 4000));
const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader'] });
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
await page.goto('http://127.0.0.1:5173/');
await page.locator('.module-list-item', { hasText: 'Movement Theater' }).click();
await page.waitForSelector('.kine-stage canvas', { timeout: 20000 });
await page.waitForTimeout(2500);
await page.screenshot({ path: 'docs/screenshots/shot-kine-phase76-walk-ik.png' });
// select a muscle via legend
await page.locator('.kine-legend-row').nth(2).click();
await page.waitForTimeout(800);
await page.screenshot({ path: 'docs/screenshots/shot-kine-phase77-muscle-select.png' });
// dual angle inset
await page.locator('.kine-dual-toggle').click();
await page.waitForTimeout(1000);
await page.screenshot({ path: 'docs/screenshots/shot-kine-phase79-dual-view.png' });
// jump CMU with IK
await page.locator('.kine-facts-head button').click().catch(() => {});
await page.locator('.kine-actions button', { hasText: 'jump' }).first().click();
await page.waitForTimeout(1500);
await page.screenshot({ path: 'docs/screenshots/shot-kine-phase76-jump-ik.png' });
await browser.close();
process.kill(-srv.pid);
process.exit(0);

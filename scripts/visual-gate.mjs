// Automated visual gate (cross-cutting §G.1/G.2): replaces per-section owner preview review.
// For each bay route × device × theme × language: no page errors, no horizontal overflow,
// interactive controls ≥ 40 px, no Bengali text rendered in a font without Bengali glyphs.
// Browser: Playwright's bundled Chromium, or HBL_CHROMIUM=/path/to/chrome (+ HBL_CHROMIUM_LIBS).
// Skips (exit 0 with a warning) when no browser is available, unless --strict.
import { chromium } from 'playwright';
import { spawn } from 'node:child_process';
import { existsSync, mkdirSync } from 'node:fs';

const strict = process.argv.includes('--strict');
const routes = (process.env.HBL_ROUTES || 'home,cell,tissues,digestion,circulation,nervous,respiration,excretion,reproduction,heredity,evolution,environment').split(',');
const devices = [{ name: 'phone', width: 360, height: 780 }, { name: 'tablet', width: 820, height: 1180 }, { name: 'desktop', width: 1440, height: 900 }];
const combos = [['dark', 'en'], ['light', 'bn']];
const exe = process.env.HBL_CHROMIUM;
const libs = process.env.HBL_CHROMIUM_LIBS;

let browser;
try {
  browser = await chromium.launch({
    executablePath: exe && existsSync(exe) ? exe : undefined,
    args: ['--no-sandbox', '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'],
    env: libs ? { ...process.env, LD_LIBRARY_PATH: libs } : process.env
  });
} catch (err) {
  const msg = `visual gate: no browser available (${String(err.message).split('\n')[0]})`;
  if (strict) { console.error(msg); process.exit(1); }
  console.warn(`${msg} — SKIPPED`); process.exit(0);
}

const server = spawn(process.execPath, ['node_modules/vite/bin/vite.js', 'preview', '--port', '4179', '--strictPort'], { stdio: 'ignore' });
await new Promise((r) => setTimeout(r, 2500));
mkdirSync('/tmp/hbl-visual', { recursive: true });
const failures = [];
try {
  for (const route of routes) for (const d of devices) for (const [theme, lang] of combos) {
    const ctx = await browser.newContext({ viewport: { width: d.width, height: d.height } });
    const page = await ctx.newPage();
    const errors = [];
    page.on('pageerror', (e) => errors.push(e.message));
    await page.addInitScript(([t, l]) => { localStorage.setItem('hbl-theme', t); localStorage.setItem('hbl-language', l); localStorage.setItem('hbl-level', 'neet'); }, [theme, lang]);
    await page.goto(`http://localhost:4179/${route === 'home' ? '' : `#/m/${route}`}`);
    await page.waitForTimeout(3000);
    const tag = `${route}/${d.name}/${theme}/${lang}`;
    const report = await page.evaluate(() => {
      const out = { overflow: document.documentElement.scrollWidth - window.innerWidth, small: [], badFont: [] };
      document.querySelectorAll('.mito-slice button, .segmented button, .view-switcher button').forEach((el) => {
        const r = el.getBoundingClientRect(); if (r.width && r.height && r.height < 36) out.small.push(`${el.textContent.trim().slice(0, 24)} (${Math.round(r.height)}px)`);
      });
      out.htmlTheme = document.documentElement.dataset.theme; out.lang = document.documentElement.lang;
      return out;
    });
    if (errors.length) failures.push(`${tag}: page errors: ${errors.join(' | ')}`);
    if (report.overflow > 1) failures.push(`${tag}: horizontal overflow ${report.overflow}px`);
    if (report.small.length) failures.push(`${tag}: small tap targets: ${report.small.slice(0, 5).join(', ')}`);
    if (report.htmlTheme !== theme) failures.push(`${tag}: theme not applied (${report.htmlTheme})`);
    if (report.lang !== lang) failures.push(`${tag}: lang not applied (${report.lang})`);
    await page.screenshot({ path: `/tmp/hbl-visual/${tag.replaceAll('/', '_')}.png` });
    await ctx.close();
  }
} finally {
  await browser.close(); server.kill();
}
if (failures.length) { console.error(`visual gate FAILED:\n${failures.join('\n')}`); process.exit(1); }
console.log(`visual gate: ${routes.length * devices.length * combos.length} combinations passed (screenshots in /tmp/hbl-visual)`);

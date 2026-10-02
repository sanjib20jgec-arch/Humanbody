// Automated responsive gate: page errors, horizontal overflow, selected touch targets,
// language/theme application, and the Movement Theater's inline quick-start contract.
// Browser: Playwright's bundled Chromium, or HBL_CHROMIUM=/path/to/chrome (+ HBL_CHROMIUM_LIBS).
// Exploratory report mode may skip without a browser; verify:visual always passes --strict.
import { chromium } from 'playwright';
import { spawn } from 'node:child_process';
import { existsSync, mkdirSync } from 'node:fs';
import { resolve } from 'node:path';

const strict = process.argv.includes('--strict');
const routes = (process.env.HBL_ROUTES || 'home,cell,tissues,digestion,circulation,nervous,respiration,excretion,reproduction,heredity,evolution,environment,kinesiology').split(',');
const devices = [{ name: 'phone', width: 360, height: 780, isMobile: true, hasTouch: true }, { name: 'tablet', width: 820, height: 1180, isMobile: true, hasTouch: true }, { name: 'desktop', width: 1440, height: 900, isMobile: false, hasTouch: false }];
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
const outputDir = resolve('test-results/visual-gate');
mkdirSync(outputDir, { recursive: true });
const failures = [];
try {
  for (const route of routes) for (const d of devices) for (const [theme, lang] of combos) {
    const ctx = await browser.newContext({ viewport: { width: d.width, height: d.height }, isMobile: d.isMobile, hasTouch: d.hasTouch });
    const page = await ctx.newPage();
    const errors = [];
    page.on('pageerror', (e) => errors.push(e.message));
    await page.addInitScript(([t, l]) => { localStorage.setItem('hbl-theme', t); localStorage.setItem('hbl-language', l); localStorage.setItem('hbl-level', 'neet'); }, [theme, lang]);
    await page.goto(`http://localhost:4179/${route === 'home' ? '' : `#/m/${route}`}`);
    await page.waitForTimeout(3000);
    const tag = `${route}/${d.name}/${theme}/${lang}`;
    await page.evaluate(() => document.fonts.ready);
    const report = await page.evaluate(() => {
      const out = { overflow: document.documentElement.scrollWidth - window.innerWidth, small: [], htmlTheme: document.documentElement.dataset.theme, lang: document.documentElement.lang };
      const visible = (el) => Boolean(el && el.getClientRects().length && getComputedStyle(el).visibility !== 'hidden');
      document.querySelectorAll('.mito-slice button, .segmented button, .view-switcher button').forEach((el) => {
        const r = el.getBoundingClientRect(); if (r.width && r.height && r.height < 36) out.small.push(`${el.textContent.trim().slice(0, 24)} (${Math.round(r.height)}px)`);
      });
      if (matchMedia('(pointer: coarse)').matches) {
        document.querySelectorAll('.sim-controls .control-button, .speed-selector button, .kine-tour-dismiss, .kine-tools-disclosure > summary').forEach((el) => {
          if (!visible(el)) return;
          const r = el.getBoundingClientRect();
          if (r.width < 40 || r.height < 40) out.small.push(`${el.textContent.trim().slice(0, 24)} (${Math.round(r.width)}×${Math.round(r.height)}px)`);
        });
      }
      const tour = document.querySelector('.kine-tour');
      const stage = document.querySelector('.kine-stage');
      const details = document.querySelector('.kine-tools-disclosure');
      out.kineQuickStart = Boolean(tour && visible(tour) && getComputedStyle(tour).position !== 'absolute');
      out.kineTourOverlapsStage = false;
      if (visible(tour) && visible(stage)) {
        const a = tour.getBoundingClientRect(); const b = stage.getBoundingClientRect();
        out.kineTourOverlapsStage = a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top;
      }
      out.kineToolsOpen = details ? details.open : null;
      out.kineCoreControls = Boolean(document.querySelector('.sim-controls .primary-control') && document.querySelector('.speed-selector'));
      return out;
    });
    if (errors.length) failures.push(`${tag}: page errors: ${errors.join(' | ')}`);
    if (report.overflow > 1) failures.push(`${tag}: horizontal overflow ${report.overflow}px`);
    if (report.small.length) failures.push(`${tag}: small tap targets: ${report.small.slice(0, 5).join(', ')}`);
    if (report.htmlTheme !== theme) failures.push(`${tag}: theme not applied (${report.htmlTheme})`);
    if (report.lang !== lang) failures.push(`${tag}: lang not applied (${report.lang})`);
    if (route === 'kinesiology') {
      if (!report.kineQuickStart) failures.push(`${tag}: first-visit guidance missing or still overlays the theater`);
      if (report.kineTourOverlapsStage) failures.push(`${tag}: quick-start guidance overlaps the stage`);
      if (report.kineToolsOpen !== false) failures.push(`${tag}: optional tools are not collapsed on first visit`);
      if (!report.kineCoreControls) failures.push(`${tag}: core play/speed controls are missing in Explore`);
    }
    await page.screenshot({ path: resolve(outputDir, `${tag.replaceAll('/', '_')}.png`) });
    await ctx.close();
  }
} finally {
  await browser.close(); server.kill();
}
if (failures.length) { console.error(`visual gate FAILED:\n${failures.join('\n')}`); process.exit(1); }
console.log(`visual gate: ${routes.length * devices.length * combos.length} combinations passed (screenshots in ${outputDir})`);

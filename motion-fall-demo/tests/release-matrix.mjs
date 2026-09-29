import assert from 'node:assert/strict';
import { chromium } from 'playwright';

const baseURL = process.env.BASE_URL || 'http://127.0.0.1:5174/';
const errors = [];
const browser = await chromium.launch({ headless: true });

async function waitForScene(page) {
  await page.locator('#scene-canvas').waitFor({ state: 'attached', timeout: 10000 });
  assert.equal(await page.locator('#scene-canvas').count(), 1);
  assert.ok(await page.locator('#scene-canvas').evaluate(canvas => Boolean(canvas.getContext('webgl2') || canvas.getContext('webgl'))));
}

async function runCombination(page, combination) {
  await page.locator('#reset-button').click();
  assert.equal(await page.locator('#mode-setup').getAttribute('aria-pressed'), 'true');
  await page.locator(`[data-movement="${combination.movement}"]`).click();
  await page.locator(`[data-region="${combination.region}"]`).click();
  await page.locator(`[data-direction="${combination.direction}"]`).click();
  await page.locator(`[data-friction="${combination.friction}"]`).click();
  await page.locator('#impact-intensity').fill(String(combination.intensity));
  await page.locator('#play-button').click();
  await page.waitForFunction(() => document.querySelector('#state-label')?.textContent !== 'Locomotion', undefined, { timeout: 5000 });
  assert.notEqual(await page.locator('#state-label').textContent(), 'Locomotion');
  assert.equal(await page.locator('#mode-playback').getAttribute('aria-pressed'), 'true');
}

try {
  const desktop = await browser.newContext({ viewport: { width: 1440, height: 1000 }, serviceWorkers: 'allow' });
  await desktop.grantPermissions(['clipboard-read', 'clipboard-write'], { origin: new URL(baseURL).origin });
  const page = await desktop.newPage();
  page.on('pageerror', error => errors.push(`pageerror: ${error.message}`));
  page.on('response', response => {
    if (response.status() < 400) return;
    const pathname = new URL(response.url()).pathname;
    if (!pathname.endsWith('/assets/character.glb') && !pathname.endsWith('/assets/studio_env.hdr')) errors.push(`http ${response.status()}: ${pathname}`);
  });
  page.on('console', message => {
    if (message.type() === 'error' && !message.text().includes('Failed to load resource')) errors.push(`console: ${message.text()}`);
  });
  await page.goto(baseURL, { waitUntil: 'networkidle' });
  await waitForScene(page);
  assert.equal(await page.locator('#state-label').textContent(), 'Locomotion');

  const combinations = [
    { movement: 'Idle', region: 'Torso', direction: 'Front', friction: 'Normal', intensity: 0 },
    { movement: 'Walk', region: 'Arm', direction: 'Left', friction: 'Grippy', intensity: 0.55 },
    { movement: 'Run', region: 'Leg', direction: 'Right', friction: 'Slippery', intensity: 1 },
    { movement: 'Run', region: 'Torso', direction: 'Back', friction: 'Normal', intensity: 0.55 },
    { movement: 'Walk', region: 'Leg', direction: 'Front', friction: 'Slippery', intensity: 0.25 },
    { movement: 'Idle', region: 'Arm', direction: 'Right', friction: 'Grippy', intensity: 0.85 }
  ];
  for (const combination of combinations) await runCombination(page, combination);

  await page.locator('#pause-button').click();
  const pausedClock = await page.locator('#sim-clock').textContent();
  await page.locator('#step-button').click();
  assert.notEqual(await page.locator('#sim-clock').textContent(), pausedClock);

  await page.locator('#reset-button').click();
  await page.locator('#scene-canvas').focus();
  await page.keyboard.press('Space');
  await page.waitForFunction(() => document.querySelector('#state-label')?.textContent !== 'Locomotion', undefined, { timeout: 5000 });
  await page.keyboard.press('r');
  assert.equal(await page.locator('#state-label').textContent(), 'Locomotion');
  assert.equal(await page.locator('#sim-clock').textContent(), '0.00 s');

  await page.locator('[data-scenario="gentle"]').click();
  assert.match(await page.locator('#scenario-status').textContent(), /Loaded preset/);
  await page.locator('#copy-scenario').click();
  await page.waitForFunction(() => document.querySelector('#scenario-status')?.textContent === 'Scenario link copied', undefined, { timeout: 3000 });
  assert.equal(await page.locator('#scenario-status').textContent(), 'Scenario link copied');
  const copiedScenario = await page.evaluate(() => navigator.clipboard.readText());
  assert.match(copiedScenario, /#scenario=/);

  await desktop.close();

  const reduced = await browser.newContext({ viewport: { width: 1280, height: 900 }, serviceWorkers: 'allow' });
  const reducedPage = await reduced.newPage();
  await reducedPage.emulateMedia({ reducedMotion: 'reduce' });
  await reducedPage.goto(baseURL, { waitUntil: 'networkidle' });
  await waitForScene(reducedPage);
  assert.equal(await reducedPage.locator('html').evaluate(node => node.classList.contains('reduced-motion')), true);
  await reduced.close();

  const mobile = await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true, serviceWorkers: 'allow' });
  const mobilePage = await mobile.newPage();
  await mobilePage.goto(baseURL, { waitUntil: 'networkidle' });
  await waitForScene(mobilePage);
  const bounds = await mobilePage.locator('#scene-canvas').boundingBox();
  assert.ok(bounds && bounds.width > 0 && bounds.height > 0);
  assert.ok(await mobilePage.locator('[data-quality="mobile"]').count());
  await mobile.close();

  assert.deepEqual(errors, [], `Release browser errors detected: ${errors.join('; ')}`);
  console.log(`Release browser matrix passed (${combinations.length} desktop combinations, reduced-motion, mobile)`);
} finally {
  await browser.close();
}

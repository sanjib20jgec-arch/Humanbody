import assert from 'node:assert/strict';

const baseURL = process.env.BASE_URL || 'http://127.0.0.1:5174/';
let playwright;
try {
  playwright = await import('playwright');
} catch (error) {
  console.error('Browser smoke test requires Playwright. Run: npm install');
  console.error(error.message);
  process.exit(2);
}

const browser = await playwright.chromium.launch({ headless: true });
const errors = [];
try {
  const desktop = await browser.newContext({ viewport: { width: 1440, height: 1000 }, serviceWorkers: 'allow' });
  const page = await desktop.newPage();
  page.on('pageerror', error => errors.push(`pageerror: ${error.message}`));
  page.on('response', response => {
    if (response.status() < 400) return;
    const pathname = new URL(response.url()).pathname;
    const expectedOptional = pathname.endsWith('/assets/character.glb') || pathname.endsWith('/assets/studio_env.hdr');
    if (!expectedOptional) errors.push(`http ${response.status()}: ${pathname}`);
  });
  page.on('console', message => {
    if (message.type() === 'error' && !message.text().includes('Failed to load resource')) {
      errors.push(`console: ${message.text()}`);
    }
  });
  await page.goto(baseURL, { waitUntil: 'networkidle' });
  await page.locator('#scene-canvas').waitFor({ state: 'attached', timeout: 10000 });
  await page.waitForTimeout(500);
  assert.equal(await page.locator('#scene-canvas').count(), 1);
  assert.equal(await page.locator('#state-label').textContent(), 'Locomotion');
  assert.ok(await page.locator('#scene-canvas').evaluate(canvas => Boolean(canvas.getContext('webgl2') || canvas.getContext('webgl'))));
  await page.locator('#play-button').click();
  await page.waitForFunction(() => document.querySelector('#state-label')?.textContent !== 'Locomotion', undefined, { timeout: 5000 });
  await page.locator('#pause-button').click();
  const pausedClock = await page.locator('#sim-clock').textContent();
  await page.locator('#step-button').click();
  assert.notEqual(await page.locator('#sim-clock').textContent(), pausedClock);
  await page.locator('[data-friction="Slippery"]').click();
  await page.locator('[data-quality="mobile"]').click();
  await page.locator('#reset-button').click();
  assert.equal(await page.locator('#state-label').textContent(), 'Locomotion');
  await desktop.close();

  const mobile = await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true, serviceWorkers: 'allow' });
  const mobilePage = await mobile.newPage();
  await mobilePage.goto(baseURL, { waitUntil: 'networkidle' });
  assert.ok((await mobilePage.locator('#scene-canvas').boundingBox()).width > 0);
  await mobile.close();

  assert.deepEqual(errors, [], `Browser errors detected: ${errors.join('; ')}`);
  console.log('Browser smoke passed');
} finally {
  await browser.close();
}

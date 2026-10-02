import { test, expect } from '@playwright/test';

const waitForShell = async (page) => {
  await page.goto('/');
  await expect(page.locator('[data-hbl-app="true"]')).toBeVisible();
  await expect(page.getByText('Choose a system to enter the lab')).toBeVisible();
};

const waitForSkeletalReady = async (page) => {
  await page.waitForFunction(() => performance.getEntriesByName('hbl-skeletal-ready').length > 0);
};

test.describe('Human Biology Lab browser contracts', () => {
  test('renders the shell before the atlas and reports first usable anatomy', async ({ page }) => {
    const chunkRequests = [];
    page.on('request', (request) => {
      if (/\/models\/body-\d+\.bin\.gz$/.test(request.url())) chunkRequests.push(request.url());
    });
    await waitForShell(page);
    await expect(page.locator('.atlas-shell-loading, .body-map-wrap')).toBeVisible();
    await waitForSkeletalReady(page);
    await expect(page.locator('.body-map-wrap')).toContainText('Skeletal layer ready');
    expect(await page.evaluate(() => performance.getEntriesByName('hbl-shell-mounted').length)).toBeGreaterThan(0);
    expect(await page.evaluate(() => performance.getEntriesByName('hbl-first-3d-ready').length)).toBeGreaterThan(0);

    // The startup request must be the manifest's skeletal chunk, not a full idle cascade.
    const uniqueChunks = [...new Set(chunkRequests.map((url) => url.match(/body-\d+/)?.[0]).filter(Boolean))];
    expect(uniqueChunks).toEqual(['body-12']);
  });

  test('requests a system layer only after learner action', async ({ page }) => {
    const chunkRequests = [];
    page.on('request', (request) => {
      if (/\/models\/body-\d+\.bin\.gz$/.test(request.url())) chunkRequests.push(request.url());
    });
    await waitForShell(page);
    await waitForSkeletalReady(page);
    if ((page.viewportSize()?.width || 0) <= 900) await page.getByRole('button', { name: 'Layers' }).click();
    const initial = new Set(chunkRequests);
    const checkbox = page.getByRole('checkbox', { name: 'Muscular system' });
    await checkbox.check();
    await expect.poll(() => new Set(chunkRequests).size).toBeGreaterThan(initial.size);
    expect([...new Set(chunkRequests)].some((url) => !initial.has(url))).toBe(true);
  });

  test('searches for an unloaded structure and loads its chunk', async ({ page }) => {
    const chunkRequests = [];
    page.on('request', (request) => {
      if (/\/models\/body-\d+\.bin\.gz$/.test(request.url())) chunkRequests.push(request.url());
    });
    await waitForShell(page);
    await waitForSkeletalReady(page);
    if ((page.viewportSize()?.width || 0) <= 900) await page.getByRole('button', { name: 'Tools' }).click();
    const initial = new Set(chunkRequests);
    const input = page.getByLabel('Find structure');
    await input.fill('heart');
    await page.getByRole('button', { name: 'Search anatomy' }).click();
    await expect(page.locator('#atlas-search-panel')).toContainText(/Found|No matching/);
    await expect.poll(() => new Set(chunkRequests).size).toBeGreaterThan(initial.size);
    await expect(page.locator('#atlas-anatomy-hotspot')).toContainText(/heart/i);
  });

  test('accessible 2D mode is keyboard and touch selectable and persists', async ({ page }) => {
    await waitForShell(page);
    await page.getByRole('button', { name: 'Accessible 2D mode' }).click();
    await expect(page.getByRole('heading', { name: 'Select a body system' })).toBeVisible();
    const heart = page.getByRole('button', { name: /Heart & vessels/ });
    await heart.focus();
    await page.keyboard.press('Enter');
    await expect(page.locator('.accessible-atlas-selection')).toContainText('Heart & vessels');
    await page.reload();
    await expect(page.getByRole('button', { name: 'Use 3D atlas' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Select a body system' })).toBeVisible();
  });

  test('WebGL failure exposes the accessible route', async ({ page }) => {
    await page.addInitScript(() => {
      const original = HTMLCanvasElement.prototype.getContext;
      HTMLCanvasElement.prototype.getContext = function getContext(kind, ...args) {
        if (String(kind).toLowerCase().includes('webgl')) return null;
        return original.call(this, kind, ...args);
      };
    });
    await waitForShell(page);
    await expect(page.getByRole('button', { name: 'Switch to accessible 2D anatomy' })).toBeVisible();
    await page.getByRole('button', { name: 'Switch to accessible 2D anatomy' }).click();
    await expect(page.getByRole('heading', { name: 'Select a body system' })).toBeVisible();
  });

  test('module objectives and evidence links appear on a learning bay', async ({ page }) => {
    await waitForShell(page);
    await page.locator('.module-list-item').filter({ hasText: 'Human Digestion' }).click();
    const objectives = page.locator('.objective-disclosure');
    await expect(objectives.locator('summary')).toContainText('By the end of this bay');
    await objectives.locator('summary').click();
    await expect(page.getByRole('heading', { name: 'By the end of this bay' })).toBeVisible();
    await expect(objectives.locator('ol li')).toHaveCount(3);
    await expect(page.locator('.objective-sources a')).toHaveCount(1);
  });

  test('Brain and Nerves hotspot, reflex simulation, and quiz feedback are keyboard-usable', async ({ page }) => {
    await waitForShell(page);
    await page.locator('.module-list-item').filter({ hasText: 'Brain & Nerves' }).click();
    await expect(page.getByRole('heading', { name: 'Map the signal network' })).toBeVisible();
    const peripheral = page.getByRole('button', { name: 'Select peripheral nerves' });
    await peripheral.focus();
    await page.keyboard.press('Enter');
    await expect(page.getByRole('heading', { name: 'Peripheral nerves' })).toBeVisible();
    await page.getByRole('button', { name: 'SIMULATE' }).click();
    await expect(page.getByRole('heading', { name: 'From hot surface to muscle' })).toBeVisible();
    await page.getByRole('button', { name: /Touch hot surface/ }).click();
    await expect(page.locator('.reflex-callout')).toContainText('Stimulus');
    await page.getByRole('button', { name: 'QUIZ', exact: true }).click();
    await expect(page.getByRole('heading', { name: 'Brain & nerves checkpoint' })).toBeVisible();
    await page.getByRole('button', { name: 'Cerebellum', exact: true }).click();
    await expect(page.locator('.quiz-feedback')).toContainText('Not quite.');
    await expect(page.locator('.quiz-feedback')).toContainText('spinal cord');
  });

  test('records first-paint and per-chunk atlas profiling locally', async ({ page }, testInfo) => {
    await waitForShell(page);
    await waitForSkeletalReady(page);
    await expect.poll(async () => page.evaluate(() => Object.keys(window.__HBL_PERF__?.atlas?.chunks || {}).length)).toBeGreaterThan(0);
    const profile = await page.evaluate(() => window.__HBL_PERF__);
    await testInfo.attach('hbl-perf-profile.json', {
      body: JSON.stringify(profile, null, 2),
      contentType: 'application/json'
    });
    expect(profile.marks['hbl-shell-mounted']).toBeGreaterThanOrEqual(0);
    expect(profile.marks['hbl-first-3d-ready']).toBeGreaterThanOrEqual(profile.marks['hbl-shell-mounted']);
    expect(profile.metrics.atlasDecodeMs).toBeGreaterThanOrEqual(0);
    expect(profile.metrics.atlasBuildMs).toBeGreaterThanOrEqual(0);
    expect(Object.values(profile.atlas.chunks)[0].decodedBytes).toBeGreaterThan(0);
    expect(profile.atlas.errors || []).toHaveLength(0);
  });

  test('reduced-motion preference is honored', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await waitForShell(page);
    await expect(page.locator('body')).toHaveClass(/reduce-motion/);
  });
});

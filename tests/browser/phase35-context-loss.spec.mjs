import { test, expect } from '@playwright/test';

const waitForShell = async (page) => {
  await page.goto('/');
  await expect(page.locator('[data-hbl-app="true"]')).toBeVisible();
};

const waitForSkeletalReady = async (page) => {
  await page.waitForFunction(() => performance.getEntriesByName('hbl-skeletal-ready').length > 0);
};

test.describe('Phase 35 WebGL context-loss recovery', () => {
  test('surfaces a recoverable state on context loss and rebuilds on restore', async ({ page }) => {
    await waitForShell(page);
    await waitForSkeletalReady(page);

    const canLose = await page.evaluate(() => {
      const canvas = document.querySelector('.body-3d-canvas');
      if (!canvas) return false;
      const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
      const ext = gl?.getExtension('WEBGL_lose_context');
      if (!ext) return false;
      window.__hblLoseContext = ext;
      return true;
    });
    test.skip(!canLose, 'WEBGL_lose_context extension unavailable in this renderer');

    await page.evaluate(() => window.__hblLoseContext.loseContext());
    await expect(page.locator('.atlas-context-lost')).toBeVisible();
    await expect(page.locator('.atlas-context-lost')).toContainText('rebuild automatically');

    await page.evaluate(() => window.__hblLoseContext.restoreContext());
    await expect(page.locator('.atlas-context-lost')).toBeHidden();
    // The rebuilt session re-marks skeletal readiness, proving the renderer
    // was reconstructed rather than silently frozen.
    await page.waitForFunction(() => performance.getEntriesByName('hbl-skeletal-ready').length > 1, null, { timeout: 20000 });
    await expect(page.locator('.body-map-wrap')).toContainText(/Skeletal layer ready|Full requested atlas ready/);
  });
});

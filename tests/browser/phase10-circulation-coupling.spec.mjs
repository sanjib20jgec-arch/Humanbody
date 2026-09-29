import { test, expect } from '@playwright/test';

const openCirculation = async (page) => {
  await page.goto('/');
  await expect(page.locator('[data-hbl-app="true"]')).toBeVisible();
  await expect(page.getByText('Choose a system to enter the lab')).toBeVisible();
  await page.locator('.module-list-item').filter({ hasText: 'Circulation' }).click();
  await expect(page.locator('.view-switcher')).toBeVisible();
};

test.describe('Phase 10 live circulation coupling', () => {
  test('mounts the source reference with the live CardioPhysiologyEngine view', async ({ page }) => {
    await openCirculation(page);
    await page.getByRole('button', { name: 'SIMULATE', exact: true }).click();
    await expect(page.locator('.cardio-engine-panel')).toBeVisible();
    await expect(page.locator('.circulation-live-reference')).toBeVisible();
    await expect(page.locator('.circulation-live-heading')).toContainText('LIVE COUPLED REFERENCE');
    await expect(page.locator('.circulation-live-reference .reference-object-overlay-note')).toContainText('coupled to the live CardioPhysiologyEngine snapshot', { timeout: 15_000 });
    await expect(page.locator('.circulation-live-reference .reference-object-note')).toBeVisible({ timeout: 15_000 });
    await expect(page.locator('.valve-readout')).toContainText(/gradient \d+%/);
    await page.getByRole('button', { name: 'Run model' }).click();
    await expect(page.locator('.status-chip')).toContainText('model running');
    await expect(page.locator('.circulation-live-reference .reference-object-overlay-note')).toContainText('Live phase:', { timeout: 8_000 });
  });
});

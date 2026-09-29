import { test, expect } from '@playwright/test';

const openHome = async (page) => {
  await page.goto('/');
  await expect(page.locator('[data-hbl-app="true"]')).toBeVisible();
  await expect(page.getByText('Choose a system to enter the lab')).toBeVisible();
};

const openReferenceBay = async (page, label) => {
  if (!(await page.locator('.module-list-item').count())) {
    await page.locator('header button').first().click();
    await expect(page.getByText('Choose a system to enter the lab')).toBeVisible();
  }
  await page.locator('.module-list-item').filter({ hasText: label }).click();
  await expect(page.locator('.reference-object-note')).toBeVisible({ timeout: 15_000 });
};

const openAtlasTools = async (page) => {
  const search = page.locator('#atlas-structure-search');
  if (!(await search.isVisible())) {
    await page.getByRole('button', { name: 'Tools', exact: true }).click();
  }
  await expect(search).toBeVisible();
};

test.describe('Phase 4 anatomy framing and teaching-state contracts', () => {
  test('orientation presets and source-linked process states work in Circulation and Digestion', async ({ page }) => {
    await openHome(page);

    await openReferenceBay(page, 'Human Digestion');
    await expect(page.locator('.reference-object-overlay-note')).toContainText('simplified teaching model');
    await expect(page.getByRole('button', { name: 'Anterior', exact: true })).toBeVisible();
    await page.getByRole('button', { name: 'Lateral', exact: true }).click();
    await expect(page.getByRole('button', { name: 'Lateral', exact: true })).toHaveAttribute('aria-pressed', 'true');
    await openAtlasTools(page);
    await page.locator('#atlas-structure-search').fill('stomach');
    await page.getByRole('button', { name: 'Search anatomy' }).click();
    await expect(page.locator('.digestion-structure-state')).toContainText('Stomach', { timeout: 15_000 });
    await expect(page.locator('.digestion-structure-state')).toContainText('PATHWAY STAGE 03 / 05');
    await page.getByRole('button', { name: /Small intestine/ }).click();
    await expect(page.locator('.digestion-structure-state')).toContainText('Small intestine');
    await expect(page.locator('.digestion-structure-state')).toContainText('PATHWAY STAGE 04 / 05');

    await page.locator('header button').first().click();
    await expect(page.getByText('Choose a system to enter the lab')).toBeVisible();
    await openReferenceBay(page, 'Circulation');
    await expect(page.locator('.reference-object-overlay-note')).toContainText('oxygen-status route');
    await expect(page.locator('.circulation-pressure-state')).toContainText('PRESSURE TEACHING STATE');
    await page.getByRole('button', { name: 'Posterior', exact: true }).click();
    await expect(page.getByRole('button', { name: 'Posterior', exact: true })).toHaveAttribute('aria-pressed', 'true');
    await openAtlasTools(page);
    await page.locator('#atlas-structure-search').fill('left ventricle');
    await page.getByRole('button', { name: 'Search anatomy' }).click();
    await expect(page.locator('.circulation-route-state')).toContainText('Send to body', { timeout: 15_000 });
    await expect(page.locator('.circulation-route-state')).toContainText('oxygen-rich blood');
    await expect(page.locator('.anatomy-hud-card')).toContainText('PART-LEVEL SELECTION');
    await expect(page.locator('.anatomy-hud-card')).toContainText('Cavity of left ventricle');
    await page.getByRole('button', { name: /Right side → lungs/ }).click();
    await expect(page.locator('.circulation-route-state')).toContainText('Send to lungs');
    await expect(page.locator('.circulation-route-state')).toContainText('oxygen-poor blood');
  });
});

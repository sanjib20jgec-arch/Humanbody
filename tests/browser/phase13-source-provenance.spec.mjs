import { test, expect } from '@playwright/test';

const modules = ['Cell Structure', 'Tissues', 'Heredity'];

test.describe('Phase 13 conceptual source provenance', () => {
  test('shows reviewed conceptual sources without implying approved 3D assets', async ({ page }) => {
    for (const moduleLabel of modules) {
      await page.goto('/');
      await expect(page.locator('[data-hbl-app="true"]')).toBeVisible();
      await expect(page.getByText('Choose a system to enter the lab')).toBeVisible();
      await page.locator('.module-list-item').filter({ hasText: moduleLabel }).click();
      const note = page.locator('.conceptual-source-note');
      await expect(note).toBeVisible();
      await expect(note).toContainText('REVIEWED CONCEPTUAL SOURCE');
      await expect(note).toContainText('No reviewed 3D source approved');
      await expect(note.locator('a')).toHaveAttribute('href', /openstax\.org/);
    }
  });
});

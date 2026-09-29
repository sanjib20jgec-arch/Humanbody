import { test, expect } from '@playwright/test';

const openHome = async (page) => {
  await page.goto('/');
  await expect(page.locator('[data-hbl-app="true"]')).toBeVisible();
  await expect(page.getByText('Choose a system to enter the lab')).toBeVisible();
};

test.describe('Guided path contracts', () => {
  test('shows an explicit recommendation and accessible current step', async ({ page }) => {
    await openHome(page);
    await expect(page.locator('.up-next-card')).toContainText('Cell Structure');
    await expect(page.locator('.up-next-card')).toContainText('STEP 01 / 10');
    const currentSteps = page.locator('.guided-path-steps button[aria-current="step"]');
    await expect(currentSteps).toHaveCount(1);
    await expect(currentSteps).toHaveAttribute('aria-label', /current step/);
  });

  test('uses previous and next guided navigation inside a bay', async ({ page }) => {
    await openHome(page);
    await page.getByRole('button', { name: /Start bay|Continue with Cell/ }).first().click();
    await expect(page.locator('.module-hero h1')).toHaveText('Cell Structure');
    await expect(page.locator('.module-path-nav')).toContainText('STEP 01 / 10');
    await expect(page.locator('.guided-step-card')).toContainText('Learning target:');
    await expect(page.locator('.guided-step-card')).toContainText('Identify the nucleus');
    const stepCard = page.locator('.guided-step-card');
    await stepCard.getByRole('button', { name: /Open Quiz mode/ }).click();
    await expect(stepCard).toContainText('Quiz mode');
    await expect(stepCard).toContainText('Return to explore');
    await stepCard.getByRole('button', { name: /Return to Explore mode/ }).click();
    await expect(stepCard).toContainText('Explore mode');
    await expect(stepCard).toContainText('Check understanding');
    await expect(page.getByRole('button', { name: /Next step: Tissues/ })).toBeVisible();
    await page.getByRole('button', { name: /Next step: Tissues/ }).click();
    await expect(page.locator('.module-hero h1')).toHaveText('Tissues');
    await expect(page.locator('.module-path-nav')).toContainText('STEP 02 / 10');
    await expect(page.getByRole('button', { name: /Previous step: Cell Structure/ })).toBeVisible();
  });

  test('keeps the path readable on phone layout', async ({ page }) => {
    await openHome(page);
    await expect(page.locator('.guided-path-steps button')).toHaveCount(10);
    await expect(page.locator('.up-next-card .primary-cta')).toBeVisible();
  });
});

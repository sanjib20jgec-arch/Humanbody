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
    await expect(page.locator('.up-next-card')).toContainText('STEP 01 / 12');
    const currentSteps = page.locator('.guided-path-steps button[aria-current="step"]');
    await expect(currentSteps).toHaveCount(1);
    await expect(currentSteps).toHaveAttribute('aria-label', /current step/);
  });

  test('consolidates previous and next navigation into the learning step card', async ({ page }) => {
    await openHome(page);
    await page.getByRole('button', { name: /Start bay|Continue with Cell/ }).first().click();
    await expect(page.locator('.module-hero h1')).toHaveText('Cell Structure');
    const stepCard = page.locator('.guided-step-card');
    await expect(stepCard).toContainText('STEP 01 / 12');
    await expect(stepCard).toContainText('Learning target:');
    await expect(stepCard).toContainText('Identify the nucleus');
    await expect(stepCard.getByRole('button', { name: /Previous step:/ })).toHaveCount(0);
    await expect(page.getByRole('button', { name: /Next step: Tissues/ })).toBeVisible();
    await expect(stepCard.locator('.guided-step-dots')).toHaveCount(0);

    const objectives = page.locator('.objective-disclosure');
    await expect(objectives).not.toHaveAttribute('open', '');
    const coursePath = page.locator('.guided-path.compact');
    await expect(coursePath).not.toHaveAttribute('open', '');
    await coursePath.locator('summary').click();
    await expect(coursePath).toHaveAttribute('open', '');
    await expect(coursePath.locator('.guided-path-steps button')).toHaveCount(12);
    await coursePath.locator('summary').click();

    await stepCard.getByRole('button', { name: /Open Quiz mode/ }).click();
    await expect(stepCard).toContainText('Quiz mode');
    await expect(stepCard).toContainText('Return to explore');
    await stepCard.getByRole('button', { name: /Return to Explore mode/ }).click();
    await expect(stepCard).toContainText('Explore mode');
    await expect(stepCard).toContainText('Check understanding');

    await page.getByRole('button', { name: /Next step: Tissues/ }).click();
    await expect(page.locator('.module-hero h1')).toHaveText('Tissues');
    await expect(page.locator('.guided-step-card')).toContainText('STEP 02 / 12');
    const previous = page.getByRole('button', { name: /Previous step: Cell Structure/ });
    await expect(previous).toBeVisible();
    await previous.click();
    await expect(page.locator('.module-hero h1')).toHaveText('Cell Structure');
  });

  test('keeps the full Home path available on phones', async ({ page }) => {
    await openHome(page);
    await expect(page.locator('.guided-path-steps button')).toHaveCount(12);
    await expect(page.locator('.up-next-card .primary-cta')).toBeVisible();
  });
});

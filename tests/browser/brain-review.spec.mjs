import { test, expect } from '@playwright/test';

const openBrainBay = async (page) => {
  await page.goto('/');
  await expect(page.locator('[data-hbl-app="true"]')).toBeVisible();
  await expect(page.getByText('Choose a system to enter the lab')).toBeVisible();
  await page.locator('.module-list-item').filter({ hasText: 'Brain & Nerves' }).click();
  await expect(page.getByRole('heading', { name: 'Map the signal network' })).toBeVisible();
};

const attachReviewFrame = async (page, testInfo, name) => {
  await testInfo.attach(name, {
    body: await page.screenshot({ fullPage: false, animations: 'disabled', timeout: 10000 }),
    contentType: 'image/png'
  });
};

test.describe('Brain & Nerves visual review frames', () => {
  test('captures Explore, reflex, and quiz review states', async ({ page }, testInfo) => {
    await openBrainBay(page);
    await attachReviewFrame(page, testInfo, 'brain-explore.png');

    await page.getByRole('button', { name: 'Select peripheral nerves' }).click();
    await expect(page.getByRole('heading', { name: 'Peripheral nerves' })).toBeVisible();
    await attachReviewFrame(page, testInfo, 'brain-peripheral-selected.png');

    await page.getByRole('button', { name: 'SIMULATE' }).click();
    await expect(page.getByRole('heading', { name: 'From hot surface to muscle' })).toBeVisible();
    await attachReviewFrame(page, testInfo, 'brain-reflex-ready.png');

    await page.getByRole('button', { name: /Touch hot surface/ }).click();
    await expect(page.locator('.reflex-callout')).toContainText('Stimulus');
    await attachReviewFrame(page, testInfo, 'brain-reflex-stimulus.png');

    await page.getByRole('button', { name: 'QUIZ', exact: true }).click();
    await expect(page.getByRole('heading', { name: 'Brain & nerves checkpoint' })).toBeVisible();
    await page.getByRole('button', { name: 'Cerebellum', exact: true }).click();
    await expect(page.locator('.quiz-feedback')).toContainText('Not quite.');
    await attachReviewFrame(page, testInfo, 'brain-quiz-feedback.png');
  });

  test('captures the reduced-motion reflex frame without active playback', async ({ page }, testInfo) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await openBrainBay(page);
    await page.getByRole('button', { name: 'SIMULATE' }).click();
    await page.getByRole('button', { name: /Touch hot surface/ }).click();
    await expect(page.locator('.reflex-callout')).toContainText('Stimulus');
    await expect(page.getByRole('button', { name: 'Play' })).toBeVisible();
    await attachReviewFrame(page, testInfo, 'brain-reflex-reduced-motion.png');
  });
});

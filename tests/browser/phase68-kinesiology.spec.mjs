import { test, expect } from '@playwright/test';

test.describe('Phase 68-70 Kinesiology Theater', () => {
  test('renders the performance rig with disclosures, actions, cameras, and checkpoint', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('[data-hbl-app="true"]')).toBeVisible();
    await page.locator('.module-list-item', { hasText: 'Movement Theater' }).click();
    const theater = page.locator('[data-kinesiology-theater="true"]');
    await expect(theater).toBeVisible();
    await page.waitForSelector('.kine-stage canvas', { timeout: 20000 });

    // Doctrine: disclosures visible, never implying the certified source.
    await expect(theater.locator('.kine-disclosure')).toContainText('not the certified BodyParts3D reference');

    // Default action is CMU-retargeted walk with attribution.
    await expect(theater.locator('.kine-source-badge')).toContainText('CMU');

    // Every user-listed action exists.
    for (const id of ['walk', 'run', 'jump', 'wave', 'handshake', 'chew', 'talk']) {
      await expect(theater.locator(`.kine-actions button`, { hasText: id }).first()).toBeVisible();
    }

    // Authored actions carry the honest badge.
    await theater.locator('.kine-actions button', { hasText: 'wave' }).first().click();
    await expect(theater.locator('.kine-source-badge')).toContainText('not motion capture');

    // Camera presets respond to clicks and keyboard.
    await theater.locator('.kine-cameras button', { hasText: 'Posterior' }).click();
    await expect(theater.locator('.kine-cameras button', { hasText: 'Posterior' })).toHaveClass(/active/);
    await page.keyboard.press('3');
    await expect(theater.locator('.kine-cameras button', { hasText: 'Left lateral' })).toHaveClass(/active/);

    // Simulate view exposes shared simulation controls.
    await page.locator('.view-switcher button', { hasText: 'SIMULATE' }).click();
    await expect(page.locator('[aria-label="Movement theater controls"]')).toBeVisible();
    await page.locator('.view-switcher button', { hasText: 'EXPLORE' }).click();

    // Muscle legend shows role chips and meters.
    await expect(theater.locator('.kine-legend li').first()).toBeVisible();
    await expect(theater.locator('.kine-legend .role-PM').first()).toBeVisible();

    // Shared quiz flow clears the checkpoint with correct answers.
    await page.locator('.view-switcher button', { hasText: 'QUIZ' }).click();
    for (let i = 0; i < 3; i++) {
      await page.locator('.answer-choice').nth(0).click();
      await page.locator('.next-question').click();
    }
    await expect(page.locator('.quiz-finished')).toContainText('CHECKPOINT CLEARED');
  });
});
